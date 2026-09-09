/* Regression test for the computeLine family-lookup bypass: `family` is
   attacker-controlled (serialized from the client cart), so the FAMILIES
   dictionary lookup must not resolve inherited Object.prototype members.
   `family: "toString"` previously returned the truthy string
   "[object Object]", which the worker treated as a recognized line and
   silently skipped both the recompute flag and the minimum-price floor. */
import { readFile } from 'node:fs/promises';
import { CATEGORY_FILES, GLOBAL_PRICING_FILE } from '../../../../data/pricing.ts';
import { mergeCategoryFiles } from '../shared.ts';
import { computeLine } from '../index.ts';

const files = [GLOBAL_PRICING_FILE, ...CATEGORY_FILES];
const parts = await Promise.all(
  files.map((f) => readFile(`public/db/${f}.json`, 'utf8').then(JSON.parse).catch(() => null)),
);
const db = mergeCategoryFiles(parts[0], parts.slice(1));

let pass = 0, fail = 0;
const expectNull = (label, family) => {
  const ok = computeLine(db, 'ffxiv-ucob', { family }) === null;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  ok ? pass++ : fail++;
};

for (const f of ['toString', 'valueOf', 'hasOwnProperty', 'constructor', '__proto__', 'prototype'])
  expectNull(`prototype-key family rejected: ${f}`);
expectNull('non-string family rejected', null);
expectNull('unknown family rejected', 'bogus');

// Legitimate configs still compute — one per transport shape
const legit = [
  ['run', { family: 'run', method: 'piloted', runs: 1, gearIdx: 0, logIdx: 0, addons: [] }, 'ffxiv-ucob'],
  ['trial', { family: 'trial', method: 'piloted', runs: 1, guaranteed: false, stream: false, priority: false }, 'ffxiv-worqor-lar-dor'],
  ['gil', { family: 'gil', dad: false, millions: 10 }, 'ffxiv-gil'],
];
for (const [label, cfg, id] of legit) {
  const line = computeLine(db, id, cfg);
  const ok = line != null && typeof line.price === 'number';
  console.log(`${ok ? 'PASS' : 'FAIL'} legitimate config computes: ${label}`);
  ok ? pass++ : fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log(fail === 0 ? 'ALL TESTS PASSED' : `${fail} TESTS FAILED`);
process.exit(fail === 0 ? 0 : 1);
