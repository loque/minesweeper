import { useRef, useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";
import {
  gameSelector,
  resultsSelector,
  useGameState,
  useGameResult,
  configSelector,
} from "../game/states";
import { Button } from "../ui/form";
import styled from "styled-components";

export default function EndGame() {
  const autofocus = useRef();
  const [game, resetGame] = useRecoilState(gameSelector);
  const { username, level } = useRecoilValue(configSelector);
  const addResult = useSetRecoilState(resultsSelector);
  const gameState = useGameState();
  const prevGameState = useRef();
  const gameResult = useGameResult();

  // When game ends, store the result
  useEffect(() => {
    if (prevGameState.current !== gameState) {
      prevGameState.current = gameState;
      if (gameState === "ENDED") {
        addResult(buildResult(game, username, level));
      }
    }
  }, [prevGameState, gameState, game, addResult, username, level]);

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  if (gameState !== "ENDED") return null;

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
      <Button ref={autofocus} className="icon-text" onClick={resetGame}>
        <ReloadIcon />
        Play
      </Button>
      <Button href="/results" className="icon-text">
        <MedalIcon />
        Results
      </Button>
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
  background-color: ${(p) => p.theme.color.bg};
  gap: 1rem;
  &:after {
    content: "";
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
    background-image: linear-gradient(
      transparent,
      ${(p) => p.theme.color.bgAlpha}
    );
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

function buildResult(game, username, level) {
  return {
    endDateTime: game.endDateTime.toJSON(),
    level: level,
    gameTime: game.gameTime,
    result: game.result(),
    username: username,
  };
}
