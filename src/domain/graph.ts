import type { AtlasEdge, AtlasGraph, AtlasNode } from "./types";

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
