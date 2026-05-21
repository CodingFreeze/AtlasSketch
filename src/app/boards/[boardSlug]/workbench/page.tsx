import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { Workbench } from "@/components/workbench/Workbench";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";

type WorkbenchPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

export default async function WorkbenchPage({ params }: WorkbenchPageProps) {
  const { boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { board, clusters, seeds } = dataset;

  return (
    <AppFrame activeSection="workbench" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Workbench"
          title={`${board.title} generator`}
          actions={<Chip tone="lime">SSG</Chip>}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Seeds" value={seeds.length} tone="lime" />
            <Stat label="Families" value={5} tone="cyan" />
            <Stat label="Clusters" value={clusters.length} />
            <Stat label="Persistence" value="None" />
          </div>
          <p className="mt-3 border-t border-atlas-line pt-3 text-sm leading-6 text-atlas-paper/78">
            Generate deterministic interface variants from compiled board seeds. Artifacts render
            in sandboxed iframes and stay in the browser session.
          </p>
        </Panel>

        <Workbench boardSlug={board.slug} clusters={clusters} seeds={seeds} />
      </div>
    </AppFrame>
  );
}
