import { useEffect, useState, type ReactNode } from 'react';
import { Check, Minus, Plus, Settings2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';

/** Shared Additional Options block for mount purchase boxes: Private Stream
    (flat, from the mount service — omitted when `setStream` isn't passed)
    and Priority (× priorityMultiplier). `extraRow` prepends a custom row
    (e.g. Deep Dungeon Unlock); `extraRows` prepends more rows after it
    (e.g. offerings). */
export default function MountAddonsBlock({
  stream,
  setStream,
  priority,
  setPriority,
  streamPrice,
  onToggle,
  extraRow,
  extraRows,
  gearRow,
  hideStream = false,
}: {
  stream?: boolean;
  setStream?: (v: boolean) => void;
  priority: boolean;
  setPriority: (v: boolean) => void;
  streamPrice?: number;
  onToggle?: () => void;
  /** Custom first row (label, price hint, checked state, toggle) */
  extraRow?: { label: string; hint: string; checked: boolean; onClick: () => void };
  /** Additional custom rows after `extraRow` (e.g. offerings); `hidden`
      collapses the row with the standard grid-rows animation instead of
      unmounting it, so the drawer height transitions smoothly */
  extraRows?: { label: string; hint: string; checked: boolean; onClick: () => void; hidden?: boolean }[];
  /** Custom node rendered above the rows (e.g. a gear dropdown) */
  gearRow?: ReactNode;
  /** Hide the Private Stream row (e.g. allied society, variant dungeons) */
  hideStream?: boolean;
}) {
  const { format } = useCurrency();
  const { db } = usePricing();
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  useEffect(() => {
    if (!optionsOpen) return;
    const t = setTimeout(() => setOptionsExpanded(true), 500);
    return () => clearTimeout(t);
  }, [optionsOpen]);

  const row = (
    label: string,
    hint: string,
    checked: boolean,
    onClick: () => void,
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          checked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{label}</span>
      <span className="text-xs font-bold text-cyan-400">{hint}</span>
    </button>
  );

  return (
    <div className={`aob rounded-[5px] border border-navy-700/70 bg-navy-850 ${optionsOpen ? 'expanded' : ''}`}>
      <button
        onClick={() => {
          setOptionsOpen((o) => !o);
          setOptionsExpanded(false);
          onToggle?.();
        }}
        aria-expanded={optionsOpen}
        className="aob-toggle flex h-[38px] w-full items-center justify-between pl-4 pr-3.5 text-left"
      >
        <span className="flex items-center gap-2 pl-px text-sm font-normal text-slate-300">
          <Settings2 className="h-4 w-4 text-slate-400" />
          Additional Options
        </span>
        {optionsOpen ? (
          <Minus className="h-4 w-4 text-slate-500" />
        ) : (
          <Plus className="h-4 w-4 text-cyan-400" />
        )}
      </button>
      <div
        className={`grid transition-all duration-500 ease-soft ${
          optionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className={`min-w-0 ${optionsExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
          <div className="space-y-1.5 px-4 pb-3 pt-1">
            {gearRow}
            {extraRow && row(extraRow.label, extraRow.hint, extraRow.checked, extraRow.onClick)}
            {extraRows?.map((r) => (
              <div
                key={r.label}
                className={`grid transition-all duration-300 ease-soft ${
                  r.hidden
                    ? 'pointer-events-none !mt-0 grid-rows-[0fr] opacity-0'
                    : 'grid-rows-[1fr] opacity-100'
                }`}
              >
                <div className="min-h-0 overflow-hidden">{row(r.label, r.hint, r.checked, r.onClick)}</div>
              </div>
            ))}
            {!hideStream && setStream && row('Private Stream', `+${format(streamPrice ?? 10)}`, stream ?? false, () => setStream(!(stream ?? false)))}
            {row('Priority', `+${Math.round((priorityMultiplier - 1) * 100)}%`, priority, () => setPriority(!priority))}
          </div>
        </div>
      </div>
    </div>
  );
}
