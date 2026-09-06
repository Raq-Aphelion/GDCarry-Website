import GamePageCore from './GamePageCore';

/** Warframe game page (/boosting/warframe). Shared layout lives in
    GamePageCore; game-specific overrides and content go here. */
export default function GamePageWarframe() {
  return <GamePageCore gameId="warframe" />;
}
