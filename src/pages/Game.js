import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Game.scss";
import useGame from "../lib/useGame";
import { isEligibleForAdjacentReveal } from "../lib/Minesweeper";
import useConfig from "../lib/useConfig";
import useResize from "../utils/useResize";
import {
  atom,
  useSetRecoilState,
  atomFamily,
  useRecoilValue,
  selector,
} from "recoil";

import {
  RiFlag2Fill as FlagIcon,
  RiFocus3Fill as MineIcon,
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";

import Header from "../components/Header";
import StatusBar from "../components/StatusBar";

const tileMargin = 1.5;

export default function Game() {
  const config = useConfig();

  const location = useLocation();
  const prevLocationKey = useRef(location.key);

  const [game, reset] = useGame(config.level);

  const boardRef = useRef();
  const [tileSize, setTileSize] = useState(0);

  useEffect(() => {
    if (prevLocationKey.current !== location.key) {
      prevLocationKey.current = location.key;
      reset();
    }
  }, [reset, prevLocationKey, location.key]);

  // const result = buildResult(game, config);
  // useEffect(() => {
  //   if (prevGameState.current !== game.state) {
  //     prevGameState.current = game.state;
  //     if (game.matches('ended')) {
  //       config.addResult(result);
  //     }
  //   }
  // }, [prevGameState, game.state, config, result]);

  // Observe board width changes and calculate `tileSize`
  function onBoardResize(boardEl) {
    // We have to check if board has children because they may not be
    // mounted yet
    if (boardEl.children[0]) {
      const colsCount = boardEl.children[0].children.length;
      const { width } = boardEl.getBoundingClientRect();
      const nextTileSize = width / colsCount - tileMargin * 2;
      setTileSize(nextTileSize);
    }
  }
  useResize(boardRef, onBoardResize);

  const updateScanState = useSetRecoilState(scanState);
  const setScannedTargets = useSetRecoilState(scanTargetsSelector);

  useEffect(() => {
    function activateDetection(ev) {
      ev.preventDefault();
      if (ev.button === 0) {
        updateScanState(1);
      } else if (ev.button === 1) {
        updateScanState(2);
      }

      if ([0, 1].includes(ev.button)) {
        // Make the first detection on mousedown because if not the users would
        // not see the detection working until they move the mouse, which is odd.
        detectScannedTile(ev);
      }
    }

    function deactivateDetection(e) {
      e.preventDefault();
      setScannedTargets([]);
      updateScanState(0);
    }

    function detectScannedTile(ev) {
      const bodyRect = document.body.getBoundingClientRect();
      const boardRect = boardRef.current.getBoundingClientRect();

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
        const currTileSize = tileSize + tileMargin * 2;
        const colIdx = Math.floor(mouseX / currTileSize);
        const rowIdx = Math.floor(mouseY / currTileSize);
        // console.log({ type: "SET_POSITION", rowIdx, colIdx }, 0);
        const tile = game.board[rowIdx][colIdx];
        const nextTargets = [tile.absIdx].concat(
          tile.adjacent.map((tl) => tl.absIdx)
        );
        setScannedTargets(nextTargets);
      }
    }

    window.addEventListener("mousedown", activateDetection);
    window.addEventListener("mouseup", deactivateDetection);
    return () => {
      window.removeEventListener("mousedown", activateDetection);
      window.removeEventListener("mouseup", deactivateDetection);
    };
  }, [game, boardRef, tileSize, updateScanState, setScannedTargets]);

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

  const tilesCNs = ["board-tile", [game.matches("ENDED"), "disabled"]];
  return (
    <div className="view">
      <div className="container">
        <Header />
        <StatusBar game={game} />

        <div
          ref={boardRef}
          {...bCN("board", [game.matches("ENDED"), "disabled"])}
          onMouseLeave={mouseLeaveHandler}
        >
          {game.board &&
            game.board.map((row, rowIdx) => {
              return (
                <div className="board-row" key={rowIdx}>
                  {row.map((tile) => (
                    <Tile
                      key={tile.absIdx}
                      tile={tile}
                      baseClassNames={tilesCNs}
                      size={tileSize}
                      reveal={reveal}
                      revealAdjacent={revealAdjacent}
                      flag={flag}
                      unflag={unflag}
                    />
                  ))}
                </div>
              );
            })}
        </div>
        {game.matches("ENDED") && <EndGame game={game} />}
      </div>
    </div>
  );
}

