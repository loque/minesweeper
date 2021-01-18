import { Machine, send, assign, spawn } from "xstate";
import { tileMachine, Tile } from "./Tile.js";

export interface MinesweeperContext {
  config: BoardConfig;
  startDateTime: Date | null;
  endDateTime: Date | null;
  board: Board;
  queue: number[];
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

const createEmptyBoard = assign<MinesweeperContext>({
  // @ts-ignore
  config: (ctx, ev) => ({ ...ev.config }),
  board: (ctx, ev) => {
    // @ts-ignore
    const { rows, cols } = ev.config;
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

const placeMines = assign<MinesweeperContext>({
  board: (ctx, ev) => {
    const {
      config,
      board: { list },
    } = ctx;

    // @ts-ignore
    const exceptedIndexes = list[ev.absIdx].adjacent.map((t) =>
      t.ctx("absIdx")
    );

    // @ts-ignore
    exceptedIndexes.push(ev.absIdx);

    // Shuffle indexes of tiles eligible for containing a mine
    const eligibleIndexes = shuffle(
      list
        .filter((tile) => !exceptedIndexes.includes(tile.ctx("absIdx")))
        .map((tile) => tile.ctx("absIdx"))
    );

    // Store indexes of all tiles with mines.
    const indexesOfMines = eligibleIndexes.slice(0, config.mines);

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
) {
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

const setAdjacent = assign<MinesweeperContext>({
  board: (ctx) => {
    const { list, matrix } = ctx.board;
    for (const tile of list) {
      const { rowIdx, colIdx } = tile.actor.state.context;
      tile.adjacent = getAdjacentForOne(matrix, rowIdx, colIdx);
    }

    return ctx.board;
  },
});

const setStartDateTime = assign<MinesweeperContext>({
  startDateTime: new Date(),
});

const setEndDateTime = assign<MinesweeperContext>({
  endDateTime: new Date(),
});

const sendFlagToTargetTile = send("FLAG", {
  to: (ctx: MinesweeperContext, ev) =>
    // @ts-ignore
    ctx.board.list[ev.absIdx].actor,
});

const sendUnflagToTargetTile = send("UNFLAG", {
  to: (ctx: MinesweeperContext, ev) =>
    // @ts-ignore
    ctx.board.list[ev.absIdx].actor,
});
const sendReveal = send("REVEAL", {
  to: (ctx: MinesweeperContext, ev) =>
    // @ts-ignore
    ctx.board.list[ev.absIdx].actor,
});
const sendRevealFromQueue = send("REVEAL", {
  to: (ctx: MinesweeperContext, ev) => {
    const lastAbxIdx = ctx.queue[0];
    console.log(">>> sending REVEL to ", lastAbxIdx);
    return ctx.board.list[lastAbxIdx].actor;
  },
});
const queueHiddenAdjacentZeros = assign<MinesweeperContext>({
  queue: (ctx, ev) => {
    // @ts-ignore
    const hiddenAdjacentZeros = ctx.board.list[ev.absIdx].adjacent
      .filter((tile) => tile.matches("hidden") && tile.value === 0)
      .map((tile) => tile.ctx("absIdx"));
    console.log(">>>> queueHiddenAdjacentZeros", hiddenAdjacentZeros);
    return Array.from(new Set([...ctx.queue, ...hiddenAdjacentZeros]));
  },
});
const shiftQueue = assign<MinesweeperContext>({
  queue: (ctx, ev) => {
    // @ts-ignore
    const nextQueue = ctx.queue.slice(1);
    console.log(">>> shiftQueue", JSON.stringify(nextQueue));
    return nextQueue;
  },
});
const targetTileHasMine = (ctx: MinesweeperContext, ev: any) => {
  // @ts-ignore
  return ctx.board.list[ev.absIdx].ctx("hasMine");
};
const allNonMineTilesRevealed = (ctx: MinesweeperContext, ev: any) => {
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
const targetTileValueIsNonZero = (ctx: MinesweeperContext, ev: any) => {
  return ctx.board.list[ev.absIdx].value !== 0;
};
const targetTileValueIsZero = (ctx: MinesweeperContext, ev: any) => {
  return ctx.board.list[ev.absIdx].value === 0;
};
const hiddenAdjacentZeros = (ctx: MinesweeperContext, ev: any) => {
  return ctx.board.list[ev.absIdx].adjacent.filter(
    (tile) => tile.matches("hidden") && tile.value === 0
  );
};
const queueIsEmpty = (ctx: MinesweeperContext, ev: any) => {
  console.log("queueIsEmpty?", ctx.queue.length);
  return ctx.queue.length === 0;
};

export const minesweeperMachine = Machine<MinesweeperContext>(
  {
    id: "minesweeper",
    initial: "idle",
    context: {
      config: { cols: 0, rows: 0, mines: 0 },
      startDateTime: null,
      endDateTime: null,
      board: { list: [], matrix: [] },
      queue: [],
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
              // below very easy)
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
              // ADJACENT_REVEAL: "revealingAdjacent",
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
                  // @ts-ignore
                  // action: (ctx, ev) =>
                  //   console.log(
                  //     "not quequeing because ",
                  //     ev.absIdx,
                  //     "is non zero"
                  //   ),
                },
                {
                  // If we reach this condition it means that tile value is 0
                  target: "revealingRecursively",
                  actions: ["queueHiddenAdjacentZeros"],
                },
              ],
            },
          },
          revealingRecursively: {
            entry: ["sendRevealFromQueue"],
            exit: ["shiftQueue"],
            always: [
              {
                cond: "queueIsEmpty",
                target: "idle",
                // @ts-ignore
                // action: (ctx, ev) =>
                //   console.log(
                //     ">>>>>>>>>>>>>>>>>>>>>>> GOING TO 'idle' BECAUSE always.queueIsEmpty!!!!!!!!!!!!"
                //   ),
              },
            ],
            on: {
              TILE_REVEALED: [
                // {
                //   cond: "queueIsEmpty",
                //   target: "idle",
                //   // @ts-ignore
                //   action: (ctx, ev) =>
                //     console.log(
                //       ">>>>>>>>>>>>>>>>>>>>>>> GOING TO 'idle' BECAUSE TILE_REVEALED.queueIsEmpty!!!!!!!!!!!!"
                //     ),
                // },
                {
                  cond: "allNonMineTilesRevealed",
                  target: "#minesweeper.ended.won",
                },
                {
                  cond: "hiddenAdjacentZeros",
                  target: "revealingRecursively",
                  internal: false,
                  actions: "queueHiddenAdjacentZeros",
                },
                {
                  target: "idle",
                  // @ts-ignore
                  action: (ctx, ev) => console.log(">>> Going to 'idle' "),
                },
              ],
            },
          },
          //   revealingAdjacent: {
          //     entry: ["setTargetTile", "sendRevealToAdjacentTiles"],
          //     on: {
          //       TILE_REVEALED: [
          //         // count revealed adjacent tiles, if missing make self transition
          //       ],
          //     },
          //     /*
          //   IF the target Tile is 'revealed'
          //     AND the count of adjacent 'flagged' Tiles === `target.value`
          //     => send 'REVEAL' to every adjacent Tile.
          // */
          //   },
        },
        // on: {
        //   "": [
        //     // If `targetTile` is set
        //     { target: "revealing" },
        //     // Else
        //     { target: "idle" },
        //   ],
        // },
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
      queueHiddenAdjacentZeros,
      sendRevealFromQueue,
      shiftQueue,
    },
    guards: {
      targetTileHasMine,
      allNonMineTilesRevealed,
      targetTileValueIsNonZero,
      targetTileValueIsZero,
      hiddenAdjacentZeros,
      queueIsEmpty,
    },
  }
);

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
