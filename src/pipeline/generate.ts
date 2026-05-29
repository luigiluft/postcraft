/** Stage 4 — GENERATE. Intelligence + playbook → post concepts → carousel
 * specs (with per-slide image briefs). */
import { z } from "zod";
import type { Adapters } from "../adapters/interfaces.js";
import { missingSlots } from "../carousel/grammar.js";
import {
  buildCarouselPrompt,
  buildConceptsPrompt,
} from "../prompts/generate.js";
import {
  type BrandIntelligence,
  type CarouselSpec,
  CarouselSpecSchema,
  type Locale,
  type PostConcept,
  PostConceptSchema,
  type VisualPlaybook,
} from "../types.js";
import { log } from "../util/logger.js";

export async function generateConcepts(
  intel: BrandIntelligence,
  playbook: VisualPlaybook,
  count: number,
  locale: Locale,
  a: Adapters,
): Promise<PostConcept[]> {
  log.step(`GENERATE — ${count} post concepts`);
  const { system, prompt } = buildConceptsPrompt(intel, playbook, count, locale);
  const concepts = await a.llm.completeJSON({
    system,
    prompt,
    schema: z.array(PostConceptSchema),
    schemaName: "PostConcepts",
    maxTokens: 3000,
    cachePrefix: system,
  });
  log.info(
    `→ ${concepts.length} concepts: ${concepts
      .map((c) => `"${c.hook.slice(0, 40)}"`)
      .join(" · ")}`,
  );
  return concepts;
}

export async function generateCarousel(
  concept: PostConcept,
  intel: BrandIntelligence,
  playbook: VisualPlaybook,
  locale: Locale,
  a: Adapters,
): Promise<CarouselSpec> {
  log.step(`GENERATE carousel — ${concept.id}`);
  const { system, prompt } = buildCarouselPrompt(
    concept,
    intel,
    playbook,
    locale,
  );
  const spec = await a.llm.completeJSON({
    system,
    prompt,
    schema: CarouselSpecSchema,
    schemaName: "CarouselSpec",
    maxTokens: 4000,
  });

  // Validate slides against the grammar; warn on missing required slots.
  for (const slide of spec.slides) {
    const missing = missingSlots(slide.archetype, slide.fields);
    if (missing.length) {
      log.warn(
        `slide ${slide.n} (${slide.archetype}) missing slots: ${missing.join(", ")}`,
      );
    }
  }
  log.info(
    `→ ${spec.slides.length} slides: ${spec.slides
      .map((s) => s.archetype)
      .join(" → ")}`,
  );
  return spec;
}
