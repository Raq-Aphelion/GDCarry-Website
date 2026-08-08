/* Trial bundle family — the TrialBundlePurchaseBox formula, moved verbatim
   from src/components/TrialBundlePurchaseBox.tsx. Covers extreme-trial
   expansion bundles (db.trialBundles): a checklist of trials whose sum
   (or bundlePrice when all are checked) multiplies by runs, plus the Mount
   Guaranteed option that reprices to the tied series mount's cost.
   Prices MUST stay identical to the pre-extraction inline code — the
   golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.) */
export type TrialBundleConfig = {
  family: 'trialbundle';
  method: string; // 'piloted' | 'afk' (id, not label)
  guaranteed: boolean;
  checked: string[]; // trial ids from the bundle's trials list
  runs: number;
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a trial-bundle config. Returns null on malformed
    input (unknown service, guaranteed without a resolvable series mount) —
    callers fail open. Non-guaranteed: qty is the run count and price is the
    per-run selection total. Guaranteed: one-off line at the mount's price
    (qtyLocked, qty 1). lineTotal(result) yields the displayed total. */
export const computeTrialBundleLine = (
  db: PricingDb,
  serviceId: string,
  cfg: TrialBundleConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.trialBundles?.[serviceId];
  if (!c) return null;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const streamPrice = 10;
  if (cfg.guaranteed) {
    // Mount Guaranteed price = the combined mount's cost for this method
    // (explicit afkBundlePrice, falling back to bundlePrice × afkMultiplier)
    const mountSeries = db.mounts?.series?.[c.mountServiceId];
    if (!mountSeries) return null;
    const mountPrice =
      cfg.method === 'afk'
        ? (mountSeries.afkBundlePrice ?? Number((mountSeries.bundlePrice * afkMultiplier).toFixed(2)))
        : mountSeries.bundlePrice;
    return {
      price: mountPrice,
      qty: 1,
      qtyLocked: true,
      flat: cfg.stream ? streamPrice : undefined,
    };
  }
  const priceOf = (t: { price: number; afkPrice?: number }) =>
    cfg.method === 'afk' ? (t.afkPrice ?? t.price) : t.price;
  const allChecked = cfg.checked.length === c.trials.length;
  const afkBundleTotal = c.trials.reduce((s, t) => s + (t.afkPrice ?? t.price), 0);
  const selectionTotal = allChecked
    ? cfg.method === 'afk'
      ? afkBundleTotal
      : c.bundlePrice
    : cfg.checked.reduce((s, id) => {
        const t = c.trials.find((x) => x.id === id);
        return s + (t ? priceOf(t) : 0);
      }, 0);
  return {
    price: selectionTotal, // per run
    qty: cfg.runs,
    flat: cfg.stream ? streamPrice : undefined,
    multiplier: cfg.priority ? priorityMultiplier : undefined,
  };
};
