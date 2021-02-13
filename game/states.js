import { useState, useEffect } from "react";
import { atom, atomFamily, selector, useRecoilValue } from "recoil";
import Minesweeper from "./Minesweeper";

const levelAtom = atom({
  key: "levelAtom",
  default: (process.browser && localStorage.getItem("level")) || 1,
});

export const levelSelector = selector({
  key: "levelSelector",
  get: ({ get }) => get(levelAtom),
  set: ({ set }, level) => {
    localStorage.setItem("level", level);
    set(levelAtom, level);
  },
});

const usernameAtom = atom({
  key: "usernameAtom",
  default: (process.browser && localStorage.getItem("username")) || "",
});

export const usernameSelector = selector({
  key: "usernameSelector",
  get: ({ get }) => get(usernameAtom),
  set: ({ set }, username) => {
    localStorage.setItem("username", username);
    set(usernameAtom, username);
  },
});

export const configSelector = selector({
  key: "configSelector",
  get: ({ get }) => ({ username: get(usernameAtom), level: get(levelAtom) }),
});

const resultsAtom = atom({
  key: "resultsAtom",
  default:
    (process.browser && JSON.parse(localStorage.getItem("results"))) || [],
});

export const resultsSelector = selector({
  key: "resultsSelector",
  get: ({ get }) => get(resultsAtom),
  set: ({ set, get }, newResult) => {
    const results = get(resultsAtom);
    results.push(newResult);
    localStorage.setItem("results", JSON.stringify(results));
    set(resultsAtom, [...results]);
  },
});

export const levels = [
  { rows: 10, cols: 10, mines: 20 },
  { rows: 20, cols: 10, mines: 40 },
  { rows: 30, cols: 10, mines: 60 },
];

function getLevelConfig(level) {
  return levels[level - 1] || levels[0];
}

export const gameAtom = atom({
  key: "gameAtom",
  default: null,
  dangerouslyAllowMutability: true,
});

export const gameSelector = selector({
  key: "gameSelector",
  get: ({ get }) => get(gameAtom),
  set: ({ set, get }) => {
    const level = get(levelAtom);
    const levelConfig = getLevelConfig(level);
    set(gameAtom, new Minesweeper(levelConfig));
  },
  dangerouslyAllowMutability: true,
});

/*
  TODO: how can I create a new Minesweeper and have a loading state until it's
  state changes to READY?

  When clicking 'Play' in pages/index.js or components/EndGame.js, we should:
    1. show a loading state **in the button** 
    2. trigger the creation of a new Minesweeper and subscribe to state changes
    3. when Minesweeper is READY, **then** transition to pages/game.js
  
  This behaviour should also be used when going directly to pages/game.js
  without clickin any 'Play' button.
*/

export function useGameState() {
  const game = useRecoilValue(gameSelector);
  const [gameState, setGameState] = useState(game?.state());
  useEffect(() => game && game.on("stateChange", setGameState), [game]);
  return gameState;
}

export function useGameResult() {
  const game = useRecoilValue(gameSelector);
  const [gameResult, setGameResult] = useState(game?.result());
  useEffect(() => game && game.on("resultChange", setGameResult), [game]);
  return gameResult;
}

export function useFlagsCount() {
  const game = useRecoilValue(gameSelector);
  const [flagsCount, setFlagsCount] = useState(game.totalMines);
  useEffect(() => game.on("flagsCountChange", setFlagsCount), [game]);
  return flagsCount;
}

export function useTileState(tile) {
  const [tileState, setTileState] = useState(tile.state);
  useEffect(() => tile.on("stateChange", setTileState), [tile]);
  return tileState;
}

export const tileIsScanned = atomFamily({
  key: "tileIsScanned",
  default: false,
});

/**
 * 0 = none
 * 1 = scanning one
 * 2 = scanning multi
 */
export const scanState = atom({
  key: "scanState",
  default: 0,
});

/**
 * Array of absIdx including target tile and adjacent tiles, in case of scanning
 * multiple tiles.
 */
const scanTargets = atom({
  key: "scanTargets",
  default: [],
});

export const scanTargetsSelector = selector({
  key: "scanTargetsSelector",
  set: ({ set, get }, newTargets) => {
    const currScanState = get(scanState);
    if (currScanState) {
      // When scanning only one assume the first item is the tile at the center
      // of the cluster
      if (currScanState === 1) newTargets = newTargets.slice(0, 1);

      const prevTargets = get(scanTargets);
      const [toTrue, toFalse] = getSetDiff(newTargets, prevTargets);

      set(scanTargets, newTargets);

      toTrue.forEach((absIdx) => {
        set(tileIsScanned(absIdx), true);
      });

      toFalse.forEach((absIdx) => {
        set(tileIsScanned(absIdx), false);
      });
    }
  },
});

function getSetDiff(arr1, arr2) {
  const acc1 = {};
  const acc2 = [];

  for (let item1 of arr1) {
    acc1[item1] = item1;
  }

  for (let item2 of arr2) {
    if (acc1.hasOwnProperty(item2)) {
      delete acc1[item2];
    } else {
      acc2.push(item2);
    }
  }
  return [Object.values(acc1), acc2];
}
