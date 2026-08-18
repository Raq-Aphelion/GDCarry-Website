/* In-depth scroll-behaviour test suite for the site (Lenis page scroller +
   nested inner scrollers). Run with the dev server up:
     npm run dev -- --port 5199 --strictPort
     node scripts/scroll-test.mjs

   Covers: page wheel scroll + responsiveness, category sidebar (overflow,
   chaining at both edges, the mid-animation "scroll lock" regression,
   non-overflowing sidebars), category-click smooth scroll, ScrollToTop on
   route change, navbar search dropdown, cart drawer list, checkout order
   list, purchase-box select dropdowns, and mobile touch scrolling. */

import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = process.env.SCROLL_TEST_BASE ?? 'http://localhost:5199';

function fallbackBrowserPath() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    try {
      fs.accessSync(c);
      return c;
    } catch { /* not here */ }
  }
  return undefined;
}

async function launchBrowser() {
  const args = ['--no-sandbox', '--disable-dev-shm-usage'];
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args });
  }
  try {
    return await puppeteer.launch({ headless: 'shell', args });
  } catch {
    const executablePath = fallbackBrowserPath();
    if (executablePath) return puppeteer.launch({ executablePath, args });
    throw new Error('No browser found.');
  }
}

/* ---------- helpers ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail = '') {
  const tag = cond ? 'PASS' : 'FAIL';
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const pageTop = (page) => page.evaluate(() => document.getElementById('page-scroll')?.scrollTop ?? -1);

async function elBox(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }, selector);
}

/** Scroll state of an element: scrollTop + whether it overflows. */
const scrollState = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return {
      top: el.scrollTop,
      overflows: el.scrollHeight > el.clientHeight + 1,
      atBottom: el.scrollTop >= el.scrollHeight - el.clientHeight - 1,
      atTop: el.scrollTop <= 0,
    };
  }, selector);

async function wheelOver(page, box, deltaY, times = 1, gapMs = 90) {
  const x = box.x + box.w / 2;
  const y = box.y + box.h / 2;
  await page.mouse.move(x, y);
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel({ deltaY });
    if (i < times - 1) await sleep(gapMs);
  }
}

async function newPage(browser, { mobile = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport(
    mobile ? { width: 390, height: 844, hasTouch: true, isMobile: true } : { width: 1440, height: 900 },
  );
  // Never let the live-chat widget initialize (external service)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('chat.gdcarry.com')) req.abort();
    else req.continue();
  });
  return page;
}

async function goto(page, path, settleMs = 2600) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(settleMs);
}

/* ---------- scenarios ---------- */

