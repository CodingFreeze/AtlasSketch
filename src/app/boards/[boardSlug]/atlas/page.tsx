import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AppFrame } from "@/components/app/AppFrame";
import { AtlasGraph } from "@/components/atlas/AtlasGraph";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";

type AtlasPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

export default async function AtlasPage({ params }: AtlasPageProps) {
  const { boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { atlas, board, clusters, references } = dataset;
  const edgeKinds = new Set(atlas.edges.map((edge) => edge.kind));

  return (
    <AppFrame activeSection="atlas" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Atlas"
          title={`${board.title} graph`}
          actions={
            <Link
              className="inline-flex h-8 items-center gap-2 rounded border border-atlas-line bg-atlas-panel px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-atlas-muted transition-colors hover:border-atlas-cyan hover:text-atlas-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
              href={`/boards/${board.slug}/workbench`}
            >
              Workbench
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Nodes" value={atlas.nodes.length} tone="lime" />
            <Stat label="Edges" value={atlas.edges.length} tone="cyan" />
            <Stat label="Clusters" value={clusters.length} />
            <Stat label="Edge types" value={edgeKinds.size} />
          </div>
          <div className="mt-3 grid gap-3 border-t border-atlas-line pt-3 lg:grid-cols-[1.2fr_0.8fr]">
            <p className="text-sm leading-6 text-atlas-paper/78">
              The graph places references, clusters, tags, motifs, and the board region into a
              static coordinate system. Selection is local-only and uses the compiled fixture data.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {board.palette.map((color) => (
                <span
                  className="inline-flex items-center gap-2 border border-atlas-line bg-atlas-black/35 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-atlas-muted"
                  key={color.hex}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 border border-atlas-line"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <AtlasGraph graph={atlas} clusters={clusters} references={references} />
      </div>
    </AppFrame>
  );
}
