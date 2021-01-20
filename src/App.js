import { Provider as JotaiProvider } from "jotai";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import Game from "./pages/Game";
import Results from "./pages/Results";
import Setup from "./pages/Setup";

function App() {
  return (
    <JotaiProvider>
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
    </JotaiProvider>
  );
}

export default App;
