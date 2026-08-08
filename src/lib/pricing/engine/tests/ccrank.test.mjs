/* Golden test for the CC rank family: computeCCRankLine must reproduce the
   formula that lived inline in src/components/CCRankPurchaseBox.tsx before
   the pricing-engine extraction. The golden reference below is that original
   code, copied verbatim (git show HEAD:src/components/CCRankPurchaseBox.tsx). */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeCCRankLine } from '../ccrank.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));
const serviceId = db.ccRank.serviceId;

// GOLDEN — original inline formula, verbatim from the box
const golden = (start, end, stream, priority) => {
  const cfg = db.ccRank;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const RANKS = cfg?.ranks ?? [];
  const startRank = RANKS[start];
  const endRank = RANKS[end];
  const streamPrice = stream ? cfg?.streamAddon.price ?? 0 : 0;
  const base = Math.max((endRank?.price ?? 0) - (startRank?.price ?? 0), 0);
  return base * (priority ? priorityMultiplier : 1) + streamPrice;
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

const n = db.ccRank.ranks.length;
// min range (default UI state), max range, and mid pairs across tier boundaries
const pairs = [
  [0, 1], [0, n - 1], [n - 2, n - 1], [0, 5], [5, 10], [9, 13], [13, 19], [2, 22],
];
for (const [start, end] of pairs) {
  for (const stream of [false, true]) {
    for (const priority of [false, true]) {
      const line = computeCCRankLine(db, serviceId, { family: 'ccrank', start, end, stream, priority });
      check(`r${start}->r${end} stream=${stream} priority=${priority}`, line && lineTotal(line), golden(start, end, stream, priority));
      if (line && (line.qty !== 1 || !line.qtyLocked)) {
        console.log(`FAIL r${start}->r${end}: expected qty=1 qtyLocked, got qty=${line.qty} qtyLocked=${line.qtyLocked}`);
        fail++;
      }
    }
  }
}

// Defensive: malformed input must return null, never throw
checkNull('unknown service', computeCCRankLine(db, 'does-not-exist', { family: 'ccrank', start: 0, end: 1, stream: false, priority: false }));
checkNull('start out of range', computeCCRankLine(db, serviceId, { family: 'ccrank', start: -1, end: 1, stream: false, priority: false }));
checkNull('end out of range', computeCCRankLine(db, serviceId, { family: 'ccrank', start: 0, end: n, stream: false, priority: false }));
checkNull('missing db block', computeCCRankLine({ ...db, ccRank: undefined }, serviceId, { family: 'ccrank', start: 0, end: 1, stream: false, priority: false }));

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
