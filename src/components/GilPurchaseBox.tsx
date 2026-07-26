import { useState } from 'react';
import { Clock } from 'lucide-react';
import FadeImage from './FadeImage';
import FieldPopup from './FieldPopup';
import { CustomSelect } from './PurchaseBox';
import { Slider } from '@/components/ui/slider';
import { usePurchaseFloat } from '@/hooks/usePurchaseFloat';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import type { Service } from '@/data/games';

const REGIONS: Record<string, { label: string; dcs: string[] }> = {
  NA: { label: 'North America', dcs: ['Aether', 'Crystal', 'Dynamis', 'Primal'] },
  EU: { label: 'Europe', dcs: ['Chaos', 'Light'] },
  JP: { label: 'Japan', dcs: ['Elemental', 'Gaia', 'Mana', 'Meteor'] },
  OCE: { label: 'Oceania', dcs: ['Materia'] },
};

const SERVERS_BY_DC: Record<string, string[]> = {
  Aether: ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
  Crystal: ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
  Dynamis: ['Cuchulainn', 'Golem', 'Halicarnassus', 'Kraken', 'Maduin', 'Marilith', 'Seraph'],
  Primal: ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
  Chaos: ['Cerberus', 'Louisoix', 'Moogle', 'Omega', 'Phantom', 'Ragnarok', 'Sagittarius', 'Spriggan'],
  Light: ['Alpha', 'Lich', 'Odin', 'Phoenix', 'Raiden', 'Shiva', 'Twintania', 'Zodiark'],
  Elemental: ['Adam', 'Aegis', 'Atomos', 'Carbuncle', 'Garuda', 'Gungnir', 'Kujata', 'Tonberry'],
  Gaia: ['Alexander', 'Bahamut', 'Durandal', 'Fenrir', 'Ifrit', 'Ridill', 'Tiamat', 'Ultima'],
  Mana: ['Anima', 'Asura', 'Chocobo', 'Hades', 'Ixion', 'Masamune', 'Pandemonium', 'Shinryu'],
  Meteor: ['Belias', 'Mandragora', 'Ramuh', 'Shinryu', 'Unicorn', 'Valefor', 'Yojimbo', 'Zeromus'],
  Materia: ['Bismarck', 'Ravana', 'Sephirot', 'Sophia', 'Zurvan'],
};

/** Amount bounds in millions of gil */
const MIN_M = 5;
const MAX_M = 900;
const CHIPS = [5, 10, 20, 50, 100, 200];

const fmt = (millions: number) => (millions * 1_000_000).toLocaleString('en-US');

/** FFXIV Gil purchase box: amount (input + slider + quick chips) with
    Region → Data Center → Server dropdowns, priced per million from the
    ffxiv-Gil database category. Shares the PurchaseBox look. */
export default function GilPurchaseBox({ service, gameShort }: { service: Service; gameShort: string }) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { db } = usePricing();
  const pricePerMillion = db.gil?.pricePerMillion ?? 0;
  // Same sticky/floating behavior as the ultimate purchase blocks
  const { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx } = usePurchaseFloat();

  const [millions, setMillions] = useState(5);
  const [inputValue, setInputValue] = useState(fmt(5));
  const [region, setRegion] = useState('');
  const [dc, setDc] = useState('');
  const [server, setServer] = useState('');
  const [regionError, setRegionError] = useState(false);
  const [dcError, setDcError] = useState(false);
  const [serverError, setServerError] = useState(false);

  const setAmount = (m: number) => {
    const clamped = Math.min(MAX_M, Math.max(MIN_M, m));
    setMillions(clamped);
    setInputValue(fmt(clamped));
  };

  const onInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      setInputValue('');
      return;
    }
    // Hard cap: anything past 900,000,000 snaps straight to it
    if (Number(digits) > MAX_M * 1_000_000) {
      setMillions(MAX_M);
      setInputValue(fmt(MAX_M));
      return;
    }
    const m = Math.max(MIN_M, Math.round(Number(digits) / 1_000_000));
    setInputValue(Number(digits).toLocaleString('en-US'));
    setMillions(m);
  };

  const onInputBlur = () => setInputValue(fmt(millions));

  const selectRegion = (i: number) => {
    setRegion(Object.keys(REGIONS)[i]);
    setDc('');
    setServer('');
    setRegionError(false);
  };
  const selectDc = (i: number) => {
    setDc(REGIONS[region].dcs[i]);
    setServer('');
    setDcError(false);
  };
  const selectServer = (i: number) => {
    setServer(SERVERS_BY_DC[dc][i]);
    setServerError(false);
  };

  const total = millions * pricePerMillion;

  const addToCart = () => {
    const missing = { region: !region, dc: !dc, server: !server };
    setRegionError(missing.region);
    setDcError(missing.dc);
    setServerError(missing.server);
    if (missing.region || missing.dc || missing.server) return;

    addItem(
      {
        ...service,
        id: `${service.id}::${region}|${dc}|${server}`,
        price: pricePerMillion, // per 1 M gil — qty is the amount in millions
      },
      gameShort,
      [`${fmt(millions)} Gil`, `Region: ${REGIONS[region].label}`, `Data Center: ${dc}`, `Server: ${server}`],
      millions,
    );
    openCart();
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
          {/* Currency amount */}
          <div>
            <p className="pl-px text-sm font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">Currency Amount</p>
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={onInputBlur}
              className="mt-2.5 h-10 w-full rounded-[5px] border border-navy-700/70 bg-navy-850 px-3.5 py-2 text-sm leading-none text-white outline-none transition-colors hover:border-navy-600 focus:border-navy-600"
              aria-label="Currency amount"
            />
            <div className="px-1 py-4">
              <Slider value={[millions]} onValueChange={([v]) => setAmount(v)} min={MIN_M} max={MAX_M} step={1} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {CHIPS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAmount(m)}
                  aria-pressed={millions === m}
                  className={`rounded-[5px] border px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                    millions === m
                      ? 'border-navy-600 bg-navy-800 text-cyan-400 cyan-glow'
                      : 'border-navy-700/70 bg-navy-850 text-slate-500 hover:border-navy-600 hover:text-slate-300'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Region <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={regionError ? 'Select a region first.' : ''} />
              <CustomSelect
                value={region ? REGIONS[region].label : ''}
                placeholder="Select Region"
                options={Object.values(REGIONS).map((r) => ({ label: r.label }))}
                onSelect={selectRegion}
                ariaLabel="Select region"
                invalid={regionError}
              />
            </div>
          </div>

          {/* Data Center */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Data Center <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={dcError ? 'Select a data center first.' : ''} />
              <CustomSelect
                value={dc}
                placeholder="Select Data Center"
                options={(region ? REGIONS[region].dcs : []).map((d) => ({ label: d }))}
                onSelect={selectDc}
                ariaLabel="Select data center"
                invalid={dcError}
                disabled={!region}
              />
            </div>
          </div>

          {/* Server */}
          <div>
            <p className="pl-px text-sm font-semibold text-white">
              Server <span className="text-xs font-normal text-slate-500">(required)</span>
            </p>
            <div className="relative mt-2.5">
              <FieldPopup message={serverError ? 'Select a server first.' : ''} />
              <CustomSelect
                value={server}
                placeholder="Select Server"
                options={(dc ? SERVERS_BY_DC[dc] : []).map((s) => ({ label: s }))}
                onSelect={selectServer}
                ariaLabel="Select server"
                invalid={serverError}
                disabled={!region || !dc}
              />
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
          Average Completion Time: 15 Minutes
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