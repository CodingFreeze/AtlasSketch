import { AppFrame } from "@/components/app/AppFrame";
import { BoardConsole } from "@/components/boards/BoardConsole";
import { getBoardDataset, listBoards } from "@/domain/demoData";

export default function Home() {
  const boards = listBoards();
  const datasets = Object.fromEntries(
    boards.map((board) => [board.slug, getBoardDataset(board.slug)])
  );

  return (
    <AppFrame activeSection="boards">
      <BoardConsole boards={boards} datasets={datasets} />
    </AppFrame>
  );
}
