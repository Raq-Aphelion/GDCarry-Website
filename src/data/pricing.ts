/**
 * Pricing database layer.
 *
 * The database is split into files under `public/db/` (served at `db/`):
 * - `pricing.json` — global currency only (EUR -> USD rate).
 * - `<game>-<Category>.json` (e.g. `ffxiv-UltimateRaids.json`) — per-category
 *   `methodPrices` (per-service piloted/afk prices; omit `afk` for
 *   piloted-only) and `addonPrices` (per-service addon price overrides).
 *   `ffxiv-UltimateRaids.json` also holds the shared `purchaseBox` options.
 * - `ffxiv-Catalog.json` — the card catalog: category order/names/proxies,
 *   per-service 1/0 visibility, mount duty-type groups, popular picks.
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

/** Card-catalog config (from ffxiv-Catalog.json): category order/names/
    proxies, per-service 1/0 visibility, mount duty-type groups, popular picks. */
export interface CatalogCategory {
  id: string;
  /** Display-name override (e.g. current-patch -> 'Patch 7.55') */
  name?: string;
  /** Proxy cards (duplicates from other categories that never inflate counts) */
  proxies?: string[];
}

export interface CatalogConfig {
  /** Homepage Popular Picks: service ids in display order (1st = 1st spot) */
  popularPicks?: string[];
  /** Category display order = array order ('all' always stays first; unlisted
      categories keep their relative order, appended after the listed ones) */
  categories?: CatalogCategory[];
  /** Mounts split by the duty type they drop from — service ids per group;
      unlisted mounts trail under 'Other Mounts' */
  mountDutyGroups?: { extreme?: string[]; savage?: string[] };
  /** Service id -> 1 enabled / 0 disabled (unlisted = enabled) */
  services?: Record<string, 0 | 1>;
}

export interface PricingAddon {
  id: string;
  label: string;
  price: number;
  /** Greyed out and unclickable in the purchase box (e.g. AFK-heavyweight) */
  disabled?: boolean;
  /** Small print under the option (e.g. a requirement) */
  note?: string;
  /** Group-play add-on only selectable while this run-type option is active
      (e.g. Book Farm requires Farm); greyed out and auto-deselected otherwise */
  requiresOption?: string;
  /** Multiplies the method's base price when checked (shown as a percentage);
      other add-ons stay additive on top of the multiplied price */
  timesBase?: number;
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
  /** Homepage Popular Picks: service ids in display order (1st = 1st spot).
      Sourced from ffxiv-Catalog.json (`catalog.popularPicks`). */
  popularPicks?: string[];
  /** Card-catalog config: visibility, category order, mount duty-type groups */
  catalog?: CatalogConfig;
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
  /** Blue Mage leveling pricing (from ffxiv-Leveling): 1-80, no job select,
      with the All Spells add-on */
  bluLeveling?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    levelMin: number;
    levelMax: number;
    defaultStart: number;
    defaultEnd: number;
    priceTiers: { min: number; max: number; pricePerLevel: number }[];
    spellsAddon: PricingAddon;
    /** Masked Carnivale add-on (Blue Mage) */
    carnivaleAddon?: PricingAddon;
    /** Private Stream add-on price (Blue Mage) */
    streamPrice?: number;
    completion: string;
  };
  /** PvP Series boost pricing (from ffxiv-PvP): series levels 1-30, flat per
      level, with the Stream add-on */
  pvpSeries?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    levelMin: number;
    levelMax: number;
    defaultStart: number;
    defaultEnd: number;
    priceTiers: { min: number; max: number; pricePerLevel: number }[];
    streamAddon: PricingAddon;
    completion: string;
  };
  /** Crystalline Conflict rank boost pricing (from ffxiv-PvP): cumulative
      per-rank prices — an order costs (target rank − current rank) */
  ccRank?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    ranks: { id: string; label: string; price: number; image: string }[];
    streamAddon: PricingAddon;
    completion: string;
  };
  /** Wolf Marks farm pricing (from ffxiv-PvP): per-mark rate with amount
      input + slider, stream add-on and priority multiplier */
  wolfMarks?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    amountMin: number;
    amountMax: number;
    amountStep: number;
    defaultAmount: number;
    pricePerMark: number;
    streamPrice: number;
    completion: { normal: string; priority: string };
  };
  /** Mount pricing (from ffxiv-Mounts): guaranteed Dawntrail wings at fixed
      prices, and extreme-trial mount series whose combined mount unlocks
      once every mount in the series is owned */
  mounts?: {
    /** AFK Carry price multiplier applied to every mount service (10% more) */
    afkMultiplier?: number;
    wings?: Record<string, { price: number; trial: string; totem: string; completion: string }>;
    series?: Record<
      string,
      {
        bundlePrice: number;
        bundleLabel: string;
        mounts: PricingAddon[];
        addon?: PricingAddon;
        /** Card "From" price (the full-series bundle) */
        fromPrice?: number;
        completion: string;
      }
    >;
    savageMounts?: Record<
      string,
      {
        /** Piloted price — matches the duty's fight price in ffxiv-SavageRaids */
        price: number;
        /** AFK price — matches the duty's AFK fight price; afkMultiplier applies when omitted */
        afkPrice?: number;
        /** AFK not offered for this duty (e.g. Arcadion Heavyweight) */
        afkDisabled?: boolean;
        trial: string;
        completion: string;
      }
    >;
  };
  /** Extreme trial pricing (from ffxiv-Trials): per-trial piloted/AFK prices,
      level, lore and the mount service that drops there (for two-way links) */
  trials?: Record<
    string,
    {
      price: number;
      afkPrice?: number;
      level: number;
      mount: string | null;
      lore: string;
      completion: string;
    }
  >;
  /** Deep dungeon pricing (from ffxiv-DeepDungeons): per-completion prices for
      two methods — Solo Piloted (fixed price + checkbox add-ons) and Group
      Play (run-type pills, e.g. Speedrun / Farm). Services without `group`
      show no method toggle. */
  deepDungeons?: Record<
    string,
    {
      completion: string;
      solo: { price: number; addons: PricingAddon[] };
      group?: {
        options: PricingAddon[];
        addons?: PricingAddon[];
        /** Toggle shown under its own heading (e.g. a mount); multiplies the
            selected run-type price when active */
        multiplier?: { heading: string; label: string; times: number; note?: string };
      };
    }
  >;
  /** Field exploration rank/level ranges (from ffxiv-FieldExplorations) —
      same per-level model as job leveling */
  fieldLeveling?: Record<
    string,
    {
      levelMin: number;
      levelMax: number;
      defaultStart: number;
      defaultEnd: number;
      priceTiers: { min: number; max: number; pricePerLevel: number }[];
      completion: string;
    }
  >;
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

