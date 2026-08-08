/* Orders proxy — Cloudflare Worker. Source of truth for the worker deployed
   at https://gdcarry.com/api/order (route on the gdcarry.com zone, so the
   site-wide flood rate-limit rule covers it too).

   Receives checkout submissions from the site, validates them, logs a
   canonical record to Discord (webhook URL lives in the DISCORD_WEBHOOK_URL
   secret — never in the client bundle), and for live-chat orders injects the
   order into the visitor's LHC chat.

   Prices: the worker imports the site's pricing engine
   (src/lib/pricing/engine) and recomputes every configured line
   authoritatively from its machine-readable config — tampered quotes are
   flagged in the Discord embed. Lines without a config (old carts) fall back
   to a catalog minimum-price check.

   Deploy with wrangler (bundles the engine import): see worker/wrangler.toml
     npx wrangler deploy --config worker/wrangler.toml

   Required bindings/secrets:
     ORDER_KEY            (secret) shared with the site's X-Order-Key header
     DISCORD_WEBHOOK_URL  (secret) Discord channel webhook
     RATE_LIMIT           (KV namespace binding) per-IP rate limiting

   Note: X-Order-Key is public by nature (it ships in the client bundle) — it
   is a soft filter only. Real abuse control = the rate limit + validation
   below; treat every field as attacker-controlled. */

import { CATEGORY_FILES } from '../src/data/pricing.ts';
import {
  computeLine,
  fromPrice,
  lineTotal,
  mergeCategoryFiles,
} from '../src/lib/pricing/engine/index.ts';

const ALLOWED_ORIGINS = [
  'https://gdcarry.com',
  'https://www.gdcarry.com',
  'http://localhost:3000', // vite dev server (see vite.config.ts)
];

const LHC_BASE = 'https://chat.gdcarry.com/index.php/';

/** Bodies above this are rejected unread — everything downstream is
    length-capped per field anyway, this just bounds CPU. */
const MAX_BODY_BYTES = 8192;

const cors = (request) => {
  const origin = request.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Order-Key',
    'Vary': 'Origin',
  };
};

/** Max 5 order requests per minute per IP (KV-backed; eventually consistent —
    stops abuse, not a determined flood). */
const rateLimit = async (env, ip, limit = 5, windowSec = 60) => {
  const key = `rl:${ip}`;
  const hits = parseInt((await env.RATE_LIMIT.get(key)) ?? '0', 10);
  if (hits >= limit) return false;
  await env.RATE_LIMIT.put(key, String(hits + 1), { expirationTtl: windowSec });
  return true;
};

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const hex = (v, max) => (/^[a-z0-9]+$/i.test(str(v, max)) ? str(v, max) : '');

/** Free-text fields that land in BBCode (the LHC chat message) must not
    contain brackets — otherwise a forged order can inject [img]/[url] into
    the operator's chat. */
const bb = (v, max) => str(v, max).replace(/[[\]]/g, '');

/** Item thumbnails: same-origin images only, and a character allowlist so the
    URL can't smuggle BBCode past the prefix check (e.g.
    "https://gdcarry.com/x.png[/img][img]https://evil/…"). */
const safeImage = (v) => {
  const url = str(v, 200);
  return /^https:\/\/gdcarry\.com\/[\w\-./]+$/.test(url) ? url : '';
};

/* ------------------------------------------------------- price verification
   Quoted prices are computed in the visitor's browser and can be tampered
   with (cart lives in localStorage). Lines carrying a machine-readable
   config are recomputed AUTHORITATIVELY via the site's own pricing engine
   (imported above — same code, same catalog JSON) and the quote is compared
   to the cent. Legacy lines without a config fall back to a catalog
   minimum-price check. Advisory only: the check fails OPEN (unknown service,
   catalog unreachable, old client payload → no flag), it never blocks. */

const DB_BASE = 'https://gdcarry.com/db/';
const CATALOG_TTL_MS = 5 * 60 * 1000;
let catalogCache = { at: 0, db: null };

