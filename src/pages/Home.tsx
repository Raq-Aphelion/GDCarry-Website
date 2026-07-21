import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Badge, ChevronDown, ChevronLeft, ChevronRight, ShieldCheck, Star, Timer, Users, Zap } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import FadeImage from '@/components/FadeImage';
import Reveal from '@/components/Reveal';
import ServiceCard from '@/components/ServiceCard';
import { games, getGame, serviceCount } from '@/data/games';
import useDragScroll from '@/hooks/useDragScroll';

const HERO_VIDEO_WEBM = '/videos/hero-video.webm';
const HERO_VIDEO_MP4 = '/videos/hero-video-fallback.mp4';
const HERO_POSTER = '/videos/hero-image.webp';

const FEATURED_IDS = [
  'ffxiv-dsr',
  'ffxiv-savage-tier',
  'ffxiv-potd-solo',
  'ffxiv-cc-rank',
  'ffxiv-bis-farm',
];

const PERKS = [
  {
    icon: ShieldCheck,
    title: 'Account safety first',
    text: 'VPN-matched sessions, offline mode on request and zero third-party software. Your account never takes the risk — we do the rolling.',
  },
  {
    icon: Zap,
    title: 'Fast fullfilment',
    text: 'Our own in-house team ensures that all orders are attended to within the 1st day of purchase.',
  },
  {
    icon: Timer,
    title: 'On-time, guaranteed',
    text: 'Every order carries a delivery window. Run late and the difference comes back to your wallet — automatically.',
  },
  {
    icon: Users,
    title: 'Verified pro roster',
    text: 'Ultimate legends, gladiators, world-first raiders. Every Grand Dice booster is vetted, ranked and reviewed.',
  },
];

const REVIEWS = [
  {
    name: 'BlackSheep1988',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'Easy and realy Good Service. Experienced Raiders Clears the new Content nice and realy Quick.',
  },
  {
    name: 'Mina Bajhiri',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'Best Service! 4th time here and definitely will be coming back. Very nice and friendly people.',
  },
  {
    name: 'RoxxRoy',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'Abyssos: The Eighth Circle (Savage) carry. Everything went well and I am happy with the result :) Good and fast performance.',
  },
  {
    name: 'Kannata',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'Another smooth transaction. Patient seller, easy transaction. Thanks again!',
  },
  {
    name: 'Trivialize',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'A++++ Kind seller, very patient and helpful. Planning on buying more soon.',
  },
  {
    name: 'Elite001001',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'Amazing service — always smooth and safe! Ordered multiple times, AFK carry perfect. Very helpful and professional!',
  },
  {
    name: 'SAGETHREADPIPER',
    game: 'Final Fantasy XIV',
    rating: 5,
    text: 'The best and most effective booster. Great service and communication!',
  },
];

const STEPS = [
  { n: '01', title: 'Pick your boost', text: 'Browse the catalog, choose a game and a service, and drop it in the cart.' },
  { n: '02', title: 'We roll out', text: 'A verified pro claims your order, schedules around you and gets to work.' },
  { n: '03', title: 'Claim the rewards', text: 'Track progress live and log back in to loot, titles and ratings — done deal.' },
];

