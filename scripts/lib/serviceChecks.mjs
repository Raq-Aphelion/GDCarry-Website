/* Shared checks for the service catalog JSON, used by both
   scripts/validate-services.mjs (whole catalog) and scripts/add-service.mjs
   (single new entry against the catalog). Zero dependencies, plain node.

   Path convention: catalog JSON stores absolute URL paths with a leading
   slash ('/images/...'); staff templates may drop the leading slash —
   normalizeImagePath() canonicalizes to the stored form. */
import fs from 'node:fs';
import path from 'node:path';

export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SERVICE_TAGS = ['Popular', 'Hot', 'New', 'Best Value'];

/* --- Reporters ------------------------------------------------------------- */

export const makeReporter = (label) => {
  const errors = [];
  const warnings = [];
  return {
    errors,
    warnings,
    fail: (msg) => {
      errors.push(msg);
      console.error(`[${label}] ERROR ${msg}`);
    },
    warn: (msg) => {
      warnings.push(msg);
      console.warn(`[${label}] WARNING ${msg}`);
    },
  };
};

/* --- Loading (no validation) ------------------------------------------------ */

export const readJson = (root, rel) =>
  JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

export const readIconMapKeys = (root) => {
  const file = path.join(root, 'src', 'data', 'iconMap.ts');
  if (!fs.existsSync(file)) return new Set();
  const src = fs.readFileSync(file, 'utf8');
  return new Set([...src.slice(src.indexOf('ICON_MAP')).matchAll(/^\s*'([a-z0-9-]+)':/gm)].map((m) => m[1]));
};

export const writeJson = (root, rel, data) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2) + '\n');
};

/* --- Image paths ------------------------------------------------------------ */

/* Accepts '/images/x.webp' or the staff-friendly 'images/x.webp'; returns the
   stored '/images/x.webp' form, or null when the path is not under images/. */
export const normalizeImagePath = (p) => {
  if (typeof p !== 'string') return null;
  const stripped = p.startsWith('/') ? p.slice(1) : p;
  return stripped.startsWith('images/') ? `/${stripped}` : null;
};

/* mode 'strict' (catalog validator): the file must exist under public/.
   mode 'staff' (add script): missing files only warn — the image may land in
   the same PR. mode 'prefix' (template check): only the images/ prefix is
   enforced. */
export const checkImagePath = (root, p, where, reporter, mode = 'strict') => {
  const normalized = normalizeImagePath(p);
  if (!normalized) {
    reporter.fail(`${where}: image path must be under images/ (e.g. images/service-cards/<id>.webp), got ${JSON.stringify(p)}`);
    return;
  }
  if (mode === 'prefix' || fs.existsSync(path.join(root, 'public', normalized))) return;
  if (mode === 'strict') reporter.fail(`${where}: ${normalized} does not exist under public/`);
  else reporter.warn(`${where}: ${normalized} does not exist under public/ yet — add the image file in the same PR`);
};

/* --- Entry checks ------------------------------------------------------------ */

/* Structural checks for one Service entry. Image existence is governed by
   imageMode; cross-catalog checks (id uniqueness, subcategory membership)
   stay in the callers. */
export const checkServiceEntry = (root, sv, where, reporter, { imageMode = 'strict' } = {}) => {
  for (const field of ['id', 'name', 'tag1', 'tag2', 'image']) {
    if (typeof sv[field] !== 'string' || !sv[field]) reporter.fail(`${where}: missing required field "${field}"`);
  }
  if (sv.id !== undefined && !KEBAB.test(sv.id)) reporter.fail(`${where}: id ${JSON.stringify(sv.id)} is not kebab-case`);
  if (typeof sv.price !== 'number' || Number.isNaN(sv.price) || sv.price < 0) {
    reporter.fail(`${where}: price must be a number >= 0, got ${JSON.stringify(sv.price)}`);
  }
  if (sv.tag !== undefined && !SERVICE_TAGS.includes(sv.tag)) {
    reporter.fail(`${where}: tag must be one of ${SERVICE_TAGS.join(' | ')}, got ${JSON.stringify(sv.tag)}`);
  }
  if (typeof sv.image === 'string') checkImagePath(root, sv.image, `${where} image`, reporter, imageMode);
  if (sv.account !== undefined) {
    const a = sv.account;
    if (typeof a !== 'object' || a === null) {
      reporter.fail(`${where}: account must be an object`);
    } else {
      if (!['us', 'eu', 'oc', 'jp'].includes(a.region)) reporter.fail(`${where}: account.region must be us | eu | oc | jp`);
      if (!['combat-max', 'all-max'].includes(a.levels)) reporter.fail(`${where}: account.levels must be combat-max | all-max`);
      if (!['none', 'small', 'medium', 'large'].includes(a.housing)) reporter.fail(`${where}: account.housing must be none | small | medium | large`);
    }
  }
};

