/**
 * fal.ai image generation adapter. Single aggregator for FLUX (texture/photo)
 * and others. Text-free backgrounds only — copy is rendered deterministically.
 * Override the model via FAL_MODEL (default fal-ai/flux/dev).
 */
import fs from "node:fs";
import { type ImageBrief } from "../../types.js";
import type { ImageGenAdapter } from "../interfaces.js";

const MODEL = process.env.FAL_MODEL || "fal-ai/flux/dev";

export class FalImageGen implements ImageGenAdapter {
  readonly name = "fal-imagegen";
  private key = process.env.FAL_KEY ?? "";

  async generate(brief: ImageBrief, outPath: string): Promise<{ path: string }> {
    const { width, height } = dims(brief.aspectRatio);
    const prompt = [brief.prompt, brief.style, "no text, no letters"]
      .filter(Boolean)
      .join(", ");
    const res = await fetch(`https://fal.run/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: { width, height },
        num_images: 1,
        enable_safety_checker: true,
      }),
    });
    if (!res.ok) throw new Error(`fal ${MODEL} ${res.status}`);
    const j: any = await res.json();
    const url = j.images?.[0]?.url ?? j.image?.url;
    if (!url) throw new Error("fal returned no image url");
    const img = await fetch(url);
    fs.writeFileSync(outPath, Buffer.from(await img.arrayBuffer()));
    return { path: outPath };
  }
}

function dims(aspect: string): { width: number; height: number } {
  switch (aspect) {
    case "1:1":
      return { width: 1080, height: 1080 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "4:5":
    default:
      return { width: 1080, height: 1350 };
  }
}
