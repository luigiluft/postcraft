import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARCHETYPES,
  describeGrammarForPrompt,
  getRecipe,
  missingSlots,
  RECIPE_IDS,
} from "../src/carousel/grammar.js";

test("missingSlots flags required slots only", () => {
  assert.deepEqual(missingSlots("stat", { number: "12%", desc: "x" }), []);
  assert.ok(missingSlots("stat", {}).includes("number"));
  assert.deepEqual(missingSlots("cover", { title: "x" }), []);
  assert.ok(missingSlots("nope", {})[0]?.includes("unknown"));
});

test("every recipe references real archetypes", () => {
  for (const id of RECIPE_IDS) {
    const r = getRecipe(id);
    assert.ok(r, `recipe ${id} missing`);
    for (const a of r.sequence) {
      assert.ok(ARCHETYPES[a], `recipe ${id} uses unknown archetype ${a}`);
    }
  }
});

test("grammar prompt advertises archetypes and recipes", () => {
  const s = describeGrammarForPrompt();
  assert.ok(s.includes("cover"));
  assert.ok(s.includes("stat"));
  assert.ok(s.includes("thesis"));
});
