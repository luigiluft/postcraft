# Architecture

## One sentence

A typed, provider-agnostic pipeline that takes a `BrandInput`, harvests a `CompanyFootprint`, reasons it into `BrandIntelligence` + a `VisualPlaybook`, generates `CarouselSpec`s, and renders `ContentKit`s — with every external capability behind a swappable adapter.

## Layers

```
            ┌─────────────────────────────────────────────┐
   CLI /    │  bin/postcraft.ts · examples/run-demo.ts     │   entrypoints
   library  │  src/index.ts (public surface)               │
            └───────────────┬─────────────────────────────┘
                            │
            ┌───────────────▼─────────────────────────────┐
   pipeline │ harvest → understand → research → generate → │   orchestration
            │ render   (src/pipeline/*)                    │   (depends only on
            └───────────────┬─────────────────────────────┘    interfaces + types)
                            │
        ┌───────────────────┼───────────────────────────────┐
        │                   │                                 │
  ┌─────▼─────┐     ┌───────▼────────┐               ┌────────▼────────┐
  │  types.ts │     │ prompts/* +    │               │ adapters/        │
  │  (Zod)    │     │ carousel/      │               │  interfaces.ts   │
  │  contract │     │ grammar.ts     │               │  fixtures/ live/ │
  └───────────┘     │  (the IP)      │               └─────────────────┘
                    └────────────────┘
```

- **`types.ts` (Zod) is the contract.** Schemas validate adapter output and LLM output at the boundaries; TS types are inferred (`z.infer`). Single source of truth.
- **The pipeline depends only on interfaces + types.** It never imports a concrete provider.
- **`config.ts` wires adapters from env** — `auto` picks the live provider when its key is present, else the fixture.

## The adapter seam

`src/adapters/interfaces.ts` defines six capabilities:

| Interface | Live provider | Fixture | Notes |
|---|---|---|---|
| `ScraperAdapter` | Firecrawl | canned site | `/map`→`/scrape`+`branding`; news via `/search` |
| `SocialAdapter` | Apify | canned profile | per-platform actors, normalized into `SocialProfile` |
| `LLMAdapter` | Anthropic | canned dataset | schema-validated JSON w/ retry; prompt caching |
| `ImageGenAdapter` | fal / Ideogram | gradient SVG→PNG | text-free backgrounds only |
| `RendererAdapter` | Satori→PNG | (same) | deterministic text layer, no browser |
| `VisualSearchAdapter` | _(optional)_ | — | references otherwise LLM-derived |

This is what makes it **demoable with zero keys** and **sellable** with keys — same engine.

## The hybrid rendering thesis

Diffusion models can't spell reliably across a multi-slide carousel (research §3b). So:

1. **AI** generates the *background texture only* (`ImageBrief.prompt` bans text).
2. **Satori** composes *legible, brand-consistent typography* (`carousel/grammar.ts` archetypes) over it and rasterizes via resvg → 1080×1350 PNG.

No headless browser → runs on serverless. Brand consistency is deterministic, not a roll of the dice.

## The visual IP

`carousel/grammar.ts` generalizes the agrega 6-anatomy system into:
- **Archetypes** (`cover`, `mirror`, `context`, `list`, `stat`, `step`, `comparison`, `quote`, `takeaway`, `cta`) — each with named text slots.
- **Recipes** (`thesis`, `listicle`, `howto`, `case`, `comparison`) — ordered archetype sequences.
- `describeGrammarForPrompt()` injects the grammar into the GENERATE prompt so the LLM emits slides that map 1:1 to layouts.

## Renderer gotcha (documented)

satori-html mis-parses a truly-empty `<div></div>` (it inflates the parent's child count → "needs display:flex"). **Every decorative empty div must carry `display:flex`.** See `scripts/probe5.mjs`.

## Extension points

- New provider → implement an interface, register in `config.ts`.
- New post format / layout → add an archetype + recipe in `grammar.ts` and a layout branch in `renderer/satori.ts`.
- New language → add to `LocaleSchema` and the `LOCALE_NOTE` maps.
- Quality gates (fact-check, human approval) → wrap stages (see `docs/ROADMAP.md`).
