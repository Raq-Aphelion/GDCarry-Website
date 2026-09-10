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
     TURNSTILE_SECRET_KEY  (secret) Cloudflare Turnstile widget secret — the
                           client earns a token per order (X-Turnstile-Token
                           header) and the worker re-verifies it; nothing
                           secret ships in the bundle
     DISCORD_WEBHOOK_URL  (secret) Discord channel webhook
     RATE_LIMIT           (KV namespace binding) per-IP rate limiting

   Note: the Turnstile site key is public by design, but forging a token
   requires the Cloudflare-only secret — treat every other field as
   attacker-controlled regardless. */

import { CATEGORY_FILES, GLOBAL_PRICING_FILE } from '../src/data/pricing.ts';
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
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Turnstile-Token',
    'Vary': 'Origin',
  };
  // Disallowed origins get NO ACAO header — sending 'null' would grant CORS
  // to sandboxed/null-origin documents and let them read responses.
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
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

/** Same bracket strip for Discord embed field values: without [ ] an
    attacker-controlled contact/name can't forge a clickable [text](url)
    markdown link for operators to click. */
const md = (v, max) => str(v, max).replace(/[[\]]/g, '');

/** Item thumbnails: same-origin images only, and a character allowlist so the
    URL can't smuggle markup past the prefix check (e.g.
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
    [GLOBAL_PRICING_FILE, ...CATEGORY_FILES].map(async (f) => {
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
      // try/catch: a hostile config must flag the line, never 500 the request
      // (that would skip the Discord log entirely — a logging DoS).
      let line = null;
      try {
        line = computeLine(db, str(it.id, 80), it.config);
      } catch {
        line = null;
      }
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

/** Order chat message — the print layout. Item thumbnails go in as plain-text
    `Image: <url>` lines, NOT [img] BBCode: the operator chat then renders
    ordinary text only, while the visitor-side styler (src/lib/livechat.ts)
    turns those marker lines back into thumbnails when it rebuilds the
    message. Matches the site's cart drawer / service card styling once
    styled: bold name, game · qty meta line, ◆ detail bullets, "From" unit
    price. */
const buildMessage = (o) => {
  const itemBlocks = o.items
    .slice(0, 5)
    .map((it) => {
      const img = safeImage(it.image);
      return [
        `[b]${bb(it.name, 120)}[/b]`,
        bb(it.meta, 80),
        (Array.isArray(it.details) ? it.details : []).map((d) => `◆ ${bb(d, 120)}`).join('\n'),
        bb(it.unitPrice, 30) ? `From [b]${bb(it.unitPrice, 30)}[/b]` : '',
        img ? `Image: ${img}` : '',
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

/** Anti-abuse challenge — the client earns a Turnstile token at checkout and
    sends it as X-Turnstile-Token; the matching secret key lives ONLY in
    Cloudflare (unlike the old shared ORDER_KEY, nothing secret ships in the
    bundle). Tokens are single-use and short-lived. Without a secret (local
    dev) verification is skipped — production MUST set TURNSTILE_SECRET_KEY. */
const verifyTurnstile = async (token, ip, secret) => {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
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
  const { res, data } = await postLhc('widgetrestapi/addmsguser', {
    id: o.chatId,
    hash: o.chatHash,
    msg: buildMessage(o),
  });
  if (res.ok && data.error !== true) return { injected: true };
  // Reason is an internal enum, never LHC's raw error string — don't echo
  // upstream error text back to the client.
  const r = String(data.r ?? '');
  return {
    injected: false,
    reason: /closed/i.test(r) ? 'chat_closed' : 'lhc_rejected',
  };
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
    { name: 'Contact via', value: md(o.contactVia, 20) || '—', inline: true },
    { name: 'Contact', value: md(o.contact, 60) || '—', inline: true },
    { name: 'E-mail', value: md(o.email, 60) || '—', inline: true },
    { name: 'Payment', value: md(o.payment, 40) || '—', inline: true },
    { name: 'Total', value: md(o.total, 30) || '—', inline: true },
    {
      name: 'Items',
      value:
        o.items
          .map((it) => {
            const details = Array.isArray(it.details) && it.details.length
              ? `\n· ${it.details.map((d) => md(d, 120)).join('\n· ')}` : '';
            return `**${md(it.name, 120)}** (${md(it.gameShort, 20)}) ×${Math.min(+it.qty || 1, 9999)} — ${md(it.price, 30)}${details}`;
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

    // Anti-abuse challenge before any order handling — the client earns a
    // Turnstile token at checkout; the secret never ships anywhere.
    if (env.TURNSTILE_SECRET_KEY) {
      const token = request.headers.get('X-Turnstile-Token') ?? '';
      if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY)))
        return new Response(JSON.stringify({ ok: false, error: 'challenge_failed' }), {
          status: 403,
          headers: { ...cors(request), 'Content-Type': 'application/json' },
        });
    } else {
      console.warn('TURNSTILE_SECRET_KEY not set — skipping challenge verification (dev only, never deploy this way)');
    }

    let o;
    try { o = await request.json(); } catch { return new Response(null, { status: 400 }); }
    // Chunked requests have no Content-Length — re-check the parsed size so
    // the cap can't be skipped by omitting the header.
    if (JSON.stringify(o).length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
    if (!/^\d{6}-[A-Z0-9]{4}$/.test(str(o.orderId, 30)))
      return new Response(null, { status: 400 });
    o.items = Array.isArray(o.items) ? o.items.slice(0, 20) : [];
    o.vid = hex(o.vid, 64);
    o.chatHash = hex(o.chatHash, 64);
    const chatId = Number(o.chatId);
    o.chatId = Number.isInteger(chatId) && chatId > 0 ? chatId : 0;

    // Verify quoted prices against catalog floors — flags go into the embed
    const flags = await verifyPrices(o);

    // Canonical record — logged for every order, both channels
    const discord = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Grand Dice Orders',
        embeds: [buildEmbed(o, flags)],
        // Defense-in-depth: never let any field ping the channel.
        allowed_mentions: { parse: [] },
      }),
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
