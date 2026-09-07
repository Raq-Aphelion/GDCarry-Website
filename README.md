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
  hooks/  lib/  Custom hooks and helpers (order message building, chat styling, …)
public/
  db/           Public pricing/catalog JSON fetched client-side
  images/  payment/  videos/   Static assets
scripts/prerender.mjs   Puppeteer prerender of every route to static HTML
lhcstyle/               LiveHelperChat theme builder + exported theme JSON
worker/                 Cloudflare orders proxy (orders-proxy.js + wrangler.toml)
```

## External services

There is no backend in this repo. The frontend talks to:

- **Orders worker** (`gdcarry.com/api/order`, source in `worker/orders-proxy.js`,
  deploy config `worker/wrangler.toml`) — receives checkout submissions,
  recomputes every line's price authoritatively via the shared pricing engine
  (`src/lib/pricing/engine/`, imported at bundle time), and relays the order
  to the operator (Discord webhook + live chat). Gated by a Cloudflare
  Turnstile challenge: the client earns a token at checkout
  (`X-Turnstile-Token` header) and the worker re-verifies it against the
  widget secret, which lives only in Cloudflare — unlike a shared key, the
  site key in `src/pages/CheckoutPage.tsx` is public by design. Deploy:
  `npx wrangler deploy --config worker/wrangler.toml` (one-time KV namespace +
  secrets setup is documented in the toml). `npm test` runs the golden suites
  (`src/lib/pricing/engine/tests/`) pinning engine prices to the catalog
  formulas.
- **LiveHelperChat** at `chat.gdcarry.com` — the support/order chat widget
  (`src/components/LiveChatWidget.tsx`, theme in `lhcstyle/`).
- **Google Apps Script** — the "Work with us" application form target.
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
- There is no CSP meta tag on purpose — the Content-Security-Policy lives in
  Cloudflare (it needs `https://challenges.cloudflare.com` for Turnstile in
  script-src/frame-src/connect-src); only the referrer policy meta is in
  `index.html`.
