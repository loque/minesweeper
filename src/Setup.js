import { useConfig } from "./lib/config";
import { useHistory } from "react-router-dom";

import UpdateName from "./components/UpdateName";

export default function Setup() {
  const { setDifficulty } = useConfig();
  const history = useHistory();

  function selectDifficulty(level) {
    setDifficulty(level);
    history.goBack();
  }
  return (
    <>
      <h1>Config</h1>
      <h2>Set username</h2>
      <UpdateName />
      <h2>Select difficulty</h2>
      <div>
        <button onClick={() => selectDifficulty("EASY")}>EASY</button>
        <button onClick={() => selectDifficulty("MEDIUM")}>MEDIUM</button>
        <button onClick={() => selectDifficulty("HARD")}>HARD</button>
      </div>
      <button onClick={() => history.goBack()}>Go back</button>
    </>
  );
}
