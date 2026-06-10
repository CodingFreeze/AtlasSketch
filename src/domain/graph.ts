import type { AtlasEdge, AtlasGraph, AtlasNode, Board, Cluster, ReferenceBlock } from "./types";

export type NodeConnections = {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
};

export function getNodeById(graph: AtlasGraph, nodeId: string): AtlasNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getNodeConnections(graph: AtlasGraph, nodeId: string): NodeConnections {
  if (!getNodeById(graph, nodeId)) {
    return { nodes: [], edges: [] };
  }

  const edges = graph.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
  const connectedIds = new Set(
    edges.map((edge) => (edge.source === nodeId ? edge.target : edge.source))
  );

  return {
    nodes: graph.nodes.filter((node) => connectedIds.has(node.id)),
    edges
  };
}

export function getClusterNodes(graph: AtlasGraph, clusterId: string): AtlasNode[] {
  return graph.nodes.filter((node) => node.clusterId === clusterId);
}

const clusterAnchors: Record<string, { x: number; y: number }> = {
  "cluster-signal-cartography": { x: 73, y: 28 },
  "cluster-compression-dashboards": { x: 70, y: 73 },
  "cluster-glyph-matrices": { x: 29, y: 58 },
  "cluster-sourcebook-light-tables": { x: 31, y: 24 },
};

// Fallback anchors by quadrant so any board's clusters spread out even when
// its specific cluster ids are not enumerated above.
const regionAnchors: Record<string, { x: number; y: number }> = {
  northeast: { x: 73, y: 28 },
  southeast: { x: 70, y: 73 },
  southwest: { x: 29, y: 58 },
  northwest: { x: 31, y: 24 },
};

