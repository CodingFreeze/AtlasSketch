"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import { ArrowRight, CircleDot, FlaskConical, GitBranch, Network } from "lucide-react";

import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { getClusterNodes, getNodeById, getNodeConnections } from "@/domain/graph";
import type { AtlasEdge, AtlasGraph as AtlasGraphModel, AtlasNode, Cluster, ReferenceBlock } from "@/domain/types";
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

function edgeLabel(kind: AtlasEdge["kind"]) {
  if (kind === "belongs-to") return "cluster membership";
  if (kind === "shares-palette") return "shared palette";
  if (kind === "neighbors") return "neighbor";
  if (kind === "derives") return "board region";
  return "expresses";
}

function edgeReason(edge: AtlasEdge, selectedNode: AtlasNode, targetNode: AtlasNode) {
  if (edge.kind === "belongs-to") {
    return `${selectedNode.label} is classified inside ${targetNode.label}.`;
  }
  if (edge.kind === "expresses") {
    return `${selectedNode.label} shares a tag or motif signal with ${targetNode.label}.`;
  }
  if (edge.kind === "shares-palette") {
    return `${selectedNode.label} and ${targetNode.label} reuse one or more palette families.`;
  }
  if (edge.kind === "derives") {
    return `${targetNode.label} contributes to the board-level region around ${selectedNode.label}.`;
  }
  return `${selectedNode.label} is near ${targetNode.label} because tags, motifs, or palette values overlap.`;
}

function clampGraphValue(value: number) {
  return Math.max(5, Math.min(95, value));
}

