/**
 * Ideogram image generation adapter. Best-in-class for short text-in-image, so
 * useful when a hero needs a small legible word baked in. For pure backgrounds
 * fal/FLUX is cheaper. Verify endpoint/model against current Ideogram docs.
 */
import fs from "node:fs";
import { type ImageBrief } from "../../types.js";
import type { ImageGenAdapter } from "../interfaces.js";

const ASPECT: Record<string, string> = {
  "1:1": "ASPECT_1_1",
  "4:5": "ASPECT_4_5",
  "9:16": "ASPECT_9_16",
};

export class IdeogramImageGen implements ImageGenAdapter {
  readonly name = "ideogram-imagegen";
  private key = process.env.IDEOGRAM_API_KEY ?? "";

  async generate(brief: ImageBrief, outPath: string): Promise<{ path: string }> {
    const res = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: { "Api-Key": this.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        image_request: {
          prompt: [brief.prompt, brief.style].filter(Boolean).join(", "),
          aspect_ratio: ASPECT[brief.aspectRatio] ?? "ASPECT_4_5",
          model: process.env.IDEOGRAM_MODEL || "V_2",
          magic_prompt_option: "AUTO",
          negative_prompt: brief.negativePrompt || undefined,
        },
      }),
    });
    if (!res.ok) throw new Error(`ideogram ${res.status}`);
    const j: any = await res.json();
    const url = j.data?.[0]?.url;
    if (!url) throw new Error("ideogram returned no image url");
    const img = await fetch(url);
    fs.writeFileSync(outPath, Buffer.from(await img.arrayBuffer()));
    return { path: outPath };
  }
}
