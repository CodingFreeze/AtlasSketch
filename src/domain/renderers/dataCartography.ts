import {
  artifactTitle,
  createRng,
  escapeHtml,
  metric,
  renderShell,
  safeNumber,
} from "./shared";
import type { ArtifactRenderer } from "./types";

export const dataCartographyRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:data-cartography:${variant}`);
  const safeVariant = safeNumber(variant, 0, 0, 999);
  const title = artifactTitle(seed, variant, "Data Cartography");
  const points = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    x: 10 + rng.int(0, 80),
    y: 12 + rng.int(0, 72),
    radius: rng.int(2, 5),
  }));
  const routes = points
    .slice(1)
    .map((point, index) => {
      const source = points[Math.max(0, index - rng.int(0, Math.min(index, 5)))];
      const bendX = Math.round((source.x + point.x) / 2 + rng.int(-8, 8));
      return `<path d="M ${source.x} ${source.y} C ${bendX} ${source.y}, ${bendX} ${point.y}, ${point.x} ${point.y}" />`;
    })
    .join("");
  const nodes = points
    .map(
      (point) =>
        `<g class="node"><circle cx="${point.x}" cy="${point.y}" r="${point.radius}" /><text x="${point.x + 2.2}" y="${point.y - 2.2}">C${point.id.toString().padStart(2, "0")}</text></g>`,
    )
    .join("");
  const gridLines = Array.from({ length: 11 }, (_, index) => {
    const coordinate = 5 + index * 9;
    return `<line x1="${coordinate}" x2="${coordinate}" y1="5" y2="95" /><line x1="5" x2="95" y1="${coordinate}" y2="${coordinate}" />`;
  }).join("");
  const telemetry = seed.tags
    .concat(seed.motifs)
    .slice(0, 8)
    .map((item, index) => {
      const width = safeNumber(metric(seed, index % 2 === 0 ? "gridIntensity" : "signalNoise", variant) + rng.int(-14, 12), 50, 4, 98);
      return `<div class="telemetry"><span>${escapeHtml(item)}</span><b style="width:${width}%"></b><em>${(safeVariant + index + 1).toString().padStart(3, "0")}</em></div>`;
    })
    .join("");

  return {
    family: "data-cartography",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "data-cartography",
      body: `<section class="frame map">
        <aside>
          <span class="label">Coordinate Telemetry</span>
          <p>${escapeHtml(seed.prompt)}</p>
          <div class="telemetry-stack">${telemetry}</div>
        </aside>
        <svg viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(title)} coordinate signal map">
          <g class="grid-lines">${gridLines}</g>
          <g class="axes">
            <line x1="50" x2="50" y1="5" y2="95" />
            <line x1="5" x2="95" y1="50" y2="50" />
          </g>
          <g class="routes">${routes}</g>
          <g class="nodes">${nodes}</g>
          <circle class="focus" cx="${48 + rng.int(-8, 8)}" cy="${50 + rng.int(-8, 8)}" r="${18 + rng.int(0, 6)}" />
        </svg>
      </section>`,
      extraCss: `
        .map { display:grid; grid-template-columns:290px 1fr; min-height:520px; }
        aside { border-right:1px solid var(--line); padding:18px; display:grid; align-content:start; gap:16px; }
        aside p { margin:0; color:var(--text); font-size:13px; line-height:1.55; }
        .telemetry-stack { display:grid; gap:9px; }
        .telemetry { display:grid; grid-template-columns:108px 1fr 38px; gap:8px; align-items:center; color:var(--muted); font-size:10px; text-transform:uppercase; }
        .telemetry b { display:block; height:9px; border:1px solid var(--line); background:linear-gradient(90deg, var(--primary), var(--secondary)); }
        .telemetry em { color:var(--primary); font-style:normal; text-align:right; }
        svg { width:100%; height:100%; min-height:520px; padding:26px; }
        .grid-lines line { stroke:rgba(244,232,205,.12); stroke-width:.2; }
        .axes line { stroke:var(--secondary); stroke-width:.34; stroke-dasharray:1.4 1.4; opacity:.6; }
        .routes path { fill:none; stroke:var(--primary); stroke-width:.46; opacity:.62; }
        .nodes circle { fill:var(--bg); stroke:var(--secondary); stroke-width:.8; }
        .nodes text { fill:var(--muted); font-size:2.2px; text-transform:uppercase; }
        .focus { fill:rgba(184,255,106,.045); stroke:var(--warning); stroke-width:.52; stroke-dasharray:2 2; }
      `,
    }),
  };
};
