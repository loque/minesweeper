import { useState, useEffect } from "react";
import {
  RiUser3Fill as UserIcon,
  RiFlag2Fill as FlagIcon,
  RiTimerFill as TimeIcon,
  RiFlashlightFill as LevelIcon,
} from "react-icons/ri";
import { useGameState, useFlagsCount } from "../lib/useGame";
import useConfig from "../lib/useConfig";
import { msToMS } from "../lib/utils";
import styled from "styled-components";

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
    <Pill className="icon-text" title="Elapsed time">
      <TimeIcon className="yellow" /> {elapsedTime}
    </Pill>
  );
}

const StyledStatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: #292425;
`;

const Pill = styled.div`
  background-color: #ffffff0d;
  color: rgba(255, 255, 255, 0.4);
  padding: 0.2rem 1rem 0.2rem 0.5rem !important;
  border-radius: 5px;
  font-size: 0.9rem;
`;

export default function StatusBar({ game }) {
  const config = useConfig();
  const [gameState] = useGameState(game);
  const flagsCount = useFlagsCount(game);

  return (
    <StyledStatusBar>
      <Pill className="icon-text" title="Username">
        <UserIcon /> {config.username}
      </Pill>
      <Pill className="icon-text" title="Flag count">
        <FlagIcon className="red" /> {flagsCount}
      </Pill>
      <ElapsedTime
        startDateTime={game.startDateTime}
        run={gameState === "PLAYING"}
      />
      <Pill className="icon-text" title="Level">
        <LevelIcon /> {config.level}
      </Pill>
    </StyledStatusBar>
  );
}
