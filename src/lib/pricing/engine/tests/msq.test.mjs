/* Golden test for the MSQ pricing family: computeMsqLine must reproduce
   MsqPurchaseBox's original inline formula bit-for-bit. The golden function
   below is that formula copied verbatim from
   `git show HEAD:src/components/MsqPurchaseBox.tsx` (the locals were:
   gearPrice / aetherWhitelist / aetherCount / aetherPrice / expansionsTotal /
   total). */
import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeMsqLine } from '../msq.ts';

const base = JSON.parse(await readFile('public/db/pricing.json', 'utf8'));
const cats = await Promise.all(
  ['ffxiv-UltimateRaids', 'ffxiv-Leveling'].map((f) =>
    readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null),
  ),
);
const db = mergeCategoryFiles(base, cats);

// GOLDEN — original inline total. mcfg = db.msqBoost, pb = db.purchaseBox
function goldenTotal(mcfg, pb, cfg) {
  const EXPANSIONS = mcfg?.expansions ?? [];
  const GEAR_OPTIONS = pb.gearOptions;
  const priorityMultiplier = pb.priorityMultiplier;
  const gearPrice = GEAR_OPTIONS[cfg.gearIdx]?.price ?? 0;
  const aetherWhitelist = mcfg?.aetherCurrents?.expansions ?? [];
  const aetherCount = cfg.expansions.filter(
    (i) => EXPANSIONS[i] && aetherWhitelist.includes(EXPANSIONS[i].id),
  ).length;
  const aetherPrice = cfg.aether
    ? aetherCount * (mcfg?.aetherCurrents?.pricePerExpansion ?? 0)
    : 0;
  const expansionsTotal = cfg.expansions.reduce((s, i) => s + (EXPANSIONS[i]?.price ?? 0), 0);
  return (
    (expansionsTotal + aetherPrice) * (cfg.priority ? priorityMultiplier : 1) +
    gearPrice
  );
}

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected || Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: line=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const mcfg = db.msqBoost;
const serviceId = mcfg.serviceId;
const n = mcfg.expansions.length;
const all = mcfg.expansions.map((_, i) => i);
const mid = n > 2 ? [1, 2] : [0];
const selections = [all, [], [0], [n - 1], mid];
const gearIdxs = [0, db.purchaseBox.gearOptions.length - 1];
for (const expansions of selections)
  for (const aether of [false, true])
    for (const priority of [false, true])
      for (const gearIdx of gearIdxs) {
        const cfg = { family: 'msq', expansions, aether, gearIdx, priority };
        const line = computeMsqLine(db, serviceId, cfg);
        if (!line) {
          check(`exp=[${expansions}] a=${+aether} g=${gearIdx} p=${+priority}`, 'null', 'line');
          continue;
        }
        if (line.qty !== 1 || line.qtyLocked !== true)
          check('qty/qtyLocked', `${line.qty}/${line.qtyLocked}`, '1/true');
        check(
          `exp=[${expansions}] a=${+aether} g=${gearIdx} p=${+priority}`,
          lineTotal(line),
          goldenTotal(mcfg, db.purchaseBox, cfg),
        );
      }

// Defensive: malformed configs must return null, never throw
const valid = { family: 'msq', expansions: [0], aether: false, gearIdx: 0, priority: false };
const nullCases = [
  ['wrong service id', ['does-not-exist', valid]],
  ['expansion index out of range', [serviceId, { ...valid, expansions: [999] }]],
  ['negative expansion index', [serviceId, { ...valid, expansions: [-1] }]],
  ['non-integer expansion index', [serviceId, { ...valid, expansions: [0.5] }]],
  ['expansions not an array', [serviceId, { ...valid, expansions: 'all' }]],
  ['gear index out of range', [serviceId, { ...valid, gearIdx: 999 }]],
  ['negative gear index', [serviceId, { ...valid, gearIdx: -1 }]],
];
for (const [label, [id, cfg]] of nullCases) {
  const line = computeMsqLine(db, id, cfg);
  const ok = line === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} null-on-${label}`);
  ok ? pass++ : fail++;
}

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
