# Postcraft

> Turn a company's full public footprint into the visual posts its buyer actually wants to see.

Postcraft ingests **everything public about a company** — website, news, social, brand kit — figures out **who buys and what they crave**, studies **global references + local competitors** (images & carousels), and generates **ready-to-post content kits**: per-slide carousels with copy, image briefs, captions, and rendered 1080×1350 PNGs.

It's the generalization of a hand-built engine (`agrega-content-engine`) into a **provider-agnostic product** with a path to a sellable SaaS.

---

## The wedge (why this, not AdCreative/Predis/Jasper)

The market splits into four camps — ad-creative engines, generic social generators, carousel specialists, writing suites — and **none own all three** of these. Postcraft is the loop, not a feature:

1. **Company-intelligence → editable ICP graph as the engine.** Not "pick an audience" — a real, steerable ICP (pains, verbatim vocabulary, objections, triggers, proof) that re-targets every post.
2. **Per-slide carousel art direction.** Each slide has its own anatomy (cover ≠ stat ≠ quote ≠ CTA). The opposite of one template stamped 6× ("6 capas em loop").
3. **Competitor/reference visual research fused INTO generation.** Distill rivals' + global best-in-class visual language into design tokens that art-direct the output.

Full rationale, competitor table, pricing and risks: [`docs/RESEARCH.md`](docs/RESEARCH.md).

---

## How it works

```
   BrandInput (name, domain, @handles, competitors)
        │
   ① HARVEST     site crawl · news · social · brand kit          → CompanyFootprint
   ② UNDERSTAND  positioning · voice · ICP(s) · pillars · proof  → BrandIntelligence
   ③ RESEARCH    global refs + local competitors (visual)        → VisualPlaybook
   ④ GENERATE    concepts → per-slide carousel specs + briefs    → CarouselSpec[]
   ⑤ RENDER      AI texture (no text) + deterministic typography → ContentKit (PNGs)
```

**Hybrid generation thesis (validated by research):** diffusion models can't spell reliably across a 6-slide carousel, so AI generates the *background texture only* and a deterministic layer (Satori → PNG) renders *legible, brand-consistent typography* on top.

---

## Quickstart

```bash
npm install
npm run demo        # zero keys — fixture data + real renderer → runs/<brand>_<ts>/
```

The demo renders 2 full carousels for a sample brand (Nimbus Logística) under `runs/`. Open the `slide-*.png` files.

### Real brands

Copy `.env.example` → `.env` and add keys. Each stage auto-promotes from fixture → live when its key is present:

```bash
ANTHROPIC_API_KEY=...    # UNDERSTAND / RESEARCH / GENERATE
FIRECRAWL_API_KEY=...    # HARVEST (site + news + brand kit)
APIFY_TOKEN=...          # HARVEST (social)
FAL_KEY=...              # RENDER (AI backgrounds)  — or IDEOGRAM_API_KEY

npm run cli -- run --name "Acme" --domain acme.com --instagram @acme \
  --competitors "@rival1,@rival2" --concepts 8 --kits 3
```

Or pass a brief file: `npm run cli -- run --brief brand.json`.

---

## Architecture

Everything external sits behind an **adapter interface** (`src/adapters/interfaces.ts`). The engine depends only on interfaces, so:

- **Fixture adapters** → run end-to-end with no keys (demo / tests / CI).
- **Live adapters** → Firecrawl · Anthropic · Apify · fal/Ideogram.
- Swap any single provider without touching the pipeline.

```
src/
  types.ts            Zod domain model (single source of truth)
  config.ts           env → adapter wiring (auto fixture/live)
  carousel/grammar.ts slide archetypes + narrative recipes (the visual IP)
  prompts/            understand · research · generate (the strategy IP)
  pipeline/           harvest → understand → research → generate → render
  adapters/
    fixtures/         zero-key demo dataset + adapters
    scraper|social|llm|imagegen/   live providers
    renderer/satori   HTML/CSS → PNG, no browser
bin/postcraft.ts      CLI
examples/run-demo.ts  zero-key end-to-end
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/PIPELINE.md`](docs/PIPELINE.md), [`docs/ROADMAP.md`](docs/ROADMAP.md), [`docs/PRODUCT.md`](docs/PRODUCT.md).

## Selling it (commercialization)

The product is packaged to sell **today** as a productized service (run the engine, deliver kits), with a SaaS path later.

- **Landing page:** [`landing/index.html`](landing/index.html) — clean, modern, self-contained. Open it, or serve `landing/` on any static host (Vercel, Netlify, GitHub Pages, htmlpreview) or import into Lovable.
- **How we sell (decided GTM + pricing + scripts):** [`docs/SELLING.md`](docs/SELLING.md)
- **How to run a client delivery (step-by-step):** [`docs/OPERATING.md`](docs/OPERATING.md)

Pricing (BRL, productized-service): Diagnóstico R$990 · Starter R$1.490/mo · Studio R$2.990/mo · Agência R$6.000+/mo. Wedge: BR B2B + agencies, founder-led outbound, free-carousel-teaser close.

## Status

v0.1 — **commercialization-ready**: engine runs end-to-end in fixture mode with real rendered output (`npm run demo`), 5 tests green (`npm test`), landing + selling + operating docs shipped. Live adapters scaffolded (verify provider endpoints before billing). SaaS self-serve is phase 2 in the roadmap.
