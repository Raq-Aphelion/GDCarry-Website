import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPricing, type PricingDb } from '@/data/pricing';
import { applyCatalog } from '@/data/games';
import { fromPrice } from '@/lib/pricing/engine/shared';

interface PricingContextValue {
  db: PricingDb;
  /** Base EUR price for a service: database value, else bundled fallback. */
  priceOf: (serviceId: string, fallback: number) => number;
}

const PricingContext = createContext<PricingContextValue | null>(null);

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used within PricingProvider');
  return ctx;
}

export function PricingProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<PricingDb | null>(null);

  useEffect(() => {
    let alive = true;
    loadPricing().then((d) => {
      // Apply the database-driven catalog (category names/order/proxies,
      // per-service visibility) before first render — consumers read it
      // straight from the games data.
      applyCatalog(d.catalog);
      if (alive) setDb(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Hold rendering until the database is loaded so no stale price ever shows.
  if (!db) return null;

  // Services with per-method DB pricing display the lower of the two method
  // prices on their card ("From …"); savage raid series use the first fight
  // in the Fights list; everything else uses the flat override or bundled
  // fallback. Logic lives in the pricing engine (shared with the worker).
  const priceOf = (serviceId: string, fallback: number) =>
    fromPrice(db, serviceId, fallback) ?? fallback;

  return <PricingContext.Provider value={{ db, priceOf }}>{children}</PricingContext.Provider>;
}
