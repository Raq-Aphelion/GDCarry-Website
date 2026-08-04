import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPricing, type PricingDb } from '@/data/pricing';
import { applyCatalog } from '@/data/games';

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
  // fallback.
  const priceOf = (serviceId: string, fallback: number) => {
    const ss = db.savageSeries?.[serviceId];
    if (ss) return Object.values(ss.piloted?.fights ?? {}).flat()[0]?.price ?? fallback;
    if (serviceId === db.leveling?.serviceId && db.leveling.fromPrice != null) return db.leveling.fromPrice;
    if (serviceId === db.crafterLeveling?.serviceId && db.crafterLeveling.fromPrice != null)
      return db.crafterLeveling.fromPrice;
    if (serviceId === db.bluLeveling?.serviceId && db.bluLeveling.fromPrice != null) return db.bluLeveling.fromPrice;
    if (serviceId === db.pvpSeries?.serviceId && db.pvpSeries.fromPrice != null) return db.pvpSeries.fromPrice;
    if (serviceId === db.ccRank?.serviceId && db.ccRank.fromPrice != null) return db.ccRank.fromPrice;
    if (serviceId === db.wolfMarks?.serviceId && db.wolfMarks.fromPrice != null) return db.wolfMarks.fromPrice;
    const wing = db.mounts?.wings?.[serviceId];
    if (wing) return wing.price;
    const savageMount = db.mounts?.savageMounts?.[serviceId];
    if (savageMount) return Math.min(savageMount.price, savageMount.afkPrice ?? Infinity);
    const trial = db.trials?.[serviceId];
    if (trial) return trial.price;
    const tb = db.trialBundles?.[serviceId];
    if (tb) return tb.bundlePrice;
    const dd = db.deepDungeons?.[serviceId];
    if (dd)
      return Math.min(
        ...(dd.modes?.length ? dd.modes.map((m) => m.price) : [dd.solo.price]),
        ...(dd.group?.options.map((o) => o.price) ?? []),
      );
    const cr = db.criterion?.[serviceId];
    if (cr) return cr.price;
    const rl = db.relics?.[serviceId];
    if (rl) return rl.fromPrice ?? rl.steps[0]?.price ?? 0;
    const fl = db.fieldLeveling?.[serviceId];
    if (fl) return fl.fromPrice ?? (fl.defaultEnd - fl.defaultStart) * (fl.priceTiers[0]?.pricePerLevel ?? 0);
    const rep = db.reputation?.[serviceId];
    if (rep) return rep.fromPrice ?? rep.pricePerRank;
    const mountSeries = db.mounts?.series?.[serviceId];
    if (mountSeries) return mountSeries.fromPrice ?? mountSeries.mounts[0]?.price ?? fallback;
    if (serviceId === db.msqBoost?.serviceId && db.msqBoost.expansions?.[0] != null)
      return db.msqBoost.expansions[0].price;
    const mp = db.methodPrices?.[serviceId];
    if (mp) return Math.min(mp.piloted, mp.afk ?? Infinity);
    return db.servicePrices[serviceId] ?? fallback;
  };

  return <PricingContext.Provider value={{ db, priceOf }}>{children}</PricingContext.Provider>;
}
