import { useState } from 'react';
import { Check, ChevronRight, Clock } from 'lucide-react';
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
import { computeReputationLine, type ReputationConfig } from '@/lib/pricing/engine/reputation';

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

/** Allied Society reputation purchase box: faction select (per-faction rank
    caps), rank range (inputs + dual slider), data center, and the Additional
    Options drawer — priced per rank from the ffxiv-FieldExplorations
    database category. */
export default function ReputationPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.reputation?.[service.id];
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const factions = cfg?.factions ?? [];
  const factionLabel = cfg?.factionLabel ?? 'Allied Society';
  const rankName = (r: number) => cfg?.rankNames?.[r - (cfg?.rankMin ?? 1)] ?? String(r);
  const rankDisplay = (r: number) => (cfg?.rankNameOnly ? rankName(r) : `${r}. ${rankName(r)}`);

  const [faction, setFaction] = useState(factions[0]?.label ?? '');
  const [start, setStart] = useState(cfg?.defaultStart ?? 1);
  const [end, setEnd] = useState(cfg?.defaultEnd ?? 8);
  const [packagesChecked, setPackagesChecked] = useState<string[]>([]);
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${faction}|${dc}|${priority}|${start}-${end}|${packagesChecked.length}|${unlockChecked}`,
  );

  // Any allied package picked greys out the faction/rank selection and takes
  // over as the price base
  const anyPackage = packagesChecked.length > 0;
  const togglePackage = (id: string) =>
    setPackagesChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  // The selected faction's cap drives the slider max
  const rankMax = factions.find((f) => f.label === faction)?.maxRank ?? (cfg?.rankMax ?? 8);
  const clamp = (s: number, e: number): [number, number] => {
    const min = cfg?.rankMin ?? 1;
    s = Math.min(Math.max(s, min), rankMax - 1);
    e = Math.min(Math.max(e, min + 1), rankMax);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const setRange = (s: number, e: number) => {
    const [cs, ce] = clamp(s, e);
    setStart(cs);
    setEnd(ce);
  };
  const selectFaction = (label: string) => {
    setFaction(label);
    const max = factions.find((f) => f.label === label)?.maxRank;
    if (max) setRange(start, Math.min(end, max));
  };

  const base = anyPackage
    ? packagesChecked.reduce((s, id) => s + (cfg?.alliedPackages?.find((p) => p.id === id)?.price ?? 0), 0)
    : (end - start) * (cfg?.pricePerRank ?? 0);
  const unlockDisplayPrice = !cfg?.unlock
    ? 0
    : anyPackage
      ? (packagesChecked.includes('arr') ? cfg.unlock.arrPrice : 0) +
        packagesChecked.filter((id) => id !== 'arr').length * cfg.unlock.otherPrice
      : cfg.unlock.price;
  // The displayed total and the cart line come from the same engine compute —
  // what the visitor sees is exactly what the worker will recompute
  const lineCfg: ReputationConfig = {
    family: 'reputation',
    factionIdx: factions.findIndex((f) => f.label === faction),
    start,
    end,
    packages: packagesChecked,
    unlock: unlockChecked,
    priority,
  };
  const line = computeReputationLine(db, service.id, lineCfg);
  const total = line ? lineTotal(line) : 0;

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    addItem(
      {
        ...service,
        id: `${service.id}::${anyPackage ? packagesChecked.sort().join('+') : `${faction}|${start}-${end}`}|${dc}${unlockChecked ? '|u' : ''}`,
        price: line?.price ?? base,
        method: 'Piloted',
        qtyLocked: true,
        config: lineCfg,
      },
      gameShort,
      [
        ...(anyPackage
          ? packagesChecked.map((id) => cfg!.alliedPackages!.find((p) => p.id === id)!.label)
          : [`${factionLabel}: ${faction}`, `Rank ${rankName(start)} → ${rankName(end)}`]),
        `Data Center: ${dc}`,
        ...(unlockChecked && cfg?.unlock ? [`${cfg.unlock.label} (+${format(unlockDisplayPrice)})`] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      1,
    );
    openCart();
  };

  const rankInput = (
    value: number,
    onChange: (v: number) => void,
    ariaLabel: string,
  ) => (
    <input
      type="text"
      inputMode="numeric"
      value={rankDisplay(value)}
      aria-label={ariaLabel}
      onChange={(e) => {
        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(v)) onChange(v);
      }}
      className="h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-cyan-400 outline-none transition-colors focus:border-navy-600"
    />
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
          {/* Allied society */}
          <div className={anyPackage ? 'pointer-events-none opacity-50' : ''}>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
              {factionLabel} <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="mt-2.5">
              <CustomSelect
                value={faction}
                placeholder={`Select ${factionLabel}`}
                options={factions.map((f) => ({ label: f.label }))}
                onSelect={(i) => selectFaction(factions[i].label)}
                ariaLabel={`Select ${factionLabel.toLowerCase()}`}
                disabled={anyPackage}
              />
            </div>
          </div>

          {/* Rank range */}
          <div className={anyPackage ? 'pointer-events-none opacity-50' : ''}>
            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Your rank</p>
                <div className="mt-2.5">{rankInput(start, (v) => setRange(v, end), 'Your rank')}</div>
              </div>
              <ChevronRight className="mb-2.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Desired rank</p>
                <div className="mt-2.5">{rankInput(end, (v) => setRange(start, v), 'Desired rank')}</div>
              </div>
            </div>
            <Slider
              className="mt-4"
              min={cfg?.rankMin ?? 1}
              max={rankMax}
              step={1}
              minStepsBetweenThumbs={1}
              value={[start, end]}
              onValueChange={([s, e]) => setRange(s, e)}
              aria-label="Rank range"
            />
          </div>

          {/* Full-expansion allied packages — picking any greys out the
              faction/rank selection above */}
          {cfg?.alliedPackages && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">{cfg.packagesLabel ?? 'All Societies "9. Allied" Rank'}</p>
              <div className="mt-2.5 space-y-1.5">
                {cfg.alliedPackages.map((p) => {
                  const checked = packagesChecked.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePackage(p.id)}
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
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{p.label}</span>
                      <span className="text-xs font-bold text-cyan-400">+{format(p.price)}</span>
                    </button>
                  );
                })}
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
          <MountAddonsBlock
            stream={stream}
            setStream={setStream}
            priority={priority}
            setPriority={setPriority}
            streamPrice={10}
            hideStream
            extraRow={
              cfg?.unlock
                ? {
                    label: cfg.unlock.label,
                    hint: `+${format(unlockDisplayPrice)}`,
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
            Average Completion Time: {cfg?.completion ?? '2-4 Weeks'}
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
