import { useEffect, useRef } from "react";
import { useSetRecoilState, useRecoilState } from "recoil";
import { scanState, scanTargetsSelector, gameSelector } from "../game/states";

import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import EndGame from "../components/EndGame";
import Board from "../components/Board";

import { View, Container } from "../ui/layout";

export const tileMargin = 1.5;

export default function Game() {
  const boardRef = useRef();
  const [game, resetGame] = useRecoilState(gameSelector);

  if (!game) resetGame();

  const updateScanState = useSetRecoilState(scanState);
  const setScannedTargets = useSetRecoilState(scanTargetsSelector);

  useEffect(() => {
    if (!game || ["IDLE", "ENDED"].includes(game.state())) return;

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

    function endScan(ev) {
      ev.preventDefault();
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
  }, [game, boardRef, updateScanState, setScannedTargets]);

  if (!game) return null;
  return (
    <View>
      <Container>
        <Header setupBtn />
        <StatusBar key={"statusbar:" + game.key} game={game} />
        <Board ref={boardRef} game={game} />
        <EndGame key={"endgame:" + game.key} />
      </Container>
    </View>
  );
}
