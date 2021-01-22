export enum TileState {
  HIDDEN = "HIDDEN",
  FLAGGED = "FLAGGED",
  REVEALED = "REVEALED",
}

let counter = 0;
export default class Tile extends EventTarget {
  #key: string;
  #state: TileState = TileState.HIDDEN;
  #absIdx: number = 0;
  #rowIdx: number = 0;
  #colIdx: number = 0;
  hasMine: boolean = false;
  #adjacent: Tile[] = [];

  constructor(gameKey: string, absIdx: number, rowIdx: number, colIdx: number) {
    super();
    this.#key = gameKey + ":tile" + counter++;
    this.#absIdx = absIdx;
    this.#rowIdx = rowIdx;
    this.#colIdx = colIdx;
  }

  get key() {
    return this.#key;
  }

  get state() {
    return this.#state;
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

  get value() {
    return this.#adjacent.filter((t) => t.hasMine).length;
  }

  get adjacent() {
    return this.#adjacent;
  }

  set adjacent(newAdjacentList) {
    this.#adjacent = newAdjacentList;
  }

  flag(): boolean {
    if (this.#state === TileState.HIDDEN) {
      this.#state = TileState.FLAGGED;
      this.dispatchEvent(
        new CustomEvent("stateChange", { detail: this.#state })
      );
      return true;
    }
    return false;
  }

  unflag(): boolean {
    if (this.#state === TileState.FLAGGED) {
      this.#state = TileState.HIDDEN;
      this.dispatchEvent(
        new CustomEvent("stateChange", { detail: this.#state })
      );
      return true;
    }
    return false;
  }

  reveal(): boolean {
    if (this.#state === TileState.HIDDEN) {
      this.#state = TileState.REVEALED;
      this.dispatchEvent(
        new CustomEvent("stateChange", { detail: this.#state })
      );
      return true;
    }
    return false;
  }

  log() {
    return {
      key: this.#key,
      state: this.#state,
      absIdx: this.#absIdx,
      rowIdx: this.#rowIdx,
      colIdx: this.#colIdx,
      hasMine: this.hasMine,
    };
  }
}
