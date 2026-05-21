import { describe, expect, it } from "vitest";

import { filterReferences } from "../search";
import type { ReferenceBlock } from "../types";

const references = [
  {
    id: "ref-signal",
    boardSlug: "ritual-interfaces",
    title: "Threshold Console",
    placeholderPath: "/demo/placeholders/ref-signal.svg",
    sourceClass: "control-room",
    clusterId: "cluster-signal-cartography",
    clusterIds: ["cluster-signal-cartography"],
    tags: ["threshold"],
    visualTags: ["signal", "console"],
    semanticTags: ["navigation", "monitoring"],
    motifs: ["axis cross", "signal comb"],
    palette: [],
    composition: "Nested coordinate rails.",
    notes: "Entry rite into a larger instrument system.",
    aestheticAxes: { density: 72, contrast: 84, ritual: 76, signal: 91 }
  },
  {
    id: "ref-glyph",
    boardSlug: "ritual-interfaces",
    title: "Glyph Discipline Grid",
    placeholderPath: "/demo/placeholders/ref-glyph.svg",
    sourceClass: "manuscript",
    clusterId: "cluster-glyph-matrices",
    clusterIds: ["cluster-glyph-matrices"],
    tags: ["catalog"],
    visualTags: ["glyph", "matrix"],
    semanticTags: ["syntax", "ritual"],
    motifs: ["glyph cells", "registration dot"],
    palette: [],
    composition: "Strict glyph grid.",
    notes: "Alphabet for ceremonial machines.",
    aestheticAxes: { density: 93, contrast: 74, ritual: 88, signal: 67 }
  }
] satisfies ReferenceBlock[];

describe("filterReferences", () => {
  it("filters references by free text across title, source class, tags, and motifs", () => {
    expect(filterReferences(references, { query: "control" })).toEqual([references[0]]);
    expect(filterReferences(references, { query: "registration" })).toEqual([references[1]]);
  });

  it("filters references by tag across visual tags, semantic tags, and motifs", () => {
    expect(filterReferences(references, { tag: "ritual" })).toEqual([references[1]]);
    expect(filterReferences(references, { tag: "signal comb" })).toEqual([references[0]]);
  });

  it("filters references by cluster id", () => {
    expect(filterReferences(references, { clusterId: "cluster-glyph-matrices" })).toEqual([
      references[1]
    ]);
  });
});
