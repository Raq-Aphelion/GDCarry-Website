/**
 * Throttles the Live Helper Chat widget's polling while the browser tab is
 * hidden AND the chat window is closed. The widget otherwise polls
 * `fetchmessages` (chat app, inside the same-origin about:blank iframe) and
 * `chatcheckstatus` (parent wrapper) every few seconds forever, even with the
 * window unfocused.
 *
 * While the tab is VISIBLE nothing changes — every request goes straight
 * through. While HIDDEN with the chat window OPEN (a live conversation —
 * the visitor is waiting on replies), nothing changes either: a 10-minute
 * delay there would break message delivery. Only hidden + closed (idle
 * session spam) is gated: the first poll passes, the rest wait on a shared
 * release timer, so at most one poll fires per THROTTLE_MS. Delaying (not
 * dropping) keeps the widget's request/response chain intact, and because
 * LHC chains its polls (the next one is scheduled after the previous
 * response), one delayed call naturally slows the whole loop. Non-poll
 * requests (sending a message, starting a chat) are never gated.
 */

/** One poll per minute while hidden+closed — matches the browser's own
    hidden-tab timer clamp (~1/min), so this only cuts the excess. The moment
    the tab becomes visible again, any held poll is released immediately
    (catch-up), and the chain resumes at full rate */
const THROTTLE_MS = 60 * 1000;

/** Poll endpoints (path fragments match both the wrapper's and the app's calls) */
const POLL_RE = /fetchmessages|chatcheckstatus/;

/** The chat window's open state — LHC toggles display on #lhc_widget_v2
    (the same signal lhcWidgetFx animates from) */
const isChatOpen = () => {
  const el = document.getElementById('lhc_widget_v2');
  return !!el && getComputedStyle(el).display !== 'none';
};

/** URL out of a fetch() first argument — duck-typed, because the iframe's
    Request/URL constructors are different realm objects than ours */
const urlOf = (input: unknown): string => {
  if (typeof input === 'string') return input;
  const u = (input as { url?: unknown } | null)?.url;
  if (typeof u === 'string') return u;
  return String(input ?? '');
};

type PatchedWindow = Window & {
  XMLHttpRequest?: typeof XMLHttpRequest;
  __gdPollPatched?: boolean;
};

const patchWindow = (win: PatchedWindow) => {
  if (win.__gdPollPatched || typeof win.fetch !== 'function') return;
  win.__gdPollPatched = true;

  // Gate state is per window context (page wrapper and iframe app throttle independently)
  let lastRun = 0;
  let pending: Promise<void> | null = null;
  let releasePending: (() => void) | null = null;
  const gate = (): Promise<void> => {
    // Visible tab, or an open chat window (live conversation) — never gate
    if (win.document.visibilityState !== 'hidden' || isChatOpen()) {
      lastRun = Date.now();
      return Promise.resolve();
    }
    const wait = lastRun + THROTTLE_MS - Date.now();
    if (wait <= 0) {
      lastRun = Date.now();
      return Promise.resolve();
    }
    // Coalesce concurrent polls onto one release timer
    if (!pending) {
      pending = new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          pending = null;
          releasePending = null;
          lastRun = Date.now();
          resolve();
        };
        const timer = setTimeout(finish, wait);
        releasePending = finish;
      });
    }
    return pending;
  };
  // Catch-up: a held poll is released the instant the tab becomes visible
  // again, so a returning visitor sees new messages right away instead of
  // waiting out the hidden-tab timer
  win.document.addEventListener('visibilitychange', () => {
    if (win.document.visibilityState === 'visible') releasePending?.();
  });

  const origFetch = win.fetch.bind(win);
  win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (!POLL_RE.test(urlOf(input))) return origFetch(input, init);
    return gate().then(() => origFetch(input, init));
  }) as typeof fetch;

  // XHR fallback — send() is deferred to the next allowed slot
  const xhrCtor = win.XMLHttpRequest;
  if (xhrCtor) {
    const xhrProto = xhrCtor.prototype as XMLHttpRequest & { __gdUrl?: unknown };
    const origOpen = xhrProto.open;
    const origSend = xhrProto.send;
    xhrProto.open = function (this: XMLHttpRequest & { __gdUrl?: unknown }, method: string, url: string | URL, ...rest: unknown[]) {
      this.__gdUrl = url;
      return (origOpen as (...a: unknown[]) => void).call(this, method, url, ...rest);
    } as typeof xhrProto.open;
    xhrProto.send = function (this: XMLHttpRequest & { __gdUrl?: unknown }, ...args: unknown[]) {
      if (this.__gdUrl && POLL_RE.test(String(this.__gdUrl))) {
        void gate().then(() => (origSend as (...a: unknown[]) => void).apply(this, args));
        return;
      }
      return (origSend as (...a: unknown[]) => void).apply(this, args);
    } as typeof xhrProto.send;
  }
};

/** Patches the page (wrapper polls) and the chat iframe (app polls). The
    iframe element is recreated by reloadWidget, so this re-checks on a slow
    tick like initOrderMessageStyler — the per-window tag makes it idempotent. */
export function initLhcPollThrottle() {
  patchWindow(window);
  const ensureIframePatched = () => {
    const el = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
    try {
      if (el?.contentWindow) patchWindow(el.contentWindow);
    } catch {
      // cross-origin — nothing we can do
    }
  };
  ensureIframePatched();
  setInterval(ensureIframePatched, 500);
}
