/* Post-build prerender: snapshots each route's rendered DOM into static
   HTML files so crawlers see full content without executing JS.
   Run automatically at the end of `npm run build`.

   Uses the system browser (Edge/Chrome) via PUPPETEER_EXECUTABLE_PATH or the
   common install locations; falls back to puppeteer's bundled Chrome if one
   was downloaded with `npx puppeteer browsers install chrome`. */
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Keep in sync with src/App.tsx routes and public/sitemap.xml.
const ROUTES = [
  '/',
  '/boosting/ffxiv',
  '/boosting/ffxiv/ffxiv-dsr',
  '/boosting/wow',
  '/boosting/lost-ark',
  '/boosting/warframe',
  '/boosting/runescape',
  '/guides',
  '/guides/what-are-boosting-services',
  '/guides/ffxiv-boosting-carry-explained',
  '/guides/secure-boosting',
  '/guides/best-boosting-service',
  '/guides/why-grand-dice',
  '/guides/ffxiv-carry-glossary',
  '/faq',
  '/account-safety',
  '/work-with-us',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/refund',
  '/checkout',
];

const DIST = path.resolve('dist');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.webm': 'video/webm', '.mp4': 'video/mp4', '.txt': 'text/plain',
};

function fallbackBrowserPath() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of candidates) {
    try {
      fs.accessSync(c);
      return c;
    } catch { /* not here */ }
  }
  return undefined;
}

const LAUNCH_ARGS = ['--no-sandbox', '--disable-dev-shm-usage'];

async function launchBrowser() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: LAUNCH_ARGS });
  }
  // Preferred: the chrome-headless-shell downloaded via
  // `npx puppeteer browsers install chrome-headless-shell`.
  try {
    return await puppeteer.launch({ headless: 'shell', args: LAUNCH_ARGS });
  } catch {
    const executablePath = fallbackBrowserPath();
    if (executablePath) return puppeteer.launch({ executablePath, args: LAUNCH_ARGS });
    throw new Error(
      'No browser found. Run `npx puppeteer browsers install chrome-headless-shell` or set PUPPETEER_EXECUTABLE_PATH.',
    );
  }
}

const server = http.createServer((req, res) => {
  const p = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let f = path.join(DIST, p === '/' ? 'index.html' : p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = path.join(DIST, 'index.html'); // SPA fallback
  res.setHeader('content-type', MIME[path.extname(f)] ?? 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
console.log(`[prerender] serving dist on :${port}`);

const browser = await launchBrowser();

let failures = 0;
for (const route of ROUTES) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${port}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    // Give React time to mount, fetch pricing.json and set per-route meta.
    await new Promise((r) => setTimeout(r, 4000));

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const rootLen = await page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0);
    if (rootLen < 100) {
      failures++;
      console.error(`[prerender] WARNING ${route}: root rendered only ${rootLen} chars — snapshot may be empty`);
    }

    const outDir = route === '/' ? DIST : path.join(DIST, route.slice(1));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html>\n${html}`);
    console.log(`[prerender] ${route} (${rootLen} chars)`);
  } catch (err) {
    failures++;
    console.error(`[prerender] FAILED ${route}: ${err.message ?? err}`);
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();

if (failures > 0) {
  console.error(`[prerender] ${failures} route(s) failed or rendered empty`);
  process.exit(1);
}
console.log('[prerender] all routes rendered');
