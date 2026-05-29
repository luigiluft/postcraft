/**
 * Stage 1 — HARVEST. Collect the company's full public footprint into the
 * normalized CompanyFootprint. Every adapter maps INTO this shape so the rest
 * of the engine never touches a raw provider response.
 */
import { z } from "zod";
import type { Adapters } from "../adapters/interfaces.js";
import {
  type BrandInput,
  type BrandKit,
  type CompanyFootprint,
  CompanyFootprintSchema,
  type ScrapedPage,
  type SocialProfile,
} from "../types.js";
import { nowISO } from "../util/ids.js";
import { log } from "../util/logger.js";

const SiteFactsSchema = z.object({
  summary: z.string(),
  products: z.array(z.string()),
  valueProps: z.array(z.string()),
});

function normUrl(domain: string): string {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

function handleOf(v?: string): string | undefined {
  if (!v) return undefined;
  const h = v
    .replace(/^@/, "")
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/\/.*$/, "")
    .trim();
  return h || undefined;
}

export async function harvest(
  brand: BrandInput,
  a: Adapters,
): Promise<CompanyFootprint> {
  log.step("HARVEST — collecting the company footprint");

  // 1. Site crawl + brand kit
  let pages: ScrapedPage[] = [];
  let brandKit: BrandKit = {
    colors: [],
    fonts: [],
    imagery: [],
    visualLanguage: "",
  };
  if (brand.domain) {
    const url = normUrl(brand.domain);
    log.info(`crawling ${url}`);
    pages = await a.scraper
      .crawl(url, { limit: 8 })
      .catch((e) => (log.warn("crawl failed:", String(e)), []));
    brandKit = await a.scraper
      .brandKit(url)
      .catch((e) => (log.warn("brandKit failed:", String(e)), brandKit));
    log.info(`→ ${pages.length} pages, ${brandKit.colors.length} brand colors`);
  } else {
    log.warn("no domain — skipping site crawl");
  }

  // 2. Site facts (light LLM extraction over crawled markdown)
  let site = {
    pages,
    summary: "",
    products: [] as string[],
    valueProps: [] as string[],
  };
  if (pages.length) {
    const corpus = pages
      .map((p) => `## ${p.title}\n${p.markdown.slice(0, 1500)}`)
      .join("\n\n")
      .slice(0, 12000);
    const facts = await a.llm
      .completeJSON({
        schema: SiteFactsSchema,
        schemaName: "SiteFacts",
        system:
          "Extract crisp, factual company facts from website markdown. Do not invent.",
        prompt: `Company: ${brand.name}\n\nWebsite content:\n${corpus}\n\nReturn {summary (2-3 sentences), products[], valueProps[]}.`,
        maxTokens: 800,
      })
      .catch(
        (e) => (
          log.warn("site facts failed:", String(e)),
          { summary: "", products: [], valueProps: [] }
        ),
      );
    site = { pages, ...facts };
  }

  // 3. News / recent signals
  log.info("searching news & signals");
  const news = await a.scraper
    .search(`${brand.name} ${brand.domain ?? ""}`.trim(), { limit: 8 })
    .catch(() => []);

  // 4. Owned + competitor social
  const social: SocialProfile[] = [];
  const owned: Array<[string, string | undefined]> = [
    ["instagram", brand.instagram],
    ["linkedin", brand.linkedin],
    ["tiktok", brand.tiktok],
  ];
  for (const [platform, raw] of owned) {
    const handle = handleOf(raw);
    if (!handle) continue;
    log.info(`fetching ${platform} @${handle}`);
    const prof = await a.social
      .fetchProfile(platform, handle, { limit: 12 })
      .catch((e) => (log.warn(`${platform} failed:`, String(e)), null));
    if (prof) social.push(prof);
  }
  for (const c of brand.competitors.slice(0, 3)) {
    const handle = handleOf(c);
    if (!handle || handle.includes(".")) continue; // domains aren't IG handles
    const prof = await a.social
      .fetchProfile("instagram", handle, { limit: 8 })
      .catch(() => null);
    if (prof) social.push(prof);
  }

  return CompanyFootprintSchema.parse({
    brand,
    site,
    news,
    social,
    brandKit,
    collectedAt: nowISO(),
  });
}
