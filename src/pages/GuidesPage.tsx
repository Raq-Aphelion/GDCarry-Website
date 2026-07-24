import { Link, Navigate, useParams } from 'react-router';
import { ArrowRight, CalendarClock, ChevronRight } from 'lucide-react';
import PageMeta, { SITE_URL } from '@/components/PageMeta';
import FadeImage from '@/components/FadeImage';
import Reveal from '@/components/Reveal';
import { getGuide, guides, type Guide, type GuideBlock } from '@/data/guides';

function Blocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="mt-3 text-sm leading-relaxed text-slate-400">
            {b.text}
          </p>
        ) : (
          <ul key={i} className="mt-3 space-y-2">
            {b.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-400">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-500/70" />
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

/** Wide horizontal card, ServiceCard-style: image fills the card and fades
    out behind the text at the bottom. */
function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      to={`/guides/${guide.id}`}
      className="group relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-[5px] bg-navy-850 text-left transition-all duration-300 sm:min-h-[320px]"
      aria-label={guide.title}
    >
      {/* Background image, faded behind the text */}
      <div className="absolute -inset-px">
        <FadeImage
          src={guide.image}
          alt=""
          className="h-full w-full"
          imgClassName="object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute -inset-px bg-gradient-to-t from-navy-800 from-[28%] via-navy-800/70 via-[48%] to-transparent to-[70%]" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-end p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-cyan-400 sm:text-xl">
          {guide.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300 max-sm:text-xs">{guide.excerpt}</p>
        <span className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          Read guide
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** /guides — full-width grid of guide cards. */
function GuidesIndex() {
  return (
    <div>
      <PageMeta
        title="Boosting Guides"
        description="Guides on boosting services, gaming boosts and FFXIV carries — what a gaming boost is, how to choose a secure, best-in-class carry service, and why players choose Grand Dice (GD Carry)."
        path="/guides"
      />
      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden border-b border-navy-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-850 via-navy-900 to-navy-850" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(var(--glow-1)_/_0.07),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-[25px] pb-12 pt-16 sm:px-6 lg:px-8">
          <Reveal>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-cyan-400">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-cyan-400">Guides</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Boosting Guides
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Everything about boosting services in one place — what a gaming boost is, how FFXIV boosting and carry
              services work, and how to pick a secure, best-in-class carry from Grand Dice.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ GUIDE CARDS ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((g, i) => (
            <Reveal key={g.id} delay={Math.min(i, 3) * 80}>
              <GuideCard guide={g} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/** /guides/:guideId — article with the guide image faded out behind the header. */
function GuideArticle({ guideId }: { guideId: string }) {
  const guide = getGuide(guideId);

  if (!guide) return <Navigate to="/guides" replace />;

  const others = guides.filter((g) => g.id !== guide.id).slice(0, 2);

  return (
    <div>
      <PageMeta
        title={guide.title}
        description={guide.excerpt.length > 200 ? `${guide.excerpt.slice(0, 197)}...` : guide.excerpt}
        path={`/guides/${guide.id}`}
        ogImage={`${SITE_URL}${guide.image}`}
      />
      {/* ============ HEADER — guide image behind the title, under a gradient ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <FadeImage
            src={guide.image}
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
              <Link to="/guides" className="transition-colors hover:text-cyan-400">
                Guides
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-cyan-400">{guide.navTitle}</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {guide.title}
            </h1>
          </Reveal>
          {guide.updated && (
            <Reveal delay={200}>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-850/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  <CalendarClock className="h-3.5 w-3.5 text-cyan-500" />
                  {guide.updated}
                </span>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ============ ARTICLE ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <Reveal>
            <div className="card-surface rounded-[5px] p-6 sm:p-10">
              <div className="mb-2 border-b border-navy-700/50 pb-6">
                <p className="text-sm leading-relaxed text-slate-400">{guide.excerpt}</p>
              </div>
              {guide.sections.map((s) => (
                <section key={s.heading} className="mt-8">
                  <h2 className="font-display text-lg font-bold text-white sm:text-xl">{s.heading}</h2>
                  <Blocks blocks={s.blocks} />
                </section>
              ))}
              {guide.links && guide.links.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3 border-t border-navy-700/50 pt-6">
                  {guide.links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="flex items-center gap-1.5 rounded-[5px] border border-navy-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-600/30 hover:text-cyan-400"
                    >
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* ============ MORE GUIDES ============ */}
        <Reveal>
          <div className="mt-12 flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">More guides</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent" />
            <Link
              to="/guides"
              className="flex shrink-0 items-center gap-1.5 rounded-[5px] border border-navy-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-600/30 hover:text-cyan-400"
            >
              All guides
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {others.map((g, i) => (
            <Reveal key={g.id} delay={Math.min(i, 3) * 80} className={i === 1 ? 'hidden md:block' : ''}>
              <GuideCard guide={g} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const { guideId } = useParams<{ guideId: string }>();
  return guideId ? <GuideArticle guideId={guideId} /> : <GuidesIndex />;
}
