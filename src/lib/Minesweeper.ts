// import { Machine } from "xstate";
import pkg from "xstate";
const { Machine } = pkg;

type LogOptions = {
  displayIndexes?: boolean;
  revealAll?: boolean;
};

function log(options: LogOptions = {}) {
  board.matrix.forEach((row) => {
    console.log(row.map((tile) => pad(mapTile(tile, options))).join(" "));
  });
}

function mapTile(tile: Tile, options: LogOptions) {
  if (options.displayIndexes) return tile.absIdx;
  if (options.revealAll) return tile.hasMine ? "💣" : tile.value;

  if (tile.state === "hidden") return "";
  if (tile.state === "flagged") return "🏳️ ";
  if (tile.state === "revealed") return tile.hasMine ? "💣" : tile.value;
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

function logAdj(rowDiff: number, colDiff: number) {
  console.log(
    board.matrix[rowDiff][colDiff].absIdx,
    board.matrix[rowDiff][colDiff].adjacent.map((t) => t.absIdx)
  );
}

// from: https://stackoverflow.com/a/2450976/3622350
function shuffle<T>(array: T[]): T[] {
  let currIdx = array.length;

  // While there remain elements to shuffle...
  while (0 !== currIdx) {
    // Pick a remaining element...
    let randomIdx = Math.floor(Math.random() * currIdx);
    currIdx--;

    // And swap it with the current element.
    let tmpVal = array[currIdx];
    array[currIdx] = array[randomIdx];
    array[randomIdx] = tmpVal;
  }

  return array;
}

const minesweeperMachine = Machine({
  id: "minesweeper",
  initial: "idle",
  context: {
    config: { cols: 0, rows: 0, mines: 0 },
    nonMineTilesShown: 0,
    placedFlags: 0,
    startDateTime: null,
    endDateTime: null,
    board: [],
  },
  states: {
    idle: {
      on: {
        CONFIGURE: "ready",
        // Create an empty board spawning Tiles as actors (machines)?
      },
    },
    // Configured
    ready: {
      on: {
        REVEAL_TILE: "playing",
        // Place mines ensuring that the selected Tile does *not* have a mine!

        // Set `adjacent` for every Tile (will make the `value` calculation
        // below very easy)

        // Calculate the `value` (count of adjacent mines) of every Tile

        // Make these calculations async (web worker)? So that we can show a
        // loading state if it takes too long?

        // Set `startDateTime`

        // Go to `playing` sending the received `absIdx` so that it can be
        // revealed
      },
    },
    playing: {
      on: {
        "": {},
        // On entry, go to REVEAL_TILE with the `absIdx` received in the
        // previous state

        REVEAL_TILE: [],
        // Reveal the Tile

        // If tile.hasMine => ended.lost

        // `nonMineTilesShown`++

        // If `nonMineTilesShown` === `nonMineTiles` => ended.won

        // If `tile.value` === 0 then reveal adjacent Tiles recursively
      },
    },
    ended: {
      // On enter set endDateTime
      states: {
        won: {},
        lost: {},
      },
    },
  },
});

interface Config {
  rows: number;
  cols: number;
  mines: number;
}

interface TileOptions {
  state?: string;
  hasMine?: boolean;
  value?: number;
  absIdx?: number;
  rowIdx?: number;
  colIdx?: number;
  adjacent?: Tile[];
}
interface TileContext {
  hasMine: boolean;
  absIdx: number;
  rowIdx: number;
  colIdx: number;
  adjacent: Tile[];
}

const tileMachine = Machine<TileContext>({
  id: "tile",
  initial: "hidden",
  context: {
    hasMine: false,
    absIdx: 0,
    rowIdx: 0,
    colIdx: 0,
    adjacent: [],
  },
  states: {
    hidden: {
      initial: "unseen",
      states: {
        unseen: {
          on: {
            SEE: "seen",
            FLAG: "flagged",
          },
        },
        seen: { on: { UNSEE: "unseen" } },
      },
    },
    flagged: {
      on: {
        UNFLAG: "hidden",
      },
    },
    revealed: {
      type: "final",
      // Send `value` and `hasMine` to parent
      data: {
        hasMine: (context: TileContext) => context.hasMine,
        value: (context: TileContext) => getTileValue(context),
      },
    },
  },
  on: {
    INSPECT_ON: {
      target: "see",
      actions: [], // Also send `see` to every Tile in `adjacent`
    },
  },
});
class Tile {
  state: string = "hidden";
  hasMine: boolean = false;
  value: number = 0;
  absIdx: number = 0;
  rowIdx: number = 0;
  colIdx: number = 0;
  adjacent: Tile[] = [];

  constructor(replace: TileOptions = {}) {
    for (const prop in replace) {
      if (this.hasOwnProperty(prop)) {
        // @ts-ignore FIXME: maybe?
        this[prop] = replace[prop];
      }
    }
  }
}

type BoardList = Tile[];
type BoardMatrix = Tile[][];

interface Board {
  list: BoardList;
  matrix: BoardMatrix;
}

function createEmptyBoard(config: Config): Board {
  const list: BoardList = [];
  const matrix: BoardMatrix = [];
  let absIdx = 0;
  for (let rowIdx = 0; rowIdx < config.rows; rowIdx++) {
    const row = [];
    for (let colIdx = 0; colIdx < config.cols; colIdx++) {
      const newTile = new Tile({ absIdx, rowIdx, colIdx });
      list.push(newTile);
      row.push(newTile);
      absIdx++;
    }
    matrix.push(row);
  }
  return { list, matrix };
}

function placeMines(board: Board, config: Config, exceptedAbsIdx: number) {
  const { list } = board;
  // Select indexes of all tiles but `exceptedAbsIdx`
  const availableIndexes = shuffle(
    list
      .filter((tile) => tile.absIdx !== exceptedAbsIdx)
      .map((tile) => tile.absIdx)
  );

  // Store indexes of all tiles with mines.
  const minesIndexes = availableIndexes.slice(0, config.mines);

  // Place mines on randomly selected tiles (excluding `exceptedAbsIdx`)
  for (const absIdx of minesIndexes) {
    list[absIdx].hasMine = true;
  }
}

// Fill the `adjacent` prop for every tile in the board
function setAdjacentForAll(board: Board) {
  for (const tile of board.list) {
    setAdjacentForOne(board, tile);
  }
}

/**
 * Set `tile.adjacent` with an array containing references for every adjacent
 * tile.
 * Note: This should be a private method, public methods should **not** accept a
 * `Tile` directly but the `absIdx` to it.
 */
function setAdjacentForOne(board: Board, tile: Tile) {
  const { matrix } = board;
  const { rowIdx: targetRI, colIdx: targetCI } = tile;

  for (let rowDiff = -1; rowDiff < 2; rowDiff++) {
    for (let colDiff = -1; colDiff < 2; colDiff++) {
      if (rowDiff === 0 && colDiff === 0) continue;
      const currRI = targetRI + rowDiff;
      const currCI = targetCI + colDiff;
      const adj = matrix[currRI]?.[currCI];
      if (adj) tile.adjacent.push(adj);
    }
  }
}

// Set `tile.value` with the count of adjacent tiles
function setValueForAll(board: Board) {
  for (const tile of board.list) {
    tile.value = tile.adjacent.filter((t) => t.hasMine).length;
  }
}

function getTileValue(ctx: TileContext) {
  return ctx.adjacent.filter((t) => t.hasMine).length;
}

// TESTS

const config: Config = {
  rows: 20,
  cols: 10,
  mines: 4,
};

const board = createEmptyBoard(config);
placeMines(board, config, 2);
setAdjacentForAll(board);
setValueForAll(board);
log({ displayIndexes: true, revealAll: true });
logAdj(0, 0);
logAdj(6, 9);
