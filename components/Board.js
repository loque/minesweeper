import { forwardRef } from "react";
import { useSetRecoilState } from "recoil";
import { scanTargetsSelector } from "../game/states";
import { useGameState } from "../lib/useGame";
import Tile from "./Tile";
import styled from "styled-components";

export default forwardRef(function Board({ game }, ref) {
  const [gameState] = useGameState(game);

  const tilesInRow = game.board[0].length;

  const setScannedTargets = useSetRecoilState(scanTargetsSelector);
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

  return (
    <BoardWrapper ref={ref} onMouseLeave={mouseLeaveHandler}>
      {game.board.map((row, rowIdx) => (
        <BoardRow key={rowIdx} onContextMenu={(ev) => ev.preventDefault()}>
          {row.map((tile) => (
            <Tile
              key={tile.key}
              tile={tile}
              reveal={reveal}
              revealAdjacent={revealAdjacent}
              flag={flag}
              unflag={unflag}
              gameState={gameState}
              tilesInRow={tilesInRow}
            />
          ))}
        </BoardRow>
      ))}
    </BoardWrapper>
  );
});

const BoardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const BoardRow = styled.div`
  display: flex;
  flex-direction: row;
`;
