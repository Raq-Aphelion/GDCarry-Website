/* Golden test for the mountseries pricing family: pins
   computeMountSeriesLine (src/lib/pricing/engine/mountseries.ts) against the
   ORIGINAL MountSeriesPurchaseBox formula, copied verbatim from
   `git show HEAD:src/components/MountSeriesPurchaseBox.tsx`. */
import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeMountSeriesLine } from '../mountseries.ts';

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
//   const cfg = db.mounts?.series?.[service.id];
//   const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
//   const priorityMultiplier = db.purchaseBox.priorityMultiplier;
const golden = (db, serviceId, { method, checked, addon, stream, priority }) => {
  const cfg = db.mounts?.series?.[serviceId];
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const allChecked = cfg ? checked.length === cfg.mounts.length : false;
  // Separate-selection prices follow the method: explicit afkPrice when the
  // DB provides one, otherwise the afkMultiplier (+10%)
  const displayPrice = (m) =>
    method === 'afk' ? (m.afkPrice ?? Number((m.price * afkMultiplier).toFixed(2))) : m.price;
  // Bundle price follows the method the same way (afkBundlePrice override)
  const bundleTotal = (c) =>
    method === 'afk' ? (c.afkBundlePrice ?? Number((c.bundlePrice * afkMultiplier).toFixed(2))) : c.bundlePrice;
  const mountsTotal = allChecked
    ? bundleTotal(cfg)
    : checked.reduce((s, id) => {
        const m = cfg?.mounts.find((x) => x.id === id);
        return s + (m ? displayPrice(m) : 0);
      }, 0);
  const addonPrice = addon ? cfg?.addon?.price ?? 0 : 0;
  const streamPrice = 10;
  return (
    (mountsTotal + addonPrice * (method === 'afk' ? afkMultiplier : 1)) * (priority ? priorityMultiplier : 1) +
    (stream ? streamPrice : 0)
  );
};
// -----------------------------------------------------------------------------

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const run = (serviceId, cfg) => {
  const line = computeMountSeriesLine(db, serviceId, { family: 'mountseries', ...cfg });
  check(
    `${serviceId} ${cfg.method} checked=[${cfg.checked}] addon=${cfg.addon} stream=${cfg.stream} priority=${cfg.priority}`,
    line ? lineTotal(line) : null,
    golden(db, serviceId, cfg),
  );
};

// ffxiv-kirin-mount: no per-mount afkPrice, no afkBundlePrice (afkMultiplier
// path), has the Nightmare add-on. Selections: none (min), one, partial,
// all (default = bundle), × both methods × add-on on/off.
const kirinMounts = db.mounts.series['ffxiv-kirin-mount'].mounts.map((m) => m.id);
const kirinSelections = [
  [],
  [kirinMounts[0]],
  [kirinMounts[1], kirinMounts[3]],
  kirinMounts, // all checked → bundle price
];
for (const method of ['piloted', 'afk'])
  for (const checked of kirinSelections)
    for (const addon of [false, true])
      run('ffxiv-kirin-mount', { method, checked, addon, stream: false, priority: false });

// Max extras: bundle + addon + stream + priority, both methods
for (const method of ['piloted', 'afk'])
  run('ffxiv-kirin-mount', { method, checked: kirinMounts, addon: true, stream: true, priority: true });

// ffxiv-wings-of-legacy: explicit per-mount afkPrice AND afkBundlePrice
const wingsMounts = db.mounts.series['ffxiv-wings-of-legacy'].mounts.map((m) => m.id);
const wingsSelections = [[], [wingsMounts[0]], [wingsMounts[5], wingsMounts[6]], wingsMounts];
for (const method of ['piloted', 'afk'])
  for (const checked of wingsSelections)
    for (const stream of [false, true])
      for (const priority of [false, true])
        run('ffxiv-wings-of-legacy', { method, checked, addon: false, stream, priority });

// A series without an add-on (Firebird): addon flag is a no-op, bundle path
const firebirdMounts = db.mounts.series['ffxiv-firebird-mount'].mounts.map((m) => m.id);
for (const method of ['piloted', 'afk']) {
  run('ffxiv-firebird-mount', { method, checked: firebirdMounts, addon: false, stream: false, priority: false });
  run('ffxiv-firebird-mount', { method, checked: [firebirdMounts[2]], addon: true, stream: true, priority: true });
}

// Defensive: malformed configs must return null, never throw
const nullCases = [
  ['unknown service', 'does-not-exist', { family: 'mountseries', method: 'piloted', checked: [], addon: false, stream: false, priority: false }],
  ['unknown method', 'ffxiv-kirin-mount', { family: 'mountseries', method: 'group', checked: [], addon: false, stream: false, priority: false }],
  ['unknown mount id', 'ffxiv-kirin-mount', { family: 'mountseries', method: 'piloted', checked: ['nope'], addon: false, stream: false, priority: false }],
  ['mount id from another series', 'ffxiv-kirin-mount', { family: 'mountseries', method: 'piloted', checked: [wingsMounts[0]], addon: false, stream: false, priority: false }],
];
for (const [label, serviceId, cfg] of nullCases) {
  const line = computeMountSeriesLine(db, serviceId, cfg);
  const ok = line === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} null: ${label}`);
  ok ? pass++ : fail++;
}

console.log(fail === 0 ? `ALL ${pass} TESTS PASSED` : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
