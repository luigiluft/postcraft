/**
 * Fixture adapters — make the entire pipeline runnable with ZERO keys.
 * They return the coherent Nimbus demo dataset (see data.ts) and synthesize
 * real gradient backgrounds, so `npm run demo` produces actual carousel PNGs.
 */
import fs from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import type { z } from "zod";
import {
  type BrandKit,
  type ImageBrief,
  type NewsItem,
  type ScrapedPage,
  type SocialProfile,
} from "../../types.js";
import type {
  ImageGenAdapter,
  LLMAdapter,
  LLMCompleteOpts,
  LLMJSONOpts,
  ScraperAdapter,
  SocialAdapter,
} from "../interfaces.js";
import {
  buildFixtureCarousel,
  FIXTURE_CONCEPTS,
  FIXTURE_INTEL,
  FIXTURE_PLAYBOOK,
  FIXTURE_SITE_FACTS,
} from "./data.js";

export class FixtureScraper implements ScraperAdapter {
  readonly name = "fixture-scraper";

  async scrape(url: string): Promise<ScrapedPage> {
    return {
      url,
      title: "Nimbus Logística",
      kind: "home",
      markdown:
        "# Nimbus Logística\nOperamos o e-commerce de marcas D2C de ponta a ponta. Você foca em marca e produto; a gente cuida de estoque, frete, SAC e reversa — com a sua marca 100% na frente.",
    };
  }

  async crawl(domain: string): Promise<ScrapedPage[]> {
    return [
      await this.scrape(domain),
      {
        url: `${domain}/sobre`,
        title: "Sobre",
        kind: "about",
        markdown:
          "A Nimbus nasceu para tirar a logística do caminho do crescimento de marcas D2C. Volume agregado, operação previsível, marca do cliente na frente.",
      },
      {
        url: `${domain}/fullcommerce`,
        title: "Fullcommerce",
        kind: "product",
        markdown:
          "Fullcommerce: operação completa de e-commerce. Estoque, picking, frete agregado, SAC e logística reversa num contrato só.",
      },
    ];
  }

  async search(query: string): Promise<NewsItem[]> {
    return [
      {
        title: "E-commerce D2C cresce e pressiona operação logística no Brasil",
        source: "Mercado&Consumo",
        date: "2026-04",
        snippet:
          "Marcas que escalam vendas enfrentam gargalos de fulfillment e custo de frete.",
      },
      {
        title: "Frete grátis segue como principal alavanca — e dor de margem",
        source: "E-Commerce Brasil",
        date: "2026-03",
        snippet: "Estudo aponta frete como item que mais corrói a margem D2C.",
      },
    ];
  }

  async brandKit(): Promise<BrandKit> {
    return {
      colors: ["#101418", "#E8643C", "#F4F1EA", "#8A8F98"],
      fonts: ["Fraunces", "Inter"],
      imagery: ["editorial still-life", "operação real com pessoas"],
      visualLanguage: "editorial escuro com acento quente, muito respiro",
    };
  }
}

export class FixtureSocial implements SocialAdapter {
  readonly name = "fixture-social";

  async fetchProfile(
    platform: string,
    handle: string,
  ): Promise<SocialProfile | null> {
    return {
      platform,
      handle,
      followers: 8400,
      bio: "Operação de e-commerce para marcas D2C. A sua marca na frente.",
      topThemes: ["frete", "operação", "margem", "casos"],
      avgEngagement: 0.031,
      posts: [
        {
          platform,
          caption: "A conta do frete grátis sai do seu bolso.",
          likes: 312,
          comments: 28,
          mediaType: "carousel",
          themes: ["frete", "margem"],
        },
        {
          platform,
          caption: "Do contrato ao primeiro pedido: 21 dias.",
          likes: 204,
          comments: 12,
          mediaType: "image",
          themes: ["operação", "casos"],
        },
      ],
    };
  }
}

export class FixtureLLM implements LLMAdapter {
  readonly name = "fixture-llm";

  async complete(opts: LLMCompleteOpts): Promise<string> {
    return `[fixture] ${opts.prompt.slice(0, 80)}`;
  }

  async completeJSON<S extends z.ZodTypeAny>(
    opts: LLMJSONOpts<S>,
  ): Promise<z.infer<S>> {
    const data = this.canned(opts.schemaName ?? "", opts.prompt);
    // Validate against the real schema — guarantees fixture authoring is correct.
    return opts.schema.parse(data);
  }

  private canned(schemaName: string, prompt: string): unknown {
    switch (schemaName) {
      case "SiteFacts":
        return FIXTURE_SITE_FACTS;
      case "BrandIntelligence":
        return FIXTURE_INTEL;
      case "VisualPlaybook":
        return FIXTURE_PLAYBOOK;
      case "PostConcepts":
        return FIXTURE_CONCEPTS;
      case "CarouselSpec":
        return buildFixtureCarousel(prompt);
      default:
        throw new Error(
          `FixtureLLM has no canned response for schema "${schemaName}". ` +
            `Set a real LLM provider (ANTHROPIC_API_KEY) for non-demo brands.`,
        );
    }
  }
}

export class FixtureImageGen implements ImageGenAdapter {
  readonly name = "fixture-imagegen";

  async generate(brief: ImageBrief, outPath: string): Promise<{ path: string }> {
    const svg = gradientSvg(brief.palette);
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: 1080 },
    })
      .render()
      .asPng();
    fs.writeFileSync(outPath, png);
    return { path: outPath };
  }
}

function gradientSvg(palette: string[]): string {
  const bg = palette[0] ?? "#101418";
  const accent = palette[1] ?? "#E8643C";
  const ink = palette[2] ?? "#1A1F26";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${ink}"/>
    </linearGradient>
    <radialGradient id="a" cx="72%" cy="28%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#g)"/>
  <rect width="1080" height="1350" fill="url(#a)"/>
  <circle cx="200" cy="1120" r="380" fill="${accent}" opacity="0.06"/>
</svg>`;
}
