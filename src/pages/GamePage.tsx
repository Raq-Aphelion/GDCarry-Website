import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { ChevronRight, Layers, Package } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import FadeImage from '@/components/FadeImage';
import MobileCategoryBar from '@/components/MobileCategoryBar';
import Reveal from '@/components/Reveal';
import ServiceCard from '@/components/ServiceCard';
import { getGame, serviceCount } from '@/data/games';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const game = gameId ? getGame(gameId) : undefined;
  const catParam = searchParams.get('cat');

  const validCat = (id: string | null) =>
    id && game?.subcategories.some((s) => s.id === id) ? id : null;

  const [active, setActive] = useState<string>(
    () => validCat(catParam) ?? game?.subcategories[0]?.id ?? '',
  );

  // Follow ?cat= changes (e.g. navbar search) and reset when switching games
  useEffect(() => {
    setActive(validCat(catParam) ?? game?.subcategories[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, catParam]);

  if (!game) return <Navigate to="/" replace />;

  const activeSub = game.subcategories.find((s) => s.id === active) ?? game.subcategories[0];

  return (
    <div>
      {/* ============ HEADER — image behind the title, under a gradient ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <FadeImage src={game.cardImage} alt="" className="h-full w-full" />
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
        onSelect={setActive}
      />

      {/* ============ SIDEBAR + FILTERED SERVICES ============ */}
      <div className="mx-auto grid max-w-[1440px] gap-10 px-[25px] py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        {/* Left: subcategory filter list */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Categories</p>
            <ul className="mt-3 divide-y divide-navy-700/50">
              {game.subcategories.map((sub) => {
                const isActive = active === sub.id;
                return (
                  <li key={sub.id}>
                    <button
                      onClick={() => setActive(sub.id)}
                      aria-pressed={isActive}
                      className={`flex w-full items-center justify-between rounded-[5px] px-3 py-3 text-left text-sm transition-colors ${
                        isActive
                          ? 'bg-navy-800 font-semibold text-cyan-400'
                          : 'text-slate-400 hover:bg-navy-850 hover:text-white'
                      }`}
                    >
                      {sub.name}
                      <span className={`text-xs ${isActive ? 'text-cyan-400/70' : 'text-slate-500'}`}>
                        {sub.services.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 rounded-[5px] bg-navy-850 p-4">
              <p className="font-display text-sm font-bold text-cyan-400">Need something else?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Custom {game.short} orders are quoted within the hour.
              </p>
            </div>
          </div>
        </aside>

        {/* Right: only the selected category's services */}
        <div key={activeSub.id}>
          <Reveal>
            <div className="flex items-center gap-3 max-sm:justify-center">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{activeSub.name}</h2>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-slate-400">
                {activeSub.services.length}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent max-sm:hidden" />
            </div>
          </Reveal>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activeSub.services.map((service, i) => (
              <Reveal key={service.id} delay={Math.min(i, 3) * 80}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ============ CUSTOM ORDER CTA ============ */}
      <section className="mx-auto max-w-[1440px] px-[25px] pb-4 sm:px-6 lg:px-8">
        <CustomOrderCta />
      </section>
    </div>
  );
}
