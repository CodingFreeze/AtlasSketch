import Image from "next/image";
import Link from "next/link";
import { FileSearch2, ScanLine } from "lucide-react";

import { DnaStrip } from "@/components/dna/DnaStrip";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import type { Cluster, ReferenceBlock } from "@/domain/types";

type ReferenceGridProps = {
  references: ReferenceBlock[];
  clusters?: Cluster[];
  boardSlug: string;
};

function getTagGroups(reference: ReferenceBlock) {
  return {
    visual: reference.visualTags ?? reference.tags,
    semantic: reference.semanticTags ?? [],
    motifs: reference.motifs
  };
}

function getClusterIds(reference: ReferenceBlock) {
  return reference.clusterIds ?? [reference.clusterId];
}

export function ReferenceGrid({ boardSlug, clusters = [], references }: ReferenceGridProps) {
  const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));

  return (
    <section
      aria-label="Reference library"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {references.map((reference, index) => {
        const tagGroups = getTagGroups(reference);
        const clusterIds = getClusterIds(reference);
        const clusterLabels = clusterIds.map((id) => clusterById.get(id)?.label ?? id);
        const href = `/boards/${boardSlug}/library/${reference.id}`;

        return (
          <Panel
            as="article"
            className="grid min-h-full gap-3 p-3"
            headingAs="h3"
            key={reference.id}
          >
            <Link
              aria-label={`Open ${reference.title} reference dossier`}
              className="group relative aspect-[4/3] overflow-hidden border border-atlas-line bg-atlas-black transition-colors hover:border-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
              href={href}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(184,255,106,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(98,230,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
              <Image
                alt=""
                className="object-cover opacity-90 mix-blend-screen transition duration-200 group-hover:scale-[1.025] group-hover:opacity-100"
                fill
                priority={index < 4}
                sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={reference.placeholderPath}
              />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 border border-atlas-line bg-atlas-black/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-cyan">
                <ScanLine aria-hidden="true" size={12} />
                {reference.sourceClass}
              </span>
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 border border-atlas-lime bg-atlas-black/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-atlas-lime opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <FileSearch2 aria-hidden="true" size={12} />
                Dossier
              </span>
            </Link>

            <div className="grid gap-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                  {reference.id}
                </p>
                <Link
                  className="mt-1 block text-pretty font-mono text-sm font-semibold uppercase tracking-[0.1em] text-atlas-paper transition-colors hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
                  href={href}
                >
                  {reference.title}
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tagGroups.visual.slice(0, 4).map((tag) => (
                  <Chip key={`visual-${tag}`} tone="lime">
                    {tag}
                  </Chip>
                ))}
                {tagGroups.semantic.slice(0, 3).map((tag) => (
                  <Chip key={`semantic-${tag}`} tone="cyan">
                    {tag}
                  </Chip>
                ))}
                {tagGroups.motifs.slice(0, 3).map((motif) => (
                  <Chip key={`motif-${motif}`}>{motif}</Chip>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-atlas-line pt-2">
                {clusterLabels.map((label) => (
                  <Chip key={label} tone="magenta">
                    {label}
                  </Chip>
                ))}
              </div>

              <div className="flex flex-wrap gap-1" aria-label={`${reference.title} palette`}>
                {reference.palette.map((color) => (
                  <span
                    className="h-5 min-w-12 border border-atlas-line px-1 font-mono text-[9px] uppercase leading-5 tracking-[0.08em] text-atlas-paper/80"
                    key={color.hex}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {color.name}
                  </span>
                ))}
              </div>

              <DnaStrip
                density={reference.aestheticAxes.density}
                tags={[...tagGroups.visual, ...tagGroups.semantic, ...tagGroups.motifs]}
                palette={reference.palette.map((color) => color.hex)}
              />
            </div>
          </Panel>
        );
      })}
    </section>
  );
}
