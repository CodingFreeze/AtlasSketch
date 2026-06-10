// Tidal Cartography board generator — deterministic, index-driven.
// Builds manifest, references, clusters, seeds, artifacts, placeholder SVGs,
// and per-artifact static files for the second demo board.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "src", "data", "demo", "tidal-cartography");
const placeholderDir = join(root, "public", "demo", "placeholders");
const artifactsDir = join(root, "public", "demo", "artifacts");

const SLUG = "tidal-cartography";

// Palette — five fixed survey colors.
const P = {
  charcoal: { name: "charcoal tide", hex: "#04080d" },
  teal: { name: "oxidized teal", hex: "#0c1a1c" },
  amber: { name: "sodium amber", hex: "#ffb454" },
  cyan: { name: "tide cyan", hex: "#5cd0e6" },
  rust: { name: "salvage rust", hex: "#d6552f" },
};
const PALETTE = [P.charcoal, P.teal, P.amber, P.cyan, P.rust];

const TOP_TAGS = ["tide", "survey", "harmonics", "plates", "salvage", "gauge"];
const MOTIF_MARKS = ["bearing rose", "depth ladder", "harmonic comb", "datum notch", "contour rail"];

// Closed SourceClass enum, cycled across references.
const SOURCE_CLASSES = [
  "archive-scan",
  "control-room",
  "diagram",
  "instrument-panel",
  "manuscript",
  "terminal",
];

// Four clusters, in 101..124 order (6 refs each).
const CLUSTERS = [
  {
    id: "cluster-harmonic-gauges",
    label: "Harmonic Gauges",
    region: "northeast",
    description:
      "Calibrated gauge faces where harmonic pulls are read as needles, combs, and standing-wave ledgers.",
    seedId: "seed-tidal-gauges",
    palette: [P.charcoal, P.amber, P.cyan],
    tags: ["harmonics", "gauge", "tide", "calibration"],
    motifs: ["harmonic comb", "bearing rose", "datum notch", "needle arc"],
    words: ["pull", "needle", "resonance", "amplitude"],
  },
  {
    id: "cluster-survey-plates",
    label: "Survey Plates",
    region: "northwest",
    description:
      "Engraved survey plates that fix coordinates, bearings, and contour rails across a quiet datum field.",
    seedId: "seed-tidal-plates",
    palette: [P.teal, P.amber, P.rust],
    tags: ["survey", "plates", "bearing", "coordinates"],
    motifs: ["contour rail", "bearing rose", "datum notch", "plate edge"],
    words: ["coordinate", "engraving", "bearing", "contour"],
  },
  {
    id: "cluster-tide-registers",
    label: "Tide Registers",
    region: "southeast",
    description:
      "Tabular tide registers stacking depth ladders, rising marks, and salvage-light annotation channels.",
    seedId: "seed-tidal-registers",
    palette: [P.charcoal, P.cyan, P.amber],
    tags: ["tide", "register", "depth", "harmonics"],
    motifs: ["depth ladder", "harmonic comb", "datum notch", "register rows"],
    words: ["register", "depth", "rising", "channel"],
  },
  {
    id: "cluster-salvage-tables",
    label: "Salvage Light Tables",
    region: "southwest",
    description:
      "Salvage-light worktables holding translucent plates, contour rails, and rust-marked inspection notes.",
    seedId: "seed-tidal-tables",
    palette: [P.teal, P.amber, P.rust],
    tags: ["salvage", "survey", "light-table", "plates"],
    motifs: ["contour rail", "plate edge", "datum notch", "depth ladder"],
    words: ["salvage", "worktable", "inspection", "translucent"],
  },
];

// Themed pools for composition + notes (indexed, so no verbatim repeat run).
const COMP_POOL = [
  "Large left register, nested bearing rails, small datum cells along the lower edge.",
  "Centered gauge field crossed by calibrated combs and clipped rust marks.",
  "Stacked depth rows orbit a quiet central tide well.",
  "A vertical depth ladder interrupts a field of compact survey counters.",
  "Twin engraved plates hold a field of crossing contour rails.",
  "Concentric bearing rings sit inside stacked register rails.",
  "Offset survey plates reveal margin notes under salvage glass.",
  "A narrow annotated tide capsule crosses a larger calibration field.",
  "Several harmonic combs climb toward clipped amber datum notches.",
  "A coordinate spine locks pale plates into a compact vertical rail.",
  "Four register panes share a contour scaffold and quiet cyan datum points.",
  "Radial bearing wheel set against a disciplined rectangular frame.",
];

