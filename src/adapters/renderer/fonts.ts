/**
 * Font loading for the Satori renderer. Satori needs raw font buffers; we map
 * two registered families — "Display" (serif) and "Body" (sans) — so layouts
 * use stable names regardless of the brand's nominal font tokens. Fonts are
 * fetched once from the fontsource CDN and cached under .fonts/.
 */
import fs from "node:fs";
import path from "node:path";
import { log } from "../../util/logger.js";

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
}

interface FontSpec {
  file: string;
  url: string;
  family: "Display" | "Body";
  weight: 400 | 500 | 600 | 700;
}

const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";

const SPECS: FontSpec[] = [
  // Body — Inter
  {
    file: "body-400.woff",
    url: `${CDN}/inter/files/inter-latin-400-normal.woff`,
    family: "Body",
    weight: 400,
  },
  {
    file: "body-600.woff",
    url: `${CDN}/inter/files/inter-latin-600-normal.woff`,
    family: "Body",
    weight: 600,
  },
  {
    file: "body-700.woff",
    url: `${CDN}/inter/files/inter-latin-700-normal.woff`,
    family: "Body",
    weight: 700,
  },
  // Display — Fraunces
  {
    file: "display-400.woff",
    url: `${CDN}/fraunces/files/fraunces-latin-400-normal.woff`,
    family: "Display",
    weight: 400,
  },
  {
    file: "display-600.woff",
    url: `${CDN}/fraunces/files/fraunces-latin-600-normal.woff`,
    family: "Display",
    weight: 600,
  },
];

const FONT_DIR = path.resolve(".fonts");

async function download(spec: FontSpec, dest: string): Promise<void> {
  const res = await fetch(spec.url);
  if (!res.ok) throw new Error(`font download failed (${res.status}): ${spec.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  log.debug(`fetched font ${spec.file} (${buf.length} bytes)`);
}

export async function ensureFonts(): Promise<void> {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const missing = SPECS.filter(
    (s) => !fs.existsSync(path.join(FONT_DIR, s.file)),
  );
  if (!missing.length) return;
  log.info(`fetching ${missing.length} font file(s)…`);
  await Promise.all(missing.map((s) => download(s, path.join(FONT_DIR, s.file))));
}

export async function loadFonts(): Promise<SatoriFont[]> {
  await ensureFonts();
  return SPECS.map((s) => ({
    name: s.family,
    data: fs.readFileSync(path.join(FONT_DIR, s.file)),
    weight: s.weight,
    style: "normal" as const,
  }));
}
