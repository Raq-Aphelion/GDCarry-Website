export interface Service {
  id: string;
  name: string;
  tag2: string;
  /** Fallback price in EUR when the pricing database has no entry (0 until
      the service gets its own methodPrices/category file) */
  price: number;
  tag1: string;
  image: string;
  /** Optional third bullet — defaults to 'Hand-played · Money-back guarantee' */
  tag3?: string;
  /** Long-form text shown on a dedicated service subpage */
  longDescription?: string;
  tag?: 'Popular' | 'Hot' | 'New' | 'Best Value';
  /** Account-listing metadata (Accounts category) — drives the Region /
      Levels / Housing filters and the Newest/Oldest sort on the game page. */
  account?: {
    region: 'us' | 'eu' | 'oc' | 'jp';
    /** 'all-max' (combat + crafter/gatherer) is a superset of 'combat-max' */
    levels: 'combat-max' | 'all-max';
    housing: 'none' | 'small' | 'medium' | 'large';
    /** ISO date the listing was added — Newest/Oldest sort */
    addedAt?: string;
    /** Overrides the purchase box's "What you get" list (defaults to the
        card's three tags) — listings can show more than 3 lines there */
    specs?: string[];
  };
}

export interface Subcategory {
  id: string;
  name: string;
  services: Service[];
  /** Ids of services from other subcategories to display here as duplicate
      proxy cards — deduped from counts by their shared id. */
  proxies?: string[];
}

export interface Game {
  id: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  /** Card art used in the home carousel, navbar games menu and game page header */
  cardImage: string;
  /** Logo wordmark shown on the home carousel cards instead of the title text */
  logo: string;
  main?: boolean;
  subcategories: Subcategory[];
}

import { SERVICE_PAGES } from '@/data/servicePages';
import type { CatalogConfig } from '@/data/pricing';
import { ffxivGame } from './ffxiv';
import { wowGame } from './wow';
import { lostArkGame } from './lost-ark';
import { warframeGame } from './warframe';
import { runescapeGame } from './runescape';

export const games: Game[] = [ffxivGame, wowGame, lostArkGame, warframeGame, runescapeGame];

// 'All services' aggregates every game's services without duplicating data entries
for (const game of games) {
  const uniqueServices = [
    ...new Map(game.subcategories.flatMap((s) => s.services).map((sv) => [sv.id, sv])).values(),
  ];
  game.subcategories.unshift({ id: 'all', name: 'All services', services: uniqueServices });
}

/** Flat index of every service, used by the navbar search. */
export const allServices: ServiceSearchResult[] = [];

function rebuildSearchIndex() {
  allServices.length = 0;
  allServices.push(
    ...games.flatMap((game) =>
      game.subcategories
        .filter((sub) => sub.id !== 'all')
        .flatMap((sub) =>
          sub.services.map((service) => ({ game, subId: sub.id, subName: sub.name, service })),
        ),
    ),
  );
}
rebuildSearchIndex();

/**
 * Apply the database `catalog` block (ffxiv-Catalog.json) to the static
 * catalog before first render (called from PricingProvider once the DB loads
 * — rendering is held until then, so every consumer sees the DB-driven
 * state):
 * - `categories`: display order (array order; 'all' stays first, unlisted
 *   categories keep their relative order), display-name overrides, and proxy
 *   card lists (e.g. Current Patch, Currency).
 * - `services`: ids mapped to 0 are removed from every category, proxy list,
 *   'All services', and the search index (direct subpage URLs stop
 *   resolving). Unlisted ids stay enabled.
 */