const NOTES_POOL = [
  "Reads like an entry rite into a larger tidal survey.",
  "A navigational gauge translated into an interface control state.",
  "The structure suggests monitoring as careful preservation of a tide.",
  "Turns depth metrics into a disciplined visual register.",
  "Useful for thinking about passages, loading states, and framed routes.",
  "Turns monitoring into a spatial survey with a central calm point.",
  "Best for detail drawers, comparison overlays, and source annotation.",
  "Extends the bearing language into a label-heavy harmonic study.",
  "A pressure-reading surface that feels measured rather than urgent.",
  "A useful mood source for sidebars, indexes, and filtered browsing.",
  "Good for multi-reference comparison and survey detail screens.",
  "The rust accent marks a salvage state without taking over.",
];

const TITLE_POOL = [
  "Harmonic Threshold Gauge",
  "Bearing Meridian Plate",
  "Tide Reliquary Register",
  "Depth Pressure Ladder",
  "Survey Coordinate Gate",
  "Orbital Datum Well",
  "Salvage Marginalia Table",
  "Voltage Tide Cartouche",
  "Overflow Harmonic Comb",
  "Catalog Contour Rail",
  "Inspection Plate Array",
  "Datum Rosette Study",
  "Standing Wave Console",
  "Engraved Bearing Field",
  "Rising Register Stack",
  "Pressure Depth Ladder",
  "Transit Survey Gate",
  "Concentric Tide Well",
  "Salvage Lightbox Sheet",
  "Annotated Tide Capsule",
  "Amber Datum Comb",
  "Compact Contour Spine",
  "Folio Plate Array",
  "Bearing Datum Rosette",
];

