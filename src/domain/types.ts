export type ArtifactFamily =
  | "signal-graph"
  | "compression-dashboard"
  | "ritual-diagram"
  | "sourcebook-light-table"
  | "interface-panel"
  | "data-cartography"
  | "glyph-matrix"
  | "mutation-board";

export type SourceClass =
  | "archive-scan"
  | "control-room"
  | "diagram"
  | "instrument-panel"
  | "manuscript"
  | "terminal";

export type AtlasNodeKind =
  | "reference"
  | "cluster"
  | "tag"
  | "motif"
  | "region";

export type AtlasEdgeKind =
  | "belongs-to"
  | "expresses"
  | "shares-palette"
  | "derives"
  | "neighbors";

export type PaletteColor = {
  name: string;
  hex: `#${string}`;
};

export type BoardStats = {
  references: number;
  clusters: number;
  seeds: number;
  artifacts: number;
};

export type Board = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  philosophy: string;
  status: "compiled" | "draft";
  version: string;
  accent: PaletteColor;
  topTags: string[];
  motifMarks: string[];
  palette: PaletteColor[];
  stats: BoardStats;
  paths: {
    placeholders: string;
    artifacts: string;
  };
};

export type ReferenceBlock = {
  id: string;
  boardSlug: string;
  title: string;
  placeholderPath: string;
  sourceClass: SourceClass;
  clusterId: string;
  clusterIds?: string[];
  tags: string[];
  visualTags?: string[];
  semanticTags?: string[];
  motifs: string[];
  palette: PaletteColor[];
  composition: string;
  notes: string;
  aestheticAxes: {
    density: number;
    contrast: number;
    ritual: number;
    signal: number;
  };
};

export type Cluster = {
  id: string;
  boardSlug: string;
  label: string;
  description: string;
  referenceIds: string[];
  tags: string[];
  motifs: string[];
  palette: PaletteColor[];
  suggestedSeedIds: string[];
  region: string;
};

export type AtlasNode = {
  id: string;
  kind: AtlasNodeKind;
  label: string;
  x: number;
  y: number;
  weight: number;
  refId?: string;
  clusterId?: string;
};

export type AtlasEdge = {
  id: string;
  source: string;
  target: string;
  kind: AtlasEdgeKind;
  weight: number;
};

export type AtlasGraph = {
  boardSlug: string;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
};

export type Seed = {
  id: string;
  boardSlug: string;
  title: string;
  artifactFamily: ArtifactFamily;
  clusterIds: string[];
  referenceIds: string[];
  prompt: string;
  parameters: {
    density: number;
    mutation: number;
    motion: number;
    gridIntensity: number;
    signalNoise: number;
    paletteAdherence: number;
  };
  tags: string[];
  motifs: string[];
  palette: PaletteColor[];
};

export type Artifact = {
  id: string;
  boardSlug: string;
  title: string;
  family: ArtifactFamily;
  summary: string;
  seedId: string;
  clusterIds: string[];
  referenceIds: string[];
  tags: string[];
  motifs: string[];
  palette: PaletteColor[];
  staticPaths: {
    html: string;
    preview: string;
    source: string;
  };
  lineage: {
    seed: string;
    variant: string;
    derivedFrom: string[];
  };
};
