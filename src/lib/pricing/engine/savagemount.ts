/* Savage-mount family — the SavageMountPurchaseBox formula, moved verbatim
   from src/components/SavageMountPurchaseBox.tsx. Covers db.mounts.savageMounts
   services: a guaranteed mount at a fixed price with a boost method (AFK uses
   the duty's afkPrice when set, else the global afkMultiplier). One-off line:
   the whole total is baked into price with qtyLocked. Prices MUST stay
   identical to the pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.)
    The data center is display-only (no price effect) and not captured. */
export type SavageMountConfig = {
  family: 'savagemount';
  method: string; // 'piloted' | 'afk' (id, not label)
  addons: string[]; // checked ids from the service's savageMounts addons list
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a savage-mount config. Returns null on malformed
    input (unknown service, unknown method, unknown add-on id) — callers fail
    open. lineTotal(result) yields the displayed total. `staticBase` is part
    of the family signature for uniformity; this family always prices from
    the db block. */
export const computeSavageMountLine = (
  db: PricingDb,
  serviceId: string,
  cfg: SavageMountConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _staticBase?: number,
): (LinePrice & { qty: number }) | null => {
  const mcfg = db.mounts?.savageMounts?.[serviceId];
  if (!mcfg) return null;
  if (cfg.method !== 'piloted' && cfg.method !== 'afk') return null;
  // Untrusted config: every add-on id must exist in the service's list
  if (!Array.isArray(cfg.addons) || !cfg.addons.every((id) => mcfg.addons?.some((a) => a.id === id)))
    return null;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const streamPrice = 10;
  // AFK uses the duty's AFK fight price when set, else the global multiplier
  const methodBase =
    cfg.method === 'afk' ? (mcfg.afkPrice ?? mcfg.price * afkMultiplier) : mcfg.price;
  const addonsTotal = cfg.addons.reduce(
    (s, id) => s + (mcfg.addons?.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const total =
    methodBase * (cfg.priority ? priorityMultiplier : 1) + addonsTotal + (cfg.stream ? streamPrice : 0);
  return { price: total, qty: 1, qtyLocked: true };
};
