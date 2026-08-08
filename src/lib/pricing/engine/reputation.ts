/* Reputation family — Allied Society reputation purchase-box formula, moved
   verbatim from src/components/ReputationPurchaseBox.tsx. Prices MUST stay
   identical to the pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.)
    The Private Stream state is excluded: the box always hides the stream row
    and the stream price never enters the reputation total. */
export type ReputationConfig = {
  family: 'reputation';
  factionIdx: number; // index into the db reputation block's factions array
  start: number; // current rank
  end: number; // desired rank
  packages: string[]; // picked allied package ids (any pick reprices the base)
  unlock: boolean;
  priority: boolean;
};

/** Full line pricing for a reputation config — a one-off line: the whole
    total is baked into price with qtyLocked (the box adds it with qty 1).
    Returns null on malformed input (missing db block, unknown faction index
    or package id, empty rank range) — callers fail open. */
export const computeReputationLine = (
  db: PricingDb,
  serviceId: string,
  cfg: ReputationConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.reputation?.[serviceId];
  if (!c) return null;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const packagesChecked = cfg.packages;
  if (!Array.isArray(packagesChecked)) return null;
  // Unknown package ids are malformed — the box can only produce listed ones
  if (packagesChecked.some((id) => !(c.alliedPackages ?? []).some((p) => p.id === id))) return null;
  // Any allied package picked greys out the faction/rank selection and takes
  // over as the price base — faction/rank only matter without packages
  const anyPackage = packagesChecked.length > 0;
  if (!anyPackage) {
    if (!c.factions?.[cfg.factionIdx]) return null;
    if (!Number.isFinite(cfg.start) || !Number.isFinite(cfg.end) || cfg.end <= cfg.start) return null;
  }
  const base = anyPackage
    ? packagesChecked.reduce((s, id) => s + (c.alliedPackages?.find((p) => p.id === id)?.price ?? 0), 0)
    : (cfg.end - cfg.start) * (c.pricePerRank ?? 0);
  // Unlock: base price solo; with any "9. Allied" package it reprices per
  // package (ARR ×6, every other ×3)
  const unlockPrice = !cfg.unlock || !c.unlock
    ? 0
    : anyPackage
      ? (packagesChecked.includes('arr') ? c.unlock.arrPrice : 0) +
        packagesChecked.filter((id) => id !== 'arr').length * c.unlock.otherPrice
      : c.unlock.price;
  const total = base * (cfg.priority ? priorityMultiplier : 1) + unlockPrice;
  return { price: total, qty: 1, qtyLocked: true };
};
