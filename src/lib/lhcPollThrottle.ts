/**
 * Throttles the Live Helper Chat widget's polling while the browser tab is
 * hidden. The widget otherwise polls `fetchmessages` (chat app, inside the
 * same-origin about:blank iframe) and `chatcheckstatus` (parent wrapper) every
 * few seconds forever, even with the window unfocused.
 *
 * While the tab is VISIBLE nothing changes — every request goes straight
 * through. While HIDDEN, poll requests are gated: the first one passes, the
 * rest wait on a shared release timer, so at most one poll fires per
 * THROTTLE_MS. Delaying (not dropping) keeps the widget's request/response
 * chain intact, and because LHC chains its polls (the next one is scheduled
 * after the previous response), one delayed call naturally slows the whole
 * loop. Non-poll requests (sending a message, starting a chat) are never
 * gated.
 */

/** One poll per 10 minutes while the tab is hidden */
const THROTTLE_MS = 10 * 60 * 1000;

/** Poll endpoints (path fragments match both the wrapper's and the app's calls) */
const POLL_RE = /fetchmessages|chatcheckstatus/;

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
  const gate = (): Promise<void> => {
    if (win.document.visibilityState !== 'hidden') {
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
      pending = new Promise<void>((resolve) =>
        setTimeout(() => {
          pending = null;
          lastRun = Date.now();
          resolve();
        }, wait),
      );
    }
    return pending;
  };

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
