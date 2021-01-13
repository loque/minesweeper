import "./Presentation.scss";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import { RiPlayFill as PlayIcon } from "react-icons/ri";

export default function Presentation() {
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  return (
    <div className="view">
      <div className="container">
        <Header />
        <StatusBar />
        <div className="play-button-wrapper">
          <Link
            ref={autofocus}
            className="button text-icon play-button"
            to="/game"
          >
            Start game
            <PlayIcon className="yellow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
