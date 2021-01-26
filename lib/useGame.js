import { useState, useCallback, useEffect } from "react";
import Minesweeper from "../game/Minesweeper";

export const levels = [
  { rows: 10, cols: 10, mines: 20 },
  { rows: 20, cols: 10, mines: 40 },
  { rows: 30, cols: 10, mines: 60 },
];

export default function useGame(level) {
  const config = levels[level - 1] || levels[0];
  const [game, setGame] = useState(() => new Minesweeper(config));

  const reset = useCallback(
    function reset() {
      setGame(() => new Minesweeper(config));
    },
    [config]
  );

  return [game, reset];
}

export function useGameState(game) {
  const [gameState, setGameState] = useState(game.state());
  useEffect(() => {
    const clean = game.subscribe("stateChange", setGameState);
    return () => clean();
  }, [game]);
  return [gameState, setGameState];
}

export function useGameResult(game) {
  const [gameResult, setGameResult] = useState(() => game.result());
  useEffect(() => {
    const clean = game.subscribe("resultChange", setGameResult);
    return () => clean();
  }, [game]);
  return gameResult;
}

export function useFlagsCount(game) {
  const [flagsCount, setFlagsCount] = useState(game.totalMines);
  useEffect(() => {
    const clean = game.subscribe("flagsCountChange", setFlagsCount);
    return () => clean();
  }, [game]);
  return flagsCount;
}

export function useTileState(tile) {
  const [tileState, setTileState] = useState(tile.state);
  useEffect(() => {
    const clean = tile.subscribe("stateChange", setTileState);
    return () => clean();
  }, [tile]);
  return tileState;
}
