import { useState } from 'react';
import { Armchair, Check, Clock, Swords, Users, Zap, type LucideIcon } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import MountAddonsBlock from './MountAddonsBlock';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import type { Service } from '@/data/games';
import { lineTotal } from '@/lib/pricing/engine/shared';
import { computeCriterionLine, type CriterionConfig } from '@/lib/pricing/engine/criterion';

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

/** Variant & Criterion dungeon purchase box: Boost Method (Group Play first,
    then Piloted — flat price either way), a difficulty toggle (Normal /
    Savage, or custom labels like Normal / Advanced) when the dungeon has a
    second tier, Amount of Runs, and difficulty-specific add-ons (a forcedRuns
    add-on pins the runs display and zeroes the per-run core, so the price is
    the add-on's own). Switching difficulty drops every picked add-on. */
export default function CriterionPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.criterion?.[service.id];
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const hasDifficulty = cfg?.savagePrice != null || cfg?.difficulty != null;
  const normalLabel = cfg?.difficulty?.normal ?? 'Normal';
  const advancedLabel = cfg?.difficulty?.advanced ?? 'Savage';
  const [method, setMethod] = useState<'group' | 'piloted'>('group');
  const [difficulty, setDifficulty] = useState<'normal' | 'savage'>('normal');
  const [runs, setRuns] = useState(1);
  const [checked, setChecked] = useState<string[]>([]);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${difficulty}|${dc}|${runs}|${checked.length}|${stream}|${priority}|${unlockChecked}`,
  );

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  // Add-ons are difficulty-specific — switching drops every picked add-on
  const selectDifficulty = (d: 'normal' | 'savage') => {
    setDifficulty(d);
    setChecked([]);
  };

  const effDifficulty = hasDifficulty ? difficulty : 'normal';
  const activeAddons = effDifficulty === 'savage' ? (cfg?.advancedAddons ?? []) : (cfg?.addons ?? []);
  const anyAddons = (cfg?.addons?.length ?? 0) > 0 || (cfg?.advancedAddons?.length ?? 0) > 0;
  // Piloted carries its own per-run price when set (e.g. variants +10%);
  // a second difficulty with its own price is flat regardless of method
  const normalBase = method === 'piloted' ? (cfg?.pilotedPrice ?? cfg?.price ?? 0) : (cfg?.price ?? 0);
  const base =
    effDifficulty === 'savage'
      ? method === 'piloted'
        ? (cfg?.advancedPilotedPrice ?? cfg?.savagePrice ?? normalBase)
        : (cfg?.advancedPrice ?? cfg?.savagePrice ?? normalBase)
      : normalBase;
  const addonPriceOf = (a: (typeof activeAddons)[number]) =>
    method === 'piloted' ? (a.pilotedPrice ?? a.price) : a.price;
  const forcedRuns = checked.reduce((m, id) => Math.max(m, activeAddons.find((a) => a.id === id)?.forcedRuns ?? 0), 0);
  const effRuns = forcedRuns > 0 ? forcedRuns : runs;
  const streamPrice = 10;
  // The displayed total and the cart line come from the same engine compute —
  // what the visitor sees is exactly what the worker will recompute
  const lineCfg: CriterionConfig = {
    family: 'criterion',
    method,
    difficulty,
    runs,
    addons: checked,
    stream,
    priority,
    unlock: unlockChecked,
  };
  const line = computeCriterionLine(db, service.id, lineCfg);
  const total = line ? lineTotal(line) : 0;

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    // pilotedOnly services show a static Piloted pill (no toggle) — `method`
    // keeps its 'group' default, so derive the label from the config first
    const methodLabel = cfg?.pilotedOnly ? 'Piloted' : method === 'group' ? 'Group Play' : 'Piloted';
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${effDifficulty}|${dc}|${[...checked].sort().join(',')}${stream ? 's' : ''}${priority ? 'p' : ''}${unlockChecked ? 'u' : ''}`,
        price: line?.price ?? (forcedRuns > 0 ? 0 : base),
        flat: line?.flat,
        multiplier: line?.multiplier,
        method: methodLabel,
        config: lineCfg,
      },
      gameShort,
      [
        `Data Center: ${dc}`,
        ...(hasDifficulty ? [effDifficulty === 'savage' ? advancedLabel : normalLabel] : []),
        ...checked.map((id) => activeAddons.find((a) => a.id === id)!.label),
        ...(unlockChecked && cfg?.unlock ? [cfg.unlock.label] : []),
        ...(stream ? ['Private Stream'] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      effRuns,
    );
    openCart();
  };

  const pill = (label: string, Icon: LucideIcon, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-colors ${
        active
          ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
          : 'border-navy-700/70 bg-navy-850 text-slate-400 hover:bg-navy-800 hover:text-white'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-400' : ''}`} />
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${active ? 'text-cyan-400' : ''}`}>
        {label}
      </span>
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
          {/* Boost method — Group Play first; static pill for piloted-only */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            {cfg?.pilotedOnly ? (
              <div className="mt-2.5 flex items-center justify-center gap-2 rounded-[5px] border border-navy-600 bg-navy-800 px-3 py-2.5 text-white cyan-glow">
                <Armchair className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Piloted</span>
              </div>
            ) : (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {pill('Group Play', Users, method === 'group', () => setMethod('group'))}
                {pill('Piloted', Armchair, method === 'piloted', () => setMethod('piloted'))}
              </div>
            )}
          </div>

          {/* Difficulty — only for dungeons with a second tier */}
          {hasDifficulty && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">Difficulty</p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {pill(normalLabel, Swords, effDifficulty === 'normal', () => selectDifficulty('normal'))}
                {pill(advancedLabel, Zap, effDifficulty === 'savage', () => selectDifficulty('savage'))}
              </div>
            </div>
          )}

          {/* Amount of runs — pinned by the Mount (All Paths) add-on */}
          <div className={forcedRuns > 0 ? 'pointer-events-none opacity-50' : ''}>
            <p className="pl-px text-sm font-semibold text-white">Amount of Runs</p>
            <input
              type="text"
              inputMode="numeric"
              value={String(effRuns)}
              aria-label="Amount of runs"
              disabled={forcedRuns > 0}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                if (!Number.isNaN(v))
                  setRuns(Math.min(Math.max(v, db.purchaseBox.runsMin), db.purchaseBox.runsMax));
              }}
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-cyan-400 outline-none transition-colors focus:border-navy-600"
            />
            <Slider
              className="mt-4"
              min={db.purchaseBox.runsMin}
              max={db.purchaseBox.runsMax}
              step={1}
              value={[effRuns]}
              onValueChange={([v]) => setRuns(v)}
              aria-label="Amount of runs slider"
            />
          </div>

          {/* Add-ons — difficulty-specific lists; switching difficulties
              collapses/expands the block with a fade, same animation as the
              deep-dungeon Group Play / Solo Piloted crossfade: the outgoing
              state collapses slower (500ms) than the incoming expands
              (200ms), so the height never dips below the target */}
          {anyAddons && (
            <div
              className={`grid transition-all ease-soft ${
                activeAddons.length > 0
                  ? 'grid-rows-[1fr] duration-200'
                  : 'pointer-events-none grid-rows-[0fr] duration-500'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className={`transition-opacity duration-200 ${
                    activeAddons.length > 0 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p className="pl-px text-sm font-semibold text-white">Add-ons</p>
                  <div className="mt-2.5 space-y-1.5">
                    {activeAddons.map((a) => {
                      const isChecked = checked.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggle(a.id)}
                          aria-pressed={isChecked}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              isChecked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-slate-300">{a.label}</span>
                            {a.note && <span className="block text-[11px] leading-snug text-slate-500">{a.note}</span>}
                          </span>
                          <span className="text-xs font-bold text-cyan-400">+{format(addonPriceOf(a))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

          {/* Additional options — unlock (when offered), stream (unless the
              service hides it, e.g. variant dungeons), priority */}
          <MountAddonsBlock
            stream={stream}
            setStream={setStream}
            priority={priority}
            setPriority={setPriority}
            streamPrice={streamPrice}
            hideStream={cfg?.hideStream}
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
            Average Completion Time: {cfg?.completion ?? '24 Hours'}
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
