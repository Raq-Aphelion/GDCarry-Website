import { Fragment, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { ArrowDown, ArrowDownAZ, ArrowUp, ArrowUpZA, Ban, Building, Castle, Check, ChevronDown, ChevronRight, CircleDot, ClockArrowDown, ClockArrowUp, Flame, Globe, House, Layers, MapPin, Package, Star, Swords, TrendingUp, type LucideIcon } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import FadeImage from '@/components/FadeImage';
import MobileCategoryBar from '@/components/MobileCategoryBar';
import Reveal from '@/components/Reveal';
import { OverlayScrollbar } from '@/components/Scrollbar';
import PageMeta from '@/components/PageMeta';
import ServiceCard from '@/components/ServiceCard';
import { getGame, POPULAR_ORDER, serviceCount, type Service } from '@/data/games';
import { lenisRef } from '@/lib/lenis';
import { useSmoothScroller } from '@/hooks/useSmoothScroller';
import { usePricing } from '@/context/PricingContext';
import { rankService } from '@/data/search';
import ffxivBg from '@/assets/images/backgrounds/ffxiv-bg-1.webp';
import wowBg from '@/assets/images/backgrounds/wow-bg.jpg';
import lostArkBg from '@/assets/images/backgrounds/lostark-bg.webp';
import warframeBg from '@/assets/images/backgrounds/warframe-bg.webp';
import runescapeBg from '@/assets/images/backgrounds/osrs-bg.webp';

/** Hero background per game; falls back to the card art if none is defined. */
const GAME_BG: Record<string, string> = {
  ffxiv: ffxivBg,
  wow: wowBg,
  'lost-ark': lostArkBg,
  warframe: warframeBg,
  runescape: runescapeBg,
};

/** Sort modes. 'popular' = the curated POPULAR_ORDER (All services) / search
    rank (search results); 'category' = category-grouped (All services /
    search) or plain catalog order (single category — its default).
    'newest'/'oldest' are Accounts-only (account listings by recency). */
type SortId = 'popular' | 'price-asc' | 'price-desc' | 'name-az' | 'name-za' | 'category' | 'newest' | 'oldest';

const SORT_OPTIONS: { id: SortId; label: string; arrow?: string; Icon: LucideIcon }[] = [
  { id: 'popular', label: 'Most Popular', Icon: Flame },
  { id: 'price-asc', label: 'Price', arrow: '↑', Icon: ArrowUp },
  { id: 'price-desc', label: 'Price', arrow: '↓', Icon: ArrowDown },
  { id: 'name-az', label: 'Name (A-Z)', arrow: '↓', Icon: ArrowDownAZ },
  { id: 'name-za', label: 'Name (Z-A)', arrow: '↑', Icon: ArrowUpZA },
  { id: 'category', label: 'By Category', Icon: Layers },
];

/** Single categories have no "Most Popular" — their default (top option) is
    "By Category" = the catalog order */
const CATEGORY_SORT_OPTIONS = [
  SORT_OPTIONS.find((o) => o.id === 'category')!,
  ...SORT_OPTIONS.filter((o) => o.id !== 'popular' && o.id !== 'category'),
];

/** Accounts category: "By Category" replaced by recency — Newest is the
    default (top option); name sorts are dropped, price sorts stay. Sorts by
    the listing's Service.account.addedAt; listings without a date trail. */
const ACCOUNT_SORT_OPTIONS: typeof SORT_OPTIONS = [
  { id: 'newest', label: 'Newest', Icon: ClockArrowDown },
  { id: 'oldest', label: 'Oldest', Icon: ClockArrowUp },
  ...SORT_OPTIONS.filter((o) => o.id === 'price-asc' || o.id === 'price-desc'),
];

interface FilterDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  options: { id: string; label: string; Icon: LucideIcon }[];
}

/** Accounts-only listing filters, shown next to the sort dropdown. They
    filter on the Service.account metadata (region/levels/housing); listings
    without it only show while every filter is at its default. The first
    option of each filter is the default. */
const ACCOUNT_FILTERS: FilterDef[] = [
  {
    id: 'region',
    label: 'Region',
    Icon: Globe,
    options: [
      { id: 'all', label: 'All', Icon: Globe },
      { id: 'us', label: 'US', Icon: MapPin },
      { id: 'eu', label: 'EU', Icon: MapPin },
      { id: 'oc', label: 'OC', Icon: MapPin },
      { id: 'jp', label: 'JP', Icon: MapPin },
    ],
  },
  {
    id: 'levels',
    label: 'Levels',
    Icon: TrendingUp,
    options: [
      { id: 'any', label: 'Any', Icon: TrendingUp },
      { id: 'combat-max', label: 'All Combat Jobs Max', Icon: Swords },
      { id: 'all-max', label: 'All Jobs Max', Icon: Star },
    ],
  },
  {
    id: 'housing',
    label: 'Housing',
    Icon: House,
    options: [
      { id: 'any', label: 'Any', Icon: CircleDot },
      { id: 'none', label: 'None', Icon: Ban },
      { id: 'small', label: 'Small House', Icon: House },
      { id: 'medium', label: 'Medium House', Icon: Building },
      { id: 'large', label: 'Large House', Icon: Castle },
    ],
  },
];

