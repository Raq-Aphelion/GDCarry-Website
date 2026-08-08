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
import { lineTotal } from '@/lib/pricing/engine/shared';
import { computeSavageMountLine, type SavageMountConfig } from '@/lib/pricing/engine/savagemount';

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

/** Savage raid mount purchase box: guaranteed mount at a fixed price with
    boost method (AFK Carry = afkMultiplier from the database) and a data
    center requirement. */
export default function SavageMountPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.mounts?.savageMounts?.[service.id];
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>(
    cfg?.groupFirst ? 'afk' : 'piloted',
  );
  const [checked, setChecked] = useState<string[]>([]);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${method}|${dc}|${stream}|${priority}|${checked.length}`,
  );

  const streamPrice = 10;
  // The displayed total and the cart line come from the same engine compute —
  // what the visitor sees is exactly what the worker will recompute
  const lineCfg: SavageMountConfig = { family: 'savagemount', method, addons: checked, stream, priority };
  const line = computeSavageMountLine(db, service.id, lineCfg);
  const total = line ? lineTotal(line) : 0;
  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    const methodLabel =
      method === 'afk'
        ? (cfg?.afkLabel ?? 'AFK Carry')
        : (METHODS.find((m) => m.id === method)?.label ?? method);
    addItem(
      {
        ...service,
        id: `${service.id}::${method}|${dc}|${[...checked].sort().join(',')}`,
        price: line?.price ?? total, // full total (one-off line)
        flat: line?.flat,
        multiplier: line?.multiplier,
        logsPercent: line?.logsPercent,
        method: methodLabel,
        qtyLocked: true,
        config: lineCfg,
      },
      gameShort,
      [
        `Duty: ${cfg?.trial ?? ''}`,
        `Data Center: ${dc}`,
        ...checked.map((id) => cfg!.addons!.find((a) => a.id === id)!.label),
        ...(stream ? ['Private Stream'] : []),
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
          {/* Boost method — static pill for piloted-only mounts */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            {cfg?.pilotedOnly ? (
              <div className="mt-2.5 flex items-center justify-center gap-2 rounded-[5px] border border-navy-600 bg-navy-800 px-3 py-2.5 text-white cyan-glow">
                <Armchair className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Piloted</span>
              </div>
            ) : (
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {(cfg?.groupFirst ? [...METHODS].reverse() : METHODS).map((m) => {
                const disabled = m.id === 'afk' && cfg?.afkDisabled;
                const label = m.id === 'afk' ? (cfg?.afkLabel ?? m.label) : m.label;
                return (
                  <button
                    key={m.id}
                    onClick={() => !disabled && setMethod(m.id)}
                    aria-pressed={method === m.id}
                    disabled={disabled}
                    className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                      method === m.id
                        ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
                        : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300 disabled:hover:border-navy-700/70 disabled:hover:text-slate-500'
                    }`}
                  >
                    <m.icon className={`h-4 w-4 shrink-0 ${method === m.id ? 'text-cyan-400' : 'opacity-70'}`} />
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        method === m.id ? 'text-cyan-400' : 'opacity-70'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            )}
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

          {/* Optional checkbox add-ons (e.g. Normal Mode) */}
          {cfg?.addons && cfg.addons.length > 0 && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">Add-ons</p>
              <div className="mt-2.5 space-y-1.5">
                {cfg.addons.map((a) => {
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
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.label}</span>
                      <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
                    </button>
                  );
                })}
              </div>
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
