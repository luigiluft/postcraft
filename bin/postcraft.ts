import "dotenv/config";
import fs from "node:fs";
import { Command } from "commander";
import { buildAdapters } from "../src/config.js";
import { run } from "../src/pipeline/index.js";
import { BrandInputSchema } from "../src/types.js";
import { log } from "../src/util/logger.js";

const program = new Command();
program
  .name("postcraft")
  .description(
    "Turn a company's public footprint into ICP-targeted carousels + images.",
  )
  .version("0.1.0");

program
  .command("run")
  .description("Run the full pipeline for one brand")
  .option("--brief <file>", "JSON brand brief (flags override its fields)")
  .option("--name <name>", "company name")
  .option("--domain <domain>", "company domain")
  .option("--instagram <handle>", "instagram handle")
  .option("--linkedin <handle>", "linkedin company slug")
  .option("--competitors <list>", "comma-separated handles/domains")
  .option("--goals <list>", "comma-separated goals")
  .option("--locale <locale>", "pt-BR | en-US | es-ES")
  .option("--concepts <n>", "how many concepts to ideate", "6")
  .option("--kits <n>", "how many to render into full kits", "2")
  .option("--out <dir>", "output directory")
  .action(async (o) => {
    const raw = o.brief
      ? JSON.parse(fs.readFileSync(o.brief, "utf8"))
      : {};
    const list = (v?: string, fb?: string[]) =>
      v ? v.split(",").map((s) => s.trim()).filter(Boolean) : (fb ?? []);
    const brand = BrandInputSchema.parse({
      name: o.name ?? raw.name,
      domain: o.domain ?? raw.domain,
      instagram: o.instagram ?? raw.instagram,
      linkedin: o.linkedin ?? raw.linkedin,
      tiktok: raw.tiktok,
      competitors: list(o.competitors, raw.competitors),
      goals: list(o.goals, raw.goals),
      locale: o.locale ?? raw.locale ?? "pt-BR",
      notes: raw.notes,
    });

    const adapters = buildAdapters();
    const res = await run(brand, adapters, {
      concepts: Number(o.concepts),
      kits: Number(o.kits),
      outDir: o.out,
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          brand: res.brand.name,
          icps: res.intelligence.icps.map((i) => i.label),
          pillars: res.intelligence.pillars.map((p) => p.name),
          concepts: res.concepts.length,
          kits: res.kits.map((k) => ({
            concept: k.concept.id,
            slides: k.slides.map((s) => s.pngPath),
          })),
        },
        null,
        2,
      ),
    );
  });

program.parseAsync(process.argv).catch((e) => {
  log.error(String(e?.stack ?? e));
  process.exit(1);
});
