import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { ReferenceGrid } from "@/components/library/ReferenceGrid";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";

type LibraryPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { board, clusters, references } = dataset;

  return (
    <AppFrame activeSection="library" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Reference Library"
          title={board.title}
          actions={<Chip tone="cyan">{references.length} refs</Chip>}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Visible" value={references.length} tone="lime" />
            <Stat label="Total refs" value={references.length} />
            <Stat label="Clusters" value={clusters.length} tone="cyan" />
            <Stat label="Query mode" value="All" />
          </div>
        </Panel>

        <ReferenceGrid clusters={clusters} references={references} />
      </div>
    </AppFrame>
  );
}
