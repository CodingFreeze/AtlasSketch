import { describe, expect, it } from "vitest";
import { getBoardBySlug, getBoardDataset, listBoards } from "../demoData";

describe("demoData", () => {
  it("loads the shipped ritual interfaces board", () => {
    const boards = listBoards();
    expect(boards.map((board) => board.slug)).toContain("ritual-interfaces");
    expect(getBoardBySlug("ritual-interfaces")?.title).toBe("Ritual Interfaces");
  });

  it("loads a complete board dataset", () => {
    const dataset = getBoardDataset("ritual-interfaces");
    expect(dataset.board.slug).toBe("ritual-interfaces");
    expect(dataset.references.length).toBeGreaterThanOrEqual(12);
    expect(dataset.clusters.length).toBeGreaterThanOrEqual(4);
    expect(dataset.seeds.length).toBeGreaterThanOrEqual(4);
    expect(dataset.artifacts.length).toBeGreaterThanOrEqual(6);
    expect(dataset.atlas.nodes.length).toBeGreaterThan(dataset.clusters.length);
  });
});
