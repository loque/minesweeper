import { isEligibleForAdjacentReveal } from "../game/Minesweeper";
import { scanTargetsSelector, tileIsScanned } from "../game/states";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
} from "react-icons/ri";
import { tileMargin } from "../pages/game";
import { useTileState } from "../lib/useGame";
import styled, { css } from "styled-components";

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

  const hiddenStyle = tileState === "HIDDEN";
  const flaggedStyle = tileState === "FLAGGED";
  const pointerStyle = hiddenStyle || flaggedStyle ? { cursor: "pointer" } : {};
  const scannedStyle =
    pointerStyle.cursor && isBeingScanned
      ? { backgroundColor: "#4d4d4d", transform: "scale(0.94)" }
      : {};
  const revealedStyle =
    tileState === "REVEALED" ? { backgroundColor: "#8c8b8b" } : {};
  const hasMineStyle =
    revealedStyle.backgroundColor && tile.hasMine
      ? { color: "black", backgroundColor: "#707070" }
      : {};
  const isCauseOfDefeatStyle =
    hasMineStyle.color && tile.isCauseOfDefeat
      ? { backgroundColor: "#d04a4a" }
      : {};

  return (
    <div
      style={{
        position: "relative",
        display: "block",
        borderRadius: "4px",
        transition: "transform 100ms ease-in-out",
        backgroundColor: "#373737",
        width: `calc(${100 / tilesInRow}% - ${tileMargin * 2}px)`,
        margin: tileMargin + "px",
        fontSize: tileMargin + "em",
        color: color[Math.min(tile.value, color.length - 1)],
        ...pointerStyle,
        ...scannedStyle,
        ...revealedStyle,
        ...hasMineStyle,
        ...isCauseOfDefeatStyle,
      }}
      onMouseUp={mouseUpHandler}
      onMouseEnter={mouseEnterHandler}
      onContextMenu={contextMenuHandler}
    >
      <img
        src={"/tile.png"}
        alt="Tile"
        style={{ width: "100%", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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

const color = ["grey", "blue", "green", "#a40000", "rgb(2, 2, 119)"];
