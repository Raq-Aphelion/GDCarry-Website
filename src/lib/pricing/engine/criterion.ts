/* Criterion family — Variant & Criterion dungeon purchase-box formula, moved
   verbatim from src/components/CriterionPurchaseBox.tsx. Prices MUST stay
   identical to the pre-extraction inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. (A `type`, not an
    `interface`, so it stays assignable to the OrderConfig index signature.) */
export type CriterionConfig = {
  family: 'criterion';
  method: string; // 'group' | 'piloted'
  difficulty: string; // 'normal' | 'savage'
  runs: number;
  addons: string[]; // picked difficulty-specific add-on ids
  stream: boolean;
  priority: boolean;
  unlock: boolean;
};

/** Full line pricing for a criterion config. Returns null on malformed input
    (missing db block, unknown method/difficulty/add-on id) — callers fail
    open. The qty is the run count (pinned by a forcedRuns add-on);
    lineTotal(result) yields the displayed total. */
export const computeCriterionLine = (
  db: PricingDb,
  serviceId: string,
  cfg: CriterionConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.criterion?.[serviceId];
  if (!c) return null;
  if (cfg.method !== 'group' && cfg.method !== 'piloted') return null;
  if (cfg.difficulty !== 'normal' && cfg.difficulty !== 'savage') return null;
  if (!Number.isFinite(cfg.runs) || cfg.runs < 1) return null;
  if (!Array.isArray(cfg.addons)) return null;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const method = cfg.method;
  const hasDifficulty = c.savagePrice != null || c.difficulty != null;
  const effDifficulty = hasDifficulty ? cfg.difficulty : 'normal';
  const activeAddons = effDifficulty === 'savage' ? (c.advancedAddons ?? []) : (c.addons ?? []);
  const checked = cfg.addons;
  // Unknown add-on ids are malformed — the box can only produce listed ones
  if (checked.some((id) => !activeAddons.some((a) => a.id === id))) return null;
  // Piloted carries its own per-run price when set (e.g. variants +10%);
  // a second difficulty with its own price is flat regardless of method
  const normalBase = method === 'piloted' ? (c.pilotedPrice ?? c.price ?? 0) : (c.price ?? 0);
  const base =
    effDifficulty === 'savage'
      ? method === 'piloted'
        ? (c.advancedPilotedPrice ?? c.savagePrice ?? normalBase)
        : (c.advancedPrice ?? c.savagePrice ?? normalBase)
      : normalBase;
  const addonPriceOf = (a: (typeof activeAddons)[number]) =>
    method === 'piloted' ? (a.pilotedPrice ?? a.price) : a.price;
  const forcedRuns = checked.reduce(
    (m, id) => Math.max(m, activeAddons.find((a) => a.id === id)?.forcedRuns ?? 0),
    0,
  );
  const effRuns = forcedRuns > 0 ? forcedRuns : cfg.runs;
  const addonsTotal = checked.reduce((s, id) => {
    const a = activeAddons.find((x) => x.id === id);
    return s + (a ? addonPriceOf(a) : 0);
  }, 0);
  const streamPrice = 10;
  // Per-run cart model — identical to the box's addItem call: per-run base
  // (0 when a forcedRuns add-on zeroes the core), qty the run count, flat
  // the one-off extras (add-ons are inside the priority multiplication in
  // the box formula, so they're pre-multiplied here — cart flat is not)
  return {
    price: forcedRuns > 0 ? 0 : base,
    flat:
      addonsTotal * (cfg.priority ? priorityMultiplier : 1) +
      (cfg.unlock ? (c.unlock?.price ?? 0) : 0) +
      (cfg.stream ? streamPrice : 0),
    multiplier: cfg.priority ? priorityMultiplier : undefined,
    qty: effRuns,
  };
};
