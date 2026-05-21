import { describe, expect, it } from "vitest";
import { renderArtifact, renderers } from "../index";
import type { ArtifactFamily, Seed } from "../../types";

const families = [
  "signal-graph",
  "compression-dashboard",
  "ritual-diagram",
  "sourcebook-light-table",
  "interface-panel",
] satisfies ArtifactFamily[];

function makeSeed(artifactFamily: ArtifactFamily): Seed {
  return {
    id: `seed-${artifactFamily}`,
    boardSlug: "ritual-interfaces",
    title: `${artifactFamily} test title`,
    artifactFamily,
    clusterIds: ["cluster-test"],
    referenceIds: ["ref-001", "ref-002"],
    prompt:
      "Generate a dense interface-art artifact without copying source imagery.",
    parameters: {
      density: 72,
      mutation: 23,
      motion: 17,
      gridIntensity: 65,
      signalNoise: 29,
      paletteAdherence: 84,
    },
    tags: ["signal", "archive", "diagnostics"],
    motifs: ["control rail", "thin halo", "ledger notch"],
    palette: [
      { name: "charcoal field", hex: "#050706" },
      { name: "terminal lime", hex: "#b8ff6a" },
      { name: "inspection cyan", hex: "#62e6ff" },
      { name: "warning red", hex: "#ff3d2e" },
    ],
  };
}

function expectStandaloneHtml(html: string, seed: Seed) {
  expect(html.toLowerCase()).toContain("<!doctype html>");
  expect(html).toContain("<style>");
  expect(html).not.toMatch(/<script[^>]+src=/i);
  expect(html).not.toContain("/demo/placeholders/");
  expect(html).not.toContain("https://");
  expect(html).not.toContain("http://");
  expect(html).toContain(seed.title);
}

describe("artifact renderers", () => {
  it.each(families)("renders standalone deterministic %s HTML", (family) => {
    const seed = makeSeed(family);
    const renderer = renderers[family];

    expect(renderer).toBeDefined();
    if (!renderer) {
      throw new Error(`Missing renderer for ${family}`);
    }

    const first = renderer(seed, 2);
    const second = renderer(seed, 2);
    const alternate = renderer(seed, 3);

    expect(first.family).toBe(family);
    expect(first.title).toContain(seed.title);
    expectStandaloneHtml(first.html, seed);
    expect(first.html).toBe(second.html);
    expect(first.html).not.toBe(alternate.html);
  });

  it("renders all initial families through the registry", () => {
    for (const family of families) {
      const seed = makeSeed(family);
      const artifact = renderArtifact(seed, 1);

      expect(artifact.family).toBe(family);
      expectStandaloneHtml(artifact.html, seed);
    }
  });

  it("falls back to a supported renderer for future families", () => {
    const seed = makeSeed("glyph-matrix");
    const artifact = renderArtifact(seed, 1);

    expect(artifact.family).toBe("interface-panel");
    expectStandaloneHtml(artifact.html, seed);
  });
});
