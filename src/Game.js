import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Game.scss";
import { useGame } from "./lib/useGame";
import { useConfig } from "./lib/config";
import { useInspection } from "./utils/useInspection";
import { useResize } from "./utils/useResize";

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
  // const prevLocationKey = useRef(location.key);

  const game = useGame(config.level);

  const boardRef = useRef();
  const [tileSize, setTileSize] = useState(0);

  // TODO: implement reset
  // useEffect(() => {
  //   if (prevLocationKey.current !== location.key) {
  //     prevLocationKey.current = location.key;
  //     game.reset();
  //   }
  // }, [game, prevLocationKey, location.key]);

  // const result = buildResult(game, config);
  // useEffect(() => {
  //   if (prevGameState.current !== game.state) {
  //     prevGameState.current = game.state;
  //     if (game.matches('ended')) {
  //       config.addResult(result);
  //     }
  //   }
  // }, [prevGameState, game.state, config, result]);

  // Observe board width changes and calculate `tileSize`
  function onBoardResize(boardEl) {
    // We have to check if board has children because they may not be
    // mounted yet
    if (boardEl.children[0]) {
      const colsCount = boardEl.children[0].children.length;
      const { width } = boardEl.getBoundingClientRect();
      const nextTileSize = width / colsCount - tileMargin * 2;
      setTileSize(nextTileSize);
    }
  }
  useResize(boardRef, onBoardResize);

  function onInspectOneEnd(ctx) {
    const { rowIdx, colIdx } = ctx;
    const targetTile = game.board[rowIdx]?.[colIdx];
    if (targetTile) {
      game.actions.revealTile(targetTile.absIdx);
    }
  }

  function onInspectMultiEnd(ctx) {
    const { rowIdx, colIdx } = ctx;
    const targetTile = game.board[rowIdx]?.[colIdx];
    if (targetTile) {
      game.actions.revealAdjacentTiles(targetTile.absIdx);
    }
  }

  const inspect = useInspection(
    boardRef,
    tileSize,
    tileMargin,
    onInspectOneEnd,
    onInspectMultiEnd
  );

  const inspectedTiles = [];

  if (!inspect.matches("idle") && typeof inspect.context.rowIdx === "number") {
    const { rowIdx, colIdx } = inspect.context;
    const centerTile = game?.board[rowIdx]?.[colIdx];
    if (centerTile) {
      inspectedTiles.push(centerTile.absIdx);
      if (inspect.matches("inspectingMulti")) {
        centerTile.adjacent.forEach((tile) => inspectedTiles.push(tile.absIdx));
      }
    }
  }

  function tileContextMenu(tile) {
    return (e) => {
      e.preventDefault();
      if (tile.matches("flagged")) {
        game.actions.unflagTile(tile.absIdx);
      } else if (tile.matches("hidden")) {
        game.actions.flagTile(tile.absIdx);
      }
    };
  }

  const tilesCNs = ["board-tile", [game.matches("ended"), "disabled"]];
  return (
    <div className="view">
      <div className="container">
        <Header />
        <StatusBar game={game} />

        <div
          ref={boardRef}
          {...bCN("board", [game.matches("ended"), "disabled"])}
        >
          {game.board &&
            game.board.map((row, rowIdx) => {
              return (
                <div className="board-row" key={rowIdx}>
                  {row.map((tile, colIdx) => {
                    const tileCNs = [
                      ...tilesCNs,
                      [tile.matches("hidden"), "hidden"],
                      [tile.matches("flagged"), "flagged"],
                      [tile.matches("revealed"), "revealed"],
                      [tile.hasMine, "hasMine"],
                      color[Math.min(tile.value, color.length - 1)],
                      [tile.value === 0, "empty"],
                      [tile.inspecting, "inspecting"],
                      [inspectedTiles.includes(tile.absIdx), "inspecting"],
                    ];

                    return (
                      <div
                        key={tile.absIdx}
                        {...bCN(tileCNs)}
                        style={{
                          width: tileSize + "px",
                          height: tileSize + "px",
                          margin: tileMargin + "px",
                          fontSize: tileMargin + "em",
                        }}
                        onContextMenu={tileContextMenu(tile)}
                      >
                        <div className="board-tile-content">
                          {tile.matches("revealed") &&
                            !tile.hasMine &&
                            !!tile.value &&
                            tile.value}
                          {tile.matches("flagged") && (
                            <FlagIcon className="red" />
                          )}
                          {tile.matches("revealed") && tile.hasMine && (
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
        {game.matches("ended") && <EndGame game={game} />}
      </div>
    </div>
  );
}

const color = ["grey", "blue", "green", "red", "dark-blue"];

// Build classNames
function bCN(...cNs) {
  if (cNs.length === 1 && Array.isArray(cNs[0])) cNs = cNs[0];
  const className = cNs
    .map((cn) => {
      if (Array.isArray(cn)) {
        const value = cn.pop();
        if (!cn.every((cond) => cond === true)) return false;
        return value;
      }
      return cn;
    })
    .filter((cn) => !!cn)
    .join(" ");
  return { className };
}

// function buildResult(game, config) {
//   return {
//     startTime: game.startDateTime,
//     endTime: game.endDateTime,
//     level: config.level,
//     gameTime: game.gameTime,
//     result: game.result,
//     name: config.name,
//   };
// }

function EndGame({ game }) {
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="endgame">
      <div className="endgame-modal">
        {game.matches("ended.won") && (
          <div className="endgame-result icon-text">
            <HappyIcon className="yellow" /> You won!
          </div>
        )}
        {game.matches("ended.lost") && (
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
