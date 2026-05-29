/**
 * UNDERSTAND prompt — turns a raw company footprint into actionable
 * BrandIntelligence: positioning, voice, ICP(s), content pillars, proof assets.
 *
 * Encodes the hard-won rules from agrega-content-engine, generalized:
 *  - ICP "verbatim terms": the exact phrases the buyer types/searches.
 *  - Proof provenance classes — never fabricate a number; classify every claim.
 *  - The inform/entertain/prove value axis attached to each pillar.
 */
import type { BrandInput, CompanyFootprint, Locale } from "../types.js";

const LOCALE_NOTE: Record<Locale, string> = {
  "pt-BR": "Write all output in Brazilian Portuguese (pt-BR).",
  "en-US": "Write all output in English (en-US).",
  "es-ES": "Write all output in Spanish (es-ES).",
};

export const UNDERSTAND_SYSTEM = `You are a senior B2B brand & content strategist. You reverse-engineer a company's positioning and its buyer from public evidence, then define what content that buyer actually wants to consume.

Non-negotiable rules:
1. GROUND EVERYTHING in the provided footprint. If evidence is thin, lower "confidence" and say so in rationale — never invent facts about the company.
2. PROOF PROVENANCE: every numeric/named/dated claim you surface as a proofAsset MUST be classified:
   - "public-verifiable" → you can point to a source URL/date in the footprint.
   - "internal-anonymized" → an aggregate the company could legitimately own (e.g. "30+ operations"), no public URL.
   - "fictional" → illustrative only; flag it. NEVER present a fictional number as real.
   When unsure, downgrade. A wrong "real" number is the worst failure mode.
3. ICP VERBATIM TERMS: capture the literal phrases the buyer uses (what they type into Google/AI), not marketing paraphrases. These drive hooks and SEO.
4. CONTENT CRAVINGS ≠ company features. Describe what the buyer wants to SEE/READ in a feed (tensions, answers, status signals), not what the company sells.
5. Each content pillar carries a value axis (inform / entertain / prove). Prefer pillars that can do all three.
6. Voice: derive a concrete, reusable voice profile (persona, tone, do/don't, example phrases) from how the company already writes. If it has no voice yet, design one that fits the category and ICP.`;

function digestFootprint(fp: CompanyFootprint): string {
  const pages = fp.site.pages
    .slice(0, 8)
    .map(
      (p) =>
        `### [${p.kind}] ${p.title || p.url}\n${p.markdown.slice(0, 1200)}`,
    )
    .join("\n\n");
  const news = fp.news
    .slice(0, 8)
    .map((n) => `- ${n.title}${n.date ? ` (${n.date})` : ""} — ${n.snippet}`)
    .join("\n");
  const social = fp.social
    .map((s) => {
      const posts = s.posts
        .slice(0, 6)
        .map(
          (p) =>
            `  · [${p.mediaType}] ${p.caption.slice(0, 160)}${
              p.likes != null ? ` (${p.likes} likes)` : ""
            }`,
        )
        .join("\n");
      return `@${s.handle} on ${s.platform}${
        s.followers ? ` — ${s.followers} followers` : ""
      }\n  bio: ${s.bio}\n  top themes: ${s.topThemes.join(", ")}\n${posts}`;
    })
    .join("\n\n");
  const brand =
    `colors: ${fp.brandKit.colors.join(", ") || "?"}\n` +
    `fonts: ${fp.brandKit.fonts.join(", ") || "?"}\n` +
    `visual language: ${fp.brandKit.visualLanguage || "?"}`;
  return [
    `# COMPANY: ${fp.brand.name}`,
    fp.brand.domain ? `Domain: ${fp.brand.domain}` : "",
    fp.brand.notes ? `Operator notes: ${fp.brand.notes}` : "",
    fp.brand.goals.length ? `Goals: ${fp.brand.goals.join("; ")}` : "",
    `\n## SITE\nSummary: ${fp.site.summary}\nProducts: ${fp.site.products.join(
      ", ",
    )}\nValue props: ${fp.site.valueProps.join(" | ")}\n\n${pages}`,
    news ? `\n## RECENT NEWS\n${news}` : "",
    social ? `\n## SOCIAL\n${social}` : "",
    `\n## BRAND KIT\n${brand}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUnderstandPrompt(
  fp: CompanyFootprint,
  brand: BrandInput,
): { system: string; prompt: string } {
  const locale = brand.locale;
  const prompt = `${LOCALE_NOTE[locale]}

Below is everything we harvested about the company. Produce a BrandIntelligence object that a content engine will use to generate ICP-targeted posts.

${digestFootprint(fp)}

Deliver:
- positioning: one sharp sentence (what they uniquely are/do).
- category + 3-6 differentiators.
- voice: persona, tone[], doList[], dontList[], examplePhrases[] (in ${locale}), forbidden[].
- icps: 1-3 distinct ideal customer profiles. For each, fill jobsToBeDone, pains, desires, triggers, contentCravings, objections, buyingStage, and verbatimTerms (exact buyer phrasing in ${locale}).
- pillars: 3-5 content pillars with rationale, the icpCravings each feeds, a valueAxis[] (inform/entertain/prove), and a weight (shares sum ≈ 1).
- proofAssets: every concrete claim worth using, each classified (public-verifiable / internal-anonymized / fictional) with source where available.
- confidence: 0..1 reflecting how grounded this is in real evidence.

Return ONLY the JSON object.`;
  return { system: UNDERSTAND_SYSTEM, prompt };
}
