import { Machine, send, assign, spawn, actions } from "xstate";
import { tileMachine, Tile } from "./Tile.js";
const { pure } = actions;

const createEmptyBoard = assign<MinesweeperContext, MinesweeperEvents>({
  config: (_, ev) => ({ ...(ev as ConfigureEvent).config }),
  testMines: (_, ev) => {
    ev = ev as ConfigureEvent;
    if (Array.isArray(ev.testMines)) {
      const testMines = ev?.testMines || [];
      return [...testMines];
    }
    return [];
  },
  board: (_, ev) => {
    const { rows, cols } = (ev as ConfigureEvent).config;
    const list: BoardList = [];
    const matrix: BoardMatrix = [];
    let absIdx = 0;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      const row = [];
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        const newTile = new Tile();
        newTile.actor = spawn(
          tileMachine.withContext({
            absIdx,
            rowIdx,
            colIdx,
            hasMine: false,
          })
        );

        list.push(newTile);
        row.push(newTile);
        absIdx++;
      }
      matrix.push(row);
    }
    return { list, matrix };
  },
});

const placeMines = assign<MinesweeperContext, MinesweeperEvents>({
  board: (ctx, ev) => {
    const {
      testMines,
      config,
      board: { list },
    } = ctx;
    ev = ev as RevealEvent;

    let indexesOfMines = testMines;

    if (indexesOfMines.length === 0) {
      const exceptedIndexes = list[ev.absIdx].adjacent.map((t) =>
        t.ctx("absIdx")
      );

      exceptedIndexes.push(ev.absIdx);

      // Shuffle indexes of tiles eligible for containing a mine
      const eligibleIndexes = shuffle(
        list
          .filter((tile) => !exceptedIndexes.includes(tile.ctx("absIdx")))
          .map((tile) => tile.ctx("absIdx"))
      );

      // Store indexes of all tiles with mines.
      indexesOfMines = eligibleIndexes.slice(0, config.mines);
    }

    // Place mines on randomly selected tiles (excluding `exceptedAbsIdx`)
    for (const absIdx of indexesOfMines) {
      list[absIdx].setCtx("hasMine", true);
    }

    return ctx.board;
  },
});

/**
 * Set `tile.adjacent` with an array containing references for every adjacent
 * tile.
 * Note: This should be a private method, public methods should **not** accept a
 * `Tile` directly but the `absIdx` to it.
 */
function getAdjacentForOne(
  matrix: BoardMatrix,
  targetRI: number,
  targetCI: number
): Tile[] {
  const adjacent = [];
  for (let rowDiff = -1; rowDiff < 2; rowDiff++) {
    for (let colDiff = -1; colDiff < 2; colDiff++) {
      if (rowDiff === 0 && colDiff === 0) continue;
      const currRI = targetRI + rowDiff;
      const currCI = targetCI + colDiff;
      const adj = matrix[currRI]?.[currCI];
      if (adj) adjacent.push(adj);
    }
  }
  return adjacent;
}

const setAdjacent = assign<MinesweeperContext, MinesweeperEvents>({
  board: (ctx) => {
    const { list, matrix } = ctx.board;
    for (const tile of list) {
      const { rowIdx, colIdx } = tile.actor.state.context;
      tile.adjacent = getAdjacentForOne(matrix, rowIdx, colIdx);
    }

    return ctx.board;
  },
});

const setStartDateTime = assign<MinesweeperContext, MinesweeperEvents>({
  startDateTime: new Date(),
});

const setEndDateTime = assign<MinesweeperContext, MinesweeperEvents>({
  endDateTime: new Date(),
});

const sendFlagToTargetTile = send<MinesweeperContext, MinesweeperEvents>(
  "FLAG",
  {
    to: (ctx, ev) => ctx.board.list[(ev as FlagEvent).absIdx].actor,
  }
);

const sendUnflagToTargetTile = send<MinesweeperContext, MinesweeperEvents>(
  "UNFLAG",
  {
    to: (ctx, ev) => ctx.board.list[(ev as UnflagEvent).absIdx].actor,
  }
);
const sendReveal = send<MinesweeperContext, MinesweeperEvents>("REVEAL", {
  to: (ctx, ev) => ctx.board.list[(ev as RevealEvent).absIdx].actor,
});
const sendRevealFromQueue = send<MinesweeperContext, MinesweeperEvents>(
  "REVEAL",
  {
    to: (ctx) => {
      const lastAbxIdx = ctx.queue[0];
      return ctx.board.list[lastAbxIdx].actor;
    },
  }
);
const queueHiddenAdjacentNonMine = assign<
  MinesweeperContext,
  MinesweeperEvents
