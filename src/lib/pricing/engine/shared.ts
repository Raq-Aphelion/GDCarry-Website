/* Shared pricing primitives — the single source of truth for both the site
   (purchase boxes, cart, cards) and the orders worker (authoritative
   recompute). PURE: no React, no browser APIs, no env access, so the worker
   can bundle this verbatim. Family formulas live in sibling files; only
   cross-family mechanics are here. */
import { DEFAULT_PRICING, type PricingDb } from '../../../data/pricing.ts';

/** Anything lineTotal needs — CartItem satisfies this structurally. */
export interface LineParts {
  price: number;
  qty: number;
  flat?: number;
  multiplier?: number;
  logsPercent?: number;
}

/** Full price of a cart line. Multiplier (Priority) and logsPercent (parse
    tier) apply only to the per-run price × runs; flat extras (gear, logs flat
    fees, add-ons) are added afterwards, unaffected. */
export const lineTotal = (l: LineParts): number =>
  l.price * l.qty * (l.multiplier ?? 1) * (1 + (l.logsPercent ?? 0) / 100) + (l.flat ?? 0);

/** What a family compute function returns: the exact fields a purchase box
    passes to addItem (minus display-only concerns). lineTotal(parts, qty)
    then yields the same number the box displays today. */
export interface LinePrice {
  /** Per-unit price (per run / per million gil), or the full total for
      one-off lines (qtyLocked, qty 1) */
  price: number;
  flat?: number;
  multiplier?: number;
  logsPercent?: number;
  qtyLocked?: boolean;
}

/** Minimum ("From") EUR price for a service — the same number service cards
    display. Port of the former PricingContext.priceOf; null when the service
    is unknown to the catalog (callers fail open). */
export const fromPrice = (db: PricingDb, serviceId: string, fallback?: number): number | null => {
  const ss = db.savageSeries?.[serviceId];
  if (ss) return Object.values(ss.piloted?.fights ?? {}).flat()[0]?.price ?? fallback ?? null;
  if (serviceId === db.leveling?.serviceId && db.leveling.fromPrice != null) return db.leveling.fromPrice;
  if (serviceId === db.crafterLeveling?.serviceId && db.crafterLeveling.fromPrice != null)
    return db.crafterLeveling.fromPrice;
  if (serviceId === db.bluLeveling?.serviceId && db.bluLeveling.fromPrice != null) return db.bluLeveling.fromPrice;
  if (serviceId === db.pvpSeries?.serviceId && db.pvpSeries.fromPrice != null) return db.pvpSeries.fromPrice;
  if (serviceId === db.ccRank?.serviceId && db.ccRank.fromPrice != null) return db.ccRank.fromPrice;
  if (serviceId === db.wolfMarks?.serviceId && db.wolfMarks.fromPrice != null) return db.wolfMarks.fromPrice;
  const wing = db.mounts?.wings?.[serviceId];
  if (wing) return wing.price;
  const savageMount = db.mounts?.savageMounts?.[serviceId];
  if (savageMount) return Math.min(savageMount.price, savageMount.afkPrice ?? Infinity);
  const trial = db.trials?.[serviceId];
  if (trial) return trial.price;
  const tb = db.trialBundles?.[serviceId];
  if (tb) return tb.bundlePrice;
  const dd = db.deepDungeons?.[serviceId];
  if (dd) return Math.min(dd.solo.price, ...(dd.group?.options.map((o) => o.price) ?? []));
  const cr = db.criterion?.[serviceId];
  if (cr) return cr.price;
  const rl = db.relics?.[serviceId];
  if (rl) return rl.fromPrice ?? rl.steps[0]?.price ?? 0;
  const fl = db.fieldLeveling?.[serviceId];
  if (fl) return fl.fromPrice ?? (fl.defaultEnd - fl.defaultStart) * (fl.priceTiers[0]?.pricePerLevel ?? 0);
  const rep = db.reputation?.[serviceId];
  if (rep) return rep.fromPrice ?? rep.pricePerRank;
  const mountSeries = db.mounts?.series?.[serviceId];
  if (mountSeries) return mountSeries.fromPrice ?? mountSeries.mounts[0]?.price ?? fallback ?? null;
  if (serviceId === db.msqBoost?.serviceId && db.msqBoost.expansions?.[0] != null)
    return db.msqBoost.expansions[0].price;
  const mp = db.methodPrices?.[serviceId];
  if (mp) return Math.min(mp.piloted, mp.afk ?? Infinity);
  return db.servicePrices[serviceId] ?? fallback ?? null;
};

