import Link from "next/link";
import { notFound } from "next/navigation";

import { AppFrame } from "@/components/app/AppFrame";
import { ReferenceGrid } from "@/components/library/ReferenceGrid";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { getBoardDataset, listBoards } from "@/domain/demoData";
import { filterReferences } from "@/domain/search";

type LibraryPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
  searchParams?: Promise<{
    q?: string;
    tag?: string;
    cluster?: string;
    clusterId?: string;
  }>;
};

export function generateStaticParams() {
  return listBoards().map((board) => ({ boardSlug: board.slug }));
}

function buildFilterHref(
  boardSlug: string,
  filter: {
    q?: string;
    tag?: string;
    cluster?: string;
  }
) {
  const params = new URLSearchParams();

  if (filter.q) params.set("q", filter.q);
  if (filter.tag) params.set("tag", filter.tag);
  if (filter.cluster) params.set("cluster", filter.cluster);

  const query = params.toString();

  return `/boards/${boardSlug}/library${query ? `?${query}` : ""}`;
}

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { boardSlug } = await params;
  const filters = (await searchParams) ?? {};
  let dataset;

  try {
    dataset = getBoardDataset(boardSlug);
  } catch {
    notFound();
  }

  const { board, clusters, references } = dataset;
  const clusterId = filters.cluster ?? filters.clusterId;
  const filteredReferences = filterReferences(references, {
    query: filters.q,
    tag: filters.tag,
    clusterId
  });
  const activeFilterCount = [filters.q, filters.tag, clusterId].filter(Boolean).length;

  return (
    <AppFrame activeSection="library" board={board}>
      <div className="grid gap-4">
        <Panel
          eyebrow="Reference Library"
          title={board.title}
          actions={
            <Chip tone={activeFilterCount ? "lime" : "cyan"}>
              {filteredReferences.length} refs
            </Chip>
          }
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Visible" value={filteredReferences.length} tone="lime" />
            <Stat label="Total refs" value={references.length} />
            <Stat label="Clusters" value={clusters.length} tone="cyan" />
            <Stat label="Query mode" value={activeFilterCount ? "Filtered" : "All"} />
          </div>
          <div className="mt-3 grid gap-3 border-t border-atlas-line pt-3 lg:grid-cols-[1fr_1fr]">
            <div className="min-w-0">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                Tag filters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {board.topTags.slice(0, 6).map((tag) => (
                  <Link href={buildFilterHref(board.slug, { tag })} key={tag}>
                    <Chip tone={filters.tag === tag ? "lime" : "neutral"}>{tag}</Chip>
                  </Link>
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                Cluster filters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {clusters.map((cluster) => (
                  <Link href={buildFilterHref(board.slug, { cluster: cluster.id })} key={cluster.id}>
                    <Chip tone={clusterId === cluster.id ? "magenta" : "neutral"}>
                      {cluster.label}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 lg:col-span-2">
                {filters.q && <Chip tone="cyan">q: {filters.q}</Chip>}
                {filters.tag && <Chip tone="lime">tag: {filters.tag}</Chip>}
                {clusterId && <Chip tone="magenta">cluster: {clusterId}</Chip>}
                <Link
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-atlas-cyan underline-offset-4 hover:underline"
                  href={`/boards/${board.slug}/library`}
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </Panel>

        <ReferenceGrid clusters={clusters} references={filteredReferences} />
      </div>
    </AppFrame>
  );
}
