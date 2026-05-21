"use client";

import { useEffect, useMemo, useState } from "react";
import { Dices, FlaskConical } from "lucide-react";

import { ArtifactPreview } from "@/components/artifacts/ArtifactPreview";
import { DnaStrip } from "@/components/dna/DnaStrip";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { renderArtifact } from "@/domain/renderers";
import { mutateSeed } from "@/domain/mutation";
import type { ArtifactFamily, Cluster, Seed } from "@/domain/types";
import { cn } from "@/lib/cn";

const FAMILIES = [
  "signal-graph",
  "compression-dashboard",
  "ritual-diagram",
  "sourcebook-light-table",
  "interface-panel",
] satisfies ArtifactFamily[];

type RenderableFamily = (typeof FAMILIES)[number];

const CONTROL_LABELS = {
  density: "Density",
  mutation: "Mutation",
  motion: "Motion",
  gridIntensity: "Grid intensity",
  signalNoise: "Signal noise",
} as const;

type ControlKey = keyof typeof CONTROL_LABELS;

type WorkbenchProps = {
  boardSlug: string;
  clusters: Cluster[];
  seeds: Seed[];
};

type Controls = {
  artifactFamily: ArtifactFamily;
  density: number;
  mutation: number;
  motion: number;
  gridIntensity: number;
  signalNoise: number;
};

function isRenderableFamily(family: ArtifactFamily): family is RenderableFamily {
  return (FAMILIES as readonly ArtifactFamily[]).includes(family);
}

function controlsFromSeed(seed: Seed): Controls {
  return {
    artifactFamily: isRenderableFamily(seed.artifactFamily) ? seed.artifactFamily : "interface-panel",
    density: seed.parameters.density,
    mutation: seed.parameters.mutation,
    motion: seed.parameters.motion,
    gridIntensity: seed.parameters.gridIntensity,
    signalNoise: seed.parameters.signalNoise,
  };
}

function getClusterLabel(clusters: Cluster[], clusterId: string) {
  return clusters.find((cluster) => cluster.id === clusterId)?.label ?? clusterId;
}

