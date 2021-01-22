import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiRefreshLine as ReloadIcon,
  RiMedalFill as MedalIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
} from "react-icons/ri";

export default function EndGame({ game }) {
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="endgame">
      <div className="endgame-modal">
        {game.state("ENDED") && game.result("WON") && (
          <div className="endgame-result icon-text">
            <HappyIcon className="yellow" /> You won!
          </div>
        )}
        {game.state("ENDED") && game.result("LOST") && (
          <div className="endgame-result icon-text">
            <SadIcon className="red" /> You Lost!
          </div>
        )}
        <div className="endgame-actions">
          <Link ref={autofocus} className="button icon-text" to="/game">
            <ReloadIcon />
            Play again
          </Link>
          <Link to="/results" className="button icon-text">
            <MedalIcon />
            Results
          </Link>
        </div>
      </div>
    </div>
  );
}
