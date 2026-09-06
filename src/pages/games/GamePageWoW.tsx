import GamePageCore from './GamePageCore';

/** WoW game page (/boosting/wow). Shared layout lives in GamePageCore;
    game-specific overrides and content go here. */
export default function GamePageWoW() {
  return <GamePageCore gameId="wow" />;
}
