export enum TileState {
  HIDDEN = "HIDDEN",
  SHOWN = "SHOWN",
  FLAGGED = "FLAGGED",
}

export class Tile {
  state: TileState;
  hasMine: boolean;
  index: number;
  adjMines: number | null = null;
  seen: boolean = false;

  constructor(state: TileState, hasMine: boolean, index: number) {
    this.state = state;
    this.hasMine = hasMine;
    this.index = index;
  }

  show(adjMines: number | null = null): boolean {
    // can not show FLAGGED or already SHOWN tiles
    if (this.state === TileState.HIDDEN) {
      this.state = TileState.SHOWN;
      this.adjMines = adjMines;
      return true;
    }
    return false;
  }

  toggleFlag() {
    switch (this.state) {
      case TileState.FLAGGED:
        this.state = TileState.HIDDEN;
        return -1;
      case TileState.HIDDEN:
        this.state = TileState.FLAGGED;
        return 1;
      default:
        return 0;
    }
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