/** Rank of each service in the curated Most Popular order (unlisted = last) */
const popularRank = new Map(POPULAR_ORDER.map((id, i) => [id, i]));

/** Sort dropdown trigger icon: three bars, longest on top, shortest at the bottom */
const SortIcon = () => (
  <span className="flex flex-col items-start justify-center gap-[3px]" aria-hidden>
    <span className="h-[1.5px] w-4 rounded-full bg-current" />
    <span className="h-[1.5px] w-[11px] rounded-full bg-current" />
    <span className="h-[1.5px] w-[6px] rounded-full bg-current" />
  </span>
);

/** Keeps an open dropdown menu inside the viewport horizontally: menus are
    right-aligned to their trigger, so on mobile a trigger near the left edge
    would push the menu off-screen — shift it right just enough (8px margin).
    Written straight to the DOM in a layout effect: no re-render, no flash. */
function useMenuClamp(open: boolean) {
  const menuRef = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    const r = menu.getBoundingClientRect();
    if (r.left < 8) menu.style.right = `${r.left - 8}px`;
  }, [open]);
  return menuRef;
}

/** Generic label-row dropdown (the Accounts listing filters) — same look and
    behavior as the sort dropdown. The trigger shows the filter's name while
    the default option is selected, just the chosen value once a real one is
    picked. Outside-click close uses the same pointerdown pattern as the sort
    dropdown (a fixed click-away layer won't work here — the header's Reveal
    keeps a transform, which would trap position:fixed inside the header box). */
