/* Gil family — the GilPurchaseBox formula, moved verbatim from
   src/components/GilPurchaseBox.tsx. qty is the amount in MILLIONS of gil and
   price is the per-million rate; Direct Account Delivery (DAD) carries a
   hardcoded +10% fee. Prices MUST stay identical to the pre-extraction inline
   code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** Amount bounds in millions of gil — same clamp the box's setAmount applies */
export const MIN_GIL_M = 5;
export const MAX_GIL_M = 900;

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Trade method
    (Mannequin / Face to Face) and Region/DC/Server are fulfillment details,
    not price inputs, so they live in the cart id/details, not here. (A
    `type`, not an `interface`, so it stays assignable to the OrderConfig
    index signature.) */
export type GilConfig = {
  family: 'gil';
  /** Direct Account Delivery (piloted delivery on the account): +10% fee */
  dad: boolean;
  /** Amount of gil in millions (5–900) */
  millions: number;
};

/** Full line pricing for a gil config. Returns null on malformed input
    (missing gil db block, non-finite or out-of-range amount) — callers fail
    open. The qty is the millions of gil; lineTotal(result) yields the
    displayed total. serviceId is unused: the gil rate is a single global
    db.gil.pricePerMillion, not keyed by service. */
export const computeGilLine = (
  db: PricingDb,
  _serviceId: string,
  cfg: GilConfig,
): (LinePrice & { qty: number }) | null => {
  const pricePerMillion = db.gil?.pricePerMillion;
  if (pricePerMillion == null) return null;
  if (typeof cfg.millions !== 'number' || !Number.isFinite(cfg.millions)) return null;
  if (cfg.millions < MIN_GIL_M || cfg.millions > MAX_GIL_M) return null;
  return {
    // per 1 M gil — qty is the amount in millions; DAD carries a +10% fee
    price: pricePerMillion * (cfg.dad ? 1.1 : 1),
    qty: cfg.millions,
  };
};
