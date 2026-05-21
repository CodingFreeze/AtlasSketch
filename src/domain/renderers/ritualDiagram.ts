import {
  artifactTitle,
  createRng,
  escapeHtml,
  renderShell,
  safeNumber,
} from "./shared";
import type { ArtifactRenderer } from "./types";

export const ritualDiagramRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:ritual-diagram:${variant}`);
  const safeVariant = safeNumber(variant, 0, 0, 999);
  const title = artifactTitle(seed, variant, "Ritual Diagram");
  const rings = Array.from({ length: 5 }, (_, index) => {
    const radius = 16 + index * 8 + rng.int(0, 3);
    return `<circle cx="50" cy="50" r="${radius}" />`;
  }).join("");
  const spokes = Array.from({ length: 16 }, (_, index) => {
    const angle = (index * 360) / 16 + rng.int(-4, 4);
    return `<line x1="50" y1="50" x2="50" y2="8" transform="rotate(${angle} 50 50)" />`;
  }).join("");
  const annotations = seed.motifs
    .concat(seed.tags)
    .slice(0, 6)
    .map((item, index) => `<li><b>${(index + 1).toString().padStart(2, "0")}</b>${escapeHtml(item)}</li>`)
    .join("");

  return {
    family: "ritual-diagram",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "ritual-diagram",
      body: `<section class="frame diagram">
        <svg viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(title)} radial ritual diagram">
          <g class="rings">${rings}</g>
          <g class="spokes">${spokes}</g>
          <polygon class="core" points="50,24 73,50 50,76 27,50" />
          <circle class="dot" cx="50" cy="50" r="${5 + (safeVariant % 4)}" />
        </svg>
        <aside>
          <span class="label">Syntax Litany</span>
          <ol>${annotations}</ol>
          <p>${escapeHtml(seed.prompt)}</p>
        </aside>
      </section>`,
      extraCss: `
        .diagram { display:grid; grid-template-columns:1fr 320px; min-height:520px; }
        svg { width:100%; height:100%; min-height:520px; padding:30px; }
        .rings circle { fill:none; stroke:var(--primary); stroke-width:.45; opacity:.75; }
        .spokes line { stroke:var(--secondary); stroke-width:.28; opacity:.45; }
        .core { fill:rgba(184,255,106,.08); stroke:var(--warning); stroke-width:.65; }
        .dot { fill:var(--primary); stroke:var(--bg); stroke-width:1.2; }
        aside { border-left:1px solid var(--line); padding:18px; display:grid; align-content:center; gap:18px; }
        ol { list-style:none; margin:0; padding:0; display:grid; gap:9px; }
        li { display:flex; justify-content:space-between; gap:16px; border-bottom:1px solid var(--line); padding-bottom:8px; color:var(--muted); text-transform:uppercase; font-size:11px; }
        li b { color:var(--primary); font-weight:500; }
        p { color:var(--text); font-size:13px; line-height:1.55; margin:0; }
      `,
    }),
  };
};
