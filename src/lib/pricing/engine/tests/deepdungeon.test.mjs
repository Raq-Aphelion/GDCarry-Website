/* Golden test for the deepdungeon pricing family: the engine's
   computeDeepDungeonLine (shared with the orders worker) must reproduce,
   bit-for-bit, the total formula that lived inline in
   src/components/DeepDungeonPurchaseBox.tsx before the extraction. The
   `golden` function below IS that original formula, copied verbatim from
   `git show HEAD:src/components/DeepDungeonPurchaseBox.tsx`. */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeDeepDungeonLine } from '../deepdungeon.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const [base, ...cats] = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(base, cats);

/* ---------------------------------------------------------------------------
   GOLDEN — original DeepDungeonPurchaseBox formula, verbatim. `ui` carries the
   box's state: method (the priced panel), option, groupChecked, mountOn,
   checked, runs, stream, priority, unlockChecked, drawerChecked.
   ------------------------------------------------------------------------- */
const golden = (db, serviceId, ui) => {
  const cfg = db.deepDungeons?.[serviceId];
  const soloAddons = cfg?.solo.addons ?? [];
  const groupOptions = cfg?.group?.options ?? [];
  const groupAddons = cfg?.group?.addons ?? [];
  const groupMultiplier = cfg?.group?.multiplier;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const activeUnlock = cfg?.unlock;
  const drawerAddons = cfg?.drawerAddons ?? [];

  // Services without group options fall back to solo-only (static pill)
  const hasGroup = groupOptions.length > 0;
  const pricedMethod = hasGroup ? ui.method : 'solo';
  // ui carries the engine config's keys; the box's state names are aliased here
  const {
    option,
    groupAddons: groupChecked,
    mountOn,
    soloAddons: checked,
    runs,
    stream,
    priority,
    unlock: unlockChecked,
    drawerAddons: drawerChecked,
  } = ui;

  const streamPrice = stream ? 10 : 0;
  // perRun add-ons (e.g. Book Farm) replace the per-run core with their own
  // price (multiplied by Amount of Runs) instead of adding on top
  const perRunSolo = checked.map((id) => soloAddons.find((a) => a.id === id)).find((a) => a?.perRun);
  const perRunGroup = groupChecked.map((id) => groupAddons.find((a) => a.id === id)).find((a) => a?.perRun);
  const addonsTotal = checked.reduce((s, id) => {
    const a = soloAddons.find((x) => x.id === id);
    return a?.perRun ? s : s + (a?.price ?? 0);
  }, 0);
  // Multiplier add-ons (e.g. Juedi 400%) apply to the solo base price only;
  // every other add-on stays additive on top of the multiplied price
  const soloTimes = checked.reduce(
    (t, id) => t * (soloAddons.find((a) => a.id === id)?.timesBase ?? 1),
    1,
  );
  const groupAddonsTotal = groupChecked.reduce((s, id) => {
    const a = groupAddons.find((x) => x.id === id);
    return a?.perRun ? s : s + (a?.price ?? 0);
  }, 0);
  const selectedOption = groupOptions.find((o) => o.id === option) ?? groupOptions[0];
  // Amount of Runs multiplies the per-completion core only — upgrades/loot
  // (add-ons) stay static additions. An active Mount Juedi (group multiplier
  // or solo multiplier add-on) replaces the run count with its clear count
  // instead of multiplying the core, so it never double-counts.
  const core =
    pricedMethod === 'group'
      ? (perRunGroup?.price ?? selectedOption?.price ?? 0)
      : (perRunSolo?.price ?? cfg?.solo.price ?? 0);
  const addonsPart = pricedMethod === 'group' ? groupAddonsTotal : addonsTotal;
  const forcedRuns =
    pricedMethod === 'group'
      ? mountOn && groupMultiplier
        ? groupMultiplier.times
        : cfg?.disableRunsOnAddons && groupChecked.length > 0
          ? 1
          : 0
      : soloTimes > 1
        ? soloTimes
        : cfg?.disableRunsOnAddons && checked.length > 0
          ? 1
          : 0;
  // pricedMethod (not effMethod) keeps the total in sync with the panel that
  // is actually rendering during the cross-fade, so the price flips once
  const runsControls = !hasGroup && cfg?.runs === true;
  const effRuns = forcedRuns > 0 ? forcedRuns : pricedMethod === 'solo' ? (runsControls ? runs : 1) : runs;
  // Drawer add-ons are flat — except timesRuns ones (e.g. 40 Offerings),
  // which price per run like the core
  const drawerAddonsTotal = drawerChecked.reduce((s, id) => {
    const a = drawerAddons.find((x) => x.id === id);
    return s + (a?.price ?? 0) * (a?.timesRuns ? effRuns : 1);
  }, 0);
  // Priority multiplies the method total × runs; unlock and stream are flat.
  // streamInSolo / streamPilotedOnly configs offer Private Stream only in Piloted.
  const effStreamPrice =
    (cfg?.streamInSolo || cfg?.streamPilotedOnly) && pricedMethod === 'group' ? 0 : streamPrice;
  const total =
    (core * effRuns + addonsPart) * (priority ? priorityMultiplier : 1) +
    (unlockChecked ? (activeUnlock?.price ?? 0) : 0) +
    drawerAddonsTotal +
    effStreamPrice;
  return total;
};

