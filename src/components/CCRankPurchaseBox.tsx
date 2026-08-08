import { useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
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
import { computeCCRankLine, type CCRankConfig } from '@/lib/pricing/engine/ccrank';

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

/** Crystalline Conflict rank purchase box: current → required rank with rank
    badges and a dual slider, priced as the difference of the two ranks'
    cumulative prices (from the ffxiv-PvP database category), plus Private
    Stream and Priority add-ons in the Additional Options drawer. */
export default function CCRankPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.ccRank;
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const RANKS = cfg?.ranks ?? [];

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(1);
  const [dc, setDc] = useState('');
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dcError, setDcError] = useState(false);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${dc}|${start}-${end}`,
  );

  const setRange = (s: number, e: number) => {
    const max = RANKS.length - 1;
    s = Math.min(Math.max(s, 0), max - 1);
    e = Math.min(Math.max(e, 1), max);
    if (s >= e) s = e - 1;
    setStart(s);
    setEnd(e);
  };

  const startRank = RANKS[start];
  const endRank = RANKS[end];
  // The displayed total and the cart line come from the same engine compute —
  // what the visitor sees is exactly what the worker will recompute
  const lineCfg: CCRankConfig = { family: 'ccrank', start, end, stream, priority };
  const line = computeCCRankLine(db, service.id, lineCfg);
  const total = line ? lineTotal(line) : 0;

  const addToCart = () => {
    if (total <= 0) return;
    if (!dc) {
      setDcError(true);
      return;
    }
    addItem(
      {
        ...service,
        id: `${service.id}::${dc}|${start}-${end}`,
        price: line?.price ?? total,
        method: 'Piloted',
        qtyLocked: true,
        config: lineCfg,
      },
      gameShort,
      [
        `Rank: ${startRank.label} → ${endRank.label}`,
        `Data Center: ${dc}`,
        ...(stream ? [cfg!.streamAddon.label] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      1,
    );
    openCart();
  };

  const rankCard = (rank: (typeof RANKS)[number] | undefined, label: string) => (
    <div className="flex-1">
      <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">{label}</p>
      <div className="mt-2.5 flex h-[116px] flex-col items-center justify-center gap-1.5 rounded-[5px] border border-navy-700/70 bg-navy-850 p-2.5">
        {rank && (
          <>
            <img src={rank.image} alt={rank.label} className="h-14 w-14 object-contain" loading="lazy" />
            <span className="text-center text-xs font-semibold text-white">{rank.label}</span>
          </>
        )}
      </div>
    </div>
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
          {/* Rank range */}
          <div>
            <div className="flex items-end gap-2.5">
              {rankCard(startRank, 'Current Rank')}
              <ChevronRight className="mb-12 h-4 w-4 shrink-0 text-cyan-400" />
              {rankCard(endRank, 'Desired Rank')}
            </div>
            <Slider
              className="mt-4"
              min={0}
              max={RANKS.length - 1}
              step={1}
              minStepsBetweenThumbs={1}
              value={[start, end]}
              onValueChange={([s, e]) => setRange(s, e)}
              aria-label="Rank range"
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
          <MountAddonsBlock
            stream={stream}
            setStream={setStream}
            priority={priority}
            setPriority={setPriority}
            streamPrice={cfg?.streamAddon.price ?? 10}
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
            Average Completion Time: {cfg?.completion ?? '3 Days'}
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
