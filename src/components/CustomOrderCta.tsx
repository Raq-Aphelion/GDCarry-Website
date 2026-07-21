import Reveal from './Reveal';
import { useToast } from '@/context/ToastContext';

/** "Can't find your boost?" custom-order call-to-action panel. */
export default function CustomOrderCta() {
  const { toast } = useToast();

  return (
    <Reveal>
      <div id="custom-order-cta" className="relative overflow-hidden rounded-[5px] bg-gradient-to-r from-navy-800 via-navy-850 to-navy-800 px-8 py-8 sm:px-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl text-left">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Can’t find <span className="text-gradient-gold">your boost?</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Custom orders are our specialty. Tell us what you need — any game, any goal — and we’ll roll a quote
              within the hour.
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
            className="shrink-0 rounded-[5px] bg-gradient-to-r from-gold-400 to-gold-600 px-8 py-3.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110"
          >
            Request a custom order
          </button>
        </div>
      </div>
    </Reveal>
  );
}
