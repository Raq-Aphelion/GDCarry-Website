/* Golden test for the trial pricing family (src/lib/pricing/engine/trial.ts).
   The GOLDEN function below is the ORIGINAL TrialPurchaseBox total formula,
   copied verbatim from `git show HEAD:src/components/TrialPurchaseBox.tsx`.
   Every config in the matrix must reproduce it exactly. */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeTrialLine } from '../trial.ts';

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
// db.trials block, renamed `c` here; UI state arrives as `u`).
const goldenTotal = (gdb, serviceId, u) => {
  const c = gdb.trials?.[serviceId];
  const priorityMultiplier = gdb.purchaseBox.priorityMultiplier;
  const afkMultiplier = gdb.mounts?.afkMultiplier ?? 1.1;
  const mountWing = c?.mount ? gdb.mounts?.wings?.[c.mount] : undefined;
  const mountSavage = c?.mount ? gdb.mounts?.savageMounts?.[c.mount] : undefined;
  const mountPrice = mountWing
    ? u.method === 'afk'
      ? (mountWing.afkPrice ?? Number((mountWing.price * afkMultiplier).toFixed(2)))
      : mountWing.price
    : mountSavage
      ? u.method === 'afk'
        ? (mountSavage.afkPrice ?? Number((mountSavage.price * afkMultiplier).toFixed(2)))
        : mountSavage.price
      : 0;
  const streamPrice = 10;
  const methodBase = u.method === 'afk' ? (c?.afkPrice ?? c?.price ?? 0) : (c?.price ?? 0);
  return u.guaranteed
    ? mountPrice + (u.stream ? streamPrice : 0)
    : methodBase * u.runs * (u.priority ? priorityMultiplier : 1) + (u.stream ? streamPrice : 0);
};

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && expected != null && Math.abs(actual - expected) <= 1e-9;
  if (!ok) console.log(`FAIL ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const mountResolvable = (gdb, c) =>
  !!c?.mount && !!(gdb.mounts?.wings?.[c.mount] || gdb.mounts?.savageMounts?.[c.mount]);

// Full matrix over every trial in the db: both methods, min/default/max runs,
// guaranteed on/off (on only where the UI could offer it), stream and
// priority each on/off.
for (const [serviceId, c] of Object.entries(db.trials ?? {})) {
  for (const method of ['piloted', 'afk']) {
    for (const guaranteed of mountResolvable(db, c) ? [false, true] : [false]) {
      for (const runs of guaranteed ? [1] : [1, 5, 99]) {
        for (const stream of [false, true]) {
          for (const priority of [false, true]) {
            const u = { family: 'trial', method, runs, guaranteed, stream, priority };
            const line = computeTrialLine(db, serviceId, u);
            check(
              `${serviceId} ${method} runs=${runs} g=${guaranteed} s=${stream} p=${priority}`,
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

// afkMultiplier fallback branch: strip afkPrice from a linked wing — the
// mount price must become Number((price * afkMultiplier).toFixed(2))
{
  const clone = JSON.parse(JSON.stringify(db));
  const wing = clone.mounts.wings['ffxiv-wings-of-ruin'];
  delete wing.afkPrice;
  const u = { family: 'trial', method: 'afk', runs: 1, guaranteed: true, stream: false, priority: false };
  check(
    'afkPrice fallback (wing × afkMultiplier)',
    lineTotal(computeTrialLine(clone, 'ffxiv-worqor-lar-dor', u)),
    goldenTotal(clone, 'ffxiv-worqor-lar-dor', u),
  );
}

// Defensive: malformed configs return null, never throw
const defensive = [
  ['unknown service', 'does-not-exist', { family: 'trial', method: 'piloted', runs: 1, guaranteed: false, stream: false, priority: false }],
  ['guaranteed with no linked mount', 'ffxiv-memoria-misera', { family: 'trial', method: 'piloted', runs: 1, guaranteed: true, stream: false, priority: false }],
];
for (const [label, id, u] of defensive) {
  const ok = computeTrialLine(db, id, u) === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} defensive: ${label}`);
  ok ? pass++ : fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
