/* Golden test for the relic pricing family: computeRelicLine must reproduce
   RelicPurchaseBox's original inline formula bit-for-bit. The golden function
   below is that formula copied verbatim from
   `git show HEAD:src/components/RelicPurchaseBox.tsx` (the locals were:
   allSteps / stepsTotal / mountPrice / gearOptions / gearPrice / total). */
import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeRelicLine } from '../relic.ts';

const base = JSON.parse(await readFile('public/db/pricing.json', 'utf8'));
const cats = await Promise.all(
  ['ffxiv-UltimateRaids', 'ffxiv-Relics'].map((f) =>
    readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null),
  ),
);
const db = mergeCategoryFiles(base, cats);

// GOLDEN — original inline total. rcfg = db.relics[serviceId], pb = db.purchaseBox
function goldenTotal(rcfg, pb, cfg) {
  const steps = rcfg?.steps ?? [];
  const priorityMultiplier = pb.priorityMultiplier;
  const allSteps = rcfg?.complete != null && cfg.steps.length === steps.length;
  const stepsTotal = allSteps
    ? rcfg.complete.price
    : cfg.steps.reduce((s, i) => s + (steps[i]?.price ?? 0), 0);
  const mountPrice = cfg.mount ? (rcfg?.mount?.price ?? 0) : 0;
  const gearOptions = rcfg?.gearOptions ? pb.gearOptions : [];
  const gearPrice = gearOptions[cfg.gearIdx]?.price ?? 0;
  return (
    stepsTotal * (cfg.priority ? priorityMultiplier : 1) +
    mountPrice +
    gearPrice +
    (cfg.unlock ? (rcfg?.unlock?.price ?? 0) : 0)
  );
}

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected || Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: line=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

for (const [serviceId, rcfg] of Object.entries(db.relics ?? {})) {
  const n = rcfg.steps.length;
  const all = rcfg.steps.map((_, i) => i);
  const mid = n > 2 ? [1, 2] : [0];
  const selections = [all, [], [0], [n - 1], mid];
  const gearIdxs = rcfg.gearOptions ? [0, db.purchaseBox.gearOptions.length - 1] : [0];
  for (const steps of selections)
    for (const priority of [false, true])
      for (const unlock of [false, true])
        for (const mount of [false, true])
          for (const gearIdx of gearIdxs) {
            const cfg = { family: 'relic', steps, mount, gearIdx, priority, unlock };
            const line = computeRelicLine(db, serviceId, cfg);
            if (!line) {
              check(`${serviceId} steps=[${steps}] m=${+mount} g=${gearIdx} p=${+priority} u=${+unlock}`, 'null', 'line');
              continue;
            }
            if (line.qty !== 1 || line.qtyLocked !== true)
              check(`${serviceId} qty/qtyLocked`, `${line.qty}/${line.qtyLocked}`, '1/true');
            check(
              `${serviceId} steps=[${steps}] m=${+mount} g=${gearIdx} p=${+priority} u=${+unlock}`,
              lineTotal(line),
              goldenTotal(rcfg, db.purchaseBox, cfg),
            );
          }
}

// Defensive: malformed configs must return null, never throw
const someId = Object.keys(db.relics ?? {})[0];
const valid = { family: 'relic', steps: [0], mount: false, gearIdx: 0, priority: false, unlock: false };
const nullCases = [
  ['unknown service', ['does-not-exist', valid]],
  ['step index out of range', [someId, { ...valid, steps: [999] }]],
  ['negative step index', [someId, { ...valid, steps: [-1] }]],
  ['non-integer step index', [someId, { ...valid, steps: [0.5] }]],
  ['steps not an array', [someId, { ...valid, steps: 'all' }]],
];
for (const [label, [id, cfg]] of nullCases) {
  const line = computeRelicLine(db, id, cfg);
  const ok = line === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} null-on-${label}`);
  ok ? pass++ : fail++;
}

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
