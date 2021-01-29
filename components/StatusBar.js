import { useState, useEffect } from "react";
import {
  RiUser3Fill as UserIcon,
  RiFlag2Fill,
  RiTimerFill,
  RiFlashlightFill as LevelIcon,
} from "react-icons/ri";
import styled from "styled-components";
import { useGameState, useFlagsCount } from "../lib/useGame";
import useConfig from "../lib/useConfig";
import { msToMS } from "../lib/utils";
import { Row } from "../ui/flex";

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
    <Pill title="Elapsed time" ghost>
      <TimeIcon /> {elapsedTime}
    </Pill>
  );
}

const StyledStatusBar = styled(Row)`
  height: 4rem;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${(p) => p.theme.color.bg};
`;

const Pill = styled(Row)`
  background-color: ${(props) =>
    props.ghost ? "transparent" : "rgba(255,255,255,0.05)"};
  color: rgba(255, 255, 255, 0.4);
  padding: 0.3rem 0.7rem;
  border-radius: 5px;
  font-size: 0.9rem;
  gap: 0.5em;
`;

const FlagIcon = styled(RiFlag2Fill)`
  color: ${(p) => p.theme.color.red};
`;
const TimeIcon = styled(RiTimerFill)`
  color: ${(p) => p.theme.color.yellow};
`;

export default function StatusBar({ game }) {
  const config = useConfig();
  const [gameState] = useGameState(game);
  const flagsCount = useFlagsCount(game);

  return (
    <StyledStatusBar justify="between">
      <Pill title="Username">
        <UserIcon /> {config.username}
      </Pill>
      <Pill title="Flag count" ghost>
        <FlagIcon /> {flagsCount}
      </Pill>
      <ElapsedTime
        startDateTime={game.startDateTime}
        run={gameState === "PLAYING"}
      />
      <Pill title="Level">
        <LevelIcon /> {config.level}
      </Pill>
    </StyledStatusBar>
  );
}
