import { Link } from 'react-router';
import { BookOpen, Briefcase, Cookie, LifeBuoy, Lock, MessageCircle, Scale, ShieldCheck, Undo2 } from 'lucide-react';
import { games } from '@/data/games';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
  const { toast } = useToast();
  const soon = () =>
    toast({ title: 'Demo link', description: 'This page is not part of the demo build.', variant: 'cyan' });

  return (
    <footer className="mt-8 border-t border-navy-700/60 bg-navy-950/70 lg:mt-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-[25px] py-10 sm:px-6 md:grid-cols-2 lg:flex lg:items-start lg:justify-start lg:gap-[clamp(2.5rem,7vw,11rem)] lg:px-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center gap-2.5 md:justify-start">
            <img src="/images/gd_logo.png" alt="" className="h-9 w-auto" />
            <span className="font-display text-lg font-bold tracking-tight text-white max-md:text-base">
              GRAND DICE
            </span>
          </div>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-slate-400 max-md:text-xs md:mx-0">
            Grand Dice. Professional boosting and carry services by verified top-tier players — safe, fast and
            always hand-played.
          </p>
          <div className="mt-7 flex items-center justify-center gap-5 md:justify-start">
            {[
              { id: 'paypal', label: 'PayPal' },
              { id: 'visa', label: 'Visa' },
              { id: 'mastercard', label: 'Mastercard' },
              { id: 'applepay', label: 'Apple Pay' },
              { id: 'googlepay', label: 'Google Pay' },
            ].map((p) => (
              <img
                key={p.id}
                src={`/payment/${p.id}.svg`}
                alt={p.label}
                title={p.label}
                className="h-[18px] w-auto opacity-90"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        {/* Link columns: 2 on mobile (no Games), 3 from sm, 4 from xl. At lg the
            group hugs the right side (ml-auto); from xl it stretches again. */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-10 md:col-span-2 lg:ml-auto lg:gap-[clamp(1.5rem,3vw,3rem)] xl:ml-0 xl:flex-1 xl:grid-cols-4">
        <div className="hidden sm:block">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-500 max-md:text-xs">Games</h3>
          <ul className="mt-4 space-y-2.5">
            {games.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/boosting/${g.id}`}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400 max-md:text-xs"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-md:pl-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-500 max-md:text-xs">Support</h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { icon: MessageCircle, label: 'Live chat' },
              { icon: LifeBuoy, label: 'FAQ' },
              { icon: ShieldCheck, label: 'Account safety' },
              { icon: BookOpen, label: 'Guides' },
              { icon: Briefcase, label: 'Work with us' },
            ].map((s) => (
              <li key={s.label}>
                <button
                  onClick={soon}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-300 max-md:text-xs"
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-500 max-md:text-xs">
            Legal &amp; Policies
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { icon: Scale, label: 'Terms and conditions', to: '/legal/terms' },
              { icon: Lock, label: 'Privacy policy', to: '/legal/privacy' },
              { icon: Cookie, label: 'Cookie policy', to: '/legal/cookies' },
              { icon: Undo2, label: 'Refund Policy', to: '/legal/refund' },
            ].map((s) => (
              <li key={s.label}>
                <Link
                  to={s.to}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-300 max-md:text-xs"
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden xl:block">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-500 max-md:text-xs">Why Grand Dice</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500 max-md:text-xs">
            <li>Account safety first</li>
            <li>Fast fullfilment</li>
            <li>On-time, guaranteed</li>
            <li>Verified pro roster</li>
          </ul>
        </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-[25px] py-4 text-xs text-slate-500 max-md:text-[11px] sm:px-6 md:flex-row lg:px-8">
          <p className="shrink-0">© 2026 GD Carry • Grand Dice</p>
          <p className="text-center md:text-right lg:whitespace-nowrap">
            Not affiliated with or endorsed by Square Enix, Blizzard Entertainment, Amazon Games, Digital Extremes
            or Jagex.
          </p>
        </div>
      </div>
    </footer>
  );
}
