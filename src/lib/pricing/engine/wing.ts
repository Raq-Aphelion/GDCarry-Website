/* Dawntrail wing family — the WingPurchaseBox formula, moved verbatim from
   src/components/WingPurchaseBox.tsx. Guaranteed mount at a fixed price:
   AFK uses the explicit afkPrice (falling back to price × afkMultiplier),
   times the Priority multiplier, plus the hardcoded €10 Private Stream fee.
   Prices MUST stay identical to the pre-extraction inline code — the golden
   test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.) */
export type WingConfig = {
  family: 'wing';
  /** Boost method id: 'piloted' | 'afk' */
  method: string;
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a wing config. One-off line: the whole total is
    baked into price with qty 1 and qtyLocked. Returns null on malformed
    input (unknown wing service) — callers fail open. */
export const computeWingLine = (
  db: PricingDb,
  serviceId: string,
  cfg: WingConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.mounts?.wings?.[serviceId];
  if (!c) return null;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const streamPrice = 10;
  // AFK price is explicit per wing (afkPrice), falling back to the multiplier
  const base = cfg.method === 'afk' ? (c.afkPrice ?? (c.price ?? 0) * afkMultiplier) : (c.price ?? 0);
  const total = base * (cfg.priority ? priorityMultiplier : 1) + (cfg.stream ? streamPrice : 0);
  return { price: total, qty: 1, qtyLocked: true };
};