async function testPageScrollAndSidebar(browser) {
  console.log('\n== Game page: page scroll, responsiveness, sidebar ==');
  const page = await newPage(browser);
  await goto(page, '/boosting/ffxiv');

  const sb = 'aside .no-scrollbar';
  const sbBox = await elBox(page, sb);
  check('sidebar scroller exists (desktop)', !!sbBox);
  if (!sbBox) {
    await page.close();
    return;
  }
  const sbState = await scrollState(page, sb);
  console.log(`  sidebar overflows at 1440x900: ${sbState.overflows}`);

  // S1: wheel over the main grid scrolls the page, responsively
  const gridBox = await elBox(page, 'aside + div');
  const top0 = await pageTop(page);
  await page.mouse.move(gridBox.x + gridBox.w / 2, 500);
  await page.mouse.wheel({ deltaY: 600 });
  await sleep(170);
  const topEarly = await pageTop(page);
  await sleep(800);
  const topFinal = await pageTop(page);
  check('S1 page scrolls on wheel over content', topFinal > top0 + 200, `${top0} -> ${topFinal}`);
  check(
    'S1 scroll is responsive (>=55% of delta within ~170ms)',
    topEarly - top0 > (topFinal - top0) * 0.55,
    `early ${Math.round(topEarly - top0)} of final ${Math.round(topFinal - top0)}`,
  );
  check('S1 scroll is smoothed (not instant jump)', topEarly < topFinal - 10, `early ${Math.round(topEarly)} final ${Math.round(topFinal)}`);

  // back to top for sidebar tests
  await page.evaluate(() => window.__lenis?.scrollTo(0, { immediate: true, force: true }));
  await sleep(300);

  if (sbState.overflows) {
    // S2: wheel over sidebar scrolls the sidebar, not the page
    const p0 = await pageTop(page);
    await wheelOver(page, sbBox, 400, 3);
    await sleep(700);
    const s1 = await scrollState(page, sb);
    const p1 = await pageTop(page);
    check('S2 wheel over sidebar scrolls the sidebar', s1.top > 30, `sidebar top ${Math.round(s1.top)}`);
    check('S2 page stays put while sidebar scrolls', Math.abs(p1 - p0) < 3, `page ${p0} -> ${p1}`);

    // S3: at the sidebar's bottom edge, further wheeling chains to the page
    await wheelOver(page, sbBox, 500, 8);
    await sleep(800);
    const s2 = await scrollState(page, sb);
    check('S3 sidebar reached its bottom', s2.atBottom, `top ${Math.round(s2.top)}`);
    const p2 = await pageTop(page);
    await wheelOver(page, sbBox, 400, 3);
    await sleep(800);
    const p3 = await pageTop(page);
    check('S3 wheel at sidebar bottom chains to the page', p3 > p2 + 100, `page ${Math.round(p2)} -> ${Math.round(p3)}`);

    // S4: THE LOCK REGRESSION — wheel hard over the page, then immediately
    // over the sidebar (still at its bottom edge): the page must keep moving.
    await page.evaluate(() => window.__lenis?.scrollTo(0, { immediate: true, force: true }));
    await sleep(300);
    await wheelOver(page, sbBox, 500, 8); // sidebar back to bottom
    await sleep(700);
    await page.mouse.move(gridBox.x + gridBox.w / 2, 500);
    await page.mouse.wheel({ deltaY: 900 }); // kick off a page animation
    await sleep(120); // mid-animation
    const p4 = await pageTop(page);
    await wheelOver(page, sbBox, 400, 2, 60);
    await sleep(700);
    const p5 = await pageTop(page);
    check('S4 no lock: wheel over sidebar mid-animation keeps page scrolling', p5 > p4 + 80, `page ${Math.round(p4)} -> ${Math.round(p5)}`);

    // S5: chaining back up — park the page mid-way (sticky sidebar position
    // stable), re-measure the sidebar box, then wheel up over it: the sidebar
    // scrolls up first, then the page once the sidebar hits its top.
    await page.evaluate(() => window.__lenis?.scrollTo(1500, { immediate: true, force: true }));
    await sleep(400);
    const sbBoxUp = await elBox(page, sb);
    const p6 = await pageTop(page);
    await wheelOver(page, sbBoxUp, -400, 14, 70);
    await sleep(900);
    const s3 = await scrollState(page, sb);
    const p7 = await pageTop(page);
    check('S5 wheel up over sidebar returns it to its top', s3.atTop, `sidebar top ${Math.round(s3.top)}`);
    check('S5 wheel up at sidebar top chains to the page', p7 < p6 - 80, `page ${Math.round(p6)} -> ${Math.round(p7)}`);
  } else {
    console.log('  (sidebar does not overflow at this viewport — S2-S5 covered by S6 variant)');
  }

  // S7: clicking a category smooth-scrolls the grid below the navbar
  await page.evaluate(() => window.__lenis?.scrollTo(0, { immediate: true, force: true }));
  await sleep(300);
  await page.evaluate(() => {
    const btns = document.querySelectorAll('aside .no-scrollbar button');
    btns[Math.min(2, btns.length - 1)]?.click();
  });
  await sleep(900);
  const topAfterCat = await pageTop(page);
  const url = page.url();
  check('S7 category click smooth-scrolls to the grid', topAfterCat > 40, `page top ${Math.round(topAfterCat)}`);
  check('S7 category click updates ?cat= in the URL', url.includes('cat='), url.split('/').pop());

  // S8: route change resets scroll to top (through Lenis)
  await wheelOver(page, await elBox(page, 'aside + div'), 600, 2);
  await sleep(600);
  await page.evaluate(() => {
    const link = document.querySelector('a[href*="/boosting/ffxiv/"]');
    link?.click();
  });
  await sleep(2500);
  const topNewPage = await pageTop(page);
  check('S8 ScrollToTop on route change', Math.abs(topNewPage) < 3, `top ${topNewPage}`);

  await page.close();
}

