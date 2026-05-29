import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify } from "../src/util/ids.js";

test("slugify strips accents, punctuation, and spaces", () => {
  assert.equal(slugify("Nimbus Logística!"), "nimbus-logistica");
  assert.equal(slugify("  Olá   Mundo  "), "ola-mundo");
  assert.equal(slugify("R$ 12-18% / mês"), "r-12-18-mes");
});
