import Head from "next/head";
import Link from "next/link";
import "../styles/Setup.module.scss";
import { useEffect, useRef } from "react";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as LevelIcon,
  RiPlayFill as PlayIcon,
} from "react-icons/ri";
import { levels } from "../lib/useGame";

export default function Home() {
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
          <h3 className="sectionTitle">
            <UserIcon />
            Set your username
          </h3>
          <div className="sectionBody username">
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
          <h3 className="sectionTitle">
            <LevelIcon /> Select level
          </h3>
          <div className="sectionBody level">
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
        <div className="playBtnWrapper">
          <Link
            className="button text-icon playBtn"
            href={"/game"}
            onClick={(ev) => {
              if (config.username.length < 3) {
                ev.preventDefault();
              }
            }}
          >
            <span>
              Play
              <PlayIcon className="yellow" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
