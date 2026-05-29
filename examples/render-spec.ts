/**
 * Render a hand-authored / edited CarouselSpec without running the full
 * pipeline. Useful for: live-data runs where the LLM stages happen elsewhere,
 * fast re-renders after editing copy, and demos.
 *
 *   tsx examples/render-spec.ts <spec.json> [brandName] [outDir]
 *
 * Backgrounds: live imagegen if FAL_KEY/IDEOGRAM_API_KEY is set, else the
 * deterministic gradient fixture.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { FixtureImageGen } from "../src/adapters/fixtures/index.js";
import type { ImageGenAdapter } from "../src/adapters/interfaces.js";
import { SatoriRenderer } from "../src/adapters/renderer/satori.js";
import { CarouselSpecSchema } from "../src/types.js";

const specPath = process.argv[2];
const brandName = process.argv[3] ?? "Brand";
const outDir = process.argv[4] ?? "runs/spec";
const logoPath = process.argv[5];

if (!specPath) {
  console.error("usage: tsx examples/render-spec.ts <spec.json> [brandName] [outDir] [logo.png]");
  process.exit(1);
}

const spec = CarouselSpecSchema.parse(JSON.parse(fs.readFileSync(specPath, "utf8")));
const assetsDir = path.join(outDir, "assets");
fs.mkdirSync(assetsDir, { recursive: true });

async function pickImageGen(): Promise<ImageGenAdapter> {
  if (process.env.FAL_KEY) return new (await import("../src/adapters/imagegen/fal.js")).FalImageGen();
  if (process.env.IDEOGRAM_API_KEY) return new (await import("../src/adapters/imagegen/ideogram.js")).IdeogramImageGen();
  return new FixtureImageGen();
}

const imagegen = await pickImageGen();
for (const s of spec.slides) {
  if (!s.image) continue;
  const bgFile = path.join(assetsDir, `bg-${s.n}.png`);
  if (fs.existsSync(bgFile)) {
    console.log(`bg ${s.n}: reusing existing ${path.basename(bgFile)}`);
    continue; // pre-supplied background (e.g. Higgsfield/fal) — don't overwrite
  }
  await imagegen
    .generate(s.image, bgFile)
    .catch((e) => console.error(`bg ${s.n} failed:`, String(e)));
}

const slides = await new SatoriRenderer().renderCarousel(spec, {
  assetsDir,
  outDir,
  brandName,
  logoPath,
});

fs.writeFileSync(path.join(outDir, "spec.json"), JSON.stringify(spec, null, 2));
fs.writeFileSync(
  path.join(outDir, "caption.txt"),
  `— INSTAGRAM —\n${spec.caption.instagram}\n\n— LINKEDIN —\n${spec.caption.linkedin}\n\n${spec.hashtags.join(" ")}\n`,
);

console.log(`✅ ${slides.length} slides (${imagegen.name}) → ${outDir}`);
for (const s of slides) console.log("  " + s.pngPath);
