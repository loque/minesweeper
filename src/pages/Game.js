import { useEffect, useRef, useState, forwardRef } from "react";
import { useLocation } from "react-router-dom";
import "./Game.scss";
import useGame from "../lib/useGame";
import useConfig from "../lib/useConfig";
import EndGame from "../components/EndGame";
import { scanState, scanTargetsSelector } from "../game/states";
import { useSetRecoilState } from "recoil";

import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import Tile from "../components/Tile";

export const tileMargin = 1.5;

export default function Game() {
  const location = useLocation();
  const prevLocationKey = useRef(location.key);

  const config = useConfig();
  const [game, reset] = useGame(config.level);
  const [gameState, setGameState] = useState(game.state());
  const prevGameState = useRef();

  const boardRef = useRef();

  useEffect(() => {
    if (prevLocationKey.current !== location.key) {
      prevLocationKey.current = location.key;
      reset();
    }
  }, [reset, prevLocationKey, location.key]);

  useEffect(() => {
    setGameState((currGameState) => {
      if (currGameState !== game.state()) {
        return game.state();
      }
      return currGameState;
    });
  }, [game]);

  useEffect(() => {
    const listener = (ev) => setGameState(ev.detail);
    game.addEventListener("stateChange", listener);
    return () => game.removeEventListener("stateChange", listener);
  }, [game]);

  useEffect(() => {
    if (prevGameState.current !== gameState) {
      prevGameState.current = gameState;
      if (gameState === "ENDED") {
        config.addResult(buildResult(game, config));
      }
    }
  }, [prevGameState, game, config, gameState]);

  const updateScanState = useSetRecoilState(scanState);
  const setScannedTargets = useSetRecoilState(scanTargetsSelector);

  useEffect(() => {
    if (["IDLE", "ENDED"].includes(gameState)) return;

    function startScan(ev) {
      ev.preventDefault();
      if (ev.button === 0) {
        updateScanState(1);
      } else if (ev.button === 1) {
        updateScanState(2);
      }

      if ([0, 1].includes(ev.button)) {
        // Make the first detection on mousedown because if not the users would
        // not see the detection working until they move the mouse, which is odd.
        detectScannedTile(ev);
      }
    }

    function endScan(e) {
      e.preventDefault();
      setScannedTargets([]);
      updateScanState(0);
    }

    function detectScannedTile(ev) {
      const bodyRect = document.body.getBoundingClientRect();
      const boardRect = boardRef.current.getBoundingClientRect();
      const tilesInRow = boardRef.current.children[0].children.length;

      const absLeft = boardRect.left - bodyRect.left;
      const absTop = boardRect.top - bodyRect.top;

      // Calculate the mouse position relative to the board
      const mouseX = ev.pageX - absLeft;
      const mouseY = ev.pageY - absTop;

      if (
        mouseX >= 0 &&
        mouseX < boardRect.width &&
        mouseY >= 0 &&
        mouseY < boardRect.height
      ) {
        const tileSpace = boardRect.width / tilesInRow;
        const colIdx = Math.floor(mouseX / tileSpace);
        const rowIdx = Math.floor(mouseY / tileSpace);
        const tile = game.board[rowIdx][colIdx];
        const nextTargets = [tile.absIdx].concat(
          tile.adjacent.map((tl) => tl.absIdx)
        );
        setScannedTargets(nextTargets);
      }
    }

    window.addEventListener("mousedown", startScan);
    window.addEventListener("mouseup", endScan);
    return () => {
      window.removeEventListener("mousedown", startScan);
      window.removeEventListener("mouseup", endScan);
    };
  }, [gameState, game, boardRef, updateScanState, setScannedTargets]);

  return (
    <div className="view">
      <div className="container board-container">
        <Header />
        <StatusBar game={game} />
        <Board ref={boardRef} game={game} gameState={gameState} />
        {gameState === "ENDED" && <EndGame game={game} />}
      </div>
    </div>
  );
}

const Board = forwardRef(function Board({ game, gameState }, ref) {
  const setScannedTargets = useSetRecoilState(scanTargetsSelector);
  const tilesInRow = game.board[0].length;

  function mouseLeaveHandler() {
    setScannedTargets([]);
  }

  function reveal(absIdx) {
    game.reveal(absIdx);
  }

  function revealAdjacent(absIdx) {
    game.revealAdjacent(absIdx);
  }

  function flag(absIdx) {
    game.flag(absIdx);
  }

  function unflag(absIdx) {
    game.unflag(absIdx);
  }
  const tilesCNs = ["board-tile", [gameState === "ENDED", "disabled"]];
  return (
    <div ref={ref} className="board" onMouseLeave={mouseLeaveHandler}>
      {game.board.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="board-row"
          onContextMenu={(ev) => ev.preventDefault()}
        >
          {row.map((tile) => (
            <Tile
              key={tile.key}
              tile={tile}
              baseClassNames={tilesCNs}
              reveal={reveal}
              revealAdjacent={revealAdjacent}
              flag={flag}
              unflag={unflag}
              tilesInRow={tilesInRow}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

function buildResult(game, config) {
  return {
    endDateTime: game.endDateTime.toJSON(),
    level: config.level,
    gameTime: game.gameTime,
    result: game.result(),
    name: config.name,
  };
}
