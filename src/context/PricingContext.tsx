import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPricing, type PricingDb } from '@/data/pricing';
import { loadServices } from '@/data/services';
import { applyCatalog, applyServices } from '@/data/games';
import { applyServicePages } from '@/data/servicePages';
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
    Promise.all([loadPricing(), loadServices()]).then(([d, services]) => {
      // Swap in the database-driven service catalog and subpage content, then
      // apply the catalog overlay (category names/order/proxies, per-service
      // visibility) — all before first render, so every consumer sees the
      // DB-driven state straight from the games data.
      applyServices(services.games);
      applyServicePages(services.pages);
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
