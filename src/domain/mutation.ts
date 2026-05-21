import { safeNumber } from "./renderers/shared";
import type { ArtifactFamily, Seed } from "./types";

const SUPPORTED_FAMILIES = new Set<string>([
  "signal-graph",
  "compression-dashboard",
  "ritual-diagram",
  "sourcebook-light-table",
  "interface-panel",
  "data-cartography",
  "glyph-matrix",
  "mutation-board",
]);

type ParameterKey = keyof Seed["parameters"];
type AdjustableParameterKey = Exclude<ParameterKey, "paletteAdherence">;

const PARAMETER_KEYS = [
  "density",
  "mutation",
  "motion",
  "gridIntensity",
  "signalNoise",
] satisfies AdjustableParameterKey[];

export type MutationControls = {
  artifactFamily?: unknown;
  density?: unknown;
  mutation?: unknown;
  motion?: unknown;
  gridIntensity?: unknown;
  signalNoise?: unknown;
  variant?: unknown;
};

export type MutatedSeed = Seed & {
  parameterHash: string;
  lineage: {
    seed: string;
    variant: string;
    derivedFrom: string[];
  };
};

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function boundedControl(
  controls: MutationControls,
  seed: Seed,
  key: AdjustableParameterKey,
): number {
  return Math.round(safeNumber(controls[key], seed.parameters[key], 0, 100));
}

function familyFromControls(seed: Seed, controls: MutationControls): ArtifactFamily {
  return typeof controls.artifactFamily === "string" &&
    SUPPORTED_FAMILIES.has(controls.artifactFamily)
    ? (controls.artifactFamily as ArtifactFamily)
    : seed.artifactFamily;
}

function parameterDelta(hash: string, key: AdjustableParameterKey, mutation: number): number {
  if (key === "mutation") {
    return 0;
  }

  const keyIndex = PARAMETER_KEYS.indexOf(key);
  const byte = Number.parseInt(hash.slice((keyIndex + 1) * 2, (keyIndex + 2) * 2), 16);
  const direction = (byte % 9) - 4;
  const amplitude = Math.round(mutation / 25);

  return direction * amplitude;
}

export function mutateSeed(seed: Seed, controls: MutationControls): MutatedSeed {
  const artifactFamily = familyFromControls(seed, controls);
  const variant = Math.round(safeNumber(controls.variant, 0, 0, 999));
  const baseParameters = {
    ...seed.parameters,
    density: boundedControl(controls, seed, "density"),
    mutation: boundedControl(controls, seed, "mutation"),
    motion: boundedControl(controls, seed, "motion"),
    gridIntensity: boundedControl(controls, seed, "gridIntensity"),
    signalNoise: boundedControl(controls, seed, "signalNoise"),
    paletteAdherence: Math.round(
      safeNumber(seed.parameters.paletteAdherence, 80, 0, 100),
    ),
  };
  const hashInput = JSON.stringify({
    seedId: seed.id,
    artifactFamily,
    variant,
    parameters: baseParameters,
  });
  const parameterHash = hashString(hashInput);
  const parameters = {
    ...baseParameters,
  };

  for (const key of PARAMETER_KEYS) {
    parameters[key] = Math.round(
      safeNumber(
        baseParameters[key] + parameterDelta(parameterHash, key, baseParameters.mutation),
        baseParameters[key],
        0,
        100,
      ),
    );
  }

  return {
    ...seed,
    id: `${seed.id}-${parameterHash}`,
    title: `${seed.title} / Variant ${variant.toString().padStart(2, "0")}`,
    artifactFamily,
    clusterIds: [...seed.clusterIds],
    referenceIds: [...seed.referenceIds],
    tags: [...seed.tags],
    motifs: [...seed.motifs],
    palette: seed.palette.map((color) => ({ ...color })),
    parameters,
    parameterHash,
    lineage: {
      seed: seed.id,
      variant: parameterHash,
      derivedFrom: [...seed.referenceIds],
    },
  };
}
