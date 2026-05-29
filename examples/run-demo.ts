/**
 * End-to-end demo with ZERO keys: fixture adapters + the real Satori renderer.
 * Produces actual carousel PNGs for the Nimbus demo brand under runs/.
 *
 *   npm run demo
 */
import "dotenv/config";
import {
  FixtureImageGen,
  FixtureLLM,
  FixtureScraper,
  FixtureSocial,
} from "../src/adapters/fixtures/index.js";
import { NIMBUS_BRAND } from "../src/adapters/fixtures/data.js";
import { SatoriRenderer } from "../src/adapters/renderer/satori.js";
import type { Adapters } from "../src/adapters/interfaces.js";
import { run } from "../src/pipeline/index.js";

const adapters: Adapters = {
  llm: new FixtureLLM(),
  scraper: new FixtureScraper(),
  social: new FixtureSocial(),
  imagegen: new FixtureImageGen(),
  renderer: new SatoriRenderer(),
};

const res = await run(NIMBUS_BRAND, adapters, {
  concepts: 6,
  kits: 2,
  outDir: "runs",
});

console.log(`\n✅ ${res.kits.length} content kits rendered:`);
for (const kit of res.kits) {
  console.log(`\n  ▸ ${kit.concept.id}`);
  for (const s of kit.slides) console.log(`     ${s.pngPath}`);
}
