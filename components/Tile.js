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

  return (
    <StyledTile
      style={{
        width: `calc(${100 / tilesInRow}% - ${tileMargin * 2}px)`,
        margin: tileMargin + "px",
        fontSize: tileMargin + "em",
      }}
      onMouseUp={mouseUpHandler}
      onMouseEnter={mouseEnterHandler}
      onContextMenu={contextMenuHandler}
      disabled={gameState === "ENDED"}
      hidden={tileState === "HIDDEN"}
      flagged={tileState === "FLAGGED"}
      revealed={tileState === "REVEALED"}
      hasMine={tile.hasMine}
      scanned={isBeingScanned}
      isCauseOfDefeat={tile.isCauseOfDefeat}
      value={tile.value}
    >
      <img
        src={"/tile.png"}
        alt="Tile"
        style={{ width: "100%", display: "block" }}
      />
      <TileContent>
        {tileState === "REVEALED" &&
          !tile.hasMine &&
          !!tile.value &&
          tile.value}
        {tileState === "FLAGGED" && <FlagIcon className="red" />}
        {tileState === "REVEALED" && tile.hasMine && <MineIcon />}
      </TileContent>
    </StyledTile>
  );
}

const color = ["grey", "blue", "green", "#a40000", "rgb(2, 2, 119)"];

const StyledTile = styled.div`
  background-color: #373737;
  border-radius: 4px;
  position: relative;
  transition: transform 100ms ease-in-out;
  display: block;

  ${(props) => props.hidden && !props.disabled && hiddenStyle}
  ${(props) => props.flagged && !props.disabled && flaggedStyle}
  ${(props) => props.revealed && revealedStyle}

  color: ${(props) => color[Math.min(props.value, color.length - 1)]};
`;

const hiddenStyle = css`
  cursor: pointer;
  ${(props) => props.scanned && scannedStyle}
`;

const flaggedStyle = css`
  cursor: pointer;
  ${(props) => props.scanned && scannedStyle}
`;

const scannedStyle = css`
  background-color: #4d4d4d;
  transform: scale(0.94);
`;

const revealedStyle = css`
  background-color: #8c8b8b;
  ${(props) => props.hasMine && hasMineStyle}
`;

const hasMineStyle = css`
  color: black;
  background-color: #707070;
  ${(props) => props.isCauseOfDefeat && isCauseOfDefeatStyle}
`;
const isCauseOfDefeatStyle = css`
  background-color: #d04a4a;
`;

const TileContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