function LabelDropdown({
  def,
  value,
  onChange,
}: {
  def: FilterDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const menuRef = useMenuClamp(open);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const cur = def.options.find((o) => o.id === value) ?? def.options[0];
  const isDefault = cur.id === def.options[0].id;
  const TriggerIcon = def.Icon;
  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex cursor-pointer items-center gap-2 rounded-[3px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
          open || !isDefault
            ? 'border-cyan-500/60 bg-navy-800 text-cyan-400'
            : 'border-navy-700/70 bg-navy-850 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400'
        }`}
      >
        <TriggerIcon className="h-3.5 w-3.5 text-cyan-400/70" />
        {isDefault ? def.label : cur.label}
        <ChevronDown className={`h-3 w-3 text-cyan-400/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          ref={menuRef}
          className="dropdown-in absolute right-0 top-full z-20 mt-2 w-auto min-w-36 rounded-[3px] border border-navy-700/70 bg-navy-850 p-1.5 shadow-2xl"
        >
          {def.options.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
                aria-pressed={value === id}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-xs transition-colors ${
                  value === id
                    ? 'bg-navy-800 font-semibold text-cyan-400'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${value === id ? 'text-cyan-400' : 'text-cyan-500/70'}`} />
                {label}
                {value === id && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-cyan-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CatInfo {
  name: string;
  subId: string;
  order: number;
}

/** The card grid. Memoized with stable inputs (memoized services/catInfo from
    GamePage), so sticky-chips toggles and other header state changes bail out
    here instead of re-rendering every card — the mobile hide/show hitch on
    long categories (All services, Mounts) was exactly that re-render. */
const ServicesGrid = memo(function ServicesGrid({
  services,
  withCtas,
  activeCount,
  showPills,
  catInfo,
  gameId,
}: {
  services: Service[];
  withCtas: boolean;
  activeCount: number;
  showPills: boolean;
  catInfo: Map<string, CatInfo>;
  gameId: string;
}) {
  return (
    /* 2 per row from mobile up; md 3 — below lg the sidebar becomes the
       carousel, so the full row fits 3 cards; lg keeps 3 (sidebar takes
       240px, 4 would squeeze cards to ~155px); xl 4 — cards cap at 280px
       and never drop below ~213px */
    <div className="mt-5 grid grid-cols-1 justify-items-center gap-5 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {services.map((service, i) => {
        // Category pill — All services view only; links to that category
        const cat = showPills ? catInfo.get(service.id) : undefined;
        return (
        <Fragment key={service.id}>
          {/* Cards cap at 280px (ServiceCard max-w) — centered in their
              cells like the home page's popular picks, so extra row width
              becomes even outer margins. No `immediate`: the reveal is
              viewport-gated so long grids (All services, 100+ cards) don't
              fire a transition per card on mount — off-screen cards animate
              when scrolled into view instead */}
          <Reveal className="w-full max-w-[280px]">
            <ServiceCard
              service={service}
              categoryLabel={cat?.name}
              categoryHref={cat ? `/boosting/${gameId}?cat=${cat.subId}` : undefined}
            />
          </Reveal>
          {/* Inline custom-order CTA on mobile: only in categories with
              more than 7 card rows (7+ services at 1 col). Below 400px
              (1 col) it follows the 2nd card; at 2 cols it follows the
              4th card and spans both columns — 2 full rows above it in
              either case */}
          {withCtas && activeCount > 7 && i === 1 && (
            <div className="mx-auto w-full max-w-[280px] min-[400px]:hidden">
              <CustomOrderCta compact />
            </div>
          )}
          {withCtas && activeCount > 7 && i === 3 && (
            <div className="hidden w-full min-[400px]:col-span-2 min-[400px]:block sm:hidden">
              <CustomOrderCta compact />
            </div>
          )}
        </Fragment>
        );
      })}
      {/* Desktop grid-breaker: only in categories with more than 3 card
          rows (12+ services at 4 cols), pinned to row 3 so exactly 2
          rows of cards sit above it */}
      {withCtas && activeCount > 12 && (
        <div className="hidden w-full sm:col-span-2 sm:row-start-3 sm:block md:col-span-3 xl:col-span-4">
          <CustomOrderCta lateTextBreak />
        </div>
      )}
    </div>
  );
});

/** Shared game page core — rendered by the per-game wrappers in this folder
    (GamePageFFXIV, GamePageWoW, ...), one per explicit /boosting/:gameId
    route. `gameId` comes from the wrapper, not the URL. */
export default function GamePageCore({ gameId }: { gameId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { db, priceOf } = usePricing();
  const game = getGame(gameId);
  const catParam = searchParams.get('cat');
  // Sort dropdown state — options depend on the view (All services/search get
  // "Most Popular"; single categories default to "By Category" = catalog
  // order; Accounts defaults to "Newest")
  const [sort, setSort] = useState<SortId>('popular');
  const [sortOpen, setSortOpen] = useState(false);
  const sortBoxRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useMenuClamp(sortOpen);
  // Accounts listing filters — filter on the Service.account metadata
  // (see ACCOUNT_FILTERS)
  const [accountFilters, setAccountFilters] = useState<Record<string, string>>(() =>
    Object.fromEntries(ACCOUNT_FILTERS.map((f) => [f.id, f.options[0].id])),
  );

  // Mobile choreography with the category chips bar: the bar hides once the
  // label row is about to stick (and only while scrolling down); any scroll
  // up brings it back. The label's sticky container reserves the bar's height
  // with padding-top — collapsing that padding (a transitioned layout
  // property, not a transform, so the overlay's fixed background keeps its
  // viewport alignment) slides the label in sync with the bar. The fade
  // overlay only appears once the row is stuck, so there is no gradient
  // block at all while the chips are present at the top of the page.
  const [chipsHidden, setChipsHidden] = useState(false);
  const [labelStuck, setLabelStuck] = useState(false);
  const labelSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = document.getElementById('page-scroll');
    if (!scroller) return;
    let last = scroller.scrollTop;
    const update = () => {
      const sentinel = labelSentinelRef.current;
      if (!sentinel) return;
      const y = scroller.scrollTop;
      const delta = sentinel.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      // The container's box top sits one bar-height above the sentinel
      // (-mt-[58px]), so the row is stuck once the sentinel comes within 58px
      setLabelStuck(delta <= 58);
      if (window.matchMedia('(max-width: 1023px)').matches && Math.abs(y - last) >= 4) {
        // Hide only when the label is about to stick (24px lookahead); any
        // scroll up brings the chips back
        if (y > last && delta <= 82) setChipsHidden(true);
        else if (y < last) setChipsHidden(false);
      }
      last = y;
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Collapse the sort dropdown on any click outside of it (a fixed click-away
  // layer won't work here — the header's Reveal keeps a transform, which would
  // trap position:fixed inside the header box)
  useEffect(() => {
    if (!sortOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!sortBoxRef.current?.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [sortOpen]);

  const validCat = (id: string | null) =>
    id && game?.subcategories.some((s) => s.id === id) ? id : null;

  const [active, setActive] = useState<string>(
    () => validCat(catParam) ?? game?.subcategories[0]?.id ?? '',
  );
  // Ref for the desktop category list scroller: drives the overlay scrollbar
  // mirror and the sidebar's own Lenis instance (same smooth scroll as the page)
  const [catListEl, setCatListEl] = useState<HTMLDivElement | null>(null);
  useSmoothScroller(catListEl);
  // True only while the category list actually overflows — drives the inset
  // that keeps the buttons clear of the overlay scrollbar pill
  const [catOverflows, setCatOverflows] = useState(false);
  // The services grid section — smooth-scroll target on category change
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  // Last category the scroll effect saw — initialized to the opening category
  // so first paint never counts as a "change"
  const prevActive = useRef(active);
  // Collapsed mount/trial sections, keyed by section title
  const [collapsedSections, setCollapsedSections] = useState<ReadonlySet<string>>(new Set());
  const toggleSection = (title: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  // Follow ?cat= changes (e.g. navbar search) and reset when switching games
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs state from the URL (external system)
    setActive(validCat(catParam) ?? game?.subcategories[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, catParam]);

  // Category selection also pushes ?cat= into the URL, so the browser
  // back/forward buttons walk the category history. Switching categories
  // always clears a search-results view (?q=).
  const selectCategory = (id: string) => {
    if (id === active && !searchParams.get('q')) return;
    setActive(id);
    setSortOpen(false);
    setSearchParams({ cat: id });
  };

  // On category change, jump so the grid's top edge (where the header
  // background ends and the content segment starts) lands right below the
  // navbar — on mobile, below the sticky category chips bar instead. The
  // page length changes instantly with the category, so the scroll is an
  // instant jump too — a smooth scroll can't survive the scroll range
  // collapsing mid-animation, and the browser's scrollTop clamp would
  // flash for a frame. useLayoutEffect jumps before the paint.
  // Only scrolls when the category actually CHANGES: prevActive starts at
  // the opening category (no scroll on first open), and switching games
  // remounts this core via a different wrapper — ScrollToTop owns the
  // scroll position there, so a fresh mount never lands here mid-transition.
  useLayoutEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    const el = gridRef.current;
    const scroller = document.getElementById('page-scroll');
    if (!el || !scroller) return;
    // No jump while the hero is still in view — the grid is right below it,
    // so snapping would barely move the page and just yank the scroll
    const hero = heroRef.current;
    if (hero && hero.getBoundingClientRect().bottom > scroller.getBoundingClientRect().top) return;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    const bar = document.getElementById('mobile-category-bar');
    let top =
      el.getBoundingClientRect().top + scroller.scrollTop - scroller.getBoundingClientRect().top;
    if (isMobile && bar) {
      top -= bar.getBoundingClientRect().height;
    } else {
      // Desktop: land exactly where the category sidebar becomes sticky
      // (top-8 = 32px) — the aside is the section's first child, so its
      // natural top = section top + the section's padding-top
      top += parseFloat(getComputedStyle(el).paddingTop) - 32;
    }
    // Jump through Lenis when it's running so its internal scroll state
    // stays in sync and doesn't animate back to the stale position
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else scroller.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
  }, [active]);

  useEffect(() => {
    if (!catListEl) return;
    const check = () => setCatOverflows(catListEl.scrollHeight > catListEl.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(catListEl);
    Array.from(catListEl.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [catListEl]);

  const activeSub = game?.subcategories.find((s) => s.id === active) ?? game?.subcategories[0];
  // Proxy cards (e.g. Current Patch): duplicates of services from other
  // subcategories — resolved by id so counts never double them.
  // Memoized (like the chain below): the chips hide/show toggle re-renders
  // the page, and stable references let the memoized grid bail out entirely
  // instead of re-rendering every card
  const activeServices = useMemo(() => {
    if (!game || !activeSub) return [];
    return [
      ...activeSub.services,
      ...(activeSub.proxies ?? [])
        .map((id) => {
          for (const s of game.subcategories) {
            const hit = s.services.find((sv) => sv.id === id);
            if (hit) return hit;
          }
          return undefined;
        })
        .filter((sv): sv is NonNullable<typeof sv> => sv !== undefined),
    ];
  }, [activeSub, game]);

  // Category lookup for the pill/sort: first real category wins for services
  // listed in several (the synthetic 'all' bucket is skipped)
  const isAll = activeSub?.id === 'all';
  const catInfo = useMemo(() => {
    const map = new Map<string, { name: string; subId: string; order: number }>();
    game?.subcategories.forEach((s, i) => {
      if (s.id === 'all') return;
      for (const sv of s.services) {
        if (!map.has(sv.id)) map.set(sv.id, { name: s.name, subId: s.id, order: i });
      }
    });
    return map;
  }, [game]);

  // Search-results mode (?q=keyword from the navbar search): a flat grid of
  // every matching service in the game, ranked like the dropdown. Changing
  // category or page drops the param, clearing the search view.
  const searchQ = (searchParams.get('q') ?? '').trim();
  const searchResults = useMemo(
    () =>
      game && searchQ.length >= 1
        ? [
            ...new Map(
              game.subcategories
                .filter((s) => s.id !== 'all')
                .flatMap((s) => s.services)
                .map((sv) => [sv.id, sv] as const),
            ).values(),
          ]
            .map((sv) => ({ sv, rank: rankService(sv, searchQ.toLowerCase()) }))
            .filter((r) => r.rank >= 0)
            .sort((a, b) => a.rank - b.rank)
            .map((r) => r.sv)
        : null,
    [game, searchQ],
  );

  // Sort dropdown options per view: All services and search results get
  // "Most Popular"; single categories default to "By Category" (catalog
  // order); Accounts swaps "By Category" for "Newest"/"Oldest".
  // A sort picked in one view falls back to the next view's default.
  const inSearch = searchResults !== null;
  const isAccounts = activeSub?.id === 'accounts';
  const sortOptions = isAccounts
    ? ACCOUNT_SORT_OPTIONS
    : inSearch || isAll
      ? SORT_OPTIONS
      : CATEGORY_SORT_OPTIONS;
  const effSort = sortOptions.some((o) => o.id === sort) ? sort : sortOptions[0].id;

  // The grid in its current sort. Defaults pass the natural order through:
  // search rank for search results, catalog order for single categories.
  // Array.sort is stable, so ties keep the incoming order.
  // Accounts: the listing filters (Region/Levels/Housing) apply first.
  const accountFiltersDefault =
    accountFilters.region === 'all' && accountFilters.levels === 'any' && accountFilters.housing === 'any';
  const gridServices = useMemo(() => {
    const base = searchResults ?? activeServices;
    const filtered =
      isAccounts && !inSearch && !accountFiltersDefault
        ? base.filter((sv) => {
            const a = sv.account;
            if (!a) return false; // unlabeled listings only show at default filters
            if (accountFilters.region !== 'all' && a.region !== accountFilters.region) return false;
            // 'combat-max' also matches 'all-max' listings (a superset), so
            // only the 'all-max' filter can actually exclude a listing
            if (accountFilters.levels === 'all-max' && a.levels !== 'all-max') return false;
            if (accountFilters.housing !== 'any' && a.housing !== accountFilters.housing) return false;
            return true;
          })
        : base;
    switch (effSort) {
      case 'price-asc':
        return [...filtered].sort((a, b) => priceOf(a.id, a.price) - priceOf(b.id, b.price));
      case 'price-desc':
        return [...filtered].sort((a, b) => priceOf(b.id, b.price) - priceOf(a.id, a.price));
      case 'name-az':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-za':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      case 'category':
        return inSearch || isAll
          ? [...filtered].sort(
              (a, b) => (catInfo.get(a.id)?.order ?? 0) - (catInfo.get(b.id)?.order ?? 0),
            )
          : filtered;
      case 'popular':
        return inSearch
          ? filtered
          : [...filtered].sort(
              (a, b) => (popularRank.get(a.id) ?? 9999) - (popularRank.get(b.id) ?? 9999),
            );
      // Accounts-only (see ACCOUNT_SORT_OPTIONS): by the listing's addedAt;
      // listings without a date trail (catalog order) in both directions
      case 'newest':
        return [...filtered].sort((a, b) =>
          (b.account?.addedAt ?? '').localeCompare(a.account?.addedAt ?? ''),
        );
      case 'oldest':
        return [...filtered].sort((a, b) =>
          (a.account?.addedAt ?? '9999').localeCompare(b.account?.addedAt ?? '9999'),
        );
    }
  }, [searchResults, activeServices, effSort, isAll, inSearch, catInfo, priceOf, isAccounts, accountFilters, accountFiltersDefault]);

  // Category sub-sections from the database catalog: the Mounts category is
  // split by the duty each mount drops from (`mountDutyGroups`; leftovers
  // trail under 'Other Mounts'), Extreme Trials by expansion
  // (`trialExpansionGroups` — section order and per-trial order come from the
  // DB; leftovers trail under 'Other Trials')
  const groupSections = useMemo(() => {
    const defs: { title: string; ids: string[] }[] =
      activeSub?.id === 'mounts'
        ? [
            { title: 'Extreme Trial Mounts', ids: db.catalog?.mountDutyGroups?.extreme ?? [] },
            { title: 'Savage Raid Mounts', ids: db.catalog?.mountDutyGroups?.savage ?? [] },
            { title: 'V&C Dungeons', ids: db.catalog?.mountDutyGroups?.vc ?? [] },
          ].filter((d) => d.ids.length)
        : activeSub?.id === 'trials'
          ? Object.entries(db.catalog?.trialExpansionGroups ?? {}).map(([title, ids]) => ({
              title,
              ids,
            }))
          : activeSub?.id === 'criterion-dungeons'
            ? Object.entries(db.catalog?.dungeonGroups ?? {}).map(([title, ids]) => ({
                title,
                ids,
              }))
            : [];
    if (!defs.length) return null;
    const grouped = new Set(defs.flatMap((d) => d.ids));
    const sections = defs
      .map((d) => {
        const order = new Map(d.ids.map((id, i) => [id, i]));
        return {
          title: d.title,
          // Section cards follow the DB list order, not the catalog order
          services: activeServices
            .filter((sv) => order.has(sv.id))
            .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
        };
      })
      .filter((s) => s.services.length);
    const other = activeServices.filter((sv) => !grouped.has(sv.id));
    if (other.length) {
      sections.push({
        title:
          activeSub?.id === 'mounts'
            ? 'Other Mounts'
            : activeSub?.id === 'criterion-dungeons'
              ? 'Other Dungeons'
              : 'Other Trials',
        services: other,
      });
    }
    return sections.length ? sections : null;
  }, [activeSub, activeServices, db]);

  if (!game || !activeSub) return <Navigate to="/" replace />;

  // Shared sort dropdown — rendered in the category header row and, with the
  // same behavior, in the search-results header row
  const sortDropdown = (
    <div ref={sortBoxRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setSortOpen((v) => !v)}
        aria-expanded={sortOpen}
        className={`flex cursor-pointer items-center gap-2 rounded-[3px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
          sortOpen
            ? 'border-cyan-500/60 bg-navy-800 text-cyan-400'
            : 'border-navy-700/70 bg-navy-850 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400'
        }`}
      >
        <SortIcon />
        {/* Mobile keeps the static "Sort" label; desktop shows the active
            option (with its direction arrow — the dropdown rows are icon-only) */}
        <span className="lg:hidden">Sort</span>
        <span className="max-lg:hidden">
          {(() => {
            const cur = sortOptions.find((o) => o.id === effSort);
            return cur ? `${cur.arrow ? `${cur.arrow} ` : ''}${cur.label}` : '';
          })()}
        </span>
        <ChevronDown className={`h-3 w-3 text-cyan-400/60 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
      </button>
      {sortOpen && (
        <ul
          ref={sortMenuRef}
          className="dropdown-in absolute right-0 top-full z-20 mt-2 w-44 rounded-[3px] border border-navy-700/70 bg-navy-850 p-1.5 shadow-2xl"
        >
          {sortOptions.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  setSort(id);
                  setSortOpen(false);
                }}
                aria-pressed={effSort === id}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-xs transition-colors ${
                  effSort === id
                    ? 'bg-navy-800 font-semibold text-cyan-400'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${effSort === id ? 'text-cyan-400' : 'text-cyan-500/70'}`} />
                {label}
                {/* Checkmark pinned right on the selected sort */}
                {effSort === id && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-cyan-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div>
      <PageMeta
        title={`${game.name} Boosting & Carry Services`}
        description={game.description}
        path={`/boosting/${game.id}`}
      />
      {/* ============ HEADER — image behind the title, under a gradient ============ */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0">
          <FadeImage
            src={GAME_BG[game.id] ?? game.cardImage}
            alt=""
            className="h-full w-full"
            imgClassName="lg:object-[50%_35%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/75 to-navy-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/60" />

        <div className="relative mx-auto max-w-[1440px] px-[25px] pb-12 pt-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-cyan-400">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-cyan-400">{game.name}</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {game.name}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{game.description}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-850/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5 text-cyan-500" />
                {game.subcategories.length} categories
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-850/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                <Package className="h-3.5 w-3.5 text-cyan-400" />
                {serviceCount(game)} services
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ MOBILE CATEGORY CAROUSEL ============ */}
      {/* Controlled by the label row's scroll choreography (hidden) — see the
          sticky label container below; also drops the bar's own gradient so
          the label overlay stays the single gradient from the navbar down */}
      <MobileCategoryBar
        items={game.subcategories}
        activeId={active}
        onSelect={selectCategory}
        hidden={chipsHidden}
      />

      {/* ============ SIDEBAR + FILTERED SERVICES ============ */}
      {/* pt-4 on mobile keeps the label close under the chips bar; desktop keeps py-12 */}
      <div ref={gridRef} className="mx-auto grid max-w-[1440px] gap-10 px-[25px] pb-12 pt-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-12">
        {/* Left: subcategory filter list */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 flex max-h-[calc(100vh-4rem)] flex-col">
            <div className="relative flex min-h-0 flex-col">
              {/* pr-3 (only while overflowing) keeps the buttons/counts clear of the overlay scrollbar pill.
                  Single content child (the ul): Lenis (useSmoothScroller) measures it to size the scroll
                  range. No data-lenis-prevent: with its own Lenis, nesting in the page scroller works via
                  lenisStopPropagation (see useSmoothScroller) — at the list's edges the page smooth-scrolls
                  on instead of freezing. */}
              <div
                ref={setCatListEl}
                className={`no-scrollbar min-h-0 flex-1 overflow-y-auto ${catOverflows ? 'pr-3' : ''}`}
              >
              <ul className="divide-y divide-navy-700/50">
                {game.subcategories.map((sub) => {
                  const isActive = active === sub.id;
                  return (
                    <li key={sub.id}>
                      <button
                        onClick={() => selectCategory(sub.id)}
                        aria-pressed={isActive}
                        className={`flex w-full items-center justify-between rounded-[5px] px-3 py-3 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-navy-800 font-semibold text-cyan-400'
                            : 'text-slate-400 hover:bg-navy-850 hover:text-white'
                        }`}
                      >
                        {sub.name}
                        <span className={`text-xs ${isActive ? 'text-cyan-400/70' : 'text-slate-500'}`}>
                          {sub.services.length + (sub.proxies?.length ?? 0)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              </div>
              {/* Same overlay scrollbar as the page/cart — mounted only while the list overflows */}
              {catOverflows && (
                <OverlayScrollbar
                  scroller={catListEl}
                  className="absolute bottom-0 right-0 top-0 w-2"
                />
              )}
            </div>

            <div className="mt-4 shrink-0 rounded-[5px] bg-navy-850 p-4">
              <p className="font-display text-sm font-bold text-cyan-400">Need something else?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Custom {game.short} orders are quoted within the hour.
              </p>
            </div>
          </div>
        </aside>

        {/* Right: only the selected category's services — keyed by the search
            query, so changing ?q= remounts the pane and replays the reveal
            animation (Reveal animates on mount only). Sort changes remount
            only the grid (keyed wrapper below), never the label row */}
        <div key={searchResults !== null ? `search:${searchQ}` : activeSub.id}>
          {searchResults !== null ? (
            <>
              {/* Sticky label row: cards scroll beneath it and dissolve into
                  the page background. The overlay paints a pixel-exact copy of
                  the body's fixed background (bg-page-fixed), so it's invisible
                  until a card passes under it; an eased multi-stop mask fades
                  its bottom edge (a hard opaque plateau would show as a line).
                  It must sit OUTSIDE the Reveal — Reveal keeps a transform,
                  which would re-anchor the fixed background to this small box
                  and show as a visible block. pb + -mb pull the grid's first
                  row into the fade zone; pointer-events-none on the wrapper
                  lets clicks through to the cards under the fade — re-enabled
                  on the content row so the sort dropdown stays interactive.
                  Mobile: the container reserves the chips bar's height with
                  -mt-[58px]/pt-[58px] — kept CONSTANT; when the bar hides
                  (scroll down, label about to stick) the content row slides
                  up with a transform instead. A padding animation would
                  re-layout the whole card grid on every frame (a visible
                  hitch on long categories); a transform is compositor-only
                  and doesn't re-anchor the overlay's fixed background (the
                  overlay is its sibling, not its child). The overlay is the
                  only gradient and fades in only once the row is stuck
                  (labelStuck); on desktop it's always on, with -mt-8/pt-8
                  extending the cover above the label */}
              <div ref={labelSentinelRef} className="h-0" aria-hidden />
              <div className="pointer-events-none sticky top-0 z-20 -mt-[58px] -mb-8 pb-8 pt-[58px] lg:-mt-8 lg:pt-8">
                <div
                  className={`bg-page-fixed absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_10%,rgb(0_0_0/0.90)_24%,rgb(0_0_0/0.78)_38%,rgb(0_0_0/0.64)_52%,rgb(0_0_0/0.48)_65%,rgb(0_0_0/0.32)_77%,rgb(0_0_0/0.18)_87%,rgb(0_0_0/0.08)_95%,transparent_110%)] transition-opacity duration-300 lg:opacity-100 ${labelStuck ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden
                />
                <Reveal className="pointer-events-auto">
                  {/* translate-y-[-45px] lands the label 13px under the navbar
                      (58px reserved − 45px) once the chips bar slides away */}
                  <div className={`relative flex items-center gap-3 transition-transform duration-300 max-sm:justify-center lg:translate-y-0 ${chipsHidden ? '-translate-y-[45px]' : 'translate-y-0'}`}>
                  <h2 className="min-w-0 truncate font-display text-xl font-bold text-white sm:text-2xl">
                    Search Results for <span className="text-cyan-400">{searchQ}</span>
                  </h2>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                    {searchResults.length}
                  </span>
                  {/* Fades out once the row is stuck — cards scroll beneath it */}
                  <div className={`h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent transition-opacity duration-300 max-sm:hidden ${labelStuck ? 'opacity-0' : 'opacity-100'}`} />
                  {sortDropdown}
                  </div>
                </Reveal>
              </div>
              {searchResults.length === 0 ? (
                // Matches the service card height (ServiceCard min-h)
                <div className="mt-5 flex h-[380px] items-center justify-center rounded-[5px] bg-navy-850 px-6 text-sm text-slate-500">
                  <span className="block max-w-full truncate">No services matching “{searchQ}”</span>
                </div>
              ) : (
                // Keyed by the sort only — changing it remounts the cards
                // (replaying their animation) but not the label row above
                <div key={effSort}>
                  <ServicesGrid
                    services={gridServices}
                    withCtas
                    activeCount={activeServices.length}
                    showPills={isAll && !inSearch}
                    catInfo={catInfo}
                    gameId={game.id}
                  />
                </div>
              )}
            </>
          ) : (
            <>
          {/* Sticky label row: cards scroll beneath it and dissolve into the
              page background. The overlay paints a pixel-exact copy of the
              body's fixed background (bg-page-fixed), so it's invisible until
              a card passes under it; an eased multi-stop mask fades its bottom
              edge (a hard opaque plateau would show as a line). It must sit
              OUTSIDE the Reveal — Reveal keeps a transform, which would
              re-anchor the fixed background to this small box and show as a
              visible block. pb + -mb pull the grid's first row into the fade
              zone; pointer-events-none on the wrapper lets clicks through to
              the cards under the fade — re-enabled on the content row so the
              sort dropdown stays interactive. Mobile: the container reserves
              the chips bar's height with -mt-[58px]/pt-[58px] — kept
              CONSTANT; when the bar hides (scroll down, label about to stick)
              the content row slides up with a transform instead. A padding
              animation would re-layout the whole card grid on every frame (a
              visible hitch on long categories); a transform is
              compositor-only and doesn't re-anchor the overlay's fixed
              background (the overlay is its sibling, not its child). The
              overlay is the only gradient and fades in only once the row is
              stuck (labelStuck); on desktop it's always on, with -mt-8/pt-8
              extending the cover above the label */}
          <div ref={labelSentinelRef} className="h-0" aria-hidden />
          <div className="pointer-events-none sticky top-0 z-20 -mt-[58px] -mb-8 pb-8 pt-[58px] lg:-mt-8 lg:pt-8">
            <div
              className={`bg-page-fixed absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_10%,rgb(0_0_0/0.90)_24%,rgb(0_0_0/0.78)_38%,rgb(0_0_0/0.64)_52%,rgb(0_0_0/0.48)_65%,rgb(0_0_0/0.32)_77%,rgb(0_0_0/0.18)_87%,rgb(0_0_0/0.08)_95%,transparent_110%)] transition-opacity duration-300 lg:opacity-100 ${labelStuck ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden
            />
            <Reveal className="pointer-events-auto">
              {/* translate-y-[-45px] lands the label 13px under the navbar
                  (58px reserved − 45px) once the chips bar slides away */}
              {/* flex-wrap only matters on the Accounts row (sort + 3 filter
                  dropdowns can exceed small widths — they wrap under the
                  label); other categories never wrap */}
              <div className={`relative flex flex-wrap items-center gap-3 transition-transform duration-300 max-sm:justify-center lg:translate-y-0 ${chipsHidden ? '-translate-y-[45px]' : 'translate-y-0'}`}>
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{activeSub.name}</h2>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                {activeServices.length}
              </span>
              {/* Fades out once the row is stuck — cards scroll beneath it */}
              <div className={`h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent transition-opacity duration-300 max-sm:hidden ${labelStuck ? 'opacity-0' : 'opacity-100'}`} />
              {/* Accounts listing filters (see ACCOUNT_FILTERS);
                  sort stays the rightmost dropdown */}
              {isAccounts &&
                ACCOUNT_FILTERS.map((f) => (
                  <LabelDropdown
                    key={f.id}
                    def={f}
                    value={accountFilters[f.id]}
                    onChange={(v) => setAccountFilters((s) => ({ ...s, [f.id]: v }))}
                  />
                ))}
              {sortDropdown}
              </div>
            </Reveal>
          </div>
          {/* Keyed by the sort only — changing it remounts the cards
              (replaying their animation) but not the label row above */}
          <div key={effSort}>
          {activeServices.length === 0 ? (
            // Matches the service card height (ServiceCard min-h)
            <div className="mt-5 flex h-[380px] items-center justify-center rounded-[5px] bg-navy-850 text-sm text-slate-500">
              No boosts in this category yet
            </div>
          ) : gridServices.length === 0 ? (
            // Every listing was filtered out (Accounts filters)
            <div className="mt-5 flex h-[380px] items-center justify-center rounded-[5px] bg-navy-850 px-6 text-sm text-slate-500">
              No accounts match the selected filters
            </div>
          ) : groupSections && effSort === 'category' ? (
            <div className="mt-5 space-y-10">
              {groupSections.map((section, si) => {
                const collapsed = collapsedSections.has(section.title);
                return (
                  /* Staggered fade + slide-in on page/category open */
                  <Reveal key={section.title} immediate delay={si * 120}>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.title)}
                        aria-expanded={!collapsed}
                        className="group flex w-full items-center gap-3 text-left max-sm:justify-center"
                      >
                        {section.title}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                          {section.services.length}
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent max-sm:hidden" />
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-slate-400 transition-colors group-hover:text-cyan-400">
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? '-rotate-90' : ''}`}
                          />
                        </span>
                      </button>
                    </h3>
                    {/* CTAs only in the first section; thresholds use the full
                        category count, same as an ungrouped category */}
                    <div
                      className={`grid transition-all ease-soft ${
                        collapsed ? 'grid-rows-[0fr] duration-500' : 'grid-rows-[1fr] duration-200'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <ServicesGrid
                          services={section.services}
                          withCtas={si === 0}
                          activeCount={activeServices.length}
                          showPills={isAll && !inSearch}
                          catInfo={catInfo}
                          gameId={game.id}
                        />
                      </div>
                    </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <ServicesGrid
              services={gridServices}
              withCtas
              activeCount={activeServices.length}
              showPills={isAll && !inSearch}
              catInfo={catInfo}
              gameId={game.id}
            />
          )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* ============ CUSTOM ORDER CTA ============ */}
      <section className="mx-auto max-w-[1440px] px-[25px] pb-4 sm:px-6 lg:px-8">
        <CustomOrderCta />
      </section>
    </div>
  );
}