// function buildResult(game, config) {
//   return {
//     startTime: game.startDateTime,
//     endTime: game.endDateTime,
//     level: config.level,
//     gameTime: game.gameTime,
//     result: game.result,
//     name: config.name,
//   };
// }

/**
 * 0 = none
 * 1 = scanning one
 * 2 = scanning multi
 */
const scanState = atom({
  key: "scanState",
  default: 0,
});

/**
 * Array of absIdx including target tile and adjacent tiles, in case of scanning
 * multiple tiles.
 */
const scanTargets = atom({
  key: "scanTargets",
  default: [],
});

const scanTargetsSelector = selector({
  key: "scanTargetsSelector",
  set: ({ set, get }, newTargets) => {
    const currScanState = get(scanState);
    if (currScanState) {
      // When scanning only one assume the first item is the tile at the center
      // of the cluster
      if (currScanState === 1) newTargets = newTargets.slice(0, 1);

      const prevTargets = get(scanTargets);
      const [toTrue, toFalse] = getSetDiff(newTargets, prevTargets);

      set(scanTargets, newTargets);

      toTrue.forEach((absIdx) => {
        set(tileIsScanned(absIdx), true);
      });

      toFalse.forEach((absIdx) => {
        set(tileIsScanned(absIdx), false);
      });
    }
  },
});

function getSetDiff(arr1, arr2) {
  const acc1 = {};
  const acc2 = [];

  for (let item1 of arr1) {
    acc1[item1] = item1;
  }

  for (let item2 of arr2) {
    if (acc1.hasOwnProperty(item2)) {
      delete acc1[item2];
    } else {
      acc2.push(item2);
    }
  }
  return [Object.values(acc1), acc2];
}

const tileIsScanned = atomFamily({
  key: "tileIsScanned",
  default: false,
});

function Tile({
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
      if (tile.matches("HIDDEN")) reveal(tile.absIdx);
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
    if (tile.matches("FLAGGED")) {
      unflag(tile.absIdx);
    } else if (tile.matches("HIDDEN")) {
      flag(tile.absIdx);
    }
  }

  const tileCNs = [
    ...baseClassNames,
    [tile.matches("HIDDEN"), "hidden"],
    [tile.matches("FLAGGED"), "flagged"],
    [tile.matches("REVEALED"), "revealed"],
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
        {tile.matches("REVEALED") &&
          !tile.hasMine &&
          !!tile.value &&
          tile.value}
        {tile.matches("FLAGGED") && <FlagIcon className="red" />}
        {tile.matches("REVEALED") && tile.hasMine && <MineIcon />}
      </div>
    </div>
  );
}

const color = ["grey", "blue", "green", "red", "dark-blue"];

// Build classNames
function bCN(...cNs) {
  if (cNs.length === 1 && Array.isArray(cNs[0])) cNs = cNs[0];
  const className = cNs
    .map((cn) => {
      if (Array.isArray(cn)) {
        const value = cn.pop();
        if (cn.some((cond) => cond === false)) return false;
        return value;
      }
      return cn;
    })
    .filter((cn) => !!cn)
    .join(" ");
  return { className };
}

function EndGame({ game }) {
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="endgame">
      <div className="endgame-modal">
        {game.matches("ENDED") && game.result === "WON" && (
          <div className="endgame-result icon-text">
            <HappyIcon className="yellow" /> You won!
          </div>
        )}
        {game.matches("ENDED") && game.result === "LOST" && (
          <div className="endgame-result icon-text">
            <SadIcon className="red" /> You Lost!
          </div>
        )}
        <div className="endgame-actions">
          <Link ref={autofocus} className="button icon-text" to="/game">
            <ReloadIcon />
            Play again
          </Link>
          <Link to="/results" className="button icon-text">
            <MedalIcon />
            Results
          </Link>
        </div>
      </div>
    </div>
  );
}
