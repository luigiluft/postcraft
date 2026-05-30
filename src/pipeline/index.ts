/**
 * Pipeline orchestrator — one company → a run of ready-to-post content kits.
 *
 *   HARVEST → UNDERSTAND → RESEARCH → GENERATE (concepts → carousels) → RENDER
 */
import fs from "node:fs";
import path from "node:path";
import type { Adapters } from "../adapters/interfaces.js";
import {
  type BrandInput,
  type ContentKit,
  type RunResult,
  RunResultSchema,
} from "../types.js";
import { downloadImage, ensurePng } from "../util/download.js";
import { nowISO, slugify, stamp } from "../util/ids.js";
import { log } from "../util/logger.js";
import { generateCarousel, generateConcepts } from "./generate.js";
import { harvest } from "./harvest.js";
import { renderKit } from "./render.js";
import { research } from "./research.js";
import { understand } from "./understand.js";

export interface RunOptions {
  /** How many concepts to ideate. */
  concepts?: number;
  /** How many of the top concepts to render into full kits. */
  kits?: number;
  /** Base output directory (a timestamped subdir is created inside). */
  outDir?: string;
  /** Override the brand logo (local path or URL) overlaid on every slide.
   * When absent, the harvested brandKit.logoUrl is used automatically. */
  logo?: string;
}

export async function run(
  brand: BrandInput,
  adapters: Adapters,
  opts: RunOptions = {},
): Promise<RunResult> {
  const startedAt = nowISO();
  const conceptCount = opts.concepts ?? 6;
  const kitCount = opts.kits ?? 2;
  const base = opts.outDir ?? process.env.POSTCRAFT_OUT_DIR ?? "runs";
  const runDir = path.join(base, `${slugify(brand.name)}_${stamp()}`);
  fs.mkdirSync(runDir, { recursive: true });

  log.step(`POSTCRAFT RUN — ${brand.name}  →  ${runDir}`);

  const footprint = await harvest(brand, adapters);
  const logoPath = await resolveLogo(
    opts.logo ?? footprint.brandKit.logoUrl,
    runDir,
  );
  if (logoPath) log.info(`brand logo → ${logoPath}`);
  const intelligence = await understand(footprint, adapters);
  const playbook = await research(intelligence, footprint, adapters);
  const concepts = await generateConcepts(
    intelligence,
    playbook,
    conceptCount,
    brand.locale,
    adapters,
  );

  const chosen = concepts.slice(0, kitCount);
  const kits: ContentKit[] = [];
  for (const concept of chosen) {
    const spec = await generateCarousel(
      concept,
      intelligence,
      playbook,
      brand.locale,
      adapters,
    );
    const kit = await renderKit(spec, concept, brand, adapters, {
      outDir: runDir,
      logoPath,
    });
    kits.push(kit);
  }

  const result = RunResultSchema.parse({
    brand,
    footprint,
    intelligence,
    playbook,
    concepts,
    kits,
    startedAt,
    finishedAt: nowISO(),
  });
  fs.writeFileSync(
    path.join(runDir, "run.json"),
    JSON.stringify(result, null, 2),
  );
  log.step(`DONE — ${kits.length} content kit(s) · ${concepts.length} concepts · ${runDir}`);
  return result;
}

/** Resolve a brand logo to a local PNG: download if a URL, rasterize if SVG. */
async function resolveLogo(
  src: string | undefined,
  runDir: string,
): Promise<string | undefined> {
  if (!src) return undefined;
  let p: string | undefined;
  if (/^https?:\/\//.test(src)) {
    p = await downloadImage(src, runDir, "brand-logo");
  } else if (fs.existsSync(src)) {
    p = src;
  }
  return p ? ensurePng(p) : undefined;
}
