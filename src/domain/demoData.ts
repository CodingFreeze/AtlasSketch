import boards from "@/data/demo/boards.json";
import artifacts from "@/data/demo/ritual-interfaces/artifacts.json";
import clusters from "@/data/demo/ritual-interfaces/clusters.json";
import manifest from "@/data/demo/ritual-interfaces/manifest.json";
import references from "@/data/demo/ritual-interfaces/references.json";
import seeds from "@/data/demo/ritual-interfaces/seeds.json";
import { buildAtlasGraph } from "./graph";
import type {
  Artifact,
  AtlasGraph,
  Board,
  Cluster,
  ReferenceBlock,
  Seed,
} from "./types";

export type BoardDataset = {
  board: Board;
  references: ReferenceBlock[];
  clusters: Cluster[];
  atlas: AtlasGraph;
  seeds: Seed[];
  artifacts: Artifact[];
};

const boardList = boards as Board[];

const datasets: Record<string, BoardDataset> = {
  "ritual-interfaces": {
    board: manifest as Board,
    references: references as ReferenceBlock[],
    clusters: clusters as Cluster[],
    atlas: buildAtlasGraph(manifest as Board, clusters as Cluster[], references as ReferenceBlock[]),
    seeds: seeds as Seed[],
    artifacts: artifacts as Artifact[],
  },
};

export function listBoards(): Board[] {
  return boardList;
}

export function getBoardBySlug(slug: string): Board | undefined {
  return boardList.find((board) => board.slug === slug);
}

export function getBoardDataset(slug: string): BoardDataset {
  const dataset = datasets[slug];

  if (!dataset) {
    throw new Error(`Unknown demo board: ${slug}`);
  }

  return dataset;
}
