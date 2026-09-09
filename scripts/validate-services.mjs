/* Validator for the service catalog JSON (public/db/services/<game>/,
   authored via templates/service.template.json + scripts/add-service.mjs).
   Zero dependencies, plain node; exits non-zero on any failure. Runs as part
   of `npm run build`.

   Layout:
     public/db/services/<game>/index.json            generated manifest — game
                                                     meta + subcategory -> service
                                                     id lists (order = display order)
     public/db/services/<game>/shared-sections.json  shared accordion sections
     public/db/services/<game>/<service-id>.json     { game, subcategory, service, subpage? }

   Checks:
   - every JSON file parses; manifest game fields present; game id kebab-case
     and matching its folder; cardImage/logo exist under public/
   - subcategory ids kebab-case/unique per game, no serialized 'all'
   - manifest <-> directory sync: every service file is listed exactly once in
     the manifest, every manifest id has a file (no orphans, no missing), and
     each file's game/subcategory matches its folder/manifest placement
   - service entries: required fields, price >= 0, tag enum, image paths under
     public/images/; file name matches service.id; ids unique across all games
   - subpages: reward icon names exist in src/data/iconMap.ts (regex-parsed)
     and match src/data/bundled/icon-names.json; accordion { "ref": "<slug>" }
     resolves against the game's shared-sections.json; dutyButton.to points at
     /boosting/<game>/<existing service id>
   - proxies reference existing service ids of the same game
   - the src/data/bundled/services/ tree is byte-identical to public/db/services/
   - templates/service.template.json stays structurally valid (placeholder
     values are expected there; it is NOT treated as part of the catalog) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  makeReporter,
  readJson,
  readIconMapKeys,
  KEBAB,
  checkImagePath,
  checkServiceEntry,
  checkSubpageEntry,
  checkAccordionEntry,
  listGameDirs,
  listServiceFiles,
} from './lib/serviceChecks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const { errors } = makeReporter('validate');
const fail = (msg) => {
  errors.push(msg);
  console.error(`[validate] ERROR ${msg}`);
};

const readJsonSafe = (rel) => {
  try {
    return readJson(ROOT, rel);
  } catch (err) {
    fail(`${rel}: does not parse as JSON — ${err.message}`);
    return undefined;
  }
};

const publicPathExists = (p, where) => {
  if (typeof p !== 'string' || !p.startsWith('/')) {
    fail(`${where}: path must be an absolute URL path starting with '/', got ${JSON.stringify(p)}`);
    return;
  }
  if (!fs.existsSync(path.join(PUBLIC, p))) fail(`${where}: ${p} does not exist under public/`);
};

/* --- Game catalogs ---------------------------------------------------------- */

const servicesRoot = path.join(PUBLIC, 'db', 'services');
const gameDirs = listGameDirs(servicesRoot);
if (gameDirs.length === 0) fail('public/db/services/: no game directories found');

const games = new Map(); // gameId -> { serviceIds:Set, sharedSlugs:Set, files:[{id, rel, data}] }
const allServiceIds = new Map(); // serviceId -> gameId
let subpageCount = 0;

