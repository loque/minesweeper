import { useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { scanState, scanTargetsSelector } from "../game/states";
import useGame, { useGameState } from "../lib/useGame";
import useConfig from "../lib/useConfig";

import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import EndGame from "../components/EndGame";
import Board from "../components/Board";

import { View, Container } from "../ui/layout";

export const tileMargin = 1.5;

export default function Game() {
  const config = useConfig();
  const boardRef = useRef();
  const [game, reset] = useGame(config.level);
  const [gameState, setGameState] = useGameState(game);
  const prevGameState = useRef();

  // If game changes (on reset) the subscription from `useGameState` is not
  // called so we need to manually check if the state has changed.
  useEffect(() => {
    setGameState((currGameState) => {
      if (currGameState !== game.state()) {
        return game.state();
      }
      return currGameState;
    });
  }, [game, setGameState]);

  // When game ends, store the result
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
        // not see the detection working until they move the mouse, which is odd
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
    <View>
      <Container>
        <Header setupBtn />
        <StatusBar key={"statusbar:" + game.key} game={game} />
        <Board ref={boardRef} game={game} />
        {gameState === "ENDED" && <EndGame game={game} reset={reset} />}
      </Container>
    </View>
  );
}

function buildResult(game, config) {
  return {
    endDateTime: game.endDateTime.toJSON(),
    level: config.level,
    gameTime: game.gameTime,
    result: game.result(),
    username: config.username,
  };
}
