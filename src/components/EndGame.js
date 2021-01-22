import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";

export default function EndGame({ game }) {
  const autofocus = useRef();
  const [gameState, setGameState] = useState(() => game.state());
  const [gameResult, setGameResult] = useState(() => game.result());

  useEffect(() => {
    const callback = (ev) => setGameState(ev.detail);
    game.addEventListener("stateChange", callback);
    return () => game.removeEventListener("stateChange", callback);
  }, [game]);

  useEffect(() => {
    const callback = (ev) => setGameResult(ev.detail);
    game.addEventListener("resultChange", callback);
    return () => game.removeEventListener("resultChange", callback);
  }, [game]);

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="endgame">
      {gameState === "ENDED" && gameResult === "WON" && (
        <div className="endgame-result icon-text">
          <HappyIcon className="yellow" /> You won!
        </div>
      )}
      {gameState === "ENDED" && gameResult === "LOST" && (
        <div className="endgame-result icon-text">
          <SadIcon className="red" /> You Lost!
        </div>
      )}
      <Link ref={autofocus} className="button icon-text" to="/game">
        <ReloadIcon />
        Play
      </Link>
      <Link to="/results" className="button icon-text">
        <MedalIcon />
        Results
      </Link>
    </div>
  );
}
