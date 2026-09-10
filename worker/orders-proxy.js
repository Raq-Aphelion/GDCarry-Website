/* Orders proxy — Cloudflare Worker. Source of truth for the worker deployed
   at https://gdcarry.com/api/order (route on the gdcarry.com zone, so the
   site-wide flood rate-limit rule covers it too).

   Routes:
     POST /api/order  checkout submissions — validates them, logs a canonical
                      record to Discord (webhook URL lives in the
                      DISCORD_WEBHOOK_URL secret — never in the client bundle),
                      and for live-chat orders injects the order into the
                      visitor's LHC chat
     POST /api/apply  booster applications from the Work With Us page —
                      forwarded to the roster Google Apps Script (APPLY_SCRIPT_URL
                      below) server-side, so the script URL never ships in the
                      client bundle

   Domain-dependent config (site/chat/db URLs, CORS origins) comes from the
   wrangler [vars] in worker/wrangler.toml — duplicated from site.config.json
   (the worker can't import that JSON at the toml level; keep them in sync).

   Prices: the worker imports the site's pricing engine
   (src/lib/pricing/engine) and recomputes every configured line
   authoritatively from its machine-readable config — tampered quotes are
   flagged in the Discord embed. Lines without a config (old carts) fall back
   to a catalog minimum-price check.

   Deploy with wrangler (bundles the engine import): see worker/wrangler.toml
     npx wrangler deploy --config worker/wrangler.toml

   Required bindings/secrets:
     TURNSTILE_SECRET_KEY  (secret) Cloudflare Turnstile widget secret — the
                           client earns a token per submission (X-Turnstile-Token
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
import { buildOrderMessage } from '../src/lib/order-format.ts';

/* Google Apps Script endpoint receiving booster applications (fields are
   read by the script by name — keep the mapping in handleApply in sync).
   Server-side only: the site POSTs to /api/apply instead. */
const APPLY_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyO-6iZZeasHImMtYFgPSOBX15uiV6kSx2yWEXO1EwPcYzqwEpuaoD3DWXj-1kvlTzO/exec';

/* CORS origins come from the ALLOWED_ORIGINS var (comma-separated) in
   worker/wrangler.toml — the http://localhost:3000 entry there covers the
   vite dev server (see vite.config.ts server.port). No hardcoded fallback:
   a missing var denies every cross-origin read. */
const allowedOrigins = (env) =>
  (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);

const cors = (request, env) => {
  const origin = request.headers.get('Origin') ?? '';
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Turnstile-Token',
    'Vary': 'Origin',
  };
  // Disallowed origins get NO ACAO header — sending 'null' would grant CORS
  // to sandboxed/null-origin documents and let them read responses.
  if (allowedOrigins(env).includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
};

/** Bodies above this are rejected unread — everything downstream is
    length-capped per field anyway, this just bounds CPU. */
const MAX_BODY_BYTES = 8192;

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

/** Bracket strip for Discord embed field values: without [ ] an
    attacker-controlled contact/name can't forge a clickable [text](url)
    markdown link for operators to click. */
const md = (v, max) => str(v, max).replace(/[[\]]/g, '');

/** Item thumbnails: same-origin images only, and a character allowlist so the
    URL can't smuggle markup past the prefix check (e.g.
    "https://<host>/x.png[/img][img]https://evil/…"). The host comes from the
    SITE_URL var. */
const safeImage = (v, siteUrl) => {
  const url = str(v, 200);
  const host = new URL(siteUrl).host.replace(/\./g, '\\.');
  return new RegExp(`^https:\\/\\/${host}\\/[\\w\\-./]+$`).test(url) ? url : '';
};

/* ------------------------------------------------------- price verification
   Quoted prices are computed in the visitor's browser and can be tampered
   with (cart lives in localStorage). Lines carrying a machine-readable
   config are recomputed AUTHORITATIVELY via the site's own pricing engine
   (imported above — same code, same catalog JSON) and the quote is compared
   to the cent. Legacy lines without a config fall back to a catalog
   minimum-price check. Advisory only: the check fails OPEN (unknown service,
   catalog unreachable, old client payload → no flag), it never blocks. */

const CATALOG_TTL_MS = 5 * 60 * 1000;
let catalogCache = { at: 0, db: null };

