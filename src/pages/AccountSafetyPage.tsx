import { Link } from 'react-router';
import { ChevronRight, MessageCircle } from 'lucide-react';
import PageMeta from '@/components/PageMeta';
import Reveal from '@/components/Reveal';

interface SafetyBlock {
  type: 'p' | 'ul';
  text?: string;
  items?: string[];
}

interface SafetySection {
  heading: string;
  blocks: SafetyBlock[];
}

const SECTIONS: SafetySection[] = [
  {
    heading: 'How we handle your account',
    blocks: [
      {
        type: 'p',
        text: 'When you order a piloted service, a verified Grand Dice booster logs into your account to complete the job personally. Every order is hand-played from start to finish — we treat your account with the same care we give our own.',
      },
      {
        type: 'ul',
        items: [
          'Hand-played only — no bots, scripts, macros or third-party software of any kind, ever.',
          'VPN-matched sessions — our boosters connect through a VPN location close to yours, so the login never looks unusual.',
          'Offline mode on request — we appear offline while playing, so your friends list never sees the session.',
          'One booster per order — your account is never passed around a team or handed to unvetted players.',
        ],
      },
    ],
  },
  {
    heading: 'Your credentials',
    blocks: [
      {
        type: 'p',
        text: 'Account credentials are only ever requested for piloted orders, and only through the live chat manager handling your order — never through Discord DMs, email threads or any other channel.',
      },
      {
        type: 'ul',
        items: [
          'Credentials are used exclusively for the duration of your service and nothing else.',
          'Your account information is not stored after the order is completed and is never shared with anyone outside the assigned booster.',
          'We recommend setting a temporary password before the boost starts and changing it back once the order is marked complete.',
          'Keep two-factor authentication enabled where the game supports it — our manager will coordinate the login code with you at the agreed time.',
        ],
      },
    ],
  },
  {
    heading: 'What we will never do',
    blocks: [
      {
        type: 'ul',
        items: [
          'Use cheats, exploits, bots or any automation on your account.',
          'Message your friends, free company, linkshell or guild members — or answer whispers on your behalf.',
          'Spend currency, sell items, discard gear or move anything on your account that was not agreed as part of the order.',
          'Change your character, settings, keybinds or UI layout beyond what the service strictly requires.',
          'Ask for your password outside the official order process, or request payment through channels other than those listed in our FAQ.',
        ],
      },
    ],
  },
  {
    heading: 'What you can do for extra safety',
    blocks: [
      {
        type: 'ul',
        items: [
          'Use a unique password for your game account that you do not reuse anywhere else.',
          'Change your password before and after any piloted order.',
          'Avoid logging in while a piloted order is in progress — simultaneous logins interrupt the session and can look suspicious.',
          'If anything about an interaction feels off, stop and confirm it through the live chat on our website before proceeding.',
        ],
      },
    ],
  },
  {
    heading: 'Disclaimers',
    blocks: [
      {
        type: 'p',
        text: 'Account sharing and piloted services are against the Terms of Service of most game publishers, including Square Enix, Blizzard Entertainment, Amazon Games, Digital Extremes and Jagex. While we take every precaution described above — hand-played orders, VPN-matched sessions and offline mode — no precaution can reduce the risk of a warning, suspension or ban to absolute zero.',
      },
      {
        type: 'p',
        text: 'By purchasing a piloted service you acknowledge that you understand and accept this risk. Grand Dice cannot be held liable for any action a game publisher takes against your account as a result of using our services.',
      },
      {
        type: 'p',
        text: 'If you prefer zero account sharing, choose an AFK or Self Play / Coaching order — you keep full control of your account at all times.',
      },
      {
        type: 'p',
        text: 'Grand Dice is not affiliated with or endorsed by Square Enix, Blizzard Entertainment, Amazon Games, Digital Extremes or Jagex. All game names, trademarks and assets are the property of their respective owners.',
      },
    ],
  },
];

function Blocks({ blocks }: { blocks: SafetyBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="mt-3 text-sm leading-relaxed text-slate-400">
            {b.text}
          </p>
        ) : (
          <ul key={i} className="mt-3 space-y-2">
            {b.items?.map((item) => (
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

export default function AccountSafetyPage() {
  return (
    <div>
      <PageMeta
        title="Account Safety — Secure Boosting & Carries"
        description="How Grand Dice keeps your gaming account safe during every order: hand-played boosts, VPN-matched sessions, offline mode and no credential storage — plus all disclaimers."
        path="/account-safety"
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
              <span className="text-cyan-400">Account Safety</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Account Safety
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              How we protect your gaming account during every order — and the risks you should know about before
              purchasing a piloted service.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <Reveal>
            <div className="card-surface rounded-[5px] p-6 sm:p-10">
              {SECTIONS.map((s, i) => (
                <section key={s.heading} className={i === 0 ? '' : 'mt-8'}>
                  <h2 className="font-display text-lg font-bold text-white sm:text-xl">{s.heading}</h2>
                  <Blocks blocks={s.blocks} />
                </section>
              ))}
            </div>
          </Reveal>

          {/* ============ STILL HAVE QUESTIONS ============ */}
          <Reveal>
            <div className="card-surface mt-8 rounded-[5px] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-display text-base font-bold text-cyan-400">
                <MessageCircle className="h-4 w-4" />
                Security concerns?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Talk to our live chat manager before you order — we will walk you through exactly how your account is
                handled for your specific service.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
