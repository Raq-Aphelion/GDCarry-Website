import { useEffect, useState } from 'react';
import { Check, ChevronRight, Clock, Minus, Plus, Settings2, type LucideIcon } from 'lucide-react';
import { JOB_GROUPS } from '@/data/jobs';
import { jobGroupsUpTo, splitParens } from '@/data/jobs';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import type { Service } from '@/data/games';
import type { PricingAddon } from '@/data/pricing';

const DATA_CENTERS = [
  'Aether',
  'Primal',
  'Crystal',
  'Dynamis',
  'Chaos',
  'Light',
  'Elemental',
  'Gaia',
  'Mana',
  'Meteor',
  'Materia',
];

/** Unified config for the level-range purchase box. The standard leveling
    box adds the job select; Blue Mage skips it and swaps the add-on. */
export interface LevelBoxConfig {
  levelMin: number;
  levelMax: number;
  defaultStart: number;
  defaultEnd: number;
  priceTiers: { min: number; max: number; pricePerLevel: number }[];
  completion: string;
  showJob: boolean;
  /** Grouped jobs with role dividers in the dropdown (combat groups by
      default; pass e.g. Crafters/Gatherers to override) */
  jobGroups?: { label: string; icon: LucideIcon; jobs: string[] }[];
  /** Per-job minimum levels (e.g. Viper starts at 80) — drives the slider
      minimum when that job is selected */
  jobMinLevels?: Record<string, number>;
  /** Gear dropdown in Additional Options (shared purchaseBox.gearOptions) */
  gearOptions?: boolean;
  /** Start-input label instead of 'Your level' (e.g. 'Your rank') */
  startLabel?: string;
  /** End-input label instead of 'Desired level' (top range only) */
  endLabel?: string;
  /** Main add-on in Additional Options (MSQ completion / All spells unlock) */
  addon?: PricingAddon;
  /** Lock the main add-on unless the desired level is the cap (Blue Mage) */
  addonLocksToMax?: boolean;
  /** Extra add-on rows in Additional Options (Masked Carnivale) */
  addons?: PricingAddon[];
  /** Labeled option groups between Data Center and Additional Options (e.g.
      Relic Weapon / Elemental Armor); options may use `requiresOption` to
      stay greyed until another option is picked */
  optionGroups?: { heading: string; options: PricingAddon[] }[];
  /** Phantom-job style select: per-job level caps drive the slider max;
      optional per-job price tiers override the shared ones */
  jobs?: { label: string; max: number; priceTiers?: { min: number; max: number; pricePerLevel: number }[] }[];
  /** Checkbox-gated Phantom Job leveling section: the top range becomes the
      base service levels (cfg.priceTiers); the job select + job level range
      hide under this checkmark option */
  phantomToggle?: { label: string };
  /** Preselected job label (no error state) */
  defaultJob?: string;
  /** Private Stream add-on price, shown in Additional Options when set */
  stream?: number;
}

/** Leveling purchase box: level range (inputs + dual slider), data center
    select, optional job select and add-ons — priced per level from the
    ffxiv-Leveling database category. The Additional Options drawer always
    renders and carries Private Stream (when configured) and Priority
    (× priorityMultiplier, applied to the level price only). */
/** Animated expand/retract wrapper for the job/armour-set dropdown that
    appears when a relic/armour option is picked. Overflow switches to visible
    once the expand finishes so the open select isn't clipped. */
