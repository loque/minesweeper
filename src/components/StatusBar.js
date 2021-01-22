import { useState, useEffect } from "react";
import "./StatusBar.scss";
import useConfig from "../lib/useConfig";
import { msToMS } from "../lib/utils";
import {
  RiUser3Fill as UserIcon,
  RiFlag2Fill as FlagIcon,
  RiTimerFill as TimeIcon,
  RiFlashlightFill as DifficultyIcon,
} from "react-icons/ri";

function ElapsedTime({ startDateTime, run }) {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  useEffect(() => {
    let intervalId;
    if (run) {
      intervalId = setInterval(() => {
        setElapsedTime(msToMS(new Date() - startDateTime));
      }, 300);
    } else if (startDateTime === null) {
      setElapsedTime("00:00");
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startDateTime, run]);
  return (
    <span className="icon-text">
      <TimeIcon className="yellow" /> {elapsedTime}
    </span>
  );
}

export default function StatusBar({ game }) {
  const config = useConfig();
  const [gameState, setGameState] = useState();
  const [flagsCount, setFlagsCount] = useState(game.totalMines);

  useEffect(() => {
    const stateListener = (ev) => setGameState(ev.detail);
    game.addEventListener("stateChange", stateListener);
    return () => game.removeEventListener("stateChange", stateListener);
  }, [game]);

  useEffect(() => {
    const flagsCountListener = (ev) => setFlagsCount(ev.detail);
    game.addEventListener("flagsCountChange", flagsCountListener);
    return () =>
      game.removeEventListener("flagsCountChange", flagsCountListener);
  }, [game]);

  return (
    <div className="status-bar">
      <span className="icon-button icon-text">
        <UserIcon /> {config.name}
      </span>

      {gameState && (
        <div className="icon-text-group">
          <span className="icon-text p-right">
            <FlagIcon className="red" /> {flagsCount}
          </span>
          <ElapsedTime
            startDateTime={game.startDateTime}
            run={gameState === "PLAYING"}
          />
        </div>
      )}

      <span className="icon-button icon-text">
        <DifficultyIcon /> {config.level}
      </span>
    </div>
  );
}
