import { forwardRef } from "react";
import { useSetRecoilState } from "recoil";
import { scanTargetsSelector } from "../game/states";
import Tile from "./Tile";

export default forwardRef(function Board({ game }, ref) {
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
    <div
      ref={ref}
      onMouseLeave={mouseLeaveHandler}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {game.board.map((row, rowIdx) => (
        <div
          key={rowIdx}
          onContextMenu={(ev) => ev.preventDefault()}
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {row.map((tile) => (
            <Tile
              key={tile.key}
              tile={tile}
              flag={flag}
              unflag={unflag}
              reveal={reveal}
              revealAdjacent={revealAdjacent}
              tilesInRow={tilesInRow}
            />
          ))}
        </div>
      ))}
    </div>
  );
});
