/* Orders proxy — Cloudflare Worker. Source of truth for the worker deployed
   at https://gdcarry.com/api/order (route on the gdcarry.com zone, so the
   site-wide flood rate-limit rule covers it too).

   Receives checkout submissions from the site, validates them, logs a
   canonical record to Discord (webhook URL lives in the DISCORD_WEBHOOK_URL
   secret — never in the client bundle), and for live-chat orders injects the
   order into the visitor's LHC chat.

   Required bindings/secrets:
     ORDER_KEY            (secret) shared with the site's X-Order-Key header
     DISCORD_WEBHOOK_URL  (secret) Discord channel webhook
     RATE_LIMIT           (KV namespace binding) per-IP rate limiting

   Note: X-Order-Key is public by nature (it ships in the client bundle) — it
   is a soft filter only. Real abuse control = the rate limit + validation
   below; treat every field as attacker-controlled. */

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
    @everyone/@here in user input cannot ping. */
const buildEmbed = (o) => ({
  title: `New order placed — ${o.orderId}`,
  color: 0x22d3ee,
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

    // Canonical record — logged for every order, both channels
    const discord = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Grand Dice Orders', embeds: [buildEmbed(o)] }),
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