for (const gameId of gameDirs) {
  const where = `public/db/services/${gameId}`;

  /* Manifest */
  const index = readJsonSafe(`${where}/index.json`);
  if (!index) continue;
  const g = index.game ?? {};
  for (const field of ['id', 'name', 'short', 'tagline', 'description', 'cardImage', 'logo']) {
    if (typeof g[field] !== 'string' || !g[field]) fail(`${where}/index.json: game missing required field "${field}"`);
  }
  if (!KEBAB.test(g.id ?? '')) fail(`${where}/index.json: game id ${JSON.stringify(g.id)} is not kebab-case`);
  if (g.id !== gameId) fail(`${where}/index.json: game id ${JSON.stringify(g.id)} does not match the folder name`);
  if (g.main !== undefined && typeof g.main !== 'boolean') fail(`${where}/index.json: "main" must be a boolean`);
  if (typeof g.cardImage === 'string') publicPathExists(g.cardImage, `${where}/index.json cardImage`);
  if (typeof g.logo === 'string') publicPathExists(g.logo, `${where}/index.json logo`);
  if (!Array.isArray(index.subcategories)) {
    fail(`${where}/index.json: "subcategories" must be an array`);
    continue;
  }

  const subIds = new Set();
  const manifestPlacement = new Map(); // serviceId -> subcategoryId
  for (const sub of index.subcategories) {
    const subWhere = `${where}/index.json subcategory ${sub.id}`;
    if (typeof sub.id !== 'string' || !KEBAB.test(sub.id)) fail(`${subWhere}: id missing or not kebab-case`);
    if (subIds.has(sub.id)) fail(`${subWhere}: duplicate subcategory id in ${gameId}`);
    subIds.add(sub.id);
    if (sub.id === 'all') fail(`${subWhere}: the synthetic 'all' subcategory must not be serialized`);
    if (typeof sub.name !== 'string' || !sub.name) fail(`${subWhere}: missing name`);
    if (sub.proxies !== undefined && !Array.isArray(sub.proxies)) fail(`${subWhere}: "proxies" must be an array`);
    if (!Array.isArray(sub.services)) {
      fail(`${subWhere}: "services" must be an array of service ids`);
      continue;
    }
    for (const id of sub.services) {
      if (typeof id !== 'string' || !KEBAB.test(id)) fail(`${subWhere}: service id ${JSON.stringify(id)} is not kebab-case`);
      if (manifestPlacement.has(id)) {
        fail(`${subWhere}: service ${JSON.stringify(id)} is listed twice (also in subcategory "${manifestPlacement.get(id)}")`);
      }
      manifestPlacement.set(id, sub.id);
    }
  }

  /* Manifest <-> directory sync */
  const dir = path.join(servicesRoot, gameId);
  const files = listServiceFiles(dir);
  for (const f of files) {
    const id = f.replace(/\.json$/, '');
    if (!manifestPlacement.has(id)) fail(`${where}/${f}: service file is not listed in index.json (orphan)`);
  }
  for (const id of manifestPlacement.keys()) {
    if (!files.includes(`${id}.json`)) fail(`${where}/index.json: lists ${JSON.stringify(id)} but ${id}.json is missing`);
  }

  /* Shared accordion sections */
  const sharedRel = `${where}/shared-sections.json`;
  const shared = fs.existsSync(path.join(ROOT, sharedRel)) ? readJsonSafe(sharedRel) : {};
  const sharedSlugs = new Set(Object.keys(shared ?? {}));
  for (const [slug, section] of Object.entries(shared ?? {})) {
    if (!KEBAB.test(slug)) fail(`${sharedRel} ${JSON.stringify(slug)}: slug not kebab-case`);
    checkAccordionEntry(section, `${sharedRel} ${slug}`, { fail }, null);
  }

  /* Service files — structural checks (subpage cross-references in pass 2) */
  const serviceIds = new Set();
  const parsed = [];
  for (const f of files) {
    const rel = `${where}/${f}`;
    const data = readJsonSafe(rel);
    if (!data) continue;
    const sv = data.service ?? {};
    const svWhere = `${rel} service ${sv.id ?? f}`;
    if (data.game !== gameId) fail(`${rel}: declares game ${JSON.stringify(data.game)}, expected "${gameId}"`);
    const placement = manifestPlacement.get(sv.id);
    if (placement && data.subcategory !== placement) {
      fail(`${rel}: declares subcategory ${JSON.stringify(data.subcategory)}, but index.json lists it under "${placement}"`);
    }
    if (sv.id !== f.replace(/\.json$/, '')) fail(`${rel}: service.id ${JSON.stringify(sv.id)} does not match the file name`);
    checkServiceEntry(ROOT, sv, svWhere, { fail }, { imageMode: 'strict' });
    const other = allServiceIds.get(sv.id);
    if (other) fail(`${svWhere}: service id already used by game "${other}"`);
    allServiceIds.set(sv.id, gameId);
    serviceIds.add(sv.id);
    parsed.push({ id: sv.id, rel, data });
    if (data.subpage !== undefined) subpageCount++;
  }

  /* Proxies target services of the same game */
  for (const sub of index.subcategories) {
    for (const proxy of sub.proxies ?? []) {
      if (!serviceIds.has(proxy)) {
        fail(`${where}/index.json subcategory ${sub.id}: proxy ${JSON.stringify(proxy)} is not a service id of game "${gameId}"`);
      }
    }
  }

  games.set(gameId, { serviceIds, sharedSlugs, files: parsed });
}

