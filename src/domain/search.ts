import type { ReferenceBlock } from "./types";

export type ReferenceFilter = {
  query?: string;
  tag?: string;
  clusterId?: string;
};

function getVisualTags(reference: ReferenceBlock) {
  return reference.visualTags ?? reference.tags;
}

function getSemanticTags(reference: ReferenceBlock) {
  return reference.semanticTags ?? reference.tags;
}

function getClusterIds(reference: ReferenceBlock) {
  return reference.clusterIds ?? [reference.clusterId];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterReferences(references: ReferenceBlock[], filter: ReferenceFilter) {
  const query = filter.query ? normalize(filter.query) : "";
  const tag = filter.tag ? normalize(filter.tag) : "";
  const clusterId = filter.clusterId?.trim();

  return references.filter((reference) => {
    const visualTags = getVisualTags(reference);
    const semanticTags = getSemanticTags(reference);
    const motifs = reference.motifs;
    const text = [
      reference.title,
      reference.sourceClass,
      ...visualTags,
      ...semanticTags,
      ...motifs
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const searchableTags = [...visualTags, ...semanticTags, ...motifs].map(normalize);

    if (query && !text.includes(query)) return false;
    if (tag && !searchableTags.includes(tag)) return false;
    if (clusterId && !getClusterIds(reference).includes(clusterId)) return false;

    return true;
  });
}
