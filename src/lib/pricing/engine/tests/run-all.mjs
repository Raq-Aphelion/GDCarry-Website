/* Runs every golden pricing test (worker/test/*.test.mjs) and summarizes.
   Each test loads the real catalog from public/db and asserts the pricing
   engine reproduces the purchase boxes' original formulas exactly. */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const tests = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort();

let failed = 0;
for (const t of tests) {
  // Tests read public/db via paths relative to the repo root
  const r = spawnSync(process.execPath, [join(dir, t)], { encoding: 'utf8', cwd: join(dir, '..', '..', '..', '..', '..') });
  const last = (r.stdout.trim().split('\n').pop() ?? '').trim();
  const ok = r.status === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${t}${last ? ` — ${last}` : ''}`);
  if (!ok) {
    failed++;
    if (r.stderr.trim()) console.log(r.stderr.trim().split('\n').slice(0, 10).join('\n'));
  }
}
console.log(failed === 0 ? `\nAll ${tests.length} suites passed.` : `\n${failed}/${tests.length} suites FAILED.`);
process.exit(failed === 0 ? 0 : 1);
