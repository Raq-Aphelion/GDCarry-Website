import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { CheckCircle2, Circle, Loader2, Mail, MessageCircle, Timer, Bitcoin, Landmark, type LucideIcon } from 'lucide-react';
import Reveal from '@/components/Reveal';
import PageMeta, { SITE_URL } from '@/components/PageMeta';
import FadeImage from '@/components/FadeImage';
import FieldPopup from '@/components/FieldPopup';
import { OverlayScrollbar } from '@/components/Scrollbar';
import { useCart, type CartItem } from '@/context/CartContext';
import { lineTotal } from '@/lib/cart';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { openLiveChatPrefill } from '@/lib/livechat';
import { serviceLink } from '@/data/games';
import ffxivBg from '@/assets/images/backgrounds/ffxiv-bg.webp';

/** Simulated processing time — the spinner runs until the "order" completes. */
const PROCESSING_MS = 1200;
const RETURN_COUNTDOWN_S = 10;
/** Right column's order box matches the left column's height only side-by-side. */
const TWO_COL_QUERY = '(min-width: 1024px)';

/** Paste your Discord channel webhook URL here — every placed order is posted
    as a Discord embed for the bot to log. While empty, webhook logging is
    skipped (the live chat flow still works). */
const DISCORD_WEBHOOK_URL = '';

type Stage = 'idle' | 'processing' | 'done';
type ContactVia = 'chat' | 'discord';

/** Checkout: contact options + payment (left), order summary + purchase (right).
    The cart is only cleared once the purchase finishes processing, so leaving
    the page beforehand keeps the cart intact. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYMENT_METHODS: { id: string; label: string; logo?: string; icon?: LucideIcon }[] = [
  { id: 'paypal', label: 'PayPal', logo: '/payment/paypal.svg' },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'revolut', label: 'Revolut', icon: Landmark },
];

/** Discord brand glyph (lucide-react ships no brand icons). Path: simple-icons, CC0. */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