async function testShortSidebar(browser) {
  console.log('\n== Game page: non-overflowing sidebar falls through to the page ==');
  const page = await newPage(browser);
  // Tall viewport: even long category lists fit, so the sidebar can't scroll
  await page.setViewport({ width: 1440, height: 1300 });
  const games = ['/boosting/wow', '/boosting/lost-ark', '/boosting/warframe', '/boosting/runescape', '/boosting/ffxiv'];
  for (const g of games) {
    await goto(page, g);
    const sb = 'aside .no-scrollbar';
    const state = await scrollState(page, sb);
    if (!state) continue;
    console.log(`  ${g}: sidebar overflows = ${state.overflows}`);
    if (state.overflows) continue;
    // Sidebar can't scroll — wheeling over it must scroll the page
    const box = await elBox(page, sb);
    const p0 = await pageTop(page);
    await wheelOver(page, box, 400, 3);
    await sleep(700);
    const p1 = await pageTop(page);
    check(`S6 wheel over non-overflowing sidebar scrolls page (${g})`, p1 > p0 + 150, `page ${Math.round(p0)} -> ${Math.round(p1)}`);
    // and mid-animation it must not lock either (assertion is limit-aware:
    // short pages may simply run out of scroll room)
    await page.evaluate(() => window.__lenis?.scrollTo(0, { immediate: true, force: true }));
    await sleep(300);
    await page.mouse.move(900, 500);
    await page.mouse.wheel({ deltaY: 900 });
    await sleep(120);
    const p2 = await pageTop(page);
    await wheelOver(page, box, 400, 2, 60);
    await sleep(700);
    const p3 = await pageTop(page);
    const limit = await page.evaluate(() => window.__lenis?.limit ?? Number.MAX_SAFE_INTEGER);
    check(
      `S6 no lock over short sidebar mid-animation (${g})`,
      p3 >= Math.min(limit, p2 + 80) - 2,
      `page ${Math.round(p2)} -> ${Math.round(p3)} (limit ${Math.round(limit)})`,
    );
    await page.close();
    return;
  }
  check('S6 found a game with a non-overflowing sidebar', false, 'all tested games overflow at 900px');
  await page.close();
}

async function testNavbarSearch(browser) {
  console.log('\n== Navbar search dropdown ==');
  const page = await newPage(browser);
  await goto(page, '/boosting/ffxiv');
  await page.click('input[aria-label="Search services"]');
  await page.keyboard.type('savage', { delay: 20 });
  await sleep(700);
  const dd = 'div.no-scrollbar.max-h-80';
  const state = await scrollState(page, dd);
  check('S9 search dropdown opened with results', !!state);
  if (state) {
    console.log(`  dropdown overflows: ${state.overflows}`);
    const box = await elBox(page, dd);
    const p0 = await pageTop(page);
    await wheelOver(page, box, 300, 4);
    await sleep(700);
    const s1 = await scrollState(page, dd);
    const p1 = await pageTop(page);
    if (state.overflows) {
      check('S9 wheel over dropdown scrolls the dropdown', s1.top > 50, `dropdown top ${Math.round(s1.top)}`);
    }
    check('S9 page behind the dropdown stays put', Math.abs(p1 - p0) < 3, `page ${p0} -> ${p1}`);
  }
  await page.close();
}

