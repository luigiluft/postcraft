/** Postcraft — public library surface. */
export * from "./types.js";
export * from "./adapters/interfaces.js";
export { buildAdapters } from "./config.js";
export { run, type RunOptions } from "./pipeline/index.js";
export { harvest } from "./pipeline/harvest.js";
export { understand } from "./pipeline/understand.js";
export { research } from "./pipeline/research.js";
export {
  generateConcepts,
  generateCarousel,
} from "./pipeline/generate.js";
export { renderKit } from "./pipeline/render.js";
export {
  ARCHETYPES,
  RECIPES,
  describeGrammarForPrompt,
} from "./carousel/grammar.js";
export { SatoriRenderer } from "./adapters/renderer/satori.js";
export {
  FixtureLLM,
  FixtureScraper,
  FixtureSocial,
  FixtureImageGen,
} from "./adapters/fixtures/index.js";
export { NIMBUS_BRAND } from "./adapters/fixtures/data.js";
