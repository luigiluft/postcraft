/**
 * GENERATE prompts — the payoff stage. Two builders:
 *
 *  1) buildConceptsPrompt  → N PostConcepts (pillar × ICP × angle × hook).
 *  2) buildCarouselPrompt  → one CarouselSpec for a chosen concept, with
 *     per-slide archetypes + filled slots + per-slide image briefs.
 *
 * Encodes the o motor predecessor laws, generalized:
 *  - Cover must "para-scroll" (entertain/prove, not a lukewarm fact).
 *  - The middle must INFORM; every strong claim anchors to a proof asset, else
 *    it's just opinion. No fabricated numbers — only use intel.proofAssets.
 *  - Each slide's image must MATCH that slide's copy (not the same bg on all).
 *  - Images carry NO text (text is rendered deterministically); one object/
 *    metaphor per slide, on the brand palette — never generic stock.
 *  - Emphasis markers: {word} = highlight, | = line break. Never literal.
 */
import { describeGrammarForPrompt } from "../carousel/grammar.js";
import type {
  BrandIntelligence,
  Locale,
  PostConcept,
  VisualPlaybook,
} from "../types.js";

export const CONCEPTS_SYSTEM = `You are a B2B content strategist who designs scroll-stopping post concepts that a specific buyer (ICP) actually wants to consume.

Rules:
1. Every concept maps to exactly one pillar and one ICP, and states a HYPOTHESIS: why THIS stops THIS buyer's scroll.
2. The hook is the cover line — it must create recognition tension or promise a concrete payoff. No clickbait the body can't pay off.
3. Value axis: tag each concept with inform/entertain/prove. A concept that does none is rejected. Prefer concepts that can prove (anchor to a real proof asset via proofRef).
4. Diversity: vary pillars, ICPs, formats, and durability (temporal vs evergreen) across the set. No two hooks may reuse the same opening device.
5. Never propose a concept whose proof would require inventing a number. If there's no proof asset, lean inform/entertain and say so.`;

export function buildConceptsPrompt(
  intel: BrandIntelligence,
  playbook: VisualPlaybook,
  count: number,
  locale: Locale,
): { system: string; prompt: string } {
  const icps = intel.icps
    .map(
      (i) =>
        `- id=${i.id} "${i.label}" — cravings: ${i.contentCravings.join(
          "; ",
        )} | pains: ${i.pains.join("; ")} | verbatim: ${i.verbatimTerms.join(", ")}`,
    )
    .join("\n");
  const pillars = intel.pillars
    .map(
      (p) =>
        `- id=${p.id} "${p.name}" (axis: ${p.valueAxis.join("/")}, weight ${p.weight}) — ${p.rationale}`,
    )
    .join("\n");
  const proofs = intel.proofAssets
    .map(
      (a, idx) =>
        `[${idx}] (${a.class}) ${a.claim}${a.value ? ` = ${a.value}` : ""}${
          a.sourceUrl ? ` <${a.sourceUrl}>` : ""
        }`,
    )
    .join("\n");

  const prompt = `Output language: ${locale}.

ICPs:
${icps}

PILLARS:
${pillars}

PROOF ASSETS (reference by index in proofRef; never invent numbers beyond these):
${proofs || "(none — avoid concepts that need hard proof)"}

HOOK PATTERNS that work in this niche:
${playbook.hookPatterns.map((h) => `- ${h}`).join("\n") || "- (use recognition tension or concrete payoff)"}

Produce ${count} distinct PostConcept objects. For each: id (slug), pillarId, icpId, angle, hook (the cover line, in ${locale}), hypothesis (why it stops this ICP), valueAxis[] (≥1), format (default "carousel"), durability, and proofRef (index above) when it leans on proof.

Return ONLY a JSON array of PostConcept objects.`;
  return { system: CONCEPTS_SYSTEM, prompt };
}

