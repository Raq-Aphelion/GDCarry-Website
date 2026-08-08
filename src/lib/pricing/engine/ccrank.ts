/* Crystalline Conflict rank family — the CCRankPurchaseBox formula, moved
   verbatim from src/components/CCRankPurchaseBox.tsx. An order is priced as
   the difference of the two ranks' cumulative prices, times the Priority
   multiplier, plus the Private Stream flat fee. Prices MUST stay identical
   to the pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Indices refer to the
    db.ccRank.ranks array. (A `type`, not an `interface`, so it stays
    assignable to the OrderConfig index signature.) */
export type CCRankConfig = {
  family: 'ccrank';
  /** Current rank index into db.ccRank.ranks */
  start: number;
  /** Desired rank index into db.ccRank.ranks */
  end: number;
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a CC rank config. One-off line: the whole total is
    baked into price with qty 1 and qtyLocked. Returns null on malformed
    input (missing db block, out-of-range rank indices) — callers fail open. */
export const computeCCRankLine = (
  db: PricingDb,
  serviceId: string,
  cfg: CCRankConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.ccRank;
  if (!c || c.serviceId !== serviceId) return null;
  const RANKS = c.ranks ?? [];
  const startRank = RANKS[cfg.start];
  const endRank = RANKS[cfg.end];
  if (!startRank || !endRank) return null;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const streamPrice = cfg.stream ? c.streamAddon?.price ?? 0 : 0;
  const base = Math.max((endRank?.price ?? 0) - (startRank?.price ?? 0), 0);
  const total = base * (cfg.priority ? priorityMultiplier : 1) + streamPrice;
  return { price: total, qty: 1, qtyLocked: true };
};
