import { useEffect, useMemo, useRef, useState } from 'react';
import { Armchair, Check, ChevronDown, Clock, Gamepad2, Minus, Plus, Settings2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { Slider } from '@/components/ui/slider';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
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
  'Meteor',
  'Materia',
];

// Gear/log/add-on options, discounts and multipliers come from the pricing
// database (public/db/pricing.json) via usePricing().

/** Per-service "Included:" note shown under the Boost Method buttons —
    switches with the active method. Raid names render highlighted. */
const INCLUDED: Record<string, { piloted: string[]; afk: string[] }> = {
  'ffxiv-ultimate-bundle': {
    piloted: ['UWU', 'UCOB', 'TEA', 'DSR', 'TOP', 'FRU'],
    afk: ['UWU', 'UCOB', 'TEA', 'DSR'],
  },
};

interface SelectOption {
  label: string;
  hint?: string;
}

/** Custom dropdown: the panel unfolds seamlessly from the field and always
 *  paints above the floating price block. Shared with GilPurchaseBox. */
export function CustomSelect({
  value,
  placeholder,
  options,
  onSelect,
  ariaLabel,
  invalid = false,
  disabled = false,
}: {
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (index: number) => void;
  ariaLabel: string;
  /** Red border while a validation bubble is showing */
  invalid?: boolean;
  /** Greyed out and non-interactive (e.g. waiting on a parent selection) */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${open ? 'z-30' : ''}`}>
      {open && (
        <button aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
      )}
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`relative z-20 flex h-10 w-full items-center justify-between gap-2 rounded-[5px] border bg-navy-850 px-3.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? 'rounded-b-none border-navy-600'
            : invalid
              ? 'border-red-500/60'
              : 'border-navy-700/70 hover:border-navy-600 disabled:hover:border-navy-700/70'
        } ${value ? 'text-slate-300' : 'text-slate-500'}`}
      >
        <span className="min-w-0 flex-1 truncate">{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-slate-500' : 'text-cyan-400'}`}
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
                  <span className="min-w-0 truncate">{o.label}</span>
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
  // The duty-unlock addon comes from the ffxiv-UltimateRaids category file;
  // stream/priority stay in the base purchaseBox config
  const ADDONS = [...(db.unlockAddon ? [db.unlockAddon] : []), ...cfg.addons];

  const basePrice = priceOf(service.id, service.price);
  // Services with explicit per-method prices in the DB (e.g. ultimates) bypass
  // the afkDiscount model; a missing `afk` means the service is piloted-only.
  const methodPrices = db.methodPrices?.[service.id];
  const methods = useMemo(() => {
    const list = [
      { id: 'piloted', label: 'Piloted', price: methodPrices?.piloted ?? basePrice, icon: Armchair },
    ];
    const afkPrice = methodPrices ? methodPrices.afk : Math.max(basePrice - cfg.afkDiscount, 0);
    if (afkPrice != null)
      list.push({ id: 'afk', label: methodPrices?.afkLabel ?? 'AFK Carry', price: afkPrice, icon: Gamepad2 });
    if (methodPrices?.groupFirst) list.reverse();
    return list;
  }, [basePrice, cfg.afkDiscount, methodPrices]);

  const [method, setMethod] = useState(methods[0].id);
  const [runs, setRuns] = useState(cfg.runsMin);
  const [dc, setDc] = useState('');
  const [gearIdx, setGearIdx] = useState(0);
  const [logIdx, setLogIdx] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // True only after the expand animation finished — the wrapper clips
  // (overflow-hidden) during the animation, then releases so dropdowns
  // (gear/logs) can overlay the blocks below instead of being clipped.
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  useEffect(() => {
    if (!optionsOpen) return;
    const t = setTimeout(() => setOptionsExpanded(true), 500);
    return () => clearTimeout(t);
  }, [optionsOpen]);
  // Set when "Add to cart" is clicked without a data center; cleared on select
  const [dcError, setDcError] = useState(false);

  // Sticky box + floating price block (shared with GilPurchaseBox)
  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${optionsOpen}`,
  );

  const activeMethod = methods.find((m) => m.id === method) ?? methods[0];
  // AFK Carry has no FFXIV Logs option and no Private Stream add-on — both
  // are excluded from the UI and from every calculation
  const isAfk = method === 'afk';
  // Services with per-method addon lists in the DB (bundles) swap the global
  // 'unlock' addon for their own list — stream/priority stay untouched.
  const bundleAddons = db.serviceAddons?.[service.id]?.[isAfk ? 'afk' : 'piloted'];
  const ADDON_LIST = bundleAddons
    ? ADDONS.flatMap((a) => (a.id === 'unlock' ? bundleAddons : [a]))
    : ADDONS;
  const effLogIdx = isAfk ? 0 : logIdx;
  const effectiveAddons = isAfk ? addons.filter((a) => a !== 'stream') : addons;
  // Per-service addon price overrides from the DB (e.g. DSR duty unlock)
  const addonPriceOf = (a: (typeof ADDONS)[number]) => db.addonPrices?.[service.id]?.[a.id] ?? a.price;
  const priority = effectiveAddons.includes('priority');
  const logsPercent = LOG_OPTIONS[effLogIdx].percent ?? 0;
  const flatAddons = ADDON_LIST.filter((a) => a.id !== 'priority' && effectiveAddons.includes(a.id)).reduce(
    (s, a) => s + addonPriceOf(a),
    0,
  );
  // Priority and the parse tier multiply only (method price × runs);
  // gear, flat log fees and add-ons are added afterwards, unaffected.
  const runsPart = activeMethod.price * runs * (priority ? cfg.priorityMultiplier : 1);
  const total =
    runsPart * (1 + logsPercent / 100) + GEAR_OPTIONS[gearIdx].price + LOG_OPTIONS[effLogIdx].price + flatAddons;

  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  // The 'unlock' add-on is a duty unlock — shown with the service-specific
  // duty name where one applies
  const UNLOCK_LABELS: Record<string, string> = {
    'ffxiv-dsr': 'P4S completion',
    'ffxiv-uwu': 'O8S completion',
    'ffxiv-ucob': 'O4S completion',
    'ffxiv-tea': 'E4S completion',
    'ffxiv-top': 'P8S completion',
    'ffxiv-fru': 'M4S completion',
    'ffxiv-dmu': 'M12S completion',
  };
  const addonLabel = (a: (typeof ADDON_LIST)[number]) =>
    a.id === 'unlock' && UNLOCK_LABELS[service.id] ? UNLOCK_LABELS[service.id] : a.label;

  // Scroll target when "Add to cart" is clicked without a data center (mobile:
  // the select sits far above the floating button)
  const dcRef = useRef<HTMLDivElement>(null);

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      if (window.matchMedia('(max-width: 1023px)').matches) {
        dcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    // Runs are excluded from the key/name — identical configs merge into one
    // cart line whose amount controls adjust the run count
    const cfgKey = `${method}|${dc}|g${gearIdx}|l${effLogIdx}|${[...effectiveAddons].sort().join('+')}`;
    const priorityPct = Math.round((cfg.priorityMultiplier - 1) * 100);
    const details = [
      `Data Center: ${dc}`,
      ...(GEAR_OPTIONS[gearIdx].price > 0 ? [GEAR_OPTIONS[gearIdx].label] : []),
      ...(LOG_OPTIONS[effLogIdx].price > 0 || logsPercent > 0 ? [LOG_OPTIONS[effLogIdx].label] : []),
      ...ADDON_LIST.filter((a) => effectiveAddons.includes(a.id)).map((a) =>
        a.id === 'priority' ? `${addonLabel(a)} (+${priorityPct}%)` : addonLabel(a),
      ),
    ];
    addItem(
      {
        ...service,
        id: `${service.id}::${cfgKey}`,
        price: activeMethod.price, // per run
        flat: GEAR_OPTIONS[gearIdx].price + LOG_OPTIONS[effLogIdx].price + flatAddons,
        multiplier: priority ? cfg.priorityMultiplier : undefined,
        logsPercent: logsPercent > 0 ? logsPercent : undefined,
        method: activeMethod.label,
      },
      gameShort,
      details,
      runs,
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
                  className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-all duration-300 ${
                    method === m.id
                      ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  <m.icon
                    className={`h-4 w-4 shrink-0 ${method === m.id ? 'text-cyan-400' : 'opacity-70'}`}
                  />
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      method === m.id ? 'text-cyan-400' : 'opacity-70'
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            {INCLUDED[service.id] && (
              <p className="mt-3.5 pl-px text-xs leading-relaxed text-slate-400">
                Included:{' '}
                {INCLUDED[service.id][isAfk ? 'afk' : 'piloted'].map((raid, i, arr) => (
                  <span key={raid}>
                    <span className="font-bold text-cyan-400">{raid}</span>
                    {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ''}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Runs: the field allows up to 999; the slider's max follows the
              field value but never drops below the configured default */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">Amount of Runs</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={runs}
              onChange={(e) =>
                setRuns(Math.min(999, Math.max(cfg.runsMin, Number(e.target.value.replace(/\D/g, '')) || cfg.runsMin)))
              }
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 py-2 text-center text-sm leading-none text-white outline-none transition-colors hover:border-navy-600 focus:border-navy-600"
              aria-label="Number of runs"
            />
            <div className="px-1 pb-2 pt-4">
              <Slider value={[runs]} onValueChange={([v]) => setRuns(v)} min={cfg.runsMin} max={Math.max(cfg.runsMax, runs)} step={1} />
            </div>
          </div>

          {/* Data center */}
          <div ref={dcRef}>
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
          <div className={`aob rounded-[5px] border border-navy-700/70 bg-navy-850 ${optionsOpen ? 'expanded' : ''}`}>
            <button
              onClick={() => {
                setOptionsOpen((o) => !o);
                setOptionsExpanded(false);
              }}
              aria-expanded={optionsOpen}
              className="aob-toggle flex h-[38px] w-full items-center justify-between pl-4 pr-3.5 text-left"
            >
              <span className="flex items-center gap-2 pl-px text-sm font-normal text-slate-300">
                <Settings2 className="h-4 w-4 text-slate-400" />
                Additional Options
              </span>
              {optionsOpen ? (
                <Minus className="h-4 w-4 text-slate-500" />
              ) : (
                <Plus className="h-4 w-4 text-cyan-400" />
              )}
            </button>
            <div
              className={`grid transition-all duration-500 ease-soft ${
                optionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              {/* min-w-0 on the grid item prevents a long selected label from
                  blowing the track (and the field) out past the block padding */}
              <div className={`min-w-0 ${optionsExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
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
                  {!isAfk && (
                    <div>
                      <p className="mb-2 pl-px text-xs font-semibold text-slate-300">FFXIV Logs</p>
                      <CustomSelect
                        value={LOG_OPTIONS[logIdx].label}
                        options={LOG_OPTIONS.map((l) => ({
                          label: l.label,
                          hint: l.price > 0 ? `+${format(l.price)}` : l.percent ? `+${l.percent}%` : undefined,
                        }))}
                        onSelect={setLogIdx}
                        ariaLabel="FFXIV Logs options"
                      />
                    </div>
                  )}
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
                    <div className="space-y-1.5">
                      {ADDON_LIST.filter((a) => !(isAfk && a.id === 'stream')).map((a) => {
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
                                  ? 'border-cyan-600 bg-cyan-600 text-navy-900'
                                  : 'border-navy-600 text-transparent'
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={3.5} />
                            </span>
                            <span className="flex-1 text-sm text-slate-300">{addonLabel(a)}</span>
                            <span className="text-xs font-bold text-cyan-400">
                              {a.id === 'priority'
                                ? `+${Math.round((cfg.priorityMultiplier - 1) * 100)}%`
                                : `+${format(addonPriceOf(a))}`}
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
      <div ref={wrapRef} className="mt-4" style={fixedStyle ? { height: blockHpx } : undefined}>
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
            {['paypal', 'revolut', 'crypto'].map((p) => (
              <img key={p} src={`/payment/${p}.svg`} alt={p} className="h-3.5 w-auto" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
