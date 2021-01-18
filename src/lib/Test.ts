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

function log(matrix: BoardMatrix, mode: LogMode | null = null) {
  matrix.forEach((row: Tile[]) => {
    console.log(row.map((tile) => pad(mapTile(tile, mode))).join(" "));
  });
}

function mapTile(tile: Tile, mode: LogMode | null) {
  if (mode === LogMode.displayIndexes) return tile.ctx("absIdx");
  if (mode === LogMode.revealAll)
    return tile.ctx("hasMine") ? "💣" : tile.value;

  if (tile.actor.state.matches("hidden")) return "___";
  if (tile.actor.state.matches("flagged")) return "🏳️ ";
  if (tile.actor.state.matches("revealed"))
    return tile.ctx("hasMine") ? "💣" : tile.value;
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

let firstIdle = true;

const service = interpret<MinesweeperContext>(minesweeperMachine).onTransition(
  (state) => {
    const { board, config, startDateTime, endDateTime, queue } = state.context;
    console.log("");
    console.log(`[${state.toStrings().join(", ")}]`);
    console.log("Event:", state.event);
    console.log("Q:", queue);

    if (state.matches("idle")) {
      console.log("config:", config);
    }

    if (state.matches("ready")) {
      log(board.matrix, LogMode.displayIndexes);
    }

    if (state.matches("playing")) {
      // console.log("startDateTime:", startDateTime);
      const mode = firstIdle ? LogMode.revealAll : null;
      log(board.matrix, mode);
      firstIdle = false;
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

service.start();
service.send("CONFIGURE", { config: { rows: 10, cols: 4, mines: 11 } });
service.send("REVEAL", { absIdx: 6 });
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
