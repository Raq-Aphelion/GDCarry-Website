import GamePageCore from './GamePageCore';

/** FFXIV game page (/boosting/ffxiv). Shared layout lives in GamePageCore;
    game-specific overrides and content go here. */
export default function GamePageFFXIV() {
  return <GamePageCore gameId="ffxiv" />;
}
