import { useMachine } from "@xstate/react";
import { useEffect, useCallback } from "react";
import { Machine, assign } from "xstate";

export function useInspection(
  boardRef,
  tileSize,
  tileMargin,
  onInspectOneEnd,
  onInspectMultiEnd
) {
  // const [state, dispatch] = useReducer(
  //   inspectionReducer,
  //   inspectionInitialState
  // );

  const [state, send] = useMachine(inspectMachine, {
    devTools: true,
    actions: { onInspectOneEnd, onInspectMultiEnd },
  });

  // const prevState = useRef({ ...state });

  // Calculate the corresponding `rowIdx` and `colIdx` of the tile under
  // the mouse.
  const makeDetector = useCallback(
    (boardRef, tileSize) => {
      return (ev) => {
        const bodyRect = document.body.getBoundingClientRect();
        const boardRect = boardRef.getBoundingClientRect();
        const absX = boardRect.left - bodyRect.left;
        const absY = boardRect.top - bodyRect.top;
        // Calculate the mouse position relative to the board
        const mouseX = ev.pageX - absX;
        const mouseY = ev.pageY - absY;

        if (mouseX < 0 || mouseY < 0) {
          // dispatch({ type: "SET_TILE_UNDER_MOUSE", tilePos: null });
          send({ type: "SET_POSITION", rowIdx: null, colIdx: null });
        } else {
          const currTileSize = tileSize + tileMargin * 2;
          const colIdx = Math.floor(mouseX / currTileSize);
          const rowIdx = Math.floor(mouseY / currTileSize);
          // dispatch({
          //   type: "SET_TILE_UNDER_MOUSE",
          //   tilePos: { rowIdx, colIdx },
          // });
          send({ type: "SET_POSITION", rowIdx, colIdx });
        }
      };
    },
    [tileMargin, send]
  );

  // Activate (mousedown) / deactivate (mouseup) underlying tile detection.
  // Will work even if mouseup is fired outside the board.
  useEffect(() => {
    const detectUnderlyingTile = makeDetector(boardRef.current, tileSize);

    function activateDetection(e) {
      e.preventDefault();
      if (e.button === 0) {
        // dispatch({ type: "INSPECT_ONE_START" });
        send({ type: "INSPECT_ONE_START" });
      } else if (e.button === 1) {
        // dispatch({ type: "INSPECT_MULTI_START" });
        send({ type: "INSPECT_MULTI_START" });
      }

      if ([0, 1].includes(e.button)) {
        // Make the first detection on mousedown because if not the users would
        // not see the detection working until they move the mouse, which is odd.
        detectUnderlyingTile(e);
      }
    }

    function deactivateDetection(e) {
      e.preventDefault();
      if (e.button === 0) {
        // dispatch({ type: "INSPECT_ONE_END" });
        send({ type: "INSPECT_ONE_END" });
      } else if (e.button === 1) {
        // dispatch({ type: "INSPECT_MULTI_END" });
        send({ type: "INSPECT_MULTI_END" });
      }
    }

    window.addEventListener("mousedown", activateDetection);
    window.addEventListener("mouseup", deactivateDetection);
    return () => {
      window.removeEventListener("mousedown", activateDetection);
      window.removeEventListener("mouseup", deactivateDetection);
    };
  }, [boardRef, tileSize, makeDetector, send]);

  // Detect underlying tile on mousemove only when underlying detection
  // is active. See previous `useEffect`.
  useEffect(() => {
    const shouldObserve = boardRef.current && tileSize;
    const detectUnderlyingTile = makeDetector(boardRef.current, tileSize);

    shouldObserve && window.addEventListener("mousemove", detectUnderlyingTile);
    return () => {
      shouldObserve &&
        window.removeEventListener("mousemove", detectUnderlyingTile);
    };
  }, [boardRef, tileSize, makeDetector]);

  return { matches: state.matches, context: state.context };
}

// function tilePos(state) {
//   if (state.tilePos === null) return null;
//   return state.tilePos.rowIdx + ":" + state.tilePos.colIdx;
// }

const inspectMachine = Machine(
  {
    id: "inspect",
    context: {
      rowIdx: null,
      colIdx: null,
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          INSPECT_ONE_START: {
            target: "inspectingOne",
            actions: ["setPosition"],
          },
          INSPECT_MULTI_START: {
            target: "inspectingMulti",
            actions: ["setPosition"],
          },
        },
      },
      inspectingOne: {
        on: {
          INSPECT_ONE_END: {
            target: "idle",
            actions: ["onInspectOneEnd"],
          },
          SET_POSITION: {
            internal: true,
            actions: ["setPosition"],
          },
        },
      },
      inspectingMulti: {
        on: {
          INSPECT_MULTI_END: {
            target: "idle",
            actions: ["onInspectMultiEnd"],
          },
          SET_POSITION: {
            internal: true,
            actions: ["setPosition"],
          },
        },
      },
    },
  },
  {
    actions: {
      setPosition: assign({
        rowIdx: (ctx, ev) => ev.rowIdx,
        colIdx: (ctx, ev) => ev.colIdx,
      }),
      resetPosition: assign({
        rowIdx: null,
        colIdx: null,
      }),
    },
  }
);

// const inspectionInitialState = {
//   value: "idle", // idle|inspectingOne|inspectingMulti
//   tilePos: null,
// };

// function inspectionReducer(state, action) {
//   switch (state.value) {
//     case "idle":
//       switch (action.type) {
//         case "INSPECT_ONE_START":
//           return { ...state, value: "inspectingOne" };
//         case "INSPECT_MULTI_START":
//           return { ...state, value: "inspectingMulti" };

//         default:
//           break;
//       }
//       break;

//     case "inspectingOne":
//       switch (action.type) {
//         case "INSPECT_ONE_END":
//           return { ...inspectionInitialState };
//         case "SET_TILE_UNDER_MOUSE":
//           return { ...state, tilePos: action.tilePos };
//         default:
//           break;
//       }
//       break;
//     case "inspectingMulti":
//       switch (action.type) {
//         case "INSPECT_MULTI_END":
//           return { ...inspectionInitialState };
//         case "SET_TILE_UNDER_MOUSE":
//           return { ...state, tilePos: action.tilePos };
//         default:
//           break;
//       }
//       break;
//     default:
//       break;
//   }
// }
