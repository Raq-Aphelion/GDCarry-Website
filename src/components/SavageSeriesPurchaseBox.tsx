import { useEffect, useState } from 'react';
import { Armchair, Check, Clock, Gamepad2, Layers, Minus, Plus, Settings2, Swords } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import type { Service } from '@/data/games';
import type { PricingAddon } from '@/data/pricing';

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

type MethodId = 'piloted' | 'afk';
type BoostOption = 'tier' | 'fights';

const METHODS: { id: MethodId; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'piloted', label: 'Piloted', icon: Armchair },
  { id: 'afk', label: 'AFK Carry', icon: Gamepad2 },
];

const BOOST_OPTIONS: { id: BoostOption; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'fights', label: 'Fights', icon: Swords },
  { id: 'tier', label: 'Tiers', icon: Layers },
];

/** Savage raid series purchase box (Pandaemonium, Arcadion, Eden, Omega,
    Alexander): boost method, tier bundles, specific fights, unlocks, FFXIV
    Logs and priority — all priced from the savageSeries entries of the
    ffxiv-SavageRaids database category. */
export default function SavageSeriesPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const LOG_OPTIONS = db.purchaseBox.logOptions;
  const GEAR_OPTIONS = db.purchaseBox.gearOptions;
  // Gear Options (shared with the ultimate raids box) — Arcadion only
  const showGear = service.id === 'ffxiv-arcadion-savage';

  const [method, setMethod] = useState<MethodId>('piloted');
  const cfg = db.savageSeries?.[service.id]?.[method];

  // Defaults: first tier bundle and first fight of THIS series, checked on load
  const [bundles, setBundles] = useState<string[]>(() => (cfg?.bundles[0] ? [cfg.bundles[0].id] : []));
  const [fights, setFights] = useState<string[]>(() => {
    const first = cfg ? Object.values(cfg.fights).flat()[0] : undefined;
    return first ? [first.id] : [];
  });
  const [boostOption, setBoostOption] = useState<BoostOption>('fights');
  // The block cross-fades sequentially: the current options fade out, the new
  // ones swap in while invisible, then fade in. `shown` is the side currently
  // rendered (and counted); `boostOption` is the selected toggle target.
  const [shown, setShown] = useState<BoostOption>('fights');
  const [fadeIn, setFadeIn] = useState(true);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [runs, setRuns] = useState(1);
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [logIdx, setLogIdx] = useState(0);
  const [gearIdx, setGearIdx] = useState(0);
  const [dc, setDc] = useState('');
  const [dcError, setDcError] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  useEffect(() => {
    if (!optionsOpen) return;
    const t = setTimeout(() => setOptionsExpanded(true), 500);
    return () => clearTimeout(t);
  }, [optionsOpen]);

  const switchBoostOption = (o: BoostOption) => {
    setBoostOption(o);
    if (o !== shown) setFadeIn(false);
  };
  useEffect(() => {
    if (fadeIn) return;
    const t = setTimeout(() => {
      setShown(boostOption);
      setFadeIn(true);
    }, 250);
    return () => clearTimeout(t);
  }, [fadeIn, boostOption]);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${optionsOpen}|${shown}|${runs}`,
  );

  const onMethod = (m: MethodId) => {
    setMethod(m);
    // Old behavior: switching methods resets choices and re-checks the first options
    const firstFight = cfg ? Object.values(cfg.fights).flat()[0] : undefined;
    setFights(firstFight ? [firstFight.id] : []);
    setUnlocks([]);
    setStream(false);
    setPriority(false);
    setLogIdx(0);
    setBundles(cfg?.bundles[0] ? [cfg.bundles[0].id] : []);
  };

  const toggleBundle = (id: string) => {
    setBundles((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };
  const toggleFight = (id: string) => {
    setFights((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  // Only the shown Boost Option (Tiers or Fights) counts toward the price —
  // the other side keeps its selections but is excluded until switched back.
  const bundlesTotal =
    shown === 'tier'
      ? bundles.reduce((s, id) => s + (cfg?.bundles.find((b) => b.id === id)?.price ?? 0), 0)
      : 0;
  const fightsTotal =
    shown === 'fights'
      ? fights.reduce(
          (s, id) => s + (cfg ? Object.values(cfg.fights).flat().find((f) => f.id === id)?.price ?? 0 : 0),
          0,
        )
      : 0;
  const unlocksTotal = unlocks.reduce((s, id) => s + (cfg?.unlocks.find((u) => u.id === id)?.price ?? 0), 0);
  const hasSelection = bundlesTotal + fightsTotal > 0;
  // Amount of Runs multiplies picked tiers and fights — with nothing picked
  // (unlock-only order) the control greys out
  const runsLocked = !hasSelection;
  const effRuns = runsLocked ? 1 : runs;
  // AFK has no FFXIV Logs option; with nothing picked in the active Boost
  // Option the dropdown is disabled and falls back to "I don't want a parse".
  const effLogIdx = method === 'afk' || !hasSelection ? 0 : logIdx;
  const logsPercent = LOG_OPTIONS[effLogIdx]?.percent ?? 0;
  const logsPrice = LOG_OPTIONS[effLogIdx]?.price ?? 0;
  // Gear Options stay enabled while a tier/fight or an unlock is picked; with
  // neither, the dropdown is disabled and falls back to "I don't need extra gear".
  const gearEnabled = hasSelection || unlocks.length > 0;
  const effGearIdx = gearEnabled ? gearIdx : 0;
  // Priority and the parse tier multiply (bundles + fights); flat log fees are
  // added afterwards, unaffected. Priority multiplies the tier unlocks only
  // when nothing is picked in the active Boost Option. Private Stream only
  // counts when something else is priced — it never enables Add to cart alone.
  const base = (bundlesTotal + fightsTotal) * effRuns * (priority ? priorityMultiplier : 1);
  const unlocksPart = hasSelection ? unlocksTotal : unlocksTotal * (priority ? priorityMultiplier : 1);
  const gearPrice = showGear ? GEAR_OPTIONS[effGearIdx]?.price ?? 0 : 0;
  const subtotal = base * (1 + logsPercent / 100) + logsPrice + unlocksPart + gearPrice;
  const total = subtotal + (subtotal > 0 && stream ? cfg?.stream ?? 0 : 0);

  const addonLabel = (a: PricingAddon) => a.label;
  const addonPrice = (a: PricingAddon) => a.price;

  const addToCart = () => {
    if (total <= 0) return;
    if (!dc) {
      setDcError(true);
      return;
    }
    const methodLabel = METHODS.find((m) => m.id === method)?.label ?? method;
    const selectedBundles =
      shown === 'tier' ? bundles.map((id) => cfg!.bundles.find((b) => b.id === id)!.label) : [];
    const selectedFights =
      shown === 'fights'
        ? fights.map((id) => Object.values(cfg!.fights).flat().find((f) => f.id === id)!.label)
        : [];
    const selectedUnlocks = unlocks.map((id) => cfg!.unlocks.find((u) => u.id === id)!.label);
    // Per-run cart model: price is the per-run selection total, qty the run
    // count (cart +/- adjusts runs, identical configs merge). flat covers the
    // one-off parts (log fees, unlocks — pre-multiplied by priority when they
    // are the whole order — gear, stream). Unlock-only orders stay one-offs.
    const streamPart = subtotal > 0 && stream ? (cfg?.stream ?? 0) : 0;
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${dc}|${shown}~${[...bundles, ...fights].sort().join(',')}|${[...unlocks].sort().join(',')}${gearPrice > 0 ? `g${effGearIdx}` : ''}${logsPercent > 0 || logsPrice > 0 ? `l${effLogIdx}` : ''}${stream ? 's' : ''}${priority ? 'p' : ''}`,
        price: bundlesTotal + fightsTotal,
        method: methodLabel,
        flat: logsPrice + unlocksPart + gearPrice + streamPart,
        multiplier: priority ? priorityMultiplier : undefined,
        logsPercent: logsPercent > 0 ? logsPercent : undefined,
        ...(hasSelection ? {} : { qtyLocked: true }),
      },
      gameShort,
      [
        `Data Center: ${dc}`,
        ...selectedBundles,
        ...selectedFights,
        ...selectedUnlocks,
        ...(stream ? ['Private Stream'] : []),
        ...(gearPrice > 0 ? [GEAR_OPTIONS[effGearIdx].label] : []),
        ...(logsPercent > 0 || logsPrice > 0 ? [LOG_OPTIONS[effLogIdx].label] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      hasSelection ? effRuns : 1,
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
        {/* Service image behind the top of the box */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] overflow-hidden rounded-t-[5px]" aria-hidden>
          <FadeImage src={service.image} alt="" className="h-full w-full" imgClassName="object-[50%_10%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[65%] to-navy-850" />
        </div>
        <div className="h-28" />

        <div className="relative space-y-4 p-4">
          {/* Boost method */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-all duration-300 ${
                    method === m.id
                      ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  <m.icon className={`h-4 w-4 shrink-0 ${method === m.id ? 'text-cyan-400' : 'opacity-70'}`} />
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
          </div>

          {/* Amount of runs — multiplies specific fights; greyed for tier
              bundles and unlock-only orders (one-offs) */}
          <div className={runsLocked ? 'pointer-events-none opacity-50' : ''}>
            <p className="pl-px text-sm font-semibold text-white">Amount of Runs</p>
            <input
              type="text"
              inputMode="numeric"
              value={String(runs)}
              aria-label="Amount of runs"
              disabled={runsLocked}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                if (!Number.isNaN(v)) setRuns(Math.min(Math.max(v, 1), db.purchaseBox.runsMax));
              }}
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-slate-300 outline-none transition-colors focus:border-navy-600"
            />
            <Slider
              className="mt-4"
              min={1}
              max={db.purchaseBox.runsMax}
              step={1}
              value={[runs]}
              onValueChange={([v]) => setRuns(v)}
              aria-label="Amount of runs slider"
            />
          </div>

          {/* Boost option */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">Encounter Options</p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {BOOST_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => switchBoostOption(o.id)}
                  aria-pressed={boostOption === o.id}
                  className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-all duration-300 ${
                    boostOption === o.id
                      ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  <o.icon className={`h-4 w-4 shrink-0 ${boostOption === o.id ? 'text-cyan-400' : 'opacity-70'}`} />
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      boostOption === o.id ? 'text-cyan-400' : 'opacity-70'
                    }`}
                  >
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Specific tiers (Tiers) / Specific fights (Fights) — switching
              fades the current options out, then the block smoothly extends /
              retracts to the new height while the new options fade in. Both
              sides share one grid cell so the incoming content stays pinned
              to the top. Both sides start animating instantly, but the
              incoming side expands faster (200ms) than the outgoing side
              collapses (500ms), so the shared cell height never dips below
              the target and overshoots. */}
          <div className="grid">
            <div
              className={`col-start-1 row-start-1 grid transition-all ease-soft ${
                shown === 'tier'
                  ? 'grid-rows-[1fr] duration-200'
                  : 'pointer-events-none grid-rows-[0fr] duration-500'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={`transition-opacity duration-200 ${shown === 'tier' && fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="pl-px text-sm font-semibold text-white">Specific Tiers</p>
                  <div className="mt-2.5 space-y-1.5">
                    {cfg?.bundles.map((a) => {
                      const checked = bundles.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleBundle(a.id)}
                          aria-pressed={checked}
                          disabled={a.disabled}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-850"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              checked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.label}</span>
                          <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`col-start-1 row-start-1 grid transition-all ease-soft ${
                shown === 'fights'
                  ? 'grid-rows-[1fr] duration-200'
                  : 'pointer-events-none grid-rows-[0fr] duration-500'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={`transition-opacity duration-200 ${shown === 'fights' && fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="pl-px text-sm font-semibold text-white">Specific Fights</p>
                  <div className="mt-2.5 space-y-1.5">
                    {Object.values(cfg?.fights ?? {})
                      .flat()
                      .map((a) => {
                        const checked = fights.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleFight(a.id)}
                            aria-pressed={checked}
                            disabled={a.disabled}
                            className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-850"
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
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.label}</span>
                            <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
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
              <div className={`min-w-0 ${optionsExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
                <div className="space-y-4 px-4 pb-3 pt-1">
                  {/* Gear Options — Arcadion only, same list as ultimate raids */}
                  {showGear && (
                    <div>
                      <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Gear Options</p>
                      <CustomSelect
                        value={GEAR_OPTIONS[effGearIdx].label}
                        options={GEAR_OPTIONS.map((g) => ({
                          label: g.label,
                          hint: g.price > 0 ? `+${format(g.price)}` : undefined,
                        }))}
                        onSelect={setGearIdx}
                        ariaLabel="Gear options"
                        disabled={!gearEnabled}
                      />
                    </div>
                  )}

                  {/* FFXIV Logs — piloted only */}
                  {method === 'piloted' && (
                    <div>
                      <p className="mb-2 pl-px text-xs font-semibold text-slate-300">FFXIV Logs</p>
                      <CustomSelect
                        value={LOG_OPTIONS[effLogIdx].label}
                        options={LOG_OPTIONS.map((l) => ({
                          label: l.label,
                          hint: l.price > 0 ? `+${format(l.price)}` : l.percent ? `+${l.percent}%` : undefined,
                        }))}
                        onSelect={setLogIdx}
                        ariaLabel="FFXIV Logs options"
                        disabled={!hasSelection}
                      />
                    </div>
                  )}

                  {/* Additional services */}
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Additional Services</p>
                    <div className="space-y-1.5">
                      {cfg?.unlocks.map((a) => {
                        const checked = unlocks.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() =>
                              setUnlocks((prev) =>
                                prev.includes(a.id) ? prev.filter((u) => u !== a.id) : [...prev, a.id],
                              )
                            }
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
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{addonLabel(a)}</span>
                            <span className="text-xs font-bold text-cyan-400">+{format(addonPrice(a))}</span>
                          </button>
                        );
                      })}
                      {method === 'piloted' && (
                        <button
                          type="button"
                          onClick={() => setStream((s) => !s)}
                          aria-pressed={stream}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              stream
                                ? 'border-cyan-600 bg-cyan-600 text-navy-900'
                                : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Private Stream</span>
                          <span className="text-xs font-bold text-cyan-400">+{format(cfg?.stream ?? 0)}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPriority((p) => !p)}
                        aria-pressed={priority}
                        className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                            priority
                              ? 'border-cyan-600 bg-cyan-600 text-navy-900'
                              : 'border-navy-600 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Priority</span>
                        <span className="text-xs font-bold text-cyan-400">
                          +{Math.round((priorityMultiplier - 1) * 100)}%
                        </span>
                      </button>
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
            Average Completion Time: {priority ? cfg?.completion.priority : cfg?.completion.normal}
          </p>
          <button
            onClick={addToCart}
            disabled={total <= 0}
            className="purchase-cta mt-3.5 w-full rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 py-2.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
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
