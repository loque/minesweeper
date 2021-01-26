import { forwardRef } from "react";
import { useSetRecoilState } from "recoil";
import styles from "./Board.module.scss";
import { scanTargetsSelector } from "../game/states";
import { useGameState } from "../lib/useGame";
import Tile from "./Tile";

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
    <div ref={ref} className={styles.board} onMouseLeave={mouseLeaveHandler}>
      {game.board.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={styles.boardRow}
          onContextMenu={(ev) => ev.preventDefault()}
        >
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
        </div>
      ))}
    </div>
  );
});
