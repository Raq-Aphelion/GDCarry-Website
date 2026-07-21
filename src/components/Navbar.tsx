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
import { allServices, games, serviceCount } from '@/data/games';
import { useCart } from '@/context/CartContext';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

const GAME_LOGOS: Record<string, { url: string; invert?: boolean }> = {
  ffxiv: {
    url: 'https://kimi-web-img.moonshot.cn/img/upload.wikimedia.org/e6d6a587b75e08fc443f4cf92dc8969621e7b60d.png',
    invert: true,
  },
  wow: {
    url: 'https://kimi-web-img.moonshot.cn/img/assets.stickpng.com/07d3ac86105f2666349c6325e0557af6bef19fe2.png',
  },
  'lost-ark': {
    url: 'https://kimi-web-img.moonshot.cn/img/cdn2.steamgriddb.com/be9b58413e9ae540b660000f8915e118d5bf5c84.png',
  },
  warframe: {
    url: 'https://kimi-web-img.moonshot.cn/img/cdn2.steamgriddb.com/22b4b149215ac40fb39c06c1d6a91190e38e0530.png',
  },
  runescape: {
    url: 'https://kimi-web-img.moonshot.cn/img/oldschool.runescape.wiki/3c1ced74ad8eeda4433c0e29d6151a2d156e5d40.png',
  },
};

const CURRENCIES: { c: Currency; symbol: string; label: string; icon: LucideIcon }[] = [
  { c: 'EUR', symbol: '€', label: 'Euro', icon: Euro },
  { c: 'USD', symbol: '$', label: 'US Dollar', icon: DollarSign },
];

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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) goToResult(results[0].game.id, results[0].subId);
        }}
        placeholder="Search boosts, games, categories…"
        className="h-[42px] w-full rounded-[3px] border border-navy-700/70 bg-navy-850/90 pl-10 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition-colors hover:border-navy-600 focus:border-navy-600"
        aria-label="Search services"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-navy-700/70 bg-navy-850 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3.5 text-sm text-slate-400">
              No boosts found for “<span className="text-white">{query.trim()}</span>”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1.5">
              {results.map((r) => (
                <li key={r.service.id}>
                  <button
                    onClick={() => goToResult(r.game.id, r.subId)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <img
                      src={r.service.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
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
          )}
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-screen pr-[calc(100vw-100%)] transition-all duration-500 ease-in-out ${
        scrolled || mobileOpen
          ? 'border-b border-navy-700/60 bg-navy-900/85 shadow-lg shadow-black/30 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
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
                ? 'bg-gradient-to-r from-navy-700 to-navy-800 text-gold-300'
                : 'bg-gradient-to-r from-navy-800 to-navy-850 text-white hover:from-navy-700 hover:to-navy-800 hover:text-gold-300'
            }`}
            aria-expanded={gamesOpen}
          >
            <Gamepad2 className="h-4 w-4" />
            Games
            <ChevronDown className={`h-3.5 w-3.5 text-gold-300/60 transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
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
                            src={g.image}
                            alt=""
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover/item:opacity-100"
                            loading="lazy"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                'linear-gradient(to right, rgba(10,18,40,0.45) 0%, rgba(10,18,40,0.45) calc(100% - 50px), #0a1228 100%)',
                            }}
                          />
                        </div>
                        <span className="relative z-10 flex shrink-0 items-center gap-2.5 pl-3 text-sm font-semibold text-white transition-colors group-hover/item:text-gold-300">
                          <span className="flex h-7 w-[92px] items-center justify-center px-3">
                            <img
                              src={GAME_LOGOS[g.id].url}
                              alt=""
                              className={`max-h-7 w-auto object-contain ${GAME_LOGOS[g.id].invert ? 'invert' : ''}`}
                              loading="lazy"
                            />
                          </span>
                          {g.name}
                        </span>
                        <span className="relative z-10 min-w-0 flex-1 truncate px-6 text-xs text-slate-400">
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
                  ? 'border-navy-600 bg-gradient-to-r from-navy-700 to-navy-800 text-gold-300'
                  : 'border-navy-700/70 bg-navy-850/90 text-slate-300 hover:border-navy-600 hover:text-gold-300 lg:bg-gradient-to-r lg:from-navy-800 lg:to-navy-850 lg:text-white lg:hover:from-navy-700 lg:hover:to-navy-800 lg:hover:text-gold-300'
              }`}
              aria-expanded={currencyOpen}
              aria-label="Change currency"
            >
              <activeCurrency.icon className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">{activeCurrency.c}</span>
              <ChevronDown className={`hidden h-3.5 w-3.5 text-gold-300/60 transition-transform lg:block ${currencyOpen ? 'rotate-180' : ''}`} />
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
                      {currency === o.c && <Check className="h-3.5 w-3.5 text-gold-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-[3px] border border-navy-700/70 bg-navy-850/90 text-slate-300 transition-all hover:border-navy-600 hover:text-gold-300"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-navy-900 gold-glow">
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
        <div className="space-y-1.5 border-t border-navy-700/60 bg-navy-900/95 px-4 py-4 backdrop-blur-xl">
          <div className="pb-2">{searchBox}</div>
          <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Games</p>
          {games.map((g) => (
            <NavLink
              key={g.id}
              to={`/boosting/${g.id}`}
              className={({ isActive }) =>
                `group/item relative flex h-16 items-center overflow-hidden rounded-[3px] ${
                  isActive ? 'ring-1 ring-gold-500/40' : ''
                }`
              }
            >
              {/* Background image fading into the menu surface, like the desktop dropdown */}
              <div className="absolute inset-y-0 left-0 w-[75%]">
                <img
                  src={g.image}
                  alt=""
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover/item:opacity-100"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(7,13,33,0.45) 0%, rgba(7,13,33,0.45) 55%, rgba(7,13,33,1) 100%)',
                  }}
                />
              </div>
              <span className="relative z-10 flex shrink-0 items-center gap-2.5 pl-3 text-sm font-semibold text-white transition-colors group-hover/item:text-gold-300">
                <span className="flex h-7 w-[92px] items-center justify-center px-3">
                  <img
                    src={GAME_LOGOS[g.id].url}
                    alt=""
                    className={`max-h-7 w-auto object-contain ${GAME_LOGOS[g.id].invert ? 'invert' : ''}`}
                    loading="lazy"
                  />
                </span>
                {g.name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
