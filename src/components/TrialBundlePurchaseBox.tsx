import { useState } from 'react';
import { Armchair, Check, Clock, Gamepad2 } from 'lucide-react';
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

const METHODS = [
  { id: 'piloted', label: 'Piloted', icon: Armchair },
  { id: 'afk', label: 'AFK Carry', icon: Gamepad2 },
] as const;

/** Extreme trial bundle purchase box: boost method toggle with per-trial
    prices for both methods. A checklist of the expansion's trials — all
    checked applies the bundle price, a partial selection sums the individual
    prices — multiplied by the number of runs. The Mount Guaranteed option
    forces 1 run and every trial checked, and reprices to the tied series
    mount's cost for the selected method (bundlePrice, ×afkMultiplier AFK). */
export default function TrialBundlePurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.trialBundles?.[service.id];
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('piloted');
  const [guaranteed, setGuaranteed] = useState(false);
  const [checked, setChecked] = useState<string[]>(() => (cfg ? cfg.trials.map((t) => t.id) : []));
  const [runs, setRuns] = useState(1);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${guaranteed}|${dc}|${checked.length}|${stream}|${priority}|${runs}`,
  );

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  // Mount Guaranteed: force every trial checked and pin runs to 1
  const toggleGuaranteed = () =>
    setGuaranteed((g) => {
      if (!g && cfg) {
        setChecked(cfg.trials.map((t) => t.id));
        setRuns(1);
      }
      return !g;
    });

  const priceOf = (t: { price: number; afkPrice?: number }) =>
    method === 'afk' ? (t.afkPrice ?? t.price) : t.price;
  // Mount Guaranteed price = the combined mount's cost for this method
  const mountBase = cfg ? (db.mounts?.series?.[cfg.mountServiceId]?.bundlePrice ?? 0) : 0;
  const mountPrice = Number((mountBase * (method === 'afk' ? afkMultiplier : 1)).toFixed(2));

  const allChecked = cfg ? checked.length === cfg.trials.length : false;
  const afkBundleTotal = cfg?.trials.reduce((s, t) => s + (t.afkPrice ?? t.price), 0) ?? 0;
  const selectionTotal = allChecked
    ? method === 'afk'
      ? afkBundleTotal
      : (cfg?.bundlePrice ?? 0)
    : checked.reduce((s, id) => {
        const t = cfg?.trials.find((x) => x.id === id);
        return s + (t ? priceOf(t) : 0);
      }, 0);
  const streamPrice = 10;
  const total = guaranteed
    ? mountPrice + (stream ? streamPrice : 0)
    : selectionTotal * runs * (priority ? priorityMultiplier : 1) + (stream ? streamPrice : 0);

  const addToCart = () => {
    if (total <= 0) return;
    if (!dc) {
      setDcError(true);
      return;
    }
    const methodLabel = METHODS.find((m) => m.id === method)?.label ?? method;
    const selected = cfg!.trials.filter((t) => checked.includes(t.id)).map((t) => t.label);
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${dc}|${guaranteed ? 'guaranteed' : [...checked].sort().join(',')}`,
        price: guaranteed ? mountPrice : selectionTotal,
        method: methodLabel,
        flat: stream ? streamPrice : undefined,
        ...(guaranteed ? { qtyLocked: true } : { multiplier: priority ? priorityMultiplier : undefined }),
      },
      gameShort,
      [
        ...(guaranteed
          ? [`${cfg!.mountLabel} Guaranteed`]
          : allChecked
            ? [cfg!.bundleLabel]
            : selected),
        `Data Center: ${dc}`,
        ...(stream ? ['Private Stream'] : []),
        ...(!guaranteed && priority
          ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`]
          : []),
      ],
      guaranteed ? 1 : runs,
    );
    openCart();
  };

  const row = (
    id: string,
    label: string,
    right: string,
    isChecked: boolean,
    onClick: () => void,
    disabled = false,
  ) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      aria-pressed={isChecked}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-navy-850"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          isChecked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{label}</span>
      <span className="text-xs font-bold text-cyan-400">{right}</span>
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
          {/* Boost method */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {METHODS.map((m) => (
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

          {/* Runs — right under the method pill; pinned to 1 while Mount
              Guaranteed is on */}
          <div className={guaranteed ? 'pointer-events-none opacity-50' : ''}>
            <p className="pl-px text-sm font-semibold text-white">Amount of Runs</p>
            <input
              type="text"
              inputMode="numeric"
              value={String(runs)}
              aria-label="Runs"
              disabled={guaranteed}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                if (!Number.isNaN(v)) setRuns(Math.min(Math.max(v, 1), 99));
              }}
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-slate-300 outline-none transition-colors focus:border-navy-600"
            />
            <Slider
              className="mt-4"
              min={1}
              max={99}
              step={1}
              value={[runs]}
              onValueChange={([v]) => setRuns(v)}
              aria-label="Runs slider"
            />
          </div>

          {/* Trial checklist */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
              Trials{' '}
              <span className="text-xs font-normal text-slate-300 [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
                (all {cfg?.trials.length} = {format(method === 'afk' ? afkBundleTotal : (cfg?.bundlePrice ?? 0))} bundle)
              </span>
            </p>
            <div className="mt-2.5 space-y-1.5">
              {cfg?.trials.map((t) =>
                row(t.id, t.label, `+${format(priceOf(t))}`, checked.includes(t.id), () => toggle(t.id), guaranteed),
              )}
            </div>
          </div>

          {/* Mount guaranteed — forces all trials + 1 run at the mount's price */}
          {cfg && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">Mount Guaranteed</p>
              <div className="mt-2.5">
              {row(
                'mount-guaranteed',
                `${cfg.mountLabel} Guaranteed`,
                format(mountPrice),
                guaranteed,
                toggleGuaranteed,
              )}
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
            streamPrice={streamPrice}
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