function anchorFor(cluster: Cluster): { x: number; y: number } {
  return clusterAnchors[cluster.id] ?? regionAnchors[cluster.region] ?? { x: 50, y: 50 };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function countValues(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return counts;
}

function clampCoordinate(value: number): number {
  return Math.max(7, Math.min(93, value));
}

function referencePosition(cluster: Cluster, index: number, total: number) {
  const anchor = anchorFor(cluster);
  const angle = (Math.PI * 2 * index) / Math.max(total, 1) - Math.PI / 2;
  const ring = 10 + (index % 2) * 5;

  return {
    x: clampCoordinate(anchor.x + Math.cos(angle) * ring),
    y: clampCoordinate(anchor.y + Math.sin(angle) * ring),
  };
}

function sharedScore(a: ReferenceBlock, b: ReferenceBlock): number {
  const aValues = new Set([...a.tags, ...a.motifs, ...a.palette.map((color) => color.hex)]);
  return [...b.tags, ...b.motifs, ...b.palette.map((color) => color.hex)].filter((value) =>
    aValues.has(value)
  ).length;
}

function makeEdge(id: string, source: string, target: string, kind: AtlasEdge["kind"], weight: number) {
  return { id, source, target, kind, weight } satisfies AtlasEdge;
}

export function buildAtlasGraph(board: Board, clusters: Cluster[], references: ReferenceBlock[]): AtlasGraph {
  const nodes: AtlasNode[] = [
    {
      id: "region-ceremonial-instrumentation",
      kind: "region",
      label: "Ceremonial Instrumentation",
      x: 52,
      y: 52,
      weight: 10,
    },
  ];
  const edges: AtlasEdge[] = [];
  const edgeIds = new Set<string>();
  const referenceById = new Map(references.map((reference) => [reference.id, reference]));
  const tagCounts = countValues(references.flatMap((reference) => reference.tags));
  const motifCounts = countValues(references.flatMap((reference) => reference.motifs));
  const sharedTags = [...tagCounts.entries()].filter(([, count]) => count >= 2);
  const sharedMotifs = [...motifCounts.entries()].filter(([, count]) => count >= 2);

  function addEdge(edge: AtlasEdge) {
    if (edgeIds.has(edge.id)) return;
    edgeIds.add(edge.id);
    edges.push(edge);
  }

  clusters.forEach((cluster) => {
    const anchor = anchorFor(cluster);
    nodes.push({
      id: cluster.id,
      kind: "cluster",
      label: cluster.label,
      x: anchor.x,
      y: anchor.y,
      weight: Math.min(10, 5 + cluster.referenceIds.length),
      clusterId: cluster.id,
    });
    addEdge(makeEdge(`edge-region-${cluster.id}`, "region-ceremonial-instrumentation", cluster.id, "derives", 0.7));

    const clusterReferences = cluster.referenceIds
      .map((referenceId) => referenceById.get(referenceId))
      .filter((reference): reference is ReferenceBlock => Boolean(reference));

    clusterReferences.forEach((reference, index) => {
      const position = referencePosition(cluster, index, clusterReferences.length);
      nodes.push({
        id: reference.id,
        kind: "reference",
        label: reference.title,
        x: position.x,
        y: position.y,
        weight: 3 + Math.round((reference.aestheticAxes.density + reference.aestheticAxes.signal) / 55),
        refId: reference.id,
        clusterId: cluster.id,
      });
      addEdge(makeEdge(`edge-${reference.id}-${cluster.id}`, reference.id, cluster.id, "belongs-to", 1));
    });
  });

  sharedTags.forEach(([tag, count], index) => {
    const angle = (Math.PI * 2 * index) / Math.max(sharedTags.length, 1) + 0.3;
    const id = `tag-${slugify(tag)}`;
    nodes.push({
      id,
      kind: "tag",
      label: tag,
      x: clampCoordinate(52 + Math.cos(angle) * 23),
      y: clampCoordinate(51 + Math.sin(angle) * 19),
      weight: Math.min(9, 3 + count),
    });

    references
      .filter((reference) => reference.tags.includes(tag))
      .forEach((reference) => addEdge(makeEdge(`edge-${reference.id}-${id}`, reference.id, id, "expresses", 0.45)));
  });

  sharedMotifs.forEach(([motif, count], index) => {
    const angle = (Math.PI * 2 * index) / Math.max(sharedMotifs.length, 1) - 0.7;
    const id = `motif-${slugify(motif)}`;
    nodes.push({
      id,
      kind: "motif",
      label: motif,
      x: clampCoordinate(50 + Math.cos(angle) * 32),
      y: clampCoordinate(52 + Math.sin(angle) * 27),
      weight: Math.min(8, 2 + count),
    });

    references
      .filter((reference) => reference.motifs.includes(motif))
      .forEach((reference) => addEdge(makeEdge(`edge-${reference.id}-${id}`, reference.id, id, "expresses", 0.4)));
  });

  references.forEach((reference, index) => {
    const scored = references
      .filter((candidate) => candidate.id !== reference.id)
      .map((candidate) => ({ candidate, score: sharedScore(reference, candidate) }))
      .filter(({ score }) => score >= 3)
      .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
      .slice(0, 3);

    scored.forEach(({ candidate, score }) => {
      if (reference.id > candidate.id) return;
      addEdge(
        makeEdge(
          `edge-neighbor-${reference.id}-${candidate.id}`,
          reference.id,
          candidate.id,
          "neighbors",
          Math.min(0.9, 0.28 + score * 0.08)
        )
      );
    });

    const nextReference = references[index + 1];
    if (nextReference && reference.clusterId === nextReference.clusterId) {
      addEdge(makeEdge(`edge-sequence-${reference.id}-${nextReference.id}`, reference.id, nextReference.id, "neighbors", 0.32));
    }
  });

  clusters.forEach((cluster) => {
    clusters
      .filter((candidate) => candidate.id > cluster.id)
      .forEach((candidate) => {
        const sharedPalette = cluster.palette.some((color) =>
          candidate.palette.some((candidateColor) => candidateColor.hex === color.hex)
        );
        const sharedTagsCount = candidate.tags.filter((tag) => cluster.tags.includes(tag)).length;

        if (sharedPalette || sharedTagsCount > 0) {
          addEdge(
            makeEdge(
              `edge-cluster-neighbor-${cluster.id}-${candidate.id}`,
              cluster.id,
              candidate.id,
              sharedPalette ? "shares-palette" : "neighbors",
              sharedPalette ? 0.5 : 0.42
            )
          );
        }
      });
  });

  return {
    boardSlug: board.slug,
    nodes,
    edges,
  };
}
