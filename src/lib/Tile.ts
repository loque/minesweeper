import { Machine, sendParent, actions } from "xstate";
const { pure } = actions;

export class Tile {
  actor: any;
  adjacent: Tile[] = [];

  ctx(prop: string) {
    const ctx = this.actor.state.context;
    if (ctx.hasOwnProperty(prop)) return ctx[prop];
  }

  setCtx(prop: string, value: any) {
    const ctx = this.actor.state.context;
    if (ctx.hasOwnProperty(prop)) return (ctx[prop] = value);
  }

  get value() {
    return this.adjacent.filter((t) => t.ctx("hasMine")).length;
  }

  get status() {
    return this.actor.state.toStrings().join(", ");
  }

  matches(match: string): boolean {
    return this.actor.state.matches(match);
  }
}

// export function getTileProp(tile: Tile, prop: string) {
//   const ctx = tile.actor.state.context;
//   if (ctx.hasOwnProperty(prop)) return ctx[prop];
// }

// export function getTileValue(tile: Tile) {
//   return tile.adjacent.filter((t) => getTileProp(t, "hasMine")).length;
// }

// export function tileStateMatches(tile: Tile, match: string): boolean {
//   return tile.actor.state.matches(match);
// }

interface TileContext {
  hasMine: boolean;
  absIdx: number;
  rowIdx: number;
  colIdx: number;
}

interface TileSchema {
  states: {
    hidden: {};
    flagged: {};
    revealed: {};
  };
}

type TileEvent = { type: "FLAG" } | { type: "UNFLAG" } | { type: "REVEAL" };

export const tileMachine = Machine<TileContext, TileSchema, TileEvent>({
  id: "tile",
  initial: "hidden",
  context: {
    hasMine: false,
    absIdx: 0,
    rowIdx: 0,
    colIdx: 0,
  },
  states: {
    hidden: {
      on: {
        FLAG: "flagged",
        REVEAL: "revealed",
      },
    },
    flagged: {
      on: {
        UNFLAG: "hidden",
      },
    },
    revealed: {
      // type: "final",
      entry: pure((ctx: TileContext, ev: TileEvent) => {
        return sendParent({
          type: "TILE_REVEALED",
          absIdx: ctx.absIdx,
        });
      }),
    },
  },
  // @ts-ignore
  on: {
    // @ts-ignore
    REVEAL: {
      // @ts-ignore
      actions: pure((ctx: TileContext, ev: TileEvent) => {
        return sendParent({
          type: "TILE_NOT_REVEALED",
        });
      }),
    },
  },
});
