/** Stage 5 — RENDER. Carousel spec → per-slide images (AI texture) + composed
 * legible PNG slides (deterministic text) + caption sidecars → ContentKit. */
import fs from "node:fs";
import path from "node:path";
import type { Adapters } from "../adapters/interfaces.js";
import {
  type BrandInput,
  type CarouselSpec,
  type ContentKit,
  ContentKitSchema,
  type PostConcept,
} from "../types.js";
import { nowISO, slugify } from "../util/ids.js";
import { log } from "../util/logger.js";

export async function renderKit(
  spec: CarouselSpec,
  concept: PostConcept,
  brand: BrandInput,
  a: Adapters,
  opts: { outDir: string },
): Promise<ContentKit> {
  log.step(`RENDER — ${spec.title || concept.id}`);
  const kitDir = path.join(opts.outDir, slugify(concept.id) || "kit");
  const assetsDir = path.join(kitDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  // 1. AI background per slide (texture only — no text). Convention the
  //    renderer reads: assets/bg-<n>.png
  for (const slide of spec.slides) {
    if (!slide.image) continue;
    const out = path.join(assetsDir, `bg-${slide.n}.png`);
    await a.imagegen
      .generate(slide.image, out)
      .catch((e) => log.warn(`image slide ${slide.n} failed:`, String(e)));
  }

  // 2. Deterministic composition → legible 1080×1350 slides
  const slides = await a.renderer.renderCarousel(spec, {
    assetsDir,
    outDir: kitDir,
    brandName: brand.name,
  });

  // 3. Sidecars for handoff/scheduling
  fs.writeFileSync(
    path.join(kitDir, "spec.json"),
    JSON.stringify(spec, null, 2),
  );
  fs.writeFileSync(
    path.join(kitDir, "caption.txt"),
    `— INSTAGRAM —\n${spec.caption.instagram}\n\n— LINKEDIN —\n${spec.caption.linkedin}\n\n${spec.hashtags.join(" ")}\n`,
  );

  const kit = ContentKitSchema.parse({
    brand,
    concept,
    spec,
    slides,
    caption: spec.caption,
    rationale: concept.hypothesis,
    generatedAt: nowISO(),
  });
  log.info(`→ ${slides.length} slides rendered in ${kitDir}`);
  return kit;
}
