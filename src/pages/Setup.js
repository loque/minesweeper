import "./Setup.scss";
import { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as LevelIcon,
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

  function changeUsername(e) {
    let username = e.target.value.toUpperCase();
    const re = /[A-Z0-9]+/g;
    username = (username.match(re) || []).join("");
    username = username.slice(0, 3);
    config.setUsername(username);
  }

  function selectLevel(level) {
    return () => config.setLevel(level);
  }

  function levelClassName(level) {
    return String(config.level) === String(level) ? "selected" : "";
  }

  return (
    <div className="view">
      <div className="container">
        <Header setupBtn={false} />
        <div className="section">
          <h3 className="section-title">
            <UserIcon />
            Set your username
          </h3>
          <div className="section-body username">
            <input
              type="text"
              ref={autofocus}
              value={config.username}
              onChange={changeUsername}
            />
            <small
              className={config.username.length !== 3 ? "shown" : "hidden"}
            >
              (*) username must be alphanumeric and 3 characters long.
            </small>
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <LevelIcon /> Select level
          </h3>
          <div className="section-body level">
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
            disabled={config.username.length !== 3}
          >
            Play
            <PlayIcon className="yellow" />
          </button>
        </div>
      </div>
    </div>
  );
}
