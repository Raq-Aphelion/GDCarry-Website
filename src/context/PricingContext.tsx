import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPricing, type PricingDb } from '@/data/pricing';

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
      if (alive) setDb(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Hold rendering until the database is loaded so no stale price ever shows.
  if (!db) return null;

  const priceOf = (serviceId: string, fallback: number) => db.servicePrices[serviceId] ?? fallback;

  return <PricingContext.Provider value={{ db, priceOf }}>{children}</PricingContext.Provider>;
}
