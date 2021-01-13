import { Link } from "react-router-dom";
import { useConfig } from "./lib/config";

export default function Presentation() {
  const config = useConfig();
  return (
    <>
      <h1>Presentation</h1>
      <div>
        <div>Current level: {config.difficulty}</div>
        <div>
          <Link to="/game">Start game</Link>
        </div>
        <div>
          <Link to="/setup">Setup</Link>
        </div>
      </div>
    </>
  );
}
