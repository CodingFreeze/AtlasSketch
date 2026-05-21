"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CircleDot, FlaskConical, GitBranch, Network } from "lucide-react";

import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { getClusterNodes, getNodeById, getNodeConnections } from "@/domain/graph";
import type { AtlasGraph as AtlasGraphModel, AtlasNode, Cluster, ReferenceBlock } from "@/domain/types";
import { cn } from "@/lib/cn";

type AtlasGraphProps = {
  graph: AtlasGraphModel;
  clusters: Cluster[];
  references: ReferenceBlock[];
};

const kindClasses = {
  cluster: {
    fill: "fill-atlas-lime",
    stroke: "stroke-atlas-lime",
    text: "text-atlas-lime"
  },
  reference: {
    fill: "fill-atlas-cyan",
    stroke: "stroke-atlas-cyan",
    text: "text-atlas-cyan"
  },
  tag: {
    fill: "fill-atlas-paper",
    stroke: "stroke-atlas-paper",
    text: "text-atlas-paper"
  },
  motif: {
    fill: "fill-atlas-magenta",
    stroke: "stroke-atlas-magenta",
    text: "text-atlas-magenta"
  },
  region: {
    fill: "fill-atlas-red",
    stroke: "stroke-atlas-red",
    text: "text-atlas-red"
  }
} as const;

function nodeRadius(node: AtlasNode) {
  return node.kind === "cluster" || node.kind === "region"
    ? 2.9 + node.weight * 0.18
    : 1.8 + node.weight * 0.16;
}

function edgeTone(kind: string) {
  if (kind === "belongs-to") return "stroke-atlas-cyan/45";
  if (kind === "shares-palette") return "stroke-atlas-magenta/45";
  if (kind === "neighbors") return "stroke-atlas-lime/45";
  if (kind === "derives") return "stroke-atlas-red/45";
  return "stroke-atlas-paper/35";
}

function getLabelPlacement(node: AtlasNode, radius: number) {
  if (node.x >= 62) {
    return {
      textAnchor: "end" as const,
      x: node.x - radius - 1.2
    };
  }

  return {
    textAnchor: "start" as const,
    x: node.x + radius + 1.2
  };
}

