import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

function extFor(url: string, contentType: string): string {
  const ct = contentType.toLowerCase();
  const u = url.toLowerCase();
  if (ct.includes("svg") || u.endsWith(".svg")) return ".svg";
  if (ct.includes("jpeg") || /\.jpe?g(\?|$)/.test(u)) return ".jpg";
  if (ct.includes("webp") || u.endsWith(".webp")) return ".webp";
  return ".png";
}

/** Download an image URL to destDir/<baseName><ext>. Returns the path or undefined. */
export async function downloadImage(
  url: string,
  destDir: string,
  baseName: string,
): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(
      destDir,
      `${baseName}${extFor(url, res.headers.get("content-type") ?? "")}`,
    );
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return dest;
  } catch {
    return undefined;
  }
}

/** Ensure a logo is a PNG the renderer can composite — rasterizes SVG via resvg. */
export function ensurePng(file: string): string {
  if (!file.toLowerCase().endsWith(".svg")) return file;
  const png = file.replace(/\.svg$/i, ".png");
  try {
    const svg = fs.readFileSync(file, "utf8");
    const out = new Resvg(svg, {
      fitTo: { mode: "width", value: 320 },
    })
      .render()
      .asPng();
    fs.writeFileSync(png, out);
    return png;
  } catch {
    return file;
  }
}
