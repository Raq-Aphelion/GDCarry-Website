import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
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

/** Wolf Marks purchase box: amount (input + slider) priced per mark, data
    center select, Private Stream add-on and Priority multiplier — values
    from the ffxiv-PvP database category. */
export default function WolfMarksPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.wolfMarks;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;

  const [amount, setAmount] = useState(cfg?.defaultAmount ?? 5000);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${dc}|${amount}`,
  );

  const clampAmount = (v: number) =>
    Math.min(Math.max(v, cfg?.amountMin ?? 5000), cfg?.amountMax ?? 20000);

  const base = amount * (cfg?.pricePerMark ?? 0);
  const total = base * (priority ? priorityMultiplier : 1) + (stream ? cfg?.streamPrice ?? 0 : 0);

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    addItem(
      {
        ...service,
        id: `${service.id}::${dc}|${amount}`,
        price: total,
        method: 'Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        `${amount.toLocaleString('en-US')} Wolf Marks`,
        `Data Center: ${dc}`,
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
          {/* Amount */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Wolf Marks Amount</p>
            <input
              type="text"
              inputMode="numeric"
              value={amount.toLocaleString('en-US')}
              aria-label="Wolf Marks amount"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                if (raw === '') return;
                const v = parseInt(raw, 10);
                if (!Number.isNaN(v)) setAmount(v > (cfg?.amountMax ?? 20000) ? cfg!.amountMax : v);
              }}
              onBlur={() => setAmount((a) => clampAmount(a))}
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-slate-300 outline-none transition-colors focus:border-navy-600"
            />
            <Slider
              className="mt-4"
              min={cfg?.amountMin ?? 5000}
              max={cfg?.amountMax ?? 20000}
              step={cfg?.amountStep ?? 1000}
              value={[amount]}
              onValueChange={([v]) => setAmount(v)}
              aria-label="Wolf Marks amount slider"
            />
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

          {/* Add-ons */}
          {cfg && (
            <div>
              <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setStream((s) => !s)}
                  aria-pressed={stream}
                  className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      stream ? 'border-cyan-500 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Private Stream</span>
                  <span className="text-xs font-bold text-cyan-400">+{format(cfg.streamPrice)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority((p) => !p)}
                  aria-pressed={priority}
                  className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      priority ? 'border-cyan-500 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
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
            Average Completion Time: {priority ? cfg?.completion.priority : cfg?.completion.normal}
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
