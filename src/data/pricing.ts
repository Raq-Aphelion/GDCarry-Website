/**
 * Pricing database layer.
 *
 * The database is split into files under `public/db/` (served at `db/`):
 * - `pricing.json` — global: currency, purchase-box options, and a
 *   `categories` list of per-category files to load.
 * - `<game>-<Category>.json` (e.g. `ffxiv-UltimateRaids.json`) — per-category
 *   `methodPrices` (per-service piloted/afk prices; omit `afk` for
 *   piloted-only) and `addonPrices` (per-service addon price overrides).
 *
 * Service cards show the lower method price ("From …"); services without a
 * methodPrices entry fall back to their bundled price. The app loads all of
 * this at startup; the defaults below are only a fallback if the database
 * cannot be reached. To change any price, edit the JSON files — no rebuild
 * is required.
 */

export interface PricingOption {
  label: string;
  price: number;
  /** Percentage surcharge applied to (method price × runs × priority) */
  percent?: number;
}

export interface PricingAddon {
  id: string;
  label: string;
  price: number;
}

export interface PricingDb {
  currency: {
    /** Conversion multiplier: 1 EUR = usdPerEur USD */
    usdPerEur: number;
  };
  /** Per-category database files (without .json) to merge in */
  categories?: string[];
  purchaseBox: {
    /** Flat EUR discount applied to the AFK Carry method */
    afkDiscount: number;
    runsMin: number;
    runsMax: number;
    /** Multiplier applied to (method price × runs) when Priority is selected */
    priorityMultiplier: number;
    gearOptions: PricingOption[];
    logOptions: PricingOption[];
    addons: PricingAddon[];
  };
  /** Service id -> explicit per-method prices (overrides afkDiscount model).
      Omit `afk` for piloted-only services — the AFK button is then hidden. */
  methodPrices?: Record<string, { piloted: number; afk?: number }>;
  /** Gil currency pricing (from the ffxiv-Gil category file) */
  gil?: { pricePerMillion: number };
  /** Service id -> addon id -> per-service addon price override */
  addonPrices?: Record<string, Record<string, number>>;
  /** Service id -> per-method addon lists that REPLACE the global 'unlock'
      addon (stream/priority stay). Used by bundles whose unlocks differ per
      method and differ from the single duty unlock. */
  serviceAddons?: Record<string, { piloted?: PricingAddon[]; afk?: PricingAddon[] }>;
  /** Service id -> flat base price override (legacy; prefer methodPrices) */
  servicePrices: Record<string, number>;
}

/** Bundled fallback, used only if the JSON database cannot be loaded. */
export const DEFAULT_PRICING: PricingDb = {
  currency: { usdPerEur: 1.15 },
  purchaseBox: {
    afkDiscount: 40,
    runsMin: 1,
    runsMax: 10,
    priorityMultiplier: 2,
    gearOptions: [
      { label: "I don't need extra gear", price: 0 },
      { label: 'Pentamelded Crafted Set', price: 40 },
    ],
    logOptions: [
      { label: "I don't want a parse", price: 0, percent: 0 },
      { label: 'White / Green Parse (0-49% Logs)', price: 0, percent: 10 },
      { label: 'Blue Parse (50-74% Logs)', price: 0, percent: 50 },
      { label: 'Purple Parse (74-94% Logs)', price: 0, percent: 100 },
      { label: 'Orange Parse (95-98% Logs)', price: 0, percent: 400 },
      { label: 'Pink Parse (99% Logs)', price: 0, percent: 600 },
    ],
    addons: [
      { id: 'unlock', label: 'Duty unlock', price: 39.99 },
      { id: 'stream', label: 'Private Stream', price: 10.0 },
      { id: 'priority', label: 'Priority', price: 0 },
    ],
  },
  methodPrices: {},
  addonPrices: {},
  serviceAddons: {},
  servicePrices: {},
};

/** Fetch the pricing database (global + category files), falling back to the
    bundled defaults. Broken or missing category files are skipped. */
export async function loadPricing(): Promise<PricingDb> {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}db/pricing.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const db = (await res.json()) as PricingDb;

    const methodPrices: NonNullable<PricingDb['methodPrices']> = {};
    const addonPrices: NonNullable<PricingDb['addonPrices']> = {};
    const serviceAddons: NonNullable<PricingDb['serviceAddons']> = {};
    let gil: PricingDb['gil'];
    await Promise.all(
      (db.categories ?? []).map(async (file) => {
        try {
          const r = await fetch(`${base}db/${file}.json`, { cache: 'no-store' });
          if (!r.ok) return;
          const cat = (await r.json()) as Pick<PricingDb, 'methodPrices' | 'addonPrices' | 'serviceAddons' | 'gil'>;
          Object.assign(methodPrices, cat.methodPrices);
          Object.assign(addonPrices, cat.addonPrices);
          Object.assign(serviceAddons, cat.serviceAddons);
          if (cat.gil) gil = cat.gil;
        } catch {
          /* broken category file — skip it */
        }
      }),
    );

    return {
      currency: { ...DEFAULT_PRICING.currency, ...db.currency },
      categories: db.categories,
      purchaseBox: { ...DEFAULT_PRICING.purchaseBox, ...db.purchaseBox },
      methodPrices,
      addonPrices,
      serviceAddons,
      gil,
      servicePrices: db.servicePrices ?? {},
    };
  } catch {
    return DEFAULT_PRICING;
  }
}
