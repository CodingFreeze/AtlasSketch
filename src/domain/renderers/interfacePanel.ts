import {
  artifactTitle,
  createRng,
  escapeHtml,
  renderShell,
  safeNumber,
} from "./shared";
import type { ArtifactRenderer } from "./types";

export const interfacePanelRenderer: ArtifactRenderer = (seed, variant) => {
  const rng = createRng(`${seed.id}:interface-panel:${variant}`);
  const safeVariant = safeNumber(variant, 0, 0, 999);
  const title = artifactTitle(seed, variant, "Interface Panel");
  const toggles = seed.tags
    .concat(seed.motifs)
    .slice(0, 8)
    .map((item, index) => `<button type="button" class="${index % 3 === safeVariant % 3 ? "active" : ""}">${escapeHtml(item)}</button>`)
    .join("");
  const cells = Array.from({ length: 64 }, (_, index) => {
    const lit = rng.next() > 0.46;
    return `<i class="${lit ? "lit" : ""}" data-index="${index}"></i>`;
  }).join("");

  return {
    family: "interface-panel",
    title,
    html: renderShell({
      seed,
      variant,
      title,
      bodyClass: "interface-panel",
      body: `<section class="frame panel">
        <nav>${toggles}</nav>
        <div class="matrix">${cells}</div>
        <aside>
          <span class="label">Control Surface Recipe</span>
          <p>${escapeHtml(seed.prompt)}</p>
          <div class="dial"><b style="transform:rotate(${rng.int(18, 330)}deg)"></b></div>
        </aside>
      </section>`,
      extraCss: `
        .panel { display:grid; grid-template-columns:220px 1fr 260px; min-height:520px; }
        nav { padding:16px; display:grid; align-content:start; gap:8px; border-right:1px solid var(--line); }
        button { appearance:none; border:1px solid var(--line); border-radius:4px; background:rgba(244,232,205,.04); color:var(--muted); padding:10px; text-align:left; text-transform:uppercase; font:inherit; font-size:10px; }
        button.active { color:var(--bg); background:var(--primary); border-color:var(--primary); }
        .matrix { padding:22px; display:grid; grid-template-columns:repeat(8, minmax(28px, 1fr)); gap:8px; align-content:center; }
        .matrix i { aspect-ratio:1; border:1px solid var(--line); background:rgba(244,232,205,.035); }
        .matrix i.lit { background:linear-gradient(135deg, var(--primary), var(--secondary)); box-shadow:0 0 16px rgba(184,255,106,.16); }
        aside { border-left:1px solid var(--line); padding:18px; display:grid; align-content:center; justify-items:center; gap:18px; text-align:center; }
        aside p { margin:0; font-size:13px; line-height:1.55; color:var(--text); }
        .dial { width:150px; aspect-ratio:1; border:1px solid var(--line); border-radius:50%; display:grid; place-items:center; background:repeating-conic-gradient(from 0deg, rgba(244,232,205,.12) 0 8deg, transparent 8deg 18deg); }
        .dial b { width:1px; height:58px; transform-origin:50% 100%; background:var(--warning); display:block; margin-top:-58px; }
      `,
    }),
  };
};
