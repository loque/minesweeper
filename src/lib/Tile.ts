export enum TileState {
  HIDDEN = "HIDDEN",
  FLAGGED = "FLAGGED",
  REVEALED = "REVEALED",
}

export default class Tile {
  #state: TileState = TileState.HIDDEN;
  adjacent: Tile[] = [];
  hasMine: boolean = false;

  constructor(
    readonly absIdx: number,
    readonly rowIdx: number,
    readonly colIdx: number
  ) {}

  get value() {
    return this.adjacent.filter((t) => t.hasMine).length;
  }

  get state() {
    return this.#state;
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
}
