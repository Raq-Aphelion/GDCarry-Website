/* Golden test for the level-range pricing family (src/lib/pricing/engine/
   leveling.ts). Loads the real public/db JSONs, merges them exactly like the
   site/worker do (mergeCategoryFiles), then pins computeLevelingLine against
   a GOLDEN reference containing the original LevelingPurchaseBox inline
   formula copied verbatim from git show HEAD:src/components/
   LevelingPurchaseBox.tsx. Run: node worker/test/leveling.test.mjs */
import { readFile } from 'node:fs/promises';
import { mergeCategoryFiles, lineTotal } from '../shared.ts';
import { computeLevelingLine } from '../leveling.ts';

const files = ['pricing', 'ffxiv-UltimateRaids', 'ffxiv-Leveling', 'ffxiv-PvP', 'ffxiv-FieldExplorations'];
const [base, ...cats] = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(base, cats);

let pass = 0,
  fail = 0;
const check = (label, actual, expected) => {
  const ok = actual != null && expected != null && Math.abs(actual - expected) < 1e-9;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: engine=${actual} golden=${expected}`);
  ok ? pass++ : fail++;
};
const checkNull = (label, actual) => {
  const ok = actual === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: expected null, got ${JSON.stringify(actual)}`);
  ok ? pass++ : fail++;
};

/** The box's config prop for a service, built exactly the way ServicePage
    builds it per variant (block spread + variant extras). */
const boxCfg = (serviceId) => {
  if (serviceId === db.leveling?.serviceId)
    return { ...db.leveling, showJob: true, addon: db.leveling.msqAddon };
  if (serviceId === db.crafterLeveling?.serviceId)
    return { ...db.crafterLeveling, showJob: true, addon: db.crafterLeveling.addon };
  if (serviceId === db.bluLeveling?.serviceId)
    return {
      ...db.bluLeveling,
      showJob: false,
      addon: db.bluLeveling.spellsAddon,
      addonLocksToMax: true,
      addons: db.bluLeveling.carnivaleAddon ? [db.bluLeveling.carnivaleAddon] : [],
    };
  if (serviceId === db.pvpSeries?.serviceId) return { ...db.pvpSeries, showJob: false };
  if (db.fieldLeveling?.[serviceId]) return { ...db.fieldLeveling[serviceId], showJob: false };
  return null;
};

/** The box's input clamping (clampLevels / clampPhantom) — applied to raw
    ranges so every generated case is a UI-reachable state. */
const clampRange = (s, e, min, max) => {
  s = Math.min(Math.max(s, min), max - 1);
  e = Math.min(Math.max(e, min + 1), max);
  if (s >= e) s = e - 1;
  return [s, e];
};
const uiState = (cfg, over = {}) => {
  const st = {
    start: cfg.defaultStart,
    end: cfg.defaultEnd,
    job: cfg.defaultJob ?? '',
    gearIdx: 0,
    addonChecked: false,
    addonsChecked: [],
    groupsChecked: [],
    priority: false,
    phantomOn: false,
    allOn: false,
    pStart: cfg.levelMin,
    pEnd: cfg.levelMin + 1,
    ...over,
  };
  const isPhantomSplit = !!cfg.phantomToggle && !!cfg.jobs?.length;
  const levelMax = !isPhantomSplit && cfg.jobs?.length
    ? (cfg.jobs.find((j) => j.label === st.job)?.max ?? cfg.levelMax)
    : cfg.levelMax;
  const jobMin = cfg.jobMinLevels?.[st.job] ?? cfg.levelMin;
  [st.start, st.end] = clampRange(st.start, st.end, jobMin, levelMax);
  const phantomMax = cfg.jobs?.find((j) => j.label === st.job)?.max ?? cfg.levelMax;
  [st.pStart, st.pEnd] = clampRange(st.pStart, st.pEnd, cfg.levelMin, phantomMax);
  return st;
};

