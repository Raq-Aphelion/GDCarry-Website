import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, ChevronDown, Clock, Minus, Plus, Settings2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import type { Service } from '@/data/games';

const DATA_CENTERS = [
  'Aether',
  'Primal',
  'Crystal',
  'Dynamis',
  'Chaos',
  'Light',
  'Elemental',
  'Gaia',
  'Mana',
  'Materia',
];

// Gear/log/add-on options, discounts and multipliers come from the pricing
// database (public/db/pricing.json) via usePricing().

interface SelectOption {
  label: string;
  hint?: string;
}

/** Custom dropdown: the panel unfolds seamlessly from the field and always
 *  paints above the floating price block. */
function CustomSelect({
  value,
  placeholder,
  options,
  onSelect,
  ariaLabel,
  invalid = false,
}: {
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (index: number) => void;
  ariaLabel: string;
  /** Red border while a validation bubble is showing */
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${open ? 'z-30' : ''}`}>
      {open && (
        <button aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`relative z-20 flex h-10 w-full items-center justify-between gap-2 rounded-[5px] border bg-navy-850 px-3.5 text-sm transition-colors ${
          open
            ? 'rounded-b-none border-navy-600'
            : invalid
              ? 'border-red-500/60'
              : 'border-navy-700/70 hover:border-navy-600'
        } ${value ? 'text-slate-300' : 'text-slate-500'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute left-0 right-0 top-full z-30 grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-h-60 overflow-y-auto rounded-b-[5px] border border-t-0 border-navy-600 bg-navy-850 shadow-2xl">
            {options.map((o, i) => {
              const selected = value === o.label;
              return (
                <button
                  key={o.label}
                  onClick={() => {
                    onSelect(i);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors ${
                    selected
                      ? 'bg-navy-800 font-semibold text-cyan-400'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.hint ? (
                    <span className="shrink-0 text-xs font-bold text-cyan-400">{o.hint}</span>
                  ) : selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db, priceOf } = usePricing();
  const cfg = db.purchaseBox;
  const GEAR_OPTIONS = cfg.gearOptions;
  const LOG_OPTIONS = cfg.logOptions;
  const ADDONS = cfg.addons;

  const basePrice = priceOf(service.id, service.price);
  const methods = useMemo(
    () => [
      { id: 'piloted', label: 'Piloted', price: basePrice },
      { id: 'afk', label: 'AFK Carry', price: Math.max(basePrice - cfg.afkDiscount, 0) },
    ],
    [basePrice, cfg.afkDiscount],
  );

  const [method, setMethod] = useState(methods[0].id);
  const [runs, setRuns] = useState(cfg.runsMin);
  const [dc, setDc] = useState('');
  const [gearIdx, setGearIdx] = useState(0);
  const [logIdx, setLogIdx] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // Set when "Add to cart" is clicked without a data center; cleared on select
  const [dcError, setDcError] = useState(false);

  // Box stickiness (desktop): 'fit' pins the whole box by its top like the
  // categories panel; 'overflow' pins it by its bottom edge 80px above the
  // screen bottom once fully extended. Set by the measuring effect below.
  const stickRef = useRef<'fit' | 'overflow' | null>(null);

  // Floating price block: while its natural spot sits fully inside the
  // viewport (below the navbar, above the screen edge) it stays in flow.
  // Otherwise it detaches: pinned to the top like the category sidebar when
  // scrolled past (dropping to the screen bottom only if it would overflow),
  // pinned to the screen bottom when its spot is still below the fold, and
  // always clamped so it stops before the "request a custom order" segment.
  // When the whole box is sticky, only the below-fold float stays active —
  // the sticky box handles everything else, including the CTA hand-off.
  const wrapRef = useRef<HTMLDivElement>(null);
  const blockH = useRef(0);
  const [fixedStyle, setFixedStyle] = useState<CSSProperties | null>(null);

  const update = useCallback(() => {
    const w = wrapRef.current;
    if (!w) return;
    const r = w.getBoundingClientRect();
    const child = w.firstElementChild as HTMLElement | null;
    const h = (child ? child.getBoundingClientRect().height : r.height) || blockH.current;
    if (h > 0) blockH.current = h;
    const vh = window.innerHeight;
    if (stickRef.current && window.innerWidth >= 1024) {
      // Sticky box: keep the price block reachable before the box pins, then
      // let it ride with the box (never detach near the CTA).
      if (r.bottom > vh + 1) {
        setFixedStyle({ position: 'fixed', top: vh - h, left: r.left, width: r.width, zIndex: 20 });
      } else {
        setFixedStyle(null);
      }
      return;
    }
    if (r.top >= 96 && r.bottom <= vh + 1) {
      setFixedStyle(null);
      return;
    }
    let top: number;
    if (r.top < 96) top = Math.min(96, vh - h); // scrolled past: pin like categories, sink only if overflowing
    else top = vh - h; // below the fold: touch the bottom of the screen
    const aside = w.closest('aside');
    if (aside) {
      const cb = aside.getBoundingClientRect().bottom;
      if (top + h > cb) top = cb - h; // stop before the custom-order CTA
    }
    setFixedStyle({ position: 'fixed', top, left: r.left, width: r.width, zIndex: 20 });
  }, []);

  useEffect(() => {
    update();
    const scroller = document.getElementById('page-scroll');
    scroller?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  // Track the Additional Options expand/collapse animation frame by frame so
  // the floating block never gets pushed off-screen, even for a split second.
  // The ResizeObserver runs before paint, so the block is re-pinned before
  // any transitional frame can be shown; the rAF loop is a backstop.
  useEffect(() => {
    const col = wrapRef.current?.parentElement;
    if (!col || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => update());
    ro.observe(col);
    return () => ro.disconnect();
  }, [update]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      update();
      if (now - start < 550) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [optionsOpen, update]);

  // Whole-box stickiness, re-measured on every content/viewport resize:
  // - fits the screen -> 'fit': top pinned at 96px like the categories panel
  // - overflowing   -> 'overflow': sticky with top = vh - gap - contentH, so
  //   the box scrolls normally until the moment it is fully extended, then
  //   pins with its bottom edge `gap` px above the bottom of the screen —
  //   where `gap` mirrors the vertical rhythm between the sidebar's "Need
  //   something else?" block and the "Can't find your boost?" CTA below.
  const rootRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState<'fit' | 'overflow' | null>(null);
  const [overflowTop, setOverflowTop] = useState(0);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      // Measure the content (card + price block), not the root box — when not
      // sticky the root is flex-stretched to the full row height.
      const kids = el.children;
      if (kids.length === 0) return;
      const contentH =
        kids[kids.length - 1].getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (contentH <= vh - 96 - 16) {
        stickRef.current = 'fit';
        setStick('fit');
      } else {
        stickRef.current = 'overflow';
        setStick('overflow');
        // Bottom clearance = the gap between the bottom of the sidebar's
        // "Need something else?" block and the top of the "Can't find your
        // boost?" CTA. The sidebar releases exactly at the aside's bottom
        // edge, and both the aside and the CTA are in normal flow — so the
        // rect difference is a scroll-invariant layout constant (~65px).
        let gap = 80;
        const aside = document.getElementById('category-sidebar');
        const cta = document.getElementById('custom-order-section');
        if (aside && cta) {
          const g = cta.getBoundingClientRect().top - aside.getBoundingClientRect().bottom;
          if (g > 0) gap = Math.round(g);
        }
        // CSS sticky top is measured from the scroller's top edge, which sits
        // 64px below the viewport top (navbar height) — hence the extra -64.
        setOverflowTop(Math.round(vh - gap - contentH - 64));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Accordions in the main column move the CTA and thus change the gap.
    const main = el.closest('main') ?? document.querySelector('main');
    if (main) ro.observe(main);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const activeMethod = methods.find((m) => m.id === method) ?? methods[0];
  const priority = addons.includes('priority');
  const flatAddons = ADDONS.filter((a) => a.id !== 'priority' && addons.includes(a.id)).reduce(
    (s, a) => s + a.price,
    0,
  );
  const base = activeMethod.price * runs + GEAR_OPTIONS[gearIdx].price + LOG_OPTIONS[logIdx].price + flatAddons;
  const total = priority ? base * cfg.priorityMultiplier : base;

  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    const cfgKey = `${method}|${runs}|${dc}|g${gearIdx}|l${logIdx}|${[...addons].sort().join('+')}`;
    const priorityPct = Math.round((cfg.priorityMultiplier - 1) * 100);
    const details = [
      `Data Center: ${dc}`,
      ...(GEAR_OPTIONS[gearIdx].price > 0 ? [GEAR_OPTIONS[gearIdx].label] : []),
      ...(LOG_OPTIONS[logIdx].price > 0 ? [LOG_OPTIONS[logIdx].label] : []),
      ...ADDONS.filter((a) => addons.includes(a.id)).map((a) =>
        a.id === 'priority' ? `${a.label} (+${priorityPct}%)` : a.label,
      ),
    ];
    addItem(
      {
        ...service,
        id: `${service.id}::${cfgKey}`,
        name: `${service.name} · ${activeMethod.label}${runs > 1 ? ` ×${runs}` : ''}`,
        price: total,
      },
      gameShort,
      details,
    );
    openCart();
  };

  return (
    <div
      ref={rootRef}
      className={
        stick === 'fit' ? 'lg:sticky lg:top-8' : stick === 'overflow' ? 'lg:sticky' : 'lg:flex-1'
      }
      style={stick === 'overflow' ? { top: overflowTop } : undefined}
    >
      <div className="purchase-box relative overflow-visible rounded-[5px] bg-navy-850">
        {/* Service image behind the top of the box: fully clear at the center of
            the Boost Method title (~77% of the strip), fading to solid navy at the
            center of the method buttons (bottom edge) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] overflow-hidden rounded-t-[5px]" aria-hidden>
          <FadeImage src={service.image} alt="" className="h-full w-full" imgClassName="object-[50%_10%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[65%] to-navy-850" />
        </div>
        {/* Spacer preserving the original image height in the layout flow */}
        <div className="h-28" />

        <div className="relative space-y-4 p-4">
          {/* Boost method */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`rounded-[5px] border px-3 py-2 text-center transition-all duration-300 ${
                    method === m.id
                      ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      method === m.id ? 'text-cyan-400' : 'opacity-70'
                    }`}
                  >
                    {m.label}
                  </span>
                  <span className="mt-0.5 block font-display text-sm font-bold">{format(m.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Runs */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">How many runs?</p>
            <input
              type="number"
              min={cfg.runsMin}
              max={cfg.runsMax}
              value={runs}
              onChange={(e) =>
                setRuns(Math.min(cfg.runsMax, Math.max(cfg.runsMin, Number(e.target.value) || cfg.runsMin)))
              }
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-sm text-white outline-none transition-colors hover:border-navy-600 focus:border-navy-600"
              aria-label="Number of runs"
            />
            <div className="px-1 pb-2 pt-4">
              <Slider value={[runs]} onValueChange={([v]) => setRuns(v)} min={cfg.runsMin} max={cfg.runsMax} step={1} />
            </div>
          </div>

          {/* Data center */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Data Center <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={dcError ? 'Select a data center first.' : ''} />
              <CustomSelect
                value={dc}
                placeholder="Select Data Center"
                options={DATA_CENTERS.map((d) => ({ label: d }))}
                onSelect={(i) => {
                  setDc(DATA_CENTERS[i]);
                  setDcError(false);
                }}
                ariaLabel="Select data center"
                invalid={dcError}
              />
            </div>
          </div>

          {/* Additional options */}
          <div className="rounded-[5px] border border-navy-700/50">
            <button
              onClick={() => setOptionsOpen((o) => !o)}
              aria-expanded={optionsOpen}
              className="flex h-10 w-full items-center justify-between pl-4 pr-3.5 text-left"
            >
              <span className="flex items-center gap-2 pl-px text-sm font-normal text-slate-300">
                <Settings2 className="h-4 w-4 text-slate-400" />
                Additional Options
              </span>
              {optionsOpen ? (
                <Minus className="h-4 w-4 text-slate-500" />
              ) : (
                <Plus className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <div
              className={`grid transition-all duration-500 ease-soft ${
                optionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 px-4 pb-3 pt-1">
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Gear Options</p>
                    <CustomSelect
                      value={GEAR_OPTIONS[gearIdx].label}
                      options={GEAR_OPTIONS.map((g) => ({
                        label: g.label,
                        hint: g.price > 0 ? `+${format(g.price)}` : undefined,
                      }))}
                      onSelect={setGearIdx}
                      ariaLabel="Gear options"
                    />
                  </div>
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">FFXIV Logs</p>
                    <CustomSelect
                      value={LOG_OPTIONS[logIdx].label}
                      options={LOG_OPTIONS.map((l) => ({
                        label: l.label,
                        hint: l.price > 0 ? `+${format(l.price)}` : undefined,
                      }))}
                      onSelect={setLogIdx}
                      ariaLabel="FFXIV Logs options"
                    />
                  </div>
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
                    <div className="space-y-1.5">
                      {ADDONS.map((a) => {
                        const checked = addons.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() => toggleAddon(a.id)}
                            aria-pressed={checked}
                            className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                          >
                            <span
                              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                                checked
                                  ? 'border-cyan-500 bg-cyan-600 text-navy-900'
                                  : 'border-navy-600 text-transparent'
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={3.5} />
                            </span>
                            <span className="flex-1 text-sm text-slate-300">{a.label}</span>
                            <span className="text-xs font-bold text-cyan-400">
                              {a.id === 'priority'
                                ? `+${Math.round((cfg.priorityMultiplier - 1) * 100)}%`
                                : `+${format(a.price)}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total + checkout — floats above content, touching the bottom of the screen */}
      <div ref={wrapRef} className="mt-4" style={fixedStyle ? { height: blockH.current } : undefined}>
        <div
          style={fixedStyle ?? undefined}
          className={`purchase-price-block rounded-[5px] border border-navy-700/70 bg-navy-800 p-4 text-center shadow-2xl ${
            fixedStyle ? 'price-block-glow' : ''
          }`}
        >
          <p className="font-display text-2xl font-extrabold text-white">{format(total)}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-500" />
            Average Completion Time: 24 Hours
          </p>
          <button
            onClick={addToCart}
            className="purchase-cta mt-3.5 w-full rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 py-2.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110"
          >
            Add to cart
          </button>
          <div className="mt-3 flex items-center justify-center gap-3 opacity-80">
            {['paypal', 'visa', 'mastercard', 'applepay', 'googlepay'].map((p) => (
              <img key={p} src={`/payment/${p}.svg`} alt={p} className="h-3.5 w-auto" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
