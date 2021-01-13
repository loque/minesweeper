import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Game.scss";
import { useGame } from "./lib/useGame";
import { useConfig } from "./lib/config";
import { msToMS } from "./lib/time";

function ElapsedTime({ startTime, run }) {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  useEffect(() => {
    let intervalId;
    if (run) {
      intervalId = setInterval(() => {
        setElapsedTime(msToMS(new Date() - startTime));
      }, 300);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, run]);
  return <div>Elapsed time {elapsedTime}</div>;
}

export default function Game() {
  const location = useLocation();
  const prevLocationKey = useRef(location.key);
  const config = useConfig();
  const game = useGame(config.difficulty);
  const prevGameState = useRef(game.state);

  useEffect(() => {
    if (prevLocationKey.current !== location.key) {
      prevLocationKey.current = location.key;
      game.reset();
    }
  }, [game, prevLocationKey, location.key]);

  const result = buildResult(game);
  useEffect(() => {
    if (prevGameState.current !== game.state) {
      prevGameState.current = game.state;
      if (game.state === "ENDED") {
        config.addResult(result);
      }
    }
  }, [prevGameState, game.state, config, result]);

  if (!game.board) return null;
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
  return (
    <>
      <h1>Game</h1>
      <div>
        <Link to="/setup">Setup</Link>
      </div>
      <div>
        {game.state} - {game.result}
      </div>
      <div>Placed flags: {game.placedFlags}</div>
      <ElapsedTime
        startTime={game.startDateTime}
        run={game.state === "STARTED"}
      />
      <div>Current level: {game.difficulty}</div>
      <div className="board">
        {game.board.map((row, rowIdx) => {
          return (
            <div className="board-row" key={rowIdx}>
              {row.map((tile) => (
                <div
                  className={`board-tile ${tile.state.toLowerCase()} ${
                    tile.hasMine ? "hasMine" : ""
                  }`}
                  key={tile.index}
                  onClick={tileLeftClickHandler(tile)}
                  onContextMenu={tileRightClickHandler(tile)}
                >
                  {tile.adjMines !== null &&
                    tile.adjMines !== 0 &&
                    tile.adjMines}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {game.state === "ENDED" && (
        <div>
          <div>
            <Link to="/game">Play again</Link>
          </div>
          <div>
            <Link to="/results">Results</Link>
          </div>
        </div>
      )}
    </>
  );
}

function buildResult(game) {
  return {
    startTime: game.startTime,
    endTime: game.endTime,
    difficulty: game.difficulty,
    gameTime: game.gameTime,
    status: game.status,
  };
}
