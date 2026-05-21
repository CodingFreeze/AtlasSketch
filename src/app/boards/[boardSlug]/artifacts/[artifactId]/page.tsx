import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, FileCode2 } from "lucide-react";

import { AppFrame } from "@/components/app/AppFrame";
import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";
import type { Artifact, ReferenceBlock } from "@/domain/types";

type ArtifactDetailPageProps = {
  params: Promise<{
    boardSlug: string;
    artifactId: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().flatMap((board) => {
    const dataset = getBoardDataset(board.slug);
    return dataset.artifacts.map((artifact) => ({
      artifactId: artifact.id,
      boardSlug: board.slug,
    }));
  });
}

function findArtifact(artifacts: Artifact[], artifactId: string) {
  return artifacts.find((artifact) => artifact.id === artifactId);
}

function sourceReferences(references: ReferenceBlock[], artifact: Artifact) {
  const referencesById = new Map(references.map((reference) => [reference.id, reference]));
  return artifact.referenceIds
    .map((referenceId) => referencesById.get(referenceId))
    .filter((reference): reference is ReferenceBlock => Boolean(reference));
}

export default async function ArtifactDetailPage({ params }: ArtifactDetailPageProps) {
  const { artifactId, boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { artifacts, board, clusters, references, seeds } = dataset;
  const artifact = findArtifact(artifacts, artifactId);

  if (!artifact) {
    notFound();
  }

  const seed = seeds.find((item) => item.id === artifact.seedId);
  const sourceRefs = sourceReferences(references, artifact);
  const clusterLabels = artifact.clusterIds.map(
    (clusterId) => clusters.find((cluster) => cluster.id === clusterId)?.label ?? clusterId,
  );

  return (
    <AppFrame activeSection="artifacts" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Artifact Detail"
          title={artifact.title}
          actions={<Chip tone="cyan">{artifact.family}</Chip>}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Artifact" value={artifact.id} tone="lime" />
            <Stat label="Variant" value={artifact.lineage.variant} tone="cyan" />
            <Stat label="Sources" value={sourceRefs.length} />
            <Stat label="Mode" value="Sandboxed" />
          </div>
          <p className="mt-3 border-t border-atlas-line pt-3 text-sm leading-6 text-atlas-paper/78">
            {artifact.summary}
          </p>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel className="min-w-0" eyebrow="Standalone Output" title="Sandboxed preview">
            <div className="aspect-[16/10] min-h-[360px] overflow-hidden rounded border border-atlas-line bg-atlas-black">
              <iframe
                className="h-full w-full border-0 bg-atlas-black"
                sandbox=""
                src={artifact.staticPaths.html}
                title={`${artifact.title} standalone artifact`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-atlas-line pt-3">
              <a
                className="inline-flex h-9 items-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-atlas-muted transition-colors hover:border-atlas-lime hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                href={artifact.staticPaths.html}
              >
                Open standalone
                <ExternalLink aria-hidden="true" size={13} />
              </a>
              <a
                className="inline-flex h-9 items-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                href={artifact.staticPaths.source}
              >
                Source manifest
                <FileCode2 aria-hidden="true" size={13} />
              </a>
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel as="aside" eyebrow="Metadata" title="Artifact DNA">
              <div className="grid gap-3">
                <DnaStrip
                  density={seed?.parameters.density ?? 50}
                  palette={artifact.palette.map((color) => color.hex)}
                  tags={[...artifact.tags, ...artifact.motifs]}
                />
                <dl className="grid gap-2 text-sm">
                  {[
                    ["Family", artifact.family],
                    ["Seed", artifact.lineage.seed],
                    ["Variant", artifact.lineage.variant],
                    ["Clusters", clusterLabels.join(", ")],
                    ["HTML", artifact.staticPaths.html],
                    ["Preview", artifact.staticPaths.preview],
                  ].map(([label, value]) => (
                    <div className="grid gap-1 border-b border-atlas-line pb-2" key={label}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                        {label}
                      </dt>
                      <dd className="break-words font-mono text-xs text-atlas-paper">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Panel>

            <Panel as="aside" eyebrow="Seed Recipe" title={seed?.title ?? artifact.seedId}>
              <div className="grid gap-3">
                <p className="text-sm leading-6 text-atlas-paper/78">
                  {seed?.prompt ?? "Compiled artifact seed unavailable."}
                </p>
                {seed && (
                  <dl className="grid grid-cols-2 gap-2">
                    {Object.entries(seed.parameters).map(([key, value]) => (
                      <div className="border border-atlas-line bg-atlas-black/35 p-2" key={key}>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-muted">
                          {key}
                        </dt>
                        <dd className="mt-1 font-mono text-lg text-atlas-paper">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </Panel>
          </div>
        </div>

        <Panel eyebrow="Source References" title="Placeholder lineage">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {sourceRefs.map((reference) => (
              <article
                className="grid gap-3 border border-atlas-line bg-atlas-black/35 p-3"
                key={reference.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden border border-atlas-line bg-atlas-black">
                  <Image
                    alt=""
                    className="object-cover opacity-90 mix-blend-screen"
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    src={reference.placeholderPath}
                  />
                  <span className="absolute left-2 top-2 border border-atlas-line bg-atlas-black/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-cyan">
                    {reference.id}
                  </span>
                </div>
                <div className="grid gap-2">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-atlas-paper">
                    {reference.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {reference.tags.slice(0, 3).map((tag) => (
                      <Chip key={`${reference.id}-${tag}`} tone="lime">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </AppFrame>
  );
}