/* --- Service subpages (pass 2 — dutyButton targets need every service id) --- */

const iconNames = readJsonSafe('src/data/bundled/icon-names.json');
if (iconNames !== undefined && (!Array.isArray(iconNames) || iconNames.some((n) => typeof n !== 'string'))) {
  fail('src/data/bundled/icon-names.json: must be an array of strings');
}

/* ICON_MAP keys from src/data/iconMap.ts (validator stays plain node, so the
   keys are regex-parsed out of the source instead of importing the module). */
const iconMapKeys = readIconMapKeys(ROOT);
if (iconMapKeys.size === 0) fail('src/data/iconMap.ts: no ICON_MAP keys found (regex parse failed?)');

const foundIcons = new Set();
for (const game of games.values()) {
  for (const { id, data } of game.files) {
    if (data.subpage === undefined) continue;
    checkSubpageEntry(ROOT, id, data.subpage, { fail }, {
      imageMode: 'strict',
      sharedSlugs: game.sharedSlugs,
      iconMapKeys,
      dutyTargets: allServiceIds,
    });
    for (const reward of data.subpage.rewards ?? []) {
      if (typeof reward.icon === 'string') foundIcons.add(reward.icon);
    }
  }
}

if (Array.isArray(iconNames)) {
  const expected = [...foundIcons].sort();
  if (JSON.stringify(iconNames) !== JSON.stringify(expected)) {
    fail(`src/data/bundled/icon-names.json is out of sync with the icons used in the subpages (expected ${expected.join(', ')})`);
  }
}

/* --- Bundled fallback copies must be byte-identical ------------------------- */

const treeFiles = (rootDir) => {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else out.push(path.relative(rootDir, abs));
    }
  };
  walk(rootDir);
  return out.sort();
};

const publicFiles = treeFiles(path.join(PUBLIC, 'db', 'services'));
const bundledRoot = path.join(ROOT, 'src', 'data', 'bundled', 'services');
const bundledFiles = treeFiles(bundledRoot);
for (const rel of publicFiles) {
  if (!bundledFiles.includes(rel)) {
    fail(`src/data/bundled/services/${rel}: missing bundled copy`);
    continue;
  }
  const pub = fs.readFileSync(path.join(PUBLIC, 'db', 'services', rel));
  const bun = fs.readFileSync(path.join(bundledRoot, rel));
  if (!pub.equals(bun)) {
    fail(`src/data/bundled/services/${rel}: not byte-identical to public/db/services/${rel} — sync it (copy the public/db file over it)`);
  }
}
for (const rel of bundledFiles) {
  if (!publicFiles.includes(rel)) fail(`src/data/bundled/services/${rel}: no matching public/db/services file`);
}

/* --- The staff template itself (structural only — placeholders expected) ---- */

const template = readJsonSafe('templates/service.template.json');
if (template) {
  const tWhere = 'templates/service.template.json';
  if (typeof template._guide !== 'object' || template._guide === null) fail(`${tWhere}: missing the "_guide" documentation block`);
  if (!games.has(template.game)) fail(`${tWhere}: game ${JSON.stringify(template.game)} has no services directory`);
  if (typeof template.subcategory !== 'string') fail(`${tWhere}: "subcategory" must be a string`);
  /* placeholder id/subcategory are expected — uniqueness and subcategory
     existence checks intentionally skipped */
  checkServiceEntry(ROOT, template.service ?? {}, `${tWhere} service`, { fail }, { imageMode: 'prefix' });
  if (template.subpage !== undefined) {
    checkSubpageEntry(ROOT, template.service?.id ?? '<id>', template.subpage, { fail }, {
      imageMode: 'prefix',
      sharedSlugs: games.get(template.game)?.sharedSlugs ?? new Set(),
      iconMapKeys,
      /* dutyButton target is a placeholder — not cross-checked */
    });
  }
}

if (errors.length > 0) {
  console.error(`[validate] ${errors.length} error(s)`);
  process.exit(1);
}
const sharedCount = [...games.values()].reduce((n, g) => n + g.sharedSlugs.size, 0);
console.log(
  `[validate] OK — ${games.size} games, ${allServiceIds.size} services, ${subpageCount} subpages, ${sharedCount} shared sections`,
);