export default function Home() {
  const carouselRef = useDragScroll<HTMLDivElement>();
  const ffxiv = getGame('ffxiv');
  const featured = ffxiv
    ? ffxiv.subcategories.flatMap((s) => s.services).filter((s) => FEATURED_IDS.includes(s.id))
    : [];

  // Finite carousel — arrows grey out at the left/right edges
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Hero backdrop: video fades in once playing; image only loads as fallback if every video source fails
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const updateArrows = () => {
    const track = carouselRef.current;
    if (!track) return;
    setCanLeft(track.scrollLeft > 4);
    setCanRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const track = carouselRef.current;
    if (!track) return;
    const cardWidth = ((track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 320) + 16;
    track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };

  // Eased scroll to the next section — smoother than the browser's built-in smooth scroll.
  // The page scrolls inside #page-scroll (not window), so animate that element's scrollTop.
  const scrollToFeatured = () => {
    const target = document.getElementById('featured');
    const scroller = document.getElementById('page-scroll');
    if (!target || !scroller) return;
    const start = scroller.scrollTop;
    const distance = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const duration = 600;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // 'instant' overrides the global CSS scroll-behavior: smooth, which would fight the rAF loop
      scroller.scrollTo({ top: start + distance * easeOutCubic(progress), behavior: 'instant' as ScrollBehavior });
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div>
      {/* ============ HERO + GAME CAROUSEL ============ */}
      <section className="relative overflow-hidden">
        {/* Faded fullscreen video backdrop */}
        <div className="absolute inset-0">
          {/* Transparent until playback starts, then fades in */}
          <video
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoPlaying ? 'opacity-70' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            onPlaying={() => setVideoPlaying(true)}
          >
            <source src={HERO_VIDEO_WEBM} type="video/webm" />
            {/* onError on the last <source> fires only when every source failed */}
            <source src={HERO_VIDEO_MP4} type="video/mp4" onError={() => setVideoFailed(true)} />
          </video>
          {/* Fallback image — only loaded and faded in if the video can't play */}
          {videoFailed && (
            <img
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                imageLoaded ? 'opacity-70' : 'opacity-0'
              }`}
              src={HERO_POSTER}
              alt=""
              aria-hidden="true"
              onLoad={() => setImageLoaded(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/55 to-navy-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(var(--navy-900)_/_0.5)_78%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[1440px] flex-col items-center justify-center px-4 pb-24 pt-14 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase leading-none tracking-[0.18em] text-gold-300 backdrop-blur-sm">
                #1 EU's boosting services
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 font-display text-[clamp(1.4rem,7.4vw,2.25rem)] font-extrabold leading-[1.08] tracking-tight text-white max-sm:whitespace-nowrap sm:text-6xl">
                Don’t want to grind?
                <br />
                <span className="text-gradient-gold">We’ll do it for you.</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Fast carries, trusted by thousands of players.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-sm">
                <span className="flex gap-0.5" aria-label="Five star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
                  ))}
                </span>
                <span className="font-semibold text-white">Excellent</span>
                <span className="text-slate-400"><span className="max-sm:hidden">— </span>800+ verified player reviews</span>
              </div>
            </Reveal>
          </div>

          {/* Game categories carousel */}
          <Reveal delay={400} className="mt-10 lg:mt-14">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Choose your game</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollByCard(-1)}
                  disabled={!canLeft}
                  aria-label="Previous games"
                  className={`p-1 transition-colors duration-300 ${
                    canLeft ? 'text-slate-400 hover:text-gold-300' : 'cursor-default text-navy-600'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollByCard(1)}
                  disabled={!canRight}
                  aria-label="Next games"
                  className={`p-1 transition-colors duration-300 ${
                    canRight ? 'text-slate-400 hover:text-gold-300' : 'cursor-default text-navy-600'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              onScroll={updateArrows}
              className="no-scrollbar flex touch-pan-y gap-4 overflow-x-auto p-1"
            >
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/boosting/${game.id}`}
                  className={`card-surface group relative block shrink-0 basis-[78%] overflow-hidden rounded-[5px] transition-all duration-300 sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)] ${
                    game.main ? '' : 'grayscale'
                  }`}
                >
                  <FadeImage
                    src={game.cardImage}
                    alt={game.name}
                    className="aspect-[16/10]"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute -inset-px bg-gradient-to-t from-navy-800 from-0% via-navy-800/60 via-35% to-transparent to-60%" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-base font-bold text-white transition-colors group-hover:text-gold-300 sm:text-lg">
                      {game.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {serviceCount(game)} services
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll-down cue */}
        <button
          onClick={scrollToFeatured}
          aria-label="Scroll to next section"
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 p-2 text-slate-400/70 transition-colors duration-300 hover:text-gold-300"
        >
          <ChevronDown className="h-7 w-7 animate-bounce" />
        </button>
      </section>

      {/* ============ FEATURED FFXIV ============ */}
      <section id="featured" className="border-b border-navy-700/50 bg-navy-950/50 pb-12 pt-8 lg:pb-20 lg:pt-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Frequently ordered</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
                  FFXIV <span className="text-gradient-cyan">popular picks</span>
                </h2>
              </div>
              <Link
                to="/boosting/ffxiv"
                className="group flex items-center gap-2 text-sm font-bold text-gold-300 transition-colors hover:text-gold-400"
              >
                All FFXIV services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          {/* One row only: mobile shows 3, sm 2, lg 3, 5 in a row from 720p (xl)
              up; cards that would wrap to a second row are removed. */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-5">
            {featured.slice(0, 5).map((s, i) => (
              <Reveal
                key={s.id}
                delay={i * 90}
                className={i === 2 ? 'sm:hidden lg:block' : i >= 3 ? 'hidden xl:block' : ''}
              >
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:py-20 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Why Grand Dice</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Experience <span className="text-gradient-gold">the difference</span>
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="card-surface h-full rounded-[5px] p-6 text-center">
                <div className="relative mx-auto h-14 w-14">
                  <Badge className="h-14 w-14 fill-navy-700 text-navy-700" strokeWidth={1.5} />
                  <p.icon className="absolute inset-0 m-auto h-6 w-6 text-gold-300" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <section className="border-y border-navy-700/50 bg-navy-950/50 py-12 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Player reviews</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
                Trusted by <span className="text-gradient-cyan">many</span>
              </h2>
              <div className="mt-4 flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-400">
                  <span className="font-semibold text-white">4.9 / 5</span> from 800+ verified orders
                </span>
              </div>
            </div>
          </Reveal>
          <div className="mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] lg:mt-12">
            <div className="marquee flex w-max gap-5">
              {[...REVIEWS, ...REVIEWS].map((r, i) => (
                <figure
                  key={`${r.name}-${i}`}
                  className="card-surface flex w-[300px] shrink-0 flex-col rounded-[5px] p-6 sm:w-[340px]"
                >
                  <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s < r.rating ? 'fill-cyan-400 text-cyan-400' : 'text-navy-700'}`}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                    “{r.text}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-navy-700/60 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-gradient-to-br from-gold-400 to-gold-600 font-display text-xs font-bold text-navy-900">
                      {r.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{r.name}</span>
                      <span className="block text-xs text-slate-400">{r.game} · Verified order</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:py-20 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Three simple steps</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">How it works</h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-12">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative h-full overflow-hidden rounded-[5px] bg-gradient-to-b from-navy-850 to-navy-900 p-7">
                <span className="pointer-events-none absolute right-2 top-1 font-display text-7xl font-extrabold text-navy-700/50">
                  {s.n}
                </span>
                <span className="font-display text-sm font-extrabold text-gradient-gold">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 lg:px-8">
        <CustomOrderCta />
      </section>
    </div>
  );
}
