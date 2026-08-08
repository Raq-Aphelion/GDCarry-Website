/* Trial family — the TrialPurchaseBox formula, moved verbatim from
   src/components/TrialPurchaseBox.tsx. Covers single extreme trials
   (db.trials): per-method prices, runs, stream/priority add-ons, and the
   Guaranteed Mount option that reprices to the linked mount's cost.
   Prices MUST stay identical to the pre-extraction inline code — the
   golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.) */
export type TrialConfig = {
  family: 'trial';
  method: string; // 'piloted' | 'afk' (id, not label)
  runs: number;
  guaranteed: boolean;
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a trial config. Returns null on malformed input
    (unknown service, guaranteed without a resolvable linked mount) —
    callers fail open. Non-guaranteed: qty is the run count and price is per
    run. Guaranteed: one-off line at the mount's price (qtyLocked, qty 1).
    lineTotal(result) yields the displayed total. */
export const computeTrialLine = (
  db: PricingDb,
  serviceId: string,
  cfg: TrialConfig,
): (LinePrice & { qty: number }) | null => {
  const t = db.trials?.[serviceId];
  if (!t) return null;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const streamPrice = 10;
  const methodBase = cfg.method === 'afk' ? (t.afkPrice ?? t.price) : t.price;
  if (cfg.guaranteed) {
    // Guaranteed Mount — the trial's linked mount service (wing or savage
    // mount), priced per method (explicit afkPrice, falling back to
    // ×afkMultiplier)
    const mountWing = t.mount ? db.mounts?.wings?.[t.mount] : undefined;
    const mountSavage = t.mount ? db.mounts?.savageMounts?.[t.mount] : undefined;
    if (!mountWing && !mountSavage) return null;
    const mountPrice = mountWing
      ? cfg.method === 'afk'
        ? (mountWing.afkPrice ?? Number((mountWing.price * afkMultiplier).toFixed(2)))
        : mountWing.price
      : mountSavage
        ? cfg.method === 'afk'
          ? (mountSavage.afkPrice ?? Number((mountSavage.price * afkMultiplier).toFixed(2)))
          : mountSavage.price
        : 0;
    return {
      price: mountPrice,
      qty: 1,
      qtyLocked: true,
      flat: cfg.stream ? streamPrice : undefined,
    };
  }
  return {
    price: methodBase, // per run
    qty: cfg.runs,
    flat: cfg.stream ? streamPrice : undefined,
    multiplier: cfg.priority ? priorityMultiplier : undefined,
  };
};
