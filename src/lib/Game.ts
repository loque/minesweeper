import { Tile, TileState } from "./Tile";

enum GameState {
  IDLE = "IDLE",
  STARTED = "STARTED",
  ENDED = "ENDED",
}

enum GameResult {
  NONE = "NONE",
  WON = "WON",
  LOST = "LOST",
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

type GameConstraints = {
  cols: number;
  rows: number;
  mines: number;
};

const GameConstraintsOptions = {
  [DifficultyLevel.EASY]: { cols: 10, rows: 8, mines: 10 },
  [DifficultyLevel.MEDIUM]: { cols: 18, rows: 14, mines: 40 },
  [DifficultyLevel.HARD]: { cols: 24, rows: 20, mines: 99 },
};

export default class Game {
  difficulty: DifficultyLevel;
  constraints: GameConstraints;

  totalTiles = 0;
  nonMineTiles = 0;
  nonMineTilesShown = 0;
  placedFlags = 0;

  minesPlaced = false;

  state: GameState = GameState.IDLE;
  result: GameResult = GameResult.NONE;

  #startDateTime: Date | null = null;
  #endDateTime: Date | null = null;

  #board: Tile[] = [];
  minesIndexes: number[] = [];

  constructor(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
    this.constraints = GameConstraintsOptions[difficulty];
    this.totalTiles = this.constraints.cols * this.constraints.rows;
    this.nonMineTiles = this.totalTiles - this.constraints.mines;
    this.createEmptyBoard();
  }

  createEmptyBoard() {
    this.#board = Array.from(
      { length: this.totalTiles },
      (v, index) => new Tile(TileState.HIDDEN, false, index)
    );
  }

  flagTile(tile: Tile) {
    this.placedFlags += this.#board[tile.index].toggleFlag();
  }

  showTile(tile: Tile, endIfMineIsFound = true) {
    if (this.state === GameState.ENDED) return;

    // We place mines just before the first move because
    // the first move should never be a mine
    if (this.placeMines(tile)) {
      this.state = GameState.STARTED;
      this.#startDateTime = new Date();
    }

    if (tile.hasMine && endIfMineIsFound) {
      // The user has found a mine => game lost
      this.#board[tile.index].show();
      this.state = GameState.ENDED;
      this.result = GameResult.LOST;
      this.#endDateTime = new Date();
      return;
    }

    // The tile does not have a mine, so show it
    const adjTiles = this.getAdjacentTiles(tile);
    const adjTilesWithMines = adjTiles.filter((tile) => tile.hasMine).length;
    if (this.#board[tile.index].show(adjTilesWithMines)) {
      this.nonMineTilesShown++;
    }

    if (this.nonMineTilesShown === this.nonMineTiles) {
      // All non-mine tiles have been revealed so the user won
      this.state = GameState.ENDED;
      this.result = GameResult.WON;
      this.#endDateTime = new Date();
      return;
    }

    if (adjTilesWithMines === 0) {
      // If all adjacent tiles do not have a mine, then show them all
      const adjTilesHidden = adjTiles.filter(
        (tile) => tile.state === TileState.HIDDEN
      );
      for (const adjTile of adjTilesHidden) {
        this.showTile(adjTile, false);
      }
    }
  }

  placeMines(exceptionTile: Tile) {
    // Only place mines once
    if (this.minesPlaced) return false;

    // Select indexes of all tiles but `exceptionTile`
    const availableIndexes = shuffle(
      this.#board
        .filter((tile) => tile.index !== exceptionTile.index)
        .map((tile) => tile.index)
    );

    // Store indexes of all tiles with mines
    this.minesIndexes = availableIndexes.slice(0, this.constraints.mines);

    // Place mines on randomly selected tiles (excluding `exceptionTile`)
    for (const index of this.minesIndexes) {
      this.#board[index].hasMine = true;
    }

    return (this.minesPlaced = true);
  }

  getAdjacentTiles(tile: Tile) {
    if (!(tile instanceof Tile))
      throw TypeError(`expected 'tile' to be an intance of Tile`);

    const adjTiles = [];
    const rowIdx = Math.floor(tile.index / this.constraints.cols);
    const colIdx = tile.index - rowIdx * this.constraints.cols;

    const topLeftTile = this.board[rowIdx - 1]?.[colIdx - 1];
    if (topLeftTile) adjTiles.push(topLeftTile);
    const topTile = this.board[rowIdx - 1]?.[colIdx];
    if (topTile) adjTiles.push(topTile);
    const topRightTile = this.board[rowIdx - 1]?.[colIdx + 1];
    if (topRightTile) adjTiles.push(topRightTile);

    const leftTile = this.board[rowIdx][colIdx - 1];
    if (leftTile) adjTiles.push(leftTile);
    const rightTile = this.board[rowIdx][colIdx + 1];
    if (rightTile) adjTiles.push(rightTile);

    const bottomLeftTile = this.board[rowIdx + 1]?.[colIdx - 1];
    if (bottomLeftTile) adjTiles.push(bottomLeftTile);
    const bottomTile = this.board[rowIdx + 1]?.[colIdx];
    if (bottomTile) adjTiles.push(bottomTile);
    const bottomRightTile = this.board[rowIdx + 1]?.[colIdx + 1];
    if (bottomRightTile) adjTiles.push(bottomRightTile);

    return adjTiles;
  }

  // Return the board as a matrix for better visualization
  get board(): Tile[][] {
    const matrix: Tile[][] = [];
    for (let rowIdx = 0; rowIdx < this.constraints.rows; rowIdx++) {
      const start = rowIdx * this.constraints.cols;
      const end = start + this.constraints.cols;
      // Prevent board mutation by returning a clone
      const row = this.#board.slice(start, end).map((tile) => tile.clone());
      matrix.push(row);
    }
    return matrix;
  }

  inspectAdjacentTiles(tile: Tile) {
    if (tile.state !== TileState.SHOWN) return;
    for (const adjTile of this.getAdjacentTiles(tile)) {
      this.#board[adjTile.index].inspecting = true;
    }
  }

  inspectAllTilesOff() {
    for (const tile of this.#board) {
      tile.inspecting = false;
    }
  }

  get gameTime() {
    let time = 0;
    if (this.#endDateTime !== null && this.#startDateTime !== null) {
      time = +this.#endDateTime - +this.#startDateTime;
    }
    return time;
  }

  get startDateTime() {
    return this.#startDateTime;
  }

  get startTime() {
    return this.#startDateTime?.toLocaleString("en-US");
  }

  get endTime() {
    return this.#endDateTime?.toLocaleString("en-US");
  }
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