/** Per-category database files (without .json) loaded and merged at startup. */
const CATEGORY_FILES = [
  'ffxiv-UltimateRaids',
  'ffxiv-Gil',
  'ffxiv-SavageRaids',
  'ffxiv-Leveling',
  'ffxiv-PvP',
  'ffxiv-Mounts',
  'ffxiv-Trials',
  'ffxiv-DeepDungeons',
  'ffxiv-FieldExplorations',
  'ffxiv-Catalog',
];

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
    let purchaseBox = DEFAULT_PRICING.purchaseBox;
    let gil: PricingDb['gil'];
    let savageSeries: PricingDb['savageSeries'];
    let leveling: PricingDb['leveling'];
    let msqBoost: PricingDb['msqBoost'];
    let bluLeveling: PricingDb['bluLeveling'];
    let pvpSeries: PricingDb['pvpSeries'];
    let ccRank: PricingDb['ccRank'];
    let wolfMarks: PricingDb['wolfMarks'];
    let mounts: PricingDb['mounts'];
    let trials: PricingDb['trials'];
    let deepDungeons: PricingDb['deepDungeons'];
    let fieldLeveling: PricingDb['fieldLeveling'];
    let unlockAddon: PricingDb['unlockAddon'];
    let catalog: PricingDb['catalog'];
    await Promise.all(
      CATEGORY_FILES.map(async (file) => {
        try {
          const r = await fetch(`${base}db/${file}.json`, { cache: 'no-store' });
          if (!r.ok) return;
          const cat = (await r.json()) as Pick<
            PricingDb,
            'methodPrices' | 'addonPrices' | 'serviceAddons' | 'purchaseBox' | 'gil' | 'savageSeries' | 'leveling' | 'msqBoost' | 'bluLeveling' | 'pvpSeries' | 'ccRank' | 'wolfMarks' | 'mounts' | 'trials' | 'deepDungeons' | 'fieldLeveling' | 'unlockAddon' | 'catalog'
          >;
          Object.assign(methodPrices, cat.methodPrices);
          Object.assign(addonPrices, cat.addonPrices);
          Object.assign(serviceAddons, cat.serviceAddons);
          if (cat.purchaseBox) purchaseBox = { ...purchaseBox, ...cat.purchaseBox };
          if (cat.gil) gil = cat.gil;
          if (cat.savageSeries) savageSeries = { ...savageSeries, ...cat.savageSeries };
          if (cat.leveling) leveling = cat.leveling;
          if (cat.msqBoost) msqBoost = cat.msqBoost;
          if (cat.bluLeveling) bluLeveling = cat.bluLeveling;
          if (cat.pvpSeries) pvpSeries = cat.pvpSeries;
          if (cat.ccRank) ccRank = cat.ccRank;
          if (cat.wolfMarks) wolfMarks = cat.wolfMarks;
          if (cat.mounts) mounts = { ...mounts, ...cat.mounts };
          if (cat.trials) trials = { ...trials, ...cat.trials };
          if (cat.deepDungeons) deepDungeons = { ...deepDungeons, ...cat.deepDungeons };
          if (cat.fieldLeveling) fieldLeveling = { ...fieldLeveling, ...cat.fieldLeveling };
          if (cat.unlockAddon) unlockAddon = cat.unlockAddon;
          if (cat.catalog) catalog = cat.catalog;
        } catch {
          /* broken category file — skip it */
        }
      }),
    );

    return {
      currency: { ...DEFAULT_PRICING.currency, ...db.currency },
      popularPicks: catalog?.popularPicks ?? db.popularPicks,
      catalog,
      unlockAddon,
      purchaseBox,
      methodPrices,
      addonPrices,
      serviceAddons,
      gil,
      savageSeries,
      leveling,
      msqBoost,
      bluLeveling,
      pvpSeries,
      ccRank,
      wolfMarks,
      mounts,
      trials,
      deepDungeons,
      fieldLeveling,
      servicePrices: db.servicePrices ?? {},
    };
  } catch {
    return DEFAULT_PRICING;
  }
}
