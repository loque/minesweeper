import { useEffect, useState } from "react";
import { isEligibleForAdjacentReveal } from "../game/Minesweeper";
import {
  scanTargetsSelector,
  tileIsScanned,
  tileSizeAtom,
} from "../game/states";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
} from "react-icons/ri";
import { tileMargin } from "../pages/Game";
import { bCN } from "../lib/utils";
import "../pages/Game.scss";

/**
 * Changes that Tile should be notified of:
 *    state
 *        hidden => flagged
 *        flagged => hidden
 *        hidden => revealed
 *    value
 *        0 => n
 *    hasMine
 *        false => true
 *
 */
export default function Tile({
  tile,
  baseClassNames,
  reveal,
  revealAdjacent,
  flag,
  unflag,
}) {
  const [tileState, setTileState] = useState(tile.state);

  useEffect(() => {
    const listener = (ev) => {
      setTileState(ev.detail);
    };
    tile.addEventListener("stateChange", listener);
    return () => tile.removeEventListener("stateChange", listener);
  }, [tile]);

  const setScannedTargets = useSetRecoilState(scanTargetsSelector);
  const isBeingScanned = useRecoilValue(tileIsScanned(tile.absIdx));
  const size = useRecoilValue(tileSizeAtom);

  function mouseUpHandler(ev) {
    if (ev.button === 0) {
      if (tileState === "HIDDEN") reveal(tile.absIdx);
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
    if (tileState === "FLAGGED") {
      unflag(tile.absIdx);
    } else if (tileState === "HIDDEN") {
      flag(tile.absIdx);
    }
  }

  const tileCNs = [
    ...baseClassNames,
    [tileState === "HIDDEN", "hidden"],
    [tileState === "FLAGGED", "flagged"],
    [tileState === "REVEALED", "revealed"],
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
