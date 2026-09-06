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

import { mergeCategoryFiles } from '../lib/pricing/engine/shared.ts';

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
  mountDutyGroups?: { extreme?: string[]; savage?: string[]; vc?: string[] };
  /** Extreme trials grouped into sections — key = section title (object order
      = display order), ids = trials newest to oldest; series bundles are
      proxies from the Mounts category; unlisted trials trail under 'Other
      Trials' */
  trialExpansionGroups?: Record<string, string[]>;
  /** Variant & Criterion dungeons grouped into sections — key = section title
      (object order = display order), ids = dungeons newest to oldest;
      unlisted dungeons trail under 'Other Dungeons' */
  dungeonGroups?: Record<string, string[]>;
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
  /** Group-play add-on only shown (and selectable) while this run-type option
      is active (e.g. Book Farm requires Farm); hidden and auto-deselected otherwise */
  requiresOption?: string;
  /** When checked, this add-on's price replaces the per-run core price (and is
      multiplied by Amount of Runs) instead of being added on top */
  perRun?: boolean;
  /** Multiplies the method's base price when checked (shown as a percentage);
      other add-ons stay additive on top of the multiplied price */
  timesBase?: number;
  /** Pins Amount of Runs to this count while checked (e.g. Mount All Paths) */
  forcedRuns?: number;
  /** Drawer add-on priced per run — multiplied by Amount of Runs instead of
      added once (e.g. 40 Offerings on multi-run clears) */
  timesRuns?: boolean;
  /** Piloted-method price when it differs from `price` (e.g. criterion mounts) */
  pilotedPrice?: number;
  /** Second-method (AFK Carry) price when it differs from `price` */
  afkPrice?: number;
  /** When the option is checked, show a dropdown of these choices
      (e.g. job or armour set) */
  selectOptions?: {
    label: string;
    options?: string[];
    /** Render the dropdown as grouped job options (dividers + blue parens)
        trimmed to this expansion's roster instead of flat `options` */
    jobEra?: 'arr' | 'hw' | 'stb' | 'shb' | 'ew' | 'dt';
  };
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
      Omit `afk` for piloted-only services — the AFK button is then hidden.
      `afkLabel` renames the second method (e.g. 'Group Play'); `groupFirst`
      lists it before Piloted and preselects it. */
  methodPrices?: Record<string, { piloted: number; afk?: number; afkLabel?: string; groupFirst?: boolean }>;
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
    /** Gear dropdown in Additional Options (shared purchaseBox.gearOptions) */
    gearOptions?: boolean;
    /** Per-job minimum levels (e.g. Viper starts at 80) — drives the slider
        minimum when that job is selected */
    jobMinLevels?: Record<string, number>;
    completion: string;
  };
  /** Crafter & Gatherer leveling pricing (from ffxiv-Leveling) — same
      per-level model as combat job leveling */
  crafterLeveling?: {
    serviceId: string;
    fromPrice?: number;
    levelMin: number;
    levelMax: number;
    defaultStart: number;
    defaultEnd: number;
    priceTiers: { min: number; max: number; pricePerLevel: number }[];
    addon?: PricingAddon;
    gearOptions?: boolean;
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
    completion: string;
  };
  /** PvP Series boost pricing (from ffxiv-PvP): series levels 1-30, flat per
      level */
  pvpSeries?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    levelMin: number;
    levelMax: number;
    defaultStart: number;
    defaultEnd: number;
    priceTiers: { min: number; max: number; pricePerLevel: number }[];
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
      input + slider and priority multiplier */
  wolfMarks?: {
    serviceId: string;
    /** Card "From" price */
    fromPrice?: number;
    amountMin: number;
    amountMax: number;
    amountStep: number;
    defaultAmount: number;
    pricePerMark: number;
    completion: { normal: string; priority: string };
  };
  /** Mount pricing (from ffxiv-Mounts): guaranteed Dawntrail wings at fixed
      prices, and extreme-trial mount series whose combined mount unlocks
      once every mount in the series is owned */
  mounts?: {
    /** AFK Carry price multiplier applied to every mount service (10% more) */
    afkMultiplier?: number;
    wings?: Record<string, { price: number; /** AFK Carry price when it differs from price × afkMultiplier */ afkPrice?: number; trial: string; totem: string; completion: string }>;
    series?: Record<
      string,
      {
        bundlePrice: number;
        /** AFK Carry bundle price when it differs from bundlePrice × afkMultiplier */
        afkBundlePrice?: number;
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
        /** Label for the second method instead of 'AFK Carry' (e.g. 'Group Play') */
        afkLabel?: string;
        /** AFK not offered for this duty (e.g. Arcadion Heavyweight) */
        afkDisabled?: boolean;
        /** Piloted-only mount — no method toggle, static Piloted pill */
        pilotedOnly?: boolean;
        /** Show the second method (e.g. Group Play) before Piloted */
        groupFirst?: boolean;
        /** Checkbox add-ons rendered below the data center (e.g. Normal Mode) */
        addons?: PricingAddon[];
        trial: string;
        completion: string;
      }
    >;
  };
  /** Extreme trial pricing (from ffxiv-Trials): per-trial AFK Carry prices,
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
  /** Extreme trial bundle pricing (from ffxiv-Trials): a checklist of the
      expansion's trials with per-trial AFK prices and a bundle price when
      all are checked. The Mount Guaranteed option forces 1 run + all trials
      and charges the tied series mount's cost (afkBundlePrice, falling back
      to bundlePrice × afkMultiplier from ffxiv-Mounts, looked up via
      mountServiceId). */
  trialBundles?: Record<
    string,
    {
      completion: string;
      bundlePrice: number;
      bundleLabel: string;
      mountServiceId: string;
      /** Series mount name shown on the Mount Guaranteed option */
      mountLabel: string;
      trials: PricingAddon[];
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
      /** Solo panel heading (default 'Additional Options') */
      soloHeading?: string;
      /** Solo method pill label (default 'Solo Piloted') */
      soloLabel?: string;
      /** Any picked solo add-on pins Amount of Runs to 1 and greys it out
          (one-off rewards like mounts) */
      disableRunsOnAddons?: boolean;
      /** Move Private Stream into the solo panel instead of the drawer
          (e.g. when Group Play shouldn't offer it) */
      streamInSolo?: boolean;
      /** Private Stream stays in the drawer but only for Piloted — hidden
          and reset while Group Play is selected */
      streamPilotedOnly?: boolean;
      /** Piloted-only services: show the Amount of Runs controls (multiplies
          the solo core per run, like Group Play) */
      runs?: boolean;
      solo: { price: number; addons: PricingAddon[] };
      group?: {
        options: PricingAddon[];
        addons?: PricingAddon[];
        /** Heading shown above the group add-ons list */
        addonsHeading?: string;
        /** Toggle shown under its own heading (e.g. a mount); multiplies the
            selected run-type price when active */
        multiplier?: { heading: string; label: string; times: number; note?: string };
      };
      /** Deep Dungeon Unlock add-on in the Additional Options block */
      unlock?: PricingAddon;
      /** Extra flat add-on rows in the Additional Options drawer (e.g. offerings) */
      drawerAddons?: PricingAddon[];
    }
  >;
  /** Variant & Criterion dungeons (from ffxiv-Criterion): base = Normal
      (or variant) clear; `savagePrice` adds the Savage difficulty toggle;
      add-ons are Normal-only */
  criterion?: Record<
    string,
    {
      /** Group Play price per run */
      price: number;
      /** Piloted price per run when it differs from Group Play */
      pilotedPrice?: number;
      /** Second-difficulty per-run price (flat both methods); when omitted the
          second difficulty keeps the normal method-aware price */
      savagePrice?: number;
      /** Second-difficulty per-run prices when they differ per method
          (e.g. Merchant's Tale Advanced) — take precedence over savagePrice */
      advancedPrice?: number;
      advancedPilotedPrice?: number;
      /** Custom labels for the difficulty toggle (default Normal / Savage) */
      difficulty?: { normal: string; advanced: string };
      /** Single-method service — static Piloted pill instead of the method toggle */
      pilotedOnly?: boolean;
      /** Hide the Private Stream row in Additional Options (variant dungeons) */
      hideStream?: boolean;
      /** Duty-unlock add-on row in the Additional Options drawer */
      unlock?: PricingAddon;
      completion: string;
      /** Add-ons offered on the first (Normal) difficulty only */
      addons?: PricingAddon[];
      /** Add-ons offered on the second (Savage/Advanced) difficulty only */
      advancedAddons?: PricingAddon[];
    }
  >;
  /** Relic weapons/armour (from ffxiv-Relics): per-step pricing with a
      chained step selection; `select` overrides the default grouped Job
      dropdown (e.g. Eurekan armour types) */
  relics?: Record<
    string,
    {
      completion: string;
      /** Card "From" price (cheapest step) */
      fromPrice?: number;
      steps: { label: string; price: number }[];
      /** Bundle option: pins all steps and overrides the total */
      complete?: { label: string; price: number };
      select?: { label: string; options?: string[] };
      /** Job dropdown trimmed to this expansion's roster (relic weapons only
          exist for jobs up to their series' expansion) */
      jobsUpTo?: 'arr' | 'hw' | 'stb' | 'shb' | 'ew' | 'dt';
      /** DoH/DoL job groups instead of combat jobs (Cosmic Exploration) */
      crafterJobs?: boolean;
      /** Select field label instead of 'Weapon Type' (e.g. 'Tool Type') */
      selectLabel?: string;
      /** Gear dropdown in the Additional Options drawer */
      gearOptions?: boolean;
      /** Mount checkmark row below the steps (additive flat price) */
      mount?: { label: string; price: number };
      /** Questline-unlock add-on row in the Additional Options drawer */
      unlock?: PricingAddon;
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
      /** Start-input label instead of 'Your level' (e.g. 'Your rank') */
      startLabel?: string;
      /** End-input label instead of 'Desired level' (e.g. 'Desired Knowledge') */
      endLabel?: string;
      /** Card "From" price override (defaults to the default range's cost) */
      fromPrice?: number;
      /** Main add-on in Additional Options */
      addon?: PricingAddon;
      /** Extra add-on rows in Additional Options */
      addons?: PricingAddon[];
      /** Labeled option groups between Data Center and Additional Options;
          options may use `requiresOption` to stay greyed until picked */
      optionGroups?: { heading: string; options: PricingAddon[] }[];
      /** Phantom-job style select: per-job level caps drive the slider max;
          optional per-job price tiers override the shared ones */
      jobs?: { label: string; max: number; priceTiers?: { min: number; max: number; pricePerLevel: number }[] }[];
      /** Preselected job label (no error state) */
      defaultJob?: string;
      /** Checkbox-gated Phantom Job leveling section: the top range becomes
          the base service levels, the job select + job level range hide under
          this checkmark option */
      phantomToggle?: { label: string };
      /** Extra checkmark above the Phantom Job leveling one: levels every
          phantom job to its cap; mutually exclusive with phantomToggle,
          priced as the sum of every job's full leveling price */
      phantomAll?: { label: string };
      completion: string;
    }
  >;
  /** Service id -> addon id -> per-service addon price override. A `{ ref }`
      instead of a number pulls the price from a savage-series fight
      ('seriesId:tier:fightId') — resolved per selected boost method (the
      AFK fight price when offered, the piloted price otherwise), so editing
      the fight reprices the add-on too (e.g. FRU's M4S completion). */
  addonPrices?: Record<string, Record<string, number | { ref: string }>>;
  /** Service id -> per-method addon lists that REPLACE the global 'unlock'
      addon (stream/priority stay). Used by bundles whose unlocks differ per
      method and differ from the single duty unlock. */
  serviceAddons?: Record<string, { piloted?: PricingAddon[]; afk?: PricingAddon[] }>;
  /** Service id -> flat base price override (legacy; prefer methodPrices) */
  servicePrices: Record<string, number>;
  /** Allied Society reputation boosting (from ffxiv-FieldExplorations):
      per-rank price, faction select with per-faction rank caps */
  reputation?: Record<
    string,
    {
      completion: string;
      fromPrice?: number;
      rankMin: number;
      rankMax: number;
      defaultStart: number;
      defaultEnd: number;
      pricePerRank: number;
      /** Rank names by rank number (1-based index into the array) */
      rankNames?: string[];
      /** Show rank names without the numeric prefix (e.g. 'Satisfaction 3') */
      rankNameOnly?: boolean;
      /** Select label instead of 'Allied Society' (e.g. 'Custom Delivery NPC') */
      factionLabel?: string;
      factions: { id: string; label: string; maxRank: number }[];
      /** Full-expansion allied packages; picking any greys out the
          faction/rank selection */
      alliedPackages?: { id: string; label: string; price: number }[];
      /** Section heading for alliedPackages (default 'Allied Societies Rank') */
      packagesLabel?: string;
      /** Society unlock add-on in the drawer; with any package picked, the
          base price is replaced by arrPrice (ARR) or otherPrice per package */
      unlock?: { label: string; price: number; arrPrice: number; otherPrice: number };
    }
  >;
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