export function applyCatalog(catalog?: CatalogConfig): void {
  if (!catalog) return;
  const byId = new Map((catalog.categories ?? []).map((c) => [c.id, c]));
  const rank = new Map((catalog.categories ?? []).map((c, i) => [c.id, i]));
  const disabled = new Set(
    Object.entries(catalog.services ?? {})
      .filter(([, v]) => v === 0)
      .map(([id]) => id),
  );
  for (const game of games) {
    if (byId.size) {
      for (const sub of game.subcategories) {
        const c = byId.get(sub.id);
        if (!c) continue;
        if (c.name) sub.name = c.name;
        if (c.proxies) sub.proxies = c.proxies;
      }
      const rest = game.subcategories.filter((s) => s.id !== 'all');
      rest.sort((a, b) => (rank.get(a.id) ?? byId.size) - (rank.get(b.id) ?? byId.size));
      const all = game.subcategories.find((s) => s.id === 'all');
      game.subcategories = all ? [all, ...rest] : rest;
    }
    if (disabled.size) {
      for (const sub of game.subcategories) {
        if (sub.id === 'all') continue;
        sub.services = sub.services.filter((sv) => !disabled.has(sv.id));
        if (sub.proxies) sub.proxies = sub.proxies.filter((id) => !disabled.has(id));
      }
      // Rebuild 'All services' from the remaining entries (dedup by id)
      const all = game.subcategories.find((s) => s.id === 'all');
      if (all) {
        all.services = [
          ...new Map(
            game.subcategories
              .filter((s) => s.id !== 'all')
              .flatMap((s) => s.services)
              .map((sv) => [sv.id, sv]),
          ).values(),
        ];
      }
    }
  }
  if (disabled.size) rebuildSearchIndex();
}

export const getGame = (id: string) => games.find((g) => g.id === id);

export const serviceCount = (game: Game) =>
  new Set(game.subcategories.flatMap((s) => s.services.map((sv) => sv.id))).size;

export interface ServiceSearchResult {
  game: Game;
  subId: string;
  subName: string;
  service: Service;
}

/** Where a service card links: its dedicated subpage if it has one, else its category page. */
export const serviceLink = (serviceId: string): string => {
  const hit = allServices.find((s) => s.service.id === serviceId);
  if (!hit) return '/';
  if (SERVICE_PAGES[serviceId]) return `/boosting/${hit.game.id}/${serviceId}`;
  return `/boosting/${hit.game.id}?cat=${hit.subId}`;
};

/** The first real category a service belongs to (the search index skips the
    synthetic 'all' bucket, so this is never 'all'). */
export const serviceCategory = (serviceId: string): ServiceSearchResult | undefined =>
  allServices.find((s) => s.service.id === serviceId);

/**
 * Static "Most Popular" order for the All services grid — curated to match
 * typical boosting-site demand (currency and progression skips first, then
 * current raid content, ultimates, current extremes/mounts, deep dungeons,
 * relics, field content and PvP). Unlisted services trail in catalog order.
 */
export const POPULAR_ORDER: string[] = [
  'ffxiv-gil-pack',
  'ffxiv-msq-skip',
  'ffxiv-leveling-boost',
  'ffxiv-crafter-gatherer-leveling',
  'ffxiv-arcadion-savage',
  'ffxiv-pandaemonium-savage',
  'ffxiv-uwu',
  'ffxiv-fru',
  'ffxiv-top',
  'ffxiv-dsr',
  'ffxiv-tea',
  'ffxiv-ucob',
  'ffxiv-dmu',
  'ffxiv-ultimate-bundle',
  'ffxiv-dawntrail-trials-bundle',
  'ffxiv-the-unmaking',
  'ffxiv-hell-on-rails',
  'ffxiv-wings-of-mist',
  'ffxiv-wings-of-legacy',
  'ffxiv-potd-solo',
  'ffxiv-pilgrims-traverse',
  'ffxiv-orthos',
  'ffxiv-hoh',
  'ffxiv-final-verse',
  'ffxiv-deep-dungeon-bundle',
  'ffxiv-phantom-weapon',
  'ffxiv-manderville-weapon',
  'ffxiv-occult-crescent',
  'ffxiv-cosmic-exploration',
  'ffxiv-cc-rank-boost',
  'ffxiv-pvp-series-boost',
  'ffxiv-forked-tower-blood',
  'ffxiv-forked-tower-magic',
  'ffxiv-cloud-of-darkness',
  'ffxiv-another-merchants-tale',
  'ffxiv-kamuy-nine-tails',
  'ffxiv-demi-ozma',
];
