import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { CheckCircle2, Circle, Loader2, Mail, MessageCircle, Timer } from 'lucide-react';
import Reveal from '@/components/Reveal';
import FadeImage from '@/components/FadeImage';
import FieldPopup from '@/components/FieldPopup';
import { OverlayScrollbar } from '@/components/Scrollbar';
import { useCart, type CartItem } from '@/context/CartContext';
import { lineTotal } from '@/lib/cart';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { serviceLink } from '@/data/games';
import ffxivBg from '@/assets/images/backgrounds/ffxiv-bg.png';

/** Simulated processing time — the spinner runs until the "order" completes. */
const PROCESSING_MS = 1200;
const RETURN_COUNTDOWN_S = 10;
/** Right column's order box matches the left column's height only side-by-side. */
const TWO_COL_QUERY = '(min-width: 1024px)';

type Stage = 'idle' | 'processing' | 'done';

/** Checkout: contact details + payment (left), order summary + purchase (right).
    The cart is only cleared once the purchase finishes processing, so leaving
    the page beforehand keeps the cart intact. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailErrorFor = (v: string) =>
  v.trim() === ''
    ? 'E-mail is required.'
    : !EMAIL_RE.test(v.trim())
      ? 'Please enter a valid e-mail address.'
      : '';

const discordErrorFor = (v: string) =>
  v.trim().length === 1 ? 'Discord usernames are at least 2 characters — or leave this field empty.' : '';

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { format } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [discord, setDiscord] = useState('');
  // Discord's bubble shows only while the field is focused; the red border stays
  const [discordFocused, setDiscordFocused] = useState(false);
  // "Can't find it?" hint: toggled by click (mobile), hover still works (desktop)
  const [hintOpen, setHintOpen] = useState(false);
  const hintRef = useRef<HTMLSpanElement>(null);
  // Scroll target for failed submits on mobile (contact block sits above the button)
  const contactRef = useRef<HTMLElement>(null);
  // Field errors surface on the first Place Order click, not while typing
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // Single payment option for now — selectable but can never be unselected
  const [method, setMethod] = useState('paypal');
  const [stage, setStage] = useState<Stage>('idle');
  // Snapshot of the purchased items — the cart itself is cleared on completion
  const [purchased, setPurchased] = useState<CartItem[]>([]);
  const [countdown, setCountdown] = useState(RETURN_COUNTDOWN_S);

  // Left column height drives the order box's max height (lg side-by-side only)
  const [leftColEl, setLeftColEl] = useState<HTMLDivElement | null>(null);
  const [orderMaxH, setOrderMaxH] = useState<number | undefined>(undefined);
  // Order list scroller + overflow state (drives the overlay scrollbar inset)
  const [orderListEl, setOrderListEl] = useState<HTMLUListElement | null>(null);
  const [orderOverflows, setOrderOverflows] = useState(false);

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
    const update = () =>
      setOrderMaxH(window.matchMedia(TWO_COL_QUERY).matches ? leftColEl.offsetHeight : undefined);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(leftColEl);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [leftColEl]);

  useEffect(() => {
    if (!orderListEl) return;
    const check = () => setOrderOverflows(orderListEl.scrollHeight > orderListEl.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(orderListEl);
    Array.from(orderListEl.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [orderListEl]);

  if (items.length === 0 && stage === 'idle') return <Navigate to="/" replace />;

  const orderItems = stage === 'idle' ? items : purchased;
  const orderTotal = orderItems.reduce((sum, i) => sum + lineTotal(i), 0);
  const locked = stage !== 'idle';
  // Errors surface on the first Place Order click (like native validation),
  // then re-validate live as the fields are edited
  const emailError = submitAttempted ? emailErrorFor(email) : '';
  const discordError = submitAttempted ? discordErrorFor(discord) : '';

  const purchase = (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    // Same lockout as native validation: any field error blocks the order
    if (emailErrorFor(email) || discordErrorFor(discord)) {
      if (!window.matchMedia(TWO_COL_QUERY).matches) {
        contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    setPurchased(items);
    setStage('processing');
    window.setTimeout(() => {
      clear();
      setStage('done');
      toast({
        title: 'Order placed',
        description: 'Demo checkout complete — a Grand Dice booster would reach out within minutes.',
        variant: 'blue',
      });
    }, PROCESSING_MS);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-[25px] py-12 sm:px-6 lg:px-8">
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
        <div ref={setLeftColEl} className="space-y-8">
          <Reveal delay={100}>
            <section ref={contactRef} className="purchase-box-glow rounded-[5px] bg-navy-800 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Contact details</h2>
              <p className="mt-1 text-sm text-slate-400">
                Please enter your details to allow us to contact you and complete your order.
              </p>
              <fieldset disabled={locked} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    E-mail <span className="font-medium normal-case tracking-normal text-slate-600">(required)</span>
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <FieldPopup message={emailError} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`h-[42px] w-full rounded-[3px] border bg-navy-900/80 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors disabled:opacity-60 ${
                        emailError
                          ? 'border-red-500/60'
                          : 'border-navy-700/70 hover:border-navy-600 focus:border-navy-600'
                      }`}
                    />
                  </div>
                </label>
                {/* Not a wrapping <label>: the hint button must stay the only
                    thing that toggles the popup (a label would activate the
                    first labelable element — the button — from anywhere in the row) */}
                <div className="block">
                  <span className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="checkout-discord" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Discord{' '}
                      {/* Own line on mobile, leaving the row free for "Can't find it?" */}
                      <span className="block font-medium normal-case tracking-normal text-slate-600 sm:inline">(optional — faster contact)</span>
                    </label>
                    {/* Hint popup: hover on desktop, click-toggle on touch —
                        closes on second click or any click outside */}
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
                  </span>
                  <div className="relative">
                    <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <FieldPopup message={discordFocused ? discordError : ''} />
                    <input
                      id="checkout-discord"
                      type="text"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      onFocus={() => setDiscordFocused(true)}
                      onBlur={() => setDiscordFocused(false)}
                      placeholder="username"
                      className={`h-[42px] w-full rounded-[3px] border bg-navy-900/80 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors disabled:opacity-60 ${
                        discordError
                          ? 'border-red-500/60'
                          : 'border-navy-700/70 hover:border-navy-600 focus:border-navy-600'
                      }`}
                    />
                  </div>
                </div>
              </fieldset>
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section className="purchase-box-glow rounded-[5px] bg-navy-800 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Payment method</h2>
              {/* Single option for now — clicking re-selects it, it can never be unselected */}
              <button
                type="button"
                onClick={() => setMethod('paypal')}
                disabled={locked}
                aria-pressed={method === 'paypal'}
                className="group mt-4 flex w-full cursor-pointer items-center gap-3 rounded-[5px] border border-cyan-600/40 bg-navy-900/80 px-4 py-3 text-left transition-colors hover:border-cyan-500/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-cyan-600/40"
              >
                <img src="/payment/paypal.svg" alt="PayPal" className="h-5 w-auto" />
                <span className="text-sm font-semibold text-white">PayPal</span>
                {/* Held down: the checkmark fades into a greyed-out empty circle,
                    and back to selected on release */}
                <span className="relative ml-auto h-5 w-5 shrink-0">
                  <CheckCircle2 className="absolute inset-0 h-5 w-5 text-cyan-400 transition-opacity duration-200 group-active:opacity-0" aria-label="Selected" />
                  <Circle className="absolute inset-0 h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-active:opacity-100" aria-hidden />
                </span>
              </button>
            </section>
          </Reveal>
        </div>

        {/* ============ RIGHT: ORDER + PURCHASE ============ */}
        <div className="space-y-8">
          <Reveal delay={150}>
            {/* Bottom edge aligns with the left column on lg; the item list
                scrolls inside (overlay scrollbar) when it overflows */}
            <section
              style={{ maxHeight: orderMaxH }}
              className="flex flex-col rounded-[5px] bg-navy-850 p-5 shadow-2xl sm:p-6"
            >
              <h2 className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-white">
                Your order
                {/* Same count pill as the cart sidebar */}
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {orderItems.reduce((s, i) => s + i.qty, 0)} item{orderItems.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}
                </span>
              </h2>
              <div className="relative mt-4 flex min-h-0 flex-1 flex-col">
                {/* pr-3 (only while overflowing) keeps item prices clear of the scrollbar pill */}
                <ul
                  ref={setOrderListEl}
                  className={`no-scrollbar min-h-0 flex-1 divide-y divide-navy-700/50 overflow-y-auto ${orderOverflows ? 'pr-3' : ''}`}
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
                {/* Same overlay scrollbar as the page/cart — mounted only while the
                    list overflows; -right-3 tucks it into the section's padding */}
                {orderOverflows && (
                  <OverlayScrollbar
                    scroller={orderListEl}
                    className="absolute -right-3 bottom-0 top-0 w-2"
                  />
                )}
              </div>
              <div className="mt-4 flex shrink-0 items-center justify-between border-t border-navy-700/60 pt-4">
                <span className="text-sm text-slate-400">Total</span>
                <span className="font-display text-xl font-bold text-cyan-400">{format(orderTotal)}</span>
              </div>
            </section>
          </Reveal>

          <Reveal delay={250}>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Timer className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
              Average response time: within an hour of the order placement.
            </p>
            {stage === 'done' ? (
              <div className="mt-4 rounded-[5px] border border-cyan-600/40 bg-navy-850 p-6 text-center shadow-2xl">
                <CheckCircle2 className="mx-auto h-10 w-10 text-cyan-400" />
                <p className="mt-3 font-display text-lg font-bold text-white">Thank you for your order.</p>
                <p className="mt-1 text-sm text-slate-400">Grand Dice will reach out to you soon.</p>
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
          </Reveal>
        </div>
      </form>
    </div>
  );
}
