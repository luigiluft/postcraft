<p align="center">
  <img src="docs/cover.png" width="100%" alt="Postcraft" />
</p>

<h1 align="center">Postcraft</h1>

<p align="center"><b>Turn a company's full public footprint into the visual posts its buyer actually wants to see.</b></p>

<p align="center">company intelligence → <i>editable ICP</i> → competitor visual research → ready-to-post carousels</p>

---

Postcraft ingests **everything public about a company** — website, news, social, brand kit — figures out **who buys and what they crave**, studies **global references + local competitors**, and generates **ready-to-post content kits**: per-slide carousels with copy, AI backgrounds, captions, the brand logo, and rendered 1080×1350 PNGs.

It's the generalization of a hand-built engine into a **provider-agnostic product** that already runs end-to-end.

## See it — real output

Generated end-to-end for **Agrega Agro** (agro full-commerce), grounded in their live site + a derived ICP + competitor research. AI makes the backgrounds (Higgsfield); a deterministic layer renders the text + logo so it's always crisp.

<p align="center">
  <img src="docs/samples/agrega-agro-1.png" width="23%" />
  <img src="docs/samples/agrega-agro-2.png" width="23%" />
  <img src="docs/samples/agrega-agro-4.png" width="23%" />
  <img src="docs/samples/agrega-agro-6.png" width="23%" />
</p>

## The wedge (why this, not AdCreative / Predis / Jasper)

The market splits into four camps and **none own the full loop**:

1. **Company-intelligence → editable ICP graph as the engine.** Not "pick an audience" — a real, steerable buyer model (pains, verbatim vocabulary, objections, triggers, proof) that re-targets every post.
2. **Per-slide carousel art direction.** Each slide has its own anatomy (cover ≠ stat ≠ quote ≠ CTA). The opposite of one template stamped 6×.
3. **Competitor/reference visual research fused into generation.** Rivals' + global best-in-class visual language becomes design tokens that art-direct the output.

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

**Hybrid generation thesis (validated):** diffusion models can't spell across a 6-slide carousel, so AI generates the *background only* and a deterministic layer (Satori → PNG) renders *legible, brand-consistent typography + logo* on top.

## Quickstart

```bash
npm install
npm run demo                      # zero keys → fixture data + real renderer → runs/
npm test                          # 5 tests
# real brand (add keys to .env), or render a hand-authored spec:
npm run cli -- run --name "Acme" --domain acme.com --instagram @acme --competitors "@r1,@r2"
tsx examples/render-spec.ts examples/agrega-agro.spec.json "Agrega Agro" runs/out logo.png
```

## Pricing — sells **today** as a productized service

You run the engine + apply the quality gates and deliver finished kits. (Self-serve SaaS is phase 2 — see the roadmap.)

| Plan | Price (BRL) | Delivery |
|---|---|---|
| **Diagnóstico** (entry) | R$ 990 one-time | Intelligence + editable ICP + visual playbook + 2 sample carousels |
| **Starter** | R$ 1.490/mo | 1 brand · 8 posts (~R$186/post) · 1 revision |
| **Studio** ⭐ | R$ 2.990/mo | 1 brand · 20 posts (~R$150/post) · competitor research · 2 revisions |
| **Agência / White-label** | from R$ 6.000/mo | multiple brands · white-label · approval flow |

Pix or card · wedge: BR B2B + agencies · founder-led outbound · **free-carousel-teaser close**.

→ **Customer-facing pricing/sales page:** [`landing/index.html`](landing/index.html) · **how to sell (scripts + motion):** [`docs/SELLING.md`](docs/SELLING.md) · **how to deliver:** [`docs/OPERATING.md`](docs/OPERATING.md)

## Repo map

```
src/            the engine — types (Zod) · carousel grammar · prompts · pipeline · adapters
landing/        customer-facing sales + pricing page (self-contained HTML)
examples/       run-demo · render-spec · agrega-agro.spec.json (a real grounded carousel)
docs/           RESEARCH · PRODUCT · SELLING · OPERATING · ARCHITECTURE · PIPELINE · ROADMAP
bin/            CLI
```

Everything external (scraper · social · LLM · image-gen · renderer) sits behind an **adapter** with a fixture (zero-key) and a live impl — swap any provider without touching the pipeline.

## Status — is it ready?

- ✅ **Ready to sell as a done-for-you service now.** Proven end-to-end on a real company (Agrega Agro): real harvest → ICP → spec → Higgsfield backgrounds → rendered, on-brand, post-ready carousels with logo. Engine runs (`npm run demo`), tests green (`npm test`), typecheck clean.
- 🔜 **Not yet a self-serve SaaS** — no web app / billing / multi-tenant (roadmap v0.3–v0.4).
- ⚠️ **Live API adapters scaffolded but unverified** — the harvest/LLM stages have been run via operator tooling; validate Firecrawl/Anthropic/Apify endpoints against current docs before a fully-automated live pipeline bills customers.

## Docs

[ARCHITECTURE](docs/ARCHITECTURE.md) · [PIPELINE](docs/PIPELINE.md) · [PRODUCT](docs/PRODUCT.md) · [SELLING](docs/SELLING.md) · [OPERATING](docs/OPERATING.md) · [ROADMAP](docs/ROADMAP.md) · [RESEARCH](docs/RESEARCH.md)
