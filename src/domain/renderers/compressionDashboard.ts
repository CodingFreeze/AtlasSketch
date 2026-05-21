import { artifactTitle, createRng, escapeHtml, metric, renderShell } from "./shared";
import type { ArtifactRenderer } from "./types";

export const compressionDashboardRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:compression-dashboard:${variant}`);
  const title = artifactTitle(seed, variant, "Compression Dashboard");
  const meters = Object.entries(seed.parameters)
    .map(([key, value], index) => {
      const adjusted = Math.max(4, Math.min(98, value + rng.int(-8, 8)));
      return `<div class="meter"><span>${escapeHtml(key)}</span><b style="width:${adjusted}%"></b><em>${adjusted.toString().padStart(2, "0")}</em></div>`;
    })
    .join("");
  const rows = Array.from({ length: 11 }, (_, index) => {
    const tag = seed.tags[index % seed.tags.length] ?? "diagnostic";
    const load = metric(seed, index % 2 === 0 ? "density" : "gridIntensity", variant) - rng.int(0, 18);
    return `<tr><td>0${variant}-${(index + 1).toString().padStart(2, "0")}</td><td>${escapeHtml(tag)}</td><td>${escapeHtml(seed.motifs[index % seed.motifs.length] ?? "rail")}</td><td>${load}%</td></tr>`;
  }).join("");

  return {
    family: "compression-dashboard",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "compression-dashboard",
      body: `<section class="frame dashboard">
        <div class="meters">${meters}</div>
        <div class="status">
          <span class="label">Compression Field</span>
          <div class="block">${Array.from({ length: 48 }, (_, index) => `<i style="opacity:${0.24 + rng.next() * 0.76}"></i>`).join("")}</div>
          <div class="recipe">
            <span class="label">Seed Recipe</span>
            <p>${escapeHtml(seed.prompt)}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Index</th><th>Signal</th><th>Motif</th><th>Load</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`,
      extraCss: `
        .dashboard { display:grid; grid-template-columns: 1fr 280px; grid-template-rows:auto 1fr; min-height:520px; }
        .meters { grid-column:1 / 3; display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; padding:16px; border-bottom:1px solid var(--line); }
        .meter { display:grid; grid-template-columns:1fr 3fr 34px; gap:8px; align-items:center; font-size:10px; color:var(--muted); text-transform:uppercase; }
        .meter b { height:11px; border:1px solid var(--line); background:linear-gradient(90deg, var(--primary), var(--warning)); }
        .meter em { font-style:normal; color:var(--text); text-align:right; }
        .status { padding:16px; border-left:1px solid var(--line); display:grid; align-content:start; gap:16px; }
        .block { margin-top:16px; display:grid; grid-template-columns:repeat(6, 1fr); gap:6px; }
        .block i { aspect-ratio:1; border:1px solid var(--line); background:var(--warning); }
        .recipe { border-top:1px solid var(--line); padding-top:14px; }
        .recipe p { margin:8px 0 0; color:var(--text); font-size:12px; line-height:1.5; }
        table { width:100%; border-collapse:collapse; align-self:start; }
        th, td { padding:12px 14px; border-bottom:1px solid var(--line); text-align:left; font-size:11px; }
        th { color:var(--primary); text-transform:uppercase; }
        td { color:var(--muted); }
      `,
    }),
  };
};
