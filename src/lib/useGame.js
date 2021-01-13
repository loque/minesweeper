import { useRef, useState, useEffect } from "react";
import Game from "./Game";

export function useGame(difficultyLevel) {
  const game = useRef();
  const [props, setProps] = useState({});

  useEffect(() => {
    game.current = new Game(difficultyLevel);
    setProps(extractProps(game.current));
  }, [difficultyLevel]);

  function flagTile(tile) {
    if (game.current) {
      game.current.flagTile(tile);
      setProps(extractProps(game.current));
    }
  }

  function showTile(tile) {
    if (game.current) {
      game.current.showTile(tile);
      setProps(extractProps(game.current));
    }
  }

  return { ...props, flagTile, showTile };
}

function extractProps(game) {
  const {
    state,
    result,
    board,
    formatMs,
    startDateTime,
    placedFlags,
    difficultyLevel,
  } = game;
  return {
    state,
    result,
    board,
    formatMs,
    startDateTime,
    placedFlags,
    difficultyLevel,
  };
}
