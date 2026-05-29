/**
 * Adapter wiring. Each capability resolves to a LIVE provider when its key is
 * present (or explicitly selected), otherwise falls back to the FIXTURE so the
 * pipeline always runs. The renderer defaults to Satori (no browser).
 */
import type { Adapters } from "./adapters/interfaces.js";
import {
  FixtureImageGen,
  FixtureLLM,
  FixtureScraper,
  FixtureSocial,
} from "./adapters/fixtures/index.js";
import { AnthropicLLM } from "./adapters/llm/anthropic.js";
import { FirecrawlScraper } from "./adapters/scraper/firecrawl.js";
import { ApifySocial } from "./adapters/social/apify.js";
import { FalImageGen } from "./adapters/imagegen/fal.js";
import { IdeogramImageGen } from "./adapters/imagegen/ideogram.js";
import { SatoriRenderer } from "./adapters/renderer/satori.js";
import { log } from "./util/logger.js";

function sel(envVar: string): string {
  return (process.env[envVar] || "auto").toLowerCase();
}
const has = (k: string) => Boolean(process.env[k]);

export function buildAdapters(): Adapters {
  // LLM
  const llmSel = sel("POSTCRAFT_LLM");
  const llm =
    llmSel === "anthropic" || (llmSel === "auto" && has("ANTHROPIC_API_KEY"))
      ? new AnthropicLLM()
      : new FixtureLLM();

  // Scraper
  const scSel = sel("POSTCRAFT_SCRAPER");
  const scraper =
    scSel === "firecrawl" || (scSel === "auto" && has("FIRECRAWL_API_KEY"))
      ? new FirecrawlScraper()
      : new FixtureScraper();

  // Social
  const soSel = sel("POSTCRAFT_SOCIAL");
  const social =
    soSel === "apify" || (soSel === "auto" && has("APIFY_TOKEN"))
      ? new ApifySocial()
      : new FixtureSocial();

  // Image generation
  const imSel = sel("POSTCRAFT_IMAGEGEN");
  let imagegen;
  if (imSel === "ideogram" || (imSel === "auto" && has("IDEOGRAM_API_KEY"))) {
    imagegen = new IdeogramImageGen();
  } else if (imSel === "fal" || (imSel === "auto" && has("FAL_KEY"))) {
    imagegen = new FalImageGen();
  } else {
    imagegen = new FixtureImageGen();
  }

  // Renderer
  const renderer = new SatoriRenderer();

  log.info(
    `adapters → llm:${llm.name} · scraper:${scraper.name} · social:${social.name} · imagegen:${imagegen.name} · renderer:${renderer.name}`,
  );
  return { llm, scraper, social, imagegen, renderer };
}
