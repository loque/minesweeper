import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import Setup from "./Setup";
import Game from "./Game";
import Results from "./Results";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/game">
          <Game />
        </Route>
        <Route path="/results">
          <Results />
        </Route>
        <Route path={["/setup", "/"]}>
          <Setup />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
