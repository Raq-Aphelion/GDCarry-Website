import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import MountAddonsBlock from './MountAddonsBlock';
import { CustomSelect } from './PurchaseBox';
import { JOB_GROUPS, jobGroupsUpTo, ARMOUR_GROUPS, CRAFTER_JOB_GROUPS, splitParens } from '@/data/jobs';
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

/** Relic weapon/armour purchase box: job (or armour type) select with role
    breakdowns, a chained Steps checklist (checking a step force-checks every
    step before it — only the endpoints can be unchecked; all selected by
    default), data center, and the Additional Options drawer. Each step is
    priced flat from the ffxiv-Relics database category. */
export default function RelicPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.relics?.[service.id];
  const steps = cfg?.steps ?? [];
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const isArmour = !!cfg?.select;
  // Relic weapons only exist for jobs up to their series' expansion;
  // Cosmic Exploration uses the DoH/DoL job groups instead
  const groups = cfg?.crafterJobs ? CRAFTER_JOB_GROUPS : cfg?.jobsUpTo ? jobGroupsUpTo(cfg.jobsUpTo) : JOB_GROUPS;

  const [choice, setChoice] = useState('');
  const [dc, setDc] = useState('');
  // All steps selected by default; the selection is always one contiguous
  // range from the first step (see toggleStep)
  const [stepsSel, setStepsSel] = useState<number[]>(() => steps.map((_, i) => i));
  const [mountOn, setMountOn] = useState(false);
  const [gearIdx, setGearIdx] = useState(0);
  const [priority, setPriority] = useState(false);
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [choiceError, setChoiceError] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${choice}|${dc}|${stepsSel.join(',')}|${mountOn}|${priority}|${unlockChecked}`,
  );

  // Chain semantics (same as the MSQ boost): checking a step extends the
  // range out to it and force-checks everything in between; only the two
  // endpoints can be unchecked (interior steps are locked by the range).
  const toggleStep = (i: number) => {
    setStepsSel((prev) => {
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

  // Priority multiplies the steps/bundle total; mount and unlock stay flat.
  // All steps enabled = the complete-bundle price replaces the sum.
  const allSteps = cfg?.complete != null && stepsSel.length === steps.length;
  const stepsTotal = allSteps
    ? cfg!.complete!.price
    : stepsSel.reduce((s, i) => s + (steps[i]?.price ?? 0), 0);
  const mountPrice = mountOn ? (cfg?.mount?.price ?? 0) : 0;
  const gearOptions = cfg?.gearOptions ? db.purchaseBox.gearOptions : [];
  const gearPrice = gearOptions[gearIdx]?.price ?? 0;
  const total =
    stepsTotal * (priority ? priorityMultiplier : 1) +
    mountPrice +
    gearPrice +
    (unlockChecked ? (cfg?.unlock?.price ?? 0) : 0);
  // Nothing purchasable with no steps and no mount — CTA stays disabled
  const nothingSelected = stepsSel.length === 0 && !mountOn;

  const addToCart = () => {
    let ok = true;
    if (!choice) {
      setChoiceError(true);
      ok = false;
    }
    if (!dc) {
      setDcError(true);
      ok = false;
    }
    if (!ok || nothingSelected) return;
    const sorted = [...stepsSel].sort((a, b) => a - b);
    const stepsLabel = allSteps
      ? cfg!.complete!.label
      : sorted.length === 0
        ? ''
        : sorted.length === 1
          ? steps[sorted[0]].label
          : `${steps[sorted[0]].label} → ${steps[sorted[sorted.length - 1]].label} (×${sorted.length})`;
    addItem(
      {
        ...service,
        id: `${service.id}::${choice}|${dc}|${allSteps ? 'complete' : sorted.join(',')}${mountOn ? 'm' : ''}${priority ? 'p' : ''}${unlockChecked ? 'u' : ''}`,
        price: total,
        method: 'Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        `${isArmour ? 'Armour' : 'Job'}: ${choice}`,
        ...(stepsLabel ? [`Steps: ${stepsLabel}`] : []),
        ...(mountOn && cfg?.mount ? [cfg.mount.label] : []),
        ...(gearPrice > 0 ? [gearOptions[gearIdx].label] : []),
        `Data Center: ${dc}`,
        ...(unlockChecked && cfg?.unlock ? [cfg.unlock.label] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
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
          {/* Job / Armour type selection */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
              {isArmour ? cfg!.select!.label : (cfg?.selectLabel ?? 'Weapon Type')} <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={choiceError ? `Select ${isArmour ? 'an armour type' : 'a job'} first.` : ''} />
              <CustomSelect
                value={choice}
                placeholder={isArmour ? 'Select Armour Type' : 'Select Job'}
                options={
                  isArmour
                    ? ARMOUR_GROUPS.flatMap((g) => [
                        { label: g.label, icon: g.icon, divider: true as const },
                        ...g.jobs.map((j) => {
                          const [label, accent] = splitParens(j);
                          return { label, accent };
                        }),
                      ])
                    : groups.flatMap((g) => [
                        { label: g.label, icon: g.icon, divider: true as const },
                        ...g.jobs.map((j) => {
                          const [label, accent] = splitParens(j);
                          return { label, accent };
                        }),
                      ])
                }
                onSelect={(i) => {
                  setChoice(isArmour ? ARMOUR_GROUPS.flatMap((g) => g.jobs)[i] : groups.flatMap((g) => g.jobs)[i]);
                  setChoiceError(false);
                }}
                ariaLabel={isArmour ? 'Select armour type' : 'Select job'}
                invalid={choiceError}
                blueParens
              />
            </div>
          </div>

          {/* Steps — chained checklist, all selected by default; having every
              step enabled switches the total to the complete-bundle price */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Steps{' '}
              {cfg?.complete && (
                <span className="text-xs font-normal text-slate-500">
                  (all steps = {format(cfg.complete.price)})
                </span>
              )}
            </p>
            <div className="mt-2.5 space-y-1.5">
              {steps.map((s, i) => {
                const checked = stepsSel.includes(i);
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => toggleStep(i)}
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
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{s.label}</span>
                    <span className="text-xs font-bold text-cyan-400">+{format(s.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {cfg?.mount && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">Mount</p>
              <button
                type="button"
                onClick={() => setMountOn((m) => !m)}
                aria-pressed={mountOn}
                className="mt-2.5 flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                    mountOn ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{cfg.mount.label}</span>
                <span className="text-xs font-bold text-cyan-400">+{format(cfg.mount.price)}</span>
              </button>
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

          {/* Additional options — questline unlock (when offered), priority */}
          <MountAddonsBlock
            priority={priority}
            setPriority={setPriority}
            extraRow={
              cfg?.unlock
                ? {
                    label: cfg.unlock.label,
                    hint: `+${format(cfg.unlock.price)}`,
                    checked: unlockChecked,
                    onClick: () => setUnlockChecked((u) => !u),
                  }
                : undefined
            }
            gearRow={
              cfg?.gearOptions ? (
                <div className="pb-1.5">
                  <CustomSelect
                    value={gearOptions[gearIdx]?.label ?? ''}
                    placeholder="Select gear"
                    options={gearOptions.map((g) => ({
                      label: g.label,
                      hint: g.price > 0 ? `+${format(g.price)}` : undefined,
                    }))}
                    onSelect={setGearIdx}
                    ariaLabel="Select gear"
                  />
                </div>
              ) : undefined
            }
          />
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
            Average Completion Time: {cfg?.completion ?? '3-5 Days'}
          </p>
          <button
            onClick={addToCart}
            disabled={nothingSelected}
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
