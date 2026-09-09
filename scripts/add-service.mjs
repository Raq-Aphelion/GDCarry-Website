/* Staff workflow: merge a filled-in copy of templates/service.template.json
   into the service catalog.

   Usage:
     node scripts/add-service.mjs <filled-template.json> [--dry-run]

   Validates the entry against the catalog (duplicate ids, unknown
   game/subcategory, unknown icon names, unknown shared-section refs, image
   paths outside images/), then writes public/db/services/<game>/<id>.json,
   appends the id to its subcategory in the generated manifest
   (public/db/services/<game>/index.json), and syncs the byte-identical
   fallback copies under src/data/bundled/. Run npm run validate:services
   afterwards. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  makeReporter,
  readJson,
  readIconMapKeys,
  writeJson,
  checkServiceEntry,
  checkSubpageEntry,
  serializeService,
  serializeSubpage,
  serializeGameIndex,
  serializeServiceFile,
  regenerateIconNames,
  findPlaceholders,
  listGameDirs,
  listServiceFiles,
} from './lib/serviceChecks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVICES_ROOT = path.join(ROOT, 'public', 'db', 'services');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node scripts/add-service.mjs <filled-template.json> [--dry-run]');
  process.exit(1);
}

const reporter = makeReporter('add-service');
let template;
try {
  template = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
} catch (err) {
  console.error(`[add-service] ERROR ${file}: does not parse as JSON — ${err.message}`);
  process.exit(1);
}
delete template._guide; // documentation block — ignored

/* --- Placeholder scan -------------------------------------------------------- */

const placeholders = findPlaceholders(template);
if (placeholders.length > 0) {
  for (const p of placeholders) reporter.fail(`template still has a placeholder value at ${p}`);
  console.error('[add-service] fill in every EXAMPLE / <...> value from templates/service.template.json first');
  process.exit(1);
}

/* --- Load the catalog --------------------------------------------------------- */

const game = template.game;
const subId = template.subcategory;
const service = template.service;
const subpage = template.subpage;

let gameIndex;
try {
  gameIndex = readJson(ROOT, `public/db/services/${game}/index.json`);
} catch {
  reporter.fail(`unknown game ${JSON.stringify(game)} — no public/db/services/${game}/index.json`);
}
const sharedRel = `public/db/services/${game}/shared-sections.json`;
const sharedData =
  subpage !== undefined && fs.existsSync(path.join(ROOT, sharedRel)) ? readJson(ROOT, sharedRel) : {};
const iconMapKeys = readIconMapKeys(ROOT);

/* service id -> gameId across every game directory (duplicate detection) */
const allServiceIds = new Map();
for (const g of listGameDirs(SERVICES_ROOT)) {
  for (const f of listServiceFiles(path.join(SERVICES_ROOT, g))) {
    try {
      const data = readJson(ROOT, `public/db/services/${g}/${f}`);
      allServiceIds.set(data.service?.id ?? f.replace(/\.json$/, ''), g);
    } catch {
      /* broken file — the validator reports it */
    }
  }
}

/* --- Checks ------------------------------------------------------------------- */

if (typeof game !== 'string') reporter.fail('"game" must be a game id string');
if (typeof subId !== 'string') reporter.fail('"subcategory" must be a subcategory id string');
if (typeof service !== 'object' || service === null) reporter.fail('"service" must be an object');
if (subpage !== undefined && (typeof subpage !== 'object' || subpage === null)) reporter.fail('"subpage" must be an object — delete it for a category-only card');

let targetSub;
if (gameIndex && typeof subId === 'string') {
  targetSub = (gameIndex.subcategories ?? []).find((s) => s.id === subId);
  if (!targetSub) {
    reporter.fail(
      `unknown subcategory ${JSON.stringify(subId)} in game "${game}" — available: ${(gameIndex.subcategories ?? []).map((s) => s.id).join(', ')}`,
    );
  }
}

if (service && typeof service === 'object') {
  const where = `service ${JSON.stringify(service.id)}`;
  checkServiceEntry(ROOT, service, where, reporter, { imageMode: 'staff' });
  if (allServiceIds.has(service.id)) {
    reporter.fail(`${where}: id already exists in game "${allServiceIds.get(service.id)}"`);
  }
  if (typeof service.id === 'string' && game && !service.id.startsWith(`${game}-`)) {
    reporter.warn(`${where}: id does not start with the game prefix "${game}-" (convention, not enforced)`);
  }
}

if (subpage && typeof subpage === 'object' && service?.id) {
  checkSubpageEntry(ROOT, service.id, subpage, reporter, {
    imageMode: 'staff',
    sharedSlugs: new Set(Object.keys(sharedData)),
    iconMapKeys,
    /* the subpage may link to itself (dutyButton), so include the new id */
    dutyTargets: new Map([...allServiceIds, [service.id, game]]),
  });
}

if (subpage === undefined) {
  reporter.warn('no "subpage" block — the card will link to its category page only');
}

if (reporter.errors.length > 0) {
  console.error(`[add-service] ${reporter.errors.length} error(s) — nothing was written`);
  process.exit(1);
}

/* --- Merge --------------------------------------------------------------------- */

const newService = serializeService(service);
const newPage = subpage ? serializeSubpage(subpage) : undefined;
const fileData = serializeServiceFile(game, subId, newService, newPage);

console.log(`[add-service] ${dryRun ? 'DRY RUN — would change' : 'merging'}:`);
console.log(`  + public/db/services/${game}/${newService.id}.json (subcategory "${subId}", ${targetSub.services.length} -> ${targetSub.services.length + 1} services${newPage ? ', with subpage' : ''})`);

if (!dryRun) {
  targetSub.services.push(newService.id);
  const newIndex = serializeGameIndex(gameIndex.game, gameIndex.subcategories);
  writeJson(ROOT, `public/db/services/${game}/${newService.id}.json`, fileData);
  writeJson(ROOT, `src/data/bundled/services/${game}/${newService.id}.json`, fileData);
  writeJson(ROOT, `public/db/services/${game}/index.json`, newIndex);
  writeJson(ROOT, `src/data/bundled/services/${game}/index.json`, newIndex);
  /* regenerate the used-icon list the validator sync-checks */
  regenerateIconNames(ROOT);
  console.log(`[add-service] done — ${newService.id} is in the catalog`);
}

console.log(`
Next steps:
  1. Add the card image: public${newService.image} (webp, same style as the other cards)${dryRun ? '' : fs.existsSync(path.join(ROOT, 'public', newService.image)) ? ' — already present' : ' — MISSING, the validator will fail until it exists'}
  2. Run npm run validate:services
  3. Pricing: flat-price services work as-is (catalog fallback price). Services with methods/add-ons (piloted vs AFK, runs, …) also need a methodPrices (or engine config) entry in the matching public/db/pricing/${game}/<Category>.json.`);