// Deterministic 0-100 axis value from index + offset.
function axis(i, off) {
  return 40 + ((i * 7 + off * 13) % 56); // 40..95
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

// ----- references.json -----
function buildReferences() {
  const refs = [];
  for (let i = 0; i < 24; i += 1) {
    const num = 101 + i;
    const clusterIndex = Math.floor(i / 6); // 0..3
    const cluster = CLUSTERS[clusterIndex];
    const sourceClass = SOURCE_CLASSES[i % SOURCE_CLASSES.length];

    // tags: 2 board topTags + 2 cluster words.
    const tags = [
      TOP_TAGS[i % TOP_TAGS.length],
      TOP_TAGS[(i + 2) % TOP_TAGS.length],
      cluster.words[i % cluster.words.length],
      cluster.words[(i + 1) % cluster.words.length],
    ];
    // motifs: 1 board motifMark + 2 cluster motifs.
    const motifs = [
      MOTIF_MARKS[i % MOTIF_MARKS.length],
      cluster.motifs[i % cluster.motifs.length],
      cluster.motifs[(i + 2) % cluster.motifs.length],
    ];
    // palette: 3 colors rotated through the board palette.
    const palette = [
      PALETTE[i % PALETTE.length],
      PALETTE[(i + 2) % PALETTE.length],
      PALETTE[(i + 4) % PALETTE.length],
    ];

    refs.push({
      id: `ref-${num}`,
      boardSlug: SLUG,
      title: TITLE_POOL[i],
      placeholderPath: `/demo/placeholders/ref-${num}.svg`,
      sourceClass,
      clusterId: cluster.id,
      tags,
      motifs,
      palette,
      composition: COMP_POOL[i % COMP_POOL.length],
      notes: NOTES_POOL[(i + 3) % NOTES_POOL.length],
      aestheticAxes: {
        density: axis(i, 1),
        contrast: axis(i, 4),
        ritual: axis(i, 7),
        signal: axis(i, 2),
      },
    });
  }
  return refs;
}

// ----- clusters.json -----
function buildClusters() {
  return CLUSTERS.map((cluster, ci) => {
    const start = 101 + ci * 6;
    const referenceIds = Array.from({ length: 6 }, (_, k) => `ref-${start + k}`);
    return {
      id: cluster.id,
      boardSlug: SLUG,
      label: cluster.label,
      description: cluster.description,
      referenceIds,
      tags: cluster.tags,
      motifs: cluster.motifs.slice(0, 4),
      palette: cluster.palette,
      suggestedSeedIds: [cluster.seedId],
      region: cluster.region,
    };
  });
}

// ----- seeds.json -----
// instrument-panel is a SourceClass, not an ArtifactFamily; the panel family
// in the closed ArtifactFamily enum is interface-panel — used here.
const SEED_FAMILIES = [
  "interface-panel",
  "data-cartography",
  "glyph-matrix",
  "sourcebook-light-table",
];

const SEED_DEFS = [
  {
    id: "seed-tidal-gauges",
    title: "Tidal Gauge Rite",
    prompt:
      "Generate a calibrated harmonic gauge panel with bearing rings, measured needle combs, and one ceremonial datum focus.",
  },
  {
    id: "seed-tidal-plates",
    title: "Survey Plate Cartography",
    prompt:
      "Generate an engraved survey map with contour rails, bearing coordinates, and one salvage-marked focus plate.",
  },
  {
    id: "seed-tidal-registers",
    title: "Tide Register Litany",
    prompt:
      "Generate a tide register matrix that alternates depth ladders, harmonic comb marks, and rare rising highlights.",
  },
  {
    id: "seed-tidal-tables",
    title: "Salvage Light Table",
    prompt:
      "Generate a salvage inspection table with translucent plate panes, datum marks, and survey comparison channels.",
  },
];

function buildSeeds() {
  return SEED_DEFS.map((def, si) => {
    const cluster = CLUSTERS[si];
    const start = 101 + si * 6;
    const referenceIds = [`ref-${start}`, `ref-${start + 1}`, `ref-${start + 2}`];
    return {
      id: def.id,
      boardSlug: SLUG,
      title: def.title,
      artifactFamily: SEED_FAMILIES[si],
      clusterIds: [cluster.id],
      referenceIds,
      prompt: def.prompt,
      parameters: {
        density: axis(si, 1),
        mutation: axis(si, 9),
        motion: axis(si, 5),
        gridIntensity: axis(si, 3),
        signalNoise: axis(si, 8),
        paletteAdherence: axis(si, 6),
      },
      tags: cluster.tags.slice(0, 3),
      motifs: cluster.motifs.slice(0, 3),
      palette: cluster.palette,
    };
  });
}

// ----- artifacts.json -----
const ARTIFACT_DEFS = [
  {
    title: "Tidal Gauge Console",
    summary:
      "A calibrated gauge console with bearing rings, harmonic needle combs, and a quiet datum focus ring.",
    variant: "panel-a",
  },
  {
    title: "Survey Plate Cartography",
    summary:
      "A coordinate-driven survey plate with contour rails, bearing marks, and compact route diagnostics.",
    variant: "cartography-a",
  },
  {
    title: "Tide Register Matrix",
    summary:
      "A strict tide register grid with depth-ladder rows and a restrained salvage accent.",
    variant: "register-a",
  },
  {
    title: "Salvage Light Table",
    summary:
      "A layered inspection table with translucent plates, datum edges, and cyan registration marks.",
    variant: "light-table-a",
  },
];

function buildArtifacts() {
  return ARTIFACT_DEFS.map((def, idx) => {
    const num = 101 + idx;
    const seed = SEED_DEFS[idx];
    const cluster = CLUSTERS[idx];
    const start = 101 + idx * 6;
    const referenceIds = [`ref-${start}`, `ref-${start + 1}`, `ref-${start + 2}`];
    return {
      id: `artifact-${num}`,
      boardSlug: SLUG,
      title: def.title,
      family: SEED_FAMILIES[idx],
      summary: def.summary,
      seedId: seed.id,
      clusterIds: [cluster.id],
      referenceIds,
      tags: cluster.tags.slice(0, 3),
      motifs: cluster.motifs.slice(0, 3),
      palette: cluster.palette,
      staticPaths: {
        html: `/demo/artifacts/artifact-${num}/index.html`,
        preview: `/demo/artifacts/artifact-${num}/preview.svg`,
        source: `/demo/artifacts/artifact-${num}/source.ts`,
      },
      lineage: {
        seed: seed.id,
        variant: def.variant,
        derivedFrom: referenceIds,
      },
    };
  });
}

// ----- manifest.json + boards.json entry -----
function buildManifest() {
  return {
    id: "board-tidal-cartography",
    slug: SLUG,
    title: "Tidal Cartography",
    summary:
      "A compiled atlas of harmonic gauges, survey plates, tide registers, and salvage-light worktables.",
    philosophy:
      "Read the instrument as a tide: every gauge records a pull, every plate fixes a coordinate, and every artifact keeps the private survey abstracted behind public-safe placeholders.",
    status: "compiled",
    version: "0.1.0",
    accent: P.amber,
    topTags: TOP_TAGS,
    motifMarks: MOTIF_MARKS,
    palette: PALETTE,
    stats: { references: 24, clusters: 4, seeds: 4, artifacts: 4 },
    paths: { placeholders: "/demo/placeholders", artifacts: "/demo/artifacts" },
  };
}

// ----- placeholder SVGs -----
// Tidal palette: bg charcoal, dim teal grid, amber primary, cyan secondary, rust accent.
function placeholderSvg(num, i) {
  const bg = "#04080d";
  const grid = "#16312f";
  const amber = "#ffb454";
  const cyan = "#5cd0e6";
  const rust = "#d6552f";
  const shape = i % 4; // rotate which marks appear
  const ox = 60 + (i % 5) * 6; // outer rect x shift
  const oy = 54 + (i % 4) * 6;

  const gridLines =
    "M0 80h640M0 160h640M0 240h640M0 320h640M0 400h640" +
    "M80 0v480M160 0v480M240 0v480M320 0v480M400 0v480M480 0v480M560 0v480";

  let marks = "";
  if (shape === 0) {
    // nested rectangles + comb
    marks =
      `<rect x="${110 + (i % 3) * 8}" y="114" width="210" height="126" fill="none" stroke="${cyan}" stroke-width="2"/>` +
      `<path d="M356 120h142M356 152h86M356 184h118M356 216h64" stroke="${amber}" stroke-width="5"/>` +
      `<path d="M120 256h390" stroke="${rust}" stroke-width="3" stroke-dasharray="10 12"/>`;
  } else if (shape === 1) {
    // ledger rows + spine
    marks =
      `<path d="M116 110h334M116 150h334M116 190h334M116 230h334M116 270h334M116 310h334" stroke="${grid}" stroke-width="2"/>` +
      `<path d="M${440 + (i % 4) * 8} 96v272" stroke="${amber}" stroke-width="4"/>` +
      `<path d="M112 110h76M112 190h146M112 270h102M112 350h184" stroke="${cyan}" stroke-width="5"/>`;
  } else if (shape === 2) {
    // bearing rose / concentric circles
    marks =
      `<circle cx="320" cy="${214 + (i % 3) * 8}" r="132" fill="none" stroke="${amber}" stroke-width="3"/>` +
      `<circle cx="320" cy="${214 + (i % 3) * 8}" r="70" fill="none" stroke="${rust}" stroke-width="3"/>` +
      `<path d="M320 82v292M174 228h292" stroke="${grid}" stroke-width="3"/>` +
      `<path d="M274 164h92v128h-92z" fill="none" stroke="${cyan}" stroke-width="2"/>`;
  } else {
    // depth ladder + counters
    marks =
      `<path d="M${150 + (i % 3) * 10} 100v280" stroke="${amber}" stroke-width="4"/>` +
      `<path d="M${172 + (i % 3) * 10} 122h34M${172 + (i % 3) * 10} 166h54M${172 + (i % 3) * 10} 210h26M${172 + (i % 3) * 10} 254h66M${172 + (i % 3) * 10} 298h42" stroke="${amber}" stroke-width="5"/>` +
      `<path d="M360 130h180M360 180h120M360 230h160" stroke="${cyan}" stroke-width="5"/>` +
      `<path d="M360 300h200" stroke="${rust}" stroke-width="3" stroke-dasharray="8 10"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-label="Abstract tidal survey placeholder ref ${num}">
  <rect width="640" height="480" fill="${bg}"/>
  <path d="${gridLines}" stroke="${grid}" stroke-width="1"/>
  <rect x="${ox}" y="${oy}" width="${640 - ox * 2}" height="${400 - (oy - 40)}" fill="${"#0c1a1c"}" stroke="${amber}" stroke-width="3"/>
  ${marks}
  <text x="92" y="404" fill="${cyan}" font-family="monospace" font-size="28">REF-${num}</text>
</svg>
`;
}

// ----- artifact static files (themed to tidal palette) -----
function artifactIndexHtml(art, i) {
  const bg = "#04080d";
  const panel = "#0c1a1c";
  const text = "#e7f4f2";
  const muted = "rgba(231,244,242,0.64)";
  const line = "rgba(231,244,242,0.16)";
  const amber = "#ffb454";
  const cyan = "#5cd0e6";
  const rust = "#d6552f";
  const tags = art.tags.map((t) => `<span class="tag">${t}</span>`).join("");
  const motifs = art.motifs.map((m) => `<span class="motif">${m}</span>`).join("");

  // Body content varies by family.
  const ladderRows = Array.from({ length: 6 }, (_, k) => {
    const w = 32 + ((i + k) * 11) % 60;
    return `<div class="row"><span>${art.referenceIds[k % art.referenceIds.length].toUpperCase()}</span><b style="width:${w}%"></b><em>${pad3(k + 1)}</em></div>`;
  }).join("");

  const ringMarks = `<circle class="ring" cx="50" cy="50" r="34" /><circle class="ring" cx="50" cy="50" r="20" /><line class="cross" x1="50" y1="12" x2="50" y2="88" /><line class="cross" x1="12" y1="50" x2="88" y2="50" />`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${art.title} / ${art.family} v${pad3(i + 1)}</title>
  <style>
    :root {
      --bg: ${bg};
      --panel: ${panel};
      --text: ${text};
      --muted: ${muted};
      --line: ${line};
      --primary: ${amber};
      --secondary: ${cyan};
      --warning: ${rust};
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh; margin: 0; color: var(--text);
      background:
        linear-gradient(rgba(255,180,84,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(92,208,230,0.04) 1px, transparent 1px),
        radial-gradient(circle at 72% 18%, rgba(92,208,230,0.08), transparent 30%),
        var(--bg);
      background-size: 28px 28px, 28px 28px, auto, auto;
      font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
    }
    .artifact { min-height: 100vh; padding: 28px; display: grid; gap: 16px; grid-template-rows: auto 1fr auto; }
    .topline, .footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; border: 1px solid var(--line); background: rgba(4,8,13,0.72); padding: 12px 14px; border-radius: 6px; }
    h1 { margin: 0; font-size: clamp(20px, 3vw, 38px); line-height: 1; text-transform: uppercase; }
    .meta, .footer { color: var(--muted); font-size: 11px; text-transform: uppercase; }
    .dna, .motifs { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag, .motif { border: 1px solid var(--line); border-radius: 999px; padding: 4px 8px; background: rgba(231,244,242,0.04); }
    .tag { color: var(--primary); }
    .motif { color: var(--secondary); }
    .frame { border: 1px solid rgba(231,244,242,0.18); border-radius: 8px; background: linear-gradient(135deg, rgba(231,244,242,0.055), rgba(4,8,13,0.84)); overflow: hidden; min-width: 0; display: grid; grid-template-columns: 300px 1fr; min-height: 520px; }
    aside { border-right: 1px solid var(--line); padding: 18px; display: grid; align-content: start; gap: 16px; }
    aside p { margin: 0; color: var(--text); font-size: 13px; line-height: 1.55; }
    .label { color: var(--muted); font-size: 10px; text-transform: uppercase; }
    .stack { display: grid; gap: 9px; }
    .row { display: grid; grid-template-columns: 96px 1fr 38px; gap: 8px; align-items: center; color: var(--muted); font-size: 10px; text-transform: uppercase; }
    .row b { display: block; height: 9px; border: 1px solid var(--line); background: linear-gradient(90deg, var(--primary), var(--secondary)); }
    .row em { color: var(--primary); font-style: normal; text-align: right; }
    svg.face { width: 100%; height: 100%; min-height: 520px; padding: 26px; }
    .ring { fill: none; stroke: var(--primary); stroke-width: 0.6; }
    .cross { stroke: var(--secondary); stroke-width: 0.3; stroke-dasharray: 1.4 1.4; opacity: 0.6; }
    .focus { fill: rgba(255,180,84,0.05); stroke: var(--warning); stroke-width: 0.5; stroke-dasharray: 2 2; }
    @media (max-width: 760px) { .frame { grid-template-columns: 1fr; } aside { border-right: 0; border-bottom: 1px solid var(--line); } svg.face { min-height: 340px; } }
  </style>
</head>
<body>
  <main class="artifact ${art.family}">
    <header class="topline">
      <div>
        <div class="meta">AtlasSketch deterministic artifact / variant ${i + 1}</div>
        <h1>${art.title} / ${art.family} v${pad3(i + 1)}</h1>
      </div>
      <div class="dna">${tags}</div>
    </header>
    <section class="frame">
      <aside>
        <span class="label">${CLUSTERS[i].label}</span>
        <p>${art.summary}</p>
        <div class="stack">${ladderRows}</div>
      </aside>
      <svg class="face" viewBox="0 0 100 100" role="img" aria-label="${art.title} survey face">
        <g class="marks">${ringMarks}</g>
        <circle class="focus" cx="50" cy="50" r="44" />
      </svg>
    </section>
    <footer class="footer">
      <span>${art.family} / ${art.seedId}</span>
      <span class="motifs">${motifs}</span>
    </footer>
  </main>
</body>
</html>
`;
}

function artifactPreviewSvg(art, i) {
  const num = 101 + i;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-label="${art.title} preview">
  <rect width="640" height="400" fill="#04080d"/>
  <path d="M0 40H640M0 120H640M0 200H640M0 280H640M0 360H640M80 0V400M160 0V400M240 0V400M320 0V400M400 0V400M480 0V400M560 0V400" stroke="#ffb454" stroke-opacity=".12"/>
  <rect x="28" y="28" width="584" height="344" fill="none" stroke="#e7f4f2" stroke-opacity=".18"/>
  <circle cx="${180 + (i % 3) * 20}" cy="160" r="61" fill="none" stroke="#5cd0e6" stroke-opacity=".75" stroke-dasharray="8 8"/>
  <path d="M84 290 C 178 99, 314 319, 556 108" fill="none" stroke="#ffb454" stroke-width="3" stroke-opacity=".8"/>
  <path d="M300 92H548V150H300zM316 190H560V294H316z" fill="none" stroke="#d6552f" stroke-opacity=".7"/>
  <text x="44" y="64" fill="#e7f4f2" font-family="IBM Plex Mono, Consolas, monospace" font-size="22" font-weight="700">${art.title}</text>
  <text x="44" y="94" fill="#ffb454" font-family="IBM Plex Mono, Consolas, monospace" font-size="13">${art.family} / variant ${i + 1}</text>
  <text x="44" y="350" fill="#e7f4f2" fill-opacity=".68" font-family="IBM Plex Mono, Consolas, monospace" font-size="12">${art.tags.join(" / ")}</text>
</svg>
`;
}

function artifactSourceTs(art, i) {
  const obj = {
    id: art.id,
    title: art.title,
    renderedTitle: `${art.title} / ${art.family} v${pad3(i + 1)}`,
    boardSlug: SLUG,
    family: art.family,
    rendererVariant: i + 1,
    seedId: art.seedId,
    lineage: art.lineage,
    referenceIds: art.referenceIds,
    clusterIds: art.clusterIds,
    tags: art.tags,
    motifs: art.motifs,
    palette: art.palette,
    staticPaths: art.staticPaths,
  };
  return `export const artifactSource = ${JSON.stringify(obj, null, 2)} as const;\n`;
}

// ----- write everything -----
function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(placeholderDir, { recursive: true });

  const manifest = buildManifest();
  const references = buildReferences();
  const clusters = buildClusters();
  const seeds = buildSeeds();
  const artifacts = buildArtifacts();

  writeJson(join(dataDir, "manifest.json"), manifest);
  writeJson(join(dataDir, "references.json"), references);
  writeJson(join(dataDir, "clusters.json"), clusters);
  writeJson(join(dataDir, "seeds.json"), seeds);
  writeJson(join(dataDir, "artifacts.json"), artifacts);

  // Placeholder SVGs ref-101..124.
  references.forEach((ref, i) => {
    const num = 101 + i;
    writeFileSync(join(placeholderDir, `ref-${num}.svg`), placeholderSvg(num, i));
  });

  // Artifact static files artifact-101..104.
  artifacts.forEach((art, i) => {
    const dir = join(artifactsDir, art.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), artifactIndexHtml(art, i));
    writeFileSync(join(dir, "preview.svg"), artifactPreviewSvg(art, i));
    writeFileSync(join(dir, "source.ts"), artifactSourceTs(art, i));
  });

  // Append to boards.json (keep existing board first; avoid duplicates).
  const boardsPath = join(root, "src", "data", "demo", "boards.json");
  const existing = JSON.parse(readFileSync(boardsPath, "utf8"));
  const filtered = existing.filter((b) => b.slug !== SLUG);
  filtered.push(manifest);
  writeJson(boardsPath, filtered);

  console.log("wrote tidal-cartography board:", {
    references: references.length,
    clusters: clusters.length,
    seeds: seeds.length,
    artifacts: artifacts.length,
    placeholders: references.length,
  });
}

main();