export function AtlasGraph({ clusters, graph, references }: AtlasGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState(
    graph.nodes.find((node) => node.kind === "region")?.id ?? graph.nodes[0]?.id ?? ""
  );

  const selectedNode = getNodeById(graph, selectedNodeId) ?? graph.nodes[0];
  const connections = selectedNode ? getNodeConnections(graph, selectedNode.id) : { nodes: [], edges: [] };

  const referencesById = useMemo(
    () => new Map(references.map((reference) => [reference.id, reference])),
    [references]
  );
  const clustersById = useMemo(() => new Map(clusters.map((cluster) => [cluster.id, cluster])), [clusters]);
  const selectedReference = selectedNode?.refId ? referencesById.get(selectedNode.refId) : undefined;
  const selectedCluster = selectedNode?.clusterId ? clustersById.get(selectedNode.clusterId) : undefined;
  const selectedClusterNodes = selectedNode?.clusterId ? getClusterNodes(graph, selectedNode.clusterId) : [];
  const palette = selectedReference?.palette ?? selectedCluster?.palette ?? [];
  const motifs = selectedReference?.motifs ?? selectedCluster?.motifs ?? [];
  const relatedReferences = connections.nodes
    .map((node) => (node.refId ? referencesById.get(node.refId) : undefined))
    .filter((reference): reference is ReferenceBlock => Boolean(reference))
    .slice(0, 4);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel
        className="min-w-0 overflow-hidden"
        eyebrow="Atlas Graph"
        title="Spatial signal map"
        actions={<Chip tone="lime">{graph.nodes.length} nodes</Chip>}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="relative min-h-[460px] overflow-hidden border border-atlas-line bg-atlas-black">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(184,255,106,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(184,255,106,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <svg
              aria-hidden="true"
              className="relative h-full min-h-[460px] w-full"
              viewBox="0 0 100 100"
            >
              <rect className="fill-atlas-black/70" height="100" width="100" />
              {graph.edges.map((edge) => {
                const source = getNodeById(graph, edge.source);
                const target = getNodeById(graph, edge.target);
                const isActive = connections.edges.some((activeEdge) => activeEdge.id === edge.id);

                if (!source || !target) return null;

                return (
                  <line
                    className={cn(
                      "transition-opacity",
                      edgeTone(edge.kind),
                      isActive ? "opacity-95" : "opacity-35"
                    )}
                    key={edge.id}
                    strokeWidth={isActive ? 0.55 + edge.weight * 0.5 : 0.25 + edge.weight * 0.35}
                    x1={source.x}
                    x2={target.x}
                    y1={source.y}
                    y2={target.y}
                  />
                );
              })}
              {graph.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connections.nodes.some((connected) => connected.id === node.id);
                const radius = nodeRadius(node);
                const labelPlacement = getLabelPlacement(node, radius);

                return (
                  <g key={node.id}>
                    {(isSelected || isConnected) && (
                      <circle
                        className={cn(kindClasses[node.kind].stroke, "fill-transparent opacity-45")}
                        cx={node.x}
                        cy={node.y}
                        r={radius + 2.2}
                        strokeDasharray="1.2 1.2"
                        strokeWidth="0.35"
                      />
                    )}
                    <circle
                      className={cn(
                        kindClasses[node.kind].fill,
                        kindClasses[node.kind].stroke,
                        "transition-opacity",
                        selectedNode && !isSelected && !isConnected ? "opacity-55" : "opacity-95"
                      )}
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      role="presentation"
                      strokeWidth={isSelected ? 0.9 : 0.35}
                    />
                    {(node.kind === "cluster" || node.kind === "region" || isSelected) && (
                      <text
                        className="pointer-events-none fill-atlas-paper font-mono text-[2px] uppercase tracking-normal"
                        textAnchor={labelPlacement.textAnchor}
                        x={labelPlacement.x}
                        y={node.y + 0.8}
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <aside className="grid content-start gap-2" aria-label="Accessible graph node selector">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
              Node selector
            </p>
            <div className="grid max-h-[460px] gap-1.5 overflow-y-auto pr-1">
              {graph.nodes.map((node) => (
                <button
                  aria-pressed={selectedNode?.id === node.id}
                  className={cn(
                    "grid min-w-0 gap-1 border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan",
                    selectedNode?.id === node.id
                      ? "border-atlas-lime bg-atlas-lime/10"
                      : "border-atlas-line bg-atlas-panel/70 hover:border-atlas-cyan"
                  )}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  type="button"
                >
                  <span className="grid min-w-0 gap-1">
                    <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-atlas-paper">
                      {node.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.12em]",
                        kindClasses[node.kind].text
                      )}
                    >
                      {node.kind}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </Panel>

      <Panel
        as="aside"
        className="min-w-0"
        eyebrow="Selected Node"
        title={selectedNode?.label ?? "No node selected"}
        actions={<Chip tone={selectedNode?.kind === "reference" ? "cyan" : "lime"}>{selectedNode?.kind}</Chip>}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-atlas-line bg-atlas-black/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-atlas-muted">Weight</p>
              <p className="mt-1 font-mono text-xl text-atlas-paper">{selectedNode?.weight ?? 0}</p>
            </div>
            <div className="border border-atlas-line bg-atlas-black/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-atlas-muted">Edges</p>
              <p className="mt-1 font-mono text-xl text-atlas-cyan">{connections.edges.length}</p>
            </div>
            <div className="border border-atlas-line bg-atlas-black/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-atlas-muted">Cluster</p>
              <p className="mt-1 font-mono text-xl text-atlas-lime">{selectedClusterNodes.length}</p>
            </div>
          </div>

          {(selectedReference || selectedCluster) && (
            <div className="grid gap-2">
              <p className="text-sm leading-6 text-atlas-paper/78">
                {selectedReference?.notes ?? selectedCluster?.description}
              </p>
              <p className="text-xs leading-5 text-atlas-muted">
                {selectedReference?.composition ?? selectedCluster?.region}
              </p>
            </div>
          )}

          {palette.length > 0 && (
            <div className="grid gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                Palette
              </p>
              <div className="grid gap-1.5">
                {palette.map((color) => (
                  <div className="flex items-center gap-2" key={`${selectedNode?.id}-${color.hex}`}>
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 border border-atlas-line"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate text-xs text-atlas-paper/78">{color.name}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase text-atlas-muted">{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {motifs.length > 0 && (
            <div className="grid gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">Motifs</p>
              <div className="flex flex-wrap gap-1.5">
                {motifs.map((motif) => (
                  <Chip key={motif}>{motif}</Chip>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
              Direct connections
            </p>
            <div className="grid gap-1.5">
              {connections.nodes.slice(0, 6).map((node) => (
                <button
                  className="flex items-center justify-between gap-2 border border-atlas-line bg-atlas-panel/65 px-2.5 py-2 text-left transition-colors hover:border-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  type="button"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <CircleDot aria-hidden="true" className={kindClasses[node.kind].text} size={13} />
                    <span className="truncate text-xs text-atlas-paper/78">{node.label}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="shrink-0 text-atlas-muted" size={13} />
                </button>
              ))}
            </div>
          </div>

          {relatedReferences.length > 0 && (
            <div className="grid gap-2 border-t border-atlas-line pt-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                Related refs
              </p>
              {relatedReferences.map((reference) => (
                <p className="text-xs leading-5 text-atlas-paper/74" key={reference.id}>
                  {reference.title}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-2 border-t border-atlas-line pt-3">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
              href={`/boards/${graph.boardSlug}/workbench${selectedCluster ? `?cluster=${encodeURIComponent(selectedCluster.id)}` : ""}`}
            >
              <FlaskConical aria-hidden="true" size={15} />
              Open Workbench
            </Link>
          </div>
        </div>
      </Panel>

      <Panel
        className="xl:col-span-2"
        eyebrow="Cluster Index"
        title="Board regions"
        actions={<Chip tone="cyan">{clusters.length} clusters</Chip>}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clusters.map((cluster) => {
            const clusterNodes = getClusterNodes(graph, cluster.id);
            const clusterGraphNode = graph.nodes.find(
              (node) => node.kind === "cluster" && node.clusterId === cluster.id
            );

            return (
              <button
                className="grid min-h-40 gap-3 border border-atlas-line bg-atlas-black/35 p-3 text-left transition-colors hover:border-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                disabled={!clusterGraphNode}
                key={cluster.id}
                onClick={() => {
                  if (clusterGraphNode) setSelectedNodeId(clusterGraphNode.id);
                }}
                type="button"
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-mono text-xs font-semibold uppercase tracking-[0.14em] text-atlas-paper">
                      {cluster.label}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-muted">
                      {cluster.region}
                    </span>
                  </span>
                  <GitBranch aria-hidden="true" className="shrink-0 text-atlas-lime" size={16} />
                </span>
                <span className="text-xs leading-5 text-atlas-paper/70">{cluster.description}</span>
                <span className="mt-auto flex flex-wrap gap-1.5">
                  <Chip tone="lime">{cluster.referenceIds.length} refs</Chip>
                  <Chip tone="cyan">{clusterNodes.length} nodes</Chip>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        className="xl:col-span-2"
        eyebrow="Graph Legend"
        title="Signal types"
        actions={<Network aria-hidden="true" className="text-atlas-cyan" size={18} />}
      >
        <div className="grid gap-2 sm:grid-cols-5">
          {Object.entries(kindClasses).map(([kind, classes]) => (
            <div className="flex items-center gap-2 border border-atlas-line bg-atlas-black/35 p-2" key={kind}>
              <span className={cn("size-2.5 rounded-full", classes.fill)} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-muted">
                {kind}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
