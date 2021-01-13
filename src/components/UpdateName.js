import { useState } from "react";
import { useConfig } from "../lib/config";

export default function UpdateName() {
  const config = useConfig();
  const [name, setName] = useState(config.name);
  function submitName(e) {
    e.preventDefault();
    console.log("submitting name", name);
    config.setName(name);
  }
  function changeName(e) {
    let name = e.target.value.slice(0, 3).toUpperCase();
    setName(name);
  }
  return (
    <>
      <h3>Your name</h3>
      <form onSubmit={submitName}>
        <input type="text" value={name} onChange={changeName} />
        <button type="submit">Save</button>
      </form>
    </>
  );
}