const CART_SEED = Array.from({ length: 8 }, (_, i) => ({
  id: i === 0 ? 'ffxiv-gil-pack' : `ffxiv-gil-pack::test${i}`,
  name: `Test Boost ${i + 1}`,
  price: 10 + i,
  image: '/images/games/ffxiv.webp',
  gameShort: 'FFXIV',
  qty: 1,
  details: ['Piloted', 'PC'],
}));

async function testCartDrawer(browser) {
  console.log('\n== Cart drawer ==');
  const page = await newPage(browser);
  await goto(page, '/boosting/ffxiv');
  await page.evaluate((items) => window.localStorage.setItem('gd-cart-v1', JSON.stringify(items)), CART_SEED);
  await goto(page, '/boosting/ffxiv'); // reload so the cart picks up the seed
  await page.click('button[aria-label="Open cart"]');
  await sleep(700);
  const list = '.cart-items-scroll';
  const state = await scrollState(page, list);
  check('S10 cart list exists', !!state);
  if (state) {
    console.log(`  cart list overflows: ${state.overflows}`);
    const box = await elBox(page, list);
    const p0 = await pageTop(page);
    await wheelOver(page, box, 300, 4);
    await sleep(700);
    const s1 = await scrollState(page, list);
    const p1 = await pageTop(page);
    if (state.overflows) {
      check('S10 wheel over cart list scrolls the list', s1.top > 40, `list top ${Math.round(s1.top)}`);
    }
    check('S10 page behind the drawer stays put', Math.abs(p1 - p0) < 3, `page ${p0} -> ${p1}`);
    // at the list's bottom edge the wheel is swallowed by the fixed drawer —
    // the page behind must never scroll while the cart is open
    await wheelOver(page, box, 500, 8);
    await sleep(600);
    const p2 = await pageTop(page);
    check('S10 page still put at list bottom edge', Math.abs(p2 - p0) < 3, `page ${p0} -> ${p2}`);
  }
  await page.keyboard.press('Escape');
  await sleep(400);
  await page.evaluate(() => window.localStorage.removeItem('gd-cart-v1'));
  await page.close();
}

async function testCheckout(browser) {
  console.log('\n== Checkout order list ==');
  const page = await newPage(browser);
  await goto(page, '/checkout');
  await page.evaluate((items) => window.localStorage.setItem('gd-cart-v1', JSON.stringify(items)), CART_SEED);
  await goto(page, '/checkout');
  const list = '#page-scroll .no-scrollbar';
  const state = await scrollState(page, list);
  check('S11 checkout order list exists', !!state);
  if (state) {
    console.log(`  order list overflows: ${state.overflows}`);
    const box = await elBox(page, list);
    const p0 = await pageTop(page);
    await wheelOver(page, box, 300, 4);
    await sleep(700);
    const s1 = await scrollState(page, list);
    const p1 = await pageTop(page);
    if (state.overflows) {
      check('S11 wheel over order list scrolls the list', s1.top > 40, `list top ${Math.round(s1.top)}`);
      check('S11 page stays put while the list scrolls', Math.abs(p1 - p0) < 3, `page ${p0} -> ${p1}`);
      // chain at bottom edge: park the list at its bottom and the page at its
      // top (programmatically, so the page isn't already at its own limit),
      // then wheel over the list — the page must take over
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        el.scrollTop = el.scrollHeight;
        window.__lenis?.scrollTo(0, { immediate: true, force: true });
      }, list);
      await sleep(400);
      const p2 = await pageTop(page);
      await wheelOver(page, box, 400, 3);
      await sleep(700);
      const p3 = await pageTop(page);
      check('S11 wheel at list bottom chains to the page', p3 > p2 + 80, `page ${Math.round(p2)} -> ${Math.round(p3)}`);
    } else {
      check('S11 wheel over short order list scrolls the page', p1 > p0 + 100, `page ${Math.round(p0)} -> ${Math.round(p1)}`);
    }
  }
  await page.evaluate(() => window.localStorage.removeItem('gd-cart-v1'));
  await page.close();
}

