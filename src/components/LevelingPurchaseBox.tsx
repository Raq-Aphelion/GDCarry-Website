import { useEffect, useState } from 'react';
import { Check, ChevronRight, Clock, Minus, Plus, Settings2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
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

const JOBS = [
  'Paladin (PLD)',
  'Warrior (WAR)',
  'Dark Knight (DRK)',
  'Gunbreaker (GNB)',
  'White Mage (WHM)',
  'Scholar (SCH)',
  'Astrologian (AST)',
  'Sage (SGE)',
  'Monk (MNK)',
  'Dragoon (DRG)',
  'Ninja (NIN)',
  'Samurai (SAM)',
  'Reaper (RPR)',
  'Viper (VPR)',
  'Bard (BRD)',
  'Machinist (MCH)',
  'Dancer (DNC)',
  'Black Mage (BLM)',
  'Summoner (SMN)',
  'Red Mage (RDM)',
  'Pictomancer (PCT)',
];

/** Unified config for the level-range purchase box. The standard leveling
    box adds the job select; Blue Mage skips it and swaps the add-on. */
export interface LevelBoxConfig {
  levelMin: number;
  levelMax: number;
  defaultStart: number;
  defaultEnd: number;
  priceTiers: { min: number; max: number; pricePerLevel: number }[];
  completion: string;
  showJob: boolean;
  /** Main add-on in Additional Options (MSQ completion / All spells unlock) */
  addon?: PricingAddon;
  /** Lock the main add-on unless the desired level is the cap (Blue Mage) */
  addonLocksToMax?: boolean;
  /** Extra add-on rows in Additional Options (Masked Carnivale) */
  addons?: PricingAddon[];
  /** Private Stream add-on price, shown in Additional Options when set */
  stream?: number;
}

/** Leveling purchase box: level range (inputs + dual slider), data center
    select, optional job select and add-on — priced per level from the
    ffxiv-Leveling database category. */
export default function LevelingPurchaseBox({
  service,
  gameShort,
  config,
}: {
  service: Service;
  gameShort: string;
  config: LevelBoxConfig;
}) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const cfg = config;

  const [start, setStart] = useState(cfg.defaultStart);
  const [end, setEnd] = useState(cfg.defaultEnd);
  const [job, setJob] = useState('');
  const [dc, setDc] = useState('');
  const [addonChecked, setAddonChecked] = useState(false);
  const [addonsChecked, setAddonsChecked] = useState<string[]>([]);
  const [stream, setStream] = useState(false);
  const [jobError, setJobError] = useState(false);
  const [dcError, setDcError] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  useEffect(() => {
    if (!optionsOpen) return;
    const t = setTimeout(() => setOptionsExpanded(true), 500);
    return () => clearTimeout(t);
  }, [optionsOpen]);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${job}|${dc}|${optionsOpen}|${start}-${end}`,
  );

  const clampLevels = (s: number, e: number): [number, number] => {
    const min = cfg.levelMin;
    const max = cfg.levelMax;
    s = Math.min(Math.max(s, min), max - 1);
    e = Math.min(Math.max(e, min + 1), max);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const setRange = (s: number, e: number) => {
    const [cs, ce] = clampLevels(s, e);
    setStart(cs);
    setEnd(ce);
  };

  // Per-level price tiers: sum the per-level price of every level gained
  const levelPrice = (() => {
    let sum = 0;
    for (let l = start + 1; l <= end; l++) {
      const tier = cfg.priceTiers.find((t) => l >= t.min && l <= t.max);
      sum += tier?.pricePerLevel ?? 0;
    }
    return sum;
  })();
  // Blue Mage: All spells unlock requires the desired level to be the cap —
  // greyed out, unchecked and excluded from the price at any lower target.
  // (Render-phase state adjustment — the sanctioned alternative to setState
  // inside an effect.)
  const addonEnabled = cfg.addonLocksToMax ? end === cfg.levelMax : true;
  const [prevAddonEnabled, setPrevAddonEnabled] = useState(addonEnabled);
  if (prevAddonEnabled !== addonEnabled) {
    setPrevAddonEnabled(addonEnabled);
    if (!addonEnabled) setAddonChecked(false);
  }
  const addonPrice = addonChecked && addonEnabled ? cfg.addon?.price ?? 0 : 0;
  const extrasPrice = addonsChecked.reduce(
    (s, id) => s + (cfg.addons?.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const streamPrice = stream ? cfg.stream ?? 0 : 0;
  const total = levelPrice + addonPrice + extrasPrice + streamPrice;

  const addToCart = () => {
    let ok = true;
    if (cfg.showJob && !job) {
      setJobError(true);
      ok = false;
    }
    if (!dc) {
      setDcError(true);
      ok = false;
    }
    if (!ok) return;
    addItem(
      {
        ...service,
        id: `${service.id}::${cfg.showJob ? job : 'blu'}|${dc}|${start}-${end}`,
        price: total,
        method: 'Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        ...(cfg.showJob ? [`Job: ${job}`] : []),
        `Level ${start} → ${end}`,
        `Data Center: ${dc}`,
        ...(addonChecked && addonEnabled && cfg.addon ? [cfg.addon.label] : []),
        ...addonsChecked.map((id) => cfg.addons!.find((a) => a.id === id)!.label),
        ...(stream ? ['Private Stream'] : []),
      ],
      1,
    );
    openCart();
  };

  const levelInput = (
    value: number,
    onChange: (v: number) => void,
    ariaLabel: string,
  ) => (
    <input
      type="text"
      inputMode="numeric"
      value={String(value)}
      aria-label={ariaLabel}
      onChange={(e) => {
        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(v)) onChange(v);
      }}
      className="h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-slate-300 outline-none transition-colors focus:border-navy-600"
    />
  );

  const addonRow = cfg.addon && (
    <button
      type="button"
      onClick={() => addonEnabled && setAddonChecked((m) => !m)}
      aria-pressed={addonChecked}
      disabled={!addonEnabled}
      className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-850"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          addonChecked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{cfg.addon.label}</span>
      <span className="text-xs font-bold text-cyan-400">+{format(cfg.addon.price)}</span>
    </button>
  );

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
          {/* Level range */}
          <div>
            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Your level</p>
                <div className="mt-2.5">{levelInput(start, (v) => setRange(v, end), 'Your level')}</div>
              </div>
              <ChevronRight className="mb-2.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Desired level</p>
                <div className="mt-2.5">{levelInput(end, (v) => setRange(start, v), 'Desired level')}</div>
              </div>
            </div>
            <Slider
              className="mt-4"
              min={cfg.levelMin}
              max={cfg.levelMax}
              step={1}
              minStepsBetweenThumbs={1}
              value={[start, end]}
              onValueChange={([s, e]) => setRange(s, e)}
              aria-label="Level range"
            />
          </div>

          {/* Job — hidden for single-job variants (Blue Mage) */}
          {cfg.showJob && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">
                Job <span className="text-xs font-normal text-slate-500">(required)</span>
              </p>
              <div className="relative mt-2.5">
                <FieldPopup message={jobError ? 'Select a job first.' : ''} />
                <CustomSelect
                  value={job}
                  placeholder="Select Job"
                  options={JOBS.map((j) => ({ label: j }))}
                  onSelect={(i) => {
                    setJob(JOBS[i]);
                    setJobError(false);
                  }}
                  ariaLabel="Select job"
                  invalid={jobError}
                />
              </div>
            </div>
          )}

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
          {(cfg.addon || cfg.addons?.length || cfg.stream != null) && (
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
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
                    <div className="space-y-1.5">
                      {addonRow}
                      {cfg.addons?.map((a) => {
                        const checked = addonsChecked.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() =>
                              setAddonsChecked((prev) =>
                                prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                              )
                            }
                            aria-pressed={checked}
                            className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
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
                      {cfg.stream != null && (
                        <button
                          type="button"
                          onClick={() => setStream((s) => !s)}
                          aria-pressed={stream}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              stream ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Private Stream</span>
                          <span className="text-xs font-bold text-cyan-400">+{format(cfg.stream)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
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
            Average Completion Time: {cfg.completion}
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
