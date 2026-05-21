import { describe, expect, it } from "vitest";

import { mutateSeed } from "../mutation";
import type { ArtifactFamily, Seed } from "../types";

function makeSeed(): Seed {
  return {
    id: "seed-signal-atlas",
    boardSlug: "ritual-interfaces",
    title: "Signal Atlas Rite",
    artifactFamily: "signal-graph",
    clusterIds: ["cluster-signal-cartography"],
    referenceIds: ["ref-001", "ref-002", "ref-003"],
    prompt:
      "Generate a compact signal map with coordinate rails, measured telemetry, and one ceremonial focus ring.",
    parameters: {
      density: 74,
      mutation: 18,
      motion: 24,
      gridIntensity: 82,
      signalNoise: 31,
      paletteAdherence: 88,
    },
    tags: ["signal", "cartography", "telemetry"],
    motifs: ["axis cross", "signal comb", "thin halo"],
    palette: [
      { name: "charcoal field", hex: "#050706" },
      { name: "terminal lime", hex: "#b8ff6a" },
      { name: "inspection cyan", hex: "#62e6ff" },
    ],
  };
}

describe("mutateSeed", () => {
  it("returns the same parameter hash and seed result for the same seed and controls", () => {
    const seed = makeSeed();
    const controls = {
      artifactFamily: "compression-dashboard" satisfies ArtifactFamily,
      density: 65,
      mutation: 34,
      motion: 12,
      gridIntensity: 73,
      signalNoise: 28,
      variant: 2,
    };

    const first = mutateSeed(seed, controls);
    const second = mutateSeed(seed, controls);

    expect(first.parameterHash).toBe(second.parameterHash);
    expect(first).toEqual(second);
    expect(first.lineage).toEqual({
      seed: seed.id,
      variant: first.parameterHash,
      derivedFrom: seed.referenceIds,
    });
  });

  it("returns different parameter hashes and seed results for different mutation levels", () => {
    const seed = makeSeed();
    const calm = mutateSeed(seed, {
      density: 65,
      mutation: 10,
      motion: 12,
      gridIntensity: 73,
      signalNoise: 28,
      variant: 2,
    });
    const active = mutateSeed(seed, {
      density: 65,
      mutation: 80,
      motion: 12,
      gridIntensity: 73,
      signalNoise: 28,
      variant: 2,
    });

    expect(calm.parameterHash).not.toBe(active.parameterHash);
    expect(calm).not.toEqual(active);
    expect(calm.parameters.mutation).not.toBe(active.parameters.mutation);
  });

  it("falls back to the seed family when controls provide an unsupported family", () => {
    const seed = makeSeed();
    const mutated = mutateSeed(seed, {
      artifactFamily: "unknown-family",
      density: "999",
      mutation: "-25",
      motion: "not-a-number",
      gridIntensity: 48,
      signalNoise: null,
      variant: 1,
    });

    expect(mutated.artifactFamily).toBe(seed.artifactFamily);
    expect(mutated.parameters.density).toBeLessThanOrEqual(100);
    expect(mutated.parameters.mutation).toBeGreaterThanOrEqual(0);
    expect(mutated.parameters.motion).toBeGreaterThanOrEqual(0);
    expect(mutated.parameters.signalNoise).toBeGreaterThanOrEqual(0);
  });
});
