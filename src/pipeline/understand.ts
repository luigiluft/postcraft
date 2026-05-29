/** Stage 2 — UNDERSTAND. Footprint → BrandIntelligence (positioning, voice,
 * ICPs, pillars, proof assets). */
import type { Adapters } from "../adapters/interfaces.js";
import { buildUnderstandPrompt } from "../prompts/understand.js";
import {
  type BrandIntelligence,
  BrandIntelligenceSchema,
  type CompanyFootprint,
} from "../types.js";
import { log } from "../util/logger.js";

export async function understand(
  fp: CompanyFootprint,
  a: Adapters,
): Promise<BrandIntelligence> {
  log.step("UNDERSTAND — positioning, ICP, pillars, proof");
  const { system, prompt } = buildUnderstandPrompt(fp, fp.brand);
  const intel = await a.llm.completeJSON({
    system,
    prompt,
    schema: BrandIntelligenceSchema,
    schemaName: "BrandIntelligence",
    maxTokens: 4000,
    cachePrefix: system,
  });
  log.info(
    `→ ${intel.icps.length} ICP(s), ${intel.pillars.length} pillars, ${intel.proofAssets.length} proof assets (confidence ${intel.confidence})`,
  );
  return intel;
}
