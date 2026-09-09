/* Staff workflow: remove a service from the service catalog.

   Usage:
     node scripts/remove-service.mjs <service-id>

   Deletes public/db/services/<game>/<id>.json, removes the id from the
   manifest (public/db/services/<game>/index.json) and from any proxy lists,
   syncs the byte-identical fallback copies under src/data/bundled/, and
   regenerates src/data/bundled/icon-names.json. Refuses unknown ids —
   nothing is written then. Run npm run validate:services afterwards. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJson,
  writeJson,
  serializeGameIndex,
  regenerateIconNames,
  listGameDirs,
  listServiceFiles,
} from './lib/serviceChecks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVICES_ROOT = path.join(ROOT, 'public', 'db', 'services');

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) {
  console.error('Usage: node scripts/remove-service.mjs <service-id>');
  process.exit(1);
}

/* Find the service file across every game directory. */
let gameId;
for (const g of listGameDirs(SERVICES_ROOT)) {
  if (listServiceFiles(path.join(SERVICES_ROOT, g)).includes(`${id}.json`)) {
    gameId = g;
    break;
  }
}
if (!gameId) {
  console.error(`[remove-service] ERROR unknown service id ${JSON.stringify(id)} — no public/db/services/*/${id}.json`);
  process.exit(1);
}

const index = readJson(ROOT, `public/db/services/${gameId}/index.json`);
const sub = (index.subcategories ?? []).find((s) => (s.services ?? []).includes(id));
if (!sub) {
  console.error(`[remove-service] ERROR ${id}.json exists but is not listed in public/db/services/${gameId}/index.json — fix the manifest (or run npm run validate:services) instead of removing`);
  process.exit(1);
}

sub.services = sub.services.filter((s) => s !== id);
/* Proxies referencing the removed id would dangle — strip them too. */
let strippedProxies = 0;
for (const s of index.subcategories) {
  if (!s.proxies?.includes(id)) continue;
  s.proxies = s.proxies.filter((p) => p !== id);
  strippedProxies++;
}

fs.rmSync(path.join(SERVICES_ROOT, gameId, `${id}.json`));
fs.rmSync(path.join(ROOT, 'src', 'data', 'bundled', 'services', gameId, `${id}.json`));
const newIndex = serializeGameIndex(index.game, index.subcategories);
writeJson(ROOT, `public/db/services/${gameId}/index.json`, newIndex);
writeJson(ROOT, `src/data/bundled/services/${gameId}/index.json`, newIndex);
regenerateIconNames(ROOT);

console.log(`[remove-service] done — removed "${id}" from game "${gameId}", subcategory "${sub.id}"${strippedProxies ? ` (also stripped from ${strippedProxies} proxy list${strippedProxies > 1 ? 's' : ''})` : ''}`);
console.log(`
Next steps:
  1. Run npm run validate:services
  2. Pricing: remove the service's methodPrices/addonPrices/engine entries from the matching public/db/pricing/${gameId}/<Category>.json files (stale entries are inert but dead weight).`);
