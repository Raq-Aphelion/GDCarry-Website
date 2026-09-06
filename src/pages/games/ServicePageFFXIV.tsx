import ServicePageCore from './ServicePageCore';

/** FFXIV service page (/boosting/ffxiv/:serviceId). Shared layout lives in
    ServicePageCore; game-specific overrides and content go here. */
export default function ServicePageFFXIV() {
  return <ServicePageCore gameId="ffxiv" />;
}
