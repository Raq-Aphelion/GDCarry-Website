import type { CartItem } from '@/context/CartContext';

/** Full price of a cart line. Multiplier (Priority) and logsPercent (parse
    tier) apply only to the per-run price × runs; flat extras (gear, logs flat
    fees, add-ons) are added afterwards, unaffected. */
export const lineTotal = (item: CartItem): number =>
  item.price * item.qty * (item.multiplier ?? 1) * (1 + (item.logsPercent ?? 0) / 100) + (item.flat ?? 0);
