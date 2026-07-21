import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import {
  Check,
  ChevronDown,
  DollarSign,
  Euro,
  Gamepad2,
  Menu,
  Search,
  ShoppingCart,
  X,
  type LucideIcon,
} from 'lucide-react';
import DiceLogo from './DiceLogo';
import { OverlayScrollbar } from './Scrollbar';
import { allServices, games, serviceCount, type ServiceSearchResult } from '@/data/games';
import { useCart } from '@/context/CartContext';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

import logoFfxiv from '@/assets/images/game-logos/ffxiv.png';
import logoWow from '@/assets/images/game-logos/wow.png';
import logoLostArk from '@/assets/images/game-logos/lost-ark.png';
import logoWarframe from '@/assets/images/game-logos/warframe.png';
import logoRunescape from '@/assets/images/game-logos/runescape.webp';

const GAME_LOGOS: Record<string, { url: string; invert?: boolean; scale?: string }> = {
  ffxiv: { url: logoFfxiv, invert: true },
  wow: { url: logoWow, scale: 'scale-125' },
  'lost-ark': { url: logoLostArk, scale: 'scale-[0.85]' },
  warframe: { url: logoWarframe },
  runescape: { url: logoRunescape, scale: 'scale-[1.4]' },
};

const CURRENCIES: { c: Currency; symbol: string; label: string; icon: LucideIcon }[] = [
  { c: 'EUR', symbol: '€', label: 'Euro', icon: Euro },
  { c: 'USD', symbol: '$', label: 'US Dollar', icon: DollarSign },
];

/** Search input + results dropdown. Rendered twice (desktop nav and mobile
    menu), so it's a real component: each instance needs its own dropdown
    scrollbar state — a shared ref would point at the hidden instance. */
