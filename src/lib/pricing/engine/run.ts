/* Run-based family — the generic PurchaseBox formula, moved verbatim from
   src/components/PurchaseBox.tsx. Covers every service that uses the generic
   box (ultimates, savage/alliance raid fights, and any service without a
   dedicated box). Prices MUST stay identical to the pre-extraction inline
   code — the golden test pins this. */
import type { PricingAddon, PricingDb } from '../../../data/pricing.ts';
import { fromPrice, type LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Indices refer to the
    db.purchaseBox gear/log option arrays. (A `type`, not an `interface`, so
    it stays assignable to the OrderConfig index signature.) */
export type RunConfig = {
  family: 'run';
  method: string; // 'piloted' | 'afk' (id, not label)
  runs: number;
  gearIdx: number;
  logIdx: number;
  addons: string[];
};

export interface ResolvedMethod {
  id: string;
  label: string;
  price: number;
}

/** Boost methods for a service — the box renders these as buttons and the
    compute picks one. Missing `afk` in the DB means piloted-only. */
export const resolveMethods = (
  db: PricingDb,
  serviceId: string,
  staticBase?: number,
): ResolvedMethod[] | null => {
  const basePrice = fromPrice(db, serviceId, staticBase);
  if (basePrice == null) return null;
  const cfg = db.purchaseBox;
  const methodPrices = db.methodPrices?.[serviceId];
  const list: ResolvedMethod[] = [
    { id: 'piloted', label: 'Piloted', price: methodPrices?.piloted ?? basePrice },
  ];
  const afkPrice = methodPrices ? methodPrices.afk : Math.max(basePrice - cfg.afkDiscount, 0);
  if (afkPrice != null)
    list.push({ id: 'afk', label: methodPrices?.afkLabel ?? 'AFK Carry', price: afkPrice });
  if (methodPrices?.groupFirst) list.reverse();
  return list;
};

/** The selectable add-on list for a service+method: global purchaseBox addons
    (plus the duty-unlock addon from the UltimateRaids category file), with
    per-service bundle addons swapped in for 'unlock' where defined. */
export const resolveAddonList = (db: PricingDb, serviceId: string, isAfk: boolean): PricingAddon[] => {
  const cfg = db.purchaseBox;
  const ADDONS = [...(db.unlockAddon ? [db.unlockAddon] : []), ...cfg.addons];
  const bundleAddons = db.serviceAddons?.[serviceId]?.[isAfk ? 'afk' : 'piloted'];
  return bundleAddons
    ? ADDONS.flatMap((a) => (a.id === 'unlock' ? bundleAddons : [a]))
    : ADDONS;
};

/** Per-service addon price overrides from the DB. A `{ ref: 'series:tier:
    fight' }` override pulls the savage fight's price for the active method —
    AFK fight price when offered, piloted otherwise. */
export const addonPriceOf = (
  db: PricingDb,
  serviceId: string,
  isAfk: boolean,
  a: { id: string; price: number },
): number => {
  const override = db.addonPrices?.[serviceId]?.[a.id];
  if (override == null) return a.price;
  if (typeof override === 'number') return override;
  const [seriesId, tier, fightId] = override.ref.split(':');
  const series = db.savageSeries?.[seriesId];
  const pilotedFight = series?.piloted?.fights?.[tier]?.find((f) => f.id === fightId);
  const afkFight = series?.afk?.fights?.[tier]?.find((f) => f.id === fightId);
  if (isAfk && afkFight && !afkFight.disabled) return afkFight.price;
  return pilotedFight?.price ?? afkFight?.price ?? a.price;
};

/** Full line pricing for a run-based config. Returns null on malformed input
    (unknown service, out-of-range indices) — callers fail open. The qty is
    the run count; lineTotal(result) yields the displayed total. */
export const computeRunLine = (
  db: PricingDb,
  serviceId: string,
  cfg: RunConfig,
  staticBase?: number,
): (LinePrice & { qty: number }) | null => {
  const methods = resolveMethods(db, serviceId, staticBase);
  if (!methods) return null;
  const pb = db.purchaseBox;
  const GEAR_OPTIONS = pb.gearOptions;
  const LOG_OPTIONS = pb.logOptions;
  const activeMethod = methods.find((m) => m.id === cfg.method) ?? methods[0];
  // AFK Carry has no FFXIV Logs option and no Private Stream add-on — both
  // are excluded from the UI and from every calculation
  const isAfk = activeMethod.id === 'afk';
  const effLogIdx = isAfk ? 0 : cfg.logIdx;
  const gear = GEAR_OPTIONS[cfg.gearIdx];
  const log = LOG_OPTIONS[effLogIdx];
  if (!gear || !log) return null;
  const ADDON_LIST = resolveAddonList(db, serviceId, isAfk);
  const effectiveAddons = isAfk ? cfg.addons.filter((a) => a !== 'stream') : cfg.addons;
  const priority = effectiveAddons.includes('priority');
  const logsPercent = log.percent ?? 0;
  const flatAddons = ADDON_LIST.filter((a) => a.id !== 'priority' && effectiveAddons.includes(a.id)).reduce(
    (s, a) => s + addonPriceOf(db, serviceId, isAfk, a),
    0,
  );
  return {
    price: activeMethod.price, // per run
    qty: cfg.runs,
    flat: gear.price + log.price + flatAddons,
    multiplier: priority ? pb.priorityMultiplier : undefined,
    logsPercent: logsPercent > 0 ? logsPercent : undefined,
  };
};
