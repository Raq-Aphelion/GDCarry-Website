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
  /** Greyed out and unclickable in the purchase box (e.g. AFK-heavyweight) */
  disabled?: boolean;
}

/** Pandaemonium per-method pricing (bundles, per-tier fights, unlocks, completion times) */
export interface PandaMethodPricing {
  bundles: PricingAddon[];
  fights: Record<string, PricingAddon[]>;
  unlocks: PricingAddon[];
  stream: number;
  completion: { normal: string; priority: string };
}

export interface PricingDb {
  currency: {
    /** Conversion multiplier: 1 EUR = usdPerEur USD */
    usdPerEur: number;
  };
  /** Per-category database files (without .json) to merge in */
  categories?: string[];
  /** Current Patch category: display name and the service ids shown as proxy
      cards (duplicates from other categories that never inflate counts) */
  currentPatch?: { name?: string; proxies?: string[] };
  /** Homepage Popular Picks: service ids in display order (1st = 1st spot) */
  popularPicks?: string[];
  /** Shared duty-unlock addon, defined by the ffxiv-UltimateRaids category
      (the only services whose purchase box offers it). Per-service price
      overrides live in `addonPrices`. */
  unlockAddon?: PricingAddon;
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
  /** Savage raid series pricing (from ffxiv-SavageRaids), keyed by service id
      then method id. A service's card "From" price is its piloted tier
      bundle's first option. */
  savageSeries?: Record<string, Record<string, PandaMethodPricing>>;
  /** Powerleveling pricing (from ffxiv-Leveling): per-level price tiers and
      the MSQ add-on for the leveling purchase box */
  leveling?: {
    serviceId: string;
    /** Card "From" price for the leveling service */
    fromPrice?: number;
    levelMin: number;
    levelMax: number;
    defaultStart: number;
    defaultEnd: number;
    priceTiers: { min: number; max: number; pricePerLevel: number }[];
    msqAddon: PricingAddon;
    completion: string;
  };
  /** MSQ Completion boost pricing (from ffxiv-Leveling): per-expansion prices.
      The card "From" price is the first expansion's price. */
  msqBoost?: {
    serviceId: string;
    expansions: PricingAddon[];
    /** Per-expansion add-on; `expansions` is the whitelist of expansion ids
        that count toward it (edit to include/exclude any) */
    aetherCurrents?: { label: string; pricePerExpansion: number; expansions: string[] };
    completion: string;
  };
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
    let savageSeries: PricingDb['savageSeries'];
    let leveling: PricingDb['leveling'];
    let msqBoost: PricingDb['msqBoost'];
    let unlockAddon: PricingDb['unlockAddon'];
    await Promise.all(
      (db.categories ?? []).map(async (file) => {
        try {
          const r = await fetch(`${base}db/${file}.json`, { cache: 'no-store' });
          if (!r.ok) return;
          const cat = (await r.json()) as Pick<
            PricingDb,
            'methodPrices' | 'addonPrices' | 'serviceAddons' | 'gil' | 'savageSeries' | 'leveling' | 'msqBoost' | 'unlockAddon'
          >;
          Object.assign(methodPrices, cat.methodPrices);
          Object.assign(addonPrices, cat.addonPrices);
          Object.assign(serviceAddons, cat.serviceAddons);
          if (cat.gil) gil = cat.gil;
          if (cat.savageSeries) savageSeries = { ...savageSeries, ...cat.savageSeries };
          if (cat.leveling) leveling = cat.leveling;
          if (cat.msqBoost) msqBoost = cat.msqBoost;
          if (cat.unlockAddon) unlockAddon = cat.unlockAddon;
        } catch {
          /* broken category file — skip it */
        }
      }),
    );

    return {
      currency: { ...DEFAULT_PRICING.currency, ...db.currency },
      categories: db.categories,
      currentPatch: db.currentPatch,
      popularPicks: db.popularPicks,
      unlockAddon,
      purchaseBox: { ...DEFAULT_PRICING.purchaseBox, ...db.purchaseBox },
      methodPrices,
      addonPrices,
      serviceAddons,
      gil,
      savageSeries,
      leveling,
      msqBoost,
      servicePrices: db.servicePrices ?? {},
    };
  } catch {
    return DEFAULT_PRICING;
  }
}