export const CAROUSEL_SYSTEM = `You are a carousel art director + copywriter. You turn one post concept into a designed, slide-by-slide carousel where EACH slide has its own anatomy and its own image brief — never one template stamped N times.

Hard rules:
1. Pick a narrative recipe (or compose archetypes). The cover must para-scroll; the middle slides must INFORM (one idea each); the final slide is a single CTA.
2. Fill each slide's named slots EXACTLY as the archetype defines. Use {word} for highlight and | for a hard line break. Never output literal { } | for any other purpose. Keep lines short — they render on 1080×1350.
3. Copy is in the brand VOICE provided. No agency jargon. Translate insider terms.
4. PROOF: any number/claim must come from the concept's proof asset or the intelligence — never fabricate. If a stat slide has no real number, replace it with an inform/quote slide.
5. IMAGE BRIEFS (one per slide): describe a single object/metaphor that matches THAT slide's copy, on the brand palette, studio/editorial styling. The image carries ABSOLUTELY NO TEXT (text is rendered separately). No generic stock, no mood-only warehouse shots. Vary the object per slide. Provide a negativePrompt that bans text, logos, watermarks, extra fingers.
6. Caption: write Instagram + LinkedIn captions in ${"${locale}"} brand voice; end with the CTA. Every number in the caption must also exist in the slides/proof (captions are re-voicing, not new reporting).`;

export function buildCarouselPrompt(
  concept: PostConcept,
  intel: BrandIntelligence,
  playbook: VisualPlaybook,
  locale: Locale,
): { system: string; prompt: string } {
  const icp = intel.icps.find((i) => i.id === concept.icpId) ?? intel.icps[0]!;
  const pillar =
    intel.pillars.find((p) => p.id === concept.pillarId) ?? intel.pillars[0]!;
  const proof =
    concept.proofRef != null ? intel.proofAssets[concept.proofRef] : undefined;
  const tokens = playbook.designTokens;

  const system = CAROUSEL_SYSTEM.replace("${locale}", locale);
  const prompt = `Output language for all copy: ${locale}.

CONCEPT
- angle: ${concept.angle}
- hook (cover): ${concept.hook}
- hypothesis: ${concept.hypothesis}
- value axis: ${concept.valueAxis.join("/")}
- durability: ${concept.durability}

AUDIENCE (ICP "${icp.label}")
- cravings: ${icp.contentCravings.join("; ")}
- pains: ${icp.pains.join("; ")}
- objections to disarm: ${icp.objections.join("; ")}
- verbatim terms to echo: ${icp.verbatimTerms.join(", ")}

PILLAR: ${pillar.name} (${pillar.valueAxis.join("/")})

BRAND VOICE
- persona: ${intel.voice.persona}
- tone: ${intel.voice.tone.join(", ")}
- do: ${intel.voice.doList.join("; ")}
- don't: ${intel.voice.dontList.join("; ")}
- forbidden: ${intel.voice.forbidden.join("; ")}

PROOF for this concept:
${proof ? `(${proof.class}) ${proof.claim}${proof.value ? ` = ${proof.value}` : ""}` : "(no hard proof — do not invent numbers; use inform/quote slides)"}

DESIGN TOKENS (use these exact values in designTokens)
- palette: bg ${tokens.palette.bg}, ink ${tokens.palette.ink}, accent ${tokens.palette.accent}, muted ${tokens.palette.muted}
- fonts: display ${tokens.fonts.display}, body ${tokens.fonts.body}
- mood: ${tokens.mood.join(", ")}

VISUAL PLAYBOOK
- carousel anatomy: ${playbook.carouselAnatomy.join(" | ")}
- do: ${playbook.doList.join("; ")}
- don't (avoid this generic look): ${playbook.dontList.join("; ")}

${describeGrammarForPrompt()}

Produce ONE CarouselSpec with 5-7 slides. Each slide: n, archetype (from the grammar), fields (the archetype's exact slots, in ${locale}, using {word}/| markers), and image (an ImageBrief: role, prompt, negativePrompt, style, palette = the brand hex, aspectRatio "4:5"). Also: title, caption {instagram, linkedin}, hashtags[], cta {label, meta, url?}, designTokens (the values above), valueAxis[].

Return ONLY the JSON object.`;
  return { system, prompt };
}
