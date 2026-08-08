import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeReputationLine } from '../reputation.ts';

const files = ['pricing', 'ffxiv-UltimateRaids', 'ffxiv-Reputation'];
const [base, ...cats] = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(base, cats);

/** GOLDEN reference — the total formula copied verbatim from
    git show HEAD:src/components/ReputationPurchaseBox.tsx (the box's inline
    math before the engine extraction). Do not "fix" it; fix the engine. */
function golden(db_, serviceId, cfg) {
  const c = db_.reputation?.[serviceId];
  const priorityMultiplier = db_.purchaseBox.priorityMultiplier;
  const packagesChecked = cfg.packages;
  const start = cfg.start;
  const end = cfg.end;
  const unlockChecked = cfg.unlock;
  const priority = cfg.priority;
  const anyPackage = packagesChecked.length > 0;
  const base_ = anyPackage
    ? packagesChecked.reduce((s, id) => s + (c?.alliedPackages?.find((p) => p.id === id)?.price ?? 0), 0)
    : (end - start) * (c?.pricePerRank ?? 0);
  const unlockPrice =
    !unlockChecked || !c?.unlock
      ? 0
      : anyPackage
        ? (packagesChecked.includes('arr') ? c.unlock.arrPrice : 0) +
          packagesChecked.filter((id) => id !== 'arr').length * c.unlock.otherPrice
        : c.unlock.price;
  return base_ * (priority ? priorityMultiplier : 1) + unlockPrice;
}

let pass = 0,
  fail = 0;
const check = (label, actual, expected) => {
  const ok = expected === null ? actual === null : actual !== null && Math.abs(actual - expected) < 1e-9;
  if (!ok) console.log(`FAIL ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

for (const [serviceId, c] of Object.entries(db.reputation)) {
  // Rank-range mode (no packages): min/default/max ranges × factions × flags
  const ranges = [
    [c.rankMin, c.rankMin + 1],
    [c.defaultStart, c.defaultEnd],
    [c.rankMax - 1, c.rankMax],
  ].filter(([s, e]) => s < e);
  const factionIdxs = [...new Set([0, c.factions.length - 1])];
  for (const factionIdx of factionIdxs)
    for (const [start, end] of ranges)
      for (const unlock of [false, true])
        for (const priority of [false, true]) {
          const cfg = { family: 'reputation', factionIdx, start, end, packages: [], unlock, priority };
          const line = computeReputationLine(db, serviceId, cfg);
          check(
            `${serviceId} f${factionIdx} ${start}-${end} u${+unlock} p${+priority}`,
            line && lineTotal(line),
            golden(db, serviceId, cfg),
          );
        }
  // Package mode: each package solo and all together × flags
  const pkgs = c.alliedPackages ?? [];
  const pkgSets = [...pkgs.map((p) => [p.id]), ...(pkgs.length > 1 ? [pkgs.map((p) => p.id)] : [])];
  for (const packages of pkgSets)
    for (const unlock of [false, true])
      for (const priority of [false, true]) {
        // faction/rank are irrelevant with a package picked — pass defaults
        const cfg = {
          family: 'reputation',
          factionIdx: 0,
          start: c.defaultStart,
          end: c.defaultEnd,
          packages,
          unlock,
          priority,
        };
        const line = computeReputationLine(db, serviceId, cfg);
        check(
          `${serviceId} pkgs[${packages}] u${+unlock} p${+priority}`,
          line && lineTotal(line),
          golden(db, serviceId, cfg),
        );
      }
}

// Malformed configs must fail open (null), never throw
const someId = Object.keys(db.reputation)[0];
const sane = { family: 'reputation', factionIdx: 0, start: 1, end: 8, packages: [], unlock: false, priority: false };
check('unknown service', computeReputationLine(db, 'does-not-exist', sane), null);
check('bad factionIdx', computeReputationLine(db, someId, { ...sane, factionIdx: 999 }), null);
check('empty range', computeReputationLine(db, someId, { ...sane, start: 8, end: 8 }), null);
check('inverted range', computeReputationLine(db, someId, { ...sane, start: 7, end: 2 }), null);
check('unknown package', computeReputationLine(db, someId, { ...sane, packages: ['nope'] }), null);

console.log(fail === 0 ? `ALL ${pass} TESTS PASSED` : `${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
