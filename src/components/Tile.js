import { isEligibleForAdjacentReveal } from "../game/Minesweeper";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
} from "react-icons/ri";
import { tileMargin } from "../pages/Game";
import { scanTargetsSelector, tileIsScanned } from "../game/states";
import { bCN } from "../lib/utils";

export default function Tile({
  tile,
  baseClassNames,
  size,
  reveal,
  revealAdjacent,
  flag,
  unflag,
}) {
  const setScannedTargets = useSetRecoilState(scanTargetsSelector);
  const isBeingScanned = useRecoilValue(tileIsScanned(tile.absIdx));

  function mouseUpHandler(ev) {
    if (ev.button === 0) {
      if (tile.state("HIDDEN")) reveal(tile.absIdx);
    } else if (ev.button === 1) {
      if (isEligibleForAdjacentReveal(tile)) revealAdjacent(tile.absIdx);
    }
  }

  function mouseEnterHandler(ev) {
    const nextTargets = [tile.absIdx].concat(
      tile.adjacent.map((tl) => tl.absIdx)
    );
    setScannedTargets(nextTargets);
  }

  function contextMenuHandler(ev) {
    ev.preventDefault();
    if (tile.state("FLAGGED")) {
      unflag(tile.absIdx);
    } else if (tile.state("HIDDEN")) {
      flag(tile.absIdx);
    }
  }

  const tileCNs = [
    ...baseClassNames,
    [tile.state("HIDDEN"), "hidden"],
    [tile.state("FLAGGED"), "flagged"],
    [tile.state("REVEALED"), "revealed"],
    [tile.hasMine, "hasMine"],
    color[Math.min(tile.value, color.length - 1)],
    [tile.value === 0, "empty"],
    [isBeingScanned, "inspecting"],
  ];
  return (
    <div
      key={tile.absIdx}
      {...bCN(tileCNs)}
      style={{
        width: size + "px",
        height: size + "px",
        margin: tileMargin + "px",
        fontSize: tileMargin + "em",
      }}
      onMouseUp={mouseUpHandler}
      onMouseEnter={mouseEnterHandler}
      onContextMenu={contextMenuHandler}
    >
      <div className="board-tile-content">
        {tile.state("REVEALED") && !tile.hasMine && !!tile.value && tile.value}
        {tile.state("FLAGGED") && <FlagIcon className="red" />}
        {tile.state("REVEALED") && tile.hasMine && <MineIcon />}
      </div>
    </div>
  );
}

const color = ["grey", "blue", "green", "red", "dark-blue"];