function OptionSelect({
  show,
  label,
  value,
  options,
  onSelect,
  jobEra,
  invalid = false,
}: {
  show: boolean;
  label: string;
  value: string;
  options: string[];
  onSelect: (i: number) => void;
  /** Render grouped job options (dividers + blue parens) for this era instead */
  jobEra?: 'arr' | 'hw' | 'stb' | 'shb' | 'ew' | 'dt';
  invalid?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  // Render-phase state adjustment — reset the overflow guard on retract
  const [prevShow, setPrevShow] = useState(show);
  if (prevShow !== show) {
    setPrevShow(show);
    if (!show) setExpanded(false);
  }
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setExpanded(true), 300);
    return () => clearTimeout(t);
  }, [show]);
  const groups = jobEra ? jobGroupsUpTo(jobEra) : null;
  return (
    <div
      className={`grid transition-all duration-300 ease-soft ${
        show ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className={`min-h-0 ${expanded ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className="relative mt-1.5">
          <FieldPopup message={invalid ? `Select ${label} first.` : ''} />
          <CustomSelect
            value={value}
            placeholder={`Select ${label}`}
            options={
              groups
                ? groups.flatMap((g) => [
                    { label: g.label, icon: g.icon, divider: true as const },
                    ...g.jobs.map((j) => {
                      const [jlabel, accent] = splitParens(j);
                      return { label: jlabel, accent };
                    }),
                  ])
                : options.map((o) => ({ label: o }))
            }
            onSelect={onSelect}
            ariaLabel={`Select ${label}`}
            invalid={invalid}
            blueParens={!!groups}
          />
        </div>
      </div>
    </div>
  );
}

/** Leveling purchase box: level range (inputs + dual slider), data center
    select, optional job select and add-on — priced per level from the
    ffxiv-Leveling database category. The Additional Options drawer always
    renders and carries Private Stream (when configured) and Priority
    (× priorityMultiplier, applied to the level price only). */
export default function LevelingPurchaseBox({
  service,
  gameShort,
  config,
}: {
  service: Service;
  gameShort: string;
  config: LevelBoxConfig;
}) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const priorityMultiplier = db.purchaseBox.priorityMultiplier;
  const cfg = config;

  const [start, setStart] = useState(cfg.defaultStart);
  const [end, setEnd] = useState(cfg.defaultEnd);
  const [job, setJob] = useState(cfg.defaultJob ?? '');
  const [dc, setDc] = useState('');
  const [gearIdx, setGearIdx] = useState(0);

  // Phantom-job variants: the selected job's cap drives the slider max;
  // jobMinLevels (combat jobs) drive the slider minimum
  const isPhantomSplit = !!cfg.phantomToggle && !!cfg.jobs?.length;
  const levelMax = !isPhantomSplit && cfg.jobs?.length
    ? (cfg.jobs.find((j) => j.label === job)?.max ?? cfg.levelMax)
    : cfg.levelMax;
  const jobMin = cfg.jobMinLevels?.[job] ?? cfg.levelMin;
  const [phantomOn, setPhantomOn] = useState(false);
  const [pStart, setPStart] = useState(cfg.levelMin);
  const [pEnd, setPEnd] = useState(cfg.levelMin + 1);
  // Phantom section: the selected job's cap drives its range max
  const phantomMax = cfg.jobs?.find((j) => j.label === job)?.max ?? cfg.levelMax;
  const selectJob = (label: string) => {
    setJob(label);
    setJobError(false);
    const max = cfg.jobs?.find((j) => j.label === label)?.max;
    if (!max) return;
    if (isPhantomSplit) setPhantomRange(pStart, Math.min(pEnd, max));
    else setRange(start, Math.min(end, max));
  };
  const [addonChecked, setAddonChecked] = useState(false);
  const [addonsChecked, setAddonsChecked] = useState<string[]>([]);
  const [groupsChecked, setGroupsChecked] = useState<string[]>([]);
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});
  const [stream, setStream] = useState(false);
  const [priority, setPriority] = useState(false);
  const [jobError, setJobError] = useState(false);
  const [dcError, setDcError] = useState(false);
  /** Option id whose required selectOptions dropdown was left unselected */
  const [selError, setSelError] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  useEffect(() => {
    if (!optionsOpen) return;
    const t = setTimeout(() => setOptionsExpanded(true), 500);
    return () => clearTimeout(t);
  }, [optionsOpen]);

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${job}|${dc}|${optionsOpen}|${start}-${end}|${phantomOn}|${pStart}-${pEnd}|${groupsChecked.length}|${Object.keys(groupSelections).length}`,
  );

  const clampLevels = (s: number, e: number, min = jobMin): [number, number] => {
    const max = levelMax;
    s = Math.min(Math.max(s, min), max - 1);
    e = Math.min(Math.max(e, min + 1), max);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const setRange = (s: number, e: number) => {
    const [cs, ce] = clampLevels(s, e);
    setStart(cs);
    setEnd(ce);
  };
  // Phantom section range (split mode): capped by the selected job's max
  const clampPhantom = (s: number, e: number): [number, number] => {
    const min = cfg.levelMin;
    const max = phantomMax;
    s = Math.min(Math.max(s, min), max - 1);
    e = Math.min(Math.max(e, min + 1), max);
    if (s >= e) s = e - 1;
    return [s, e];
  };
  const setPhantomRange = (s: number, e: number) => {
    const [cs, ce] = clampPhantom(s, e);
    setPStart(cs);
    setPEnd(ce);
  };
  const [phantomExpanded, setPhantomExpanded] = useState(false);
  // Render-phase state adjustment — reset the overflow guard on retract
  const [prevPhantomOn, setPrevPhantomOn] = useState(phantomOn);
  if (prevPhantomOn !== phantomOn) {
    setPrevPhantomOn(phantomOn);
    if (!phantomOn) setPhantomExpanded(false);
  }
  useEffect(() => {
    if (!phantomOn) return;
    const t = setTimeout(() => setPhantomExpanded(true), 300);
    return () => clearTimeout(t);
  }, [phantomOn]);

  // Per-level price tiers: sum the per-level price of every level gained
  // (job-specific tiers when the config provides them, e.g. phantom jobs —
  // but not in split mode, where the top range is the base service levels)
  const activeTiers = !isPhantomSplit && cfg.jobs?.length
    ? (cfg.jobs.find((j) => j.label === job)?.priceTiers ?? cfg.priceTiers)
    : cfg.priceTiers;
  const sumLevels = (s: number, e: number, tiers: typeof activeTiers) => {
    let sum = 0;
    for (let l = s + 1; l <= e; l++) {
      const tier = tiers.find((t) => l >= t.min && l <= t.max);
      sum += tier?.pricePerLevel ?? 0;
    }
    return sum;
  };
  const levelPrice = sumLevels(start, end, activeTiers);
  // Phantom Job leveling section: own range priced from the job's tiers
  const phantomTiers = cfg.jobs?.find((j) => j.label === job)?.priceTiers ?? cfg.priceTiers;
  const phantomPrice = isPhantomSplit && phantomOn ? sumLevels(pStart, pEnd, phantomTiers) : 0;
  // Blue Mage: All spells unlock requires the desired level to be the cap —
  // greyed out, unchecked and excluded from the price at any lower target.
  // (Render-phase state adjustment — the sanctioned alternative to setState
  // inside an effect.)
  const addonEnabled = cfg.addonLocksToMax ? end === cfg.levelMax : true;
  const [prevAddonEnabled, setPrevAddonEnabled] = useState(addonEnabled);
  if (prevAddonEnabled !== addonEnabled) {
    setPrevAddonEnabled(addonEnabled);
    if (!addonEnabled) setAddonChecked(false);
  }
  const addonPrice = addonChecked && addonEnabled ? cfg.addon?.price ?? 0 : 0;
  const extrasPrice = addonsChecked.reduce(
    (s, id) => s + (cfg.addons?.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const groupOptions = cfg.optionGroups?.flatMap((g) => g.options) ?? [];
  // Unchecking an option also drops any options that require it
  const toggleGroupOption = (o: (typeof groupOptions)[number]) =>
    setGroupsChecked((prev) => {
      if (prev.includes(o.id)) {
        setGroupSelections((sel) => {
          const next = { ...sel };
          delete next[o.id];
          return next;
        });
        return prev.filter((x) => x !== o.id && groupOptions.find((a) => a.id === x)?.requiresOption !== o.id);
      }
      return [...prev, o.id];
    });
  const groupsPrice = groupsChecked.reduce(
    (s, id) => s + (groupOptions.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const streamPrice = stream ? (cfg.stream ?? 10) : 0;
  const gearOptions = cfg.gearOptions ? db.purchaseBox.gearOptions : [];
  const gearPrice = gearOptions[gearIdx]?.price ?? 0;
  // Priority multiplies the level prices only; add-ons/groups/gear/stream stay flat
  const total =
    (levelPrice + phantomPrice) * (priority ? priorityMultiplier : 1) +
    addonPrice +
    extrasPrice +
    groupsPrice +
    gearPrice +
    streamPrice;

  const addToCart = () => {
    let ok = true;
    // Phantom Job is required only while its section is visible and active
    if ((cfg.showJob || (cfg.jobs?.length && (!isPhantomSplit || phantomOn))) && !job) {
      setJobError(true);
      ok = false;
    }
    // A picked option with a choice dropdown (e.g. Complete Eurekan Relic)
    // requires that dropdown to be selected
    const missing = groupsChecked.find(
      (id) => groupOptions.find((a) => a.id === id)?.selectOptions && !groupSelections[id],
    );
    if (missing) {
      setSelError(missing);
      ok = false;
    }
    if (!dc) {
      setDcError(true);
      ok = false;
    }
    if (!ok) return;
    addItem(
      {
        ...service,
        id: `${service.id}::${cfg.showJob || (cfg.jobs?.length && (!isPhantomSplit || phantomOn)) ? job : 'x'}|${dc}|${start}-${end}${isPhantomSplit && phantomOn ? `|p${pStart}-${pEnd}` : ''}`,
        price: total,
        method: 'Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        ...(job && (!isPhantomSplit || phantomOn) ? [`Job: ${job}`] : []),
        `Level ${start} → ${end}`,
        ...(isPhantomSplit && phantomOn && job ? [`${job} Level ${pStart} → ${pEnd}`] : []),
        `Data Center: ${dc}`,
        ...(addonChecked && addonEnabled && cfg.addon ? [cfg.addon.label] : []),
        ...addonsChecked.map((id) => cfg.addons!.find((a) => a.id === id)!.label),
        ...groupsChecked.map((id) => {
          const a = groupOptions.find((x) => x.id === id)!;
          const sel = groupSelections[id];
          return sel ? `${a.label} — ${sel}` : a.label;
        }),
        ...(stream ? ['Private Stream'] : []),
        ...(gearPrice > 0 ? [gearOptions[gearIdx].label] : []),
        ...(priority ? [`Priority (+${Math.round((priorityMultiplier - 1) * 100)}%)`] : []),
      ],
      1,
    );
    openCart();
  };

  const levelInput = (
    value: number,
    onChange: (v: number) => void,
    ariaLabel: string,
  ) => (
    <input
      type="text"
      inputMode="numeric"
      value={String(value)}
      aria-label={ariaLabel}
      onChange={(e) => {
        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(v)) onChange(v);
      }}
      className="h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 text-center text-sm text-cyan-400 outline-none transition-colors focus:border-navy-600"
    />
  );

  const addonRow = cfg.addon && (
    <button
      type="button"
      onClick={() => addonEnabled && setAddonChecked((m) => !m)}
      aria-pressed={addonChecked}
      disabled={!addonEnabled}
      className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-850"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          addonChecked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{cfg.addon.label}</span>
      <span className="text-xs font-bold text-cyan-400">+{format(cfg.addon.price)}</span>
    </button>
  );

  const groupOptionRow = (a: (typeof groupOptions)[number]) => {
    const locked = a.requiresOption != null && !groupsChecked.includes(a.requiresOption);
    const checked = groupsChecked.includes(a.id);
    return (
      <div key={a.id}>
        <button
          type="button"
          onClick={() => !locked && toggleGroupOption(a)}
          aria-pressed={checked}
          disabled={locked}
          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-850"
        >
          <span
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
              checked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3.5} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.label}</span>
          <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
        </button>
        {/* Choice dropdown (job / armour set) once the option is picked —
            expands and retracts with an animated height transition */}
        {a.selectOptions && (
          <OptionSelect
            show={checked}
            label={a.selectOptions.label}
            value={groupSelections[a.id] ?? ''}
            options={a.selectOptions.options ?? []}
            jobEra={a.selectOptions.jobEra}
            invalid={selError === a.id}
            onSelect={(i) => {
              setSelError((e) => (e === a.id ? null : e));
              setGroupSelections((prev) => ({
                ...prev,
                [a.id]: a.selectOptions!.jobEra
                  ? jobGroupsUpTo(a.selectOptions!.jobEra!).flatMap((g) => g.jobs)[i]
                  : (a.selectOptions!.options ?? [])[i],
              }));
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={
        stick === 'fit' ? 'lg:sticky lg:top-8' : stick === 'overflow' ? 'lg:sticky' : 'lg:flex-1'
      }
      style={stick === 'overflow' ? { top: overflowTop } : undefined}
    >
      <div className="purchase-box relative overflow-visible rounded-[5px] bg-navy-850">
        {/* Service image behind the top of the box */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] overflow-hidden rounded-t-[5px]" aria-hidden>
          <FadeImage src={service.image} alt="" className="h-full w-full" imgClassName="object-[50%_10%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[65%] to-navy-850" />
        </div>
        <div className="h-28" />

        <div className="relative space-y-4 p-4">
          {/* Level range */}
          <div>
            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">{cfg.startLabel ?? 'Your level'}</p>
                <div className="mt-2.5">{levelInput(start, (v) => setRange(v, end), cfg.startLabel ?? 'Your level')}</div>
              </div>
              <ChevronRight className="mb-2.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="flex-1">
                <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">{cfg.endLabel ?? 'Desired level'}</p>
                <div className="mt-2.5">{levelInput(end, (v) => setRange(start, v), cfg.endLabel ?? 'Desired level')}</div>
              </div>
            </div>
            <Slider
              className="mt-4"
              min={jobMin}
              max={levelMax}
              step={1}
              minStepsBetweenThumbs={1}
              value={[start, end]}
              onValueChange={([s, e]) => setRange(s, e)}
              aria-label="Level range"
            />
          </div>

          {/* Job — hidden for single-job variants (Blue Mage); phantom-job
              variants pick from config jobs with per-job level caps. In split
              mode it moves inside the Phantom Job leveling section */}
          {(cfg.showJob || cfg.jobs?.length) && !isPhantomSplit && (
            <div>
              <p className="pl-px text-sm font-semibold text-white">
                {cfg.jobs?.length ? 'Phantom Job' : 'Job'} <span className="text-xs font-normal text-slate-500">(required)</span>
              </p>
              <div className="relative mt-2.5">
                <FieldPopup message={jobError ? 'Select a job first.' : ''} />
                <CustomSelect
                  value={job}
                  placeholder={cfg.jobs?.length ? 'Select Phantom Job' : 'Select Job'}
                  options={
                    cfg.jobs?.length
                      ? cfg.jobs.map((j) => ({ label: j.label }))
                      : (cfg.jobGroups ?? JOB_GROUPS).flatMap((g) => [
                          { label: g.label, icon: g.icon, divider: true as const },
                          ...g.jobs.map((j) => {
                            const [label, accent] = splitParens(j);
                            return { label, accent };
                          }),
                        ])
                  }
                  onSelect={(i) => {
                    if (cfg.jobs?.length) selectJob(cfg.jobs[i].label);
                    else {
                      const flat = (cfg.jobGroups ?? JOB_GROUPS).flatMap((g) => g.jobs);
                      const label = flat[i];
                      setJob(label);
                      setJobError(false);
                      // Jobs with a starting level (e.g. Viper 80) lift the range
                      const min = cfg.jobMinLevels?.[label] ?? cfg.levelMin;
                      const [cs, ce] = clampLevels(Math.max(start, min), Math.max(end, min + 1), min);
                      setStart(cs);
                      setEnd(ce);
                    }
                  }}
                  ariaLabel="Select job"
                  invalid={jobError}
                  blueParens
                />
              </div>
            </div>
          )}

          {/* Phantom Job leveling — checkmark option gating the job select and
              its own level range; expands/retracts with an animated height */}
          {isPhantomSplit && (
            <div>
              <button
                type="button"
                onClick={() => setPhantomOn((p) => !p)}
                aria-pressed={phantomOn}
                className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                    phantomOn ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{cfg.phantomToggle!.label}</span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-soft ${
                  phantomOn ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className={`min-h-0 ${phantomExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="pl-px text-sm font-semibold text-white">
                        Phantom Job <span className="text-xs font-normal text-slate-500">(required)</span>
                      </p>
                      <div className="relative mt-2.5">
                        <FieldPopup message={jobError ? 'Select a job first.' : ''} />
                        <CustomSelect
                          value={job}
                          placeholder="Select Phantom Job"
                          options={cfg.jobs!.map((j) => ({ label: j.label }))}
                          onSelect={(i) => selectJob(cfg.jobs![i].label)}
                          ariaLabel="Select phantom job"
                          invalid={jobError}
                          blueParens
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-end gap-2.5">
                        <div className="flex-1">
                          <p className="pl-px text-sm font-semibold text-white">Your level</p>
                          <div className="mt-2.5">{levelInput(pStart, (v) => setPhantomRange(v, pEnd), 'Your level')}</div>
                        </div>
                        <ChevronRight className="mb-2.5 h-4 w-4 shrink-0 text-cyan-400" />
                        <div className="flex-1">
                          <p className="pl-px text-sm font-semibold text-white">Desired level</p>
                          <div className="mt-2.5">{levelInput(pEnd, (v) => setPhantomRange(pStart, v), 'Desired level')}</div>
                        </div>
                      </div>
                      <Slider
                        className="mt-4"
                        min={cfg.levelMin}
                        max={phantomMax}
                        step={1}
                        minStepsBetweenThumbs={1}
                        value={[pStart, pEnd]}
                        onValueChange={([s, e]) => setPhantomRange(s, e)}
                        aria-label="Phantom job level range"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Labeled option groups (Relic Weapon / Eurekan Armour) */}
          {cfg.optionGroups?.map((g) => (
            <div key={g.heading}>
              <p className="pl-px text-sm font-semibold text-white">{g.heading}</p>
              <div className="mt-2.5 space-y-1.5">{g.options.map(groupOptionRow)}</div>
            </div>
          ))}

          {/* Data center */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Data Center <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={dcError ? 'Select a data center first.' : ''} />
              <CustomSelect
                value={dc}
                placeholder="Select Data Center"
                options={DATA_CENTERS.map((d) => ({ label: d }))}
                onSelect={(i) => {
                  setDc(DATA_CENTERS[i]);
                  setDcError(false);
                }}
                ariaLabel="Select data center"
                invalid={dcError}
              />
            </div>
          </div>

          {/* Additional options — always rendered (Private Stream / Priority) */}
          <div className={`aob rounded-[5px] border border-navy-700/70 bg-navy-850 ${optionsOpen ? 'expanded' : ''}`}>
            <button
              onClick={() => {
                setOptionsOpen((o) => !o);
                setOptionsExpanded(false);
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
                <div className="space-y-4 px-4 pb-3 pt-1">
                  {cfg.gearOptions && (
                    <div>
                      <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Gear</p>
                      <CustomSelect
                        value={gearOptions[gearIdx]?.label ?? ''}
                        placeholder="Select gear"
                        options={gearOptions.map((g) => ({
                          label: g.label,
                          hint: g.price > 0 ? `+${format(g.price)}` : undefined,
                        }))}
                        onSelect={setGearIdx}
                        ariaLabel="Select gear"
                      />
                    </div>
                  )}
                  <div>
                    <p className="mb-2 pl-px text-xs font-semibold text-slate-300">Add-ons</p>
                    <div className="space-y-1.5">
                      {addonRow}
                      {cfg.addons?.map((a) => {
                        const checked = addonsChecked.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() =>
                              setAddonsChecked((prev) =>
                                prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                              )
                            }
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
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.label}</span>
                            <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setStream((s) => !s)}
                        aria-pressed={stream}
                        className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                            stream ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Private Stream</span>
                        <span className="text-xs font-bold text-cyan-400">+{format(cfg.stream ?? 10)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority((p) => !p)}
                        aria-pressed={priority}
                        className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                            priority ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-300">Priority</span>
                        <span className="text-xs font-bold text-cyan-400">
                          +{Math.round((priorityMultiplier - 1) * 100)}%
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total + checkout — floats above content, touching the bottom of the screen */}
      <div ref={wrapRef} className="mt-4" style={fixedStyle ? { height: blockHpx } : undefined}>
        <div
          style={fixedStyle ?? undefined}
          className={`purchase-price-block rounded-[5px] border border-navy-700/70 bg-navy-800 p-4 text-center shadow-2xl ${
            fixedStyle ? 'price-block-glow' : ''
          }`}
        >
          <p className="font-display text-2xl font-extrabold text-white">{format(total)}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-500" />
            Average Completion Time: {cfg.completion}
          </p>
          <button
            onClick={addToCart}
            className="purchase-cta mt-3.5 w-full rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 py-2.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110"
          >
            Add to cart
          </button>
          <div className="mt-3 flex items-center justify-center gap-3 opacity-80">
            {['paypal', 'revolut', 'crypto'].map((p) => (
              <img key={p} src={`/payment/${p}.svg`} alt={p} className="h-3.5 w-auto" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