/* One accordion entry: inline section or { "ref": "<slug>" }. Known shared
   slugs are enforced when `sharedSlugs` is a Set (null = template mode:
   check the marker shape only). */
export const checkAccordionEntry = (section, where, reporter, sharedSlugs) => {
  if (typeof section !== 'object' || section === null || Array.isArray(section)) {
    reporter.fail(`${where}: accordion entries must be objects`);
    return;
  }
  if (section.ref !== undefined) {
    if (typeof section.ref !== 'string' || !KEBAB.test(section.ref)) {
      reporter.fail(`${where}: ref must be a kebab-case shared-section slug`);
    } else if (sharedSlugs && !sharedSlugs.has(section.ref)) {
      reporter.fail(`${where}: ref ${JSON.stringify(section.ref)} does not match a shared section in the game's shared-sections.json`);
    }
    return;
  }
  if (typeof section.title !== 'string' || !section.title) reporter.fail(`${where}: inline accordion section missing title`);
  if (section.items === undefined && section.groups === undefined) {
    reporter.fail(`${where}: inline accordion section needs items and/or groups`);
  }
};

/* Structural checks for one subpage. `refs`/`icons`/`dutyTargets` toggle the
   catalog cross-reference checks (off in template mode). */
export const checkSubpageEntry = (root, pageId, page, reporter, opts = {}) => {
  const {
    imageMode = 'strict',
    sharedSlugs = null,
    iconMapKeys = null,
    dutyTargets = null, // Map serviceId -> gameId
  } = opts;
  const where = `page ${JSON.stringify(pageId)}`;
  if (typeof page !== 'object' || page === null) {
    reporter.fail(`${where}: must be an object`);
    return;
  }
  if (typeof page.short !== 'string' || !page.short) reporter.fail(`${where}: missing "short"`);
  if (!Array.isArray(page.rewards) || page.rewards.length === 0) {
    reporter.fail(`${where}: "rewards" must be a non-empty array`);
  } else {
    for (const reward of page.rewards) {
      const rWhere = `${where} reward ${JSON.stringify(reward?.title)}`;
      if (typeof reward?.icon !== 'string' || !KEBAB.test(reward.icon)) {
        reporter.fail(`${rWhere}: icon must be a kebab-case icon name (see src/data/bundled/icon-names.json)`);
      } else if (iconMapKeys && !iconMapKeys.has(reward.icon)) {
        reporter.fail(`${rWhere}: icon ${JSON.stringify(reward.icon)} has no entry in src/data/iconMap.ts ICON_MAP`);
      }
      if (typeof reward?.title !== 'string' || !reward.title) reporter.fail(`${rWhere}: missing title`);
      if (reward?.dutyButton !== undefined) {
        const db = reward.dutyButton;
        if (typeof db !== 'object' || db === null || typeof db.label !== 'string' || typeof db.to !== 'string') {
          reporter.fail(`${rWhere}: dutyButton must be { "label": "...", "to": "/boosting/<game>/<service id>" }`);
        } else if (dutyTargets) {
          const m = /^\/boosting\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(db.to);
          if (!m) {
            reporter.fail(`${rWhere}: dutyButton.to ${JSON.stringify(db.to)} is not /boosting/<game>/<service id>`);
          } else if (dutyTargets.get(m[2]) !== m[1]) {
            reporter.fail(`${rWhere}: dutyButton.to ${db.to} — no such service in game "${m[1]}"`);
          }
        }
      }
    }
  }
  if (!Array.isArray(page.accordion) || page.accordion.length === 0) {
    reporter.fail(`${where}: "accordion" must be a non-empty array`);
  } else {
    page.accordion.forEach((section, i) => checkAccordionEntry(section, `${where} accordion[${i}]`, reporter, sharedSlugs));
  }
  for (const img of page.gallery ?? []) checkImagePath(root, img, `${where} gallery`, reporter, imageMode);
};

/* --- Per-service layout helpers -------------------------------------------- */

/* File names inside public/db/services/<game>/ that are not service files. */
export const SERVICE_META_FILES = ['index.json', 'shared-sections.json'];

/* Game directory names under a services root (public/db/services or the
   bundled mirror). */
export const listGameDirs = (servicesRoot) =>
  fs.existsSync(servicesRoot)
    ? fs.readdirSync(servicesRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];

/* Service file names inside one game directory. */
export const listServiceFiles = (gameDir) =>
  fs.existsSync(gameDir)
    ? fs.readdirSync(gameDir).filter((f) => f.endsWith('.json') && !SERVICE_META_FILES.includes(f))
    : [];

/* --- Serializers (merge path — established key order, optionals omitted) ---- */