const loadCatalog = async () => {
  if (catalogCache.db && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.db;
  const parts = await Promise.all(
    ['pricing', ...CATEGORY_FILES].map(async (f) => {
      try {
        const r = await fetch(DB_BASE + f + '.json');
        return r.ok ? await r.json() : null;
      } catch {
        return null;
      }
    }),
  );
  const db = mergeCategoryFiles(parts[0], parts.slice(1));
  catalogCache = { at: Date.now(), db };
  return db;
};

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const eur = (n) => `€${n.toFixed(2)}`;

/** Compares quoted prices against engine-recomputed (or, for legacy lines,
    floor) values. Returns flag strings (empty = order looks fine). Skipped
    entirely for old payloads with neither raw numbers nor configs, so a
    stale site build never produces false flags. */
const verifyPrices = async (o) => {
  if (!o.items.some((it) => num(it.unitPriceEur) != null || (it.config && typeof it.config === 'object')))
    return [];
  let db;
  try {
    db = await loadCatalog();
  } catch {
    return []; // catalog unreachable — fail open
  }
  const flags = [];
  let sum = 0;
  for (const it of o.items) {
    const unit = num(it.unitPriceEur);
    const total = num(it.totalEur);
    const qty = num(it.qty) ?? 1;
    const label = str(it.name, 60) || str(it.id, 60) || 'item';
    if (total != null) sum += total;
    if (unit != null && total != null && total < unit * qty - 0.02)
      flags.push(`${label}: total ${eur(total)} < unit ${eur(unit)} ×${qty}`);
    if (it.config && typeof it.config === 'object' && typeof it.config.family === 'string') {
      // Structured config → authoritative recompute. NOTE: qty comes from the
      // cart line (runs/gil amount are editable in the cart drawer after the
      // config was captured); the config supplies per-unit price parts.
      const line = computeLine(db, str(it.id, 80), it.config);
      if (!line) {
        flags.push(`${label}: unrecognized pricing config — verify this line manually`);
      } else if (total != null) {
        const authoritative = lineTotal({ ...line, qty });
        if (Math.abs(total - authoritative) > Math.max(0.02, authoritative * 0.005))
          flags.push(`${label}: quoted ${eur(total)} but catalog computes ${eur(authoritative)} for these options`);
      }
      continue;
    }
    // Legacy payload (no config): minimum-price floor check only
    const floor = fromPrice(db, str(it.id, 80));
    if (floor != null && unit != null && unit < floor * 0.98)
      flags.push(`${label}: quoted ${eur(unit)} below catalog minimum ${eur(floor)}`);
  }
  const orderTotal = num(o.totalEur);
  if (orderTotal != null && orderTotal < sum - 0.02)
    flags.push(`Order total ${eur(orderTotal)} < sum of items ${eur(sum)}`);
  return flags;
};

/** BBCode order message — the chat print layout. Matches the site's cart
    drawer / service card styling once the visitor-side styler processes it:
    bold name, game · qty meta line, ◆ detail bullets, "From" unit price,
    then the thumbnail. */
const buildMessage = (o, withImages = true) => {
  const itemBlocks = o.items
    .slice(0, 5)
    .map((it) => {
      const img = safeImage(it.image);
      return [
        `[b]${bb(it.name, 120)}[/b]`,
        bb(it.meta, 80),
        (Array.isArray(it.details) ? it.details : []).map((d) => `◆ ${bb(d, 120)}`).join('\n'),
        bb(it.unitPrice, 30) ? `From [b]${bb(it.unitPrice, 30)}[/b]` : '',
        withImages && img ? `[img]${img}[/img]` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  return [
    '[b]ORDER DETAILS[/b]',
    `[b]Order ID:[/b] ${o.orderId}`,
    '',
    `[b]Name:[/b] ${bb(o.contact, 60)}`,
    `[b]E-mail:[/b] ${bb(o.email, 60) || '—'}`,
    `[b]Payment:[/b] ${bb(o.payment, 40)}`,
    '',
    '[b]Items:[/b]',
    itemBlocks,
    '',
    `Total: [b]${bb(o.total, 30)}[/b]`,
  ].join('\n');
};

const postLhc = async (path, payload) => {
  const res = await fetch(LHC_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

/** Injects the order into the visitor's open chat. Returns a reason on failure. */
const injectIntoChat = async (o) => {
  if (!o.chatId || !o.chatHash) return { injected: false, reason: 'no_session' };
  const attempt = (msg) =>
    postLhc('widgetrestapi/addmsguser', { id: o.chatId, hash: o.chatHash, msg });

  let { res, data } = await attempt(buildMessage(o, true));
  // LHC rejects [img] when visitor uploads are disabled — retry without images
  if (data.error && /upload disabled/i.test(String(data.r))) {
    ({ res, data } = await attempt(buildMessage(o, false)));
  }
  if (res.ok && data.error !== true) return { injected: true };
  const r = String(data.r ?? '');
  return { injected: false, reason: /closed/i.test(r) ? 'chat_closed' : r.slice(0, 120) || 'unknown' };
};

/** Discord embed. Everything lives in embed fields (never `content`), so
    @everyone/@here in user input cannot ping. Price-check flags turn the
    embed amber and get their own field — the operator must verify the quote
    against the catalog before taking the order. */
const buildEmbed = (o, flags = []) => ({
  title: `New order placed — ${o.orderId}`,
  color: flags.length ? 0xf59e0b : 0x22d3ee,
  timestamp: new Date().toISOString(),
  fields: [
    { name: 'Contact via', value: str(o.contactVia, 20), inline: true },
    { name: 'Contact', value: str(o.contact, 60), inline: true },
    { name: 'E-mail', value: str(o.email, 60) || '—', inline: true },
    { name: 'Payment', value: str(o.payment, 40), inline: true },
    { name: 'Total', value: str(o.total, 30), inline: true },
    {
      name: 'Items',
      value:
        o.items
          .map((it) => {
            const details = Array.isArray(it.details) && it.details.length
              ? `\n· ${it.details.map((d) => str(d, 120)).join('\n· ')}` : '';
            return `**${str(it.name, 120)}** (${str(it.gameShort, 20)}) ×${Math.min(+it.qty || 1, 99)} — ${str(it.price, 30)}${details}`;
          })
          .join('\n')
          .slice(0, 1024) || '—',
      inline: false,
    },
    ...(flags.length
      ? [{ name: '⚠️ PRICE CHECK — verify before quoting', value: flags.join('\n').slice(0, 1024), inline: false }]
      : []),
  ],
});

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors(request) });
    if (request.method !== 'POST')
      return new Response(null, { status: 405 });

    // Cheap reject before any KV read or body parsing
    const len = Number(request.headers.get('Content-Length') ?? 0);
    if (len > MAX_BODY_BYTES) return new Response(null, { status: 413 });

    // Rate limit before anything else — 5 orders/min/IP
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await rateLimit(env, ip)))
      return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
        status: 429,
        headers: { ...cors(request), 'Content-Type': 'application/json' },
      });

    if (request.headers.get('X-Order-Key') !== env.ORDER_KEY)
      return new Response(null, { status: 401 });

    let o;
    try { o = await request.json(); } catch { return new Response(null, { status: 400 }); }
    if (!/^\d{6}-[A-Z0-9]{4}$/.test(str(o.orderId, 30)))
      return new Response(null, { status: 400 });
    o.items = Array.isArray(o.items) ? o.items.slice(0, 20) : [];
    o.vid = hex(o.vid, 64);
    o.chatHash = hex(o.chatHash, 64);
    o.chatId = Number.isInteger(o.chatId) ? o.chatId : 0;

    // Verify quoted prices against catalog floors — flags go into the embed
    const flags = await verifyPrices(o);

    // Canonical record — logged for every order, both channels
    const discord = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Grand Dice Orders', embeds: [buildEmbed(o, flags)] }),
    });

    let injected = false, reason;
    if (o.channel === 'chat') {
      try {
        ({ injected, reason } = await injectIntoChat(o));
      } catch {
        reason = 'worker_error';
      }
    }

    return new Response(JSON.stringify({ ok: discord.ok, injected, reason }), {
      status: discord.ok ? 200 : 502,
      headers: { ...cors(request), 'Content-Type': 'application/json' },
    });
  },
};
