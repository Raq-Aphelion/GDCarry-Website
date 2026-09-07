/* Golden test for the run-based pricing family (src/lib/pricing/engine/run.ts) —
   the generic PurchaseBox formula. The GOLDEN function below is the ORIGINAL
   total computation, copied verbatim from
   `git show a2ad9f4^:src/components/PurchaseBox.tsx` (basePrice there came from
   the priceOf context method, which is exactly today's shared fromPrice).
   Every config in the matrix must reproduce it exactly. */
import { readFile } from 'node:fs/promises';
import { fromPrice, lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeRunLine } from '../run.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
  'ffxiv-Accounts',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));
const cfg = db.purchaseBox;

// GOLDEN — verbatim from the pre-extraction PurchaseBox (variable `cfg` there
// is db.purchaseBox; UI state arrives as `u`; `base` is service.price).
const goldenTotal = (gdb, serviceId, base, u) => {
  const c = gdb.purchaseBox;
  const basePrice = fromPrice(gdb, serviceId, base);
  if (basePrice == null) return null;
  const methodPrices = gdb.methodPrices?.[serviceId];
  const methods = [{ id: 'piloted', price: methodPrices?.piloted ?? basePrice }];
  const afkPrice = methodPrices ? methodPrices.afk : Math.max(basePrice - c.afkDiscount, 0);
  if (afkPrice != null) methods.push({ id: 'afk', price: afkPrice });
  if (methodPrices?.groupFirst) methods.reverse();

  const activeMethod = methods.find((m) => m.id === u.method) ?? methods[0];
  const isAfk = activeMethod.id === 'afk';
  const bundleAddons = gdb.serviceAddons?.[serviceId]?.[isAfk ? 'afk' : 'piloted'];
  const ADDONS = [...(gdb.unlockAddon ? [gdb.unlockAddon] : []), ...c.addons];
  const ADDON_LIST = bundleAddons ? ADDONS.flatMap((a) => (a.id === 'unlock' ? bundleAddons : [a])) : ADDONS;
  const effLogIdx = isAfk ? 0 : u.logIdx;
  const effectiveAddons = isAfk ? u.addons.filter((a) => a !== 'stream') : u.addons;
  const addonPriceOf = (a) => {
    const override = gdb.addonPrices?.[serviceId]?.[a.id];
    if (override == null) return a.price;
    if (typeof override === 'number') return override;
    const [seriesId, tier, fightId] = override.ref.split(':');
    const series = gdb.savageSeries?.[seriesId];
    const pilotedFight = series?.piloted?.fights?.[tier]?.find((f) => f.id === fightId);
    const afkFight = series?.afk?.fights?.[tier]?.find((f) => f.id === fightId);
    if (isAfk && afkFight && !afkFight.disabled) return afkFight.price;
    return pilotedFight?.price ?? afkFight?.price ?? a.price;
  };
  const priority = effectiveAddons.includes('priority');
  const logsPercent = c.logOptions[effLogIdx]?.percent ?? 0;
  const flatAddons = ADDON_LIST.filter((a) => a.id !== 'priority' && effectiveAddons.includes(a.id)).reduce(
    (s, a) => s + addonPriceOf(a),
    0,
  );
  // Priority and the parse tier multiply only (method price × runs);
  // gear, flat log fees and add-ons are added afterwards, unaffected.
  const runsPart = activeMethod.price * u.runs * (priority ? c.priorityMultiplier : 1);
  return (
    runsPart * (1 + logsPercent / 100) + c.gearOptions[u.gearIdx].price + c.logOptions[effLogIdx].price + flatAddons
  );
};

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && expected != null && Math.abs(actual - expected) <= 1e-9;
  if (!ok) console.log(`FAIL ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};

const runLine = (serviceId, base, u) =>
  lineTotal(computeRunLine(db, serviceId, { family: 'run', ...u }, base));

const addonIds = [...(db.unlockAddon ? [db.unlockAddon.id] : []), ...cfg.addons.map((a) => a.id)];
const nonPriorityAddons = addonIds.filter((a) => a !== 'priority');
const lastGear = cfg.gearOptions.length - 1;
const lastLog = cfg.logOptions.length - 1;
// Both methods × runs × gear endpoints × log endpoints × representative addon
// subsets. AFK ignores the log index and strips 'stream' — both behaviours are
// pinned by running the same matrix through the golden.
const matrix = [];
for (const method of ['piloted', 'afk'])
  for (const runs of [cfg.runsMin, 5, 99])
    for (const gearIdx of [0, lastGear])
      for (const logIdx of [0, lastLog])
        for (const addons of [[], ['stream'], ['priority'], [...nonPriorityAddons], addonIds])
          matrix.push({ method, runs, gearIdx, logIdx, addons });

// Full matrix over every service with per-method prices (ultimates, savage
// fights, etc.) — these drive the methodPrices/groupFirst branches.
for (const serviceId of Object.keys(db.methodPrices ?? {})) {
  for (const u of matrix) check(`${serviceId} ${JSON.stringify(u)}`, runLine(serviceId, undefined, u), goldenTotal(db, serviceId, undefined, u));
}

// Compact pass over bundle-addon and addon-override services (each addon
// override exercised on both methods), plus a flat sample of plain
// servicePrices entries (afkDiscount model).
const compact = [
  { method: 'piloted', runs: 1, gearIdx: 0, logIdx: 0, addons: [] },
  { method: 'afk', runs: 3, gearIdx: lastGear, logIdx: lastLog, addons: nonPriorityAddons },
  { method: 'piloted', runs: 2, gearIdx: 0, logIdx: lastLog, addons: ['priority'] },
];
const special = new Set([...Object.keys(db.methodPrices ?? {})]);
for (const serviceId of [
  ...Object.keys(db.serviceAddons ?? {}),
  ...Object.keys(db.addonPrices ?? {}),
]) {
  if (special.has(serviceId)) continue;
  special.add(serviceId);
  for (const u of compact) check(`${serviceId} ${JSON.stringify(u)}`, runLine(serviceId, undefined, u), goldenTotal(db, serviceId, undefined, u));
}
let sampled = 0;
for (const serviceId of Object.keys(db.servicePrices)) {
  if (special.has(serviceId)) continue;
  special.add(serviceId);
  if (sampled++ >= 25) break; // servicePrices-only entries all share one code path
  for (const u of compact) check(`${serviceId} ${JSON.stringify(u)}`, runLine(serviceId, undefined, u), goldenTotal(db, serviceId, undefined, u));
}

// staticBase fallback: an id unknown to every catalog family prices from the
// bundled `price:` in the games data — worker-verifiable, golden agrees.
{
  const u = { method: 'piloted', runs: 1, gearIdx: 0, logIdx: 0, addons: [] };
  check('staticBase fallback', runLine('unlisted-service', 42.5, u), goldenTotal(db, 'unlisted-service', 42.5, u));
}

// Defensive: malformed configs return null, never throw
const defensive = [
  ['unknown service, no fallback', 'does-not-exist', { method: 'piloted', runs: 1, gearIdx: 0, logIdx: 0, addons: [] }],
  ['gear index out of range', 'ffxiv-ucob', { method: 'piloted', runs: 1, gearIdx: 99, logIdx: 0, addons: [] }],
  ['log index out of range', 'ffxiv-ucob', { method: 'piloted', runs: 1, gearIdx: 0, logIdx: 99, addons: [] }],
];
for (const [label, id, u] of defensive) {
  const ok = computeRunLine(db, id, { family: 'run', ...u }) === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} defensive: ${label}`);
  ok ? pass++ : fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
