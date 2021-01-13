import "./Results.scss";
import { useConfig } from "./lib/config";
import Header from "./components/Header";
import { Link } from "react-router-dom";
import { RiRefreshLine as ReloadIcon } from "react-icons/ri";

import {
  RiUser3Fill as UserIcon,
  RiMedalFill as MedalIcon,
  RiFlashlightFill as DifficultyIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
  RiTimerFill as TimeIcon,
  RiPlayMiniFill as PlayIcon,
  RiStopMiniFill as StopIcon,
  RiCloseLine as ClearIcon,
} from "react-icons/ri";

export default function Results() {
  const config = useConfig();
  return (
    <div className="view">
      <div className="container">
        <Header
          title={
            <h1 className="results-title">
              <MedalIcon />
              Top 10
            </h1>
          }
          setupBtn={true}
          playAgainBtn={false}
        />

        <div className="play-again-wrapper">
          <Link className="button icon-text" to="/game">
            <ReloadIcon />
            Play again
          </Link>
        </div>

        {!!config.results.length && (
          <table className="results-table">
            <thead>
              <tr>
                <td title="Time">
                  <span>
                    <TimeIcon />
                    <span>Start/End</span>
                  </span>
                </td>
                <td title="Time" className="regular-width">
                  <span>
                    <TimeIcon />
                    <span>Game</span>
                  </span>
                </td>
                <td title="Difficulty" className="regular-width">
                  <DifficultyIcon />
                </td>
                <td title="Result" className="regular-width">
                  <MedalIcon />
                </td>
                <td title="Username" className="regular-width">
                  <UserIcon />
                </td>
              </tr>
            </thead>
            <tbody>
              {config.results.slice(0, 10).map((res, resIdx) => {
                return (
                  <tr key={resIdx}>
                    <td>
                      <div className="time">
                        <PlayIcon /> {res.startTime}
                      </div>
                      <div className="time">
                        <StopIcon /> {res.endTime}
                      </div>
                    </td>
                    <td>
                      <div>{msToMS(res.gameTime)}</div>
                    </td>
                    <td>
                      {/* <div>Difficulty</div> */}
                      <div>{res.difficulty}</div>
                    </td>
                    <td>
                      <div className="center result">
                        {res.result === "WON" && (
                          <HappyIcon className="yellow" />
                        )}
                        {res.result === "LOST" && <SadIcon className="red" />}
                      </div>
                    </td>
                    <td>
                      <div>{res.name}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!!config.results.length && (
          <div className="clear-btn-wrapper">
            <button
              className="icon-text clear-btn"
              onClick={() => config.clearResults()}
            >
              <ClearIcon />
              Clear results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// from: https://stackoverflow.com/a/29816921/3622350
function msToMS(ms) {
  // Convert to seconds:
  let seconds = ms / 1000;
  // Extract minutes:
  let minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  // Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  return numPad(minutes) + ":" + numPad(Math.floor(seconds));
}

function numPad(str, length = 2) {
  str = str + "";
  if (str.length < length) {
    let diff = length - str.length;
    str = "0".repeat(diff) + str;
  }
  return str;
}
