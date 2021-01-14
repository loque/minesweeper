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

const tileMargin = 1.5;

export default function Game() {
  const config = useConfig();

  const location = useLocation();
  const prevLocationKey = useRef(location.key);

  const game = useGame(config.difficulty);
  const prevGameState = useRef(game.state);

  const boardRef = useRef();
  const [tileSize, setTileSize] = useState(0);
  const [tileUnderMouse, setTileUnderMouse] = useState(null);

  const [inspectTileOn, setInspectTileOn] = useState(false);
  const inspectingTile = useRef("");

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
    const board = boardRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const board = entry.target;
        const colsCount = board.children[0].children.length;
        const { width } = board.getBoundingClientRect();
        const nextTileSize = width / colsCount - tileMargin * 2;
        setTileSize(nextTileSize);
        // setBoardRect({ left, width, top, height });
      }
    });

    if (board) resizeObserver.observe(board);
    return () => board && resizeObserver.unobserve(board);
  }, [boardRef]);

  // useEffect(() => {
  //   if (
  //     inspectingTile.current !== tileUnderMouse &&
  //     tileUnderMouse &&
  //     inspectTileOn
  //   ) {
  //     inspectingTile.current = tileUnderMouse;
  //     game.inspectAdjacentTiles(tileUnderMouse);
  //   }
  // }, [game, tileUnderMouse, inspectTileOn, inspectingTile]);

  // We activate (mousedown) / deactivate (mouseup) underlying tile detection.
  // Will work even if mouseup is fired outside the board.
  // Also, we make the first detection on mousedown and remove detection state
  // on mouseup.
  useEffect(() => {
    const detectUnderlyingTile = makeDetector(boardRef.current, tileSize);

    function activateDetection(e) {
      if (e.button === 1) {
        setInspectTileOn(true);
        detectUnderlyingTile(e);
      }
    }

    function deactivateDetection(e) {
      if (e.button === 1) {
        setInspectTileOn(false);
        setTileUnderMouse(null);
      }
    }

    window.addEventListener("mousedown", activateDetection);
    window.addEventListener("mouseup", deactivateDetection);
    return () => {
      window.removeEventListener("mousedown", activateDetection);
      window.removeEventListener("mouseup", deactivateDetection);
    };
  }, [boardRef, tileSize]);

  // Detect underlying tile on mousemove only when underlying detection is
  // active. See previous `useEffect`.
  useEffect(() => {
    const board = boardRef.current;
    const shouldListen = inspectTileOn && board && tileSize;
    const detectUnderlyingTile = makeDetector(board, tileSize);

    shouldListen && window.addEventListener("mousemove", detectUnderlyingTile);
    return () => {
      shouldListen &&
        window.removeEventListener("mousemove", detectUnderlyingTile);
    };
  }, [inspectTileOn, boardRef, tileSize]);

  function makeDetector(board, tileSize) {
    return (e) => {
      const { left, top } = board.getBoundingClientRect();
      const mouseX = e.pageX - left; // relative to the board
      const mouseY = e.pageY - top; // relative to the board
      if (mouseX < 0 || mouseY < 0) {
        setTileUnderMouse(null);
      } else {
        const currTileSize = tileSize + tileMargin * 2;
        const colIdx = Math.floor(mouseX / currTileSize);
        const rowIdx = Math.floor(mouseY / currTileSize);
        setTileUnderMouse({ rowIdx, colIdx });
      }
    };
  }

  function tileClick(tile) {
    return (e) => {
      e.preventDefault();
      if (e.button === 0) game.showTile(tile);
    };
  }

  function tileContextMenu(tile) {
    return (e) => {
      e.preventDefault();
      game.flagTile(tile);
    };
  }

  return (
    <div className="view">
      <div className="container">
        <Header />
        <StatusBar game={game} />

        <div
          ref={boardRef}
          className={`board ${game.state === "ENDED" && "disabled"}`}
        >
          {game.board &&
            game.board.map((row, rowIdx) => {
              return (
                <div className="board-row" key={rowIdx}>
                  {row.map((tile, colIdx) => {
                    const value = tile.adjMines || 0;
                    return (
                      <div
                        key={tile.index}
                        className={`board-tile ${tile.state.toLowerCase()} ${
                          tile.hasMine && "hasMine"
                        } ${game.state === "ENDED" && "disabled"} ${
                          color[Math.min(value, color.length - 1)]
                        } ${value === 0 && "empty"} ${
                          tile.inspecting && "inspecting"
                        } ${
                          tileUnderMouse?.rowIdx === rowIdx &&
                          tileUnderMouse?.colIdx === colIdx &&
                          "test"
                        }`}
                        style={{
                          width: tileSize + "px",
                          height: tileSize + "px",
                          margin: tileMargin + "px",
                          fontSize: tileMargin + "em",
                        }}
                        onClick={tileClick(tile)}
                        onContextMenu={tileContextMenu(tile)}
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
