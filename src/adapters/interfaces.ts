/**
 * Adapter interfaces — the seam that makes Postcraft provider-agnostic.
 *
 * Every external capability (scraping, social, LLM, image-gen, rendering,
 * visual reference search) is behind one of these. The pipeline depends only
 * on the interface, never the implementation, so we can ship:
 *   - fixture adapters  → run end-to-end with zero keys (demo / tests / CI)
 *   - live adapters     → Firecrawl / Anthropic / Apify / fal / Ideogram
 * and later swap any single provider without touching the engine.
 */
import type { z } from "zod";
import type {
  BrandKit,
  CarouselSpec,
  ImageBrief,
  NewsItem,
  RenderedSlide,
  ScrapedPage,
  SocialProfile,
  VisualReference,
} from "../types.js";

export interface ScraperAdapter {
  readonly name: string;
  /** Single page → clean markdown. */
  scrape(url: string): Promise<ScrapedPage>;
  /** Crawl a domain for the most content-bearing pages. */
  crawl(domain: string, opts?: { limit?: number }): Promise<ScrapedPage[]>;
  /** Web/news search → recent signals. */
  search(query: string, opts?: { limit?: number }): Promise<NewsItem[]>;
  /** Extract brand kit (logo, palette, fonts, visual language) from a site. */
  brandKit(url: string): Promise<BrandKit>;
}

export interface SocialAdapter {
  readonly name: string;
  /** Public profile + recent posts + engagement for a handle. */
  fetchProfile(
    platform: string,
    handle: string,
    opts?: { limit?: number },
  ): Promise<SocialProfile | null>;
}

export interface LLMCompleteOpts {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  /** Mark static prefixes for prompt caching where the provider supports it. */
  cachePrefix?: string;
}

export interface LLMJSONOpts<S extends z.ZodTypeAny> extends LLMCompleteOpts {
  schema: S;
  schemaName?: string;
}

export interface LLMAdapter {
  readonly name: string;
  complete(opts: LLMCompleteOpts): Promise<string>;
  /** Structured output validated against a Zod schema (retries on mismatch). */
  completeJSON<S extends z.ZodTypeAny>(opts: LLMJSONOpts<S>): Promise<z.infer<S>>;
}

export interface ImageGenAdapter {
  readonly name: string;
  /** Generate one image to disk; returns the local path. */
  generate(brief: ImageBrief, outPath: string): Promise<{ path: string }>;
}

export interface RendererAdapter {
  readonly name: string;
  /** Compose a carousel spec into legible 1080×1350 PNG slides. */
  renderCarousel(
    spec: CarouselSpec,
    opts: { assetsDir?: string; outDir: string; brandName?: string },
  ): Promise<RenderedSlide[]>;
}

export interface VisualSearchAdapter {
  readonly name: string;
  findReferences(
    query: string,
    opts: { scope: "global" | "local-competitor"; limit?: number },
  ): Promise<VisualReference[]>;
}

/** The full bundle the pipeline consumes. visualSearch is optional — when
 * absent the research stage derives references via the LLM from harvested
 * competitor data instead of a dedicated search provider. */
export interface Adapters {
  scraper: ScraperAdapter;
  social: SocialAdapter;
  llm: LLMAdapter;
  imagegen: ImageGenAdapter;
  renderer: RendererAdapter;
  visualSearch?: VisualSearchAdapter;
}
