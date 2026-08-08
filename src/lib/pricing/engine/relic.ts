/* Relic family — RelicPurchaseBox's total formula, moved verbatim from
   src/components/RelicPurchaseBox.tsx. Covers relic weapons/armour from the
   ffxiv-Relics db category: chained per-step pricing with a complete-bundle
   override when every step is selected, plus flat mount/unlock/gear extras.
   One-off line: the whole total is baked into price (qty 1, qtyLocked).
   Prices MUST stay identical to the pre-extraction inline code — the golden
   test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import { type LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Step indices refer to
    the relic block's steps array, gearIdx to the db.purchaseBox gear options.
    (A `type`, not an `interface`, so it stays assignable to the OrderConfig
    index signature.) */
export type RelicConfig = {
  family: 'relic';
  /** Selected step indices (the UI keeps them one contiguous range) */
  steps: number[];
  mount: boolean;
  gearIdx: number;
  priority: boolean;
  unlock: boolean;
};

/** Full line pricing for a relic config. Returns null on malformed input
    (unknown relic id, out-of-range step/gear indices) — callers fail open.
    lineTotal(result) yields the displayed total. */
export const computeRelicLine = (
  db: PricingDb,
  serviceId: string,
  cfg: RelicConfig,
): (LinePrice & { qty: number }) | null => {
  const rcfg = db.relics?.[serviceId];
  if (!rcfg) return null;
  const steps = rcfg.steps;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  if (
    !Array.isArray(cfg.steps) ||
    cfg.steps.some((i) => !Number.isInteger(i) || i < 0 || i >= steps.length)
  )
    return null;
  const gearOptions = rcfg.gearOptions ? db.purchaseBox.gearOptions : [];
  if (
    !Number.isInteger(cfg.gearIdx) ||
    cfg.gearIdx < 0 ||
    (gearOptions.length > 0 && cfg.gearIdx >= gearOptions.length)
  )
    return null;

  // Priority multiplies the steps/bundle total; mount and unlock stay flat.
  // All steps enabled = the complete-bundle price replaces the sum.
  const allSteps = rcfg.complete != null && cfg.steps.length === steps.length;
  const stepsTotal = allSteps
    ? rcfg.complete!.price
    : cfg.steps.reduce((s, i) => s + (steps[i]?.price ?? 0), 0);
  const mountPrice = cfg.mount ? (rcfg.mount?.price ?? 0) : 0;
  const gearPrice = gearOptions[cfg.gearIdx]?.price ?? 0;
  const total =
    stepsTotal * (cfg.priority ? priorityMultiplier : 1) +
    mountPrice +
    gearPrice +
    (cfg.unlock ? (rcfg.unlock?.price ?? 0) : 0);
  return { price: total, qty: 1, qtyLocked: true };
};
