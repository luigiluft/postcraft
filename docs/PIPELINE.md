# Pipeline

Five stages, each pure-ish: `(input, adapters) → typed output`. Run together by `src/pipeline/index.ts`.

## ① HARVEST → `CompanyFootprint`

`src/pipeline/harvest.ts`

- **Site:** `scraper.crawl(domain)` (map → scrape top pages, ranked home/about/product/pricing/blog) + `scraper.brandKit(domain)` (logo, palette, fonts).
- **Site facts:** a small LLM extraction over crawled markdown → `summary`, `products[]`, `valueProps[]` (avoids Firecrawl's expensive AI `/extract`).
- **News:** `scraper.search("<brand> <domain>")`.
- **Social:** owned handles (IG/LinkedIn/TikTok) + up to 3 competitors via `social.fetchProfile`.
- Output validated by `CompanyFootprintSchema`. Every adapter maps INTO this shape — the rest of the engine never sees a raw provider response.

## ② UNDERSTAND → `BrandIntelligence`

`src/pipeline/understand.ts` · prompt `prompts/understand.ts`

Produces positioning, category, differentiators, a concrete **voice profile**, **1-3 ICPs** (jobs, pains, desires, triggers, **contentCravings**, objections, buyingStage, **verbatimTerms**), **content pillars** (with value axis + weight), and **proof assets** — each classified `public-verifiable | internal-anonymized | fictional`.

**Laws encoded:** ground everything in the footprint; never fabricate a number; capture the buyer's *verbatim* phrasing; cravings describe what the buyer wants to see, not what the company sells.

## ③ RESEARCH → `VisualPlaybook`

`src/pipeline/research.ts` · prompt `prompts/research.ts`

Separates **global best-in-class** references from **local competitors**, distills them into reusable rules (carousel anatomy, hook/color/type/layout patterns), and emits **design tokens** grounded in the real brand kit. `doList`/`dontList` capture the craft to chase and the generic template look to avoid. Optional `VisualSearchAdapter` feeds real examples; otherwise the LLM reasons from harvested competitor posts + its own knowledge.

## ④ GENERATE → `PostConcept[]` then `CarouselSpec[]`

`src/pipeline/generate.ts` · prompt `prompts/generate.ts`

1. **Concepts:** N ideas, each `pillar × ICP × angle × hook × hypothesis × valueAxis × durability`, diverse, proof-anchored where possible.
2. **Carousel spec (per chosen concept):** 5-7 slides, each an **archetype** with filled slots + a **per-slide image brief**, plus IG/LinkedIn captions, hashtags, CTA, design tokens.

**Laws encoded:** cover must para-scroll; middle must inform; no `prove` without a real proof asset; each slide's image matches *that* slide's copy; images carry no text; emphasis markers `{word}` / `|`. Slides are validated against the grammar (`missingSlots`).

## ⑤ RENDER → `ContentKit`

`src/pipeline/render.ts` · renderer `adapters/renderer/satori.ts`

- For each slide: `imagegen.generate(brief)` → `assets/bg-<n>.png` (text-free texture).
- `renderer.renderCarousel(spec)` composes legible typography over the texture → `slide-<n>.png` (1080×1350).
- Writes `spec.json` + `caption.txt` sidecars for handoff/scheduling.

## Output layout

```
runs/<brand>_<ts>/
  run.json                      full RunResult (footprint→kits)
  <concept-id>/
    spec.json                   the carousel spec
    caption.txt                 IG + LinkedIn + hashtags
    assets/bg-1..6.png          AI textures
    slide-1..6.png              final composed slides
```

## Where the human gates go (roadmap)

The agrega engine proved 3 human gates (angle+stat → drop written → IG package). In Postcraft these become optional `approve` hooks between stages — see `docs/ROADMAP.md`. Fact-checking lives at UNDERSTAND (proof classification) and is re-asserted at GENERATE (no number without a proof asset).
