import Link from "next/link";
import { ArrowRight, Layers, Network, RadioTower } from "lucide-react";

import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import type { BoardDataset } from "@/domain/demoData";
import type { Board } from "@/domain/types";

type BoardConsoleProps = {
  boards: Board[];
  datasets: Record<string, BoardDataset>;
};

export function BoardConsole({ boards, datasets }: BoardConsoleProps) {
  return (
    <div className="grid gap-4">
      <Panel
        eyebrow="Board Console"
        title="Compiled demo boards"
        actions={<Chip tone="cyan">Static public mode</Chip>}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Boards" value={boards.length} tone="lime" />
          <Stat
            label="References"
            value={boards.reduce((total, board) => total + board.stats.references, 0)}
          />
          <Stat
            label="Clusters"
            value={boards.reduce((total, board) => total + board.stats.clusters, 0)}
            tone="cyan"
          />
          <Stat
            label="Artifacts"
            value={boards.reduce((total, board) => total + board.stats.artifacts, 0)}
          />
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Available boards">
        {boards.map((board) => {
          const dataset = datasets[board.slug];
          const density =
            dataset.references.reduce((total, reference) => total + reference.aestheticAxes.density, 0) /
            Math.max(1, dataset.references.length);

          return (
            <Panel
              as="article"
              className="flex min-h-full flex-col"
              headingAs="h2"
              key={board.id}
              title={board.title}
              eyebrow={`${board.status} / ${board.version}`}
              actions={<Chip tone="lime">{board.stats.references} refs</Chip>}
            >
              <div className="grid flex-1 gap-4">
                <p className="text-sm leading-6 text-atlas-paper/78">{board.summary}</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Stat label="Clusters" value={board.stats.clusters} />
                  <Stat label="Seeds" value={board.stats.seeds} tone="cyan" />
                  <Stat label="Artifacts" value={board.stats.artifacts} />
                  <Stat label="Refs" value={board.stats.references} tone="lime" />
                </div>
                <div className="grid gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                    Top tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {board.topTags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
                <DnaStrip
                  density={density}
                  tags={[...board.topTags, ...board.motifMarks]}
                  palette={board.palette.map((color) => color.hex)}
                />
                <div className="grid gap-2 border-t border-atlas-line pt-3 sm:grid-cols-3">
                  <Link
                    className="inline-flex h-10 items-center justify-center gap-2 border border-atlas-lime bg-atlas-lime/10 px-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-lime transition-colors hover:bg-atlas-lime/15"
                    href={`/boards/${board.slug}`}
                  >
                    <Layers aria-hidden="true" size={15} />
                    Open board
                    <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center gap-2 border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan"
                    href={`/boards/${board.slug}/library`}
                  >
                    <RadioTower aria-hidden="true" size={15} />
                    Reference library
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center gap-2 border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan"
                    href={`/boards/${board.slug}/atlas`}
                  >
                    <Network aria-hidden="true" size={15} />
                    Atlas graph
                  </Link>
                </div>
              </div>
            </Panel>
          );
        })}
      </section>
    </div>
  );
}
