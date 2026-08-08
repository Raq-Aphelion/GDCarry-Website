/* Level-range family — the LevelingPurchaseBox formula, moved verbatim from
   src/components/LevelingPurchaseBox.tsx. Covers every db block rendered by
   that box: leveling, crafterLeveling, bluLeveling, pvpSeries and
   fieldLeveling. (The msqBoost block has its own box and family module —
   ./msq.ts.) Prices MUST stay identical to the pre-extraction inline code —
   the golden test pins this. */
import type { PricingAddon, PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

type PriceTier = { min: number; max: number; pricePerLevel: number };

/** The LevelBoxConfig fields the box's formula reads, resolved from the db
    block for a service (ServicePage builds the same shape by spreading the
    block and adding the variant extras — the msq/spells add-on swap, the Blue
    Mage lock, the carnivale add-on list). */
type LevelBlock = {
  levelMin: number;
  levelMax: number;
  priceTiers: PriceTier[];
  jobMinLevels?: Record<string, number>;
  gearOptions?: boolean;
  addon?: PricingAddon;
  addonLocksToMax?: boolean;
  addons?: PricingAddon[];
  optionGroups?: { heading: string; options: PricingAddon[] }[];
  jobs?: { label: string; max: number; priceTiers?: PriceTier[] }[];
  phantomToggle?: { label: string };
  phantomAll?: { label: string };
};

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Job is the selected job
    label ('' when none); it picks per-job tiers/caps/minimums. Data center and
    the option-group dropdown selections are display-only and not part of the
    price. (A `type`, not an `interface`, so it stays assignable to the
    OrderConfig index signature.) */
export type LevelingConfig = {
  family: 'leveling';
  start: number;
  end: number;
  job: string;
  gearIdx: number;
  /** Main add-on checked (MSQ completion / All spells unlock / block addon) */
  addon: boolean;
  /** Extra add-on ids (e.g. Masked Carnivale) */
  addons: string[];
  /** Picked option-group option ids (Relic Weapon / Elemental Armor) */
  groupOptions: string[];
  priority: boolean;
  /** Phantom Job leveling section active (split variants) */
  phantom: boolean;
  /** All Phantom Jobs leveled (split variants) */
  all: boolean;
  /** Phantom job level range (split variants) */
  pStart: number;
  pEnd: number;
};

/** MSQ Completion configs live in ./msq.ts (family 'msq') — the msqBoost db
    block is rendered by MsqPurchaseBox, not LevelingPurchaseBox. */

/** Resolve the db block a service id belongs to, applying the same variant
    extras ServicePage adds when it builds the box's config prop. */
const resolveLevelBlock = (db: PricingDb, serviceId: string): LevelBlock | null => {
  const l = db.leveling;
  if (l && serviceId === l.serviceId) return { ...l, addon: l.msqAddon };
  const c = db.crafterLeveling;
  if (c && serviceId === c.serviceId) return { ...c };
  const b = db.bluLeveling;
  if (b && serviceId === b.serviceId)
    return {
      ...b,
      addon: b.spellsAddon,
      addonLocksToMax: true,
      addons: b.carnivaleAddon ? [b.carnivaleAddon] : [],
    };
  const p = db.pvpSeries;
  if (p && serviceId === p.serviceId) return { ...p };
  const f = db.fieldLeveling?.[serviceId];
  if (f) return { ...f };
  return null;
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

/** Full line pricing for a level-range config. Returns null on malformed
    input (unknown service, out-of-range gear index, wrong types) — callers
    fail open. Level ranges are clamped exactly the way the box clamps its
    inputs, so any values price the way the UI would have shown them. One-off
    line: the whole total is the price, qty is locked at 1. */
export const computeLevelingLine = (
  db: PricingDb,
  serviceId: string,
  cfg: LevelingConfig,
): (LinePrice & { qty: number }) | null => {
  const block = resolveLevelBlock(db, serviceId);
  if (!block) return null;
  if (!isNum(cfg.start) || !isNum(cfg.end) || !isNum(cfg.pStart) || !isNum(cfg.pEnd)) return null;
  if (typeof cfg.job !== 'string') return null;
  if (!Number.isInteger(cfg.gearIdx) || cfg.gearIdx < 0) return null;
  if (!isStrArr(cfg.addons) || !isStrArr(cfg.groupOptions)) return null;
  if (!isBool(cfg.addon) || !isBool(cfg.priority) || !isBool(cfg.phantom) || !isBool(cfg.all)) return null;

  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  // Phantom-job variants: the selected job's cap drives the slider max;
  // jobMinLevels (combat jobs) drive the slider minimum
  const isPhantomSplit = !!block.phantomToggle && !!block.jobs?.length;
  const levelMax = !isPhantomSplit && block.jobs?.length
    ? (block.jobs.find((j) => j.label === cfg.job)?.max ?? block.levelMax)
    : block.levelMax;
  const jobMin = block.jobMinLevels?.[cfg.job] ?? block.levelMin;
  // The same clamps the box applies to every level input (slider or typed)
  const clampLevels = (s: number, e: number, min = jobMin): [number, number] => {
    const max = levelMax;
    s = Math.min(Math.max(s, min), max - 1);
    e = Math.min(Math.max(e, min + 1), max);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const [start, end] = clampLevels(cfg.start, cfg.end);
  // Phantom section range (split mode): capped by the selected job's max
  const phantomMax = block.jobs?.find((j) => j.label === cfg.job)?.max ?? block.levelMax;
  const clampPhantom = (s: number, e: number): [number, number] => {
    const min = block.levelMin;
    const max = phantomMax;
    s = Math.min(Math.max(s, min), max - 1);
    e = Math.min(Math.max(e, min + 1), max);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const [pStart, pEnd] = clampPhantom(cfg.pStart, cfg.pEnd);

  // Per-level price tiers: sum the per-level price of every level gained
  // (job-specific tiers when the block provides them, e.g. phantom jobs —
  // but not in split mode, where the top range is the base service levels)
  const activeTiers = !isPhantomSplit && block.jobs?.length
    ? (block.jobs.find((j) => j.label === cfg.job)?.priceTiers ?? block.priceTiers)
    : block.priceTiers;
  const sumLevels = (s: number, e: number, tiers: PriceTier[]) => {
    let sum = 0;
    for (let l = s + 1; l <= e; l++) {
      const tier = tiers.find((t) => l >= t.min && l <= t.max);
      sum += tier?.pricePerLevel ?? 0;
    }
    return sum;
  };
  const levelPrice = sumLevels(start, end, activeTiers);
  // Phantom Job leveling section: own range priced from the job's tiers
  const phantomTiers = block.jobs?.find((j) => j.label === cfg.job)?.priceTiers ?? block.priceTiers;
  const phantomPrice = isPhantomSplit && cfg.phantom ? sumLevels(pStart, pEnd, phantomTiers) : 0;
  // All Phantom Jobs leveled: sum of every job's full leveling price
  // (levelMin -> that job's cap, on its own tiers)
  const allJobsSum = (block.jobs ?? []).reduce(
    (s, j) => s + sumLevels(block.levelMin, j.max, j.priceTiers ?? block.priceTiers),
    0,
  );
  const allPrice = isPhantomSplit && cfg.all ? allJobsSum : 0;
  // Blue Mage: All spells unlock requires the desired level to be the cap
  const addonEnabled = block.addonLocksToMax ? end === block.levelMax : true;
  const addonPrice = cfg.addon && addonEnabled ? block.addon?.price ?? 0 : 0;
  const extrasPrice = cfg.addons.reduce(
    (s, id) => s + (block.addons?.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const groupOptions = block.optionGroups?.flatMap((g) => g.options) ?? [];
  const groupsPrice = cfg.groupOptions.reduce(
    (s, id) => s + (groupOptions.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const gearOptions = block.gearOptions ? db.purchaseBox.gearOptions : [];
  if (gearOptions.length > 0 && cfg.gearIdx >= gearOptions.length) return null;
  const gearPrice = gearOptions[cfg.gearIdx]?.price ?? 0;
  // Priority multiplies the level prices only; add-ons/groups/gear stay flat
  const total =
    (levelPrice + phantomPrice + allPrice) * (cfg.priority ? priorityMultiplier : 1) +
    addonPrice +
    extrasPrice +
    groupsPrice +
    gearPrice;
  return { price: total, qty: 1, qtyLocked: true };
};
