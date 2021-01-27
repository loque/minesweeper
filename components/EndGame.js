import { useRef, useEffect } from "react";
import {
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";
import { useGameState, useGameResult } from "../lib/useGame";
import { Button, Link } from "../ui/button";
import styled from "styled-components";

export default function EndGame({ game, reset }) {
  const autofocus = useRef();
  const [gameState] = useGameState(game);
  const gameResult = useGameResult(game);

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <EndGameWrapper>
      {gameState === "ENDED" && gameResult === "WON" && (
        <EndGameResult className="icon-text">
          <HappyIcon className="yellow" /> You won!
        </EndGameResult>
      )}
      {gameState === "ENDED" && gameResult === "LOST" && (
        <EndGameResult className="icon-text">
          <SadIcon className="red" /> You Lost!
        </EndGameResult>
      )}
      <Button ref={autofocus} className="icon-text" onClick={reset}>
        <ReloadIcon />
        Play
      </Button>
      <Link href="/results" className="icon-text">
        <MedalIcon />
        Results
      </Link>
    </EndGameWrapper>
  );
}

const EndGameWrapper = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: row;
  margin-top: 6px;
  padding: 2rem 0;
  width: 100%;
  background-color: #292425;
  gap: 1rem;
  &:after {
    content: "";
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
    background-image: linear-gradient(transparent, #29242563);
  }
`;

const EndGameResult = styled.div`
  display: flex;
  justify-content: center;
  font-size: 1.5rem;
  white-space: nowrap;
  flex: 1;
  svg {
    font-size: 2em;
  }
`;
