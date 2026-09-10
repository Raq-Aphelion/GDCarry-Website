import siteConfig from '../../site.config.json';

/* Typed accessors for site.config.json (repo root) — the single source of
   truth for the site's URLs. The worker duplicates the domain-dependent
   values in worker/wrangler.toml [vars]; keep the two in sync. */

/** Canonical site origin, no trailing slash — 'https://gdcarry.com' */
export const SITE_URL = siteConfig.siteUrl;
/** Bare host for LHC's `domain` embed arg — 'gdcarry.com' */
export const SITE_DOMAIN = new URL(siteConfig.siteUrl).host;
/** Live Helper Chat REST base, trailing slash — 'https://chat.gdcarry.com/index.php/' */
export const CHAT_URL = siteConfig.chatUrl;
/** Live Helper Chat widget loader script (host root, outside chatUrl's /index.php/ base) */
export const CHAT_WIDGET_SCRIPT_URL = new URL('design/defaulttheme/js/widgetv2/index.js', siteConfig.chatUrl).href;
/** Static catalog base the client/worker fetch service JSONs from */
export const DB_URL = siteConfig.dbUrl;
/** Order log proxy (Cloudflare Worker) */
export const ORDER_API_URL = siteConfig.orderApiUrl;
/** Booster-application proxy (Cloudflare Worker) — forwards to the Apps Script server-side */
export const APPLY_API_URL = siteConfig.applyApiUrl;
export const DISCORD_INVITE = siteConfig.discordInvite;
/** First-visit IP geolocation for the default currency guess */
export const IP_GEOLOCATION_URL = siteConfig.ipGeolocationUrl;
/** Cloudflare Turnstile site key — PUBLIC by design (it identifies the widget;
    verification uses a Cloudflare-only secret). Local dev: use Cloudflare's
    always-pass test key 1x00000000000000000000AA. */
export const TURNSTILE_SITE_KEY = siteConfig.turnstileSiteKey;
/** Google Fonts stylesheet for Sora + Inter (site weight set) */
export const GOOGLE_FONTS_URL = siteConfig.googleFontsUrl;
/** Google Fonts css2 endpoint base, for consumers needing a different weight set */
export const GOOGLE_FONTS_BASE = siteConfig.googleFontsUrl.slice(0, siteConfig.googleFontsUrl.indexOf('?') + 1);
