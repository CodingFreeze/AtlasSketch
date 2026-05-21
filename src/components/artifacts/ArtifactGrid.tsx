import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import type { Artifact, Cluster, Seed } from "@/domain/types";

type ArtifactGridProps = {
  artifacts: Artifact[];
  boardSlug: string;
  clusters: Cluster[];
  seeds: Seed[];
};

const familyTones = {
  "signal-graph": "cyan",
  "compression-dashboard": "red",
  "ritual-diagram": "magenta",
  "sourcebook-light-table": "neutral",
  "interface-panel": "lime",
  "data-cartography": "cyan",
  "glyph-matrix": "magenta",
  "mutation-board": "neutral",
} satisfies Record<Artifact["family"], "neutral" | "lime" | "cyan" | "red" | "magenta">;

function getClusterLabels(clusters: Cluster[], artifact: Artifact) {
  const clustersById = new Map(clusters.map((cluster) => [cluster.id, cluster.label]));
  return artifact.clusterIds.map((clusterId) => clustersById.get(clusterId) ?? clusterId);
}

export function ArtifactGrid({ artifacts, boardSlug, clusters, seeds }: ArtifactGridProps) {
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));

  return (
    <section
      aria-label="Rendered artifacts"
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {artifacts.map((artifact) => {
        const seed = seedById.get(artifact.seedId);
        const clusterLabels = getClusterLabels(clusters, artifact);

        return (
          <Panel
            as="article"
            className="grid min-h-full gap-3 p-3"
            headingAs="h2"
            key={artifact.id}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded border border-atlas-line bg-atlas-black">
              <iframe
                className="h-full w-full border-0 bg-atlas-black"
                loading="lazy"
                sandbox=""
                src={artifact.staticPaths.html}
                title={`${artifact.title} preview`}
              />
              <span className="absolute left-2 top-2 inline-flex border border-atlas-line bg-atlas-black/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-cyan">
                {artifact.id}
              </span>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <Chip tone={familyTones[artifact.family]}>{artifact.family}</Chip>
                  <Chip>{artifact.lineage.variant}</Chip>
                </div>
                <h2 className="text-pretty font-mono text-sm font-semibold uppercase tracking-[0.1em] text-atlas-paper">
                  {artifact.title}
                </h2>
                <p className="text-sm leading-6 text-atlas-paper/74">{artifact.summary}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {artifact.tags.slice(0, 4).map((tag) => (
                  <Chip key={`${artifact.id}-${tag}`} tone="lime">
                    {tag}
                  </Chip>
                ))}
                {artifact.motifs.slice(0, 3).map((motif) => (
                  <Chip key={`${artifact.id}-${motif}`}>{motif}</Chip>
                ))}
              </div>

              <div className="grid gap-2 border-t border-atlas-line pt-2">
                <div className="flex flex-wrap gap-1" aria-label={`${artifact.title} palette`}>
                  {artifact.palette.map((color) => (
                    <span
                      className="h-5 min-w-12 border border-atlas-line px-1 font-mono text-[9px] uppercase leading-5 tracking-[0.08em] text-atlas-paper/80"
                      key={`${artifact.id}-${color.hex}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {color.name}
                    </span>
                  ))}
                </div>
                <DnaStrip
                  density={seed?.parameters.density ?? 50}
                  palette={artifact.palette.map((color) => color.hex)}
                  tags={[...artifact.tags, ...artifact.motifs]}
                />
              </div>

              <dl className="grid gap-1.5 border-t border-atlas-line pt-2 text-xs">
                <div className="flex min-w-0 justify-between gap-3">
                  <dt className="font-mono uppercase tracking-[0.14em] text-atlas-muted">Seed</dt>
                  <dd className="truncate font-mono text-atlas-paper">{artifact.lineage.seed}</dd>
                </div>
                <div className="flex min-w-0 justify-between gap-3">
                  <dt className="font-mono uppercase tracking-[0.14em] text-atlas-muted">Refs</dt>
                  <dd className="truncate font-mono text-atlas-paper">
                    {artifact.lineage.derivedFrom.join(", ")}
                  </dd>
                </div>
                <div className="flex min-w-0 justify-between gap-3">
                  <dt className="font-mono uppercase tracking-[0.14em] text-atlas-muted">Clusters</dt>
                  <dd className="truncate text-right font-mono text-atlas-paper">
                    {clusterLabels.join(", ")}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-atlas-line pt-3">
                <Link
                  className="inline-flex h-9 items-center justify-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={`/boards/${boardSlug}/artifacts/${artifact.id}`}
                >
                  Detail
                  <ArrowRight aria-hidden="true" size={13} />
                </Link>
                <a
                  className="inline-flex h-9 items-center justify-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-atlas-muted transition-colors hover:border-atlas-lime hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={artifact.staticPaths.html}
                >
                  Standalone
                  <ExternalLink aria-hidden="true" size={13} />
                </a>
              </div>
            </div>
          </Panel>
        );
      })}
    </section>
  );
}