>({
  queue: (ctx, ev) => {
    const hiddenAdjacentNonMine = ctx.board.list[
      (ev as TileRevealedEvent).absIdx
    ].adjacent
      .filter((tile) => tile.matches("hidden") && tile.ctx("hasMine") === false)
      .map((tile) => tile.ctx("absIdx"));
    return Array.from(new Set([...ctx.queue, ...hiddenAdjacentNonMine]));
  },
});
const shiftQueue = assign<MinesweeperContext, MinesweeperEvents>({
  queue: (ctx) => ctx.queue.slice(1),
});
const targetTileHasMine = (
  ctx: MinesweeperContext,
  ev: MinesweeperEvents
): boolean => {
  return ctx.board.list[(ev as TileRevealedEvent).absIdx].ctx("hasMine");
};
const allNonMineTilesRevealed = (ctx: MinesweeperContext): boolean => {
  const {
    config,
    board: { list },
  } = ctx;
  const totalTiles = config.rows * config.cols;
  const totalNonMineTiles = totalTiles - config.mines;
  const nonMineTilesRevealed = list.filter(
    (tile) => tile.matches("revealed") && tile.ctx("hasMine") === false
  ).length;
  return totalNonMineTiles === nonMineTilesRevealed;
};
const targetTileValueIsNonZero = (
  ctx: MinesweeperContext,
  ev: MinesweeperEvents
): boolean => {
  return ctx.board.list[(ev as TileRevealedEvent).absIdx].value !== 0;
};
const targetTileValueIsZero = (
  ctx: MinesweeperContext,
  ev: MinesweeperEvents
): boolean => {
  return ctx.board.list[(ev as TileRevealedEvent).absIdx].value === 0;
};
const queueIsEmpty = (ctx: MinesweeperContext): boolean => {
  return ctx.queue.length === 0;
};
const queueHasRemainingTiles = (ctx: MinesweeperContext): boolean => {
  return ctx.queue.length > 0;
};
// If value === adjacent flags && there are hidden adjacent
// tiles besides the flagged one
const eligibleForAdjacentReveal = (
  ctx: MinesweeperContext,
  ev: MinesweeperEvents
): boolean => {
  const tile = ctx.board.list[(ev as RevealAdjacentEvent).absIdx];
  const adjFlags = tile.adjacent.filter((t) => t.matches("flagged")).length;
  const possibileMines = !!tile.adjacent.filter((t) => t.matches("hidden"))
    .length;

  return tile.matches("revealed") && tile.value === adjFlags && possibileMines;
};
const sendRevealAdjacent = pure<MinesweeperContext, MinesweeperEvents>(
  (ctx, ev) => {
    return ctx.board.list[(ev as RevealAdjacentEvent).absIdx].adjacent
      .filter((t) => t.matches("hidden"))
      .map((t) => {
        return send("REVEAL", { to: t.actor });
      });
  }
);

export const minesweeperMachine = Machine<
  MinesweeperContext,
  MinesweeperSchema,
  MinesweeperEvents
