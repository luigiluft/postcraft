/**
 * Firecrawl scraper adapter. Strategy (per research): /map to discover the
 * content-bearing pages, /scrape (markdown) for content, /search for news,
 * and the `branding` format for the brand kit. Avoids the expensive AI
 * /extract — site facts are extracted by our own LLM downstream.
 *
 * NOTE: endpoints follow Firecrawl v1; verify against current docs before
 * production billing.
 */
import {
  type BrandKit,
  type NewsItem,
  type ScrapedPage,
} from "../../types.js";
import { log } from "../../util/logger.js";
import type { ScraperAdapter } from "../interfaces.js";

const BASE = "https://api.firecrawl.dev/v1";

export class FirecrawlScraper implements ScraperAdapter {
  readonly name = "firecrawl-scraper";
  private key = process.env.FIRECRAWL_API_KEY ?? "";

  private async post(path: string, body: unknown): Promise<any> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.key}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`firecrawl ${path} ${res.status}`);
    return res.json();
  }

  async scrape(url: string): Promise<ScrapedPage> {
    const j = await this.post("/scrape", { url, formats: ["markdown"] });
    const d = j.data ?? j;
    return {
      url,
      title: d.metadata?.title ?? "",
      markdown: d.markdown ?? "",
      kind: classify(url),
    };
  }

  async crawl(domain: string, opts?: { limit?: number }): Promise<ScrapedPage[]> {
    const limit = opts?.limit ?? 8;
    let links: string[] = [];
    try {
      const m = await this.post("/map", { url: domain });
      links = (m.links ?? m.data?.links ?? []).map((l: any) =>
        typeof l === "string" ? l : l.url,
      );
    } catch (e) {
      log.warn("firecrawl map failed, scraping home only:", String(e));
      links = [domain];
    }
    const ranked = rankLinks(domain, links).slice(0, limit);
    const pages: ScrapedPage[] = [];
    for (const u of ranked) {
      try {
        pages.push(await this.scrape(u));
      } catch (e) {
        log.debug(`scrape failed ${u}: ${String(e)}`);
      }
    }
    return pages.length ? pages : [await this.scrape(domain)];
  }

  async search(query: string, opts?: { limit?: number }): Promise<NewsItem[]> {
    try {
      const j = await this.post("/search", { query, limit: opts?.limit ?? 8 });
      const items = j.data ?? j.results ?? [];
      return items.map((r: any) => ({
        title: r.title ?? "",
        url: r.url,
        source: r.url ? new URL(r.url).hostname : undefined,
        snippet: r.description ?? r.snippet ?? "",
      }));
    } catch (e) {
      log.warn("firecrawl search failed:", String(e));
      return [];
    }
  }

  async brandKit(url: string): Promise<BrandKit> {
    const host = safeHost(url);
    const favicon = host
      ? `https://www.google.com/s2/favicons?domain=${host}&sz=256`
      : undefined;
    try {
      const j = await this.post("/scrape", { url, formats: ["branding"] });
      const b = j.data?.branding ?? j.branding ?? {};
      return {
        colors: b.colors ?? b.palette ?? [],
        fonts: b.fonts ?? [],
        // Best brand logo if found, else a high-res favicon as last resort.
        logoUrl: b.logo ?? b.logoUrl ?? b.icon ?? favicon,
        imagery: b.images ?? [],
        visualLanguage: b.description ?? "",
      };
    } catch (e) {
      log.warn("firecrawl branding failed:", String(e));
      return {
        colors: [],
        fonts: [],
        logoUrl: favicon,
        imagery: [],
        visualLanguage: "",
      };
    }
  }
}

function safeHost(url: string): string | undefined {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return undefined;
  }
}

function classify(url: string): ScrapedPage["kind"] {
  const u = url.toLowerCase();
  if (/\/(about|sobre|quem-somos|company)/.test(u)) return "about";
  if (/\/(product|produto|solucoes|solutions|features)/.test(u)) return "product";
  if (/\/(blog|news|noticias|insights)/.test(u)) return "blog";
  if (/\/(pricing|precos|planos|plans)/.test(u)) return "pricing";
  if (/^https?:\/\/[^/]+\/?$/.test(u)) return "home";
  return "other";
}

const PRIORITY = ["home", "about", "product", "pricing", "blog"];
function rankLinks(domain: string, links: string[]): string[] {
  const uniq = Array.from(new Set([domain, ...links]));
  return uniq.sort((a, b) => {
    const ra = PRIORITY.indexOf(classify(a));
    const rb = PRIORITY.indexOf(classify(b));
    return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
  });
}
