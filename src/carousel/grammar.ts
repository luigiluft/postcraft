/**
 * Carousel grammar — the visual IP, generalized.
 *
 * The agrega-content-engine proved 6 fixed slide anatomies (capa, espelho,
 * checklist, stat, quote, cta). This file lifts that into a reusable registry
 * of slide ARCHETYPES plus NARRATIVE RECIPES (ordered archetype sequences for
 * common post shapes). The GENERATE stage picks a recipe and fills each
 * archetype's named slots; the renderer maps archetype → layout.
 *
 * Emphasis markers honoured by the renderer in any `line` slot:
 *   {word}  → highlight (underline / accent)
 *   |       → hard line break
 */
import type { ValueAxis } from "../types.js";

export type SlotType = "line" | "list";

export interface SlideSlot {
  type: SlotType;
  required: boolean;
  hint: string;
}

export interface SlideArchetype {
  id: string;
  label: string;
  purpose: string;
  /** Named text slots this layout renders. */
  slots: Record<string, SlideSlot>;
  /** Value axes this archetype naturally serves. */
  defaultValueAxis: ValueAxis[];
}

const line = (required: boolean, hint: string): SlideSlot => ({
  type: "line",
  required,
  hint,
});
const list = (required: boolean, hint: string): SlideSlot => ({
  type: "list",
  required,
  hint,
});

// ─────────────────────────────────────────────────────────────────────────
// Archetype registry
// ─────────────────────────────────────────────────────────────────────────

export const ARCHETYPES: Record<string, SlideArchetype> = {
  cover: {
    id: "cover",
    label: "Cover / Hook",
    purpose:
      "Stop the scroll. Promise a payoff or name a tension the ICP recognizes.",
    slots: {
      kicker: line(false, "tiny eyebrow label, e.g. series name or category"),
      title: line(true, "the hook — 3-8 words, may use {emphasis} and | breaks"),
      subtitle: line(false, "one supporting clause that sharpens the promise"),
    },
    defaultValueAxis: ["entertain", "prove"],
  },
  mirror: {
    id: "mirror",
    label: "Mirror / Problem",
    purpose:
      "Reflect the ICP's uncomfortable reality so they feel seen ('that's me').",
    slots: {
      punchline: line(true, "the recognition line — blunt, specific to the ICP"),
      aside: line(false, "a parenthetical twist or wry observation"),
    },
    defaultValueAxis: ["entertain"],
  },
  context: {
    id: "context",
    label: "Context / Stakes",
    purpose: "Explain why this matters now — the cost of ignoring it.",
    slots: {
      title: line(true, "framing line"),
      body: line(true, "2-3 short sentences of stakes, may use | breaks"),
    },
    defaultValueAxis: ["inform"],
  },
  list: {
    id: "list",
    label: "List / Checklist",
    purpose: "Enumerate symptoms, steps, or criteria the ICP can self-check.",
    slots: {
      title: line(true, "list header, ends with ':'"),
      items: list(true, "3-5 items, each one short clause"),
    },
    defaultValueAxis: ["inform"],
  },
  stat: {
    id: "stat",
    label: "Stat / Proof",
    purpose: "One verified number that makes the argument undeniable.",
    slots: {
      label: line(false, "what the number measures"),
      number: line(true, "the figure, e.g. '12-18%' or '3x'"),
      desc: line(true, "what it means, may use | breaks"),
      sub: line(false, "source note or the so-what, supports {emphasis}"),
    },
    defaultValueAxis: ["prove", "inform"],
  },
  step: {
    id: "step",
    label: "Step",
    purpose: "One actionable step in a how-to sequence.",
    slots: {
      index: line(false, "step number or label"),
      title: line(true, "what to do"),
      body: line(true, "how to do it, may use | breaks"),
    },
    defaultValueAxis: ["inform"],
  },
  comparison: {
    id: "comparison",
    label: "Comparison",
    purpose: "Contrast the old/wrong way vs the new/right way.",
    slots: {
      title: line(true, "the axis of comparison"),
      leftLabel: line(true, "left column header (the loser)"),
      leftPoints: list(true, "2-4 points for the left side"),
      rightLabel: line(true, "right column header (the winner)"),
      rightPoints: list(true, "2-4 points for the right side"),
    },
    defaultValueAxis: ["inform", "entertain"],
  },
  quote: {
    id: "quote",
    label: "Quote / Insight",
    purpose: "A memorable, quotable distillation of the thesis.",
    slots: {
      lead: line(false, "short setup line"),
      quote: line(true, "the line worth screenshotting, supports {emphasis}"),
      attribution: line(false, "who/what it's attributed to"),
    },
    defaultValueAxis: ["entertain", "prove"],
  },
  takeaway: {
    id: "takeaway",
    label: "Takeaway / Recap",
    purpose: "Crystallize what to remember before the ask.",
    slots: {
      title: line(true, "recap header"),
      points: list(true, "2-4 crisp takeaways"),
    },
    defaultValueAxis: ["inform"],
  },
  cta: {
    id: "cta",
    label: "CTA / Close",
    purpose: "Convert attention into the one next action.",
    slots: {
      question: line(true, "a reframing question that earns the click"),
      ctaLabel: line(true, "the action, may use | breaks"),
      ctaMeta: line(false, "where/when, e.g. 'link in bio · no signup'"),
    },
    defaultValueAxis: ["entertain"],
  },
};

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES);

