import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ArrowRight, BadgeCheck, ChevronDown, ChevronRight, Gamepad2, Gem, Medal, Swords, Trophy } from 'lucide-react';
import CustomOrderCta from '@/components/CustomOrderCta';
import FadeImage from '@/components/FadeImage';
import MobileCategoryBar from '@/components/MobileCategoryBar';
import PurchaseBox from '@/components/PurchaseBox';
import Reveal from '@/components/Reveal';
import ServiceCard from '@/components/ServiceCard';
import { getGame } from '@/data/games';
import useDragScroll from '@/hooks/useDragScroll';

const REWARDS = [
  {
    icon: Gem,
    title: 'Dragonsong Totem',
    text: 'Ultimate Specific totems that can be exchanged for a weapon of your choosing.',
  },
  {
    icon: BadgeCheck,
    title: "Dragonsong's Reprise Adventure Plate",
    text: 'Exclusive Adventure Plate Designs.',
  },
  {
    icon: Trophy,
    title: "The Heavens' Legend",
    text: 'Exclusive title acquired from completing the duty.',
  },
  {
    icon: Medal,
    title: 'Achievement: “As Suits a Hero”',
    text: "Achievement unlocked upon defeating King Thordan in Dragonsong's Reprise.",
  },
];

interface AccordionSection {
  title: string;
  items?: string[];
  groups?: { heading: string; items: string[] }[];
}

