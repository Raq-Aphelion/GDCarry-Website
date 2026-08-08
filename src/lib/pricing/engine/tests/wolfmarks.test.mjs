/* Golden test for the Wolf Marks family: computeWolfMarksLine must reproduce
   the formula that lived inline in src/components/WolfMarksPurchaseBox.tsx
   before the pricing-engine extraction. The golden reference below is that
   original code, copied verbatim (git show HEAD:src/components/WolfMarksPurchaseBox.tsx). */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeWolfMarksLine } from '../wolfmarks.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));
const serviceId = db.wolfMarks.serviceId;

// GOLDEN — original inline formula, verbatim from the box
const golden = (amount, priority) => {
  const cfg = db.wolfMarks;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const base = amount * (cfg?.pricePerMark ?? 0);
  return base * (priority ? priorityMultiplier : 1);
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

const { amountMin, amountMax, defaultAmount } = db.wolfMarks;
// min, default, max and mid amounts (including non-step values the input allows)
const amounts = [amountMin, defaultAmount, amountMax, (amountMin + amountMax) / 2, 7777];
for (const amount of amounts) {
  for (const priority of [false, true]) {
    const line = computeWolfMarksLine(db, serviceId, { family: 'wolfmarks', amount, priority });
    check(`amount=${amount} priority=${priority}`, line && lineTotal(line), golden(amount, priority));
    if (line && (line.qty !== 1 || !line.qtyLocked)) {
      console.log(`FAIL amount=${amount}: expected qty=1 qtyLocked, got qty=${line.qty} qtyLocked=${line.qtyLocked}`);
      fail++;
    }
  }
}

// Defensive: malformed input must return null, never throw
checkNull('unknown service', computeWolfMarksLine(db, 'does-not-exist', { family: 'wolfmarks', amount: 5000, priority: false }));
checkNull('NaN amount', computeWolfMarksLine(db, serviceId, { family: 'wolfmarks', amount: NaN, priority: false }));
checkNull('non-number amount', computeWolfMarksLine(db, serviceId, { family: 'wolfmarks', amount: '5000', priority: false }));
checkNull('missing db block', computeWolfMarksLine({ ...db, wolfMarks: undefined }, serviceId, { family: 'wolfmarks', amount: 5000, priority: false }));

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
