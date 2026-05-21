import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, Network } from "lucide-react";
import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";

type BoardPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { board, clusters, references } = dataset;
  const averageDensity =
    references.reduce((total, reference) => total + reference.aestheticAxes.density, 0) /
    Math.max(1, references.length);

  return (
    <AppFrame activeSection="boards" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Board Overview"
          title={board.title}
          actions={<Chip tone="lime">{board.status}</Chip>}
        >
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-3">
              <p className="text-base leading-7 text-atlas-paper/82">{board.summary}</p>
              <p className="text-sm leading-6 text-atlas-muted">{board.philosophy}</p>
              <DnaStrip
                density={averageDensity}
                tags={[...board.topTags, ...board.motifMarks]}
                palette={board.palette.map((color) => color.hex)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="References" value={board.stats.references} tone="lime" />
              <Stat label="Clusters" value={board.stats.clusters} tone="cyan" />
              <Stat label="Seeds" value={board.stats.seeds} />
              <Stat label="Artifacts" value={board.stats.artifacts} />
            </div>
          </div>
        </Panel>

        <section className="grid gap-3 md:grid-cols-3" aria-label="Board entry points">
          <Link
            className="group grid gap-2 border border-atlas-line bg-atlas-panel/80 p-4 transition-colors hover:border-atlas-cyan hover:text-atlas-cyan"
            href={`/boards/${board.slug}/library`}
          >
            <span className="flex items-center justify-between gap-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-2">
                <BookOpen aria-hidden="true" size={16} />
                Library
              </span>
              <ArrowRight aria-hidden="true" size={15} />
            </span>
            <span className="text-sm leading-6 text-atlas-muted group-hover:text-atlas-paper/78">
              Reference cards, tags, motifs, and clusters.
            </span>
          </Link>
          {[
            { label: "Atlas", detail: "Spatial graph arrives in the next task.", Icon: Network },
            {
              label: "Workbench",
              detail: "Deterministic seed controls arrive later.",
              Icon: FlaskConical
            }
          ].map(({ detail, Icon, label }) => (
            <div
              aria-disabled="true"
              className="grid gap-2 border border-atlas-line bg-atlas-panel/45 p-4 text-atlas-muted/70"
              key={label}
            >
              <span className="flex items-center justify-between gap-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]">
                <span className="inline-flex items-center gap-2">
                  <Icon aria-hidden="true" size={16} />
                  {label}
                </span>
                <Chip>Planned</Chip>
              </span>
              <span className="text-sm leading-6 text-atlas-muted">{detail}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2" aria-label="Clusters">
          {clusters.map((cluster) => (
            <Panel
              as="article"
              headingAs="h2"
              key={cluster.id}
              eyebrow={cluster.region}
              title={cluster.label}
              actions={<Chip tone="cyan">{cluster.referenceIds.length} refs</Chip>}
            >
              <div className="grid gap-3">
                <p className="text-sm leading-6 text-atlas-paper/78">{cluster.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...cluster.tags, ...cluster.motifs].slice(0, 8).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                <DnaStrip
                  density={(cluster.referenceIds.length / board.stats.references) * 100}
                  tags={[...cluster.tags, ...cluster.motifs]}
                  palette={cluster.palette.map((color) => color.hex)}
                />
              </div>
            </Panel>
          ))}
        </section>
      </div>
    </AppFrame>
  );
}
