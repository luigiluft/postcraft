import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { NIMBUS_BRAND } from "../src/adapters/fixtures/data.js";
import {
  FixtureImageGen,
  FixtureLLM,
  FixtureScraper,
  FixtureSocial,
} from "../src/adapters/fixtures/index.js";
import type { Adapters } from "../src/adapters/interfaces.js";
import { SatoriRenderer } from "../src/adapters/renderer/satori.js";
import { run } from "../src/pipeline/index.js";

test(
  "fixture pipeline renders a content kit end-to-end",
  { timeout: 120_000 },
  async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "postcraft-"));
    const adapters: Adapters = {
      llm: new FixtureLLM(),
      scraper: new FixtureScraper(),
      social: new FixtureSocial(),
      imagegen: new FixtureImageGen(),
      renderer: new SatoriRenderer(),
    };

    const res = await run(NIMBUS_BRAND, adapters, {
      concepts: 3,
      kits: 1,
      outDir,
    });

    assert.equal(res.kits.length, 1);
    const kit = res.kits[0]!;
    assert.ok(kit.slides.length >= 5, "expected >=5 slides");
    for (const s of kit.slides) {
      assert.ok(fs.existsSync(s.pngPath), `missing render ${s.pngPath}`);
      assert.ok(fs.statSync(s.pngPath).size > 1000, "png looks empty");
    }

    // Proof discipline: every proof asset is classified (no unclassified claims).
    for (const a of res.intelligence.proofAssets) {
      assert.ok(
        ["public-verifiable", "internal-anonymized", "fictional"].includes(
          a.class,
        ),
      );
    }
    // ICP + pillars present (the "editable ICP graph" wedge).
    assert.ok(res.intelligence.icps.length >= 1);
    assert.ok(res.intelligence.pillars.length >= 1);

    fs.rmSync(outDir, { recursive: true, force: true });
  },
);
