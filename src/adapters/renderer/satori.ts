/**
 * Satori renderer — the deterministic "text" layer of the hybrid pipeline.
 * AI generates the background texture (no text); this composes legible,
 * brand-consistent typography on top and rasterizes to 1080×1350 PNG via
 * resvg. No headless browser, so it runs anywhere (incl. serverless).
 *
 * Each archetype has its own layout — never one template stamped N times.
 * Emphasis markers honoured: {word} → accent+underline, | → hard line break.
 */
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import type {
  CarouselSpec,
  DesignTokens,
  RenderedSlide,
  Slide,
} from "../../types.js";
import { log } from "../../util/logger.js";
import type { RendererAdapter } from "../interfaces.js";
import { loadFonts } from "./fonts.js";

const W = 1080;
const H = 1350;
const PAD = 84;

type Palette = DesignTokens["palette"];

export class SatoriRenderer implements RendererAdapter {
  readonly name = "satori-renderer";

  async renderCarousel(
    spec: CarouselSpec,
    opts: { assetsDir?: string; outDir: string; brandName?: string },
  ): Promise<RenderedSlide[]> {
    const fonts = await loadFonts();
    fs.mkdirSync(opts.outDir, { recursive: true });
    const out: RenderedSlide[] = [];
    const total = spec.slides.length;

    for (const slide of spec.slides) {
      const bgPath = opts.assetsDir
        ? path.join(opts.assetsDir, `bg-${slide.n}.png`)
        : undefined;
      const hasBg = Boolean(bgPath && fs.existsSync(bgPath));

      const raw = frame(
        slide,
        spec,
        total,
        hasBg,
        opts.brandName ?? "",
        spec.designTokens,
      );
      // Collapse whitespace BETWEEN tags so satori-html doesn't create stray
      // text-node children, then guarantee every empty <div></div> carries
      // display:flex (satori-html mis-parses truly-empty divs).
      const cleaned = fixEmptyDivs(raw.replace(/>\s+</g, "><"));
      if (process.env.POSTCRAFT_DEBUG_MARKUP) {
        fs.writeFileSync(
          path.join(opts.outDir, `_markup-${slide.n}.html`),
          cleaned,
        );
      }

      // Satori renders ONLY the text + scrim layer over a TRANSPARENT canvas.
      // Passing a full-size PNG to satori is pathologically slow, so the
      // background is composited by resvg (Rust, fast) instead: inject the
      // image as the first child of the SVG, behind everything satori drew.
      let svg = await satori(html(cleaned), { width: W, height: H, fonts });
      if (hasBg && bgPath) {
        const image = `<image href="${toDataUri(bgPath)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
        svg = svg.replace(/(<svg[^>]*?>)/, `$1${image}`);
      }
      const png = new Resvg(svg, { fitTo: { mode: "width", value: W } })
        .render()
        .asPng();

      const pngPath = path.join(opts.outDir, `slide-${slide.n}.png`);
      fs.writeFileSync(pngPath, png);
      out.push({ n: slide.n, archetype: slide.archetype, pngPath });
    }
    log.debug(`rendered ${out.length} slides`);
    return out;
  }
}

// ── Frame ────────────────────────────────────────────────────────────────

function frame(
  slide: Slide,
  spec: CarouselSpec,
  total: number,
  hasBg: boolean,
  brandName: string,
  t: DesignTokens,
): string {
  const p = t.palette;
  const kicker =
    str(slide.fields.kicker) || (slide.n === 1 ? spec.title : "");
  // When a background image exists it is composited by resvg BEHIND this SVG,
  // so the root must stay transparent. Otherwise paint a branded gradient.
  const rootBg = hasBg
    ? ""
    : `background-image:linear-gradient(140deg, ${p.bg} 0%, ${p.surface ?? p.bg} 100%);`;
  // Scrim darkens a photo for legibility (only needed over an image).
  // NOTE: satori-html mis-parses truly-empty <div></div>; empty decorative
  // divs must carry display:flex (also enforced globally by fixEmptyDivs).
  const scrim = hasBg
    ? `<div style="display:flex;position:absolute;top:0;left:0;width:${W}px;height:${H}px;background-image:linear-gradient(180deg, ${hexA(
        p.bg,
        0.35,
      )} 0%, ${hexA(p.bg, 0.85)} 100%)"></div>`
    : "";

  return `<div style="display:flex;flex-direction:column;width:${W}px;height:${H}px;position:relative;${rootBg}color:${p.ink};font-family:Body">
  ${scrim}
  <div style="display:flex;flex-direction:column;width:${W}px;height:${H}px;padding:${PAD}px;position:relative">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:24px;font-weight:600;letter-spacing:3px;color:${p.muted};text-transform:uppercase">${esc(
        kicker.slice(0, 40),
      )}</div>
      <div style="font-size:24px;font-weight:700;letter-spacing:1px;color:${p.ink}">${esc(
        brandName,
      )}</div>
    </div>
    <div style="display:flex;flex-direction:column;flex:1;justify-content:center">
      ${body(slide, p)}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div style="display:flex;align-items:center;font-size:22px;color:${p.muted}">
        <div style="display:flex;width:28px;height:4px;background-color:${p.accent};margin-right:14px"></div>
        <div>${slide.n} / ${total}</div>
      </div>
      <div style="font-size:22px;color:${p.muted}">${esc(
        slide.n === total ? str(spec.cta.meta) : "@" + slugHandle(brandName),
      )}</div>
    </div>
  </div>
</div>`;
}