async function testPurchaseBoxDropdown(browser) {
  console.log('\n== Service page select dropdowns (native prevented scroller) ==');
  const page = await newPage(browser);
  await goto(page, '/boosting/ffxiv/ffxiv-leveling-boost');
  // open each select in turn, find one whose option list overflows
  const listCount = await page.evaluate(
    () => document.querySelectorAll('main [data-lenis-prevent].max-h-60').length,
  );
  console.log(`  select dropdown lists found: ${listCount}`);
  let tested = false;
  for (let i = 0; i < listCount && !tested; i++) {
    // open the i-th dropdown via the toggle button in its .relative wrapper
    const opened = await page.evaluate((idx) => {
      const list = document.querySelectorAll('main [data-lenis-prevent].max-h-60')[idx];
      const btn = list?.closest('.relative')?.querySelector('button[aria-expanded]');
      if (!btn || btn.disabled) return false;
      btn.click();
      return true;
    }, i);
    if (!opened) continue;
    await sleep(500);
    // tag the open list so we can measure/wheel exactly it
    const state = await page.evaluate((idx) => {
      const list = document.querySelectorAll('main [data-lenis-prevent].max-h-60')[idx];
      if (!list) return null;
      list.id = 'scroll-test-target';
      return {
        overflows: list.scrollHeight > list.clientHeight + 1,
        open: list.getBoundingClientRect().height > 10,
      };
    }, i);
    if (!state || !state.open) continue;
    if (!state.overflows) {
      // close it again (toggle) and try the next one
      await page.evaluate(() => {
        const list = document.getElementById('scroll-test-target');
        list?.closest('.relative')?.querySelector('button[aria-expanded]')?.click();
        list?.removeAttribute('id');
      });
      await sleep(300);
      continue;
    }
    // overflowing dropdown: scroll it (native prevented scroller), then park
    // the dropdown at its bottom and the page at its top, kick a fresh page
    // animation, and wheel at the dropdown's edge — the page must take over,
    // not lock
    const box = await elBox(page, '#scroll-test-target');
    const d0 = await page.evaluate(
      () => document.getElementById('scroll-test-target').scrollTop,
    );
    await wheelOver(page, box, 300, 3, 60);
    await sleep(500);
    const d1 = await page.evaluate(
      () => document.getElementById('scroll-test-target').scrollTop,
    );
    check('S12 wheel over open dropdown scrolls the options', d1 > d0 + 30, `list ${d0} -> ${d1}`);
    await page.evaluate(() => {
      const el = document.getElementById('scroll-test-target');
      el.scrollTop = el.scrollHeight;
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
    });
    await sleep(400);
    // dropdown may have shifted with the page scroll — re-measure
    const box2 = await elBox(page, '#scroll-test-target');
    await page.mouse.move(700, 300);
    await page.mouse.wheel({ deltaY: 900 });
    await sleep(120);
    const p0 = await pageTop(page);
    await wheelOver(page, box2, 400, 2, 60);
    await sleep(700);
    const p1 = await pageTop(page);
    check('S12 no lock wheeling at dropdown edge mid-animation', p1 > p0 + 50, `page ${Math.round(p0)} -> ${Math.round(p1)}`);
    tested = true;
  }
  if (!tested) console.log('  (no overflowing select dropdown on this page — S12 skipped)');
  await page.close();
}

async function testMobile(browser) {
  console.log('\n== Mobile: native touch scroll ==');
  const page = await newPage(browser, { mobile: true });
  await goto(page, '/boosting/ffxiv');
  const t0 = await pageTop(page);
  await page.touchscreen.touchStart(195, 600);
  await page.touchscreen.touchMove(195, 350);
  await page.touchscreen.touchMove(195, 150);
  await page.touchscreen.touchEnd();
  await sleep(800);
  const t1 = await pageTop(page);
  check('S13 touch swipe scrolls the page', t1 > t0 + 150, `${Math.round(t0)} -> ${Math.round(t1)}`);

  // wheel over the mobile category bar (horizontal scroller) scrolls the page vertically
  const bar = await elBox(page, '#mobile-category-bar');
  if (bar) {
    const b0 = await pageTop(page);
    await wheelOver(page, bar, 400, 2);
    await sleep(700);
    const b1 = await pageTop(page);
    check('S13 wheel over mobile category bar scrolls the page', b1 > b0 + 100, `${Math.round(b0)} -> ${Math.round(b1)}`);
  } else {
    check('S13 mobile category bar exists', false);
  }
  await page.close();
}

