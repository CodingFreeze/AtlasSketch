import { artifactTitle, createRng, escapeHtml, renderShell } from "./shared";
import type { ArtifactRenderer } from "./types";

export const sourcebookLightTableRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:sourcebook-light-table:${variant}`);
  const title = artifactTitle(seed, variant, "Sourcebook Light Table");
  const cards = Array.from({ length: 6 }, (_, index) => {
    const tag = seed.tags[index % seed.tags.length] ?? "archive";
    const motif = seed.motifs[index % seed.motifs.length] ?? "index";
    return `<article class="source-card" style="transform:translate(${rng.int(-5, 5)}px, ${rng.int(-4, 4)}px)">
      <span>REF-${(index + 1).toString().padStart(3, "0")}</span>
      <h2>${escapeHtml(tag)}</h2>
      <p>${escapeHtml(motif)}</p>
      <i style="width:${rng.int(38, 88)}%"></i>
    </article>`;
  }).join("");

  return {
    family: "sourcebook-light-table",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "sourcebook-light-table",
      body: `<section class="frame light-table">
        <div class="table-grid">${cards}</div>
        <aside>
          <span class="label">Archive Comparison Channel</span>
          <p>${escapeHtml(seed.prompt)}</p>
          <dl>
            <div><dt>Palette adherence</dt><dd>${seed.parameters.paletteAdherence}%</dd></div>
            <div><dt>Grid intensity</dt><dd>${seed.parameters.gridIntensity}%</dd></div>
            <div><dt>Variant offset</dt><dd>${variant}</dd></div>
          </dl>
        </aside>
      </section>`,
      extraCss: `
        .light-table { display:grid; grid-template-columns:1fr 300px; min-height:520px; background:linear-gradient(135deg, rgba(244,232,205,.13), rgba(5,7,6,.88)); }
        .table-grid { padding:26px; display:grid; grid-template-columns:repeat(3, 1fr); grid-auto-rows:1fr; gap:14px; }
        .source-card { min-height:190px; border:1px solid rgba(244,232,205,.24); background:rgba(244,232,205,.08); padding:14px; display:grid; align-content:space-between; box-shadow:0 0 28px rgba(98,230,255,.07); }
        .source-card span { color:var(--secondary); font-size:10px; }
        .source-card h2 { margin:0; color:var(--text); font-size:18px; text-transform:uppercase; }
        .source-card p { margin:0; color:var(--muted); font-size:11px; text-transform:uppercase; }
        .source-card i { display:block; height:5px; background:var(--primary); }
        aside { border-left:1px solid var(--line); padding:18px; display:grid; align-content:center; gap:18px; }
        aside p { margin:0; font-size:13px; line-height:1.55; }
        dl { display:grid; gap:10px; margin:0; }
        dl div { display:flex; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:8px; text-transform:uppercase; font-size:11px; }
        dt { color:var(--muted); }
        dd { margin:0; color:var(--primary); }
      `,
    }),
  };
};
