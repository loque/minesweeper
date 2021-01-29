export enum TileState {
  HIDDEN = "HIDDEN",
  FLAGGED = "FLAGGED",
  REVEALED = "REVEALED",
}

enum EventName {
  "stateChange" = "stateChange",
}
type EventCallback = (payload: any) => void;

let id = 0;
function getId() {
  return id++;
}
export default class Tile {
  #key: string;
  #state: TileState = TileState.HIDDEN;
  #absIdx: number = 0;
  #rowIdx: number = 0;
  #colIdx: number = 0;
  hasMine: boolean = false;
  #adjacent: Tile[] = [];
  #subscriptions: {
    [key in EventName]: { [id: string]: EventCallback };
  };
  isCauseOfDefeat: boolean = false;

  constructor(gameKey: string, absIdx: number, rowIdx: number, colIdx: number) {
    this.#key = gameKey + ":tile" + getId();
    this.#absIdx = absIdx;
    this.#rowIdx = rowIdx;
    this.#colIdx = colIdx;
    this.#subscriptions = {
      [EventName.stateChange]: {},
    };
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
      this.dispatch(EventName.stateChange, this.#state);
      return true;
    }
    return false;
  }

  unflag(): boolean {
    if (this.#state === TileState.FLAGGED) {
      this.#state = TileState.HIDDEN;
      this.dispatch(EventName.stateChange, this.#state);
      return true;
    }
    return false;
  }

  reveal(): boolean {
    if (this.#state === TileState.HIDDEN) {
      this.#state = TileState.REVEALED;
      this.dispatch(EventName.stateChange, this.#state);
      return true;
    }
    return false;
  }

  subscribe(evName: EventName, callback: EventCallback): () => void {
    const subId = getId();
    this.#subscriptions[evName][subId] = callback;
    return () => {
      delete this.#subscriptions[evName][subId];
    };
  }

  private dispatch(evName: EventName, payload: any) {
    const callbacks = Object.values(this.#subscriptions[evName]);
    setTimeout(() => {
      callbacks.forEach((callback) => callback(payload));
    }, 0);
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