// GOLDEN reference — the original formula copied verbatim from
// git show HEAD:src/components/LevelingPurchaseBox.tsx (priorityMultiplier
// and the shared gear options came from db.purchaseBox).
const goldTotal = (cfg, st) => {
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const isPhantomSplit = !!cfg.phantomToggle && !!cfg.jobs?.length;
  const activeTiers = !isPhantomSplit && cfg.jobs?.length
    ? (cfg.jobs.find((j) => j.label === st.job)?.priceTiers ?? cfg.priceTiers)
    : cfg.priceTiers;
  const sumLevels = (s, e, tiers) => {
    let sum = 0;
    for (let l = s + 1; l <= e; l++) {
      const tier = tiers.find((t) => l >= t.min && l <= t.max);
      sum += tier?.pricePerLevel ?? 0;
    }
    return sum;
  };
  const levelPrice = sumLevels(st.start, st.end, activeTiers);
  const phantomTiers = cfg.jobs?.find((j) => j.label === st.job)?.priceTiers ?? cfg.priceTiers;
  const phantomPrice = isPhantomSplit && st.phantomOn ? sumLevels(st.pStart, st.pEnd, phantomTiers) : 0;
  const allJobsSum = (cfg.jobs ?? []).reduce(
    (s, j) => s + sumLevels(cfg.levelMin, j.max, j.priceTiers ?? cfg.priceTiers),
    0,
  );
  const allPrice = isPhantomSplit && st.allOn ? allJobsSum : 0;
  const addonEnabled = cfg.addonLocksToMax ? st.end === cfg.levelMax : true;
  const addonPrice = st.addonChecked && addonEnabled ? cfg.addon?.price ?? 0 : 0;
  const extrasPrice = st.addonsChecked.reduce(
    (s, id) => s + (cfg.addons?.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const groupOptions = cfg.optionGroups?.flatMap((g) => g.options) ?? [];
  const groupsPrice = st.groupsChecked.reduce(
    (s, id) => s + (groupOptions.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const gearOptions = cfg.gearOptions ? db.purchaseBox.gearOptions : [];
  const gearPrice = gearOptions[st.gearIdx]?.price ?? 0;
  return (
    (levelPrice + phantomPrice + allPrice) * (st.priority ? priorityMultiplier : 1) +
    addonPrice +
    extrasPrice +
    groupsPrice +
    gearPrice
  );
};

const run = (label, serviceId, st) => {
  const cfg = boxCfg(serviceId);
  const line = computeLevelingLine(db, serviceId, {
    family: 'leveling',
    start: st.start,
    end: st.end,
    job: st.job,
    gearIdx: st.gearIdx,
    addon: st.addonChecked,
    addons: st.addonsChecked,
    groupOptions: st.groupsChecked,
    priority: st.priority,
    phantom: st.phantomOn,
    all: st.allOn,
    pStart: st.pStart,
    pEnd: st.pEnd,
  });
  if (line && (line.qty !== 1 || line.qtyLocked !== true)) {
    console.log(`FAIL ${label}: expected qtyLocked one-off line, got ${JSON.stringify(line)}`);
    fail++;
    return;
  }
  check(label, line ? lineTotal(line) : null, goldTotal(cfg, st));
};

// ---- leveling (combat jobs: job select, MSQ add-on, gear, jobMinLevels) ----
const L = db.leveling.serviceId;
const lc = boxCfg(L);
run('leveling default', L, uiState(lc));
run('leveling min range', L, uiState(lc, { start: 1, end: 2 }));
run('leveling full range', L, uiState(lc, { start: 1, end: 100 }));
run('leveling job Viper default (min 80)', L, uiState(lc, { job: 'Viper (VPR)' }));
run('leveling job Viper min range', L, uiState(lc, { job: 'Viper (VPR)', start: 80, end: 81 }));
run('leveling job Dark Knight 30->50', L, uiState(lc, { job: 'Dark Knight (DRK)', start: 30, end: 50 }));
run('leveling msq addon on', L, uiState(lc, { addonChecked: true }));
run('leveling gear pentamelded', L, uiState(lc, { gearIdx: 1 }));
run('leveling priority on', L, uiState(lc, { priority: true }));
run(
  'leveling everything on',
  L,
  uiState(lc, { job: 'Samurai (SAM)', start: 50, end: 100, addonChecked: true, gearIdx: 1, priority: true }),
);

// ---- crafterLeveling (no addon in db, gear, priority) ----
const C = db.crafterLeveling.serviceId;
const cc = boxCfg(C);
run('crafter default', C, uiState(cc));
run('crafter full range', C, uiState(cc, { start: 1, end: 100 }));
run('crafter min range', C, uiState(cc, { start: 1, end: 2 }));
run('crafter gear + priority', C, uiState(cc, { gearIdx: 1, priority: true }));

// ---- bluLeveling (no job select, spells addon locked to cap, carnivale) ----
const B = db.bluLeveling.serviceId;
const bc = boxCfg(B);
run('blu default', B, uiState(bc));
run('blu min range', B, uiState(bc, { start: 1, end: 2 }));
run('blu full range', B, uiState(bc, { start: 1, end: 80 }));
run('blu spells addon at cap', B, uiState(bc, { start: 1, end: 80, addonChecked: true }));
run('blu spells addon below cap (excluded)', B, uiState(bc, { start: 70, end: 79, addonChecked: true }));
run('blu carnivale on', B, uiState(bc, { addonsChecked: ['carnivale'] }));
run(
  'blu carnivale + spells at cap + priority',
  B,
  uiState(bc, { start: 1, end: 80, addonChecked: true, addonsChecked: ['carnivale'], priority: true }),
);

// ---- pvpSeries (flat per level, no addon/gear) ----
const P = db.pvpSeries.serviceId;
const pc = boxCfg(P);
run('pvp default', P, uiState(pc));
run('pvp full range', P, uiState(pc, { start: 1, end: 30 }));
run('pvp tail range', P, uiState(pc, { start: 25, end: 30 }));
run('pvp priority', P, uiState(pc, { start: 1, end: 30, priority: true }));

// ---- fieldLeveling (all db entries, generic over their options) ----
for (const [id, block] of Object.entries(db.fieldLeveling ?? {})) {
  const fc = boxCfg(id);
  run(`${id} default`, id, uiState(fc));
  run(`${id} min range`, id, uiState(fc, { start: block.levelMin, end: block.levelMin + 1 }));
  run(`${id} full range`, id, uiState(fc, { start: block.levelMin, end: block.levelMax }));
  run(`${id} priority`, id, uiState(fc, { priority: true }));
  if (fc.addon) run(`${id} addon on`, id, uiState(fc, { addonChecked: true }));
  for (const g of fc.optionGroups ?? [])
    for (const o of g.options)
      run(`${id} option ${o.id}`, id, uiState(fc, {
        groupsChecked: o.requiresOption ? [o.requiresOption, o.id] : [o.id],
      }));
}

// ---- occult-crescent phantom-job split mode ----
const O = 'ffxiv-occult-crescent';
const oc = boxCfg(O);
run('occult base range only', O, uiState(oc, { job: '', phantomOn: false, allOn: false }));
run('occult base full + priority', O, uiState(oc, { start: 1, end: 40, priority: true }));
for (const j of oc.jobs) {
  run(`occult phantom ${j.label} full`, O, uiState(oc, { job: j.label, phantomOn: true, pStart: 1, pEnd: j.max }));
}
run('occult phantom Knight partial', O, uiState(oc, { job: 'Knight', phantomOn: true, pStart: 2, pEnd: 5 }));
run('occult all phantom jobs', O, uiState(oc, { allOn: true }));
run('occult all + base full + addon + option + priority', O, uiState(oc, {
  start: 1, end: 40, allOn: true, addonChecked: true, groupsChecked: ['weapon'], priority: true,
}));
run('occult phantom + option + addon', O, uiState(oc, {
  job: 'Freelancer', phantomOn: true, pStart: 10, pEnd: 24, addonChecked: true, groupsChecked: ['weapon'],
}));

// ---- defensive: malformed configs must return null, never throw ----
const validCfg = {
  family: 'leveling', start: 90, end: 100, job: '', gearIdx: 0, addon: false,
  addons: [], groupOptions: [], priority: false, phantom: false, all: false, pStart: 1, pEnd: 2,
};
checkNull('unknown service id', computeLevelingLine(db, 'does-not-exist', validCfg));
checkNull('missing db block', computeLevelingLine({ ...db, leveling: undefined }, L, validCfg));
checkNull('gear index out of range', computeLevelingLine(db, L, { ...validCfg, gearIdx: 99 }));
checkNull('negative gear index', computeLevelingLine(db, L, { ...validCfg, gearIdx: -1 }));
checkNull('non-integer gear index', computeLevelingLine(db, L, { ...validCfg, gearIdx: 0.5 }));
checkNull('string start', computeLevelingLine(db, L, { ...validCfg, start: '90' }));
checkNull('NaN end', computeLevelingLine(db, L, { ...validCfg, end: NaN }));
checkNull('addons not an array', computeLevelingLine(db, L, { ...validCfg, addons: 'carnivale' }));
checkNull('priority not boolean', computeLevelingLine(db, L, { ...validCfg, priority: 1 }));
checkNull('job not a string', computeLevelingLine(db, L, { ...validCfg, job: 3 }));
// Out-of-range levels are clamped like the box's inputs, not rejected
{
  const line = computeLevelingLine(db, L, { ...validCfg, start: -50, end: 500 });
  check('out-of-range levels clamp', line ? lineTotal(line) : null, goldTotal(lc, uiState(lc, { start: -50, end: 500 })));
}

console.log(fail === 0 ? `\nALL ${pass} TESTS PASSED` : `\n${fail} TESTS FAILED (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