function SearchBox({
  query,
  results,
  showResults,
  onQueryChange,
  onFocus,
  onGoResult,
}: {
  query: string;
  results: ServiceSearchResult[];
  showResults: boolean;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onGoResult: (gameId: string, subId: string) => void;
}) {
  const [listEl, setListEl] = useState<HTMLElement | null>(null);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) onGoResult(results[0].game.id, results[0].subId);
        }}
        placeholder="Search boosts, games, categories…"
        className="h-[42px] w-full rounded-[3px] border border-navy-700/70 bg-navy-850/90 pl-10 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition-colors hover:border-navy-600 focus:border-navy-600"
        aria-label="Search services"
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[3px] p-1 text-slate-500 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showResults && (
        // 1px wider than the searchbox on mobile so it covers the active game item's ring below
        <div className="absolute -left-px -right-px top-full z-30 mt-2 overflow-hidden rounded-[3px] border border-navy-700/70 bg-navy-850 shadow-2xl lg:left-0 lg:right-0">
          {results.length === 0 ? (
            <p className="px-4 py-3.5 text-sm text-slate-400">
              No boosts found for “<span className="text-white">{query.trim()}</span>”.
            </p>
          ) : (
            <>
              <ul ref={setListEl} className="no-scrollbar max-h-80 overflow-y-auto py-1.5">
                {results.map((r) => (
                  <li key={r.service.id}>
                    <button
                      onClick={() => onGoResult(r.game.id, r.subId)}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      <img
                        src={r.service.image}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-[3px] object-cover object-top"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{r.service.name}</span>
                        <span className="block truncate text-xs text-slate-400">
                          {r.game.short} · {r.subName}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {/* Same overlay scrollbar as the page/cart — appears only when results overflow */}
              <OverlayScrollbar
                scroller={listEl}
                className="absolute bottom-1.5 right-1 top-1.5 w-2"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const gamesBtnRef = useRef<HTMLButtonElement>(null);
  const [titlePad, setTitlePad] = useState(140);
  const { count, openCart } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scroller = document.getElementById('page-scroll');
    if (!scroller) return;
    const onScroll = () => setScrolled(scroller.scrollTop > 12);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setGamesOpen(false);
    setCurrencyOpen(false);
    setQuery('');
  }, [location.pathname, location.search]);

  // Align dropdown game titles with the searchbar's icon column
  useEffect(() => {
    if (gamesOpen && gamesBtnRef.current) {
      setTitlePad(gamesBtnRef.current.offsetWidth + 12 + 14);
    }
  }, [gamesOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return allServices
      .filter(
        (r) =>
          r.service.name.toLowerCase().includes(q) ||
          r.game.name.toLowerCase().includes(q) ||
          r.subName.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query]);

  const showResults = searchFocused && query.trim().length >= 2;

  const goToResult = (gameId: string, subId: string) => {
    setQuery('');
    setSearchFocused(false);
    setMobileOpen(false);
    navigate(`/boosting/${gameId}?cat=${subId}`);
  };

  const pickCurrency = (c: Currency, label: string) => {
    setCurrencyOpen(false);
    if (c !== currency) {
      setCurrency(c);
      toast({ title: `Currency: ${label}`, description: 'All prices converted site-wide.', variant: 'cyan' });
    }
  };

  const activeCurrency = CURRENCIES.find((o) => o.c === currency)!;

  const searchBox = (
    <SearchBox
      query={query}
      results={results}
      showResults={showResults}
      onQueryChange={setQuery}
      onFocus={() => setSearchFocused(true)}
      onGoResult={goToResult}
    />
  );

  return (
    <header
      className={`sticky top-0 z-50 w-screen pr-[calc(100vw-100%)] transition-all duration-500 ease-in-out ${
        scrolled || mobileOpen
          ? 'border-b border-navy-700/60 bg-navy-900/85 shadow-lg shadow-black/30 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-[25px] sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="group mr-1 flex shrink-0 items-center gap-2.5 lg:mr-4">
          <DiceLogo size={36} className="transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            GD <span className="text-gradient-cyan">Carry</span>
          </span>
        </Link>

        {/* Games dropdown + search (desktop) — shared wrapper so the dropdown spans both */}
        <div className="relative hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <button
            ref={gamesBtnRef}
            onClick={() => {
              setGamesOpen((v) => !v);
              setCurrencyOpen(false);
            }}
            className={`flex h-[42px] shrink-0 items-center gap-2 rounded-[3px] px-3.5 text-sm font-semibold transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/25 ${
              gamesOpen
                ? 'bg-gradient-to-r from-navy-700 to-navy-800 text-cyan-400'
                : 'bg-gradient-to-r from-navy-800 to-navy-850 text-white hover:from-navy-700 hover:to-navy-800 hover:text-cyan-400'
            }`}
            aria-expanded={gamesOpen}
          >
            <Gamepad2 className="h-4 w-4" />
            Games
            <ChevronDown className={`h-3.5 w-3.5 text-cyan-400/60 transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
          </button>

          {searchBox}

          {gamesOpen && (
            <>
              <button
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close games menu"
                onClick={() => setGamesOpen(false)}
              />
              <div className="dropdown-in absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[3px] border border-navy-700/70 bg-navy-850 shadow-2xl">
                <ul className="p-1.5">
                  {games.map((g) => {
                    return (
                    <li key={g.id}>
                      <Link
                        to={`/boosting/${g.id}`}
                        className="group/item relative flex h-16 items-center overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0" style={{ width: titlePad + 50 }}>
                          <img
                            src={g.cardImage}
                            alt=""
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover/item:opacity-100"
                            loading="lazy"
                          />
                          {/* Navy veil over the art: stronger at the edges, dimmer in the
                              middle but enough to keep the logo readable */}
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                'linear-gradient(to right, rgb(var(--navy-850) / 0.7) 0%, rgb(var(--navy-850) / 0.45) 50%, rgb(var(--navy-850) / 0.7) 100%)',
                            }}
                          />
                          {/* Game logo centered on the art */}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <img
                              src={GAME_LOGOS[g.id].url}
                              alt=""
                              className={`max-h-7 w-auto max-w-[92px] object-contain ${GAME_LOGOS[g.id].invert ? 'invert' : ''} ${GAME_LOGOS[g.id].scale ?? ''}`}
                              loading="lazy"
                            />
                          </span>
                        </div>
                        <span
                          className="relative z-10 flex shrink-0 items-center gap-[22px] pl-5 text-sm font-semibold text-white transition-colors group-hover/item:text-cyan-400"
                          style={{ marginLeft: titlePad + 56 }}
                        >
                          {/* Diamond marker guiding from the art to the title — same motif as the service card bullets */}
                          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-500" aria-hidden />
                          {g.name}
                        </span>
                        <span className="relative z-10 min-w-0 flex-1 truncate px-6 text-xs text-slate-600">
                          {g.subcategories.map((s) => s.name).join(' • ')}
                        </span>
                        <span className="relative z-10 shrink-0 pr-3 text-xs text-slate-400">
                          {serviceCount(g)} services
                        </span>
                      </Link>
                    </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="relative ml-auto flex shrink-0 items-center gap-3 lg:static lg:ml-0">
          {/* Currency dropdown */}
          <div className="lg:relative">
            <button
              onClick={() => {
                setCurrencyOpen((v) => !v);
                setGamesOpen(false);
              }}
              className={`flex h-[42px] w-[42px] items-center justify-center gap-2 rounded-[3px] border text-sm font-semibold transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/25 lg:w-[94px] lg:border-0 lg:px-2.5 ${
                currencyOpen
                  ? 'border-navy-600 bg-gradient-to-r from-navy-700 to-navy-800 text-cyan-400'
                  : 'border-navy-700/70 bg-navy-850/90 text-slate-300 hover:border-navy-600 hover:text-cyan-400 lg:bg-gradient-to-r lg:from-navy-800 lg:to-navy-850 lg:text-white lg:hover:from-navy-700 lg:hover:to-navy-800 lg:hover:text-cyan-400'
              }`}
              aria-expanded={currencyOpen}
              aria-label="Change currency"
            >
              <activeCurrency.icon className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">{activeCurrency.c}</span>
              <ChevronDown className={`hidden h-3.5 w-3.5 text-cyan-400/60 transition-transform lg:block ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>
            {currencyOpen && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close currency menu"
                  onClick={() => setCurrencyOpen(false)}
                />
                <div className="dropdown-in absolute right-0 z-20 mt-2 w-[150px] overflow-hidden rounded-[3px] border border-navy-700/70 bg-navy-850 shadow-2xl lg:left-0 lg:right-0 lg:w-auto">
                  {CURRENCIES.map((o) => (
                    <button
                      key={o.c}
                      onClick={() => pickCurrency(o.c, o.label)}
                      className="flex w-full items-center justify-between px-2.5 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/5"
                    >
                      <span className="flex items-center gap-2">
                        <o.icon className="h-4 w-4" />
                        <span className="font-semibold">{o.c}</span>
                      </span>
                      {currency === o.c && <Check className="h-3.5 w-3.5 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-[3px] border border-navy-700/70 bg-navy-850/90 text-slate-300 transition-all hover:border-navy-600 hover:text-cyan-400"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-600 px-1 text-[11px] font-bold text-navy-900 glow">
                {count}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-[3px] border border-navy-700/70 bg-navy-850/80 p-2.5 text-slate-300 transition-colors hover:text-white lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'max-h-[560px]' : 'max-h-0'
        }`}
      >
        <div className="space-y-1.5 border-t border-navy-700/60 bg-navy-900/95 px-[25px] py-4 backdrop-blur-xl">
          <div className="pb-2">{searchBox}</div>
          <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Games</p>
          {games.map((g) => (
            <NavLink
              key={g.id}
              to={`/boosting/${g.id}`}
              className={({ isActive }) =>
                `group/item relative flex h-16 items-center overflow-hidden rounded-[3px] ${
                  isActive ? 'ring-1 ring-cyan-600/40' : ''
                }`
              }
            >
              {/* Background image fading into the menu surface, like the desktop dropdown */}
              <div className="absolute inset-y-0 left-0 w-[75%]">
                <img
                  src={g.cardImage}
                  alt=""
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover/item:opacity-100"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to right, rgb(var(--navy-900) / 0.45) 0%, rgb(var(--navy-900) / 0.45) 55%, rgb(var(--navy-900)) 100%)',
                  }}
                />
              </div>
              <span className="relative z-10 flex shrink-0 items-center gap-2.5 pl-3 text-sm font-semibold text-white transition-colors group-hover/item:text-cyan-400">
                <span className="flex h-7 w-[92px] items-center justify-center px-3">
                  <img
                    src={GAME_LOGOS[g.id].url}
                    alt=""
                    className={`max-h-7 w-auto object-contain ${GAME_LOGOS[g.id].invert ? 'invert' : ''} ${GAME_LOGOS[g.id].scale ?? ''}`}
                    loading="lazy"
                  />
                </span>
                {g.name}
              </span>
              <span className="relative z-10 ml-auto mr-4 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-navy-800/80 px-1.5 text-[10px] font-bold text-slate-300">
                {serviceCount(g)}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
