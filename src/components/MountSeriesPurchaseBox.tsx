import { useState } from 'react';
import { Armchair, Check, Clock, Gamepad2 } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import MountAddonsBlock from './MountAddonsBlock';
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

const METHODS = [
  { id: 'piloted', label: 'Piloted', icon: Armchair },
  { id: 'afk', label: 'AFK Carry', icon: Gamepad2 },
] as const;

/** Mount series purchase box (Kirin, Firebird, Nine Tails, Landerwaffe,
    Apocryphal Bahamut, Wings of Legacy): checklist of the mounts required
    for the series' combined mount — all checked applies the bundle price,
    a partial selection sums the individual prices. Separate-selection and
    bundle prices follow the method: explicit afkPrice / afkBundlePrice when
    the DB provides them, otherwise +10% (afkMultiplier) under AFK Carry. */
export default function MountSeriesPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.mounts?.series?.[service.id];
  const afkMultiplier = db.mounts?.afkMultiplier ?? 1.1;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('piloted');
  const [checked, setChecked] = useState<string[]>(() => (cfg ? cfg.mounts.map((m) => m.id) : []));
  const [addonChecked, setAddonChecked] = useState(false);
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dc, setDc] = useState('');
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${dc}|${checked.length}|${addonChecked}|${stream}|${priority}`,
  );

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const allChecked = cfg ? checked.length === cfg.mounts.length : false;
  // Separate-selection prices follow the method: explicit afkPrice when the
  // DB provides one, otherwise the afkMultiplier (+10%)
  const displayPrice = (m: { price: number; afkPrice?: number }) =>
    method === 'afk' ? (m.afkPrice ?? Number((m.price * afkMultiplier).toFixed(2))) : m.price;
  // Bundle price follows the method the same way (afkBundlePrice override)
  const bundleTotal = (c: { bundlePrice: number; afkBundlePrice?: number }) =>
    method === 'afk' ? (c.afkBundlePrice ?? Number((c.bundlePrice * afkMultiplier).toFixed(2))) : c.bundlePrice;
  const mountsTotal = allChecked
    ? bundleTotal(cfg!)
    : checked.reduce((s, id) => {
        const m = cfg?.mounts.find((x) => x.id === id);
        return s + (m ? displayPrice(m) : 0);
      }, 0);
  const addonPrice = addonChecked ? cfg?.addon?.price ?? 0 : 0;
  const streamPrice = 10;
  const total =
    (mountsTotal + addonPrice * (method === 'afk' ? afkMultiplier : 1)) * (priority ? priorityMultiplier : 1) +
    (stream ? streamPrice : 0);

  const addToCart = () => {
    if (total <= 0) return;
    if (!dc) {
      setDcError(true);
      return;
    }
    const methodLabel = METHODS.find((m) => m.id === method)?.label ?? method;
    const selected = cfg!.mounts.filter((m) => checked.includes(m.id)).map((m) => m.label);
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${dc}|${[...checked].sort().join(',')}|${addonChecked ? 'addon' : ''}`,
        price: total,
        method: methodLabel,
        qtyLocked: true,
      },
      gameShort,
      [
        ...(allChecked ? [cfg!.bundleLabel] : selected),
        `Data Center: ${dc}`,
        ...(addonChecked && cfg?.addon ? [cfg.addon.label] : []),
        ...(stream ? ['Private Stream'] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      1,
    );
    openCart();
  };

  const row = (
    id: string,
    label: string,
    price: number,
    isChecked: boolean,
    onClick: () => void,
  ) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
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
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{label}</span>
      <span className="text-xs font-bold text-cyan-400">+{format(price)}</span>
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

          {/* Mount checklist */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
              Missing Mounts{' '}
              <span className="text-xs font-normal text-slate-300 [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
                (all {cfg?.mounts.length} = {format(cfg ? bundleTotal(cfg) : 0)} bundle)
              </span>
            </p>
            <div className="mt-2.5 space-y-1.5">
              {cfg?.mounts.map((m) =>
                row(m.id, m.label, displayPrice(m), checked.includes(m.id), () => toggle(m.id)),
              )}
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

          {/* Optional add-on (Nightmare for the ARR series) */}
          {cfg?.addon && (
            <div>
              <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
              {row(cfg.addon.id, cfg.addon.label, cfg.addon.price, addonChecked, () => setAddonChecked((a) => !a))}
            </div>
          )}

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
