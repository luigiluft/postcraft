/**
 * RESEARCH prompt — builds the VisualPlaybook: global best-in-class references
 * + local competitors, distilled into a reusable visual grammar and design
 * tokens that art-direct generation. This is differentiation wedge #3
 * (competitor/reference visual research fused INTO generation).
 *
 * Two inputs feed it:
 *  - harvested competitor social posts (real, from the SocialAdapter), and/or
 *  - references surfaced by a VisualSearchAdapter,
 * plus the LLM's knowledge of global best-in-class visual content in the niche.
 */
import type {
  BrandIntelligence,
  CompanyFootprint,
  Locale,
  VisualReference,
} from "../types.js";

export const RESEARCH_SYSTEM = `You are an art director who reverse-engineers what makes visual social content (especially Instagram/LinkedIn CAROUSELS) stop the scroll and earn saves/shares in a specific niche.

Rules:
1. Separate GLOBAL best-in-class references (world-class brands/creators, any geography) from LOCAL competitors (direct rivals in the brand's market).
2. Distill, don't describe. Turn examples into reusable RULES: carousel anatomy (what each slide position does), hook patterns, color patterns, type patterns, layout grammar.
3. Design tokens must be CONCRETE and grounded in the brand kit when one exists (use the brand's real hex colors). If the brand kit is empty, propose an intentional palette+type pairing that fits the category — never default to generic "clean minimal".
4. Anti-template: explicitly list what to AVOID (the generic look competitors fall into) in dontList.
5. Every reference needs a "why" — the specific craft lesson, not "looks nice".`;

function digestCompetitors(fp: CompanyFootprint): string {
  const comp = fp.social.filter((s) =>
    fp.brand.competitors.some((c) =>
      s.handle.toLowerCase().includes(c.toLowerCase().replace(/^@/, "")),
    ),
  );
  const pool = comp.length ? comp : fp.social;
  if (!pool.length) return "(no competitor social data harvested)";
  return pool
    .slice(0, 6)
    .map((s) => {
      const posts = s.posts
        .slice(0, 5)
        .map(
          (p) =>
            `    · [${p.mediaType}] "${p.caption.slice(0, 120)}"${
              p.likes != null ? ` (${p.likes} likes)` : ""
            }`,
        )
        .join("\n");
      return `  @${s.handle} (${s.platform}): themes ${s.topThemes.join(
        ", ",
      )}\n${posts}`;
    })
    .join("\n");
}

export function buildResearchPrompt(
  intel: BrandIntelligence,
  fp: CompanyFootprint,
  collected: VisualReference[],
  locale: Locale,
): { system: string; prompt: string } {
  const brandColors = fp.brandKit.colors.join(", ") || "(none detected)";
  const collectedBlock = collected.length
    ? `\nPRE-COLLECTED REFERENCES (from visual search — incorporate and enrich):\n${collected
        .map(
          (r) =>
            `- [${r.scope}] ${r.source}${r.url ? ` ${r.url}` : ""} — ${r.why}`,
        )
        .join("\n")}`
    : "";

  const prompt = `Output language for prose fields: ${locale}.

BRAND CONTEXT
- Category: ${intel.category}
- Positioning: ${intel.positioning}
- Primary ICP: ${intel.icps[0]?.label} — cravings: ${intel.icps[0]?.contentCravings.join(", ")}
- Brand colors: ${brandColors}
- Brand fonts: ${fp.brandKit.fonts.join(", ") || "(none detected)"}
- Visual language so far: ${fp.brandKit.visualLanguage || "(undefined)"}

COMPETITOR / OWNED SOCIAL SIGNAL
${digestCompetitors(fp)}
${collectedBlock}

Produce a VisualPlaybook:
- references[]: 4-8 entries, each tagged scope "global" or "local-competitor", with handle/url when known, a sharp "why" (the craft lesson), anatomy[] if it's a carousel, and takeaways[].
- carouselAnatomy[]: position-by-position rules (e.g. "slide 1 cover: oversized type + 1 concept image; slides 2-5: one idea each; slide 6: single CTA").
- hookPatterns[], colorPatterns[], typePatterns[], layoutGrammar[]: reusable rules an image generator + renderer can follow.
- designTokens: palette {bg, ink, accent, muted, surface?} using the brand's real hex where available; fonts {display, body}; radius; mood[].
- doList[] / dontList[]: the craft to chase and the generic template look to avoid.

Return ONLY the JSON object.`;
  return { system: RESEARCH_SYSTEM, prompt };
}
