import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPricing, type PricingDb } from '@/data/pricing';
import { getGame } from '@/data/games';

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
      // Apply the database-driven Current Patch category (name + proxy cards)
      // before first render — consumers read it straight from the games data.
      if (d.currentPatch) {
        const cp = getGame('ffxiv')?.subcategories.find((s) => s.id === 'current-patch');
        if (cp) {
          if (d.currentPatch.name) cp.name = d.currentPatch.name;
          if (d.currentPatch.proxies) cp.proxies = d.currentPatch.proxies;
        }
      }
      if (alive) setDb(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Hold rendering until the database is loaded so no stale price ever shows.
  if (!db) return null;

  // Services with per-method DB pricing display the lower of the two method
  // prices on their card ("From …"); savage raid series use the first piloted
  // tier bundle; everything else uses the flat override or bundled fallback.
  const priceOf = (serviceId: string, fallback: number) => {
    const ss = db.savageSeries?.[serviceId];
    if (ss) return ss.piloted?.bundles?.[0]?.price ?? fallback;
    if (serviceId === db.leveling?.serviceId && db.leveling.fromPrice != null) return db.leveling.fromPrice;
    if (serviceId === db.msqBoost?.serviceId && db.msqBoost.expansions?.[0] != null)
      return db.msqBoost.expansions[0].price;
    const mp = db.methodPrices?.[serviceId];
    if (mp) return Math.min(mp.piloted, mp.afk ?? Infinity);
    return db.servicePrices[serviceId] ?? fallback;
  };

  return <PricingContext.Provider value={{ db, priceOf }}>{children}</PricingContext.Provider>;
}
