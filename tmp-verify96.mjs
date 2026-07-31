import http from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import puppeteer from 'puppeteer';

const DIST = 'C:/Users/Mat/Documents/GitHub/GDCarry/dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    let f = join(DIST, p);
    let data;
    try { data = await readFile(f); } catch { data = await readFile(join(DIST, 'index.html')); f = join(DIST, 'index.html'); }
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(4593, '127.0.0.1', r));

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${extra}`); if (!ok) failed++; };
const digits = (s) => (s || '').replace(/\D/g, '');
const goto = async (url) => { await page.goto(`http://127.0.0.1:4593${url}`, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 3500)); };
const price = () => page.evaluate(() => document.querySelector('.purchase-price-block p')?.textContent ?? '');
const clickBtn = (label) => page.evaluate((l) => {
  const bs = [...document.querySelectorAll('.purchase-box button')].filter((x) => x.textContent.includes(l) && !x.closest('.pointer-events-none'));
  bs.sort((a, b) => a.textContent.length - b.textContent.length);
  bs[0]?.click(); return !!bs[0];
}, label);

// --- Anothers: piloted x1.1 on runs, 220 mount, 80 glamour ---
for (const id of ['ffxiv-another-aloalo-island', 'ffxiv-another-mount-rokkon', 'ffxiv-another-sildihn-subterrane']) {
  await goto(`/boosting/ffxiv/${id}`);
  await clickBtn('Piloted');
  await new Promise((r) => setTimeout(r, 400));
  check(`${id} piloted normal 99`, digits(await price()).startsWith('99'), await price());
  await clickBtn('Glamour Set');
  await new Promise((r) => setTimeout(r, 400));
  check(`${id} piloted glamour = 179 (99+80)`, digits(await price()).startsWith('179'), await price());
  await clickBtn('Glamour Set');
  await clickBtn('Mount');
  await new Promise((r) => setTimeout(r, 400));
  check(`${id} piloted mount = 220`, digits(await price()).startsWith('220'), await price());
  await clickBtn('Mount');
  await clickBtn('Savage');
  await new Promise((r) => setTimeout(r, 600));
  check(`${id} piloted savage 330`, digits(await price()).startsWith('330'), await price());
}

// --- Merchant: piloted mount 220 on normal+advanced ---
await goto('/boosting/ffxiv/ffxiv-another-merchants-tale');
await clickBtn('Piloted');
await new Promise((r) => setTimeout(r, 400));
check('merchant another piloted 99', digits(await price()).startsWith('99'), await price());

await goto('/boosting/ffxiv/ffxiv-variant-merchants-tale');
await clickBtn('Piloted');
await clickBtn('Mount');
await new Promise((r) => setTimeout(r, 400));
check('variant merchant piloted mount = 220', digits(await price()).startsWith('220'), await price());
await clickBtn('Mount');
await clickBtn('Advanced');
await new Promise((r) => setTimeout(r, 600));
check('variant merchant advanced piloted 22', digits(await price()).startsWith('22'), await price());

// --- Variants: unchanged 11, mount 80 piloted ---
await goto('/boosting/ffxiv/ffxiv-variant-mount-rokkon');
await clickBtn('Piloted');
await new Promise((r) => setTimeout(r, 400));
check('variant piloted 11', digits(await price()).startsWith('11'), await price());
await clickBtn('Mount (All 12 Paths)');
await new Promise((r) => setTimeout(r, 400));
check('variant piloted 12-path mount = 80', digits(await price()).startsWith('80'), await price());

// --- Text tweaks ---
await goto('/boosting/ffxiv/ffxiv-another-mount-rokkon');
check('criterion clear subtext', (await page.evaluate(() => document.body.textContent)).includes('Difficult 4-player content cleared with a veteran group.'));
await goto('/boosting/ffxiv/ffxiv-variant-merchants-tale');
check('merchant 13 routes', (await page.evaluate(() => document.body.textContent)).includes('All 13 Routes Available'));
await goto('/boosting/ffxiv/ffxiv-variant-mount-rokkon');
check('other variants keep 12 routes', (await page.evaluate(() => document.body.textContent)).includes('All 12 Routes Available'));

await browser.close();
server.close();
console.log(failed ? `${failed} check(s) FAILED` : 'all checks passed');
process.exit(failed ? 1 : 0);
