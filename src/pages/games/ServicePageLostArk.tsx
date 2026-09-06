import ServicePageCore from './ServicePageCore';

/** Lost Ark service page (/boosting/lost-ark/:serviceId). Shared layout lives
    in ServicePageCore; game-specific overrides and content go here. */
export default function ServicePageLostArk() {
  return <ServicePageCore gameId="lost-ark" />;
}
