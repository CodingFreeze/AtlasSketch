import { describe, expect, it } from "vitest";

import { getClusterNodes, getNodeById, getNodeConnections } from "../graph";
import type { AtlasGraph } from "../types";

const graph = {
  boardSlug: "test-board",
  nodes: [
    {
      id: "cluster-signal",
      kind: "cluster",
      label: "Signal",
      x: 50,
      y: 50,
      weight: 9,
      clusterId: "cluster-signal"
    },
    {
      id: "ref-a",
      kind: "reference",
      label: "Reference A",
      x: 64,
      y: 46,
      weight: 5,
      refId: "ref-a",
      clusterId: "cluster-signal"
    },
    {
      id: "ref-b",
      kind: "reference",
      label: "Reference B",
      x: 38,
      y: 56,
      weight: 4,
      refId: "ref-b",
      clusterId: "cluster-signal"
    },
    {
      id: "tag-ritual",
      kind: "tag",
      label: "ritual",
      x: 50,
      y: 34,
      weight: 6
    },
    {
      id: "ref-other",
      kind: "reference",
      label: "Other Reference",
      x: 14,
      y: 18,
      weight: 4,
      refId: "ref-other",
      clusterId: "cluster-other"
    }
  ],
  edges: [
    {
      id: "edge-a-cluster",
      source: "ref-a",
      target: "cluster-signal",
      kind: "belongs-to",
      weight: 1
    },
    {
      id: "edge-b-cluster",
      source: "ref-b",
      target: "cluster-signal",
      kind: "belongs-to",
      weight: 1
    },
    {
      id: "edge-cluster-tag",
      source: "cluster-signal",
      target: "tag-ritual",
      kind: "expresses",
      weight: 0.8
    }
  ]
} satisfies AtlasGraph;

describe("graph helpers", () => {
  it("finds a graph node by id", () => {
    expect(getNodeById(graph, "ref-a")).toEqual(graph.nodes[1]);
    expect(getNodeById(graph, "missing-node")).toBeUndefined();
  });

  it("returns directly connected nodes and edges for a node id", () => {
    expect(getNodeConnections(graph, "cluster-signal")).toEqual({
      nodes: [graph.nodes[1], graph.nodes[2], graph.nodes[3]],
      edges: graph.edges
    });
  });

  it("returns empty connection arrays for missing node ids", () => {
    expect(getNodeConnections(graph, "missing-node")).toEqual({ nodes: [], edges: [] });
  });

  it("filters nodes by cluster id", () => {
    expect(getClusterNodes(graph, "cluster-signal")).toEqual([
      graph.nodes[0],
      graph.nodes[1],
      graph.nodes[2]
    ]);
  });
});
