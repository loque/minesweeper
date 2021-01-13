import "./Header.scss";
import { Link, useHistory } from "react-router-dom";
import {
  RiSettings4Fill as SetupIcon,
  RiArrowGoBackFill as BackIcon,
  RiRefreshLine as ReloadIcon,
} from "react-icons/ri";

export default function Header({
  title = null,
  setupBtn = true,
  backBtn = false,
  playAgainBtn = false,
}) {
  const history = useHistory();
  return (
    <header>
      {title && title}
      {!title && <h1>minesweeper</h1>}
      {setupBtn && (
        <Link to="/setup" className="button transparent" title="Setup">
          <SetupIcon />
        </Link>
      )}
      {backBtn && (
        <button
          className="button transparent"
          title="Go back"
          onClick={() => history.goBack()}
        >
          <BackIcon />
        </button>
      )}
      {playAgainBtn && (
        <Link className="button icon-text" to="/game">
          <ReloadIcon />
          Play again
        </Link>
      )}
    </header>
  );
}
