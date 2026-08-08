import type { CartItem } from '@/context/CartContext';

export { lineTotal } from './pricing/engine/shared';

/** Meta line under a cart item's name: game, boost method (for configured
    services), and quantity — "N runs" for run-based services (quantity is the
    run count), ×N otherwise; one-off orders (qtyLocked) show no quantity.
    Updates live with the +/- controls. */
export const cartMeta = (item: CartItem): string =>
  item.method
    ? item.qtyLocked
      ? `${item.gameShort} · ${item.method}`
      : `${item.gameShort} · ${item.method} · ${item.qty} run${item.qty !== 1 ? 's' : ''}`
    : `${item.gameShort} · ×${item.qty}`;

/** Detail lines shown for a cart item. Gil lines derive the amount live from
    qty (millions of gil) so the +/- controls and the displayed amount stay
    in sync; the stored first detail line is replaced. */
export const displayDetails = (item: CartItem): string[] => {
  if (!item.id.startsWith('ffxiv-gil-pack')) return item.details ?? [];
  return [`${(item.qty * 1_000_000).toLocaleString('en-US')} Gil`, ...(item.details ?? []).slice(1)];
};