async function testMobileMenuNested(browser) {
  console.log('\n== Mobile menu: nested category list chaining ==');
  const page = await newPage(browser, { mobile: true });
  // Short viewport so both the menu and an expanded category list overflow
  await page.setViewport({ width: 390, height: 700, hasTouch: true, isMobile: true });
  await goto(page, '/');
  await page.click('button[aria-label="Toggle menu"]');
  await sleep(700);
  await page.click('button[aria-label="Final Fantasy XIV categories"]');
  await sleep(700);
  const found = await page.evaluate(() => {
    const list = document.querySelector('.no-scrollbar .no-scrollbar');
    if (!list) return null;
    list.id = 'mm-list';
    const menu = list.parentElement.closest('.no-scrollbar');
    if (menu) menu.id = 'mm-menu';
    return {
      listOverflows: list.scrollHeight > list.clientHeight + 1,
      menuOverflows: menu ? menu.scrollHeight > menu.clientHeight + 1 : false,
    };
  });
  check('S14 expanded category list exists in the mobile menu', !!found);
  if (!found) {
    await page.close();
    return;
  }
  console.log(`  list overflows: ${found.listOverflows}, menu overflows: ${found.menuOverflows}`);
  const listBox = await elBox(page, '#mm-list');
  const tops = () =>
    page.evaluate(() => ({
      list: document.getElementById('mm-list')?.scrollTop ?? -1,
      menu: document.getElementById('mm-menu')?.scrollTop ?? -1,
    }));
  const t0 = await tops();
  await wheelOver(page, listBox, 300, 4);
  await sleep(700);
  const t1 = await tops();
  if (found.listOverflows) {
    check('S14 wheel over category list scrolls the list', t1.list > t0.list + 30, `list ${Math.round(t0.list)} -> ${Math.round(t1.list)}`);
    check('S14 menu stays put while the list scrolls', Math.abs(t1.menu - t0.menu) < 3, `menu ${t0.menu} -> ${t1.menu}`);
    // at the list's bottom edge the menu must take over (no freeze)
    await page.evaluate(() => {
      document.getElementById('mm-list').scrollTop = document.getElementById('mm-list').scrollHeight;
    });
    await sleep(300);
    const m0 = (await tops()).menu;
    await wheelOver(page, listBox, 400, 3);
    await sleep(700);
    const m1 = (await tops()).menu;
    if (found.menuOverflows) {
      check('S14 wheel at list bottom chains to the menu', m1 > m0 + 50, `menu ${Math.round(m0)} -> ${Math.round(m1)}`);
    } else {
      check('S14 wheel at list bottom is harmless (menu fits)', Math.abs(m1 - m0) < 3, `menu ${m0} -> ${m1}`);
    }
  } else {
    // list fits — wheeling over it should scroll the menu (or nothing if the menu fits too)
    if (found.menuOverflows) {
      check('S14 wheel over short list scrolls the menu', t1.menu > t0.menu + 50, `menu ${Math.round(t0.menu)} -> ${Math.round(t1.menu)}`);
    }
  }
  await page.close();
}

/* ---------- run ---------- */

const browser = await launchBrowser();
try {
  await testPageScrollAndSidebar(browser);
  await testShortSidebar(browser);
  await testNavbarSearch(browser);
  await testCartDrawer(browser);
  await testCheckout(browser);
  await testPurchaseBoxDropdown(browser);
  await testMobileMenuNested(browser);
  await testMobile(browser);
} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nALL SCROLL TESTS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