export const serializeService = (s) => {
  const out = { id: s.id, name: s.name, tag1: s.tag1, tag2: s.tag2 };
  if (s.tag3 !== undefined) out.tag3 = s.tag3;
  out.price = s.price;
  out.image = normalizeImagePath(s.image) ?? s.image;
  if (s.tag !== undefined) out.tag = s.tag;
  if (s.longDescription !== undefined) out.longDescription = s.longDescription;
  if (s.account !== undefined) {
    const a = s.account;
    const outA = { region: a.region, levels: a.levels, housing: a.housing };
    if (a.addedAt !== undefined) outA.addedAt = a.addedAt;
    if (a.specs !== undefined) outA.specs = a.specs;
    out.account = outA;
  }
  return out;
};

const serializeAccordionItem = (item) => {
  if (typeof item === 'string') return item;
  const out = { text: item.text };
  if (item.link !== undefined) out.link = item.link;
  if (item.dash !== undefined) out.dash = item.dash;
  if (item.plain !== undefined) out.plain = item.plain;
  if (item.muted !== undefined) out.muted = item.muted;
  return out;
};

const serializeSection = (section) => {
  const out = { title: section.title };
  if (section.items !== undefined) out.items = section.items.map(serializeAccordionItem);
  if (section.groups !== undefined) {
    out.groups = section.groups.map((g) => ({ heading: g.heading, items: g.items.map(serializeAccordionItem) }));
  }
  return out;
};

export const serializeAccordionEntry = (entry) => (entry.ref !== undefined ? { ref: entry.ref } : serializeSection(entry));

export const serializeSubpage = (page) => {
  const out = { short: page.short };
  if (page.rewardsHeading !== undefined) out.rewardsHeading = page.rewardsHeading;
  if (page.gallery !== undefined) out.gallery = page.gallery.map((img) => normalizeImagePath(img) ?? img);
  out.rewards = page.rewards.map((r) => {
    const outR = { icon: r.icon, title: r.title };
    if (r.text !== undefined) outR.text = r.text;
    if (r.link !== undefined) outR.link = r.link;
    if (r.group !== undefined) outR.group = r.group;
    if (r.items !== undefined) outR.items = r.items;
    if (r.dutyButton !== undefined) outR.dutyButton = r.dutyButton;
    return outR;
  });
  out.accordion = page.accordion.map(serializeAccordionEntry);
  return out;
};

/* Game meta block of services/<game>/index.json. */
export const serializeGameMeta = (g) => {
  const out = {
    id: g.id,
    name: g.name,
    short: g.short,
    tagline: g.tagline,
    description: g.description,
    cardImage: g.cardImage,
    logo: g.logo,
  };
  if (g.main !== undefined) out.main = g.main;
  return out;
};

/* services/<game>/index.json manifest — array order IS display order
   (subcategories, and service ids within each). `subcategories` entries:
   { id, name, proxies?, services: string[] }. */
export const serializeGameIndex = (game, subcategories) => ({
  game: serializeGameMeta(game),
  subcategories: subcategories.map((s) => {
    const out = { id: s.id, name: s.name };
    if (s.proxies !== undefined) out.proxies = s.proxies;
    out.services = s.services;
    return out;
  }),
});

/* services/<game>/<id>.json — exactly templates/service.template.json minus
   _guide. `service`/`subpage` must already be normalized (serializeService /
   serializeSubpage). */
export const serializeServiceFile = (gameId, subId, service, subpage) => {
  const out = { game: gameId, subcategory: subId, service };
  if (subpage !== undefined) out.subpage = subpage;
  return out;
};

/* Rewrite src/data/bundled/icon-names.json from the reward icons used across
   every service file's subpage (the validator sync-checks this list). */
export const regenerateIconNames = (root) => {
  const used = new Set();
  const servicesRoot = path.join(root, 'public', 'db', 'services');
  for (const gameId of listGameDirs(servicesRoot)) {
    const dir = path.join(servicesRoot, gameId);
    for (const f of listServiceFiles(dir)) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const r of data.subpage?.rewards ?? []) used.add(r.icon);
    }
  }
  writeJson(root, 'src/data/bundled/icon-names.json', [...used].sort());
};

/* --- Placeholder detection (staff templates) --------------------------------- */

const PLACEHOLDER_RE = /example|<[^>]+>/i;

/* Returns the dotted paths of every string that still holds a template
   placeholder ('EXAMPLE …', '<subcategory id>', 'ffxiv-example-service'). */
export const findPlaceholders = (value, path = '$', hits = []) => {
  if (typeof value === 'string') {
    if (PLACEHOLDER_RE.test(value)) hits.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => findPlaceholders(v, `${path}[${i}]`, hits));
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) findPlaceholders(v, `${path}.${k}`, hits);
  }
  return hits;
};
