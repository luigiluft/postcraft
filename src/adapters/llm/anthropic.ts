/**
 * Anthropic LLM adapter. Uses prompt caching on the static system prefix and
 * does schema-validated JSON with one corrective retry. Default model is
 * cost-sensible (Sonnet); override with ANTHROPIC_MODEL.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { log } from "../../util/logger.js";
import type {
  LLMAdapter,
  LLMCompleteOpts,
  LLMJSONOpts,
} from "../interfaces.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export class AnthropicLLM implements LLMAdapter {
  readonly name = "anthropic-llm";
  private client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  });

  private async raw(opts: LLMCompleteOpts): Promise<string> {
    const system = opts.system
      ? [
          {
            type: "text" as const,
            text: opts.system,
            cache_control: { type: "ephemeral" as const },
          },
        ]
      : undefined;
    const msg = await this.client.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 2000,
      temperature: opts.temperature ?? 0.7,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: opts.prompt }],
    });
    return msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }

  async complete(opts: LLMCompleteOpts): Promise<string> {
    return this.raw(opts);
  }

  async completeJSON<S extends z.ZodTypeAny>(
    opts: LLMJSONOpts<S>,
  ): Promise<z.infer<S>> {
    let lastErr = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt =
        attempt === 0
          ? opts.prompt
          : `${opts.prompt}\n\nYour previous output failed validation: ${lastErr}\nReturn ONLY valid JSON matching the schema.`;
      const text = await this.raw({ ...opts, prompt });
      const parsed = tryExtractJSON(text);
      if (parsed === undefined) {
        lastErr = "no JSON found in output";
        continue;
      }
      const res = opts.schema.safeParse(parsed);
      if (res.success) return res.data;
      lastErr = res.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      log.debug(`JSON validation failed (attempt ${attempt + 1}): ${lastErr}`);
    }
    throw new Error(
      `AnthropicLLM.completeJSON failed schema "${opts.schemaName}": ${lastErr}`,
    );
  }
}

/** Extract a JSON value from model text (handles code fences + prose). */
function tryExtractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.search(/[[{]/);
  if (start < 0) return undefined;
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(close);
  if (end <= start) return undefined;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return undefined;
  }
}