const loadCatalog = async (env) => {
  if (catalogCache.db && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.db;
  const parts = await Promise.all(
    [GLOBAL_PRICING_FILE, ...CATEGORY_FILES].map(async (f) => {
      try {
        const r = await fetch(env.DB_URL + f + '.json');
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
const verifyPrices = async (o, env) => {
  if (!o.items.some((it) => num(it.unitPriceEur) != null || (it.config && typeof it.config === 'object')))
    return [];
  let db;
  try {
    db = await loadCatalog(env);
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

/** Order chat message — built by the SHARED builder in
    src/lib/order-format.ts (the checkout fallback uses the same module, so
    injected and prefilled messages are byte-identical; the styler in
    src/lib/livechat.ts parses that format). Item thumbnails are validated
    same-origin here and go in as plain-text `Image: <url>` marker lines, NOT
    [img] BBCode: the operator chat renders text only, while the visitor-side
    styler turns the markers back into thumbnails. Matches the site's cart
    drawer / service card styling once styled: bold name, game · qty meta
    line, ◆ detail bullets, "Price:" unit price. */
const buildMessage = (o, siteUrl) =>
  buildOrderMessage({
    orderId: o.orderId,
    contact: o.contact,
    email: o.email,
    payment: o.payment,
    total: o.total,
    items: o.items.map((it) => ({
      name: it.name,
      meta: it.meta,
      details: Array.isArray(it.details) ? it.details : [],
      unitPrice: it.unitPrice,
      image: safeImage(it.image, siteUrl),
    })),
  });

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

const postLhc = async (path, payload, chatUrl) => {
  const res = await fetch(chatUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

/** Injects the order into the visitor's open chat. Returns a reason on failure. */
const injectIntoChat = async (o, env) => {
  if (!o.chatId || !o.chatHash) return { injected: false, reason: 'no_session' };
  const { res, data } = await postLhc('widgetrestapi/addmsguser', {
    id: o.chatId,
    hash: o.chatHash,
    msg: buildMessage(o, env.SITE_URL),
  }, env.CHAT_URL);
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

/** /api/apply — booster applications from the Work With Us page. Validated,
    then forwarded to the roster Apps Script (field names are read by the
    script — keep them in sync). Rate limiting + Turnstile run in the shared
    preflight in fetch(). */
const handleApply = async (request, env) => {
  let a;
  try { a = await request.json(); } catch { return new Response(null, { status: 400 }); }
  // Chunked requests have no Content-Length — re-check the parsed size (same
  // trick as the order route).
  if (JSON.stringify(a).length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  const discord = str(a.discord, 80).trim();
  const email = str(a.email, 120).trim();
  const games = (Array.isArray(a.games) ? a.games : []).map((g) => str(g, 60).trim()).filter(Boolean).slice(0, 10);
  const experience = str(a.experience, 2000).trim();
  if (
    discord.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    games.length === 0 ||
    experience.length < 10
  )
    return new Response(null, { status: 400 });

  const formData = new FormData();
  formData.set('Discord Username', discord);
  formData.set('E-Mail', email);
  formData.set('Games You Boost', games.join(', '));
  formData.set('Main Specialization', str(a.specialization, 200).trim());
  formData.set('Experience & Achievements', experience);
  formData.set('Proof Links', str(a.proof, 500).trim());
  formData.set('Availability', str(a.availability, 200).trim());
  formData.set('Why Should We Pick You?', str(a.motivation, 2000).trim());

  let result = null;
  try {
    const res = await fetch(APPLY_SCRIPT_URL, { method: 'POST', body: formData });
    result = await res.json();
  } catch {
    /* upstream unreachable/unparseable — reported as !ok below */
  }
  const ok = result?.result === 'success';
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 502,
    headers: { ...cors(request, env), 'Content-Type': 'application/json' },
  });
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors(request, env) });
    if (request.method !== 'POST')
      return new Response(null, { status: 405 });

    // Cheap reject before any KV read or body parsing
    const len = Number(request.headers.get('Content-Length') ?? 0);
    if (len > MAX_BODY_BYTES) return new Response(null, { status: 413 });

    // Rate limit before anything else — 5 requests/min/IP, both routes
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await rateLimit(env, ip)))
      return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
        status: 429,
        headers: { ...cors(request, env), 'Content-Type': 'application/json' },
      });

    // Anti-abuse challenge before any handling — the client earns a
    // Turnstile token at submit; the secret never ships anywhere.
    if (env.TURNSTILE_SECRET_KEY) {
      const token = request.headers.get('X-Turnstile-Token') ?? '';
      if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY)))
        return new Response(JSON.stringify({ ok: false, error: 'challenge_failed' }), {
          status: 403,
          headers: { ...cors(request, env), 'Content-Type': 'application/json' },
        });
    } else {
      console.warn('TURNSTILE_SECRET_KEY not set — skipping challenge verification (dev only, never deploy this way)');
    }

    // Route after the shared preflight — both endpoints get the same
    // body-size cap, rate limit and Turnstile gate
    const pathname = new URL(request.url).pathname;
    if (pathname.endsWith('/api/apply')) return handleApply(request, env);
    if (!pathname.endsWith('/api/order')) return new Response(null, { status: 404 });

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
    const flags = await verifyPrices(o, env);

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
        ({ injected, reason } = await injectIntoChat(o, env));
      } catch {
        reason = 'worker_error';
      }
    }

    return new Response(JSON.stringify({ ok: discord.ok, injected, reason }), {
      status: discord.ok ? 200 : 502,
      headers: { ...cors(request, env), 'Content-Type': 'application/json' },
    });
  },
};