export function Workbench({ boardSlug, clusters, seeds }: WorkbenchProps) {
  const [selectedSeedId, setSelectedSeedId] = useState(seeds[0]?.id ?? "");
  const selectedSeed = seeds.find((seed) => seed.id === selectedSeedId) ?? seeds[0];
  const [controls, setControls] = useState(() => controlsFromSeed(selectedSeed));
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const clusterId = new URLSearchParams(window.location.search).get("cluster");
      const clusterSeed = seeds.find((seed) => clusterId && seed.clusterIds.includes(clusterId));

      if (clusterSeed) {
        setSelectedSeedId(clusterSeed.id);
        setControls(controlsFromSeed(clusterSeed));
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [seeds]);

  const previews = useMemo(
    () =>
      [variant, variant + 1, variant + 2].map((previewVariant) => {
        const mutatedSeed = mutateSeed(selectedSeed, {
          ...controls,
          variant: previewVariant,
        });

        return {
          artifact: renderArtifact(mutatedSeed, previewVariant),
          seed: mutatedSeed,
          variant: previewVariant,
        };
      }),
    [controls, selectedSeed, variant],
  );
  const activePreview = previews[0];

  function updateControl(key: ControlKey, value: string) {
    setControls((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel
        as="aside"
        className="xl:sticky xl:top-24 xl:self-start"
        eyebrow="Seed Console"
        title="Workbench controls"
        actions={<Chip tone="lime">Local only</Chip>}
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
              Seed
            </span>
            <select
              className="h-10 rounded border border-atlas-line bg-atlas-black px-3 font-mono text-xs uppercase tracking-[0.08em] text-atlas-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-atlas-cyan"
              onChange={(event) => {
                const nextSeed = seeds.find((seed) => seed.id === event.target.value) ?? selectedSeed;
                setSelectedSeedId(nextSeed.id);
                setControls(controlsFromSeed(nextSeed));
              }}
              value={selectedSeed.id}
            >
              {seeds.map((seed) => (
                <option key={seed.id} value={seed.id}>
                  {seed.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
              Artifact family
            </span>
            <select
              className="h-10 rounded border border-atlas-line bg-atlas-black px-3 font-mono text-xs uppercase tracking-[0.08em] text-atlas-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-atlas-cyan"
              onChange={(event) =>
                setControls((current) => ({
                  ...current,
                  artifactFamily: event.target.value as ArtifactFamily,
                }))
              }
              value={controls.artifactFamily}
            >
              {FAMILIES.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3">
            {(Object.keys(CONTROL_LABELS) as ControlKey[]).map((key) => (
              <label className="grid gap-2" key={key}>
                <span className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  <span>{CONTROL_LABELS[key]}</span>
                  <span className="tabular-nums text-atlas-paper">{controls[key]}</span>
                </span>
                <input
                  aria-label={CONTROL_LABELS[key]}
                  className="h-2 accent-atlas-lime"
                  max={100}
                  min={0}
                  onChange={(event) => updateControl(key, event.target.value)}
                  step={1}
                  type="range"
                  value={controls[key]}
                />
              </label>
            ))}
          </div>

          <div className="grid gap-2 border-t border-atlas-line pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
              Generate variant
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((item) => (
                <Button
                  aria-pressed={variant === item}
                  className={cn("h-9 px-0", variant === item && "border-atlas-lime text-atlas-lime")}
                  key={item}
                  onClick={() => setVariant(item)}
                  size="sm"
                  variant={variant === item ? "secondary" : "ghost"}
                >
                  V{item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4">
        <Panel
          eyebrow="Selected lineage"
          title={selectedSeed.title}
          actions={
            <span className="inline-flex items-center gap-2">
              <FlaskConical aria-hidden="true" size={15} />
              <Chip tone="cyan">{activePreview.seed.parameterHash}</Chip>
            </span>
          }
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-sm leading-6 text-atlas-paper/78">{selectedSeed.prompt}</p>
              <DnaStrip
                density={activePreview.seed.parameters.density}
                palette={activePreview.seed.palette.map((color) => color.hex)}
                tags={[...activePreview.seed.tags, ...activePreview.seed.motifs]}
              />
            </div>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-atlas-line pb-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  Seed
                </dt>
                <dd className="truncate font-mono text-xs text-atlas-paper">{activePreview.seed.lineage.seed}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-atlas-line pb-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  Board
                </dt>
                <dd className="truncate font-mono text-xs text-atlas-paper">{boardSlug}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-atlas-line pb-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  Family
                </dt>
                <dd className="truncate font-mono text-xs text-atlas-paper">
                  {activePreview.seed.artifactFamily}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  Clusters
                </dt>
                <dd className="truncate text-right font-mono text-xs text-atlas-paper">
                  {activePreview.seed.clusterIds
                    .map((clusterId) => getClusterLabel(clusters, clusterId))
                    .join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        </Panel>

        <section className="grid gap-3 lg:grid-cols-3" aria-label="Generated artifact previews">
          {previews.map(({ artifact, seed, variant: previewVariant }, index) => (
            <Panel
              as="article"
              className={cn(index === 0 && "lg:col-span-2 lg:row-span-2")}
              headingAs="h3"
              key={seed.parameterHash}
              eyebrow={`Variant ${previewVariant}`}
              title={artifact.title}
              actions={
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-muted">
                  <Dices aria-hidden="true" size={13} />
                  {seed.parameterHash.slice(0, 6)}
                </span>
              }
            >
              <ArtifactPreview
                artifact={artifact}
                className={index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}
                title={`${artifact.title} preview`}
              />
            </Panel>
          ))}
        </section>
      </div>
    </div>
  );
}
