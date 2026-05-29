/** Stage 3 — RESEARCH. Intelligence + competitor signal → VisualPlaybook
 * (references, design tokens, reusable visual grammar). */
import type { Adapters } from "../adapters/interfaces.js";
import { buildResearchPrompt } from "../prompts/research.js";
import {
  type BrandIntelligence,
  type CompanyFootprint,
  type VisualPlaybook,
  VisualPlaybookSchema,
  type VisualReference,
} from "../types.js";
import { log } from "../util/logger.js";

export async function research(
  intel: BrandIntelligence,
  fp: CompanyFootprint,
  a: Adapters,
): Promise<VisualPlaybook> {
  log.step("RESEARCH — global references + local competitors (visual)");

  let collected: VisualReference[] = [];
  if (a.visualSearch) {
    const niche = `${intel.category} ${intel.icps[0]?.label ?? ""}`.trim();
    const [global, local] = await Promise.all([
      a.visualSearch
        .findReferences(`${niche} best carousel design`, {
          scope: "global",
          limit: 5,
        })
        .catch(() => []),
      a.visualSearch
        .findReferences(
          `${niche} ${fp.brand.competitors.join(" ")}`.trim(),
          { scope: "local-competitor", limit: 5 },
        )
        .catch(() => []),
    ]);
    collected = [...global, ...local];
    log.info(`→ ${collected.length} references from visual search`);
  }

  const { system, prompt } = buildResearchPrompt(
    intel,
    fp,
    collected,
    fp.brand.locale,
  );
  const playbook = await a.llm.completeJSON({
    system,
    prompt,
    schema: VisualPlaybookSchema,
    schemaName: "VisualPlaybook",
    maxTokens: 3000,
    cachePrefix: system,
  });
  log.info(
    `→ ${playbook.references.length} references, accent ${playbook.designTokens.palette.accent}, ${playbook.designTokens.fonts.display}/${playbook.designTokens.fonts.body}`,
  );
  return playbook;
}
