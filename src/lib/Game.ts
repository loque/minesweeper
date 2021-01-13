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
  difficultyLevel: DifficultyLevel;
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

  _board: Tile[] = [];
  minesIndexes: number[] = [];

  constructor(difficultyLevel: DifficultyLevel) {
    this.difficultyLevel = difficultyLevel;
    this.constraints = GameConstraintsOptions[difficultyLevel];
    this.totalTiles = this.constraints.cols * this.constraints.rows;
    this.nonMineTiles = this.totalTiles - this.constraints.mines;
    this.createEmptyBoard();
  }

  createEmptyBoard() {
    this._board = Array.from(
      { length: this.totalTiles },
      (v, index) => new Tile(TileState.HIDDEN, false, index)
    );
  }

  placeMines(exceptionTile: Tile) {
    // select indexes of all tiles but `exceptionTile`
    const availableIndexes = shuffle(
      this._board
        .filter((tile) => tile.index !== exceptionTile.index)
        .map((tile) => tile.index)
    );

    // store indexes of tiles with mines
    this.minesIndexes = availableIndexes.slice(0, this.constraints.mines);

    // place mines on randomly selected tiles (excluding `exceptionTile`)
    for (const index of this.minesIndexes) {
      this._board[index].hasMine = true;
    }

    this.minesPlaced = true;
  }

  // return board as a matrix for better visualization
  get board(): Tile[][] {
    const matrix: Tile[][] = [];
    for (let rowIdx = 0; rowIdx < this.constraints.rows; rowIdx++) {
      const start = rowIdx * this.constraints.cols;
      const end = start + this.constraints.cols;
      // prevent board mutation by returning a clone
      const row = this._board.slice(start, end).map((tile) => tile.clone());
      matrix.push(row);
    }
    return matrix;
  }

  flagTile(tile: Tile) {
    this.placedFlags += this._board[tile.index].toggleFlag();
  }

  showTile(tile: Tile, endIfMineIsFound = true) {
    /*
			if `nonMineTilesShown` === 0 => `placeMines()` (because The first click in any game
			will never be a mine) AND set `#startDateTime` AND set `state` to `GameState.STARTED`

			if `Tile` has a mine => game lost (show all mines)
			else, reveal number of adj tiles (including diagonals) that are
				covering mines (we'll call it `adjMines`)
				if `adjMines` === 0 => flip every adjacent tile
			
        
        `nonMineTilesShown`++
        if `nonMineTilesShown` === `nonMineTiles` => player wins
    */

    if (this.state === GameState.ENDED) return;

    // if this is the first move, place mines now
    // we do it now so that we guarantee that the first tile shown is not a mine
    if (!this.minesPlaced) {
      this.placeMines(tile);
      this.state = GameState.STARTED;
      this.#startDateTime = new Date();
    }

    if (!tile.hasMine) {
      const adjTiles = this.getAdjacentTiles(tile);
      const adjTilesWithMines = adjTiles.filter((tile) => tile.hasMine).length;
      if (this._board[tile.index].show(adjTilesWithMines)) {
        this.nonMineTilesShown++;
      }
      if (this.nonMineTilesShown === this.nonMineTiles) {
        this.state = GameState.ENDED;
        this.result = GameResult.WON;
        this.#endDateTime = new Date();
        return;
      }
      if (adjTilesWithMines === 0) {
        const adjTilesHidden = adjTiles.filter(
          (tile) => tile.state === TileState.HIDDEN
        );
        for (const adjTile of adjTilesHidden) {
          this.showTile(adjTile);
        }
      }
    } else if (endIfMineIsFound) {
      // a mine is found and `endIfMineIsFound` === true
      this._board[tile.index].show();
      this.state = GameState.ENDED;
      this.result = GameResult.LOST;
      this.#endDateTime = new Date();
    }
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

  get elapsedTime() {
    let time = "00:00";
    if (this.#startDateTime !== null) {
      time = this.formatMs(+new Date() - +this.#startDateTime);
    }
    return time;
  }

  get gameTime() {
    let time = "00:00";
    if (this.#endDateTime !== null && this.#startDateTime !== null) {
      time = this.formatMs(+this.#endDateTime - +this.#startDateTime);
    }
    return time;
  }

  formatMs(ms: number): string {
    return msToMS(ms);
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

// from: https://stackoverflow.com/a/29816921/3622350
function msToMS(ms: number) {
  // Convert to seconds:
  let seconds = ms / 1000;
  // Extract minutes:
  let minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  // Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  return numPad(minutes) + ":" + numPad(Math.floor(seconds));
}

function numPad(str: string | number, length: number = 2) {
  str = str + "";
  if (str.length < length) {
    let diff = length - str.length;
    str = "0".repeat(diff) + str;
  }
  return str;
}
