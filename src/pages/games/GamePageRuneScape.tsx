import GamePageCore from './GamePageCore';

/** RuneScape game page (/boosting/runescape). Shared layout lives in
    GamePageCore; game-specific overrides and content go here. */
export default function GamePageRuneScape() {
  return <GamePageCore gameId="runescape" />;
}
