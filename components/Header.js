import "./Header.module.scss";
import Link from "next/link";
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
  console.log("title", title);
  return (
    <header className="header">
      {title && title}
      {!title && <h1>minesweeper</h1>}
      {playAgainBtn && (
        <Link className="button icon-text" href="/game">
          <span>
            <ReloadIcon />
            Play again
          </span>
        </Link>
      )}
      {setupBtn && (
        <Link href="/" className="button transparent" title="Setup">
          <SetupIcon />
        </Link>
      )}
      {backBtn && (
        <button
          className="button transparent"
          title="Go back"
          onClick={() => window.history.back()}
        >
          <BackIcon />
        </button>
      )}
    </header>
  );
}
