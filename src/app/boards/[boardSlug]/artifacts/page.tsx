import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { ArtifactGrid } from "@/components/artifacts/ArtifactGrid";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";

type ArtifactsPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

export default async function ArtifactsPage({ params }: ArtifactsPageProps) {
  const { boardSlug } = await params;
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { artifacts, board, clusters, seeds } = dataset;
  const families = new Set(artifacts.map((artifact) => artifact.family));

  return (
    <AppFrame activeSection="artifacts" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Artifact Gallery"
          title={`${board.title} outputs`}
          actions={<Chip tone="lime">Static</Chip>}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Artifacts" value={artifacts.length} tone="lime" />
            <Stat label="Families" value={families.size} tone="cyan" />
            <Stat label="Seeds" value={seeds.length} />
            <Stat label="Runtime API" value="None" />
          </div>
          <p className="mt-3 border-t border-atlas-line pt-3 text-sm leading-6 text-atlas-paper/78">
            Six pre-rendered interface studies compiled from deterministic seeds. Each card embeds
            the standalone HTML output in a sandboxed frame and exposes the lineage used to produce it.
          </p>
        </Panel>

        <ArtifactGrid
          artifacts={artifacts}
          boardSlug={board.slug}
          clusters={clusters}
          seeds={seeds}
        />
      </div>
    </AppFrame>
  );
}
