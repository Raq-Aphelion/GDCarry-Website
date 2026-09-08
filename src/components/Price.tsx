import { useEffect, useState, type ReactNode } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

/** Fade-out length — keep in sync with .price-fade-out in index.css */
const FADE_OUT_MS = 160;

/**
 * Price text that fades out and back in when the active currency changes.
 * The parent re-renders with the new formatted string right away; this
 * wrapper keeps showing the old text through a short fade-out, then swaps
 * and fades back in. Value changes under the same currency (option toggles,
 * cart edits) update instantly — only a currency switch animates, and only
 * when the displayed text actually differs.
 */
export default function Price({ children, className }: { children: ReactNode; className?: string }) {
  const { currency } = useCurrency();
  const [shown, setShown] = useState(children);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');

  // Render-time adjustment (same pattern as the navbar's navigation reset):
  // a currency switch starts the fade-out; plain value changes sync instantly.
  const [prevCurrency, setPrevCurrency] = useState(currency);
  if (prevCurrency !== currency) {
    setPrevCurrency(currency);
    if (shown !== children) setPhase('out');
  } else if (phase !== 'out' && shown !== children) {
    setShown(children);
  }

  // Fade-out finished → swap in the new text and fade back in
  useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => {
      setShown(children);
      setPhase('in');
    }, FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [phase, children]);

  const anim = phase === 'out' ? 'price-fade-out' : phase === 'in' ? 'price-fade-in' : '';
  return <span className={className ? `${anim} ${className}` : anim || undefined}>{shown}</span>;
}
