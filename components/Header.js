import {
  RiSettings4Fill as SetupIcon,
  RiArrowGoBackFill as BackIcon,
  RiRefreshLine as ReloadIcon,
} from "react-icons/ri";
import { Header as StyledHeader } from "../ui/layout";
import { Link } from "../ui/button";

export default function Header({
  title = null,
  setupBtn = true,
  backBtn = false,
  playAgainBtn = false,
}) {
  return (
    <StyledHeader>
      {title && title}
      {!title && <h1>minesweeper</h1>}
      {playAgainBtn && (
        <Link className="icon-text" href="/game">
          <span>
            <ReloadIcon />
            Play again
          </span>
        </Link>
      )}
      {setupBtn && (
        <Link href="/" className="transparent" title="Setup">
          <SetupIcon />
        </Link>
      )}
      {backBtn && (
        <button
          className="transparent"
          title="Go back"
          onClick={() => window.history.back()}
        >
          <BackIcon />
        </button>
      )}
    </StyledHeader>
  );
}