/** The merge half of loadPricing() (src/data/pricing.ts): combines the global
    pricing.json with the per-category files into one PricingDb. The site
    fetches the files, the worker fetches the same public JSONs — both merge
    through this function so they can never disagree on structure. */
export const mergeCategoryFiles = (
  base: Partial<PricingDb> | null,
  cats: (Partial<PricingDb> | null)[],
): PricingDb => {
  const methodPrices: NonNullable<PricingDb['methodPrices']> = {};
  const addonPrices: NonNullable<PricingDb['addonPrices']> = {};
  const serviceAddons: NonNullable<PricingDb['serviceAddons']> = {};
  let purchaseBox = DEFAULT_PRICING.purchaseBox;
  const out: Partial<PricingDb> = {};
  for (const cat of cats) {
    if (!cat) continue;
    Object.assign(methodPrices, cat.methodPrices);
    Object.assign(addonPrices, cat.addonPrices);
    Object.assign(serviceAddons, cat.serviceAddons);
    if (cat.purchaseBox) purchaseBox = { ...purchaseBox, ...cat.purchaseBox };
    if (cat.gil) out.gil = cat.gil;
    if (cat.savageSeries) out.savageSeries = { ...out.savageSeries, ...cat.savageSeries };
    if (cat.leveling) out.leveling = cat.leveling;
    if (cat.crafterLeveling) out.crafterLeveling = cat.crafterLeveling;
    if (cat.msqBoost) out.msqBoost = cat.msqBoost;
    if (cat.bluLeveling) out.bluLeveling = cat.bluLeveling;
    if (cat.pvpSeries) out.pvpSeries = cat.pvpSeries;
    if (cat.ccRank) out.ccRank = cat.ccRank;
    if (cat.wolfMarks) out.wolfMarks = cat.wolfMarks;
    if (cat.mounts) {
      // Group-aware merge: several category files can contribute entries to
      // the same group — a shallow spread would replace the whole group
      out.mounts = {
        ...out.mounts,
        ...cat.mounts,
        wings: { ...out.mounts?.wings, ...cat.mounts.wings },
        series: { ...out.mounts?.series, ...cat.mounts.series },
        savageMounts: { ...out.mounts?.savageMounts, ...cat.mounts.savageMounts },
      };
    }
    if (cat.trials) out.trials = { ...out.trials, ...cat.trials };
    if (cat.trialBundles) out.trialBundles = { ...out.trialBundles, ...cat.trialBundles };
    if (cat.deepDungeons) out.deepDungeons = { ...out.deepDungeons, ...cat.deepDungeons };
    if (cat.criterion) out.criterion = { ...out.criterion, ...cat.criterion };
    if (cat.relics) out.relics = { ...out.relics, ...cat.relics };
    if (cat.fieldLeveling) out.fieldLeveling = { ...out.fieldLeveling, ...cat.fieldLeveling };
    if (cat.reputation) out.reputation = { ...out.reputation, ...cat.reputation };
    if (cat.unlockAddon) out.unlockAddon = cat.unlockAddon;
    if (cat.catalog) out.catalog = cat.catalog;
  }
  return {
    currency: { ...DEFAULT_PRICING.currency, ...base?.currency },
    popularPicks: out.catalog?.popularPicks ?? base?.popularPicks,
    catalog: out.catalog,
    unlockAddon: out.unlockAddon,
    purchaseBox,
    methodPrices,
    addonPrices,
    serviceAddons,
    gil: out.gil,
    savageSeries: out.savageSeries,
    leveling: out.leveling,
    crafterLeveling: out.crafterLeveling,
    msqBoost: out.msqBoost,
    bluLeveling: out.bluLeveling,
    pvpSeries: out.pvpSeries,
    ccRank: out.ccRank,
    wolfMarks: out.wolfMarks,
    mounts: out.mounts,
    trials: out.trials,
    trialBundles: out.trialBundles,
    deepDungeons: out.deepDungeons,
    criterion: out.criterion,
    relics: out.relics,
    fieldLeveling: out.fieldLeveling,
    reputation: out.reputation,
    servicePrices: base?.servicePrices ?? {},
  };
};
