import { useState } from 'react';
import { Armchair, Check, Clock, Gamepad2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import DiscountTag from './DiscountTag';
import MountAddonsBlock from './MountAddonsBlock';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import { games, type Service } from '@/data/games';
import { lineTotal } from '@/lib/pricing/engine/shared';
import { computeTrialLine, type TrialConfig } from '@/lib/pricing/engine/trial';

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

/** Extreme trial purchase box: boost method with per-method prices from the
    ffxiv-Trials database, runs, data center, and stream/priority add-ons.
    Trials with a linked mount service (cfg.mount) also offer a Guaranteed
    Mount option: it pins runs to 1 and reprices to the mount's cost for the
    selected method (explicit afkPrice, falling back to ×afkMultiplier). */
export default function TrialPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.trials?.[service.id];
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;

  // Pilot discount vs AFK Carry — shown as a "Save X%" tag on the Piloted pill
  const pilotSave =
    cfg?.price != null && cfg.afkPrice != null && cfg.price < cfg.afkPrice
      ? Math.round((1 - cfg.price / cfg.afkPrice) * 100)
      : 0;

  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('piloted');
  const [runs, setRuns] = useState(1);
  const [guaranteed, setGuaranteed] = useState(false);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${dc}|${stream}|${priority}|${runs}|${guaranteed}`,
  );

  // Guaranteed Mount — the trial's linked mount service (wing or savage
  // mount), priced per method
  const mountWing = cfg?.mount ? db.mounts?.wings?.[cfg.mount] : undefined;
  const mountSavage = cfg?.mount ? db.mounts?.savageMounts?.[cfg.mount] : undefined;
  const mountService = cfg?.mount
    ? games.flatMap((g) => g.subcategories).flatMap((s) => s.services ?? []).find((sv) => sv.id === cfg.mount)
    : undefined;
  const mountLabel = mountService?.name.replace(/ \(Mount\)$/, '') ?? '';
  const mountPrice = mountWing
    ? method === 'afk'
      ? (mountWing.afkPrice ?? Number((mountWing.price * afkMultiplier).toFixed(2)))
      : mountWing.price
    : mountSavage
      ? method === 'afk'
        ? (mountSavage.afkPrice ?? Number((mountSavage.price * afkMultiplier).toFixed(2)))
        : mountSavage.price
      : 0;
  const hasMount = !!cfg?.mount && !!mountLabel && mountPrice > 0;

  // Guaranteed Mount: pin runs to 1 while checked
  const toggleGuaranteed = () =>
    setGuaranteed((g) => {
      if (!g) setRuns(1);
      return !g;
    });

  const streamPrice = 10;
  const methodBase = method === 'afk' ? (cfg?.afkPrice ?? cfg?.price ?? 0) : (cfg?.price ?? 0);
  // The displayed total and the cart line come from the same engine compute —
  // what the visitor sees is exactly what the worker will recompute
  const lineCfg: TrialConfig = { family: 'trial', method, runs, guaranteed, stream, priority };
  const line = computeTrialLine(db, service.id, lineCfg);
  const total = line
    ? lineTotal(line)
    : guaranteed
      ? mountPrice + (stream ? streamPrice : 0)
      : methodBase * runs * (priority ? priorityMultiplier : 1) + (stream ? streamPrice : 0);

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    const methodLabel = METHODS.find((m) => m.id === method)?.label ?? method;
    // Runs are excluded from the id — identical configs merge into one cart
    // line whose amount controls adjust the run count (cap 999)
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${dc}${guaranteed ? '|guaranteed' : ''}`,
        price: line?.price ?? (guaranteed ? mountPrice : methodBase),
        method: methodLabel,
        flat: line?.flat ?? (stream ? streamPrice : undefined),
        ...(guaranteed
          ? { qtyLocked: true }
          : { multiplier: line?.multiplier ?? (priority ? priorityMultiplier : undefined) }),
        config: lineCfg,
      },
      gameShort,
      [
        ...(guaranteed ? [`${mountLabel} Guaranteed`] : []),
        `Data Center: ${dc}`,
        ...(stream ? ['Private Stream'] : []),
        ...(!guaranteed && priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      guaranteed ? 1 : runs,
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
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`relative flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-all duration-300 ${
                    method === m.id
                      ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  {m.id === 'piloted' && pilotSave > 0 && <DiscountTag label={`Save ${pilotSave}%`} />}
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

          {/* Runs — pinned to 1 while Guaranteed Mount is on */}
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
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-cyan-400 outline-none transition-colors focus:border-navy-600"
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

          {/* Guaranteed Mount — farmed until it drops, at the mount's price */}
          {hasMount && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">Guaranteed Mount</p>
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={toggleGuaranteed}
                  aria-pressed={guaranteed}
                  className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      guaranteed ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{mountLabel} Guaranteed</span>
                  <span className="text-xs font-bold text-cyan-400">{format(mountPrice)}</span>
                </button>
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
