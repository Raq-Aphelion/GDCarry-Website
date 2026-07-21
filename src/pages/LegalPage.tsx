import { Link, Navigate, NavLink, useParams } from 'react-router';
import { CalendarClock, ChevronRight, MessageCircle } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getLegalDoc, legalDocs, type LegalBlock } from '@/data/legal';

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
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
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-400/70" />
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export default function LegalPage() {
  const { docId } = useParams<{ docId: string }>();
  const doc = getLegalDoc(docId);

  if (!doc) return <Navigate to="/legal/terms" replace />;

  return (
    <div>
      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden border-b border-navy-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-850 via-navy-900 to-navy-850" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(var(--glow-1)_/_0.07),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <Reveal>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-gold-300">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Legal &amp; Policies</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-gold-300">{doc.title}</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {doc.title}
            </h1>
          </Reveal>
          {doc.updated && (
            <Reveal delay={200}>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-850/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  <CalendarClock className="h-3.5 w-3.5 text-gold-400" />
                  {doc.updated}
                </span>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ============ MOBILE CATEGORY CHIPS ============ */}
      <div className="sticky top-16 z-30 border-b border-navy-700/50 bg-navy-900/85 backdrop-blur-xl lg:hidden">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {legalDocs.map((d) => (
            <NavLink
              key={d.id}
              to={`/legal/${d.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                d.id === doc.id
                  ? 'bg-gold-500 text-navy-900 gold-glow'
                  : 'border border-navy-700/70 bg-navy-850/80 text-slate-300 hover:text-white'
              }`}
            >
              {d.title}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ============ SIDEBAR + DOCUMENT ============ */}
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        {/* Left: legal categories */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Legal &amp; Policies</p>
            <ul className="mt-3 divide-y divide-navy-700/50">
              {legalDocs.map((d) => (
                <li key={d.id}>
                  <NavLink
                    to={`/legal/${d.id}`}
                    className={`flex w-full items-center rounded-[5px] px-3 py-3 text-left text-sm transition-colors ${
                      d.id === doc.id
                        ? 'bg-navy-800 font-semibold text-gold-300'
                        : 'text-slate-400 hover:bg-navy-850 hover:text-white'
                    }`}
                  >
                    {d.title}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[5px] bg-navy-850 p-4">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-gold-300">
                <MessageCircle className="h-4 w-4" />
                Questions?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Contact us through our live chat.
              </p>
            </div>
          </div>
        </aside>

        {/* Right: the document */}
        <div key={doc.id}>
          <Reveal>
            <div className="card-surface rounded-[5px] p-6 sm:p-10">
              {doc.intro.length > 0 && (
                <div className="mb-2 border-b border-navy-700/50 pb-6">
                  <Blocks blocks={doc.intro} />
                </div>
              )}
              {doc.sections.map((s, i) => (
                <section key={s.heading} className={i === 0 && doc.intro.length === 0 ? '' : 'mt-8'}>
                  <h2 className="font-display text-lg font-bold text-white sm:text-xl">{s.heading}</h2>
                  <Blocks blocks={s.blocks} />
                </section>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
