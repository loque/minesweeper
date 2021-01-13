enum TileState {
  HIDDEN = "HIDDEN",
  SHOWN = "SHOWN",
  FLAGGED = "FLAGGED",
}

export class Tile {
  state: TileState;
  hasMine: boolean;
  index: number;
  adjMines: number | null = null;

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

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

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

enum DifficultyLevel {
  TEST = "TEST",
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
  [DifficultyLevel.TEST]: { cols: 5, rows: 4, mines: 2 },
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

  placeMines(exceptionTile: Tile) {
    // select indexes of all tiles but `exceptionTile`
    // store indexes of tiles with mines
    // place mines on randomly selected tiles (excluding `exceptionTile`)
  }

  showTile(tile: Tile) {
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
}

export function log(game: Game) {
  console.log(game.board.map((row) => row.map(mapTile)));
  if (game.result === GameResult.NONE) {
    console.log(game.state, game.result, game.placedFlags);
  } else {
    console.log(
      game.state,
      game.result,
      game.difficultyLevel,
      game.placedFlags
    );
  }
}

function mapTile(tile: Tile) {
  if (tile.state === TileState.HIDDEN) return "  ";
  if (tile.state === TileState.FLAGGED) return "🏳️ ";
  if (tile.state === TileState.SHOWN)
    return tile.hasMine ? "💣" : tile.adjMines + " ";
}

/* 
// testing with deno
const GG = await import('./src/lib/Game.ts'); const Game = GG.default; const log
= GG.log; const game = new Game('TEST');

game.showTile(game.board[1][2]); log(game);
*/
