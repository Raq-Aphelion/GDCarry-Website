/* Golden test for the savagemount pricing family: pins
   computeSavageMountLine (src/lib/pricing/engine/savagemount.ts) against the
   ORIGINAL SavageMountPurchaseBox formula, copied verbatim from
   `git show HEAD:src/components/SavageMountPurchaseBox.tsx`. */
import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeSavageMountLine } from '../savagemount.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const [base, ...cats] = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(base, cats);

// ---- GOLDEN reference: the original box formula, verbatim ------------------
// Locals from the original component:
//   const cfg = db.mounts?.savageMounts?.[service.id];
//   const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
//   const priorityMultiplier = db.purchaseBox.priorityMultiplier;
const golden = (db, serviceId, { method, addons, stream, priority }) => {
  const cfg = db.mounts?.savageMounts?.[serviceId];
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const streamPrice = 10;
  // AFK uses the duty's AFK fight price when set, else the global multiplier
  const methodBase =
    method === 'afk' ? (cfg?.afkPrice ?? (cfg?.price ?? 0) * afkMultiplier) : (cfg?.price ?? 0);
  const addonsTotal = addons.reduce((s, id) => s + (cfg?.addons?.find((a) => a.id === id)?.price ?? 0), 0);
  return methodBase * (priority ? priorityMultiplier : 1) + addonsTotal + (stream ? streamPrice : 0);
};
// -----------------------------------------------------------------------------

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const run = (serviceId, cfg) => {
  const line = computeSavageMountLine(db, serviceId, { family: 'savagemount', ...cfg });
  check(
    `${serviceId} ${cfg.method} addons=[${cfg.addons}] stream=${cfg.stream} priority=${cfg.priority}`,
    line ? lineTotal(line) : null,
    golden(db, serviceId, cfg),
  );
};

// Service with explicit afkPrice (45 / 70)
for (const method of ['piloted', 'afk'])
  for (const stream of [false, true])
    for (const priority of [false, true])
      run('ffxiv-monowheel-s1', { method, addons: [], stream, priority });

// Service WITHOUT afkPrice — AFK falls back to price × afkMultiplier
for (const method of ['piloted', 'afk'])
  run('ffxiv-lowrider-t1rant', { method, addons: [], stream: false, priority: false });

// groupFirst service with a renamed second method (afkPrice 320 < piloted 380)
for (const method of ['piloted', 'afk'])
  run('ffxiv-juedi-mount', { method, addons: [], stream: true, priority: true });

// Service with a checkbox add-on — each add-on on/off, both methods, min/max extras
for (const method of ['piloted', 'afk']) {
  run('ffxiv-morbol-mount', { method, addons: [], stream: false, priority: false });
  run('ffxiv-morbol-mount', { method, addons: ['no-spells'], stream: false, priority: false });
  run('ffxiv-morbol-mount', { method, addons: ['no-spells'], stream: true, priority: true });
}

// Defensive: malformed configs must return null, never throw
const nullCases = [
  ['unknown service', 'does-not-exist', { family: 'savagemount', method: 'piloted', addons: [], stream: false, priority: false }],
  ['unknown method', 'ffxiv-monowheel-s1', { family: 'savagemount', method: 'group', addons: [], stream: false, priority: false }],
  ['unknown addon id', 'ffxiv-morbol-mount', { family: 'savagemount', method: 'piloted', addons: ['nope'], stream: false, priority: false }],
  ['addon id on service without addons', 'ffxiv-monowheel-s1', { family: 'savagemount', method: 'piloted', addons: ['no-spells'], stream: false, priority: false }],
];
for (const [label, serviceId, cfg] of nullCases) {
  const line = computeSavageMountLine(db, serviceId, cfg);
  const ok = line === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} null: ${label}`);
  ok ? pass++ : fail++;
}

console.log(fail === 0 ? `ALL ${pass} TESTS PASSED` : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
