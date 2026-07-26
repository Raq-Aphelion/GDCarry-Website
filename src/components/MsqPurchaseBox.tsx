import { useEffect, useState } from 'react';
import { Check, Clock, Minus, Plus, Settings2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
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

/** MSQ Completion purchase box: job and data center selects, a contiguous
    expansion range (checking two endpoints force-checks everything between),
    and Gear Options — per-expansion pricing from ffxiv-Leveling. */
export default function MsqPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.msqBoost;
  const EXPANSIONS = cfg?.expansions ?? [];
  const GEAR_OPTIONS = db.purchaseBox.gearOptions;

  const [job, setJob] = useState('');
  const [dc, setDc] = useState('');
  const [expansions, setExpansions] = useState<number[]>([]);
  const [aether, setAether] = useState(false);
  const [gearIdx, setGearIdx] = useState(0);
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
    `${job}|${dc}|${optionsOpen}|${expansions.join(',')}`,
  );

  // The selection is always one contiguous range: checking an item extends
  // the range out to it and force-checks everything in between; only the two
  // endpoints can be unchecked (interior items are locked by the range).
  const toggleExpansion = (i: number) => {
    setExpansions((prev) => {
      if (prev.includes(i)) {
        const lo = Math.min(...prev);
        const hi = Math.max(...prev);
        if (i !== lo && i !== hi) return prev;
        return prev.filter((x) => x !== i);
      }
      const next = [...prev, i];
      const lo = Math.min(...next);
      const hi = Math.max(...next);
      return Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
    });
  };

  const gearPrice = GEAR_OPTIONS[gearIdx]?.price ?? 0;
  const hasExpansions = expansions.length > 0;
  // Aether Currents scale per chosen expansion — the DB whitelist
  // (aetherCurrents.expansions) decides which expansion ids count
  const aetherWhitelist = cfg?.aetherCurrents?.expansions ?? [];
  const aetherCount = expansions.filter((i) => EXPANSIONS[i] && aetherWhitelist.includes(EXPANSIONS[i].id)).length;
  const aetherPrice = aether ? aetherCount * (cfg?.aetherCurrents?.pricePerExpansion ?? 0) : 0;
  const total =
    expansions.reduce((s, i) => s + (EXPANSIONS[i]?.price ?? 0), 0) + aetherPrice + gearPrice;

  const addToCart = () => {
    if (!hasExpansions) return;
    let ok = true;
    if (!job) {
      setJobError(true);
      ok = false;
    }
    if (!dc) {
      setDcError(true);
      ok = false;
    }
    if (!ok) return;
    const sorted = [...expansions].sort((a, b) => a - b);
    const rangeLabel =
      sorted.length === 1
        ? EXPANSIONS[sorted[0]].label
        : `${EXPANSIONS[sorted[0]].label} → ${EXPANSIONS[sorted[sorted.length - 1]].label}`;
    addItem(
      {
        ...service,
        id: `${service.id}|${job}|${dc}|${sorted.join(',')}`,
        price: total,
        method: 'Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        `Job: ${job}`,
        `Expansions: ${rangeLabel}`,
        `Data Center: ${dc}`,
        ...(aether && aetherPrice > 0 ? [`${cfg!.aetherCurrents!.label} (×${aetherCount})`] : []),
        ...(gearPrice > 0 ? [GEAR_OPTIONS[gearIdx].label] : []),
      ],
      1,
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
          {/* Job */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
              Main Job <span className="text-xs font-normal text-slate-500">(required)</span>
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

          {/* Expansions */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">Expansions</p>
            <div className="mt-2.5 space-y-1.5">
              {EXPANSIONS.map((e, i) => {
                const checked = expansions.includes(i);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleExpansion(i)}
                    aria-pressed={checked}
                    className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                        checked ? 'border-cyan-500 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{e.label}</span>
                    <span className="text-xs font-bold text-cyan-400">+{format(e.price)}</span>
                  </button>
                );
              })}
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
                  {/* Add-ons */}
                  {cfg?.aetherCurrents && (
                    <div>
                      <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setAether((a) => !a)}
                          aria-pressed={aether}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              aether ? 'border-cyan-500 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{cfg.aetherCurrents.label}</span>
                          <span className="text-xs font-bold text-cyan-400">
                            +{format(aetherCount * cfg.aetherCurrents.pricePerExpansion)}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

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
            Average Completion Time: {cfg?.completion ?? '4-6 Days'}
          </p>
          <button
            onClick={addToCart}
            disabled={!hasExpansions}
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
