/* Golden test for the trial-bundle pricing family
   (src/lib/pricing/engine/trialbundle.ts). The GOLDEN function below is the
   ORIGINAL TrialBundlePurchaseBox total formula, copied verbatim from
   `git show HEAD:src/components/TrialBundlePurchaseBox.tsx`. Every config in
   the matrix must reproduce it exactly. */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeTrialBundleLine } from '../trialbundle.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

// GOLDEN — verbatim from the pre-extraction box (variable `cfg` there is the
// db.trialBundles block, renamed `c` here; UI state arrives as `u`).
const goldenTotal = (gdb, serviceId, u) => {
  const c = gdb.trialBundles?.[serviceId];
  const afkMultiplier = gdb.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = gdb.purchaseBox.priorityMultiplier;
  const priceOf = (t) => (u.method === 'afk' ? (t.afkPrice ?? t.price) : t.price);
  const mountSeries = c ? gdb.mounts?.series?.[c.mountServiceId] : undefined;
  const mountPrice = mountSeries
    ? u.method === 'afk'
      ? (mountSeries.afkBundlePrice ?? Number((mountSeries.bundlePrice * afkMultiplier).toFixed(2)))
      : mountSeries.bundlePrice
    : 0;
  const allChecked = c ? u.checked.length === c.trials.length : false;
  const afkBundleTotal = c?.trials.reduce((s, t) => s + (t.afkPrice ?? t.price), 0) ?? 0;
  const selectionTotal = allChecked
    ? u.method === 'afk'
      ? afkBundleTotal
      : (c?.bundlePrice ?? 0)
    : u.checked.reduce((s, id) => {
        const t = c?.trials.find((x) => x.id === id);
        return s + (t ? priceOf(t) : 0);
      }, 0);
  const streamPrice = 10;
  return u.guaranteed
    ? mountPrice + (u.stream ? streamPrice : 0)
    : selectionTotal * u.runs * (u.priority ? priorityMultiplier : 1) + (u.stream ? streamPrice : 0);
};

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && expected != null && Math.abs(actual - expected) <= 1e-9;
  if (!ok) console.log(`FAIL ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

// Full matrix over every bundle in the db: both methods; guaranteed on/off;
// checked sets = all (default), empty, first only, last only, a partial mix,
// and a list containing an unknown id; min/default/max runs; stream and
// priority each on/off.
for (const [serviceId, c] of Object.entries(db.trialBundles ?? {})) {
  const ids = c.trials.map((t) => t.id);
  const checkedSets = [
    ids, // default — everything checked (bundle price)
    [], // nothing checked
    [ids[0]], // first trial only
    [ids[ids.length - 1]], // last trial only
    ids.slice(1, 3), // partial mix
    [ids[0], 'bogus-trial'], // unknown id contributes 0
  ];
  for (const method of ['piloted', 'afk']) {
    for (const guaranteed of [false, true]) {
      for (const checked of guaranteed ? [ids] : checkedSets) {
        for (const runs of guaranteed ? [1] : [1, 5, 99]) {
          for (const stream of [false, true]) {
            for (const priority of [false, true]) {
              const u = { family: 'trialbundle', method, guaranteed, checked, runs, stream, priority };
              const line = computeTrialBundleLine(db, serviceId, u);
              check(
                `${serviceId} ${method} n=${checked.length} runs=${runs} g=${guaranteed} s=${stream} p=${priority}`,
                line && lineTotal(line),
                goldenTotal(db, serviceId, u),
              );
              if (guaranteed && line && (line.qty !== 1 || line.qtyLocked !== true)) {
                console.log(`FAIL ${serviceId} guaranteed must be qtyLocked qty 1`);
                fail++;
              }
            }
          }
        }
      }
    }
  }
}

// afkMultiplier fallback branch: bundles whose series mount has no
// afkBundlePrice must reprice to Number((bundlePrice * afkMultiplier).toFixed(2))
{
  const fallbackBundle = Object.entries(db.trialBundles).find(
    ([, c]) => db.mounts?.series?.[c.mountServiceId] && db.mounts.series[c.mountServiceId].afkBundlePrice == null,
  );
  if (fallbackBundle) {
    const [serviceId, c] = fallbackBundle;
    const u = { family: 'trialbundle', method: 'afk', guaranteed: true, checked: c.trials.map((t) => t.id), runs: 1, stream: false, priority: false };
    check(
      `afkBundlePrice fallback (${serviceId} × afkMultiplier)`,
      lineTotal(computeTrialBundleLine(db, serviceId, u)),
      goldenTotal(db, serviceId, u),
    );
  }
}

// Defensive: malformed configs return null, never throw
{
  const ok1 = computeTrialBundleLine(db, 'does-not-exist', {
    family: 'trialbundle', method: 'piloted', guaranteed: false, checked: [], runs: 1, stream: false, priority: false,
  }) === null;
  console.log(`${ok1 ? 'PASS' : 'FAIL'} defensive: unknown service`);
  ok1 ? pass++ : fail++;
  const clone = JSON.parse(JSON.stringify(db));
  const someId = Object.keys(clone.trialBundles)[0];
  delete clone.mounts.series[clone.trialBundles[someId].mountServiceId];
  const ok2 = computeTrialBundleLine(clone, someId, {
    family: 'trialbundle', method: 'piloted', guaranteed: true, checked: [], runs: 1, stream: false, priority: false,
  }) === null;
  console.log(`${ok2 ? 'PASS' : 'FAIL'} defensive: guaranteed with unresolvable series mount`);
  ok2 ? pass++ : fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
