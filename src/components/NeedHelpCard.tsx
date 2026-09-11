import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { MessageCircle, X } from 'lucide-react';
import { CHAT_OPENED_EVENT, getLhcSession, openLiveChat } from '@/lib/livechat';
import { CHAT_URL } from '@/lib/site-config';

/** Delay before the card pops in */
const SHOW_DELAY_MS = 5000;
/** sessionStorage key — closed once, hidden for the rest of the tab session */
const DISMISS_KEY = 'gd-needhelp-dismissed';
/** How often the card re-checks chat/widget state (either hides it) */
const CHAT_POLL_MS = 2000;
/** Exit animation length — keep in sync with .needhelp-out in index.css */
const CLOSE_MS = 220;

/** Operator avatars, left to right — with their ring colors. FALLBACK stack:
    when LHC returns a live random operator photo (a proactive invitation
    with "Show random operator profile" must exist — getinvitation is the
    only public source of operator photos), it replaces the THIRD slot.
    Rings stay positional (red / yellow / green). */
const AVATARS: { src: string; ring: string }[] = [
  { src: '/images/support/operator-1.png', ring: 'border-red-500' },
  { src: '/images/support/operator-2.jpg', ring: 'border-yellow-500' },
  { src: '/images/support/operator-3.png', ring: 'border-green-500' },
];

const LHC_BASE = CHAT_URL;

/** The card only ever appears on the main page */
const isSuppressed = (pathname: string) => pathname !== '/';

/** Reads the LHC widget open state from the wrapper (widgetStatus is a
    BehaviorSubject — valueInternal is its current value) */
const isWidgetOpen = () => {
  const w = window as unknown as {
    $_LHC?: { attributes?: { widgetStatus?: { valueInternal?: boolean; value?: boolean } } };
  };
  const ws = w.$_LHC?.attributes?.widgetStatus;
  return ws?.valueInternal === true || ws?.value === true;
};

/** Offline state — the theme's CSS paints #status-icon.offline-status when
    no operator is online; read that class straight out of the shadow root */
const isBadgeOffline = () => {
  const icon = document
    .getElementById('lhc_status_widget_v2')
    ?.shadowRoot?.querySelector('#status-icon');
  return icon?.classList.contains('offline-status') ?? false;
};

/** "Need help" card — a fully site-styled replacement for LHC's native
    proactive bubble (which stays suppressed in the theme): operator avatar
    stack and a Let's chat button. Fixed above the LHC status circle; closes
    INSTANTLY (no exit animation) the moment the widget opens by any means —
    site buttons (CHAT_OPENED_EVENT), badge clicks (capture-phase listener —
    LHC handles them inside its shadow DOM and fires nothing), anything else
    within one poll tick — or when a chat starts. Once any site control
    opened the chat, the card never auto-shows again this tab session. */
