import { isEligibleForAdjacentReveal } from "../game/Minesweeper";
import { scanTargetsSelector, tileIsScanned } from "../game/states";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
} from "react-icons/ri";
import "./Tile.scss";
import tileImg from "./tile.png";
import { bCN } from "../lib/utils";
import { tileMargin } from "../pages/Game";
import { useTileState } from "../lib/useGame";

export default function Tile({
  tile,
  reveal,
  revealAdjacent,
  flag,
  unflag,
  gameState,
  tilesInRow,
}) {
  const tileState = useTileState(tile);
  const isBeingScanned = useRecoilValue(tileIsScanned(tile.absIdx));

  function mouseUpHandler(ev) {
    if (ev.button === 0) {
      if (tileState === "HIDDEN") {
        reveal(tile.absIdx);
      }
    } else if (ev.button === 1) {
      if (isEligibleForAdjacentReveal(tile)) {
        revealAdjacent(tile.absIdx);
      }
    }
  }

  const setScannedTargets = useSetRecoilState(scanTargetsSelector);
  function mouseEnterHandler(ev) {
    const nextTargets = [tile.absIdx].concat(
      tile.adjacent.map((tl) => tl.absIdx)
    );
    setScannedTargets(nextTargets);
  }

  function contextMenuHandler(ev) {
    ev.preventDefault();
    if (tileState === "FLAGGED") {
      unflag(tile.absIdx);
    } else if (tileState === "HIDDEN") {
      flag(tile.absIdx);
    }
  }

  const tileCNs = [
    "tile",
    [gameState === "ENDED", "disabled"],
    [tileState === "HIDDEN", "hidden"],
    [tileState === "FLAGGED", "flagged"],
    [tileState === "REVEALED", "revealed"],
    [tile.hasMine, "hasMine"],
    color[Math.min(tile.value, color.length - 1)],
    [tile.value === 0, "empty"],
    [isBeingScanned, "scanned"],
    [tile.causeOfDefeat, "causeOfDefeat"],
  ];

  return (
    <div
      {...bCN(tileCNs)}
      style={{
        width: `calc(${100 / tilesInRow}% - ${tileMargin * 2}px)`,
        margin: tileMargin + "px",
        fontSize: tileMargin + "em",
      }}
      onMouseUp={mouseUpHandler}
      onMouseEnter={mouseEnterHandler}
      onContextMenu={contextMenuHandler}
    >
      <img
        src={tileImg}
        alt="Tile"
        style={{ width: "100%", display: "block" }}
      />
      <div className="board-tile-content">
        {tileState === "REVEALED" &&
          !tile.hasMine &&
          !!tile.value &&
          tile.value}
        {tileState === "FLAGGED" && <FlagIcon className="red" />}
        {tileState === "REVEALED" && tile.hasMine && <MineIcon />}
      </div>
    </div>
  );
}

const color = ["grey", "blue", "green", "red", "dark-blue"];
