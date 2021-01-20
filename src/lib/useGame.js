import { useState, useEffect, useRef, useCallback } from "react";
import Game from "./Minesweeper";

export const configs = [{ rows: 10, cols: 10, mines: 20 }];

export function useGame(level) {
  const config = configs[level] || configs[configs.length - 1];
  const game = useRef(new Game(config));
  const [_, setTick] = useState(0); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const unsuscribe = game.current.subscribe((newGame) => {
      setTick((t) => t + 1);
    });
    return unsuscribe;
  }, [game]);

  const reset = useCallback(() => {
    game.current = new Game(config);
    setTick((t) => t + 1);
  }, [config]);

  return [game.current, reset];
}
