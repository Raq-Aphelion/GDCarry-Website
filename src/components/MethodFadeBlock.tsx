import { useEffect, useState, type ReactNode } from 'react';

/** Collapsible wrapper for purchase-box sections that appear/disappear when
    the boost method changes the drawer's content length (e.g. FFXIV Logs and
    Private Stream are piloted-only): the block smoothly extends (200ms) /
    retracts (500ms) with a 200ms opacity fade — the same animation as the
    Tiers/Fights and difficulty crossfades. Overflow releases to visible once
    the expand finishes so an open dropdown isn't clipped. */
export default function MethodFadeBlock({ show, children }: { show: boolean; children: ReactNode }) {
  const [expanded, setExpanded] = useState(show);
  useEffect(() => {
    if (!show) {
      setExpanded(false);
      return;
    }
    const t = setTimeout(() => setExpanded(true), 200);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <div
      aria-hidden={!show}
      className={`grid transition-all ease-soft ${
        show ? 'grid-rows-[1fr] duration-200' : 'pointer-events-none grid-rows-[0fr] duration-500'
      }`}
    >
      <div className={`min-h-0 ${expanded ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className={`transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</div>
      </div>
    </div>
  );
}