export function getArchetype(id: string): SlideArchetype | undefined {
  return ARCHETYPES[id];
}

// ─────────────────────────────────────────────────────────────────────────
// Narrative recipes — ordered archetype sequences for common post shapes
// ─────────────────────────────────────────────────────────────────────────

export interface NarrativeRecipe {
  id: string;
  label: string;
  when: string;
  sequence: string[];
}

export const RECIPES: Record<string, NarrativeRecipe> = {
  thesis: {
    id: "thesis",
    label: "Thesis / POV",
    when: "A contrarian insight or point of view for an aware B2B audience.",
    sequence: ["cover", "mirror", "context", "stat", "quote", "cta"],
  },
  listicle: {
    id: "listicle",
    label: "Listicle",
    when: "Symptoms, mistakes, or criteria — high save-rate, easy to skim.",
    sequence: ["cover", "list", "list", "stat", "takeaway", "cta"],
  },
  howto: {
    id: "howto",
    label: "How-to / Playbook",
    when: "A repeatable process the ICP can apply immediately.",
    sequence: ["cover", "context", "step", "step", "step", "cta"],
  },
  case: {
    id: "case",
    label: "Case / Story",
    when: "A concrete before→after story (anonymized if private).",
    sequence: ["cover", "context", "stat", "quote", "takeaway", "cta"],
  },
  comparison: {
    id: "comparison",
    label: "Comparison",
    when: "Old way vs new way; positioning against the status quo.",
    sequence: ["cover", "mirror", "comparison", "stat", "takeaway", "cta"],
  },
};

export const RECIPE_IDS = Object.keys(RECIPES);

export function getRecipe(id: string): NarrativeRecipe | undefined {
  return RECIPES[id];
}

// ─────────────────────────────────────────────────────────────────────────
// Prompt helpers — compact descriptions the GENERATE stage embeds so the LLM
// emits slides that exactly match a layout's slots.
// ─────────────────────────────────────────────────────────────────────────

export function describeArchetype(id: string): string {
  const a = ARCHETYPES[id];
  if (!a) return `- ${id}: (unknown archetype)`;
  const slots = Object.entries(a.slots)
    .map(([k, s]) => `${k}${s.required ? "" : "?"}:${s.type} (${s.hint})`)
    .join("; ");
  return `- ${a.id} — ${a.purpose}\n    slots: ${slots}`;
}

export function describeGrammarForPrompt(): string {
  const arche = ARCHETYPE_IDS.map(describeArchetype).join("\n");
  const recipes = RECIPE_IDS.map((id) => {
    const r = RECIPES[id]!;
    return `- ${r.id} (${r.label}) — ${r.when}\n    sequence: ${r.sequence.join(" → ")}`;
  }).join("\n");
  return `SLIDE ARCHETYPES (fill the named slots exactly):\n${arche}\n\nNARRATIVE RECIPES (choose one, or compose your own from archetypes):\n${recipes}`;
}

/** Validate a slide's fields against its archetype; returns missing required slots. */
export function missingSlots(
  archetype: string,
  fields: Record<string, unknown>,
): string[] {
  const a = ARCHETYPES[archetype];
  if (!a) return [`unknown archetype: ${archetype}`];
  return Object.entries(a.slots)
    .filter(([k, s]) => s.required && !hasValue(fields[k]))
    .map(([k]) => k);
}

function hasValue(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
