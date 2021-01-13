import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import Presentation from "./Presentation";
import Setup from "./Setup";
import Game from "./Game";
import Results from "./Results";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/setup">
            <Setup />
          </Route>
          <Route path="/game">
            <Game />
          </Route>
          <Route path="/results">
            <Results />
          </Route>
          <Route path="/">
            <Presentation />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
