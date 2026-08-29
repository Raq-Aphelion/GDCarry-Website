import { ArrowRightLeft, BadgeCheck } from 'lucide-react';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import type { Service } from '@/data/games';

/** Account listing purchase box: a one-off sale, so no methods or options —
    just the specs recap and a fixed price. Shares the PurchaseBox shell and
    the floating price block; quantity is locked to 1 (the cart merges repeat
    adds into nothing — qtyLocked makes a re-add a no-op). No header image —
    the listing's gallery sits in the page body. */
export default function AccountPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { priceOf } = usePricing();
  // Same sticky/floating behavior as the other purchase blocks
  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat();
  const total = priceOf(service.id, service.price);

  // "What you get" — a listing can override with more than the 3 card tags
  const specs = service.account?.specs ?? [service.tag1, service.tag2, service.tag3].filter(Boolean) as string[];

  const addToCart = () => {
    addItem({ ...service, price: total, qtyLocked: true }, gameShort, specs, 1);
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
        <div className="relative space-y-4 p-4">
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              What you get
            </p>
            <ul className="mt-2.5 space-y-2">
              {specs.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-start gap-2.5 rounded-[5px] border border-navy-700/70 bg-navy-850 px-3 py-2.5 text-xs leading-relaxed text-slate-400">
            <ArrowRightLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
            One-off listing — the handover is arranged with our manager right after the purchase.
          </p>
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
          <p className="mt-1 text-xs text-slate-400">One-time payment — the account is fully yours</p>
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
