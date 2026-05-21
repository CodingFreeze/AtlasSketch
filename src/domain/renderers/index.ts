import { compressionDashboardRenderer } from "./compressionDashboard";
import { dataCartographyRenderer } from "./dataCartography";
import { glyphMatrixRenderer } from "./glyphMatrix";
import { interfacePanelRenderer } from "./interfacePanel";
import { ritualDiagramRenderer } from "./ritualDiagram";
import { signalGraphRenderer } from "./signalGraph";
import { sourcebookLightTableRenderer } from "./sourcebookLightTable";
import type { ArtifactFamily, Seed } from "../types";
import type { ArtifactRenderer, RenderedArtifact } from "./types";

export const renderers: Partial<Record<ArtifactFamily, ArtifactRenderer>> = {
  "signal-graph": signalGraphRenderer,
  "compression-dashboard": compressionDashboardRenderer,
  "ritual-diagram": ritualDiagramRenderer,
  "sourcebook-light-table": sourcebookLightTableRenderer,
  "interface-panel": interfacePanelRenderer,
  "data-cartography": dataCartographyRenderer,
  "glyph-matrix": glyphMatrixRenderer,
};

export function renderArtifact(seed: Seed, variant: number): RenderedArtifact {
  const renderer = renderers[seed.artifactFamily] ?? interfacePanelRenderer;
  return renderer(seed, variant);
}

export type { ArtifactRenderer, RenderedArtifact } from "./types";
