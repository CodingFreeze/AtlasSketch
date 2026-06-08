import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Boxes, FlaskConical, Network, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";
import type { Artifact, Cluster, ReferenceBlock, Seed } from "@/domain/types";

type ReferenceDetailPageProps = {
  params: Promise<{
    boardSlug: string;
    referenceId: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().flatMap((board) => {
    const dataset = getBoardDataset(board.slug);
    return dataset.references.map((reference) => ({
      boardSlug: board.slug,
      referenceId: reference.id
    }));
  });
}

function getReferenceClusters(reference: ReferenceBlock, clusters: Cluster[]) {
  const clusterIds = reference.clusterIds ?? [reference.clusterId];
  return clusters.filter((cluster) => clusterIds.includes(cluster.id));
}

function getRelatedReferences(reference: ReferenceBlock, references: ReferenceBlock[], clusters: Cluster[]) {
  const directClusters = new Set(getReferenceClusters(reference, clusters).map((cluster) => cluster.id));
  const directTags = new Set([...reference.tags, ...reference.motifs]);

  return references
    .filter((candidate) => candidate.id !== reference.id)
    .map((candidate) => {
      const candidateClusters = candidate.clusterIds ?? [candidate.clusterId];
      const clusterScore = candidateClusters.some((clusterId) => directClusters.has(clusterId)) ? 3 : 0;
      const tagScore = [...candidate.tags, ...candidate.motifs].filter((tag) => directTags.has(tag)).length;

      return { candidate, score: clusterScore + tagScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
    .slice(0, 4)
    .map(({ candidate }) => candidate);
}

function getAssociatedSeeds(reference: ReferenceBlock, seeds: Seed[], clusters: Cluster[]) {
  const clusterIds = new Set(getReferenceClusters(reference, clusters).map((cluster) => cluster.id));
  return seeds.filter(
    (seed) =>
      seed.referenceIds.includes(reference.id) || seed.clusterIds.some((clusterId) => clusterIds.has(clusterId))
  );
}

function getAssociatedArtifacts(reference: ReferenceBlock, artifacts: Artifact[], clusters: Cluster[]) {
  const clusterIds = new Set(getReferenceClusters(reference, clusters).map((cluster) => cluster.id));
  return artifacts.filter(
    (artifact) =>
      artifact.referenceIds.includes(reference.id) ||
      artifact.clusterIds.some((clusterId) => clusterIds.has(clusterId))
  );
}

export default async function ReferenceDetailPage({ params }: ReferenceDetailPageProps) {
  const { boardSlug, referenceId } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { artifacts, board, clusters, references, seeds } = dataset;
  const reference = references.find((item) => item.id === referenceId);

  if (!reference) {
    notFound();
  }

  const referenceClusters = getReferenceClusters(reference, clusters);
  const relatedReferences = getRelatedReferences(reference, references, clusters);
  const associatedSeeds = getAssociatedSeeds(reference, seeds, clusters);
  const associatedArtifacts = getAssociatedArtifacts(reference, artifacts, clusters);
  const allTags = [
    ...reference.tags,
    ...(reference.visualTags ?? []),
    ...(reference.semanticTags ?? []),
    ...reference.motifs
  ];

  return (
    <AppFrame activeSection="library" board={board}>
      <div className="grid gap-4">
        <Link
          className="inline-flex w-fit items-center gap-2 border border-atlas-line bg-atlas-panel px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
          href={`/boards/${board.slug}/library`}
        >
          <ArrowLeft aria-hidden="true" size={14} />
          Library
        </Link>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <Panel
            className="min-w-0"
            eyebrow="Reference Dossier"
            title={reference.title}
            actions={<Chip tone="cyan">{reference.sourceClass}</Chip>}
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-atlas-line bg-atlas-black">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(184,255,106,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(98,230,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
              <Image
                alt=""
                className="object-cover opacity-95 mix-blend-screen"
                fill
                priority
                sizes="(min-width: 1280px) 45vw, 100vw"
                src={reference.placeholderPath}
              />
              <span className="absolute left-3 top-3 border border-atlas-lime bg-atlas-black/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-atlas-lime">
                {reference.id}
              </span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <Stat label="Density" value={reference.aestheticAxes.density} tone="lime" />
              <Stat label="Contrast" value={reference.aestheticAxes.contrast} />
              <Stat label="Ritual" value={reference.aestheticAxes.ritual} tone="cyan" />
              <Stat label="Signal" value={reference.aestheticAxes.signal} />
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel eyebrow="Moodboard Lineage" title="What inspired this entry">
              <div className="grid gap-3">
                <p className="text-sm leading-6 text-atlas-paper/78">{reference.notes}</p>
                <p className="border-t border-atlas-line pt-3 text-sm leading-6 text-atlas-paper/70">
                  {reference.composition}
                </p>
                <div className="border-t border-atlas-line pt-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                    Board philosophy
                  </p>
                  <p className="text-sm leading-6 text-atlas-paper/72">{board.philosophy}</p>
                </div>
              </div>
            </Panel>

            <Panel eyebrow="Associated Ideas" title="Clusters, motifs, and tags">
              <div className="grid gap-3">
                <DnaStrip
                  density={reference.aestheticAxes.density}
                  palette={reference.palette.map((color) => color.hex)}
                  tags={allTags}
                />
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                <div className="grid gap-2 border-t border-atlas-line pt-3">
                  {referenceClusters.map((cluster) => (
                    <div className="border border-atlas-line bg-atlas-black/35 p-3" key={cluster.id}>
                      <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-atlas-cyan">
                        <Network aria-hidden="true" size={14} />
                        {cluster.label}
                      </div>
                      <p className="text-sm leading-6 text-atlas-paper/72">{cluster.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel eyebrow="Similar References" title="Neighboring visual ideas">
            <div className="grid gap-3">
              {relatedReferences.map((related) => (
                <Link
                  className="group grid grid-cols-[84px_1fr] gap-3 border border-atlas-line bg-atlas-black/35 p-2 transition-colors hover:border-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={`/boards/${board.slug}/library/${related.id}`}
                  key={related.id}
                >
                  <span className="relative aspect-[4/3] overflow-hidden border border-atlas-line bg-atlas-black">
                    <Image alt="" className="object-cover opacity-85 mix-blend-screen" fill src={related.placeholderPath} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                      {related.id}
                    </span>
                    <span className="mt-1 block font-mono text-xs font-semibold uppercase tracking-[0.1em] text-atlas-paper group-hover:text-atlas-lime">
                      {related.title}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {related.tags.slice(0, 2).map((tag) => (
                        <Chip key={`${related.id}-${tag}`}>{tag}</Chip>
                      ))}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Seed Recipes" title="Ideas this can generate">
            <div className="grid gap-3">
              {associatedSeeds.map((seed) => (
                <Link
                  className="block border border-atlas-line bg-atlas-black/35 p-3 transition-colors hover:border-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={`/boards/${board.slug}/workbench`}
                  key={seed.id}
                >
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-atlas-cyan">
                    <FlaskConical aria-hidden="true" size={14} />
                    {seed.title}
                  </div>
                  <p className="text-sm leading-6 text-atlas-paper/72">{seed.prompt}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Generated Outputs" title="Artifacts using this lineage">
            <div className="grid gap-3">
              {associatedArtifacts.map((artifact) => (
                <Link
                  className="block border border-atlas-line bg-atlas-black/35 p-3 transition-colors hover:border-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={`/boards/${board.slug}/artifacts/${artifact.id}`}
                  key={artifact.id}
                >
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-atlas-lime">
                    <Boxes aria-hidden="true" size={14} />
                    {artifact.title}
                  </div>
                  <p className="text-sm leading-6 text-atlas-paper/72">{artifact.summary}</p>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-muted">
                    <Sparkles aria-hidden="true" size={12} />
                    {artifact.family}
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}