function nodePositionMap(nodes: AtlasNode[]) {
  return Object.fromEntries(nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStateRef = useRef<{
    lastX: number;
    lastY: number;
    nodeId: string;
  } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState(
    graph.nodes.find((node) => node.kind === "region")?.id ?? graph.nodes[0]?.id ?? ""
  );
  const [nodePositions, setNodePositions] = useState(() => nodePositionMap(graph.nodes));
  const [dragState, setDragState] = useState<{
    lastX: number;
    lastY: number;
    nodeId: string;
  } | null>(null);

  const displayNodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        x: nodePositions[node.id]?.x ?? node.x,
        y: nodePositions[node.id]?.y ?? node.y
      })),
    [graph.nodes, nodePositions]
  );
  const displayGraph = useMemo(
    () => ({
      ...graph,
      nodes: displayNodes
    }),
    [displayNodes, graph]
  );

  const selectedNode = getNodeById(displayGraph, selectedNodeId) ?? displayGraph.nodes[0];
  const connections = selectedNode ? getNodeConnections(displayGraph, selectedNode.id) : { nodes: [], edges: [] };

  const referencesById = useMemo(
    () => new Map(references.map((reference) => [reference.id, reference])),
    [references]
  );
  const clustersById = useMemo(() => new Map(clusters.map((cluster) => [cluster.id, cluster])), [clusters]);
  const selectedReference = selectedNode?.refId ? referencesById.get(selectedNode.refId) : undefined;
  const selectedCluster = selectedNode?.clusterId ? clustersById.get(selectedNode.clusterId) : undefined;
  const selectedClusterNodes = selectedNode?.clusterId ? getClusterNodes(displayGraph, selectedNode.clusterId) : [];
  const palette = selectedReference?.palette ?? selectedCluster?.palette ?? [];
  const motifs = selectedReference?.motifs ?? selectedCluster?.motifs ?? [];
  const directConnectionDetails = connections.edges
    .map((edge) => {
      const connectedId = edge.source === selectedNode?.id ? edge.target : edge.source;
      const node = getNodeById(displayGraph, connectedId);

      if (!node) return undefined;

      return { edge, node };
    })
    .filter((item): item is { edge: AtlasEdge; node: AtlasNode } => Boolean(item))
    .slice(0, 14);
  const relatedReferences = connections.nodes
    .map((node) => (node.refId ? referencesById.get(node.refId) : undefined))
    .filter((reference): reference is ReferenceBlock => Boolean(reference))
    .slice(0, 4);

  function getSvgPointFromClient(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect();

    if (!rect) return { x: 0, y: 0 };

    return {
      x: clampGraphValue(((clientX - rect.left) / rect.width) * 100),
      y: clampGraphValue(((clientY - rect.top) / rect.height) * 100)
    };
  }

  function getSvgPoint(event: PointerEvent<SVGElement> | ReactMouseEvent<SVGElement>) {
    return getSvgPointFromClient(event.clientX, event.clientY);
  }

  function applyGraphDelta(nodeId: string, dx: number, dy: number) {
    const draggedConnections = getNodeConnections(displayGraph, nodeId);

    setNodePositions((current) => {
      const next = { ...current };
      const currentNode = next[nodeId] ?? getNodeById(displayGraph, nodeId);

      if (!currentNode) return current;

      next[nodeId] = {
        x: clampGraphValue(currentNode.x + dx),
        y: clampGraphValue(currentNode.y + dy)
      };

      draggedConnections.edges.forEach((edge) => {
        const connectedId = edge.source === nodeId ? edge.target : edge.source;
        const connectedNode = getNodeById(displayGraph, connectedId);
        const connectedPosition = next[connectedId] ?? connectedNode;

        if (!connectedNode || !connectedPosition || connectedNode.kind === "region") return;

        const pull = edge.kind === "neighbors" ? 0.22 : edge.kind === "belongs-to" ? 0.12 : 0.08;
        next[connectedId] = {
          x: clampGraphValue(connectedPosition.x + dx * pull),
          y: clampGraphValue(connectedPosition.y + dy * pull)
        };
      });

      return next;
    });
  }

  function handleNodePointerDown(event: PointerEvent<SVGGElement>, node: AtlasNode) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getSvgPoint(event);
    setSelectedNodeId(node.id);
    const nextDragState = { lastX: point.x, lastY: point.y, nodeId: node.id };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function handleNodeMouseDown(event: ReactMouseEvent<SVGGElement>, node: AtlasNode) {
    event.preventDefault();
    const point = getSvgPoint(event);
    setSelectedNodeId(node.id);
    const nextDragState = { lastX: point.x, lastY: point.y, nodeId: node.id };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);

    let lastPoint = point;
    const handleDocumentMouseMove = (moveEvent: MouseEvent) => {
      const nextPoint = getSvgPointFromClient(moveEvent.clientX, moveEvent.clientY);
      applyGraphDelta(node.id, nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y);
      lastPoint = nextPoint;
    };
    const handleDocumentMouseUp = () => {
      dragStateRef.current = null;
      setDragState(null);
      window.removeEventListener("mousemove", handleDocumentMouseMove);
      window.removeEventListener("mouseup", handleDocumentMouseUp);
    };

    window.addEventListener("mousemove", handleDocumentMouseMove);
    window.addEventListener("mouseup", handleDocumentMouseUp, { once: true });
  }

  function moveDraggedNode(point: { x: number; y: number }) {
    const activeDragState = dragStateRef.current;

    if (!activeDragState) return;

    const dx = point.x - activeDragState.lastX;
    const dy = point.y - activeDragState.lastY;
    applyGraphDelta(activeDragState.nodeId, dx, dy);
    const nextDragState = { ...activeDragState, lastX: point.x, lastY: point.y };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function handleGraphPointerMove(event: PointerEvent<SVGSVGElement>) {
    moveDraggedNode(getSvgPoint(event));
  }

  function handleGraphMouseMove(event: ReactMouseEvent<SVGSVGElement>) {
    moveDraggedNode(getSvgPoint(event));
  }

  function handleGraphPointerUp() {
    dragStateRef.current = null;
    setDragState(null);
  }

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
              aria-label="Interactive atlas graph. Drag nodes to reposition them; connected nodes tug with the movement."
              className={cn(
                "relative h-full min-h-[460px] w-full touch-none",
                dragState ? "cursor-grabbing" : "cursor-crosshair"
              )}
              onPointerLeave={handleGraphPointerUp}
              onPointerMove={handleGraphPointerMove}
              onPointerUp={handleGraphPointerUp}
              onMouseLeave={handleGraphPointerUp}
              onMouseMove={handleGraphMouseMove}
              onMouseUp={handleGraphPointerUp}
              preserveAspectRatio="none"
              ref={svgRef}
              role="img"
              viewBox="0 0 100 100"
            >
              <rect className="fill-atlas-black/70" height="100" width="100" />
              {graph.edges.map((edge) => {
                const source = getNodeById(displayGraph, edge.source);
                const target = getNodeById(displayGraph, edge.target);
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
              {displayGraph.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connections.nodes.some((connected) => connected.id === node.id);
                const radius = nodeRadius(node);
                const labelPlacement = getLabelPlacement(node, radius);

                return (
                  <g
                    className="cursor-grab active:cursor-grabbing"
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseDown={(event) => handleNodeMouseDown(event, node)}
                    onPointerDown={(event) => handleNodePointerDown(event, node)}
                  >
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
                    <circle
                      className="fill-transparent"
                      cx={node.x}
                      cy={node.y}
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseDown={(event) => handleNodeMouseDown(event, node)}
                      onPointerDown={(event) => handleNodePointerDown(event, node)}
                      r={radius + 2.8}
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
              {displayGraph.nodes.map((node) => (
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

          {selectedReference && (
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-lime hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
              href={`/boards/${graph.boardSlug}/library/${selectedReference.id}`}
            >
              Open reference dossier
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
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
              Direct connections and edge reasons
            </p>
            <div className="grid gap-1.5">
              {directConnectionDetails.map(({ edge, node }) => (
                <button
                  className="grid gap-1 border border-atlas-line bg-atlas-panel/65 px-2.5 py-2 text-left transition-colors hover:border-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  key={`${edge.id}-${node.id}`}
                  onClick={() => setSelectedNodeId(node.id)}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <CircleDot aria-hidden="true" className={kindClasses[node.kind].text} size={13} />
                      <span className="truncate text-xs text-atlas-paper/84">{node.label}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="shrink-0 text-atlas-muted" size={13} />
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    <Chip tone={edge.kind === "neighbors" ? "lime" : edge.kind === "belongs-to" ? "cyan" : "magenta"}>
                      {edgeLabel(edge.kind)}
                    </Chip>
                    {node.clusterId && <Chip>{clustersById.get(node.clusterId)?.label ?? node.clusterId}</Chip>}
                  </span>
                  {selectedNode && (
                    <span className="text-[11px] leading-4 text-atlas-muted">
                      {edgeReason(edge, selectedNode, node)}
                    </span>
                  )}
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
                <Link
                  className="text-xs leading-5 text-atlas-paper/74 transition-colors hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={`/boards/${graph.boardSlug}/library/${reference.id}`}
                  key={reference.id}
                >
                  {reference.title}
                </Link>
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
            const clusterNodes = getClusterNodes(displayGraph, cluster.id);
            const clusterGraphNode = displayGraph.nodes.find(
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
