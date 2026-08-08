/* Mount-series family — the MountSeriesPurchaseBox formula, moved verbatim
   from src/components/MountSeriesPurchaseBox.tsx. Covers db.mounts.series
   services (Kirin, Firebird, Nine Tails, Landerwaffe, Apocryphal Bahamut,
   Wings of Legacy): a checklist of the series' mounts — all checked applies
   the bundle price, a partial selection sums the individual prices. AFK uses
   explicit afkPrice / afkBundlePrice when the db provides them, otherwise
   price × afkMultiplier rounded via toFixed(2). One-off line: the whole total
   is baked into price with qtyLocked. Prices MUST stay identical to the
   pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.)
    The data center is display-only (no price effect) and not captured. */
export type MountSeriesConfig = {
  family: 'mountseries';
  method: string; // 'piloted' | 'afk' (id, not label)
  checked: string[]; // selected mount ids from the series' mounts list
  addon: boolean; // the series' optional add-on (e.g. Nightmare for ARR)
  stream: boolean;
  priority: boolean;
};

/** Full line pricing for a mount-series config. Returns null on malformed
    input (unknown service, unknown method, unknown mount id) — callers fail
    open. lineTotal(result) yields the displayed total. `staticBase` is part
    of the family signature for uniformity; this family always prices from
    the db block. */
export const computeMountSeriesLine = (
  db: PricingDb,
  serviceId: string,
  cfg: MountSeriesConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _staticBase?: number,
): (LinePrice & { qty: number }) | null => {
  const scfg = db.mounts?.series?.[serviceId];
  if (!scfg) return null;
  if (cfg.method !== 'piloted' && cfg.method !== 'afk') return null;
  // Untrusted config: every checked id must be a mount of the series
  if (!Array.isArray(cfg.checked) || !cfg.checked.every((id) => scfg.mounts.some((m) => m.id === id)))
    return null;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const allChecked = cfg.checked.length === scfg.mounts.length;
  // Separate-selection prices follow the method: explicit afkPrice when the
  // DB provides one, otherwise the afkMultiplier (+10%)
  const displayPrice = (m: { price: number; afkPrice?: number }) =>
    cfg.method === 'afk' ? (m.afkPrice ?? Number((m.price * afkMultiplier).toFixed(2))) : m.price;
  // Bundle price follows the method the same way (afkBundlePrice override)
  const bundleTotal = (c: { bundlePrice: number; afkBundlePrice?: number }) =>
    cfg.method === 'afk' ? (c.afkBundlePrice ?? Number((c.bundlePrice * afkMultiplier).toFixed(2))) : c.bundlePrice;
  const mountsTotal = allChecked
    ? bundleTotal(scfg)
    : cfg.checked.reduce((s, id) => {
        const m = scfg.mounts.find((x) => x.id === id);
        return s + (m ? displayPrice(m) : 0);
      }, 0);
  const addonPrice = cfg.addon ? (scfg.addon?.price ?? 0) : 0;
  const streamPrice = 10;
  const total =
    (mountsTotal + addonPrice * (cfg.method === 'afk' ? afkMultiplier : 1)) *
      (cfg.priority ? priorityMultiplier : 1) +
    (cfg.stream ? streamPrice : 0);
  return { price: total, qty: 1, qtyLocked: true };
};
