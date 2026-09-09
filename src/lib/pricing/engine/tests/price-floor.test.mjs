import { readdir, readFile } from 'node:fs/promises';
import { fromPrice, mergeCategoryFiles } from '../index.ts';
import { CATEGORY_FILES, GLOBAL_PRICING_FILE } from '../../../../data/pricing.ts';

const files = [GLOBAL_PRICING_FILE, ...CATEGORY_FILES];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: floor=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};

// Gil pack: methodPrices { piloted: 3.75 } — no afk → floor is piloted
const gilPack = JSON.parse(await readFile('public/db/pricing/ffxiv/Gil.json', 'utf8'));
check('ffxiv-gil-pack', fromPrice(db, 'ffxiv-gil-pack'), gilPack.methodPrices['ffxiv-gil-pack'].piloted);

// Leveling: fromPrice from the leveling block
const leveling = JSON.parse(await readFile('public/db/pricing/ffxiv/Leveling.json', 'utf8'));
if (leveling.leveling?.serviceId)
  check(leveling.leveling.serviceId, fromPrice(db, leveling.leveling.serviceId), leveling.leveling.fromPrice);

// Trials: floor equals the JSON price for each trial service
const trials = JSON.parse(await readFile('public/db/pricing/ffxiv/Trials.json', 'utf8'));
for (const [id, t] of Object.entries(trials.trials ?? {}).slice(0, 3))
  check(id, fromPrice(db, id), t.price);

// Unknown service must fail open (null, not a flag)
check('unknown-service', fromPrice(db, 'does-not-exist'), null);

// EVERY catalog service must be verifiable worker-side: account-style lines
// and any config-less payload fall back to the fromPrice floor in
// verifyPrices, so a catalog service with no db price would pass any quote.
// Pair each service id with its bundled fallback price from the service
// catalog (public/db/services/<gameId>/<service-id>.json — the synthetic
// 'all' bucket is app-side only, never serialized).
const gamesDir = 'public/db/services';
const catalogServices = new Map(); // service id -> bundled fallback price
const accountListings = []; // [id, bundledPrice]
for (const gameId of (await readdir(gamesDir, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)) {
  const dir = `${gamesDir}/${gameId}`;
  for (const f of (await readdir(dir)).filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'shared-sections.json')) {
    const { service: sv } = JSON.parse(await readFile(`${dir}/${f}`, 'utf8'));
    catalogServices.set(sv.id, sv.price);
    if (sv.account) accountListings.push([sv.id, sv.price]);
  }
}
if (catalogServices.size < 50) {
  console.log(`FAIL only ${catalogServices.size} catalog services found`);
  fail++;
} else {
  console.log(`catalog services found: ${catalogServices.size}`);
  for (const [id, bundled] of catalogServices) {
    const floor = fromPrice(db, id);
    if (floor == null) {
      console.log(`FAIL ${id}: no db price — worker cannot verify this line`);
      fail++;
    } else if (bundled > 0 && floor !== bundled) {
      console.log(`FAIL ${id}: db price ${floor} != bundled fallback ${bundled} (drift)`);
      fail++;
    } else {
      pass++;
    }
  }
}

// Account listings (subset of the catalog check above, explicit message):
// account lines carry no pricing config, so the worker's verifyPrices can
// only check them via the accounts map in ffxiv-Accounts.json.
if (accountListings.length === 0) {
  console.log('FAIL no account listings found in public/db/services/');
  fail++;
} else {
  for (const [id, price] of accountListings)
    check(`${id} (account) floor matches bundled price`, fromPrice(db, id), price);
}

// Coverage report: how many ids across all maps get a floor
const ids = new Set([
  ...Object.keys(db.methodPrices ?? {}), ...Object.keys(db.servicePrices ?? {}),
  ...Object.keys(db.trials ?? {}), ...Object.keys(db.trialBundles ?? {}),
  ...Object.keys(db.deepDungeons ?? {}), ...Object.keys(db.criterion ?? {}),
  ...Object.keys(db.relics ?? {}), ...Object.keys(db.mounts?.wings ?? {}),
  ...Object.keys(db.mounts?.series ?? {}), ...Object.keys(db.mounts?.savageMounts ?? {}),
  ...Object.keys(db.accounts ?? {}),
]);
const withFloor = [...ids].filter((id) => fromPrice(db, id) != null);
console.log(`\ncoverage: ${withFloor.length}/${ids.size} catalog ids have a floor`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
