import { readFile } from 'node:fs/promises';
import { fromPrice, mergeCategoryFiles } from '../index.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
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
const gilPack = JSON.parse(await readFile('public/db/ffxiv-Gil.json', 'utf8'));
check('ffxiv-gil-pack', fromPrice(db, 'ffxiv-gil-pack'), gilPack.methodPrices['ffxiv-gil-pack'].piloted);

// Leveling: fromPrice from the leveling block
const leveling = JSON.parse(await readFile('public/db/ffxiv-Leveling.json', 'utf8'));
if (leveling.leveling?.serviceId)
  check(leveling.leveling.serviceId, fromPrice(db, leveling.leveling.serviceId), leveling.leveling.fromPrice);

// Trials: floor equals the JSON price for each trial service
const trials = JSON.parse(await readFile('public/db/ffxiv-Trials.json', 'utf8'));
for (const [id, t] of Object.entries(trials.trials ?? {}).slice(0, 3))
  check(id, fromPrice(db, id), t.price);

// Unknown service must fail open (null, not a flag)
check('unknown-service', fromPrice(db, 'does-not-exist'), null);

// Account listings: the bundled price in games.ts must exist as a db floor.
// Account lines carry no pricing config, so the worker's verifyPrices can only
// check them via servicePrices — without this entry any quoted price passes.
const gamesSrc = await readFile('src/data/games.ts', 'utf8');
const accountListings = [
  ...gamesSrc.matchAll(/id: '([a-z0-9]+-[a-z0-9-]+)',[\s\S]{0,800}?\bprice: (\d+),[\s\S]{0,800}?account: \{/g),
];
if (accountListings.length === 0) {
  console.log('FAIL no account listings found in games.ts (regex stale?)');
  fail++;
} else {
  for (const [, id, price] of accountListings)
    check(`${id} (account) floor matches bundled price`, fromPrice(db, id), Number(price));
}

// Coverage report: how many ids across all maps get a floor
const ids = new Set([
  ...Object.keys(db.methodPrices ?? {}), ...Object.keys(db.servicePrices ?? {}),
  ...Object.keys(db.trials ?? {}), ...Object.keys(db.trialBundles ?? {}),
  ...Object.keys(db.deepDungeons ?? {}), ...Object.keys(db.criterion ?? {}),
  ...Object.keys(db.relics ?? {}), ...Object.keys(db.mounts?.wings ?? {}),
  ...Object.keys(db.mounts?.series ?? {}), ...Object.keys(db.mounts?.savageMounts ?? {}),
]);
const withFloor = [...ids].filter((id) => fromPrice(db, id) != null);
console.log(`\ncoverage: ${withFloor.length}/${ids.size} catalog ids have a floor`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
