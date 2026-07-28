import { useEffect, useState } from 'react';
import { Armchair, Check, Clock, Gem, Users, Zap, type LucideIcon } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
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

/** Run-type pill icons, keyed by option id (fallback: Gem). */
const OPTION_ICONS: Record<string, LucideIcon> = {
  speedrun: Zap,
  farm: Gem,
};

/** Deep dungeon purchase box: two methods — Group Play (run-type pills:
    Speedrun / Farm, plus optional run-type add-ons and multipliers) and Solo
    Piloted (fixed price with additional options: aetherpool farm, mount/
    weapon multipliers, private stream) — both priced per completion, plus a
    required data center. Group Play is listed first and preselected. */
export default function DeepDungeonPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const cfg = db.deepDungeons?.[service.id];
  const soloAddons = cfg?.solo.addons ?? [];
  const groupOptions = cfg?.group?.options ?? [];
  const groupAddons = cfg?.group?.addons ?? [];
  const groupMultiplier = cfg?.group?.multiplier;

  const [method, setMethod] = useState<'solo' | 'group'>('group');
  const [option, setOption] = useState(groupOptions[0]?.id ?? '');
  const [groupChecked, setGroupChecked] = useState<string[]>([]);
  const [mountOn, setMountOn] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [stream, setStream] = useState(false);
  const [dc, setDc] = useState('');
  const [dcError, setDcError] = useState(false);

  // Services without group options fall back to solo-only (static pill)
  const hasGroup = groupOptions.length > 0;
  const effMethod: 'solo' | 'group' = hasGroup ? method : 'solo';

  // Method switch cross-fades like the savage-raids tier/fight switch: the
  // current panel fades out, the new one swaps in while invisible, then fades
  // in. `shown` is the side currently rendered (and priced); `method` is the
  // selected toggle target.
  const [shown, setShown] = useState<'solo' | 'group'>('group');
  const [fadeIn, setFadeIn] = useState(true);
  const switchMethod = (id: 'solo' | 'group') => {
    setMethod(id);
    if (id !== shown) setFadeIn(false);
  };
  useEffect(() => {
    if (fadeIn) return;
    const t = setTimeout(() => {
      setShown(method);
      setFadeIn(true);
    }, 250);
    return () => clearTimeout(t);
  }, [fadeIn, method]);
  const pricedMethod: 'solo' | 'group' = hasGroup ? shown : 'solo';

  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat(
    `${dc}|${effMethod}|${option}|${groupChecked.length}|${mountOn}|${checked.length}|${stream}`,
  );

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const toggleGroupAddon = (id: string) =>
    setGroupChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  // Selecting a run type deselects any group add-ons that require another type
  const selectOption = (id: string) => {
    setOption(id);
    setGroupChecked((prev) =>
      prev.filter((c) => {
        const a = groupAddons.find((x) => x.id === c);
        return !a?.requiresOption || a.requiresOption === id;
      }),
    );
  };

  const streamPrice = 10;
  const addonsTotal = checked.reduce((s, id) => s + (soloAddons.find((a) => a.id === id)?.price ?? 0), 0);
  // Multiplier add-ons (e.g. Juedi 400%) apply to the solo base price only;
  // every other add-on stays additive on top of the multiplied price
  const soloTimes = checked.reduce(
    (t, id) => t * (soloAddons.find((a) => a.id === id)?.timesBase ?? 1),
    1,
  );
  const groupAddonsTotal = groupChecked.reduce(
    (s, id) => s + (groupAddons.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const selectedOption = groupOptions.find((o) => o.id === option) ?? groupOptions[0];
  const total =
    pricedMethod === 'group'
      ? (selectedOption?.price ?? 0) * (mountOn && groupMultiplier ? groupMultiplier.times : 1) +
        groupAddonsTotal
      : (cfg?.solo.price ?? 0) * soloTimes + addonsTotal + (stream ? streamPrice : 0);

  const addToCart = () => {
    if (!dc) {
      setDcError(true);
      return;
    }
    const isGroup = effMethod === 'group';
    addItem(
      {
        ...service,
        id: `${service.id}::${dc}|${effMethod}|${isGroup ? `${option}~${[...groupChecked].sort().join(',')}` : [...checked].sort().join(',')}|${isGroup && mountOn ? 'm' : ''}${!isGroup && stream ? 's' : ''}`,
        price: total,
        method: isGroup ? 'Group Play' : 'Solo Piloted',
        qtyLocked: true,
      },
      gameShort,
      [
        `Data Center: ${dc}`,
        ...(isGroup && selectedOption ? [selectedOption.label] : []),
        ...(isGroup ? groupChecked.map((id) => groupAddons.find((a) => a.id === id)!.label) : []),
        ...(isGroup && mountOn && groupMultiplier ? [groupMultiplier.label] : []),
        ...(!isGroup ? checked.map((id) => soloAddons.find((a) => a.id === id)!.label) : []),
        ...(!isGroup && stream ? ['Private Stream'] : []),
      ],
      1,
    );
    openCart();
  };

  const row = (id: string, label: string, right: string, isChecked: boolean, onClick: () => void) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      aria-pressed={isChecked}
      className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          isChecked ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{label}</span>
      <span className="text-xs font-bold text-cyan-400">{right}</span>
    </button>
  );

  const groupAddonRow = (a: PricingAddon) => {
    const locked = a.requiresOption != null && a.requiresOption !== option;
    const active = groupChecked.includes(a.id);
    return (
      <button
        key={a.id}
        type="button"
        disabled={locked}
        onClick={() => toggleGroupAddon(a.id)}
        aria-pressed={active}
        className={`flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors ${
          locked ? 'cursor-not-allowed opacity-40' : 'hover:bg-navy-800'
        }`}
      >
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
            active ? 'border-cyan-600 bg-cyan-600 text-navy-900' : 'border-navy-600 text-transparent'
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-slate-300">{a.label}</span>
          {a.note && <span className="block text-[11px] leading-snug text-slate-500">{a.note}</span>}
        </span>
        <span className="text-xs font-bold text-cyan-400">+{format(a.price)}</span>
      </button>
    );
  };

  const pill = (label: string, Icon: LucideIcon, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2.5 transition-colors ${
        active
          ? 'border-navy-600 bg-navy-800 text-white cyan-glow'
          : 'border-navy-700/70 bg-navy-850 text-slate-400 hover:bg-navy-800 hover:text-white'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-400' : ''}`} />
      <span
        className={`text-[11px] font-semibold uppercase tracking-wider ${active ? 'text-cyan-400' : ''}`}
      >
        {label}
      </span>
    </button>
  );

  const methodPill = (id: 'solo' | 'group', label: string, Icon: LucideIcon) =>
    pill(label, Icon, method === id, () => switchMethod(id));

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
          {/* Boost method */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Boost Method</p>
            {hasGroup ? (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {methodPill('group', 'Group Play', Users)}
                {methodPill('solo', 'Solo Piloted', Armchair)}
              </div>
            ) : (
              <div className="mt-2.5 flex items-center justify-center gap-2 rounded-[5px] border border-navy-600 bg-navy-800 px-3 py-2.5 text-white cyan-glow">
                <Armchair className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Piloted</span>
              </div>
            )}
          </div>

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

          {/* Group play (Run Type) / Solo piloted (Additional Options) —
              switching cross-fades like the savage-raids tier/fight switch:
              both panels share one grid cell, the outgoing collapses slower
              (500ms) than the incoming expands (200ms), so the height never
              dips below the target */}
          {hasGroup ? (
            <div className="grid">
              <div
                className={`col-start-1 row-start-1 grid transition-all ease-soft ${
                  shown === 'group'
                    ? 'grid-rows-[1fr] duration-200'
                    : 'pointer-events-none grid-rows-[0fr] duration-500'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`transition-opacity duration-200 ${shown === 'group' && fadeIn ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <p className="pl-px text-sm font-semibold text-white">Run Type</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      {groupOptions.map((o) =>
                        pill(o.label, OPTION_ICONS[o.id] ?? Gem, option === o.id, () =>
                          selectOption(o.id),
                        ),
                      )}
                    </div>
                    {groupAddons.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">{groupAddons.map(groupAddonRow)}</div>
                    )}
                    {/* Optional multiplier (e.g. mount = 4 clears) below the run types */}
                    {groupMultiplier && (
                      <div className="mt-4">
                        <p className="mb-2 pl-px text-xs font-semibold text-slate-300">
                          {groupMultiplier.heading}
                        </p>
                        <button
                          type="button"
                          onClick={() => setMountOn((m) => !m)}
                          aria-pressed={mountOn}
                          className="flex w-full items-center gap-3 rounded-[5px] bg-navy-850 px-2.5 py-1.5 text-left transition-colors hover:bg-navy-800"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                              mountOn
                                ? 'border-cyan-600 bg-cyan-600 text-navy-900'
                                : 'border-navy-600 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3.5} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-slate-300">{groupMultiplier.label}</span>
                            {groupMultiplier.note && (
                              <span className="block text-[11px] leading-snug text-slate-500">
                                {groupMultiplier.note}
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-bold text-cyan-400">
                            {groupMultiplier.times * 100}%
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`col-start-1 row-start-1 grid transition-all ease-soft ${
                  shown === 'solo'
                    ? 'grid-rows-[1fr] duration-200'
                    : 'pointer-events-none grid-rows-[0fr] duration-500'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`transition-opacity duration-200 ${shown === 'solo' && fadeIn ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <p className="pl-px text-sm font-semibold text-white">Additional Options</p>
                    <div className="mt-2.5 space-y-1.5">
                      {soloAddons.map((a) =>
                        row(
                          a.id,
                          a.label,
                          a.timesBase ? `${a.timesBase * 100}%` : `+${format(a.price)}`,
                          checked.includes(a.id),
                          () => toggle(a.id),
                        ),
                      )}
                      {row('stream', 'Private Stream', `+${format(streamPrice)}`, stream, () =>
                        setStream((s) => !s),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            cfg && (
              <div>
                <p className="pl-px text-sm font-semibold text-white">Additional Options</p>
                <div className="mt-2.5 space-y-1.5">
                  {soloAddons.map((a) =>
                    row(
                      a.id,
                      a.label,
                      a.timesBase ? `${a.timesBase * 100}%` : `+${format(a.price)}`,
                      checked.includes(a.id),
                      () => toggle(a.id),
                    ),
                  )}
                  {row('stream', 'Private Stream', `+${format(streamPrice)}`, stream, () =>
                    setStream((s) => !s),
                  )}
                </div>
              </div>
            )
          )}
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
            Average Completion Time: {cfg?.completion ?? '5-7 Days'}
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
