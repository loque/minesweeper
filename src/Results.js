import { Link } from "react-router-dom";
import { useConfig } from "./lib/config";

export default function Results() {
  const config = useConfig();
  return (
    <>
      <h1>Results</h1>
      <table>
        <thead>
          <tr>
            <td>Start Time</td>
            <td>End Time</td>
            <td>Difficulty</td>
            <td>Game Time</td>
            <td>Result</td>
            <td>User</td>
          </tr>
        </thead>
        <tbody>
          {config.results.map((res, resIdx) => {
            return (
              <tr key={resIdx}>
                <td>{res.startTime}</td>
                <td>{res.endTime}</td>
                <td>{res.difficulty}</td>
                <td>{msToMS(res.gameTime)}</td>
                <td>{res.result}</td>
                <td>{res.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <Link to="/game">Play again</Link>
      </div>
    </>
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
