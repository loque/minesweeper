import {
  RiSettings4Fill as SetupIcon,
  RiArrowGoBackFill as BackIcon,
  RiRefreshLine as ReloadIcon,
} from "react-icons/ri";
import { Header as StyledHeader } from "../ui/layout";
import { Button } from "../ui/form";

export default function Header({
  title = null,
  setupBtn = false,
  backBtn = false,
  playAgainBtn = false,
}) {
  return (
    <StyledHeader>
      {title && title}
      {!title && <h1>minesweeper</h1>}
      {playAgainBtn && (
        <Button className="icon-text" href="/game">
          <span>
            <ReloadIcon />
            Play again
          </span>
        </Button>
      )}
      {setupBtn && (
        <Button href="/" className="transparent" title="Setup">
          <SetupIcon />
        </Button>
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
