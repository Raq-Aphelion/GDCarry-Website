import Reveal from './Reveal';
import { useToast } from '@/context/ToastContext';

/** "Can't find your boost?" custom-order call-to-action panel.
    `compact` shortens the secondary text (used inline inside card grids).
    `lateTextBreak` delays the hard text break to 1200px — for the inline grid
    variant, whose column is narrower than the full-width bottom block. */
export default function CustomOrderCta({
  compact = false,
  lateTextBreak = false,
}: {
  compact?: boolean;
  lateTextBreak?: boolean;
}) {
  const { toast } = useToast();

  return (
    <Reveal>
      <div id="custom-order-cta" className="relative overflow-hidden rounded-[5px] bg-gradient-to-r from-navy-800 via-navy-850 to-navy-800 px-8 py-8 sm:px-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="max-w-xl">
            {/* One line only from lg up — below that the row layout + button
                would overflow the panel (visible ~750px and narrower) */}
            <h2 className="font-display text-xl font-extrabold text-white sm:text-3xl lg:whitespace-nowrap">
              Can’t find <span className="text-gradient-blue">your boost?</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {compact ? (
                'Tell us what you need.'
              ) : (
                <>
                  Custom orders are our specialty. Tell us what you need — any game,
                  {/* Desktop only: second clause on its own line */}
                  <br className={lateTextBreak ? 'hidden min-[1200px]:block' : 'hidden lg:block'} /> any goal — and we’ll roll a quote within the hour.
                </>
              )}
            </p>
          </div>
          <button
            onClick={() =>
              toast({
                title: 'Custom order desk',
                description: 'Demo build — the live chat desk would open right here.',
                variant: 'cyan',
              })
            }
            className="shrink-0 rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 px-8 py-3.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110"
          >
            Request a custom order
          </button>
        </div>
      </div>
    </Reveal>
  );
}
