# GDCarry

Static storefront for [gdcarry.com](https://gdcarry.com) — FFXIV boosting services
(gil, leveling, MSQ, raids, deep dungeon, PvP, relics, mounts). Catalog-driven
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
```

`dist/` is the deployable artifact — serve it with any static host. The site
currently sits behind Cloudflare.

## Project structure

```
src/
  pages/        Route components (Home, GamePage, ServicePage, CheckoutPage, …)
  components/   Purchase boxes, navbar/footer, cart drawer, live-chat widget, ui/
  context/      Cart, currency, and other React context providers
  data/         Catalog loading/typing on top of public/db JSON
  hooks/  lib/  Custom hooks and helpers (order message building, chat styling, …)
public/
  db/           Public pricing/catalog JSON fetched client-side
  images/  payment/  videos/   Static assets
scripts/prerender.mjs   Puppeteer prerender of every route to static HTML
lhcstyle/               LiveHelperChat theme builder + exported theme JSON
```

## External services

There is no backend in this repo. The frontend talks to:

- **Orders worker** (`gdcarry.com/api/order`, source in `worker/orders-proxy.js`) —
  receives checkout submissions and relays them to the operator (Discord
  webhook + live chat). Auth'd with a shared `X-Order-Key` header (see
  `src/pages/CheckoutPage.tsx`); validation and rate limiting live in the
  worker — treat the key as public, it ships in the client bundle.
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
- Checkout and other utility routes are `noIndex` and excluded from
  `sitemap.xml` / `robots.txt`; keep it that way when adding routes.
- `src/components/ui/` is stock shadcn — prefer tweaking theme tokens in
  `tailwind.config.js` / `src/index.css` over editing those files.