>(
  {
    id: "minesweeper",
    initial: "idle",
    context: {
      config: { cols: 0, rows: 0, mines: 0 },
      startDateTime: null,
      endDateTime: null,
      board: { list: [], matrix: [] },
      queue: [],
      testMines: [],
    },
    states: {
      idle: {
        on: {
          CONFIGURE: {
            target: "ready",
            actions: "createEmptyBoard",
          },
        },
      },
      ready: {
        on: {
          REVEAL: {
            target: "playing.revealing",
            actions: [
              // Set `adjacent` for every Tile (will make the `value` calculation
              // very easy)
              "setAdjacent",
              // Place mines ensuring that the `ev.absIdx` does *not* have a mine.
              // Also, place them in a way that the Tile on `ev.absIdx` value
              // is 0. Which will trigger a recursive reveal.
              "placeMines",
              "setStartDateTime",
            ],
          },
        },
      },
      playing: {
        initial: "idle",
        states: {
          idle: {
            on: {
              FLAG: {
                internal: true,
                actions: ["sendFlagToTargetTile"],
              },
              UNFLAG: {
                internal: true,
                actions: ["sendUnflagToTargetTile"],
              },
              REVEAL: "revealing",
              REVEAL_ADJACENT: [
                {
                  cond: "eligibleForAdjacentReveal",
                  target: "revealingAdjacent",
                },
              ],
            },
          },
          revealing: {
            entry: ["sendReveal"],
            on: {
              TILE_NOT_REVEALED: "idle",
              TILE_REVEALED: [
                {
                  cond: "targetTileHasMine",
                  target: "#minesweeper.ended.lost",
                },
                {
                  cond: "allNonMineTilesRevealed",
                  target: "#minesweeper.ended.won",
                },
                {
                  cond: "targetTileValueIsNonZero",
                  target: "idle",
                },
                {
                  // If we reach this condition it means that tile value is 0
                  target: "revealingRecursively",
                  actions: ["queueHiddenAdjacentNonMine"],
                },
              ],
            },
          },
          revealingRecursively: {
            initial: "revealSent",
            states: {
              revealSent: {
                entry: ["sendRevealFromQueue"],
                always: "unqueued",
              },
              unqueued: {
                entry: ["shiftQueue"],
              },
            },
            on: {
              TILE_REVEALED: [
                {
                  cond: "allNonMineTilesRevealed",
                  target: "#minesweeper.ended.won",
                },
                {
                  cond: "targetTileValueIsZero",
                  target: "revealingRecursively",
                  internal: false,
                  actions: "queueHiddenAdjacentNonMine",
                },
                {
                  cond: "queueHasRemainingTiles",
                  target: "revealingRecursively",
                  internal: false,
                },
                {
                  // No more items in queue, so go to 'idle'
                  target: "idle",
                },
              ],
            },
          },
          revealingAdjacent: {
            // Send REVEAL to adjacent hidden unflagged tiles
            entry: ["sendRevealAdjacent"],
            on: {
              TILE_REVEALED: [
                {
                  cond: "targetTileHasMine",
                  target: "#minesweeper.ended.lost",
                },
                {
                  cond: "allNonMineTilesRevealed",
                  target: "#minesweeper.ended.won",
                },
                {
                  target: "idle",
                },
              ],
            },
          },
        },
      },
      ended: {
        entry: "setEndDateTime",
        states: {
          won: {},
          lost: {},
        },
      },
    },
  },
  {
    actions: {
      createEmptyBoard,
      setAdjacent,
      placeMines,
      setStartDateTime,
      setEndDateTime,
      sendFlagToTargetTile,
      sendUnflagToTargetTile,
      sendReveal,
      queueHiddenAdjacentNonMine,
      sendRevealFromQueue,
      shiftQueue,
      sendRevealAdjacent,
    },
    guards: {
      targetTileHasMine,
      allNonMineTilesRevealed,
      targetTileValueIsNonZero,
      targetTileValueIsZero,
      queueIsEmpty,
      queueHasRemainingTiles,
      eligibleForAdjacentReveal,
    },
  }
);

type ConfigureEvent = {
  type: "CONFIGURE";
  config: BoardConfig;
  testMines?: number[];
};

type FlagEvent = { type: "FLAG"; absIdx: number };
type UnflagEvent = { type: "UNFLAG"; absIdx: number };
type RevealEvent = { type: "REVEAL"; absIdx: number };
type RevealAdjacentEvent = { type: "REVEAL_ADJACENT"; absIdx: number };
type TileRevealedEvent = { type: "TILE_REVEALED"; absIdx: number };
type TileNotRevealedEvent = { type: "TILE_NOT_REVEALED"; absIdx: number };

export type MinesweeperEvents =
  | ConfigureEvent
  | FlagEvent
  | UnflagEvent
  | RevealEvent
  | RevealAdjacentEvent
  | TileRevealedEvent
  | TileNotRevealedEvent;
export interface MinesweeperSchema {
  states: {
    idle: {};
    ready: {};
    playing: {
      initial: "idle";
      states: {
        idle: {};
        revealing: {};
        revealingRecursively: {
          initial: "revealSent";
          states: {
            revealSent: {};
            unqueued: {};
          };
        };
        revealingAdjacent: {};
      };
    };
    ended: {
      states: {
        won: {};
        lost: {};
      };
    };
  };
}

export interface MinesweeperContext {
  config: BoardConfig;
  startDateTime: Date | null;
  endDateTime: Date | null;
  board: Board;
  queue: number[];
  testMines: number[];
}
export interface BoardConfig {
  rows: number;
  cols: number;
  mines: number;
}

export type BoardList = Tile[];
export type BoardMatrix = Tile[][];
export interface Board {
  list: BoardList;
  matrix: BoardMatrix;
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
