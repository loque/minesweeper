import { useState, useEffect } from "react";
import "./StatusBar.scss";
import useConfig from "../lib/useConfig";
import { msToMS } from "../lib/time";
import {
  RiUser3Fill as UserIcon,
  RiFlag2Fill as FlagIcon,
  RiTimerFill as TimeIcon,
  RiFlashlightFill as DifficultyIcon,
} from "react-icons/ri";

function ElapsedTime({ startTime, run }) {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  useEffect(() => {
    let intervalId;
    if (run) {
      intervalId = setInterval(() => {
        setElapsedTime(msToMS(new Date() - startTime));
      }, 300);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, run]);
  return (
    <span className="icon-text">
      <TimeIcon className="yellow" /> {elapsedTime}
    </span>
  );
}

export default function StatusBar({ game }) {
  const config = useConfig();
  return (
    <div className="status-bar">
      <span className="icon-button icon-text">
        <UserIcon /> {config.name}
      </span>

      {game.matches && (
        <div className="icon-text-group">
          <span className="icon-text p-right">
            <FlagIcon className="red" /> {game.placedFlags}
          </span>
          <ElapsedTime
            startTime={game.startDateTime}
            run={game.matches("PLAYING")}
          />
        </div>
      )}

      <span className="icon-button icon-text">
        <DifficultyIcon /> {config.level}
      </span>
    </div>
  );
}