const CONTACT_OPTIONS: { id: ContactVia; label: string; icon: LucideIcon | typeof DiscordIcon }[] = [
  { id: 'chat', label: 'Live chat', icon: MessageCircle },
  { id: 'discord', label: 'Discord', icon: DiscordIcon },
];

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { format } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  // Doubles as the Name field (live chat) or Discord username field (discord)
  const [contact, setContact] = useState('');
  const [contactVia, setContactVia] = useState<ContactVia>('chat');
  // A field's error bubble is hidden while that field is focused
  const [contactFocused, setContactFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  // "Can't find it?" hint (discord mode only): toggled by click, hover on desktop
  const [hintOpen, setHintOpen] = useState(false);
  const hintRef = useRef<HTMLSpanElement>(null);
  // Scroll target for failed submits on mobile (contact block sits above the button)
  const contactRef = useRef<HTMLElement>(null);
  // Field errors surface on the first Place Order click, not while typing
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [method, setMethod] = useState('paypal');
  const [stage, setStage] = useState<Stage>('idle');
  // Snapshot of the purchased items — the cart itself is cleared on completion
  const [purchased, setPurchased] = useState<CartItem[]>([]);
  const [countdown, setCountdown] = useState(RETURN_COUNTDOWN_S);

  // Left column height drives the order box's max height (lg side-by-side only):
  // the right column (order box + wait text + button) matches the left column,
  // so the Place Order button's bottom aligns with the left column's bottom
  const [leftColEl, setLeftColEl] = useState<HTMLDivElement | null>(null);
  const [actionEl, setActionEl] = useState<HTMLDivElement | null>(null);
  const [orderMaxH, setOrderMaxH] = useState<number | undefined>(undefined);
  // Order list scroller + overflow state (drives the overlay scrollbar inset)
  const [orderListEl, setOrderListEl] = useState<HTMLUListElement | null>(null);
  const [orderOverflows, setOrderOverflows] = useState(false);
  // Edge fades on the sides the list content overflows
  const [orderFadeTop, setOrderFadeTop] = useState(false);
  const [orderFadeBottom, setOrderFadeBottom] = useState(false);

  // Close the hint popup on any click outside of it
  useEffect(() => {
    if (!hintOpen) return;
    const onDown = (e: PointerEvent) => {
      if (hintRef.current && !hintRef.current.contains(e.target as Node)) setHintOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [hintOpen]);

  // Count down to the automatic redirect once the order is confirmed
  useEffect(() => {
    if (stage !== 'done') return;
    const iv = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(iv);
  }, [stage]);

  useEffect(() => {
    if (stage === 'done' && countdown <= 0) navigate('/');
  }, [stage, countdown, navigate]);

  useEffect(() => {
    if (!leftColEl) return;
    const update = () => {
      if (!window.matchMedia(TWO_COL_QUERY).matches) {
        setOrderMaxH(undefined);
        return;
      }
      // 32 = the space-y-8 gap between the order box and the action block
      setOrderMaxH(Math.max(160, leftColEl.offsetHeight - (actionEl?.offsetHeight ?? 0) - 32));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(leftColEl);
    if (actionEl) ro.observe(actionEl);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [leftColEl, actionEl]);

  useEffect(() => {
    if (!orderListEl) return;
    const check = () => {
      setOrderOverflows(orderListEl.scrollHeight > orderListEl.clientHeight + 1);
      setOrderFadeTop(orderListEl.scrollTop > 4);
      setOrderFadeBottom(orderListEl.scrollTop < orderListEl.scrollHeight - orderListEl.clientHeight - 4);
    };
    check();
    orderListEl.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(orderListEl);
    Array.from(orderListEl.children).forEach((c) => ro.observe(c));
    return () => {
      orderListEl.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [orderListEl]);

  if (items.length === 0 && stage === 'idle') return <Navigate to="/" replace />;

  const orderItems = stage === 'idle' ? items : purchased;
  const orderTotal = orderItems.reduce((sum, i) => sum + lineTotal(i), 0);
  const locked = stage !== 'idle';

  // Contact rules per option:
  // - Live chat: Name and e-mail are both mandatory.
  // - Discord: username is mandatory; e-mail is optional but must be valid if given.
  const emailValid = EMAIL_RE.test(email.trim());
  const contactValid = contact.trim().length >= 2;
  const emailRequired = contactVia === 'chat';
  const emailOk = emailRequired ? emailValid : email.trim() === '' || emailValid;
  const formValid = contactValid && emailOk;

  const contactFlag = submitAttempted && !contactValid;
  const emailFlag = submitAttempted && !emailOk;
  const contactError = !contactFlag || contactFocused
    ? ''
    : contactVia === 'chat'
      ? 'Please enter your name.'
      : 'Discord usernames are at least 2 characters.';
  const emailError = !emailFlag || emailFocused
    ? ''
    : emailRequired
      ? 'Please enter a valid e-mail address.'
      : 'Please enter a valid e-mail address — or leave this field empty.';

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method;

  /** Full order as BBCode (LHC renders [b]/[img]/[url] in chat) — used for
      the live chat message field. Per item: bold title, game · qty · price
      meta line, diamond config bullets, then the thumbnail (re-arranged into
      a thumbnail-left row by openLiveChatPrefill once the message lands). */
  const buildOrderMessage = () => {
    const itemBlocks = orderItems
      .slice(0, 5)
      .map((item, n) => {
        const details = (item.details ?? []).map((d) => `🔹 ${d}`).join('\n');
        return [
          `[b]${n + 1}. ${item.name}[/b]`,
          `${item.gameShort} · ×${item.qty} — ${format(lineTotal(item))}`,
          details,
          `[img]${new URL(item.image, SITE_URL).href}[/img]`,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n');
    return [
      '[b]NEW GRAND DICE ORDER[/b]',
      '',
      `[b]Contact via:[/b] ${contactVia === 'chat' ? 'Live chat' : 'Discord'}`,
      `[b]${contactVia === 'chat' ? 'Name' : 'Discord'}:[/b] ${contact.trim()}`,
      `[b]E-mail:[/b] ${email.trim() || '—'}`,
      `[b]Payment:[/b] ${methodLabel}`,
      '',
      '[b]Items:[/b]',
      itemBlocks,
      '',
      `[b]Total: ${format(orderTotal)}[/b]`,
    ].join('\n');
  };

  /** Posts the order to the Discord webhook for the bot to log. */
  const logOrderToDiscord = async () => {
    if (!DISCORD_WEBHOOK_URL) return;
    const itemLines = orderItems
      .map((item) => {
        const details = item.details?.length ? `\n· ${item.details.join('\n· ')}` : '';
        return `**${item.name}** (${item.gameShort}) ×${item.qty} — ${format(lineTotal(item))}${details}`;
      })
      .join('\n');
    const firstImage = orderItems[0] ? new URL(orderItems[0].image, SITE_URL).href : undefined;
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Grand Dice Orders',
        embeds: [
          {
            title: 'New order placed',
            color: 0x22d3ee,
            timestamp: new Date().toISOString(),
            ...(firstImage ? { thumbnail: { url: firstImage } } : {}),
            fields: [
              { name: 'Contact via', value: contactVia === 'chat' ? 'Live chat' : 'Discord', inline: true },
              { name: contactVia === 'chat' ? 'Name' : 'Discord', value: contact.trim(), inline: true },
              { name: 'E-mail', value: email.trim() || '—', inline: true },
              { name: 'Payment', value: methodLabel, inline: true },
              { name: 'Total', value: format(orderTotal), inline: true },
              { name: 'Items', value: itemLines.slice(0, 1024), inline: false },
            ],
          },
        ],
      }),
    });
  };

  const purchase = (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!formValid) {
      if (!window.matchMedia(TWO_COL_QUERY).matches) {
        contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    const message = buildOrderMessage();
    const prefill =
      contactVia === 'chat'
        ? { username: contact.trim(), email: email.trim(), question: message }
        : null;
    setPurchased(items);
    setStage('processing');
    // Discord bot logging — fire and forget, it never blocks the order
    logOrderToDiscord().catch(() => {});
    window.setTimeout(() => {
      clear();
      setStage('done');
      if (prefill) {
        // The helper sets the start-form fields first, then opens the widget
        openLiveChatPrefill(prefill);
        toast({
          title: 'Order placed',
          description: 'Opening the live chat with your order details — a manager will take it from there.',
          variant: 'blue',
        });
      } else {
        toast({
          title: 'Order placed',
          description: 'A Grand Dice manager will contact you on Discord within minutes.',
          variant: 'blue',
        });
      }
    }, PROCESSING_MS);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-[25px] py-12 sm:px-6 lg:px-8">
      <PageMeta title="Checkout" description="GD Carry checkout." path="/checkout" noIndex />
      {/* Faded game art behind the top of the page — same background as the service page */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[460px] w-screen -translate-x-1/2" aria-hidden>
        <div className="absolute inset-0">
          <FadeImage
            src={ffxivBg}
            alt=""
            className="h-full w-full"
            imgClassName="opacity-50 lg:object-[50%_35%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/75 to-navy-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/60" />
      </div>

      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Order Placement</h1>
      </Reveal>

      {/* noValidate: native browser popups are replaced by FieldPopup bubbles */}
      <form noValidate onSubmit={purchase} className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        {/* ============ LEFT: CONTACT + PAYMENT ============ */}
        <div ref={setLeftColEl} className="min-w-0 space-y-8">
          <Reveal delay={100}>
            <section ref={contactRef} className="purchase-box-glow rounded-[5px] bg-navy-800 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">How should we reach you?</h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose your preferred contact option, then enter your details so we can confirm and complete your order.
              </p>
              <fieldset disabled={locked} className="mt-5 space-y-4">
                {/* Contact option switch — same style as payment methods, one row */}
                <div className="grid grid-cols-2 gap-3">
                  {CONTACT_OPTIONS.map((o) => {
                    const selected = contactVia === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setContactVia(o.id)}
                        disabled={locked}
                        aria-pressed={selected}
                        className={`group flex w-full cursor-pointer items-center gap-3 rounded-[5px] border bg-navy-900/80 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? 'border-cyan-600/40 hover:border-cyan-500/60 disabled:hover:border-cyan-600/40'
                            : 'border-navy-700/70 hover:border-navy-600 disabled:hover:border-navy-700/70'
                        }`}
                      >
                        <o.icon className="h-5 w-5 shrink-0 text-slate-300" />
                        <span className="text-sm font-semibold text-white">{o.label}</span>
                        {selected ? (
                          <span className="relative ml-auto h-5 w-5 shrink-0">
                            <CheckCircle2 className="absolute inset-0 h-5 w-5 text-cyan-400 transition-opacity duration-200 group-active:opacity-0" aria-label="Selected" />
                            <Circle className="absolute inset-0 h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-active:opacity-100" aria-hidden />
                          </span>
                        ) : (
                          <Circle className="ml-auto h-5 w-5 shrink-0 text-slate-600" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Not a wrapping <label>: in discord mode the hint button must
                    stay the only thing that toggles the popup */}
                <div className="block">
                  {/* Fixed row height: identical in both contact modes, so
                      toggling never shifts the layout (the "Can't find it?"
                      button only exists in discord mode) */}
                  <span className="mb-1.5 flex h-[18px] items-center justify-between gap-2">
                    <label htmlFor="checkout-contact" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      {contactVia === 'chat' ? 'Name *' : 'Discord *'}
                    </label>
                    {contactVia === 'discord' && (
                      /* Hint popup: hover on desktop, click-toggle on touch —
                         closes on second click or any click outside */
                      <span ref={hintRef} className="group relative">
                        <button
                          type="button"
                          onClick={() => setHintOpen((o) => !o)}
                          aria-expanded={hintOpen}
                          className="text-xs font-medium text-cyan-400 underline decoration-dotted underline-offset-2"
                        >
                          Can’t find it?
                        </button>
                        <span
                          className={`pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-72 rounded-[5px] border border-navy-700/70 bg-navy-800 p-2.5 shadow-2xl transition-opacity duration-200 group-hover:opacity-100 ${
                            hintOpen ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img
                            src="/images/discord-username-hint.svg"
                            alt="Where to find your Discord username"
                            className="w-full rounded-[3px]"
                          />
                          <span className="mt-1.5 block text-xs leading-snug text-slate-400">
                            Your username sits under your avatar, bottom-left of the Discord app.
                          </span>
                        </span>
                      </span>
                    )}
                  </span>
                  <div className="relative">
                    {contactVia === 'chat' ? (
                      <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    ) : (
                      <DiscordIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    )}
                    <FieldPopup message={contactError} />
                    <input
                      id="checkout-contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      onFocus={() => setContactFocused(true)}
                      onBlur={() => setContactFocused(false)}
                      placeholder={contactVia === 'chat' ? 'Your name' : 'username'}
                      className={`h-[42px] w-full rounded-[3px] border bg-navy-900/80 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors disabled:opacity-60 ${
                        contactFlag
                          ? 'border-red-500/60'
                          : 'border-navy-700/70 hover:border-navy-600 focus:border-navy-600'
                      }`}
                    />
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    {contactVia === 'chat' ? (
                      'E-mail *'
                    ) : (
                      <>
                        E-mail{' '}
                        <span className="font-medium normal-case tracking-normal text-slate-600">(optional)</span>
                      </>
                    )}
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <FieldPopup message={emailError} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="you@example.com"
                      className={`h-[42px] w-full rounded-[3px] border bg-navy-900/80 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors disabled:opacity-60 ${
                        emailFlag
                          ? 'border-red-500/60'
                          : 'border-navy-700/70 hover:border-navy-600 focus:border-navy-600'
                      }`}
                    />
                  </div>
                </label>
                <p className="text-xs leading-relaxed text-slate-500">
                  {contactVia === 'chat'
                    ? 'Your contact details will be linked to your order. The live chat opens automatically after checkout with your order details filled in — if it’s unavailable, we’ll use your e-mail instead.'
                    : 'We’ll message you on Discord to confirm and schedule your order — double-check your username and keep friend requests open. Your e-mail is only used as a backup if we can’t reach you there.'}
                </p>
              </fieldset>
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section className="purchase-box-glow rounded-[5px] bg-navy-800 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Payment method</h2>
              {/* Exactly one method is always selected — clicking switches, never unselects */}
              <div className="mt-4 space-y-3">
                {PAYMENT_METHODS.map((m) => {
                  const selected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      disabled={locked}
                      aria-pressed={selected}
                      className={`group flex w-full cursor-pointer items-center gap-3 rounded-[5px] border bg-navy-900/80 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? 'border-cyan-600/40 hover:border-cyan-500/60 disabled:hover:border-cyan-600/40'
                          : 'border-navy-700/70 hover:border-navy-600 disabled:hover:border-navy-700/70'
                      }`}
                    >
                      {m.logo ? (
                        <img src={m.logo} alt={m.label} className="h-5 w-auto" />
                      ) : m.icon ? (
                        <m.icon className="h-5 w-5 text-slate-300" />
                      ) : null}
                      <span className="text-sm font-semibold text-white">{m.label}</span>
                      {selected ? (
                        /* Held down: the checkmark fades into a greyed-out empty
                           circle, and back to selected on release */
                        <span className="relative ml-auto h-5 w-5 shrink-0">
                          <CheckCircle2 className="absolute inset-0 h-5 w-5 text-cyan-400 transition-opacity duration-200 group-active:opacity-0" aria-label="Selected" />
                          <Circle className="absolute inset-0 h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-active:opacity-100" aria-hidden />
                        </span>
                      ) : (
                        <Circle className="ml-auto h-5 w-5 shrink-0 text-slate-600" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </Reveal>
        </div>

        {/* ============ RIGHT: ORDER + PURCHASE ============ */}
        <div className="min-w-0 space-y-8">
          <Reveal delay={150}>
            {/* Bottom edge aligns with the left column on lg; the item list
                scrolls inside (overlay scrollbar) when it overflows — then the
                list pads right so the pill doesn't crowd the entries */}
            <section
              style={{ maxHeight: orderMaxH }}
              className="flex flex-col rounded-[5px] bg-navy-850 p-5 shadow-2xl sm:p-6"
            >
              <h2 className="flex shrink-0 items-center gap-2 border-b border-navy-700/60 pb-4 font-display text-lg font-bold text-white">
                Your order
                {/* Same count pill as the cart sidebar */}
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {orderItems.reduce((s, i) => s + i.qty, 0)} item{orderItems.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}
                </span>
              </h2>
              <div className="relative mt-5 flex min-h-0 flex-1 flex-col">
                <ul
                  ref={setOrderListEl}
                  className={`no-scrollbar min-h-0 flex-1 divide-y divide-navy-700/50 overflow-y-auto ${orderOverflows ? 'pr-4' : ''}`}
                >
                  {orderItems.map((item) => (
                    <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      {/* Configured services carry a ::config suffix — strip it for the link */}
                      <Link
                        to={serviceLink(item.id.split('::')[0])}
                        className="shrink-0"
                        aria-label={`View ${item.name}`}
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="h-12 w-12 rounded-[5px] object-cover object-top transition-opacity hover:opacity-80"
                          loading="lazy"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-cyan-400/80">
                          {item.gameShort} · ×{item.qty}
                        </p>
                        {item.details && item.details.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {item.details.map((d) => (
                              <li key={d} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="inline-block h-1 w-1 rotate-45 bg-cyan-500/70" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <span className="shrink-0 font-display text-sm font-bold text-cyan-400">
                        {format(lineTotal(item))}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Edge fades where the list content overflows */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-navy-850 to-transparent transition-opacity duration-300 ${
                    orderFadeTop ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-navy-850 to-transparent transition-opacity duration-300 ${
                    orderFadeBottom ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
                {/* Same overlay scrollbar as the page/cart — mounted only while the
                    list overflows; -right-3 tucks it into the section's padding */}
                {orderOverflows && (
                  <OverlayScrollbar
                    scroller={orderListEl}
                    className="absolute -right-3 bottom-0 top-0 w-2"
                  />
                )}
              </div>
              <div className="mt-5 flex shrink-0 items-center justify-between border-t border-navy-700/60 pt-4">
                <span className="text-sm text-slate-400">Total</span>
                <span className="font-display text-xl font-bold text-cyan-400">{format(orderTotal)}</span>
              </div>
            </section>
          </Reveal>

          <Reveal delay={250}>
            <div ref={setActionEl}>
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Timer className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                Average response time: within an hour of the order placement.
              </p>
            {stage === 'done' ? (
              <div className="mt-4 rounded-[5px] border border-cyan-600/40 bg-navy-850 p-6 text-center shadow-2xl">
                <CheckCircle2 className="mx-auto h-10 w-10 text-cyan-400" />
                <p className="mt-3 font-display text-lg font-bold text-white">Thank you for your order.</p>
                <p className="mt-1 text-sm text-slate-400">
                  {contactVia === 'chat'
                    ? 'Your order details were sent to the live chat — a manager will be with you shortly.'
                    : 'Grand Dice will reach out to you on Discord soon.'}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  Returning to the home page in {countdown}s…
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={locked}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 py-3.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110 hover:glow disabled:cursor-wait disabled:opacity-80"
              >
                {stage === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>Place Order · {format(orderTotal)}</>
                )}
              </button>
            )}
            </div>
          </Reveal>
        </div>
      </form>
    </div>
  );
}
