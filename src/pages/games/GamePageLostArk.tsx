import GamePageCore from './GamePageCore';

/** Lost Ark game page (/boosting/lost-ark). Shared layout lives in
    GamePageCore; game-specific overrides and content go here. */
export default function GamePageLostArk() {
  return <GamePageCore gameId="lost-ark" />;
}
