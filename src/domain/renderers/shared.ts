import type { PaletteColor, Seed } from "../types";

const DEFAULT_PALETTE = [
  { name: "charcoal field", hex: "#050706" },
  { name: "terminal lime", hex: "#b8ff6a" },
  { name: "inspection cyan", hex: "#62e6ff" },
  { name: "warning red", hex: "#ff3d2e" },
] satisfies PaletteColor[];

export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
};

export function createRng(seedKey: string): Rng {
  let state = 2166136261;

  for (let index = 0; index < seedKey.length; index += 1) {
    state ^= seedKey.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  function next() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick(items) {
      return items[Math.floor(next() * items.length)] ?? items[0];
    },
  };
}

export function escapeHtml(value: string): string {
  return sanitizeText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeText(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "[redacted]")
    .replace(/\/demo\/placeholders\/\S*/gi, "[redacted]")
    .replace(/<\/style/gi, "[redacted]")
    .replace(/<script/gi, "[redacted]")
    .replace(/\bonerror\b/gi, "[redacted]")
    .replace(/url\s*\(/gi, "[redacted]")
    .replace(/javascript\s*:/gi, "[redacted]");
}

export function sanitizeHexColor(value: string, fallback: string): string {
  const trimmed = value.trim();
  const fallbackColor = normalizeHexColor(fallback) ?? DEFAULT_PALETTE[0].hex;
  return normalizeHexColor(trimmed) ?? fallbackColor;
}

function normalizeHexColor(value: string): string | undefined {
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) {
    return value.toLowerCase();
  }

  return undefined;
}

export function palette(seed: Seed): PaletteColor[] {
  if (seed.palette.length > 0) {
    return seed.palette.map((entry, index) => {
      const fallback = DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];

      return {
        name: entry.name,
        hex: sanitizeHexColor(entry.hex, fallback.hex) as `#${string}`,
      };
    });
  }

  return DEFAULT_PALETTE;
}

export function color(seed: Seed, index: number, fallback: string): string {
  return palette(seed)[index]?.hex ?? sanitizeHexColor(fallback, DEFAULT_PALETTE[0].hex);
}

export function artifactTitle(seed: Seed, variant: number, label: string): string {
  return `${seed.title} / ${label} v${variant.toString().padStart(2, "0")}`;
}

export function listItems(items: readonly string[], className: string): string {
  return items
    .slice(0, 5)
    .map((item) => `<span class="${className}">${escapeHtml(item)}</span>`)
    .join("");
}

export function metric(seed: Seed, key: keyof Seed["parameters"], variant: number) {
  return Math.max(3, Math.min(97, seed.parameters[key] + ((variant % 7) - 3) * 2));
}

type ShellOptions = {
  seed: Seed;
  variant: number;
  title: string;
  bodyClass: string;
  body: string;
  extraCss?: string;
};

export function renderShell({
  seed,
  variant,
  title,
  bodyClass,
  body,
  extraCss = "",
}: ShellOptions): string {
  const background = color(seed, 0, "#050706");
  const primary = color(seed, 1, "#b8ff6a");
  const secondary = color(seed, 2, "#62e6ff");
  const warning = color(seed, 3, "#ff3d2e");
  const escapedTitle = escapeHtml(title);
  const tags = listItems(seed.tags, "tag");
  const motifs = listItems(seed.motifs, "motif");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <style>
    :root {
      --bg: ${background};
      --panel: color-mix(in srgb, ${background} 78%, #111814 22%);
      --panel-strong: color-mix(in srgb, ${background} 62%, #19231d 38%);
      --text: #f4e8cd;
      --muted: rgba(244, 232, 205, 0.64);
      --line: rgba(244, 232, 205, 0.16);
      --primary: ${primary};
      --secondary: ${secondary};
      --warning: ${warning};
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      color: var(--text);
      background:
        linear-gradient(rgba(184, 255, 106, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(98, 230, 255, 0.04) 1px, transparent 1px),
        radial-gradient(circle at 72% 18%, rgba(98, 230, 255, 0.08), transparent 30%),
        var(--bg);
      background-size: 28px 28px, 28px 28px, auto, auto;
      font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
      letter-spacing: 0;
    }
    .artifact {
      min-height: 100vh;
      padding: 28px;
      display: grid;
      gap: 16px;
      grid-template-rows: auto 1fr auto;
    }
    .topline, .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border: 1px solid var(--line);
      background: rgba(5, 7, 6, 0.72);
      padding: 12px 14px;
      border-radius: 6px;
    }
    h1 {
      margin: 0;
      font-size: clamp(20px, 3vw, 38px);
      line-height: 1;
      text-transform: uppercase;
    }
    .meta, .footer {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
    }
    .dna, .motifs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag, .motif {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 8px;
      background: rgba(244, 232, 205, 0.04);
    }
    .tag { color: var(--primary); }
    .motif { color: var(--secondary); }
    .frame {
      border: 1px solid rgba(244, 232, 205, 0.18);
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(244, 232, 205, 0.055), rgba(5, 7, 6, 0.84));
      box-shadow: inset 0 0 0 1px rgba(184, 255, 106, 0.05);
      overflow: hidden;
      min-width: 0;
    }
    .label {
      color: var(--muted);
      font-size: 10px;
      letter-spacing: 0;
      text-transform: uppercase;
    }
    @media (max-width: 760px) {
      .artifact { padding: 12px; }
      .topline, .footer { align-items: stretch; flex-direction: column; }
      .graph-grid, .dashboard, .diagram, .light-table, .panel {
        grid-template-columns: 1fr !important;
        grid-template-rows: auto !important;
        min-height: auto !important;
      }
      .meters, .readout, aside, nav, .status {
        grid-column: auto !important;
        border-left: 0 !important;
        border-right: 0 !important;
      }
      .meters, .table-grid { grid-template-columns: 1fr !important; }
      svg { min-height: 340px !important; }
      table { display: block; overflow-x: auto; }
    }
    ${extraCss}
  </style>
</head>
<body>
  <main class="artifact ${bodyClass}">
    <header class="topline">
      <div>
        <div class="meta">AtlasSketch deterministic artifact / variant ${variant}</div>
        <h1>${escapedTitle}</h1>
      </div>
      <div class="dna">${tags}</div>
    </header>
    ${body}
    <footer class="footer">
      <span>${escapeHtml(seed.artifactFamily)} / ${escapeHtml(seed.id)}</span>
      <span class="motifs">${motifs}</span>
    </footer>
  </main>
</body>
</html>`;
}
