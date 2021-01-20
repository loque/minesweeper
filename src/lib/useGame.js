import { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import Game from "./Minesweeper";

export const configs = [{ rows: 10, cols: 10, mines: 11 }];

export function useGame(level) {
  const config = configs[level] || configs[configs.length - 1];
  const game = useRef(new Game(config));

  useEffect(() => {
    if (
      state.matches("idle") ||
      state.matches("ready") ||
      state.matches("playing.idle") ||
      state.matches("ended")
    ) {
      const meta = {
        placedFlags: state.context.board.list.filter((tile) =>
          tile.matches("flagged")
        ).length,
        startDateTime: state.context.startDateTime,
        // endDateTime: state.context.endDateTime,
        // gameTime: state.context.endDateTime
        //   ? state.context.endDateTime - state.context.startDateTime
        //   : null,
      };

      const actions = {
        flagTile(absIdx) {
          send("FLAG", { absIdx });
        },
        unflagTile(absIdx) {
          send("UNFLAG", { absIdx });
        },

        revealTile(absIdx) {
          send("REVEAL", { absIdx });
        },

        revealAdjacentTiles(absIdx) {
          send("REVEAL_ADJACENT", { absIdx });
        },
      };
      console.log("setting output");
      setOutput({
        matches: state.matches,
        board: state.context.board.matrix,
        meta,
        actions,
      });
    }
  }, [state, send]);

  // TODO: we need to update the state **only** after the actions, specially
  // recursive, ended. If not we are going to have serious performance issues.
  // Only show updates on idle, ready, playing.idle, ended

  return output;
}
