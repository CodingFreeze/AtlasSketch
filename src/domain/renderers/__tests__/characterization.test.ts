/**
 * Characterization tests: prove the 2026-06-30 cleanup is behavior-preserving.
 *
 * Verified against BOTH main~1 (pre-cleanup) and verify/backfill-2026-06-30 (cleaned).
 * All assertions must pass on both trees to establish equivalence.
 *
 * Changed paths covered:
 *   - compressionDashboard: `.map(([key, value], index)` → `.map(([key, value])` (line ~16)
 *   - compressionDashboard: `Array.from({length:48}, (_, index)` → `Array.from({length:48}, ()` (line ~40)
 *   - shared: `export function palette` → `function palette` (used internally by color())
 *   - shared: `export function listItems` → `function listItems` (used internally by renderShell())
 */

import { describe, expect, it } from "vitest";
import { compressionDashboardRenderer } from "../compressionDashboard";
import { artifactTitle, color, metric, renderShell, safeNumber } from "../shared";
import type { Seed } from "../../types";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

function makeSeed(overrides: Partial<Seed> = {}): Seed {
  return {
    id: "char-test-01",
    boardSlug: "characterization-board",
    title: "Characterization Test",
    artifactFamily: "compression-dashboard",
    clusterIds: ["cluster-char"],
    referenceIds: ["ref-char-1"],
    prompt: "A fixed prompt for characterization testing.",
    parameters: {
      density: 60,
      mutation: 30,
      motion: 20,
      gridIntensity: 55,
      signalNoise: 40,
      paletteAdherence: 75,
    },
    tags: ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"],
    motifs: ["strut", "rail", "hinge", "pivot"],
    palette: [
      { name: "background", hex: "#111111" },
      { name: "primary",    hex: "#00ff88" },
      { name: "secondary",  hex: "#0088ff" },
      { name: "warning",    hex: "#ff4400" },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// compressionDashboard — covers the two removed `index` params
// ---------------------------------------------------------------------------

describe("compressionDashboard characterization", () => {
  it("is deterministic: same seed+variant produces identical HTML", () => {
    const seed = makeSeed();
    const a = compressionDashboardRenderer(seed, 5);
    const b = compressionDashboardRenderer(seed, 5);
    expect(a.html).toBe(b.html);
    expect(a.family).toBe("compression-dashboard");
  });

  it("produces different HTML for different variants", () => {
    const seed = makeSeed();
    const v5 = compressionDashboardRenderer(seed, 5);
    const v6 = compressionDashboardRenderer(seed, 6);
    expect(v5.html).not.toBe(v6.html);
  });

  it("meters section: renders one <div class=\"meter\"> per parameter key", () => {
    const seed = makeSeed();
    const { html } = compressionDashboardRenderer(seed, 0);
    const keys = Object.keys(seed.parameters);
    for (const key of keys) {
      // Each key should appear (HTML-escaped, but these are clean ASCII)
      expect(html).toContain(key);
    }
    const meterCount = (html.match(/class="meter"/g) ?? []).length;
    expect(meterCount).toBe(keys.length);
  });

  it("block section: renders exactly 48 <i> elements for the compression field", () => {
    const seed = makeSeed();
    const { html } = compressionDashboardRenderer(seed, 0);
    // The block div contains 48 <i style="opacity:..."> elements
    const iCount = (html.match(/<i style="opacity:/g) ?? []).length;
    expect(iCount).toBe(48);
  });

  it("table section: renders exactly 11 data rows", () => {
    const seed = makeSeed();
    const { html } = compressionDashboardRenderer(seed, 0);
    // Each row is a <tr> with 4 <td>s inside tbody
    const rowCount = (html.match(/<tr><td>/g) ?? []).length;
    expect(rowCount).toBe(11);
  });

  it("title reflects the seed and variant", () => {
    const seed = makeSeed();
    const { title } = compressionDashboardRenderer(seed, 7);
    expect(title).toContain(seed.title);
    expect(title).toContain("07"); // padStart(2,"0") of variant 7
    expect(title).toContain("Compression Dashboard");
  });

  it("produces stable reference HTML snapshot for variant 0 (seed char-test-01)", () => {
    // Pin a few stable substrings that MUST appear regardless of cleanup.
    // This would fail if the index removal accidentally changed any logic.
    const seed = makeSeed();
    const { html } = compressionDashboardRenderer(seed, 0);
    expect(html).toContain('class="artifact compression-dashboard"');
    expect(html).toContain('class="frame dashboard"');
    expect(html).toContain("Compression Field");
    expect(html).toContain("Seed Recipe");
    expect(html).toContain("A fixed prompt for characterization testing.");
    expect(html).toContain("<thead>");
    expect(html).toContain("Signal");
    expect(html).toContain("Motif");
    expect(html).toContain("Load");
  });
});

// ---------------------------------------------------------------------------
// color() — covers the module-private palette() function
// ---------------------------------------------------------------------------

describe("color() / palette() characterization", () => {
  it("returns the correct hex for each palette slot", () => {
    const seed = makeSeed();
    expect(color(seed, 0, "#000000")).toBe("#111111");
    expect(color(seed, 1, "#000000")).toBe("#00ff88");
    expect(color(seed, 2, "#000000")).toBe("#0088ff");
    expect(color(seed, 3, "#000000")).toBe("#ff4400");
  });

  it("falls back to the fallback color for out-of-range index", () => {
    const seed = makeSeed();
    // Index 4 is beyond the 4-entry palette
    const result = color(seed, 4, "#abcdef");
    expect(result).toBe("#abcdef");
  });

  it("uses DEFAULT_PALETTE when seed.palette is empty", () => {
    const seed = makeSeed({ palette: [] });
    // Default palette[0] is "#050706"
    expect(color(seed, 0, "#ffffff")).toBe("#050706");
    expect(color(seed, 1, "#ffffff")).toBe("#b8ff6a");
  });

  it("normalizes 3-digit hex in palette via sanitizeHexColor", () => {
    const seed = makeSeed({
      palette: [{ name: "short", hex: "#F0A" as `#${string}` }],
    });
    // #F0A should be normalized to #ff00aa
    expect(color(seed, 0, "#ffffff")).toBe("#ff00aa");
  });
});

// ---------------------------------------------------------------------------
// renderShell() / listItems() characterization
// ---------------------------------------------------------------------------

describe("renderShell() / listItems() characterization", () => {
  it("includes at most 5 tags as <span class=\"tag\"> elements", () => {
    const seed = makeSeed();
    // seed has 6 tags: alpha, beta, gamma, delta, epsilon, zeta
    const html = renderShell({
      seed,
      variant: 0,
      title: "Test Title",
      bodyClass: "test-body",
      body: "<p>body</p>",
    });
    // listItems slices to 5
    const tagSpanCount = (html.match(/class="tag"/g) ?? []).length;
    expect(tagSpanCount).toBe(5);
    expect(html).toContain(">alpha<");
    expect(html).toContain(">epsilon<");
    // 6th tag (zeta) should NOT appear as a tag span
    expect(html).not.toContain(">zeta<");
  });

  it("includes at most 5 motifs as <span class=\"motif\"> elements", () => {
    const seed = makeSeed();
    // seed has 4 motifs — all 4 should appear (slice(0,5) on 4 items = 4)
    const html = renderShell({
      seed,
      variant: 0,
      title: "Test Title",
      bodyClass: "test-body",
      body: "<p>body</p>",
    });
    const motifSpanCount = (html.match(/class="motif"/g) ?? []).length;
    expect(motifSpanCount).toBe(4);
    expect(html).toContain(">strut<");
    expect(html).toContain(">pivot<");
  });

  it("renderShell is deterministic for fixed inputs", () => {
    const seed = makeSeed();
    const opts = { seed, variant: 3, title: "T", bodyClass: "b", body: "<p/>" };
    expect(renderShell(opts)).toBe(renderShell(opts));
  });

  it("renderShell injects CSS vars from palette colors", () => {
    const seed = makeSeed();
    const html = renderShell({
      seed,
      variant: 0,
      title: "Test",
      bodyClass: "cls",
      body: "",
    });
    // palette[0] = #111111 → --bg
    expect(html).toContain("--bg: #111111");
    // palette[1] = #00ff88 → --primary
    expect(html).toContain("--primary: #00ff88");
    // palette[2] = #0088ff → --secondary
    expect(html).toContain("--secondary: #0088ff");
    // palette[3] = #ff4400 → --warning
    expect(html).toContain("--warning: #ff4400");
  });
});

// ---------------------------------------------------------------------------
// metric() smoke — indirectly used in compressionDashboard rows
// ---------------------------------------------------------------------------

describe("metric() characterization", () => {
  it("clamps output to [3, 97]", () => {
    const seed = makeSeed({ parameters: { ...makeSeed().parameters, density: 0 } });
    const val = metric(seed, "density", 0);
    expect(val).toBeGreaterThanOrEqual(3);
    expect(val).toBeLessThanOrEqual(97);
  });

  it("is variant-sensitive", () => {
    const seed = makeSeed();
    const v0 = metric(seed, "gridIntensity", 0);
    const v1 = metric(seed, "gridIntensity", 1);
    // variant % 7 produces different offsets for 0 and 1
    expect(v0).not.toBe(v1);
  });
});