const ACCORDION: AccordionSection[] = [
  {
    title: 'Requirements',
    items: [
      'Have a level 100 Job',
      'Own the Dawntrail Expansion',
      'Asphodelos: The Fourth Circle (Savage) Completed',
      'ilvl 740 or higher gear',
    ],
  },
  {
    title: 'How does it work?',
    items: [
      'Contact The Live Chat',
      'Pay the required amount with your selected payment method',
      "It's scheduled based on raider availability and times you'll be logged in",
      "You'll be notified of completion via discord or email",
    ],
  },
  {
    title: 'Piloted vs AFK Carry',
    groups: [
      {
        heading: 'Piloted Version',
        items: ['A Professional Raider will be logged onto your account and complete the content on your behalf'],
      },
      {
        heading: 'AFK Carry',
        items: [
          'AFK Carry is a non-piloted version of the clear where you clear as a sandbag',
          "You'll join the party with the rest of the team via your own PC / PS5 / XBOX",
          'Some of the more difficult carries will require you to accept raises',
          'No knowledge of the fight is required for an AFK Carry',
        ],
      },
    ],
  },
];

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-400">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-500/70" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ServicePage() {
  const { gameId, serviceId } = useParams<{ gameId: string; serviceId: string }>();
  const game = gameId ? getGame(gameId) : undefined;
  const sub = game?.subcategories.find((s) => s.services.some((sv) => sv.id === serviceId));
  const service = sub?.services.find((sv) => sv.id === serviceId);
  const [openSection, setOpenSection] = useState(0);

  // Tags row: draggable carousel on mobile, with edge fades like the other carousels
  const tagsRef = useDragScroll();
  const [tagsLeft, setTagsLeft] = useState(false);
  const [tagsRight, setTagsRight] = useState(false);

  const updateTagFades = () => {
    const el = tagsRef.current;
    if (!el) return;
    setTagsLeft(el.scrollLeft > 4);
    setTagsRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateTagFades();
    window.addEventListener('resize', updateTagFades);
    return () => window.removeEventListener('resize', updateTagFades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chips themselves fade to transparent at overflowing edges (mobile only —
  // on sm+ the row wraps instead of scrolling, so both states stay false)
  const tagsMask =
    tagsLeft && tagsRight
      ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)'
      : tagsLeft
        ? 'linear-gradient(to right, transparent, black 24px)'
        : tagsRight
          ? 'linear-gradient(to left, transparent, black 24px)'
          : undefined;

  if (!game || !sub || !service) return <Navigate to={game ? `/boosting/${game.id}` : '/'} replace />;

  const points = [
    { icon: Swords, text: service.delivery },
    { icon: BadgeCheck, text: service.description },
    { icon: Gamepad2, text: service.note ?? 'Hand-played · Money-back guarantee' },
  ];

  const others = sub.services.filter((sv) => sv.id !== service.id);

  const header = (
    <div>
      <Reveal>
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-cyan-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={`/boosting/${game.id}`} className="transition-colors hover:text-cyan-400">
            {game.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            to={`/boosting/${game.id}?cat=${sub.id}`}
            className="transition-colors hover:text-cyan-400"
          >
            {sub.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-cyan-400">DSR</span>
        </nav>
      </Reveal>
      <Reveal delay={100}>
        <h1 className="mt-5 text-left font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {service.name}
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <p className="mt-4 max-w-2xl text-left text-xs leading-relaxed text-slate-300 sm:text-sm">
          {service.longDescription ?? service.description}
        </p>
      </Reveal>
      <Reveal delay={300}>
        <div className="mt-6">
          <div
            ref={tagsRef}
            onScroll={updateTagFades}
            style={{ maskImage: tagsMask, WebkitMaskImage: tagsMask }}
            className="no-scrollbar flex touch-pan-y gap-3 max-sm:overflow-x-auto sm:flex-wrap"
          >
            {points.map((p, i) => (
              <span
                key={p.text}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-850/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm"
              >
                <p.icon className={`h-3.5 w-3.5 ${i === 1 ? 'text-cyan-400' : 'text-cyan-500'}`} />
                {p.text}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );

  const body = (
    <div className="min-w-0">
      {/* ============ DUTY'S REWARDS ============ */}
      <Reveal>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Duty&apos;s Rewards</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent" />
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="card-surface mt-5 divide-y divide-navy-700/50 rounded-[5px]">
          {REWARDS.map((r) => (
            <div key={r.title} className="flex items-start gap-4 p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-navy-800">
                <r.icon className="h-5 w-5 text-cyan-400" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold text-white">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ============ INFO ACCORDION ============ */}
      <div className="mt-8 space-y-3">
        {ACCORDION.map((s, i) => {
          const open = openSection === i;
          return (
            <Reveal key={s.title} delay={i * 80}>
              <div className="card-surface rounded-[5px]">
                <button
                  onClick={() => setOpenSection(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display text-base font-bold text-white">{s.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 px-5 pb-5 text-left">
                      {s.items && <Bullets items={s.items} />}
                      {s.groups?.map((g) => (
                        <div key={g.heading}>
                          <p className="mb-2.5 text-sm font-bold text-white">{g.heading}</p>
                          <Bullets items={g.items} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* ============ MORE FROM THIS CATEGORY ============ */}
      <Reveal>
        <div className="mt-12 flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            More from <br className="sm:hidden" />
            {sub.name}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent" />
          <Link
            to={`/boosting/${game.id}?cat=${sub.id}`}
            className="flex shrink-0 items-center gap-1.5 rounded-[5px] border border-navy-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-600/30 hover:text-cyan-400"
          >
            Check all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {others.slice(0, 3).map((sv, i) => (
          <Reveal key={sv.id} delay={Math.min(i, 3) * 80} className={i === 1 ? 'hidden sm:block' : i === 2 ? 'hidden xl:block' : ''}>
            <ServiceCard service={sv} />
          </Reveal>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* ============ MOBILE CATEGORY CAROUSEL — seamless with the navbar ============ */}
      <MobileCategoryBar items={game.subcategories} activeId={sub.id} gameId={game.id} />

      {/* ============ SIDEBAR + CONTENT + PURCHASE ============ */}
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-[25px] py-10 sm:px-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_340px] lg:gap-8 lg:py-12 lg:px-8">
        {/* Faded game art behind the top of the page — same background as the game subpage */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[460px] w-screen -translate-x-1/2" aria-hidden>
          <div className="absolute inset-0">
            <FadeImage src={game.cardImage} alt="" className="h-full w-full" imgClassName="grayscale" />
            {/* Slight navy veil over the greyscale art */}
            <div className="absolute inset-0 bg-navy-500/50" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/75 to-navy-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/60" />
        </div>

        {/* Left: categories, pushed to the top */}
        <aside id="category-sidebar" className="hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block">
          <div className="sticky top-8">
            <p className="px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Categories</p>
            <ul className="mt-3 divide-y divide-navy-700/50">
              {game.subcategories.map((s) => {
                const isActive = s.id === sub.id;
                return (
                  <li key={s.id}>
                    <Link
                      to={`/boosting/${game.id}?cat=${s.id}`}
                      className={`flex w-full items-center justify-between rounded-[5px] px-3 py-3 text-left text-sm transition-colors ${
                        isActive
                          ? 'bg-navy-800 font-semibold text-cyan-400'
                          : 'text-slate-400 hover:bg-navy-850 hover:text-white'
                      }`}
                    >
                      {s.name}
                      <span className={`text-xs ${isActive ? 'text-cyan-400/70' : 'text-slate-500'}`}>
                        {s.services.length}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div id="sidebar-bottom-cta" className="mt-8 rounded-[5px] bg-navy-850 p-4">
              <p className="font-display text-sm font-bold text-cyan-400">Need something else?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Custom {game.short} orders are quoted within the hour.
              </p>
            </div>
          </div>
        </aside>

        {/* Middle top: title, text, tags — negative margin trims the flex gap below on mobile */}
        <div className="min-w-0 max-lg:-mb-4 lg:col-start-2 lg:row-start-1">{header}</div>

        {/* Right: purchase block (price block floats via its own sticky) */}
        <aside className="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col">
          <PurchaseBox service={service} gameShort={game.short} />
        </aside>

        {/* Middle: rewards + accordion + related */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-2">{body}</div>
      </div>

      {/* ============ CUSTOM ORDER CTA ============ */}
      <section id="custom-order-section" className="mx-auto max-w-[1440px] px-[25px] pb-4 sm:px-6 lg:px-8">
        <CustomOrderCta />
      </section>
    </div>
  );
}
