import Tile, { TileState } from "./Tile";

enum GameState {
  IDLE = "IDLE",
  PLAYING = "PLAYING",
  ENDED = "ENDED",
}
export interface BoardConfig {
  rows: number;
  cols: number;
  mines: number;
}

export type BoardList = Tile[];
export type BoardMatrix = Tile[][];
export interface Board {
  list: BoardList;
  matrix: BoardMatrix;
}

export default class Game {
  #state: GameState = GameState.IDLE;
  #config: BoardConfig;
  #board: Board = { list: [], matrix: [] };
  #startDateTime: Date | null = null;
  #endDateTime: Date | null = null;
  #minesPlaced: boolean = false;

  constructor(config: BoardConfig) {
    this.#config = config;
    this.createEmptyBoard();
    this.setAdjacent();
  }

  get matrix(): BoardMatrix {
    return this.#board.matrix;
  }

  get placedFlags(): number {
    return this.#board.list.filter((tl) => tl.matches(TileState.FLAGGED))
      .length;
  }

  get startDateTime() {
    return this.#startDateTime;
  }

  get endDateTime() {
    return this.#endDateTime;
  }

  get gameTime() {
    let time = 0;
    if (this.#endDateTime !== null && this.#startDateTime !== null) {
      time = +this.#endDateTime - +this.#startDateTime;
    }
    return time;
  }

  matches(state: GameState): boolean {
    return this.#state === state;
  }

  flag(absIdx: number) {
    if (this.matches(GameState.ENDED)) return;
    this.#board.list[absIdx].flag();
  }

  unflag(absIdx: number) {
    if (this.matches(GameState.ENDED)) return;
    this.#board.list[absIdx].unflag();
  }

  reveal(absIdx: number, endIfMineIsFound = true) {
    if (this.matches(GameState.ENDED)) return;

    // We place mines just before the first move because
    // the first move should never be a mine
    if (this.placeMines(absIdx)) this.gameStart();

    const tile = this.#board.list[absIdx];
    tile.reveal();

    if (tile.hasMine && endIfMineIsFound) return this.gameLost();

    if (this.allNonMineTilesRevealed()) return this.gameWon();

    if (tile.adjacent.filter((tl: Tile) => tile.hasMine).length === 0) {
      // If all adjacent tiles do not have a mine, then show them all
      const adjTilesHidden = tile.adjacent.filter((tl) =>
        tile.matches(TileState.HIDDEN)
      );
      for (const adjTile of adjTilesHidden) {
        this.reveal(adjTile.absIdx, false);
      }
    }
  }

  revealAdjacent(absIdx: number) {
    if (this.matches(GameState.ENDED)) return;

    const tile = this.#board.list[absIdx];

    if (this.isEligibleForAdjacentReveal(tile)) {
      const adjacentHidden = tile.adjacent.filter((tl) =>
        tile.matches(TileState.HIDDEN)
      );

      adjacentHidden.forEach((t) => t.reveal());

      if (!!adjacentHidden.find((t) => t.hasMine)) {
        return this.gameLost();
      }

      if (this.allNonMineTilesRevealed()) {
        return this.gameWon();
      }
    }
  }

  private isEligibleForAdjacentReveal(tile: Tile): boolean {
    const adjFlags = tile.adjacent.filter((tl) =>
      tile.matches(TileState.FLAGGED)
    ).length;
    const possibileMines = !!tile.adjacent.filter((tl) =>
      tile.matches(TileState.HIDDEN)
    ).length;

    return (
      tile.matches(TileState.REVEALED) &&
      tile.value === adjFlags &&
      possibileMines
    );
  }

  private createEmptyBoard() {
    const { rows, cols } = this.#config;
    const list: BoardList = [];
    const matrix: BoardMatrix = [];
    let absIdx = 0;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      const row = [];
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        const newTile = new Tile(absIdx, rowIdx, colIdx);
        list.push(newTile);
        row.push(newTile);
        absIdx++;
      }
      matrix.push(row);
    }
    this.#board = { list, matrix };
  }

  private setAdjacent() {
    const { list, matrix } = this.#board;
    for (const tile of list) {
      const { rowIdx, colIdx } = tile;
      tile.adjacent = getAdjacentForOne(matrix, rowIdx, colIdx);
    }
  }

  private placeMines(exceptedAbsIdx: number): boolean {
    // Only place mines once
    if (this.#minesPlaced) return false;

    const list = this.#board.list;
    const exceptedIndexes = list[exceptedAbsIdx].adjacent.map(
      (tl: Tile) => tl.absIdx
    );
    exceptedIndexes.push(exceptedAbsIdx);

    // Shuffle indexes of tiles eligible for containing a mine
    const eligibleIndexes = shuffle(
      list
        .filter((tl) => !exceptedIndexes.includes(tl.absIdx))
        .map((tl) => tl.absIdx)
    );

    // Store indexes of all tiles with mines.
    const indexesOfMines = eligibleIndexes.slice(0, this.#config.mines);

    // Place mines on randomly selected tiles (excluding `exceptedAbsIdx`)
    for (const absIdx of indexesOfMines) {
      list[absIdx].hasMine = true;
    }

    return (this.#minesPlaced = true);
  }

  private allNonMineTilesRevealed(): boolean {
    const totalTiles = this.#config.rows * this.#config.cols;
    const nonMineTiles = totalTiles - this.#config.mines;
    const nonMineTilesRevealed = this.#board.list.filter(
      (tl: Tile) => tl.matches(TileState.REVEALED) && tl.hasMine === false
    ).length;

    return nonMineTilesRevealed === nonMineTiles;
  }

  private gameStart() {
    this.#startDateTime = new Date();
    this.#state = GameState.PLAYING;
  }

  private gameLost() {
    this.#endDateTime = new Date();
    this.#state = GameState.ENDED;
  }

  private gameWon() {
    this.#endDateTime = new Date();
    this.#state = GameState.ENDED;
  }
}

/**
 * Set `tile.adjacent` with an array containing references for every adjacent
 * tile.
 * Note: This should be a private method, public methods should **not** accept a
 * `Tile` directly but the `absIdx` to it.
 */
function getAdjacentForOne(
  matrix: BoardMatrix,
  targetRI: number,
  targetCI: number
): Tile[] {
  const adjacent = [];
  for (let rowDiff = -1; rowDiff < 2; rowDiff++) {
    for (let colDiff = -1; colDiff < 2; colDiff++) {
      if (rowDiff === 0 && colDiff === 0) continue;
      const currRI = targetRI + rowDiff;
      const currCI = targetCI + colDiff;
      const adj = matrix[currRI]?.[currCI];
      if (adj) adjacent.push(adj);
    }
  }
  return adjacent;
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
