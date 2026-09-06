import ServicePageCore from './ServicePageCore';

/** Warframe service page (/boosting/warframe/:serviceId). Shared layout lives
    in ServicePageCore; game-specific overrides and content go here. */
export default function ServicePageWarframe() {
  return <ServicePageCore gameId="warframe" />;
}
