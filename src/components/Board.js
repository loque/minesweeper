import { forwardRef } from "react";
import { useSetRecoilState } from "recoil";
import { scanTargetsSelector } from "../game/states";
import "./Board.scss";
import Tile from "./Tile";

export default forwardRef(function Board({ game, gameState }, ref) {
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
  const tilesCNs = ["tile", [gameState === "ENDED", "disabled"]];
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
