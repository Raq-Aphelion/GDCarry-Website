/* Golden test for the Dawntrail wing family: computeWingLine must reproduce
   the formula that lived inline in src/components/WingPurchaseBox.tsx before
   the pricing-engine extraction. The golden reference below is that original
   code, copied verbatim (git show HEAD:src/components/WingPurchaseBox.tsx). */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeWingLine } from '../wing.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

// GOLDEN — original inline formula, verbatim from the box (parameterized on
// the db so the afkPrice-fallback case can run against a modified copy)
const golden = (d, serviceId, method, stream, priority) => {
  const cfg = d.mounts?.wings?.[serviceId];
  const afkMultiplier = d.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = d.purchaseBox.priorityMultiplier;
  const streamPrice = 10;
  const base = method === 'afk' ? (cfg?.afkPrice ?? (cfg?.price ?? 0) * afkMultiplier) : (cfg?.price ?? 0);
  return base * (priority ? priorityMultiplier : 1) + (stream ? streamPrice : 0);
};

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && Math.abs(actual - expected) <= 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: got=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};
const checkNull = (label, value) => {
  const ok = value === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: expected null, got=${JSON.stringify(value)}`);
  ok ? pass++ : fail++;
};

// Every wing × both methods × each add-on on/off
for (const serviceId of Object.keys(db.mounts.wings)) {
  for (const method of ['piloted', 'afk']) {
    for (const stream of [false, true]) {
      for (const priority of [false, true]) {
        const line = computeWingLine(db, serviceId, { family: 'wing', method, stream, priority });
        check(`${serviceId} ${method} stream=${stream} priority=${priority}`, line && lineTotal(line), golden(db, serviceId, method, stream, priority));
        if (line && (line.qty !== 1 || !line.qtyLocked)) {
          console.log(`FAIL ${serviceId} ${method}: expected qty=1 qtyLocked, got qty=${line.qty} qtyLocked=${line.qtyLocked}`);
          fail++;
        }
      }
    }
  }
}

// AFK fallback: wing without an explicit afkPrice uses price × afkMultiplier
const fbId = 'ffxiv-wings-of-ruin';
const fbDb = {
  ...db,
  mounts: {
    ...db.mounts,
    wings: { ...db.mounts.wings, [fbId]: { ...db.mounts.wings[fbId], afkPrice: undefined } },
  },
};
for (const stream of [false, true]) {
  for (const priority of [false, true]) {
    const line = computeWingLine(fbDb, fbId, { family: 'wing', method: 'afk', stream, priority });
    check(`afkPrice-fallback stream=${stream} priority=${priority}`, line && lineTotal(line), golden(fbDb, fbId, 'afk', stream, priority));
  }
}

// Defensive: malformed input must return null, never throw
checkNull('unknown service', computeWingLine(db, 'does-not-exist', { family: 'wing', method: 'piloted', stream: false, priority: false }));
checkNull('missing mounts block', computeWingLine({ ...db, mounts: undefined }, fbId, { family: 'wing', method: 'piloted', stream: false, priority: false }));

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
