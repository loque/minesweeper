import { useState, useEffect } from "react";
import "./StatusBar.module.scss";
import {
  RiUser3Fill as UserIcon,
  RiFlag2Fill as FlagIcon,
  RiTimerFill as TimeIcon,
  RiFlashlightFill as LevelIcon,
} from "react-icons/ri";
import { useGameState, useFlagsCount } from "../lib/useGame";
import useConfig from "../lib/useConfig";
import { msToMS } from "../lib/utils";

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
    <span className="icon-text" title="Elapsed time">
      <TimeIcon className="yellow" /> {elapsedTime}
    </span>
  );
}

export default function StatusBar({ game }) {
  const config = useConfig();
  const [gameState] = useGameState(game);
  const flagsCount = useFlagsCount(game);

  return (
    <div className="status-bar">
      <span className="icon-button icon-text" title="Username">
        <UserIcon /> {config.username}
      </span>
      <span className="icon-text" title="Flag count">
        <FlagIcon className="red" /> {flagsCount}
      </span>
      <ElapsedTime
        startDateTime={game.startDateTime}
        run={gameState === "PLAYING"}
      />
      <span className="icon-button icon-text" title="Level">
        <LevelIcon /> {config.level}
      </span>
    </div>
  );
}