// ── Archetype bodies ─────────────────────────────────────────────────────

function body(slide: Slide, p: Palette): string {
  const f = slide.fields;
  switch (slide.archetype) {
    case "cover":
      return col([
        multiline(str(f.title), p.accent, p.ink, {
          size: 96,
          weight: 600,
          family: "Display",
          lh: 1.02,
        }),
        f.subtitle
          ? `<div style="display:flex;flex-wrap:wrap;align-items:baseline;margin-top:28px;font-size:34px;color:${p.muted};max-width:880px">${inline(
              str(f.subtitle),
              p.accent,
            )}</div>`
          : "",
      ]);

    case "mirror":
      return col([
        multiline(str(f.punchline), p.accent, p.ink, {
          size: 70,
          weight: 600,
          family: "Display",
          lh: 1.08,
        }),
        f.aside
          ? `<div style="display:flex;flex-wrap:wrap;align-items:baseline;margin-top:28px;font-size:30px;font-style:italic;color:${p.muted}">${inline(
              str(f.aside),
              p.accent,
            )}</div>`
          : "",
      ]);

    case "context":
      return col([
        eyebrow(str(f.title), p.accent),
        multiline(str(f.body), p.accent, p.ink, {
          size: 48,
          weight: 400,
          family: "Display",
          lh: 1.18,
          mt: 24,
        }),
      ]);

    case "list":
      return col([
        eyebrow(str(f.title), p.accent),
        `<div style="display:flex;flex-direction:column;margin-top:32px">${arr(
          f.items,
        )
          .map((it) => listRow(it, p))
          .join("")}</div>`,
      ]);

    case "stat":
      return col([
        f.label ? eyebrow(str(f.label), p.muted) : "",
        `<div style="display:flex;font-family:Display;font-weight:600;font-size:220px;line-height:0.95;color:${p.accent};margin:8px 0">${esc(
          str(f.number),
        )}</div>`,
        multiline(str(f.desc), p.accent, p.ink, {
          size: 44,
          weight: 400,
          family: "Body",
          lh: 1.12,
        }),
        f.sub
          ? `<div style="display:flex;flex-wrap:wrap;align-items:baseline;margin-top:22px;font-size:26px;color:${p.muted}">${inline(
              str(f.sub),
              p.accent,
            )}</div>`
          : "",
      ]);

    case "step":
      return col([
        f.index
          ? `<div style="display:flex;font-family:Display;font-weight:600;font-size:64px;color:${p.accent}">${esc(
              str(f.index),
            )}</div>`
          : "",
        multiline(str(f.title), p.accent, p.ink, {
          size: 54,
          weight: 600,
          family: "Display",
          lh: 1.08,
          mt: 12,
        }),
        multiline(str(f.body), p.accent, p.muted, {
          size: 34,
          weight: 400,
          family: "Body",
          lh: 1.2,
          mt: 20,
        }),
      ]);

    case "comparison":
      return col([
        eyebrow(str(f.title), p.accent),
        `<div style="display:flex;margin-top:32px;gap:32px">
          ${compCol(str(f.leftLabel), arr(f.leftPoints), p, p.muted)}
          ${compCol(str(f.rightLabel), arr(f.rightPoints), p, p.accent)}
        </div>`,
      ]);

    case "quote":
      return col([
        f.lead
          ? `<div style="display:flex;flex-wrap:wrap;align-items:baseline;font-size:28px;color:${p.muted};margin-bottom:20px">${inline(
              str(f.lead),
              p.accent,
            )}</div>`
          : "",
        multiline(str(f.quote), p.accent, p.ink, {
          size: 62,
          weight: 600,
          family: "Display",
          lh: 1.1,
        }),
        f.attribution
          ? `<div style="display:flex;margin-top:28px;font-size:26px;color:${p.muted}">— ${esc(
              str(f.attribution),
            )}</div>`
          : "",
      ]);

    case "takeaway":
      return col([
        eyebrow(str(f.title), p.accent),
        `<div style="display:flex;flex-direction:column;margin-top:32px">${arr(
          f.points,
        )
          .map((it) => listRow(it, p))
          .join("")}</div>`,
      ]);

    case "cta":
      return col([
        multiline(str(f.question), p.accent, p.ink, {
          size: 56,
          weight: 600,
          family: "Display",
          lh: 1.1,
        }),
        `<div style="display:flex;margin-top:40px;padding:24px 36px;background-color:${p.accent};color:${p.bg};font-size:40px;font-weight:700;align-self:flex-start">${esc(
          str(f.ctaLabel).replace(/\|/g, " "),
        )}</div>`,
        f.ctaMeta
          ? `<div style="display:flex;margin-top:24px;font-size:26px;color:${p.muted}">${esc(
              str(f.ctaMeta),
            )}</div>`
          : "",
      ]);

    default:
      return multiline(
        str(f.title) || str(f.text) || slide.archetype,
        p.accent,
        p.ink,
        { size: 56, weight: 600, family: "Display", lh: 1.1 },
      );
  }
}

