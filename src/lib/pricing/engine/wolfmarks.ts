/* Wolf Marks family — the WolfMarksPurchaseBox formula, moved verbatim from
   src/components/WolfMarksPurchaseBox.tsx. Amount priced per mark, times the
   Priority multiplier. Prices MUST stay identical to the pre-extraction
   inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.) */
export type WolfMarksConfig = {
  family: 'wolfmarks';
  /** Amount of Wolf Marks (db.wolfMarks.amountMin..amountMax) */
  amount: number;
  priority: boolean;
};

/** Full line pricing for a Wolf Marks config. One-off line: the whole total
    is baked into price with qty 1 and qtyLocked. Returns null on malformed
    input (missing db block, non-finite amount) — callers fail open. */
export const computeWolfMarksLine = (
  db: PricingDb,
  serviceId: string,
  cfg: WolfMarksConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.wolfMarks;
  if (!c || c.serviceId !== serviceId) return null;
  if (typeof cfg.amount !== 'number' || !Number.isFinite(cfg.amount)) return null;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const base = cfg.amount * (c.pricePerMark ?? 0);
  const total = base * (cfg.priority ? priorityMultiplier : 1);
  return { price: total, qty: 1, qtyLocked: true };
};
