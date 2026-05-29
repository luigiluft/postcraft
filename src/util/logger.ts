import pc from "picocolors";

type Level = "debug" | "info" | "warn" | "error";
const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const current = (process.env.POSTCRAFT_LOG as Level) || "info";
const should = (l: Level) => order[l] >= order[current];

// All logs go to stderr so stdout stays clean for piped JSON output.
export const log = {
  debug: (...a: unknown[]) =>
    should("debug") && console.error(pc.gray("  ·"), ...a),
  info: (...a: unknown[]) =>
    should("info") && console.error(pc.cyan("  ▸"), ...a),
  warn: (...a: unknown[]) =>
    should("warn") && console.error(pc.yellow("  !"), ...a),
  error: (...a: unknown[]) =>
    should("error") && console.error(pc.red("  ✗"), ...a),
  step: (name: string) =>
    console.error(pc.bold(pc.magenta(`\n◆ ${name}`))),
};
