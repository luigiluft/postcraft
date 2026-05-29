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
