import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { ChevronDown, ChevronRight, Layers, Package } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import FadeImage from '@/components/FadeImage';
import MobileCategoryBar from '@/components/MobileCategoryBar';
import Reveal from '@/components/Reveal';
import { OverlayScrollbar } from '@/components/Scrollbar';
import PageMeta from '@/components/PageMeta';
import ServiceCard from '@/components/ServiceCard';
import { getGame, serviceCount, type Service } from '@/data/games';
import { lenisRef } from '@/lib/lenis';
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

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { db } = usePricing();
  const game = gameId ? getGame(gameId) : undefined;
  const catParam = searchParams.get('cat');

  const validCat = (id: string | null) =>
    id && game?.subcategories.some((s) => s.id === id) ? id : null;

  const [active, setActive] = useState<string>(
    () => validCat(catParam) ?? game?.subcategories[0]?.id ?? '',
  );
  // Ref for the desktop category list, so the overlay scrollbar can mirror it
  const [catListEl, setCatListEl] = useState<HTMLUListElement | null>(null);
  // True only while the category list actually overflows — drives the inset
  // that keeps the buttons clear of the overlay scrollbar pill
  const [catOverflows, setCatOverflows] = useState(false);
  // The services grid section — smooth-scroll target on category change
  const gridRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef(active);
  const prevGameId = useRef(gameId);
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
    setSearchParams({ cat: id });
  };

  // On category change, smooth-scroll so the grid's top edge (where the header
  // background ends and the content segment starts) lands right below the
  // navbar — on mobile, below the sticky category chips bar instead.
  // Only scrolls when the category actually CHANGES within the same game:
  // never on first open, and never when switching games (a new game page is a
  // fresh open — ScrollToTop owns the scroll position there, and the new
  // game's default category would otherwise look like a "change").
  useEffect(() => {
    if (prevGameId.current !== gameId) {
      prevGameId.current = gameId;
      // Record the category the URL-sync effect above is about to switch to —
      // NOT the stale one from the previous game, or that sync would look
      // like an in-game category pick and trigger the scroll
      prevActive.current = validCat(catParam) ?? game?.subcategories[0]?.id ?? '';
      return;
    }
    if (prevActive.current === active) return;
    prevActive.current = active;
    const el = gridRef.current;
    const scroller = document.getElementById('page-scroll');
    if (!el || !scroller) return;
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
    // Scroll through Lenis when it's running so the animation uses the same
    // easing and isn't fighting Lenis's own scroll loop. Short duration so
    // the snap starts instantly instead of ramping up slowly via lerp.
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(top, { duration: 0.4 });
    else scroller.scrollTo({ top, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- validCat is stable (pure lookup)
  }, [active, gameId, catParam, game]);

  useEffect(() => {
    if (!catListEl) return;
    const check = () => setCatOverflows(catListEl.scrollHeight > catListEl.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(catListEl);
    Array.from(catListEl.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [catListEl]);

  if (!game) return <Navigate to="/" replace />;

  const activeSub = game.subcategories.find((s) => s.id === active) ?? game.subcategories[0];
  // Proxy cards (e.g. Current Patch): duplicates of services from other
  // subcategories — resolved by id so counts never double them
  const activeServices = [
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

  // Search-results mode (?q=keyword from the navbar search): a flat grid of
  // every matching service in the game, ranked like the dropdown. Changing
  // category or page drops the param, clearing the search view.
  const searchQ = (searchParams.get('q') ?? '').trim();
  const searchResults =
    searchQ.length >= 2
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
      : null;

  // Category sub-sections from the database catalog: the Mounts category is
  // split by the duty each mount drops from (`mountDutyGroups`; leftovers
  // trail under 'Other Mounts'), Extreme Trials by expansion
  // (`trialExpansionGroups` — section order and per-trial order come from the
  // DB; leftovers trail under 'Other Trials')
  const groupSections = (() => {
    const defs: { title: string; ids: string[] }[] =
      activeSub.id === 'mounts'
        ? [
            { title: 'Extreme Trial Mounts', ids: db.catalog?.mountDutyGroups?.extreme ?? [] },
            { title: 'Savage Raid Mounts', ids: db.catalog?.mountDutyGroups?.savage ?? [] },
            { title: 'V&C Dungeons', ids: db.catalog?.mountDutyGroups?.vc ?? [] },
          ].filter((d) => d.ids.length)
        : activeSub.id === 'trials'
          ? Object.entries(db.catalog?.trialExpansionGroups ?? {}).map(([title, ids]) => ({
              title,
              ids,
            }))
          : activeSub.id === 'criterion-dungeons'
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
          activeSub.id === 'mounts'
            ? 'Other Mounts'
            : activeSub.id === 'criterion-dungeons'
              ? 'Other Dungeons'
              : 'Other Trials',
        services: other,
      });
    }
    return sections.length ? sections : null;
  })();

  const renderServiceGrid = (services: Service[], withCtas: boolean) => (
    /* 2 per row from mobile up; md 3 — below lg the sidebar becomes the
       carousel, so the full row fits 3 cards; lg keeps 3 (sidebar takes
       240px, 4 would squeeze cards to ~155px); xl 4 — cards cap at 280px
       and never drop below ~213px */
    <div className="mt-5 grid grid-cols-1 justify-items-center gap-5 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {services.map((service, i) => (
        <Fragment key={service.id}>
          {/* Cards cap at 280px (ServiceCard max-w) — centered in their
              cells like the home page's popular picks, so extra row width
              becomes even outer margins */}
          <Reveal className="w-full max-w-[280px]" immediate>
            <ServiceCard service={service} />
          </Reveal>
          {/* Inline custom-order CTA on mobile: only in categories with
              more than 7 card rows (7+ services at 1 col). Below 400px
              (1 col) it follows the 2nd card; at 2 cols it follows the
              4th card and spans both columns — 2 full rows above it in
              either case */}
          {withCtas && activeServices.length > 7 && i === 1 && (
            <div className="mx-auto w-full max-w-[280px] min-[400px]:hidden">
              <CustomOrderCta compact />
            </div>
          )}
          {withCtas && activeServices.length > 7 && i === 3 && (
            <div className="hidden w-full min-[400px]:col-span-2 min-[400px]:block sm:hidden">
              <CustomOrderCta compact />
            </div>
          )}
        </Fragment>
      ))}
      {/* Desktop grid-breaker: only in categories with more than 3 card
          rows (12+ services at 4 cols), pinned to row 3 so exactly 2
          rows of cards sit above it */}
      {withCtas && activeServices.length > 12 && (
        <div className="hidden w-full sm:col-span-2 sm:row-start-3 sm:block md:col-span-3 xl:col-span-4">
          <CustomOrderCta lateTextBreak />
        </div>
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
      <section className="relative overflow-hidden">
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
      <MobileCategoryBar
        items={game.subcategories}
        activeId={active}
        onSelect={selectCategory}
      />

      {/* ============ SIDEBAR + FILTERED SERVICES ============ */}
      <div ref={gridRef} className="mx-auto grid max-w-[1440px] gap-10 px-[25px] py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        {/* Left: subcategory filter list */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 flex max-h-[calc(100vh-4rem)] flex-col">
            <p className="shrink-0 px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Categories</p>
            <div className="relative mt-3 flex min-h-0 flex-col">
              {/* pr-3 (only while overflowing) keeps the buttons/counts clear of the overlay scrollbar pill */}
              <ul
                ref={setCatListEl}
                data-lenis-prevent
                className={`no-scrollbar min-h-0 flex-1 divide-y divide-navy-700/50 overflow-y-auto ${catOverflows ? 'pr-3' : ''}`}
              >
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
              {/* Same overlay scrollbar as the page/cart — mounted only while the list overflows */}
              {catOverflows && (
                <OverlayScrollbar
                  scroller={catListEl}
                  className="absolute bottom-0 right-0 top-0 w-2"
                />
              )}
            </div>

            <div className="mt-8 shrink-0 rounded-[5px] bg-navy-850 p-4">
              <p className="font-display text-sm font-bold text-cyan-400">Need something else?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Custom {game.short} orders are quoted within the hour.
              </p>
            </div>
          </div>
        </aside>

        {/* Right: only the selected category's services */}
        <div key={activeSub.id}>
          {searchResults !== null ? (
            <>
              <Reveal>
                <div className="flex items-center gap-3 max-sm:justify-center">
                  <h2 className="min-w-0 truncate font-display text-xl font-bold text-white sm:text-2xl">
                    Search Results for <span className="text-cyan-400">{searchQ}</span>
                  </h2>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                    {searchResults.length}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent max-sm:hidden" />
                </div>
              </Reveal>
              {searchResults.length === 0 ? (
                // Matches the service card height (ServiceCard min-h)
                <div className="mt-5 flex h-[380px] items-center justify-center rounded-[5px] bg-navy-850 px-6 text-sm text-slate-500">
                  <span className="block max-w-full truncate">No services matching “{searchQ}”</span>
                </div>
              ) : (
                renderServiceGrid(searchResults, true)
              )}
            </>
          ) : (
            <>
          <Reveal>
            <div className="flex items-center gap-3 max-sm:justify-center">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{activeSub.name}</h2>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                {activeServices.length}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent max-sm:hidden" />
            </div>
          </Reveal>
          {activeServices.length === 0 ? (
            // Matches the service card height (ServiceCard min-h)
            <div className="mt-5 flex h-[380px] items-center justify-center rounded-[5px] bg-navy-850 text-sm text-slate-500">
              No boosts in this category yet
            </div>
          ) : groupSections ? (
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
                        {renderServiceGrid(section.services, si === 0)}
                      </div>
                    </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            renderServiceGrid(activeServices, true)
          )}
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
