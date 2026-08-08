/* Golden test for the savageseries pricing family. Loads the same public/db
   JSONs the site and worker use, merges them via mergeCategoryFiles, then
   pins computeSavageSeriesLine against the ORIGINAL inline formula copied
   verbatim from `git show HEAD:src/components/SavageSeriesPurchaseBox.tsx`. */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeSavageSeriesLine } from '../savageseries.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

/* GOLDEN reference — the original formula, copied verbatim from
   git show HEAD:src/components/SavageSeriesPurchaseBox.tsx (the UI state
   variables are destructured from the config object; `cfg` is the method
   block exactly as in the box). */
const golden = (serviceId, c) => {
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const LOG_OPTIONS = db.purchaseBox.logOptions;
  const GEAR_OPTIONS = db.purchaseBox.gearOptions;
  const showGear = serviceId === 'ffxiv-arcadion-savage';
  const method = c.method;
  const cfg = db.savageSeries?.[serviceId]?.[method];
  const { shown, bundles, fights, unlocks, runs, stream, priority, logIdx, gearIdx } = c;
  const bundlesTotal =
    shown === 'tier'
      ? bundles.reduce((s, id) => s + (cfg?.bundles.find((b) => b.id === id)?.price ?? 0), 0)
      : 0;
  const fightsTotal =
    shown === 'fights'
      ? fights.reduce(
          (s, id) => s + (cfg ? Object.values(cfg.fights).flat().find((f) => f.id === id)?.price ?? 0 : 0),
          0,
        )
      : 0;
  const unlocksTotal = unlocks.reduce((s, id) => s + (cfg?.unlocks.find((u) => u.id === id)?.price ?? 0), 0);
  const hasSelection = bundlesTotal + fightsTotal > 0;
  const runsLocked = !hasSelection;
  const effRuns = runsLocked ? 1 : runs;
  const effLogIdx = method === 'afk' || !hasSelection ? 0 : logIdx;
  const logsPercent = LOG_OPTIONS[effLogIdx]?.percent ?? 0;
  const logsPrice = LOG_OPTIONS[effLogIdx]?.price ?? 0;
  const gearEnabled = hasSelection || unlocks.length > 0;
  const effGearIdx = gearEnabled ? gearIdx : 0;
  const base = (bundlesTotal + fightsTotal) * effRuns * (priority ? priorityMultiplier : 1);
  const unlocksPart = hasSelection ? unlocksTotal : unlocksTotal * (priority ? priorityMultiplier : 1);
  const gearPrice = showGear ? GEAR_OPTIONS[effGearIdx]?.price ?? 0 : 0;
  const subtotal = base * (1 + logsPercent / 100) + logsPrice + unlocksPart + gearPrice;
  const total = subtotal + (subtotal > 0 && stream ? cfg?.stream ?? 0 : 0);
  return total;
};

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok =
    (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) <= 1e-9) ||
    actual === expected;
  if (!ok) console.log(`FAIL ${label}: actual=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};

const LOG_OPTIONS = db.purchaseBox.logOptions;
const GEAR_OPTIONS = db.purchaseBox.gearOptions;
const runsMax = db.purchaseBox.runsMax;

// Matrix: every service x method x shown side; min/default/max of every
// priced option; each add-on on/off.
for (const [serviceId, byMethod] of Object.entries(db.savageSeries ?? {})) {
  for (const method of Object.keys(byMethod)) {
    const m = byMethod[method];
    const bundleIds = m.bundles.filter((b) => !b.disabled).map((b) => b.id);
    const fightIds = Object.values(m.fights).flat().filter((f) => !f.disabled).map((f) => f.id);
    const unlockIds = m.unlocks.map((u) => u.id);
    const bundleSels = [[], bundleIds.slice(0, 1), bundleIds];
    const fightSels = [[], fightIds.slice(0, 1), fightIds];
    const unlockSels = [[], unlockIds.slice(0, 1), unlockIds];
    for (const shown of ['tier', 'fights'])
      for (const bundles of bundleSels)
        for (const fights of fightSels)
          for (const unlocks of unlockSels)
            for (const runs of [1, 5, runsMax])
              for (const logIdx of [0, LOG_OPTIONS.length - 1])
                for (const gearIdx of [0, GEAR_OPTIONS.length - 1])
                  for (const stream of [false, true])
                    for (const priority of [false, true]) {
                      const cfg = {
                        family: 'savageseries', method, shown, bundles, fights, unlocks,
                        runs, stream, priority, logIdx, gearIdx,
                      };
                      const line = computeSavageSeriesLine(db, serviceId, cfg);
                      if (!line) {
                        check(`${serviceId}/${method} non-null`, 'null', 'line');
                        continue;
                      }
                      check(
                        `${serviceId}/${method}/${shown} b${bundles.length} f${fights.length} u${unlocks.length} r${runs} l${logIdx} g${gearIdx} s${stream ? 1 : 0} p${priority ? 1 : 0}`,
                        lineTotal(line),
                        golden(serviceId, cfg),
                      );
                    }
  }
}

// Structural checks: per-run price + qty model, qtyLocked for one-offs
const svc = 'ffxiv-pandaemonium-savage';
const m = db.savageSeries[svc].piloted;
const withSel = computeSavageSeriesLine(db, svc, {
  family: 'savageseries', method: 'piloted', shown: 'fights', bundles: [],
  fights: [Object.values(m.fights).flat()[0].id], unlocks: [], runs: 4,
  stream: false, priority: false, logIdx: 0, gearIdx: 0,
});
check('with-selection qty = runs', withSel?.qty, 4);
check('with-selection qtyLocked unset', withSel?.qtyLocked, undefined);
check('with-selection per-run price', withSel?.price, Object.values(m.fights).flat()[0].price);

const unlockOnly = computeSavageSeriesLine(db, svc, {
  family: 'savageseries', method: 'piloted', shown: 'tier', bundles: [],
  fights: [], unlocks: [m.unlocks[0].id], runs: 7,
  stream: false, priority: true, logIdx: 3, gearIdx: 1,
});
check('unlock-only qty locked to 1', unlockOnly?.qty, 1);
check('unlock-only qtyLocked', unlockOnly?.qtyLocked, true);
check(
  'unlock-only priority pre-multiplies the unlock into flat',
  unlockOnly?.flat,
  m.unlocks[0].price * db.purchaseBox.priorityMultiplier,
);

// Defensive: malformed configs return null, never throw
const baseCfg = {
  family: 'savageseries', method: 'piloted', shown: 'fights', bundles: [],
  fights: [Object.values(m.fights).flat()[0].id], unlocks: [], runs: 1,
  stream: false, priority: false, logIdx: 0, gearIdx: 0,
};
check('unknown service', computeSavageSeriesLine(db, 'does-not-exist', baseCfg), null);
check('unknown method', computeSavageSeriesLine(db, svc, { ...baseCfg, method: 'nope' }), null);
check('unknown fight id', computeSavageSeriesLine(db, svc, { ...baseCfg, fights: ['x9s'] }), null);
check('unknown bundle id', computeSavageSeriesLine(db, svc, { ...baseCfg, bundles: ['x1-x4'] }), null);
check('unknown unlock id', computeSavageSeriesLine(db, svc, { ...baseCfg, unlocks: ['x-unlock'] }), null);
check('bad shown', computeSavageSeriesLine(db, svc, { ...baseCfg, shown: 'both' }), null);
check('logIdx out of range', computeSavageSeriesLine(db, svc, { ...baseCfg, logIdx: 99 }), null);
check('gearIdx out of range', computeSavageSeriesLine(db, svc, { ...baseCfg, gearIdx: 99 }), null);
check('runs below 1', computeSavageSeriesLine(db, svc, { ...baseCfg, runs: 0 }), null);
check('runs not finite', computeSavageSeriesLine(db, svc, { ...baseCfg, runs: NaN }), null);

console.log(`\n${pass} passed, ${fail} failed`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