/* -------------------------------------------------------------------------- */

let pass = 0, fail = 0;
const check = (label, ui) => {
  const [serviceId] = label.split(' ');
  const line = computeDeepDungeonLine(db, serviceId, { family: 'deepdungeon', ...ui });
  const expected = golden(db, serviceId, ui);
  if (line == null) {
    console.log(`FAIL ${label}: engine returned null (golden=${expected})`);
    fail++;
    return;
  }
  const actual = lineTotal(line);
  const ok = Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: total=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};

const baseUi = {
  method: 'group',
  option: '',
  groupAddons: [],
  mountOn: false,
  soloAddons: [],
  runs: 1,
  stream: false,
  priority: false,
  unlock: false,
  drawerAddons: [],
};
const RUNS_MIN = db.purchaseBox.runsMin;
const RUNS_MAX = db.purchaseBox.runsMax;
const RUNS_MID = Math.floor((RUNS_MIN + RUNS_MAX) / 2);

for (const [serviceId, cfg] of Object.entries(db.deepDungeons ?? {})) {
  const hasGroup = (cfg.group?.options?.length ?? 0) > 0;
  const methods = hasGroup ? ['group', 'solo'] : ['solo'];
  for (const method of methods) {
    const variants = [];
    if (method === 'group') {
      // Every run-type option, min/default/max runs
      for (const o of cfg.group.options)
        for (const runs of [RUNS_MIN, RUNS_MID, RUNS_MAX])
          variants.push({ option: o.id, runs });
      // Each group add-on on/off (on its required option when locked to one)
      for (const a of cfg.group.addons ?? []) {
        const opt = a.requiresOption ?? cfg.group.options[0].id;
        variants.push({ option: opt, groupAddons: [a.id] });
        variants.push({ option: opt, groupAddons: [a.id], runs: RUNS_MAX });
      }
      // All group add-ons together (they must share a compatible option here)
      const all = (cfg.group.addons ?? []).map((a) => a.id);
      if (all.length > 0)
        variants.push({ option: cfg.group.options[cfg.group.options.length - 1].id, groupAddons: all });
      // Mount multiplier on/off (pins runs to the clear count)
      if (cfg.group.multiplier) {
        variants.push({ option: cfg.group.options[0].id, mountOn: true });
        variants.push({ option: cfg.group.options[0].id, mountOn: true, runs: RUNS_MAX });
      }
    } else {
      variants.push({}); // bare solo
      // Each solo add-on on/off, min + max runs
      for (const a of cfg.solo.addons) {
        variants.push({ soloAddons: [a.id] });
        variants.push({ soloAddons: [a.id], runs: RUNS_MAX });
      }
      // All solo add-ons together
      if (cfg.solo.addons.length > 0)
        variants.push({ soloAddons: cfg.solo.addons.map((a) => a.id), runs: RUNS_MID });
      // Runs range matters for piloted-only services with `runs: true`
      for (const runs of [RUNS_MIN, RUNS_MID, RUNS_MAX]) variants.push({ runs });
    }
    // Drawer add-ons on/off (timesRuns ones scale with runs)
    for (const a of cfg.drawerAddons ?? []) {
      variants.push({ drawerAddons: [a.id] });
      variants.push({ drawerAddons: [a.id], runs: RUNS_MAX });
    }
    // Unlock / stream / priority toggles
    variants.push({ unlock: true });
    variants.push({ stream: true });
    variants.push({ priority: true });
    variants.push({ unlock: true, stream: true, priority: true, runs: RUNS_MID });
    for (const [i, v] of variants.entries()) {
      const ui = { ...baseUi, method, option: cfg.group?.options?.[0]?.id ?? '', ...v };
      check(`${serviceId} ${method}#${i} ${JSON.stringify(v)}`, ui);
    }
  }
}

// Defensive: malformed configs must return null, never throw
const nullCases = [
  ['unknown service', 'does-not-exist', { ...baseUi }],
  ['unknown solo add-on', 'ffxiv-potd-solo', { ...baseUi, method: 'solo', soloAddons: ['nope'] }],
  ['unknown group add-on', 'ffxiv-potd-solo', { ...baseUi, groupAddons: ['nope'] }],
  ['unknown drawer add-on', 'ffxiv-final-verse', { ...baseUi, method: 'solo', drawerAddons: ['nope'] }],
  ['unknown group option', 'ffxiv-potd-solo', { ...baseUi, option: 'nope' }],
  ['bad method', 'ffxiv-potd-solo', { ...baseUi, method: 'afk' }],
  ['bad runs', 'ffxiv-potd-solo', { ...baseUi, runs: 'x' }],
  ['bad addons type', 'ffxiv-potd-solo', { ...baseUi, soloAddons: 'aetherpool' }],
];
for (const [label, serviceId, ui] of nullCases) {
  const r = computeDeepDungeonLine(db, serviceId, { family: 'deepdungeon', ...ui });
  const ok = r === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} null/${label}: ${r === null ? 'null' : JSON.stringify(r)}`);
  ok ? pass++ : fail++;
}

console.log(fail === 0 ? `\nALL TESTS PASSED (${pass})` : `\n${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
