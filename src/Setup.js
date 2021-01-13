import { useState, useEffect, useRef } from "react";
import "./Setup.scss";
import { useConfig } from "./lib/config";
import Header from "./components/Header";

import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as DifficultyIcon,
  RiCheckFill as CheckIcon,
} from "react-icons/ri";

export default function Setup() {
  const config = useConfig();
  const [name, setName] = useState(config.name);
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  function submitName(e) {
    e.preventDefault();
    console.log("submitting name", name);
    config.setName(name);
  }

  function changeName(e) {
    let name = e.target.value.slice(0, 3).toUpperCase();
    setName(name);
  }

  function selectDifficulty(level) {
    config.setDifficulty(level);
  }
  return (
    <div className="view">
      <div className="container">
        <Header setupBtn={false} backBtn={true} />
        <div className="section">
          <h3 className="section-title">
            <UserIcon />
            Set your username
          </h3>
          <form className="section-body input-group" onSubmit={submitName}>
            <input
              type="text"
              ref={autofocus}
              value={name}
              onChange={changeName}
            />
            <button type="submit">
              <CheckIcon />
            </button>
          </form>
        </div>
        <div className="section">
          <h3 className="section-title">
            <DifficultyIcon /> Select difficulty level
          </h3>
          <div className="section-body">
            <div className="button-group">
              <button
                className={config.difficulty === "EASY" && "selected"}
                onClick={() => selectDifficulty("EASY")}
              >
                EASY
              </button>
              <button
                className={config.difficulty === "MEDIUM" && "selected"}
                onClick={() => selectDifficulty("MEDIUM")}
              >
                MEDIUM
              </button>
              <button
                className={config.difficulty === "HARD" && "selected"}
                onClick={() => selectDifficulty("HARD")}
              >
                HARD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
