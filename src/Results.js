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
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {config.results.map((res, resIdx) => {
            return (
              <tr key={resIdx}>
                <td>{res.startTime}</td>
                <td>{res.endTime}</td>
                <td>{res.difficulty}</td>
                <td>{res.gameTime}</td>
                <td>{res.status}</td>
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
