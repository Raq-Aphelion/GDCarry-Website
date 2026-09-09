/**
 * Pricing database file list — the single source of truth for the site
 * (src/data/pricing.ts), the orders worker (worker/orders-proxy.js, via the
 * pricing.ts re-export) and the db-bundle Vite plugin (vite.config.ts).
 *
 * Deliberately dependency-free: vite.config.ts is type-checked under
 * tsconfig.node.json (Node types only — no vite/client, no @ alias), so this
 * module must not pull in any of the app module graph.
 */

/** Global database file (without .json), relative to `db/`. */
export const GLOBAL_PRICING_FILE = 'pricing/global';

/** Per-category database files (without .json), relative to `db/` — loaded
    and merged at startup. */
export const CATEGORY_FILES = [
  'pricing/ffxiv/UltimateRaids',
  'pricing/ffxiv/Gil',
  'pricing/ffxiv/SavageRaids',
  'pricing/ffxiv/Leveling',
  'pricing/ffxiv/PvP',
  'pricing/ffxiv/Mounts',
  'pricing/ffxiv/Trials',
  'pricing/ffxiv/DeepDungeons',
  'pricing/ffxiv/AllianceRaids',
  'pricing/ffxiv/Criterion',
  'pricing/ffxiv/Relics',
  'pricing/ffxiv/Reputation',
  'pricing/ffxiv/FieldExplorations',
  'pricing/ffxiv/Catalog',
  'pricing/ffxiv/Accounts',
];
