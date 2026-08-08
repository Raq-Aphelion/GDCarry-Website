/* MSQ family — MsqPurchaseBox's total formula, moved verbatim from
   src/components/MsqPurchaseBox.tsx. Covers the MSQ Completion boost from
   ffxiv-Leveling: per-expansion prices with a contiguous range selection, an
   Aether Currents add-on scaled per whitelisted expansion, flat gear extras,
   and a priority multiplier on expansions+aether only. One-off line: the
   whole total is baked into price (qty 1, qtyLocked). Prices MUST stay
   identical to the pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import { type LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Expansion indices refer
    to the db.msqBoost expansions array, gearIdx to the db.purchaseBox gear
    options. (A `type`, not an `interface`, so it stays assignable to the
    OrderConfig index signature.) */
export type MsqConfig = {
  family: 'msq';
  /** Selected expansion indices (the UI keeps them one contiguous range) */
  expansions: number[];
  aether: boolean;
  gearIdx: number;
  priority: boolean;
};

/** Full line pricing for an MSQ config. Returns null on malformed input
    (missing msqBoost block, service id mismatch, out-of-range expansion/gear
    indices) — callers fail open. lineTotal(result) yields the displayed
    total. */
export const computeMsqLine = (
  db: PricingDb,
  serviceId: string,
  cfg: MsqConfig,
): (LinePrice & { qty: number }) | null => {
  const mcfg = db.msqBoost;
  if (!mcfg || mcfg.serviceId !== serviceId) return null;
  const EXPANSIONS = mcfg.expansions;
  const GEAR_OPTIONS = db.purchaseBox.gearOptions;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  if (
    !Array.isArray(cfg.expansions) ||
    cfg.expansions.some((i) => !Number.isInteger(i) || i < 0 || i >= EXPANSIONS.length)
  )
    return null;
  if (!Number.isInteger(cfg.gearIdx) || cfg.gearIdx < 0 || cfg.gearIdx >= GEAR_OPTIONS.length)
    return null;

  // Aether Currents scale per chosen expansion — the DB whitelist
  // (aetherCurrents.expansions) decides which expansion ids count
  const aetherWhitelist = mcfg.aetherCurrents?.expansions ?? [];
  const aetherCount = cfg.expansions.filter(
    (i) => EXPANSIONS[i] && aetherWhitelist.includes(EXPANSIONS[i].id),
  ).length;
  const aetherPrice = cfg.aether ? aetherCount * (mcfg.aetherCurrents?.pricePerExpansion ?? 0) : 0;
  // Priority multiplies expansions + aether only; gear stays flat
  const expansionsTotal = cfg.expansions.reduce((s, i) => s + (EXPANSIONS[i]?.price ?? 0), 0);
  const gearPrice = GEAR_OPTIONS[cfg.gearIdx]?.price ?? 0;
  const total = (expansionsTotal + aetherPrice) * (cfg.priority ? priorityMultiplier : 1) + gearPrice;
  return { price: total, qty: 1, qtyLocked: true };
};
