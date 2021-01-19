import { Machine, sendParent, actions } from "xstate";
const { pure } = actions;

export class Tile {
  actor: any;
  adjacent: Tile[] = [];

  setCtx(prop: string, value: any) {
    const ctx = this.actor.state.context;
    if (ctx.hasOwnProperty(prop)) return (ctx[prop] = value);
  }

  get hasMine() {
    return this.actor.state.context.hasMine;
  }

  get absIdx() {
    return this.actor.state.context.absIdx;
  }

  get rowIdx() {
    return this.actor.state.context.rowIdx;
  }

  get colIdx() {
    return this.actor.state.context.colIdx;
  }

  get value() {
    return this.adjacent.filter((t) => t.hasMine).length;
  }

  get states() {
    return this.actor.state.toStrings().join(", ");
  }

  matches(match: string): boolean {
    return this.actor.state.matches(match);
  }
}

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
      entry: pure((ctx: TileContext, _ev: TileEvent) => {
        return sendParent({
          type: "TILE_REVEALED",
          absIdx: ctx.absIdx,
        });
      }),
    },
  },
  on: {
    REVEAL: {
      actions: sendParent({
        type: "TILE_NOT_REVEALED",
      }),
    },
  },
});
