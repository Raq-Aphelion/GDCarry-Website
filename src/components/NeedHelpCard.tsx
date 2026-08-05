import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { getLhcSession, openLiveChat, openLiveChatPrefill } from '@/lib/livechat';

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
  { src: 'https://i.gyazo.com/61f36a7bf5fdff93fb6f4977cded514d.png', ring: 'border-red-500' },
  { src: 'https://chat.gdcarry.com/var/userphoto/2026y/08/03/3/1671b3ba485599e1acc34be772408fd0.jpg', ring: 'border-yellow-500' },
  { src: 'https://chat.gdcarry.com/var/userphoto/2026y/08/02/1/7af11194662c7dd281678f0eeffbcf84.png', ring: 'border-green-500' },
];

const LHC_BASE = 'https://chat.gdcarry.com/index.php/';

/** Reads the LHC widget open state from the wrapper (widgetStatus is a
    BehaviorSubject — valueInternal is its current value) */
const isWidgetOpen = () => {
  const w = window as unknown as {
    $_LHC?: { attributes?: { widgetStatus?: { valueInternal?: boolean; value?: boolean } } };
  };
  const ws = w.$_LHC?.attributes?.widgetStatus;
  return ws?.valueInternal === true || ws?.value === true;
};

/** "Need help" card — a fully site-styled replacement for LHC's native
    proactive bubble (which stays suppressed in the theme): operator avatar
    stack, Let's chat, and a message input that starts a chat with the typed
    text as the first message. Fixed above the LHC status circle; closes
    (animated) when the widget opens or a chat starts. */
export default function NeedHelpCard() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState('');
  // Live random operator photo — prepended over the fallback stack when LHC
  // has one to offer; the fallbacks below stay as-is otherwise
  const [liveAvatar, setLiveAvatar] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  /** Plays the exit animation, then unmounts. `dismissed` also remembers the
      close for the rest of the tab session (explicit closes only). */
  const hide = (dismissed: boolean) => {
    if (closing) return;
    if (dismissed) sessionStorage.setItem(DISMISS_KEY, '1');
    setClosing(true);
    closeTimer.current = window.setTimeout(() => setVisible(false), CLOSE_MS);
  };
  const dismiss = () => hide(true);

  // Pop in after a delay — once per tab session, and only while no chat is
  // going. While visible, keep polling: an open widget or a started chat
  // closes the card (not counted as a dismissal).
  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const show = window.setTimeout(() => {
      if (!getLhcSession()?.id && !isWidgetOpen()) setVisible(true);
    }, SHOW_DELAY_MS);
    const poll = window.setInterval(() => {
      if (getLhcSession()?.id || isWidgetOpen()) hide(false);
    }, CHAT_POLL_MS);
    return () => {
      window.clearTimeout(show);
      window.clearInterval(poll);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
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

  if (!visible) return null;

  // Live photo takes the THIRD slot (green ring); the fallback stack fills in
  const avatars = liveAvatar
    ? [AVATARS[0], AVATARS[1], { src: liveAvatar, ring: AVATARS[2].ring }]
    : AVATARS;

  const send = () => {
    const q = message.trim();
    if (q && !getLhcSession()?.id) {
      // No chat yet — start one with the typed message as the first one
      openLiveChatPrefill({ question: q });
    } else {
      // Chat already running (or empty input) — just open the widget
      openLiveChat();
    }
    dismiss();
  };

  return (
    <div
      className={`fixed bottom-28 right-5 z-[80] w-[300px] max-w-[calc(100vw-24px)] rounded-xl border border-[rgba(59,130,246,0.35)] bg-[#151519] p-4 pt-6 shadow-[0_24px_60px_-24px_rgba(59,130,246,0.30),0_25px_50px_-12px_rgba(0,0,0,0.55)] ${
        closing ? 'needhelp-out pointer-events-none' : 'needhelp-in'
      }`}
      role="dialog"
      aria-label="Live support"
    >
      {/* Avatar stack — half outside the card's top edge, one ring color each */}
      <div className="absolute -top-[18px] left-4 flex" aria-hidden>
        {avatars.map((a, i) => (
          <img
            key={a.src}
            src={a.src}
            alt=""
            className={`h-9 w-9 rounded-full border-2 object-cover ${a.ring} ${i > 0 ? '-ml-2.5' : ''}`}
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
          openLiveChat();
          dismiss();
        }}
        className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-gradient-to-r from-[#60a5fa] to-[#2563eb] py-2.5 font-display text-sm font-bold text-[#0f0f11] transition-all hover:brightness-110"
      >
        <MessageCircle className="h-4 w-4" />
        Let’s chat
      </button>

      {/* Type a message — sending starts the chat with it as the first message */}
      <div className="mt-2.5 flex items-center gap-2 rounded-[5px] border border-[#34343e] bg-[#1b1b20] py-1.5 pl-4 pr-1.5">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="WRITE A MESSAGE..."
          aria-label="Write a message"
          className="min-w-0 flex-1 bg-transparent text-xs text-[#f1f5f9] placeholder:text-[11px] placeholder:font-semibold placeholder:tracking-wider placeholder:text-[#64748b] outline-none"
        />
        <button
          onClick={send}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-gradient-to-r from-[#60a5fa] to-[#2563eb] text-[#0f0f11] transition-all hover:brightness-110"
          aria-label="Send message and start chat"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
