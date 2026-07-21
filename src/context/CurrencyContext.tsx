import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePricing } from './PricingContext';

export type Currency = 'USD' | 'EUR';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert an EUR base price and format it in the active currency. */
  format: (eur: number) => string;
  /** Raw converted number in the active currency. */
  convert: (eur: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { db } = usePricing();
  const usdPerEur = db.currency.usdPerEur;
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('gd-currency') : null;
    return saved === 'USD' ? 'USD' : 'EUR';
  });

  useEffect(() => {
    window.localStorage.setItem('gd-currency', currency);
  }, [currency]);

  // First visit only (no saved preference): detect the visitor's region by IP
  // and default to USD outside euro-using Europe. Failures keep the EUR default.
  useEffect(() => {
    if (window.localStorage.getItem('gd-currency')) return;
    let alive = true;
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (!alive || !data) return;
        const euroRegion = data.currency === 'EUR' || data.continent_code === 'EU';
        setCurrencyState(euroRegion ? 'EUR' : 'USD');
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const convert = (eur: number) => (currency === 'USD' ? eur * usdPerEur : eur);

  const format = (eur: number) =>
    new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(convert(eur));

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setCurrencyState, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}
