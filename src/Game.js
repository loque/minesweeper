import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Game.scss";
import { useGame } from "./lib/useGame";
import { useConfig } from "./lib/config";

import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";

import Header from "./components/Header";
import StatusBar from "./components/StatusBar";

export default function Game() {
  const location = useLocation();
  const prevLocationKey = useRef(location.key);
  const config = useConfig();
  const game = useGame(config.difficulty);
  const prevGameState = useRef(game.state);
  const board = useRef();
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    if (prevLocationKey.current !== location.key) {
      prevLocationKey.current = location.key;
      game.reset();
    }
  }, [game, prevLocationKey, location.key]);

  const result = buildResult(game, config);
  useEffect(() => {
    if (prevGameState.current !== game.state) {
      prevGameState.current = game.state;
      if (game.state === "ENDED") {
        config.addResult(result);
      }
    }
  }, [prevGameState, game.state, config, result]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setBoardWidth(entry.contentRect.width);
      }
    });
    const currBoard = board.current;
    if (currBoard) {
      resizeObserver.observe(currBoard);
    }
    return () => {
      if (currBoard) {
        resizeObserver.unobserve(currBoard);
      }
    };
  }, [board]);

  function tileLeftClickHandler(tile) {
    return (e) => {
      e.preventDefault();
      game.showTile(tile);
    };
  }
  function tileRightClickHandler(tile) {
    return (e) => {
      e.preventDefault();
      game.flagTile(tile);
    };
  }
  let tileMargin = 0;
  let tileSize = 0;
  if (game.board && boardWidth) {
    switch (game.difficulty) {
      case "EASY":
        tileMargin = 1.5;
        break;
      case "MEDIUM":
        tileMargin = 1;
        break;
      case "HARD":
        tileMargin = 0.5;
        break;
    }

    const cols = game.board[0].length;
    tileSize = boardWidth / cols - tileMargin * 2;
  }

  return (
    <div className="view">
      <div className="container">
        <Header />
        <StatusBar game={game} />

        <div
          ref={board}
          className={`board ${game.state === "ENDED" && "disabled"}`}
        >
          {game.board &&
            game.board.map((row, rowIdx) => {
              return (
                <div className="board-row" key={rowIdx}>
                  {row.map((tile) => {
                    const value = tile.adjMines || 0;
                    return (
                      <div
                        key={tile.index}
                        className={`board-tile ${tile.state.toLowerCase()} ${
                          tile.hasMine && "hasMine"
                        } ${game.state === "ENDED" && "disabled"} ${
                          color[Math.min(value, color.length - 1)]
                        } ${value === 0 && "empty"}`}
                        style={{
                          width: tileSize + "px",
                          height: tileSize + "px",
                          margin: tileMargin + "px",
                          fontSize: tileMargin + "em",
                        }}
                        onClick={tileLeftClickHandler(tile)}
                        onContextMenu={tileRightClickHandler(tile)}
                      >
                        <div className="board-tile-content">
                          {!!value && value}
                          {tile.state === "FLAGGED" && (
                            <FlagIcon className="red" />
                          )}
                          {tile.state === "SHOWN" && tile.hasMine && (
                            <MineIcon />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
        {game.state === "ENDED" && <EndGame result={game.result} />}
      </div>
    </div>
  );
}

const color = ["grey", "blue", "green", "red", "dark-blue"];

function buildResult(game, config) {
  return {
    startTime: game.startTime,
    endTime: game.endTime,
    difficulty: game.difficulty,
    gameTime: game.gameTime,
    result: game.result,
    name: config.name,
  };
}

function EndGame({ result }) {
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="endgame">
      <div className="endgame-modal">
        {result === "WON" && (
          <div className="endgame-result icon-text">
            <HappyIcon className="yellow" /> You won!
          </div>
        )}
        {result === "LOST" && (
          <div className="endgame-result icon-text">
            <SadIcon className="red" /> You Lost!
          </div>
        )}
        <div className="endgame-actions">
          <Link ref={autofocus} className="button icon-text" to="/game">
            <ReloadIcon />
            Play again
          </Link>
          <Link to="/results" className="button icon-text">
            <MedalIcon />
            Results
          </Link>
        </div>
      </div>
    </div>
  );
}