export default function NeedHelpCard() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  // Live random operator photo — prepended over the fallback stack when LHC
  // has one to offer; the fallbacks below stay as-is otherwise
  const [liveAvatar, setLiveAvatar] = useState<string | null>(null);
  // Set once any site control opened the chat — blocks the auto-show timer
  // (the badge circle is the way back in, so the card never pops up again)
  const chatOpened = useRef(false);
  // Badge state mirror: offline mode flips the card to grey styling (polled —
  // the status change lives in the badge's shadow root, outside React's reach)
  const [offline, setOffline] = useState(false);
  // Right offset aligning the card's right edge with the badge circle's —
  // measured ONCE per appearance (see effect below), then static
  const [badgeRight, setBadgeRight] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  /** `dismissed` also remembers the close for the rest of the tab session
      (explicit closes only). Chat-open hides are INSTANT (no exit
      animation) and override an in-progress animated exit — a dismissal
      already written to sessionStorage stays written. */
  const hide = (dismissed: boolean, instant = false) => {
    if (dismissed) sessionStorage.setItem(DISMISS_KEY, '1');
    if (instant) {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      setClosing(false);
      setVisible(false);
      return;
    }
    if (closing) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => setVisible(false), CLOSE_MS);
  };
  const dismiss = () => hide(true);

  // Pop in after a delay — once per tab session, never on suppressed routes,
  // and only while no chat is going. While visible, keep polling: a
  // suppressed route, an open widget or a started chat closes the card (not
  // counted as a dismissal).
  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const show = window.setTimeout(() => {
      if (!chatOpened.current && !isSuppressed(pathname) && !getLhcSession()?.id && !isWidgetOpen()) setVisible(true);
    }, SHOW_DELAY_MS);
    const poll = window.setInterval(() => {
      if (isSuppressed(pathname) || getLhcSession()?.id || isWidgetOpen()) hide(false, true);
    }, CHAT_POLL_MS);
    return () => {
      window.clearTimeout(show);
      window.clearInterval(poll);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // A site control opening the widget hides the card instantly — the 2s poll
  // alone left them overlapping, and its widgetStatus read is unreliable, so
  // the card sometimes never hid at all. The flag also disarms the show
  // timer: without it, opening the widget within 5s of a navigation left the
  // timer armed, and it fired on widget minimize/close — the card flashed
  // for a beat until the next poll hid it.
  useEffect(() => {
    const onChatOpened = () => {
      chatOpened.current = true;
      hide(false, true);
    };
    window.addEventListener(CHAT_OPENED_EVENT, onChatOpened);
    return () => window.removeEventListener(CHAT_OPENED_EVENT, onChatOpened);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Badge clicks open the widget entirely inside LHC's shadow DOM — no
  // CHAT_OPENED_EVENT fires, so the card otherwise waited up to 2s for the
  // poll and overlapped the widget. A capture-phase listener on the document
  // sees the click BEFORE LHC handles it (the path includes the badge host
  // element even across the open shadow root). Same for any LHC-managed
  // open trigger that lives in the main document.
  useEffect(() => {
    const onBadgeClick = (e: MouseEvent) => {
      const badge = document.getElementById('lhc_status_widget_v2');
      if (badge && e.composedPath().includes(badge)) {
        chatOpened.current = true; // same engagement as a site control — no auto-show afterwards
        hide(false, true);
      }
    };
    document.addEventListener('click', onBadgeClick, true);
    return () => document.removeEventListener('click', onBadgeClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live random operator photo (best effort — the fallback stack stays on any
  // failure). The vid only exists once the LHC wrapper has booted, so retry.
  useEffect(() => {
    let cancelled = false;
    let attempts = 10;
    const tryFetch = async () => {
      const vid = getLhcSession()?.vid;
      if (!vid) {
        if (attempts-- > 0) setTimeout(tryFetch, 1000);
        return;
      }
      try {
        const res = await fetch(`${LHC_BASE}widgetrestapi/getinvitation?vid=${encodeURIComponent(vid)}`);
        const data = (await res.json()) as { photo?: string };
        if (!cancelled && data.photo) setLiveAvatar(data.photo);
      } catch {
        /* fallback stack stays */
      }
    };
    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track the badge's offline state (polled — the status change lives in the
  // badge's shadow root, outside React's reach)
  useEffect(() => {
    const read = () => setOffline(isBadgeOffline());
    read();
    const poll = window.setInterval(read, 1000);
    return () => window.clearInterval(poll);
  }, []);

  // Align the card's right edge to the badge circle's: ONE rounded sample as
  // the card appears, then never again — no poll means scroll-time rect noise
  // can't nudge it. A hovered badge scales its circle 1.1×, so if the pointer
  // happens to be on it, wait for the hover to end before sampling (a few
  // retries, then give up and take whatever's there).
  useEffect(() => {
    if (!visible) return;
    let attempts = 10;
    let timer: number | null = null;
    const measure = () => {
      const badge = document.getElementById('lhc_status_widget_v2');
      if (!badge || badge.matches(':hover')) {
        if (attempts-- > 0) timer = window.setTimeout(measure, 300);
        return;
      }
      const icon = badge.shadowRoot?.querySelector('#status-icon');
      const r = (icon ?? badge).getBoundingClientRect();
      if (r.width > 0) setBadgeRight(Math.max(0, Math.round(window.innerWidth - r.right)));
    };
    measure();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [visible]);

  if (!visible || isSuppressed(pathname)) return null;

  // Live photo takes the THIRD slot (green ring); the fallback stack fills in
  const avatars = liveAvatar
    ? [AVATARS[0], AVATARS[1], { src: liveAvatar, ring: AVATARS[2].ring }]
    : AVATARS;

  return (
    <div
      className={`fixed z-[80] w-[300px] max-w-[calc(100vw-24px)] rounded-xl border bg-[#151519] p-4 pt-6 ${
        offline
          ? 'border-[#34343e] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)]'
          : 'border-[rgba(59,130,246,0.35)] shadow-[0_24px_60px_-24px_rgba(59,130,246,0.30),0_25px_50px_-12px_rgba(0,0,0,0.55)]'
      } ${closing ? 'needhelp-out pointer-events-none' : 'needhelp-in'}`}
      // Right edge flush with the badge circle's (sampled once on appearance,
      // 20px — the theme's badge inset — until the sample lands); bottom sits
      // ~8px higher than the original bottom-28 spot
      style={{ right: badgeRight ?? 20, bottom: 120 }}
      role="dialog"
      aria-label="Live support"
    >
      {/* Avatar stack — half outside the card's top edge; positional rings
          (red/yellow/green) while online, all red when the badge is offline.
          pointer-events-none: purely decorative — no drag / right-click-open */}
      <div className="pointer-events-none absolute -top-[18px] left-4 flex select-none" aria-hidden>
        {avatars.map((a, i) => (
          <img
            key={a.src}
            src={a.src}
            alt=""
            className={`h-9 w-9 rounded-full border-2 object-cover ${offline ? 'border-red-500' : a.ring} ${i > 0 ? '-ml-2.5' : ''}`}
          />
        ))}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 cursor-pointer rounded-[5px] p-1.5 text-[#94a3b8] transition-colors hover:text-white"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="font-display text-[17px] font-bold text-white">24/7 Human Support</p>
      <p className="mt-0.5 text-xs text-[#94a3b8]">Real Gamers at your disposal</p>

      <button
        onClick={() => {
          // Dismiss BEFORE opening: openLiveChat fires CHAT_OPENED_EVENT
          // synchronously, and the listener's instant hide unmounts the card
          // on the spot — the dismissal must be in sessionStorage by then
          dismiss();
          openLiveChat();
        }}
        className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-gradient-to-r from-[#60a5fa] to-[#2563eb] py-2.5 font-display text-sm font-bold text-[#0f0f11] transition-all hover:brightness-110"
      >
        <MessageCircle className="h-4 w-4" />
        Let’s chat
      </button>
    </div>
  );
}
