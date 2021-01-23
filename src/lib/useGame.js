import { useState, useCallback } from "react";
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
