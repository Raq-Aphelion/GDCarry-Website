import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Badge, ChevronDown, ChevronLeft, ChevronRight, HandCoins, ShieldCheck, Star, Users, Zap } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import PageMeta, { JsonLd, SITE_URL } from '@/components/PageMeta';
import FadeImage from '@/components/FadeImage';
import Reveal from '@/components/Reveal';
import ServiceCard from '@/components/ServiceCard';
import { games, getGame, serviceCount } from '@/data/games';
import { usePricing } from '@/context/PricingContext';
import useDragScroll from '@/hooks/useDragScroll';

const HERO_VIDEO_WEBM = '/videos/hero-video.webm';
const HERO_VIDEO_MP4 = '/videos/hero-video-fallback.mp4';
const HERO_POSTER = '/videos/hero-image.webp';

const FEATURED_IDS = [
  'ffxiv-gil-pack',
  'ffxiv-arcadion-savage',
  'ffxiv-uwu',
  'ffxiv-wings-of-mist',
  'ffxiv-potd-solo',
];

const PERKS = [
  {
    icon: Users,
    title: 'No outsourcing',
    text: 'Every order is completed by our own vetted in-house team — your account never changes hands with third parties.',
  },
  {
    icon: Zap,
    title: 'Fast fullfilment',
    text: 'Our own in-house team ensures that all orders are attended to within the 1st day of purchase.',
  },
  {
    icon: HandCoins,
    title: 'Shop with confidence',
    text: 'Receive your items, services, or currency as promised, or we’ll refund you in full.',
  },
  {
    icon: ShieldCheck,
    title: 'Account safety first',
    text: 'VPN-matched sessions, offline mode on request and zero third-party software. Your account never takes the risk.',
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
  { n: '01', title: 'Pick your boost', text: 'Browse the catalog, choose a service, drop it in the cart and place an order.' },
  { n: '02', title: 'We roll out', text: 'A verified booster claims your order, schedules around you and gets to work.' },
  { n: '03', title: 'Claim the rewards', text: 'Track progress live and log back in to enjoy your loot once the service is fulfilled.' },
];

export default function Home() {
  const carouselRef = useDragScroll<HTMLDivElement>();
  const { db } = usePricing();
  const ffxiv = getGame('ffxiv');
  // FEATURED_IDS order defines the card order (1st entry = 1st spot);
  // the database `popularPicks` entry overrides it when present
  const allServices = ffxiv ? ffxiv.subcategories.flatMap((s) => s.services) : [];
  const featuredIds = db.popularPicks ?? FEATURED_IDS;
  const featured = featuredIds.map((id) => allServices.find((s) => s.id === id)).filter(
    (s): s is (typeof allServices)[number] => !!s,
  );

  // Finite carousel — arrows grey out at the left/right edges
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Hero backdrop: video fades in once playing; image only loads as fallback if every video source fails
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reviews marquee: JS-driven auto-scroll. Dragging halts it and drives the
  // offset by hand; 1s after release the speed eases back up over ~0.75s.
  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  const marqueeOffset = useRef(0);
  const marqueeSpeed = useRef(0);
  const marqueeHeld = useRef(false);
  const dragStartOffset = useRef(0);
  const marqueeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewsRef = useDragScroll<HTMLDivElement>({
    manual: true,
    onDragStart: () => {
      if (marqueeTimer.current) clearTimeout(marqueeTimer.current);
      marqueeHeld.current = true;
      marqueeSpeed.current = 0;
      dragStartOffset.current = marqueeOffset.current;
    },
    onDragMove: (dx) => {
      const track = reviewsTrackRef.current;
      if (!track) return;
      const half = track.scrollWidth / 2 || 1;
      let next = (dragStartOffset.current - dx) % half;
      if (next < 0) next += half;
      marqueeOffset.current = next;
    },
    onDragEnd: () => {
      if (marqueeTimer.current) clearTimeout(marqueeTimer.current);
      // release after 1s, then the speed ramps back over ~0.75s
      marqueeTimer.current = setTimeout(() => {
        marqueeHeld.current = false;
        marqueeSpeed.current = 0;
      }, 1000);
    },
  });

  // rAF loop: the speed target keeps the old 46s loop pace
  useEffect(() => {
    const track = reviewsTrackRef.current;
    if (!track) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const half = track.scrollWidth / 2 || 1;
      const target = marqueeHeld.current ? 0 : half / 46;
      marqueeSpeed.current += (target - marqueeSpeed.current) * Math.min(1, dt / 0.75);
      marqueeOffset.current = (marqueeOffset.current + marqueeSpeed.current * dt) % half;
      track.style.transform = `translateX(${-marqueeOffset.current}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(
    () => () => {
      if (marqueeTimer.current) clearTimeout(marqueeTimer.current);
    },
    [],
  );

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
      <PageMeta
        title="Professional Game Boosting Services — FFXIV, WoW & More"
        description="Grand Dice (GD Carry) — professional boosting services, gaming boosts and secure carries for FFXIV, World of Warcraft, Lost Ark, Warframe and RuneScape. Hand-played by verified pro players, on time and guaranteed."
        path="/"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${SITE_URL}/#organization`,
              name: 'Grand Dice',
              alternateName: ['GD Carry', 'Grand Dice Carry', 'GD Boost'],
              url: SITE_URL,
              logo: `${SITE_URL}/images/gd_logo.png`,
              description:
                'Professional boosting services and carries for FFXIV, World of Warcraft, Lost Ark, Warframe and RuneScape.',
            },
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              url: SITE_URL,
              name: 'GD Carry — Grand Dice',
              publisher: { '@id': `${SITE_URL}/#organization` },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            },
          ],
        }}
      />
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
          {/* Bottom stop is the featured section's effective background
              (navy-950/50 blended over the navy-900 body) so the hero fades
              seamlessly into the section below */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/55 to-[rgb(12,12,14)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(var(--navy-900)_/_0.5)_78%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[1440px] flex-col items-center justify-center px-[25px] pb-24 pt-14 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-cyan-600/40 bg-cyan-600/10 px-4 py-1.5 text-xs font-bold uppercase leading-none tracking-[0.18em] text-cyan-400 backdrop-blur-sm">
                The EU's best-rated boosting services
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 font-display text-[clamp(1.4rem,7.4vw,2.25rem)] font-extrabold leading-[1.08] tracking-tight text-white max-sm:whitespace-nowrap sm:text-6xl">
                Don’t want to grind?
                <br />
                <span className="text-gradient-blue">We’ll do it for you.</span>
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
                <span className="text-slate-400">
                  <span className="font-semibold text-white">100%</span> from <span className="font-semibold text-white">170+</span> verified ratings on{' '}
                  <a
                    href="https://www.epicnpc.com/members/grand-dice.1661988/#feedback"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-400 underline-offset-2 transition-colors hover:text-cyan-300"
                  >
                    EpicNPC
                  </a>
                </span>
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
                    canLeft ? 'text-slate-400 hover:text-cyan-400' : 'cursor-default text-navy-600'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollByCard(1)}
                  disabled={!canRight}
                  aria-label="Next games"
                  className={`p-1 transition-colors duration-300 ${
                    canRight ? 'text-slate-400 hover:text-cyan-400' : 'cursor-default text-navy-600'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                ref={carouselRef}
                onScroll={updateArrows}
                className="no-scrollbar flex touch-pan-y gap-4 overflow-x-auto p-1"
              >
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/boosting/${game.id}`}
                  className="card-surface group relative block shrink-0 basis-[78%] overflow-hidden rounded-[5px] transition-all duration-300 sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]"
                >
                  <FadeImage
                    src={game.cardImage}
                    alt={game.name}
                    className="aspect-[16/10]"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute -inset-px bg-gradient-to-t from-navy-800 from-0% via-navy-800/60 via-35% to-transparent to-60%" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-base font-bold text-white transition-colors group-hover:text-cyan-400 sm:text-lg">
                      {game.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {serviceCount(game) > 0 ? `${serviceCount(game)} services` : 'Coming soon'}
                    </p>
                  </div>
                </Link>
              ))}
              </div>
              {/* Mobile edge fades — shown on the side(s) with overflowing cards */}
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-navy-900/90 to-transparent transition-opacity duration-300 lg:hidden ${
                  canLeft ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-navy-900/90 to-transparent transition-opacity duration-300 lg:hidden ${
                  canRight ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </Reveal>
        </div>

        {/* Scroll-down cue */}
        <button
          onClick={scrollToFeatured}
          aria-label="Scroll to next section"
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 p-2 text-slate-400/70 transition-colors duration-300 hover:text-cyan-400"
        >
          <ChevronDown className="h-7 w-7 animate-bounce" />
        </button>
      </section>

      {/* ============ FEATURED FFXIV ============ */}
      <section id="featured" className="border-b border-navy-700/50 bg-navy-950/50 pb-12 pt-8 lg:pb-20 lg:pt-10">
        <div className="mx-auto max-w-[1440px] px-[25px] sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-sm:w-full max-sm:text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">Frequently ordered</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
                  FFXIV <span className="text-gradient-cyan">popular picks</span>
                </h2>
              </div>
              <Link
                to="/boosting/ffxiv"
                className="flex shrink-0 items-center gap-1.5 rounded-[5px] border border-navy-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-600/30 hover:text-cyan-400 max-sm:hidden"
              >
                All FFXIV services
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
          {/* One row only: mobile shows 4 (2×2), md 3, lg 4, 5 in a row from
              720p (xl) up; cards that would wrap to another row are removed.
              Cards cap at 280px (ServiceCard max-w) — center them in their
              cells so any extra row width becomes even outer margins. */}
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-5 min-[400px]:grid-cols-2 sm:mt-6 md:grid-cols-3 lg:mt-10 lg:grid-cols-4 xl:grid-cols-5">
            {featured.slice(0, 5).map((s, i) => (
              <Reveal
                key={s.id}
                delay={i * 90}
                className={`w-full max-w-[280px] ${i === 3 ? 'hidden lg:block' : i === 4 ? 'hidden xl:block' : ''}`}
              >
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
          {/* Mobile: same button, centered below the cards */}
          <div className="mt-6 flex justify-center sm:hidden">
            <Link
              to="/boosting/ffxiv"
              className="flex shrink-0 items-center gap-1.5 rounded-[5px] border border-navy-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-600/30 hover:text-cyan-400"
            >
              All FFXIV services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:py-20 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">Why Grand Dice</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Experience <span className="text-gradient-white-blue">the difference</span>
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 min-[480px]:max-sm:gap-3 min-[480px]:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              {/* Contents scale down between 480-640px so the 2x2 grid fits */}
              <div className="card-surface h-full rounded-[5px] p-6 pb-8 text-center min-[480px]:max-sm:p-4 min-[480px]:max-sm:pb-6">
                <div className="relative mx-auto h-14 w-14 min-[480px]:max-sm:h-10 min-[480px]:max-sm:w-10">
                  <Badge className="h-14 w-14 fill-navy-700 text-navy-700 min-[480px]:max-sm:h-10 min-[480px]:max-sm:w-10" strokeWidth={1.5} />
                  <p.icon className="absolute inset-0 m-auto h-6 w-6 text-cyan-400 min-[480px]:max-sm:h-4 min-[480px]:max-sm:w-4" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white min-[480px]:max-sm:mt-3 min-[480px]:max-sm:text-base">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 min-[480px]:max-sm:text-xs">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <section className="border-y border-navy-700/50 bg-navy-950/50 py-12 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-[25px] sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">Player reviews</p>
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
                  <span className="font-semibold text-white">100%</span> from <span className="font-semibold text-white">170+</span> verified ratings on{' '}
                  <a
                    href="https://www.epicnpc.com/members/grand-dice.1661988/#feedback"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-400 underline-offset-2 transition-colors hover:text-cyan-300"
                  >
                    EpicNPC
                  </a>
                </span>
              </div>
            </div>
          </Reveal>
          <div
            ref={reviewsRef}
            className="mt-8 touch-pan-y overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] lg:mt-12"
          >
            <div ref={reviewsTrackRef} className="flex w-max gap-5">
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-gradient-to-br from-cyan-500 to-cyan-700 font-display text-xs font-bold text-navy-900">
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
      <section className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:py-20 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">Three simple steps</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">How it works</h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-12">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative h-full overflow-hidden rounded-[5px] bg-gradient-to-b from-navy-850 to-navy-900 p-7">
                <span className="pointer-events-none absolute right-2 top-1 font-display text-7xl font-extrabold tabular-nums text-navy-700/50">
                  {s.n}
                </span>
                <span className="font-display text-sm font-extrabold text-cyan-400">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-[1440px] px-[25px] pb-4 sm:px-6 lg:px-8">
        <CustomOrderCta />
      </section>
    </div>
  );
}
