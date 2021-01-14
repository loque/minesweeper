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

function logAdjacents(tile: Tile) {
  const { adjacent: adj } = tile;
  console.log(
    adj[0]?.absIdx || null,
    adj[1]?.absIdx || null,
    adj[2]?.absIdx || null
  );
  console.log(adj[3]?.absIdx || null, "T", adj[4]?.absIdx || null);
  console.log(
    adj[5]?.absIdx || null,
    adj[6]?.absIdx || null,
    adj[7]?.absIdx || null
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
        // Create an empty board
      },
    },
    // Configured
    ready: {
      on: {
        REVEAL_TILE: "playing",
        // Place mines

        // Calculate value of each tile? TODO: find an efficient way to do this
        // Make calculation async (web worker)? So that we can show a loading
        // state if it takes too long?
        // Maybe tiles should hold a reference to their adjacent tiles?

        // Set startDateTime

        // Reveal tile + logic below
      },
    },
    playing: {
      on: {
        REVEAL_TILE: [],
        // Reveal the tile

        // If tile has a mine => ended.lost

        /*
					If the tile's value is > 0
						nonMineTilesShown
					*/
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
  adjacent?: (Tile | null)[];
}

class Tile {
  state: string = "hidden";
  hasMine: boolean = false;
  value: number = 0;
  absIdx: number = 0;
  rowIdx: number = 0;
  colIdx: number = 0;
  adjacent: (Tile | null)[] = [];

  constructor(replace: TileOptions = {}) {
    for (const prop in replace) {
      if (this.hasOwnProperty(prop)) {
        // @ts-ignore FIXME:
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

function placeMines(board: Board, config: Config, exceptionAbsIdx: number) {
  const { list } = board;
  // Select indexes of all tiles but `exceptionAbsIdx`
  const availableIndexes = shuffle(
    list
      .filter((tile) => tile.absIdx !== exceptionAbsIdx)
      .map((tile) => tile.absIdx)
  );

  // Store indexes of all tiles with mines
  const minesIndexes = availableIndexes.slice(0, config.mines);

  // Place mines on randomly selected tiles (excluding `exceptionAbsIdx`)
  for (const absIdx of minesIndexes) {
    list[absIdx].hasMine = true;
  }
}

function setAdjacentForAll(board: Board) {
  for (const tile of board.list) {
    setAdjacentTiles(board, tile);
  }
}

function setAdjacentTiles(board: Board, tile: Tile) {
  const { matrix } = board;
  const { rowIdx, colIdx } = tile;

  // The order is TL,TC,TR,CL,CR,BL,BC,BR
  tile.adjacent[0] = matrix[rowIdx - 1]?.[colIdx - 1] || null;
  tile.adjacent[1] = matrix[rowIdx - 1]?.[colIdx] || null;
  tile.adjacent[2] = matrix[rowIdx - 1]?.[colIdx + 1] || null;
  tile.adjacent[3] = matrix[rowIdx][colIdx - 1] || null;
  tile.adjacent[4] = matrix[rowIdx][colIdx + 1] || null;
  tile.adjacent[5] = matrix[rowIdx + 1]?.[colIdx - 1] || null;
  tile.adjacent[6] = matrix[rowIdx + 1]?.[colIdx] || null;
  tile.adjacent[7] = matrix[rowIdx + 1]?.[colIdx + 1] || null;
}

function placeValueOfTiles(board: Board) {
  for (const tile of board.list) {
    tile.value = tile.adjacent.filter((t) => t?.hasMine).length;
  }
}

// TESTS

const config: Config = {
  rows: 4,
  cols: 3,
  mines: 3,
};

const board = createEmptyBoard(config);
placeMines(board, config, 2);
setAdjacentForAll(board);
placeValueOfTiles(board);
log({ revealAll: true });
