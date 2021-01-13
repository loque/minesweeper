import { useGame } from "./lib/useGame";
import { useConfig } from "./lib/config";

export default function Game() {
  const config = useConfig();
  const game = useGame(config.difficulty);

  if (!game.board) return null;
  return (
    <>
      <h1>Game</h1>
      <div>
        {game.state} - {game.result}
      </div>
    </>
  );
}
