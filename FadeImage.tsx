import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePricing } from './PricingContext';

export type Currency = 'USD' | 'EUR';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert a USD base price and format it in the active currency. */
  format: (usd: number) => string;
  /** Raw converted number in the active currency. */
  convert: (usd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { db } = usePricing();
  const eurPerUsd = db.currency.eurPerUsd;
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('gd-currency') : null;
    return saved === 'USD' ? 'USD' : 'EUR';
  });

  useEffect(() => {
    window.localStorage.setItem('gd-currency', currency);
  }, [currency]);

  const convert = (usd: number) => (currency === 'EUR' ? usd * eurPerUsd : usd);

  const format = (usd: number) =>
    new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(convert(usd));

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setCurrencyState, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}
