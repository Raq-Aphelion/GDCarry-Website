/* Deep-dungeon family — the DeepDungeonPurchaseBox formula, moved verbatim
   from src/components/DeepDungeonPurchaseBox.tsx. Covers PotD, HoH, Orthos,
   Pilgrim's Traverse, Final Verse and the deep-dungeon bundle: two methods —
   Group Play (run-type pills + optional group add-ons and a mount multiplier)
   and Solo Piloted (fixed price + upgrade add-ons) — priced per completion.
   Prices MUST stay identical to the pre-extraction inline code — the golden
   test pins this. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';

/** What the box's UI state serializes to — JSON-safe, this is what the cart
    item carries and what the worker recomputes from. `method` is the priced
    panel ('solo' | 'group'); for services without group options the engine
    forces 'solo', exactly like the box. (A `type`, not an `interface`, so it
    stays assignable to the OrderConfig index signature.) */
export type DeepDungeonConfig = {
  family: 'deepdungeon';
  method: 'solo' | 'group';
  /** Selected Group Play run-type option id (e.g. 'speedrun' | 'farm') */
  option: string;
  /** Checked Group Play add-on ids */
  groupAddons: string[];
  /** Group mount multiplier toggle (e.g. Juedi 4 Clears) */
  mountOn: boolean;
  /** Checked solo add-on ids (upgrades/loot) */
  soloAddons: string[];
  /** Amount of Runs */
  runs: number;
  stream: boolean;
  priority: boolean;
  /** Deep Dungeon Unlock add-on checked */
  unlock: boolean;
  /** Checked drawer add-on ids (e.g. 40 Offerings) */
  drawerAddons: string[];
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Full line pricing for a deep-dungeon config. Returns null on malformed
    input (unknown service, unknown option/add-on id, bad runs) — callers fail
    open. Per-run cart model: price is the per-completion core, qty the run
    count, flat the one-off extras (add-ons are inside the priority
    multiplication in the box formula, so they're pre-multiplied in flat —
    cart flat is not multiplied again). lineTotal(result) yields the displayed
    total. */
export const computeDeepDungeonLine = (
  db: PricingDb,
  serviceId: string,
  cfg: DeepDungeonConfig,
): (LinePrice & { qty: number }) | null => {
  const c = db.deepDungeons?.[serviceId];
  if (!c) return null;
  if (cfg == null || (cfg.method !== 'solo' && cfg.method !== 'group')) return null;
  if (typeof cfg.option !== 'string') return null;
  if (!isStringArray(cfg.groupAddons) || !isStringArray(cfg.soloAddons) || !isStringArray(cfg.drawerAddons))
    return null;
  if (typeof cfg.runs !== 'number' || !Number.isFinite(cfg.runs)) return null;
  if (
    typeof cfg.mountOn !== 'boolean' ||
    typeof cfg.stream !== 'boolean' ||
    typeof cfg.priority !== 'boolean' ||
    typeof cfg.unlock !== 'boolean'
  )
    return null;

  const soloAddons = c.solo.addons ?? [];
  const groupOptions = c.group?.options ?? [];
  const groupAddons = c.group?.addons ?? [];
  const groupMultiplier = c.group?.multiplier;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const activeUnlock = c.unlock;
  const drawerAddons = c.drawerAddons ?? [];

  // Configs arrive from the client — every referenced id must exist in the db
  if (cfg.soloAddons.some((id) => !soloAddons.some((a) => a.id === id))) return null;
  if (cfg.groupAddons.some((id) => !groupAddons.some((a) => a.id === id))) return null;
  if (cfg.drawerAddons.some((id) => !drawerAddons.some((a) => a.id === id))) return null;

  // Services without group options fall back to solo-only (static pill)
  const hasGroup = groupOptions.length > 0;
  const pricedMethod: 'solo' | 'group' = hasGroup ? cfg.method : 'solo';
  const selectedOption = groupOptions.find((o) => o.id === cfg.option) ?? groupOptions[0];
  if (pricedMethod === 'group' && !groupOptions.some((o) => o.id === cfg.option)) return null;

  const streamPrice = cfg.stream ? 10 : 0;
  // perRun add-ons (e.g. Book Farm) replace the per-run core with their own
  // price (multiplied by Amount of Runs) instead of adding on top
  const perRunSolo = cfg.soloAddons.map((id) => soloAddons.find((a) => a.id === id)).find((a) => a?.perRun);
  const perRunGroup = cfg.groupAddons.map((id) => groupAddons.find((a) => a.id === id)).find((a) => a?.perRun);
  const addonsTotal = cfg.soloAddons.reduce((s, id) => {
    const a = soloAddons.find((x) => x.id === id);
    return a?.perRun ? s : s + (a?.price ?? 0);
  }, 0);
  // Multiplier add-ons (e.g. Juedi 400%) apply to the solo base price only;
  // every other add-on stays additive on top of the multiplied price
  const soloTimes = cfg.soloAddons.reduce(
    (t, id) => t * (soloAddons.find((a) => a.id === id)?.timesBase ?? 1),
    1,
  );
  const groupAddonsTotal = cfg.groupAddons.reduce((s, id) => {
    const a = groupAddons.find((x) => x.id === id);
    return a?.perRun ? s : s + (a?.price ?? 0);
  }, 0);
  // Amount of Runs multiplies the per-completion core only — upgrades/loot
  // (add-ons) stay static additions. An active Mount Juedi (group multiplier
  // or solo multiplier add-on) replaces the run count with its clear count
  // instead of multiplying the core, so it never double-counts.
  const core =
    pricedMethod === 'group'
      ? (perRunGroup?.price ?? selectedOption?.price ?? 0)
      : (perRunSolo?.price ?? c.solo.price ?? 0);
  const addonsPart = pricedMethod === 'group' ? groupAddonsTotal : addonsTotal;
  const forcedRuns =
    pricedMethod === 'group'
      ? cfg.mountOn && groupMultiplier
        ? groupMultiplier.times
        : c.disableRunsOnAddons && cfg.groupAddons.length > 0
          ? 1
          : 0
      : soloTimes > 1
        ? soloTimes
        : c.disableRunsOnAddons && cfg.soloAddons.length > 0
          ? 1
          : 0;
  const runsControls = !hasGroup && c.runs === true;
  const effRuns = forcedRuns > 0 ? forcedRuns : pricedMethod === 'solo' ? (runsControls ? cfg.runs : 1) : cfg.runs;
  // Drawer add-ons are flat — except timesRuns ones (e.g. 40 Offerings),
  // which price per run like the core
  const drawerAddonsTotal = cfg.drawerAddons.reduce((s, id) => {
    const a = drawerAddons.find((x) => x.id === id);
    return s + (a?.price ?? 0) * (a?.timesRuns ? effRuns : 1);
  }, 0);
  // Priority multiplies the method total × runs; unlock and stream are flat.
  // streamInSolo / streamPilotedOnly configs offer Private Stream only in Piloted.
  const effStreamPrice =
    (c.streamInSolo || c.streamPilotedOnly) && pricedMethod === 'group' ? 0 : streamPrice;
  // Per-run cart model: price is the per-completion core, qty the run count,
  // flat the one-off extras (add-ons are inside the priority multiplication
  // in the box formula, so they're pre-multiplied here — cart flat is not)
  return {
    price: core,
    qty: effRuns,
    flat:
      addonsPart * (cfg.priority ? priorityMultiplier : 1) +
      (cfg.unlock ? (activeUnlock?.price ?? 0) : 0) +
      drawerAddonsTotal +
      effStreamPrice,
    multiplier: cfg.priority ? priorityMultiplier : undefined,
  };
};
