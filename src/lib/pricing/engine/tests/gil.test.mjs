/* Golden test for the gil pricing family (src/lib/pricing/engine/gil.ts).
   The GOLDEN function below is the ORIGINAL GilPurchaseBox formula copied
   verbatim from `git show HEAD:src/components/GilPurchaseBox.tsx`:

     // Direct Account Delivery carries a +10% fee over the base rate
     const total = millions * pricePerMillion * (dad ? 1.1 : 1);
     // addItem: price: pricePerMillion * (dad ? 1.1 : 1), qty: millions

   The trade method (Mannequin / Face to Face) and Region/DC/Server never
   enter the price math, so the matrix covers dad on/off × amount bounds,
   defaults, quick-chip values and mid-range amounts. */
import { readFile } from 'node:fs/promises';
import { lineTotal, mergeCategoryFiles } from '../shared.ts';
import { computeGilLine } from '../gil.ts';

const files = [
  'pricing', 'ffxiv-UltimateRaids', 'ffxiv-Gil', 'ffxiv-SavageRaids', 'ffxiv-Leveling',
  'ffxiv-PvP', 'ffxiv-Mounts', 'ffxiv-Trials', 'ffxiv-DeepDungeons', 'ffxiv-AllianceRaids',
  'ffxiv-Criterion', 'ffxiv-Relics', 'ffxiv-Reputation', 'ffxiv-FieldExplorations', 'ffxiv-Catalog',
];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

// GOLDEN reference — the original inline box formula, verbatim:
const goldenUnitPrice = (pricePerMillion, dad) => pricePerMillion * (dad ? 1.1 : 1);
const goldenTotal = (millions, pricePerMillion, dad) => millions * pricePerMillion * (dad ? 1.1 : 1);

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = typeof actual === 'number' && typeof expected === 'number'
    ? Math.abs(actual - expected) <= 1e-9
    : actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: actual=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};

const SERVICE_ID = 'ffxiv-gil-pack';
const ppm = db.gil.pricePerMillion;

// Matrix: min (5, also the UI default), quick chips, mid values, max (900) × dad off/on
const amounts = [5, 10, 20, 50, 100, 200, 333, 777, 899, 900];
for (const millions of amounts) {
  for (const dad of [false, true]) {
    const cfg = { family: 'gil', dad, millions };
    const line = computeGilLine(db, SERVICE_ID, cfg);
    if (!line) {
      check(`${millions}M dad=${dad}`, 'null', 'line');
      continue;
    }
    check(`${millions}M dad=${dad} unit price`, line.price, goldenUnitPrice(ppm, dad));
    check(`${millions}M dad=${dad} qty`, line.qty, millions);
    check(`${millions}M dad=${dad} total`, lineTotal(line), goldenTotal(millions, ppm, dad));
  }
}

// Defensive: malformed configs must return null, never throw
check('missing gil db block', computeGilLine({}, SERVICE_ID, { family: 'gil', dad: false, millions: 5 }), null);
check('millions below min', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: false, millions: 4 }), null);
check('millions above max', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: true, millions: 901 }), null);
check('millions zero', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: false, millions: 0 }), null);
check('millions NaN', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: false, millions: NaN }), null);
check('millions Infinity', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: false, millions: Infinity }), null);
check('millions string', computeGilLine(db, SERVICE_ID, { family: 'gil', dad: false, millions: '100' }), null);

console.log(fail === 0 ? `ALL TESTS PASSED (${pass})` : `${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