/** Per-category database files (without .json) loaded and merged at startup.
    Exported: the orders worker fetches the same public files for its
    authoritative recompute (worker/orders-proxy.js imports this list). */
export const CATEGORY_FILES = [
  'ffxiv-UltimateRaids',
  'ffxiv-Gil',
  'ffxiv-SavageRaids',
  'ffxiv-Leveling',
  'ffxiv-PvP',
  'ffxiv-Mounts',
  'ffxiv-Trials',
  'ffxiv-DeepDungeons',
  'ffxiv-AllianceRaids',
  'ffxiv-Criterion',
  'ffxiv-Relics',
  'ffxiv-Reputation',
  'ffxiv-FieldExplorations',
  'ffxiv-Catalog',
];

/** Fetch the pricing database (global + category files), falling back to the
    bundled defaults. Broken or missing category files are skipped. The merge
    itself lives in the pricing engine so the orders worker merges the same
    files byte-for-byte identically. */
export async function loadPricing(): Promise<PricingDb> {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}db/pricing.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const db = (await res.json()) as PricingDb;
    const cats = await Promise.all(
      CATEGORY_FILES.map(async (file) => {
        try {
          const r = await fetch(`${base}db/${file}.json`, { cache: 'no-store' });
          if (!r.ok) return null;
          return (await r.json()) as Partial<PricingDb>;
        } catch {
          /* broken category file — skip it */
          return null;
        }
      }),
    );
    return mergeCategoryFiles(db, cats);
  } catch {
    return DEFAULT_PRICING;
  }
}
