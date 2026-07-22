import type { CartItem } from '@/context/CartContext';

/** Full price of a cart line — handles both plain items and per-run configs
    (total = (price × qty + flat) × multiplier). */
export const lineTotal = (item: CartItem): number =>
  (item.price * item.qty + (item.flat ?? 0)) * (item.multiplier ?? 1);
