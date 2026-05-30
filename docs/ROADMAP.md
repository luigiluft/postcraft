# Roadmap — engine → sellable product

## v0.1 — Engine (DONE)
- [x] Provider-agnostic pipeline (harvest→understand→research→generate→render).
- [x] Zod domain contract; carousel grammar (archetypes + recipes).
- [x] Fixture mode: end-to-end with zero keys, real rendered PNGs.
- [x] Satori renderer (no browser, serverless-ready).
- [x] Live adapters scaffolded (Anthropic, Firecrawl, Apify, fal, Ideogram).
- [x] CLI + library surface.

## v0.2 — Real output you'd trust (validate live)
- [ ] Verify each live adapter against current provider docs; add a 10-item Apify pilot gate.
- [ ] Run on 5 real brands (incl. an vertical B2B BR) end-to-end with keys.
- [ ] **Quality gates** (port from o motor predecessor):
  - fact-check gate (proof provenance enforced before a number ships),
  - text-only dry-run preview (render copy before paying for images),
  - optional human approve hook between stages.
- [ ] Eval harness: score generated carousels vs a rubric (hook strength, ICP fit, value axis coverage, anti-template). Loop until threshold.
- [ ] `VisualSearchAdapter` (Apify/Firecrawl) to collect & rank real competitor visuals.
- [ ] Content-hash cache for harvest (re-runs cheap; re-synth only on source change).

## v0.3 — Operator UI (single-user)
- [ ] Thin web app (Next.js or Lovable) over the engine: input a brand → review concepts → tweak → render → export.
- [ ] Spec editor (edit slide copy, re-render in seconds).
- [ ] Brand workspace persistence (Supabase): footprint, intelligence, playbook, kits.
- [ ] Scheduling/export (download zip, or post via Buffer/Meta API).

## v0.4 — SaaS (multi-tenant, billable)
- [ ] Auth + multi-tenant brand workspaces.
- [ ] Usage metering + credits; Stripe billing; BR: Pix.
- [ ] Agency mode: many brands, team seats, approval flows, white-label export.
- [ ] Onboarding "aha": paste a domain → first carousel in < 2 min.
- [ ] Cost controls: model routing (cheap model for harvest/extract, strong for generate), per-run budget caps.

## v0.5 — Moat & scale
- [ ] Feedback loop: which posts the operator ships/edits → tune prompts & playbook per brand.
- [ ] Reference library that compounds per niche (the visual-research moat).
- [ ] Performance ingestion (post-publish engagement) → close the loop on what the ICP actually rewards.
- [ ] Video/reel covers; story format; localization beyond pt-BR/en/es.

## Cross-cutting
- Tests: unit (grammar validation, prompt builders, hex utils), integration (fixture pipeline), snapshot (rendered PNG dimensions).
- Observability: per-stage timing + token cost; surface degradation, not just crashes.
- Security: keys via env/secret manager only; never log raw tokens.
