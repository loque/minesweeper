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
  const [state, send] = useMachine(inspectMachine, {
    actions: { onInspectOneEnd, onInspectMultiEnd },
  });

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
          send({ type: "SET_POSITION", rowIdx: null, colIdx: null });
        } else {
          const currTileSize = tileSize + tileMargin * 2;
          const colIdx = Math.floor(mouseX / currTileSize);
          const rowIdx = Math.floor(mouseY / currTileSize);
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
        send({ type: "INSPECT_ONE_START" });
      } else if (e.button === 1) {
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
        send({ type: "INSPECT_ONE_END" });
      } else if (e.button === 1) {
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
        rowIdx: (_, ev) => ev.rowIdx,
        colIdx: (_, ev) => ev.colIdx,
      }),
      resetPosition: assign({
        rowIdx: null,
        colIdx: null,
      }),
    },
  }
);
