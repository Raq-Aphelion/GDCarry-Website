/* Savage raid series family — the SavageSeriesPurchaseBox formula, moved
   verbatim from src/components/SavageSeriesPurchaseBox.tsx. Covers the savage
   raid series services (Pandaemonium, Arcadion, Eden, Omega, Alexander):
   tier bundles OR per-fight picks (only the shown Encounter Options side
   counts), tier unlocks, runs, priority, FFXIV Logs, gear (Arcadion only)
   and Private Stream. Prices MUST stay identical to the pre-extraction
   inline code — the golden test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import { type LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. Ids refer to the
    service's savageSeries db block (per method); logIdx/gearIdx index the
    shared db.purchaseBox option arrays. (A `type`, not an `interface`, so it
    stays assignable to the OrderConfig index signature.) */
export type SavageSeriesConfig = {
  family: 'savageseries';
  method: string; // 'piloted' | 'afk' (id, not label)
  /** Which Encounter Options side counts toward the price — the other side's
      selections are kept in state but excluded until switched back */
  shown: string; // 'tier' | 'fights'
  bundles: string[]; // selected tier bundle ids
  fights: string[]; // selected fight ids
  unlocks: string[]; // selected unlock ids
  runs: number;
  stream: boolean;
  priority: boolean;
  logIdx: number;
  gearIdx: number;
};

/** Full line pricing for a savage-series config. Returns null on malformed
    input (unknown service/method/id, out-of-range indices) — callers fail
    open. The qty is the run count (1 and qtyLocked for unlock-only orders);
    lineTotal(result) yields the displayed total. */
export const computeSavageSeriesLine = (
  db: PricingDb,
  serviceId: string,
  cfg: SavageSeriesConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- part of the shared family signature; savage series prices come from the db block
  _staticBase?: number,
): (LinePrice & { qty: number }) | null => {
  const m = db.savageSeries?.[serviceId]?.[cfg.method];
  if (!m) return null;
  if (cfg.shown !== 'tier' && cfg.shown !== 'fights') return null;
  if (!Array.isArray(cfg.bundles) || !Array.isArray(cfg.fights) || !Array.isArray(cfg.unlocks)) return null;
  if (!Number.isFinite(cfg.runs) || cfg.runs < 1) return null;
  const allFights = Object.values(m.fights).flat();
  if (cfg.bundles.some((id) => !m.bundles.some((b) => b.id === id))) return null;
  if (cfg.fights.some((id) => !allFights.some((f) => f.id === id))) return null;
  if (cfg.unlocks.some((id) => !m.unlocks.some((u) => u.id === id))) return null;

  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const LOG_OPTIONS = db.purchaseBox.logOptions;
  const GEAR_OPTIONS = db.purchaseBox.gearOptions;
  // Gear Options (shared with the ultimate raids box) — Arcadion only
  const showGear = serviceId === 'ffxiv-arcadion-savage';

  // --- Formula below is verbatim from SavageSeriesPurchaseBox ---
  // Only the shown Boost Option (Tiers or Fights) counts toward the price —
  // the other side keeps its selections but is excluded until switched back.
  const bundlesTotal =
    cfg.shown === 'tier'
      ? cfg.bundles.reduce((s, id) => s + (m.bundles.find((b) => b.id === id)?.price ?? 0), 0)
      : 0;
  const fightsTotal =
    cfg.shown === 'fights'
      ? cfg.fights.reduce((s, id) => s + (allFights.find((f) => f.id === id)?.price ?? 0), 0)
      : 0;
  const unlocksTotal = cfg.unlocks.reduce((s, id) => s + (m.unlocks.find((u) => u.id === id)?.price ?? 0), 0);
  const hasSelection = bundlesTotal + fightsTotal > 0;
  // Amount of Runs multiplies picked tiers and fights — with nothing picked
  // (unlock-only order) the control greys out
  const runsLocked = !hasSelection;
  const effRuns = runsLocked ? 1 : cfg.runs;
  // AFK has no FFXIV Logs option; with nothing picked in the active Boost
  // Option the dropdown is disabled and falls back to "I don't want a parse".
  const effLogIdx = cfg.method === 'afk' || !hasSelection ? 0 : cfg.logIdx;
  const gearEnabled = hasSelection || cfg.unlocks.length > 0;
  const effGearIdx = gearEnabled ? cfg.gearIdx : 0;
  const log = LOG_OPTIONS[effLogIdx];
  const gear = GEAR_OPTIONS[effGearIdx];
  if (!log || !gear) return null;
  const logsPercent = log.percent ?? 0;
  const logsPrice = log.price ?? 0;
  // Priority and the parse tier multiply (bundles + fights); flat log fees are
  // added afterwards, unaffected. Priority multiplies the tier unlocks only
  // when nothing is picked in the active Boost Option. Private Stream only
  // counts when something else is priced — it never enables Add to cart alone.
  const base = (bundlesTotal + fightsTotal) * effRuns * (cfg.priority ? priorityMultiplier : 1);
  const unlocksPart = hasSelection ? unlocksTotal : unlocksTotal * (cfg.priority ? priorityMultiplier : 1);
  const gearPrice = showGear ? gear.price : 0;
  const subtotal = base * (1 + logsPercent / 100) + logsPrice + unlocksPart + gearPrice;
  const streamPart = subtotal > 0 && cfg.stream ? m.stream : 0;

  // Per-run cart model: price is the per-run selection total, qty the run
  // count (cart +/- adjusts runs, identical configs merge). flat covers the
  // one-off parts (log fees, unlocks — pre-multiplied by priority when they
  // are the whole order — gear, stream). Unlock-only orders stay one-offs.
  return {
    price: bundlesTotal + fightsTotal, // per run
    qty: hasSelection ? effRuns : 1,
    flat: logsPrice + unlocksPart + gearPrice + streamPart,
    multiplier: cfg.priority ? priorityMultiplier : undefined,
    logsPercent: logsPercent > 0 ? logsPercent : undefined,
    ...(hasSelection ? {} : { qtyLocked: true }),
  };
};
