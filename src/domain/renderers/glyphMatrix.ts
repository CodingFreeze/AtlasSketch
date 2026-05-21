import {
  artifactTitle,
  createRng,
  escapeHtml,
  metric,
  renderShell,
  safeNumber,
} from "./shared";
import type { ArtifactRenderer } from "./types";

const GLYPHS = ["+", "x", "::", "[]", "<>", "||", "/\\", "--", "o", "#"] as const;

export const glyphMatrixRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:glyph-matrix:${variant}`);
  const safeVariant = safeNumber(variant, 0, 0, 999);
  const title = artifactTitle(seed, variant, "Glyph Matrix");
  const cells = Array.from({ length: 96 }, (_, index) => {
    const active = rng.next() > 0.34;
    const rare = index % Math.max(5, 14 - (safeVariant % 6)) === 0;
    const glyph = escapeHtml(rng.pick(GLYPHS));

    return `<span class="${active ? "active" : ""} ${rare ? "rare" : ""}"><b>${glyph}</b><i>${index.toString().padStart(2, "0")}</i></span>`;
  }).join("");
  const radialTicks = Array.from({ length: 24 }, (_, index) => {
    const angle = index * 15 + rng.int(-3, 3);
    return `<line x1="50" y1="9" x2="50" y2="${13 + rng.int(0, 7)}" transform="rotate(${angle} 50 50)" />`;
  }).join("");
  const syntaxRows = seed.motifs
    .concat(seed.tags)
    .slice(0, 7)
    .map((item, index) => {
      const load = safeNumber(metric(seed, index % 2 === 0 ? "mutation" : "density", variant) + rng.int(-10, 9), 50, 0, 100);
      return `<li><span>${escapeHtml(item)}</span><b>${load}%</b></li>`;
    })
    .join("");

  return {
    family: "glyph-matrix",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "glyph-matrix",
      body: `<section class="frame glyph-panel">
        <div class="matrix">${cells}</div>
        <aside>
          <span class="label">Syntax Interruptions</span>
          <svg viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(title)} radial syntax ticks">
            <g>${radialTicks}</g>
            <circle cx="50" cy="50" r="28" />
            <circle class="core" cx="50" cy="50" r="${7 + (safeVariant % 5)}" />
          </svg>
          <ol>${syntaxRows}</ol>
        </aside>
      </section>`,
      extraCss: `
        .glyph-panel { display:grid; grid-template-columns:1fr 300px; min-height:520px; }
        .matrix { padding:20px; display:grid; grid-template-columns:repeat(12, minmax(24px, 1fr)); gap:7px; align-content:center; }
        .matrix span { aspect-ratio:1; border:1px solid var(--line); background:rgba(244,232,205,.035); color:var(--muted); display:grid; place-items:center; position:relative; overflow:hidden; }
        .matrix span.active { color:var(--text); border-color:rgba(244,232,205,.28); background:rgba(244,232,205,.07); }
        .matrix span.rare { color:var(--warning); border-color:var(--warning); box-shadow:0 0 18px rgba(255,79,216,.12); }
        .matrix b { font-size:13px; font-weight:600; }
        .matrix i { position:absolute; right:3px; bottom:2px; color:rgba(244,232,205,.34); font-size:7px; font-style:normal; }
        aside { border-left:1px solid var(--line); padding:18px; display:grid; align-content:center; gap:16px; }
        svg { width:100%; min-height:220px; }
        svg line { stroke:var(--secondary); stroke-width:.55; opacity:.68; }
        svg circle { fill:none; stroke:var(--primary); stroke-width:.45; stroke-dasharray:2 2; }
        svg .core { fill:rgba(255,79,216,.12); stroke:var(--warning); stroke-dasharray:none; }
        ol { list-style:none; margin:0; padding:0; display:grid; gap:9px; }
        li { display:flex; justify-content:space-between; gap:14px; border-bottom:1px solid var(--line); padding-bottom:8px; color:var(--muted); text-transform:uppercase; font-size:11px; }
        li b { color:var(--primary); font-weight:500; }
      `,
    }),
  };
};
