export enum TileState {
  HIDDEN = "HIDDEN",
  FLAGGED = "FLAGGED",
  REVEALED = "REVEALED",
}

export default class Tile {
  #state: TileState = TileState.HIDDEN;
  #absIdx: number = 0;
  #rowIdx: number = 0;
  #colIdx: number = 0;
  hasMine: boolean = false;
  adjacent: Tile[] = [];

  constructor(absIdx: number, rowIdx: number, colIdx: number) {
    this.#absIdx = absIdx;
    this.#rowIdx = rowIdx;
    this.#colIdx = colIdx;
  }

  get value() {
    return this.adjacent.filter((t) => t.hasMine).length;
  }

  get absIdx() {
    return this.#absIdx;
  }

  get rowIdx() {
    return this.#rowIdx;
  }

  get colIdx() {
    return this.#colIdx;
  }

  state(state: TileState | null): TileState | boolean {
    if (state === null) return this.#state;
    return this.#state === state;
  }

  flag(): boolean {
    if (this.#state === TileState.HIDDEN) {
      this.#state = TileState.FLAGGED;
      return true;
    }
    return false;
  }

  unflag(): boolean {
    if (this.#state === TileState.FLAGGED) {
      this.#state = TileState.HIDDEN;
      return true;
    }
    return false;
  }

  reveal(): boolean {
    if (this.#state === TileState.HIDDEN) {
      this.#state = TileState.REVEALED;
      return true;
    }
    return false;
  }

  log() {
    return {
      state: this.#state,
      absIdx: this.#absIdx,
      rowIdx: this.#rowIdx,
      colIdx: this.#colIdx,
      hasMine: this.hasMine,
    };
  }
}
