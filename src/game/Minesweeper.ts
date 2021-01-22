import Tile, { TileState } from "./Tile";
import { shuffle } from "../lib/utils";

enum GameResult {
  NONE = "NONE",
  WON = "WON",
  LOST = "LOST",
}

enum GameState {
  IDLE = "IDLE",
  PLAYING = "PLAYING",
  ENDED = "ENDED",
}
interface BoardConfig {
  rows: number;
  cols: number;
  mines: number;
}

type BoardList = Tile[];
type BoardMatrix = Tile[][];
interface Board {
  list: BoardList;
  matrix: BoardMatrix;
}

type Subscription = () => void;
type Cluster = Set<number>;

let counter = 0;
export default class Minesweeper {
  #key: string;
  #state: GameState = GameState.IDLE;
  #result: GameResult = GameResult.NONE;
  #config: BoardConfig;
  #board: Board = { list: [], matrix: [] };
  #startDateTime: Date | null = null;
  #endDateTime: Date | null = null;
  #minesPlaced: boolean = false;
  #subscriptions: Subscription[] = [];

  constructor(config: BoardConfig) {
    this.#key = "game" + counter++;
    this.#config = config;
    this.createEmptyBoard();
    this.setAdjacent();
  }

  get key() {
    return this.#key;
  }

  get board(): BoardMatrix {
    return this.#board.matrix;
  }

  get flagsCount(): number {
    return (
      this.#config.mines -
      this.#board.list.filter((tl) => tl.state(TileState.FLAGGED)).length
    );
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

  state(state: GameState | null = null): GameState | boolean {
    if (state === null) return this.#state;
    return this.#state === state;
  }

  result(result: GameResult | null = null): GameResult | boolean {
    if (result === null) return this.#result;
    return this.#result === result;
  }

  flag(absIdx: number): boolean {
    if (this.state(GameState.ENDED)) return this.res(false);
    return this.res(this.#board.list[absIdx].flag());
  }

  unflag(absIdx: number): boolean {
    if (this.state(GameState.ENDED)) return this.res(false);
    return this.res(this.#board.list[absIdx].unflag());
  }

  reveal(absIdx: number, endIfMineIsFound = true): boolean {
    if (this.state(GameState.ENDED)) return this.res(false);

    // We place mines just before the first move because
    // the first move should never be a mine
    if (this.placeMines(absIdx)) this.gameStart();

    const tile = this.#board.list[absIdx];
    if (!tile.reveal()) return this.res(false);

    if (tile.hasMine && endIfMineIsFound) return this.gameLost();
    if (this.allNonMineTilesRevealed()) return this.gameWon();

    const cluster = this.getCluster(tile);

    for (const adjAbsIdx of cluster.values()) {
      this.#board.list[adjAbsIdx].reveal();
    }

    if (this.allNonMineTilesRevealed()) return this.gameWon();

    return this.res(true);
  }

  private getCluster(tile: Tile, cluster: Cluster = new Set()): Cluster {
    if (tile.value === 0) {
      // If all adjacent tiles do not have a mine, then collect them
      const adjHidden = tile.adjacent.filter((tl) =>
        tl.state(TileState.HIDDEN)
      );
      for (const adj of adjHidden) {
        if (cluster.has(adj.absIdx)) continue;

        cluster.add(adj.absIdx);
        this.getCluster(adj, cluster);
      }
    }
    return cluster;
  }

  revealAdjacent(absIdx: number): boolean {
    if (this.state(GameState.ENDED)) return this.res(false);

    const tile = this.#board.list[absIdx];

    if (!isEligibleForAdjacentReveal(tile)) return this.res(false);

    const adjacentHidden = tile.adjacent.filter((tl) =>
      tl.state(TileState.HIDDEN)
    );

    const someAdjacentRevealed = adjacentHidden
      .map((t) => t.reveal())
      .some((res) => res);

    if (!!adjacentHidden.find((tl) => tl.hasMine)) {
      return this.gameLost();
    }

    if (this.allNonMineTilesRevealed()) {
      return this.gameWon();
    }

    const adjacentZeros = adjacentHidden.filter((tl) => tl.value === 0);

    if (adjacentZeros.length) {
      let cluster: Cluster = new Set();
      for (const adjZero of adjacentZeros) {
        const newCluster = this.getCluster(adjZero);
        cluster = new Set([...cluster, ...newCluster]);
      }
      for (const adjAbsIdx of cluster.values()) {
        this.#board.list[adjAbsIdx].reveal();
      }
    }

    return this.res(someAdjacentRevealed);
  }

  subscribe(callback: Subscription) {
    const subs = this.#subscriptions;
    subs.push(callback);
    const callbackIdx = subs.length - 1;
    return function unsuscribe() {
      subs.splice(callbackIdx, 1);
    };
  }

  private createEmptyBoard() {
    const { rows, cols } = this.#config;
    const list: BoardList = [];
    const matrix: BoardMatrix = [];
    let absIdx = 0;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      const row = [];
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        const newTile = new Tile(this.#key, absIdx, rowIdx, colIdx);
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
      (tl: Tile) => tl.state(TileState.REVEALED) && tl.hasMine === false
    ).length;
    return nonMineTilesRevealed === nonMineTiles;
  }

  private gameStart() {
    this.#startDateTime = new Date();
    this.#state = GameState.PLAYING;
    return true;
  }

  private gameLost() {
    this.#endDateTime = new Date();
    this.#state = GameState.ENDED;
    this.#result = GameResult.LOST;
    return this.res(true);
  }

  private gameWon() {
    this.#endDateTime = new Date();
    this.#state = GameState.ENDED;
    this.#result = GameResult.WON;
    return this.res(true);
  }

  private res(result: boolean): boolean {
    if (result) this.#subscriptions.forEach((sub) => sub());
    return result;
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

export function isEligibleForAdjacentReveal(tile: Tile): boolean {
  const adjFlags = tile.adjacent.filter((tl) => tl.state(TileState.FLAGGED))
    .length;
  const possibileMines = !!tile.adjacent.filter((tl) =>
    tl.state(TileState.HIDDEN)
  ).length;

  return (
    tile.state(TileState.REVEALED) && tile.value === adjFlags && possibileMines
  );
}