import { artifactTitle, color, createRng, escapeHtml, metric, renderShell } from "./shared";
import type { ArtifactRenderer } from "./types";

export const signalGraphRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:signal-graph:${variant}`);
  const title = artifactTitle(seed, variant, "Signal Graph");
  const nodes = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    x: 8 + rng.int(0, 84),
    y: 10 + rng.int(0, 76),
    size: rng.int(3, 8),
  }));
  const lines = nodes
    .slice(1)
    .map((node, index) => {
      const source = nodes[Math.max(0, index - rng.int(0, Math.min(index, 4)))];
      return `<line x1="${source.x}" y1="${source.y}" x2="${node.x}" y2="${node.y}" />`;
    })
    .join("");
  const circles = nodes
    .map(
      (node) =>
        `<circle cx="${node.x}" cy="${node.y}" r="${node.size}" data-node="${node.id}" />`,
    )
    .join("");
  const sweeps = Array.from({ length: 7 }, (_, index) => {
    const width = metric(seed, "signalNoise", variant) + index * 4;
    return `<div class="sweep"><span>${escapeHtml(seed.tags[index % seed.tags.length] ?? "signal")}</span><b style="width:${width}%"></b></div>`;
  }).join("");

  return {
    family: "signal-graph",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "signal-graph",
      body: `<section class="frame graph-grid">
        <aside class="readout">
          <span class="label">Carrier Recipe</span>
          <strong>${escapeHtml(seed.prompt)}</strong>
          ${sweeps}
        </aside>
        <svg viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(title)} signal graph">
          <g class="edges">${lines}</g>
          <g class="nodes">${circles}</g>
          <path class="halo" d="M50 13 A37 37 0 1 1 49.9 13" />
        </svg>
      </section>`,
      extraCss: `
        .graph-grid { display:grid; grid-template-columns: 260px 1fr; min-height: 520px; }
        .readout { border-right:1px solid var(--line); padding:18px; display:grid; align-content:start; gap:14px; }
        .readout strong { font-size:13px; line-height:1.45; color:var(--text); font-weight:500; }
        .sweep { display:grid; grid-template-columns:92px 1fr; align-items:center; gap:10px; color:var(--muted); font-size:10px; text-transform:uppercase; }
        .sweep b { display:block; height:8px; border:1px solid var(--line); background:linear-gradient(90deg, var(--primary), var(--secondary)); }
        svg { width:100%; height:100%; min-height:520px; padding:28px; }
        .edges line { stroke:var(--secondary); stroke-width:.35; opacity:.58; }
        .nodes circle { fill:var(--bg); stroke:var(--primary); stroke-width:.9; }
        .halo { fill:none; stroke:${color(seed, 3, "#ff3d2e")}; stroke-width:.45; stroke-dasharray:2 3; opacity:.7; }
      `,
    }),
  };
};
