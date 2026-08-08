import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeCriterionLine } from '../criterion.ts';

const files = ['pricing', 'ffxiv-UltimateRaids', 'ffxiv-Criterion'];
const [base, ...cats] = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(base, cats);

/** GOLDEN reference — the total formula copied verbatim from
    git show HEAD:src/components/CriterionPurchaseBox.tsx (the box's inline
    math before the engine extraction). Do not "fix" it; fix the engine. */
function golden(db_, serviceId, cfg) {
  const c = db_.criterion?.[serviceId];
  const priorityMultiplier = db_.purchaseBox.priorityMultiplier;
  const method = cfg.method;
  const difficulty = cfg.difficulty;
  const runs = cfg.runs;
  const checked = cfg.addons;
  const stream = cfg.stream;
  const priority = cfg.priority;
  const unlockChecked = cfg.unlock;
  const hasDifficulty = c?.savagePrice != null || c?.difficulty != null;
  const effDifficulty = hasDifficulty ? difficulty : 'normal';
  const activeAddons = effDifficulty === 'savage' ? (c?.advancedAddons ?? []) : (c?.addons ?? []);
  const normalBase = method === 'piloted' ? (c?.pilotedPrice ?? c?.price ?? 0) : (c?.price ?? 0);
  const base_ =
    effDifficulty === 'savage'
      ? method === 'piloted'
        ? (c?.advancedPilotedPrice ?? c?.savagePrice ?? normalBase)
        : (c?.advancedPrice ?? c?.savagePrice ?? normalBase)
      : normalBase;
  const addonPriceOf = (a) => (method === 'piloted' ? (a.pilotedPrice ?? a.price) : a.price);
  const forcedRuns = checked.reduce(
    (m, id) => Math.max(m, activeAddons.find((a) => a.id === id)?.forcedRuns ?? 0),
    0,
  );
  const effRuns = forcedRuns > 0 ? forcedRuns : runs;
  const addonsTotal = checked.reduce((s, id) => {
    const a = activeAddons.find((x) => x.id === id);
    return s + (a ? addonPriceOf(a) : 0);
  }, 0);
  const streamPrice = 10;
  const core = forcedRuns > 0 ? 0 : base_ * effRuns;
  return (
    (core + addonsTotal) * (priority ? priorityMultiplier : 1) +
    (unlockChecked ? (c?.unlock?.price ?? 0) : 0) +
    (stream ? streamPrice : 0)
  );
}

let pass = 0,
  fail = 0;
const check = (label, actual, expected) => {
  const ok = expected === null ? actual === null : actual !== null && Math.abs(actual - expected) < 1e-9;
  if (!ok) console.log(`FAIL ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const runsValues = [db.purchaseBox.runsMin, 3, db.purchaseBox.runsMax];
for (const [serviceId, c] of Object.entries(db.criterion)) {
  const hasDifficulty = c.savagePrice != null || c.difficulty != null;
  const difficulties = hasDifficulty ? ['normal', 'savage'] : ['normal', 'savage'];
  for (const method of ['group', 'piloted'])
    for (const difficulty of difficulties) {
      const activeAddons =
        (hasDifficulty ? difficulty : 'normal') === 'savage' ? (c.advancedAddons ?? []) : (c.addons ?? []);
      const addonSets = [[], ...activeAddons.map((a) => [a.id]), activeAddons.map((a) => a.id)];
      for (const addons of addonSets)
        for (const runs of runsValues)
          for (const stream of [false, true])
            for (const priority of [false, true])
              for (const unlock of [false, true]) {
                const cfg = { family: 'criterion', method, difficulty, runs, addons, stream, priority, unlock };
                const line = computeCriterionLine(db, serviceId, cfg);
                check(
                  `${serviceId} ${method}/${difficulty} r${runs} [${addons}] s${+stream} p${+priority} u${+unlock}`,
                  line && lineTotal(line),
                  golden(db, serviceId, cfg),
                );
              }
    }
}

// Malformed configs must fail open (null), never throw
const sane = { family: 'criterion', method: 'group', difficulty: 'normal', runs: 1, addons: [], stream: false, priority: false, unlock: false };
const someId = Object.keys(db.criterion)[0];
check('unknown service', computeCriterionLine(db, 'does-not-exist', sane), null);
check('bad method', computeCriterionLine(db, someId, { ...sane, method: 'afk' }), null);
check('bad difficulty', computeCriterionLine(db, someId, { ...sane, difficulty: 'extreme' }), null);
check('bad runs', computeCriterionLine(db, someId, { ...sane, runs: 0 }), null);
check('unknown addon', computeCriterionLine(db, someId, { ...sane, addons: ['nope'] }), null);

console.log(fail === 0 ? `ALL ${pass} TESTS PASSED` : `${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
