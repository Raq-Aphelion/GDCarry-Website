import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { lineTotal } from '@/lib/cart';
import { useCurrency } from '@/context/CurrencyContext';
import { OverlayScrollbar } from '@/components/Scrollbar';
import { serviceLink } from '@/data/games';

export default function CartDrawer() {
  const { isOpen, closeCart, items, setQty, removeItem, subtotal, clear } = useCart();
  const { format } = useCurrency();
  const [listEl, setListEl] = useState<HTMLDivElement | null>(null);
  // The wider right padding exists only to make room for the overlay scrollbar
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (!listEl) return;
    const check = () => setOverflows(listEl.scrollHeight > listEl.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(listEl);
    Array.from(listEl.children).forEach((c) => ro.observe(c));
    // Item add/remove changes scrollHeight without resizing observed children
    const mo = new MutationObserver(check);
    mo.observe(listEl, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [listEl]);

  // Escape to close + visually hide the overlay scrollbar while open.
  // Scrolling stays fully functional (overflow is never locked — locking it
  // broke position:sticky) and the layout never shifts: the overlay scrollbar
  // takes no layout space, so nothing needs compensating.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('cart-scroll-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('cart-scroll-hidden');
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[90] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-navy-700/60 bg-navy-900 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-navy-700/60 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <ShoppingCart className="h-5 w-5 text-cyan-500" />
            Your Cart
            {items.length > 0 && (
              <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                {items.reduce((s, i) => s + i.qty, 0)} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded-[5px] p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-[5px] border border-navy-700/60 bg-navy-850 p-6">
              <ShoppingCart className="h-10 w-10 text-navy-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-white">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-400">Roll the dice on a boost and it will show up here.</p>
            </div>
            <Link
              to="/boosting/ffxiv"
              onClick={closeCart}
              className="rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 px-5 py-2.5 text-sm font-bold text-navy-900 transition-all hover:brightness-110"
            >
              Browse FFXIV boosts
            </Link>
          </div>
        ) : (
          <>
            <div className="relative min-h-0 flex-1">
              <div ref={setListEl} className={`cart-items-scroll h-full space-y-3 overflow-y-auto py-4 pl-5 ${overflows ? 'pr-8' : 'pr-5'}`}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[5px] bg-navy-850 p-3"
                >
                  {/* Configured services carry a ::config suffix — strip it for the link */}
                  <Link
                    to={serviceLink(item.id.split('::')[0])}
                    onClick={closeCart}
                    className="shrink-0"
                    aria-label={`View ${item.name}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-[5px] object-cover object-top transition-opacity hover:opacity-80"
                      loading="lazy"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-cyan-400/80">{item.gameShort}</p>
                        {item.details && item.details.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {item.details.map((d) => (
                              <li key={d} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="inline-block h-1 w-1 rotate-45 bg-cyan-500/70" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-[5px] p-1 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-[5px] border border-navy-700/70">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="p-1.5 text-slate-400 transition-colors hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-white">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="p-1.5 text-slate-400 transition-colors hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-bold text-cyan-400">
                        {format(lineTotal(item))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={clear}
                className="w-full pt-1 text-center text-xs font-medium text-slate-500 transition-colors hover:text-red-400"
              >
                Clear cart
              </button>
              </div>
              {/* Same overlay scrollbar as the main page — floats over the
                  items, no gutter, no arrows. */}
              <OverlayScrollbar
                scroller={listEl}
                className="absolute bottom-3 right-1.5 top-3 w-2.5"
              />
            </div>

            <div className="border-t border-navy-700/60 px-5 pb-6 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Subtotal</span>
                <span className="font-display text-xl font-bold text-cyan-400">{format(subtotal)}</span>
              </div>
              <div className="mt-3 border-t border-navy-700/60" />
              <Link
                to="/checkout"
                onClick={closeCart}
                className="mt-4 block w-full rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 py-3 text-center font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110 hover:glow"
              >
                Order · {format(subtotal)}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
