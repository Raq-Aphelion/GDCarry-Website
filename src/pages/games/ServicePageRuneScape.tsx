import ServicePageCore from './ServicePageCore';

/** RuneScape service page (/boosting/runescape/:serviceId). Shared layout
    lives in ServicePageCore; game-specific overrides and content go here. */
export default function ServicePageRuneScape() {
  return <ServicePageCore gameId="runescape" />;
}