// ── Building blocks ──────────────────────────────────────────────────────

function col(children: string[]): string {
  return `<div style="display:flex;flex-direction:column">${children
    .filter(Boolean)
    .join("")}</div>`;
}

function eyebrow(text: string, color: string): string {
  return `<div style="display:flex;font-size:26px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${color}">${esc(
    text.replace(/[{}]/g, ""),
  )}</div>`;
}

function listRow(item: string, p: Palette): string {
  return `<div style="display:flex;align-items:flex-start;margin-bottom:22px">
    <div style="display:flex;width:18px;height:18px;background-color:${p.accent};margin-top:16px;margin-right:24px"></div>
    <div style="display:flex;flex-wrap:wrap;align-items:baseline;font-size:40px;color:${p.ink};max-width:820px">${inline(
      item,
      p.accent,
    )}</div>
  </div>`;
}

function compCol(
  label: string,
  points: string[],
  p: Palette,
  labelColor: string,
): string {
  const rows = points
    .map(
      (pt) =>
        `<div style="display:flex;flex-wrap:wrap;align-items:baseline;font-size:30px;color:${p.ink};margin-bottom:16px">${inline(
          pt,
          p.accent,
        )}</div>`,
    )
    .join("");
  return `<div style="display:flex;flex-direction:column;width:440px">
    <div style="display:flex;font-size:30px;font-weight:700;color:${labelColor};margin-bottom:24px;text-transform:uppercase;letter-spacing:1px">${esc(
      label,
    )}</div>
    ${rows}
  </div>`;
}

interface TextStyle {
  size: number;
  weight: number;
  family: "Display" | "Body";
  lh: number;
  mt?: number;
}

/** Render a possibly multi-line ('|' separated) text block as stacked lines. */
function multiline(
  text: string,
  accent: string,
  color: string,
  s: TextStyle,
): string {
  const lines = (text || "")
    .split("|")
    .map((l) => l.trim())
    .filter(Boolean);
  const inner = lines
    .map(
      (l) =>
        `<div style="display:flex;flex-wrap:wrap;align-items:baseline;font-family:${s.family};font-weight:${s.weight};font-size:${s.size}px;line-height:${s.lh};color:${color}">${inline(
          l,
          accent,
        )}</div>`,
    )
    .join("");
  return `<div style="display:flex;flex-direction:column;${
    s.mt ? `margin-top:${s.mt}px;` : ""
  }max-width:920px">${inner}</div>`;
}

/**
 * Inline emphasis: {word} -> accent + underline.
 *
 * satori trims whitespace at every flex-item boundary, so a space between an
 * emphasized run and its neighbour vanishes ("O {frete}" -> "Ofrete"). Fix:
 * render each run as a span (internal spaces survive inside one text node) and
 * insert a fixed-width, content-free spacer span wherever a boundary space
 * existed. Containers must set flex-wrap:wrap so lines can still break.
 */
function inline(text: string, accent: string): string {
  const re = /\{([^}]+)\}/g;
  const segs: Array<{ t: string; emph: boolean }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ t: text.slice(last, m.index), emph: false });
    segs.push({ t: m[1]!, emph: true });
    last = re.lastIndex;
  }
  if (last < text.length) segs.push({ t: text.slice(last), emph: false });

  const GAP = `<span style="display:flex;width:0.3em"></span>`;
  let out = "";
  let pendingGap = false;
  for (const { t, emph } of segs) {
    if (/^\s/.test(t)) pendingGap = true;
    const core = t.trim();
    if (core) {
      if (pendingGap) {
        out += GAP;
        pendingGap = false;
      }
      out += emph
        ? `<span style="color:${accent};text-decoration:underline">${esc(core)}</span>`
        : `<span>${esc(core)}</span>`;
    }
    if (/\s$/.test(t)) pendingGap = true;
  }
  return out;
}

// ── Utils ────────────────────────────────────────────────────────────────

/** satori-html mis-parses truly-empty <div></div> (inflates parent child
 * count). Guarantee every empty div carries display:flex. */
function fixEmptyDivs(markup: string): string {
  return markup.replace(/<div([^>]*)><\/div>/g, (m, attrs: string) => {
    if (/display\s*:/.test(attrs)) return m;
    if (/style="/.test(attrs)) {
      return `<div${attrs.replace('style="', 'style="display:flex;')}></div>`;
    }
    return `<div${attrs} style="display:flex"></div>`;
  });
}

function str(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ");
  return String(v);
}

function arr(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

function esc(s: string): string {
  // satori-html does NOT decode HTML entities, so emit literal-safe text:
  // neutralize only the chars that would break tag parsing.
  return s.replace(/</g, "‹").replace(/>/g, "›");
}

function toDataUri(file: string): string {
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

/** #RRGGBB + alpha → rgba(). */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}

function slugHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
