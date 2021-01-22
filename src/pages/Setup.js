import "./Setup.scss";
import { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as DifficultyIcon,
  RiPlayFill as PlayIcon,
} from "react-icons/ri";
import { levels } from "../lib/useGame";

export default function Setup() {
  const history = useHistory();
  const config = useConfig();
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  function changeName(e) {
    let name = e.target.value.slice(0, 3).toUpperCase();
    config.setName(name);
  }

  function selectLevel(level) {
    return () => config.setLevel(level);
  }

  function levelClassName(level) {
    return config.level === level ? "selected" : "";
  }

  return (
    <div className="view">
      <div className="container">
        <Header setupBtn={false} />
        <div className="section">
          <h3 className="section-title">
            <UserIcon />
            Set your name
          </h3>
          <div className="section-body name">
            <input
              type="text"
              ref={autofocus}
              value={config.name}
              onChange={changeName}
            />
            <small className={config.name.length !== 3 ? "shown" : "hidden"}>
              (*) name must be 3 characters long.
            </small>
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <DifficultyIcon /> Select difficulty level
          </h3>
          <div className="section-body difficulty">
            {levels.map((_, levelIdx) => {
              const level = levelIdx + 1;
              return (
                <button
                  key={levelIdx}
                  className={levelClassName(level)}
                  onClick={selectLevel(level)}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
        <div className="play-button-wrapper">
          <button
            className="button text-icon play-button"
            onClick={() => history.push("/game")}
            disabled={config.name.length !== 3}
          >
            Start game
            <PlayIcon className="yellow" />
          </button>
        </div>
      </div>
    </div>
  );
}