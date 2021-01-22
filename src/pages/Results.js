import "./Results.scss";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { RiRefreshLine as ReloadIcon } from "react-icons/ri";

import {
  RiUser3Fill as UserIcon,
  RiMedalFill as MedalIcon,
  RiFlashlightFill as DifficultyIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
  RiTimerFill as TimeIcon,
  RiCalendarEventFill as CalendarIcon,
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
                <td title="Date">
                  <span>
                    <CalendarIcon />
                  </span>
                </td>
                <td title="Time" className="regular-width">
                  <span>
                    <TimeIcon />
                  </span>
                </td>
                <td title="Level" className="regular-width">
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
              {config.results
                .sort(sortResults)
                .slice(0, 10)
                .map((res, resIdx) => {
                  return (
                    <tr key={resIdx}>
                      <td>{new Date(res.endDateTime).toLocaleDateString()}</td>
                      <td>
                        <div>{msToMS(res.gameTime)}</div>
                      </td>
                      <td>
                        <div>{res.level}</div>
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

function sortResults(a, b) {
  if (a.level > b.level) return -1;
  if (a.level < b.level) return 1;
  if (a.gameTime < b.gameTime) return -1;
  if (a.gameTime > b.gameTime) return 1;
  return 0;
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
