import ServicePageCore from './ServicePageCore';

/** WoW service page (/boosting/wow/:serviceId). Shared layout lives in
    ServicePageCore; game-specific overrides and content go here. */
export default function ServicePageWoW() {
  return <ServicePageCore gameId="wow" />;
}
