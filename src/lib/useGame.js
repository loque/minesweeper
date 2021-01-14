import { useRef, useState, useEffect, useCallback } from "react";
import Game from "./Game";

export function useGame(difficulty) {
  const game = useRef();
  const [props, setProps] = useState({});

  useEffect(() => {
    game.current = new Game(difficulty);
    setProps(extractProps(game.current));
  }, [difficulty]);

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

  function setSeenTileAndAdj(tile, state) {
    if (game.current) {
      game.current.setSeenTileAndAdj(tile, state);
      setProps(extractProps(game.current));
    }
  }

  function inspectAllTilesOff() {
    if (game.current) {
      game.current.inspectAllTilesOff();
      setProps(extractProps(game.current));
    }
  }

  const reset = useCallback(() => {
    if (game.current) {
      game.current = new Game(difficulty);
      setProps(extractProps(game.current));
    }
  }, [game, difficulty]);

  return {
    ...props,
    flagTile,
    showTile,
    reset,
    setSeenTileAndAdj,
    inspectAllTilesOff,
  };
}

function extractProps(game) {
  const {
    state,
    result,
    board,
    startDateTime,
    startTime,
    endTime,
    gameTime,
    placedFlags,
    difficulty,
  } = game;
  return {
    state,
    result,
    board,
    startDateTime,
    startTime,
    endTime,
    gameTime,
    placedFlags,
    difficulty,
  };
}
