import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Service } from '@/data/games';
import { lineTotal } from '@/lib/cart';
import { useToast } from './ToastContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  gameShort: string;
  qty: number;
  /** Chosen configuration lines (data center, gear, logs, add-ons) */
  details?: string[];
  /** Configured services only: qty is the run count and price is per run —
      line total = (price × qty + flat) × multiplier. Flat covers one-off
      gear/log/add-on prices; multiplier is set by the priority add-on. */
  flat?: number;
  multiplier?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    service: Service & { flat?: number; multiplier?: number },
    gameShort: string,
    details?: string[],
    qty?: number,
  ) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('gd-cart-v1');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('gd-cart-v1', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (service: Service & { flat?: number; multiplier?: number }, gameShort: string, details?: string[], qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === service.id);
        // Same service + same options (runs excluded from the id): merge the
        // run counts into the existing line
        if (existing) {
          return prev.map((i) => (i.id === service.id ? { ...i, qty: i.qty + qty } : i));
        }
        return [
          ...prev,
          {
            id: service.id,
            name: service.name,
            price: service.price,
            image: service.image,
            gameShort,
            qty,
            details,
            flat: service.flat,
            multiplier: service.multiplier,
          },
        ];
      });
      toast({
        title: 'Added to cart',
        description: `${service.name} · ${gameShort}`,
        variant: 'blue',
      });
    },
    [toast],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    },
    [removeItem],
  );

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: items.reduce((sum, i) => sum + lineTotal(i), 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        setQty,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
