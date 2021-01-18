import { interpret } from "xstate";
import {
  minesweeperMachine,
  MinesweeperContext,
  BoardMatrix,
} from "./Minesweeper.js";
import { Tile } from "./Tile.js";

enum LogMode {
  displayIndexes,
  revealAll,
}

function log(
  matrix: BoardMatrix,
  mode: LogMode | null = null,
  targetAbsIdx: number | null = null
) {
  matrix.forEach((row: Tile[]) => {
    console.log(
      ...row.map((tile) =>
        current(mapTile(tile, mode), tile.ctx("absIdx") === targetAbsIdx)
      )
    );
  });
}

function mapTile(tile: Tile, mode: LogMode | null) {
  if (mode === LogMode.displayIndexes) return pad(tile.ctx("absIdx"));
  const unflagged = pad(tile.ctx("hasMine") ? "💣" : tile.value);

  if (mode === LogMode.revealAll) return unflagged;

  if (tile.actor.state.matches("hidden"))
    return "\x1b[2m" + unflagged + "\x1b[0m";
  if (tile.actor.state.matches("flagged")) return pad("🏳️");
  if (tile.actor.state.matches("revealed")) return unflagged;
}

function pad(str: any, length: number = 3) {
  str = String(str);
  if (str.length < length) {
    const diff = length - str.length;
    const left = Math.ceil(diff / 2);
    const right = Math.floor(diff / 2);
    str = " ".repeat(left) + str + " ".repeat(right);
  }
  return str;
}

function current(str: string, shouldColor: boolean) {
  if (shouldColor) {
    // str = "\x1b[36m" + str + "\x1b[0m"; // cyan
    str = "\x1b[45m\x1b[30m" + str + "\x1b[0m";
  }
  return str;
}

const service = interpret<MinesweeperContext>(minesweeperMachine).onTransition(
  (state) => {
    const { board, config, startDateTime, endDateTime, queue } = state.context;
    console.log("");
    console.log(`[${state.toStrings().join(", ")}]`);
    console.log("Event:", state.event);
    console.log("Q:", queue);
    // @ts-ignore
    const targetTile = queue[0] || state.event?.absIdx;

    if (state.matches("idle")) {
      console.log("config:", config);
    }

    if (state.matches("ready")) {
      log(board.matrix, LogMode.displayIndexes);
    }

    if (state.matches("playing")) {
      // console.log("startDateTime:", startDateTime);
      log(board.matrix, null, targetTile);
    }

    if (state.matches("ended")) {
      console.log("endDateTime:", endDateTime);
      log(board.matrix);
      let result: any = state.toStrings();
      result = result[result.length - 1].toUpperCase();
      console.log(`USER ${result}!!!!!!`);
    }
  }
);

let testMines = [];
let absIdx = [6];

// recursive reveal
testMines = [12, 13, 18, 24, 26, 27, 28, 29, 30, 36, 38];
absIdx = [6];

service.start();
service.send("CONFIGURE", {
  config: { rows: 10, cols: 4, mines: 11 },
  testMines: testMines,
});
service.send("REVEAL", { absIdx: absIdx[0] });
if (absIdx.length > 1) {
  for (let i = 1; i < absIdx.length; i++) {
    service.send("REVEAL", { absIdx: absIdx[i] });
  }
}
// const { list }: { list: Tile[] } = service.state.context.board;
// list
//   .filter((tile) => getTileProp(tile, "hasMine") === false)
//   .map((tile) => getTileProp(tile, "absIdx"))
//   .forEach((absIdx) => {
//     if (service.state.matches("ended") === false) {
//       service.send("REVEAL", { absIdx });
//     }
//   });
// service.send("FLAG", { absIdx: 7 });
// service.send("UNFLAG", { absIdx: 7 });
// TODO: try to flag a revealed tile
// service.send("REVEAL", { absIdx: 7 });
// service.send("REVEAL", { absIdx: 8 });
// service.send("REVEAL", { absIdx: 9 });
