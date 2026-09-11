# GDCarry

Static storefront for [gdcarry.com](https://gdcarry.com) — boosting services
for FFXIV, World of Warcraft, Lost Ark, Warframe and RuneScape. Catalog-driven
marketing pages with a cart, a checkout that hands orders off to a human
operator over live chat / Discord, FAQ, guides, and legal pages.

## Stack

- **React 19 + TypeScript + Vite 7**, routed with `react-router`
- **Tailwind CSS 3** with a custom navy theme; **shadcn/ui** primitives in `src/components/ui/`
- **Static prerender**: `vite build` output is rendered to per-route HTML with
  Puppeteer (`scripts/prerender.mjs`), so the deployed site is plain static files
- ESLint 9 (flat config) + `typescript-eslint`, `react-hooks`, `react-refresh`

## Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b && vite build && prerender → dist/
npm run prerender  # re-run only the prerender step against an existing dist/
npm run lint       # eslint .
npm run preview    # serve the Vite build locally (no prerendered HTML)
npm test           # golden pricing-engine suites (engine vs. catalog formulas)
npm run add:service / remove:service   # scaffold/remove a catalog service
npm run validate:services              # catalog/db consistency checks
```

`dist/` is the deployable artifact — serve it with any static host. The site
currently sits behind Cloudflare.

## Project structure

```
src/
  pages/        Route components (Home, CheckoutPage, FaqPage, …)
  pages/games/  Game + service pages: shared GamePageCore/ServicePageCore plus
                per-game shells (GamePageFFXIV, ServicePageWoW, …)
  components/   Purchase boxes, navbar/footer, cart drawer, live-chat widget, ui/
  context/      Cart, currency, and other React context providers
  data/         Catalog typing/loading on top of public/db JSON; data/games/
                holds the catalog split per game (ffxiv.ts, wow.ts, …)
  lib/pricing/  Pricing engine (src/lib/pricing/engine/) — the single source
                of truth for prices, shared verbatim with the orders worker
  lib/order-format.ts  Order chat-message wire format — the one builder is
                shared by the checkout fallback, the worker, and the chat
                styler's parser (src/lib/livechat.ts)
  lib/site-config.ts   Typed accessor over site.config.json (URLs/keys)
  hooks/  lib/  Custom hooks and helpers (chat styling, currency, …)
public/
  db/           Public pricing/catalog JSON (the editing source of truth);
                compiled into a single db/bundle.json at build time and
                fetched client-side as one request
  images/  payment/  videos/   Static assets
scripts/prerender.mjs   Puppeteer prerender of every route to static HTML
lhcstyle/               LiveHelperChat theme builder + exported theme JSON
worker/                 Cloudflare orders/apply proxy (orders-proxy.js + wrangler.toml)
site.config.json        Site-wide URLs/keys (domain, chat base, API paths,
                        Turnstile site key, Discord invite) — see Conventions
```

## External services

There is no backend in this repo. The frontend talks to:

- **Orders worker** (`gdcarry.com/api/order` + `gdcarry.com/api/apply`, source
  in `worker/orders-proxy.js`, deploy config `worker/wrangler.toml`) — receives
  checkout submissions, recomputes every line's price authoritatively via the
  shared pricing engine (`src/lib/pricing/engine/`, imported at bundle time),
  and relays the order to the operator (Discord webhook + live chat, message
  built by the shared `src/lib/order-format.ts`). It also proxies the
  "Work with us" booster applications to a Google Apps Script server-side, so
  the script URL never ships in the client bundle. Both routes share the same
  rate limiting and are gated by a Cloudflare Turnstile challenge: the client
  earns a token at submit time (`X-Turnstile-Token` header) and the worker
  re-verifies it against the widget secret, which lives only in Cloudflare —
  unlike a shared key, the site key in `site.config.json` is public by design.
  Domain-dependent worker config (site/chat/db URLs, CORS origins) comes from
  the `[vars]` in `worker/wrangler.toml`. Deploy:
  `npx wrangler deploy --config worker/wrangler.toml` (one-time KV namespace +
  secrets setup is documented in the toml). `npm test` runs the golden suites
  (`src/lib/pricing/engine/tests/`) pinning engine prices to the catalog
  formulas.
- **LiveHelperChat** at `chat.gdcarry.com` — the support/order chat widget
  (`src/components/LiveChatWidget.tsx`, theme in `lhcstyle/`).
- **Google Apps Script** — the "Work with us" application form target, reached
  only through the worker's `/api/apply` route.
- **ipapi.co** — first-visit geolocation to pick a default currency.

Prices and cart contents are computed client-side and treated as a *quote*;
payment is arranged manually by a manager after the order comes in — the site
never processes payments itself.

## Conventions

- Purchase boxes (`src/components/*PurchaseBox.tsx`) are self-contained
  price/configurator widgets per service category, fed by `public/db/` JSON.
  They don't compute totals inline — they build a machine-readable `config`
  (a `family` plus its options) and call the shared engine
  (`src/lib/pricing/engine/`), so the site, the cart and the worker can never
  disagree on a price. Adding a box = adding (or reusing) a family compute and
  a golden test in `src/lib/pricing/engine/tests/`; `npm test` fails on any
  drift from the catalog formulas, and the price-floor suite requires every
  service's bundled `price:` to have a worker-verifiable floor in the db JSON.
- Game catalogs live in `src/data/games/<game>.ts` (re-exported through
  `src/data/games/index.ts`) — keep game-specific services in that game's
  file; only cross-game types/helpers go in `index.ts`.
- Checkout and other utility routes are `noIndex` and excluded from
  `sitemap.xml` / `robots.txt`; keep it that way when adding routes.
- `src/components/ui/` is stock shadcn — prefer tweaking theme tokens in
  `tailwind.config.js` / `src/index.css` over editing those files.
- Site-wide URLs and public keys (domain, chat base, API paths, Turnstile
  site key, Discord invite, ipapi endpoint) live in `site.config.json` —
  never hardcode them in pages, components, or scripts; import them from
  `src/lib/site-config.ts` (client) or read the JSON (scripts). The worker
  can't import the JSON at the toml level, so its copies live in the
  `[vars]` of `worker/wrangler.toml` — keep the two files in sync.
- The order chat message has exactly one builder — `buildOrderMessage` in
  `src/lib/order-format.ts`, used by the worker (server-side injection) and
  the checkout fallback alike; the styler in `src/lib/livechat.ts` derives
  its parsing from the same module's constants. Never edit the format in
  just one place, and keep changes additive — old formats persist in stored
  chat history.
- There is no CSP meta tag on purpose — the Content-Security-Policy lives in
  Cloudflare (it needs `https://challenges.cloudflare.com` for Turnstile in
  script-src/frame-src/connect-src); only the referrer policy meta is in
  `index.html`. connect-src must also list `wss://chat.gdcarry.com` —
  `https://chat.gdcarry.com` does not cover the LiveChat WebSocket. Cloudflare
  Bot Fight Mode is incompatible with this CSP: it injects a per-request inline
  script (`/cdn-cgi/challenge-platform/scripts/jsd/main.js`) whose hash changes
  every request, so keep Bot Fight Mode off (Turnstile covers checkout abuse).
