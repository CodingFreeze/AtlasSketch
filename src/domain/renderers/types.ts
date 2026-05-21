import type { Seed } from "../types";

export type RenderedArtifact = {
  html: string;
  title: string;
  family: Seed["artifactFamily"];
};

export type ArtifactRenderer = (
  seed: Seed,
  variant: number,
) => RenderedArtifact;
