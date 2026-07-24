import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, ChevronRight, Loader2, Mail, MessageCircle, Coins, CalendarClock, Trophy } from 'lucide-react';
import PageMeta from '@/components/PageMeta';
import Reveal from '@/components/Reveal';
import { openLiveChat } from '@/lib/livechat';
import { useToast } from '@/context/ToastContext';

/** Paste your Discord channel webhook URL here — applications are posted as a
    Discord embed for the bot to pick up. While empty, the form falls back to
    opening the live chat instead of submitting. */
const DISCORD_WEBHOOK_URL = '';

const GAMES = ['Final Fantasy XIV', 'World of Warcraft', 'Lost Ark', 'Warframe', 'RuneScape'];

const PERKS = [
  {
    icon: Coins,
    title: 'Paid per order',
    text: 'Transparent per-order rates, paid out on completion. The harder the content, the higher the cut.',
  },
  {
    icon: CalendarClock,
    title: 'Your schedule',
    text: 'Claim only the orders that fit your week. No quotas, no forced shifts — play when you want.',
  },
  {
    icon: Trophy,
    title: 'Elite roster',
    text: 'Ultimate legends, gladiators and world-first raiders. Boost alongside players at your level.',
  },
];

const inputClass = (invalid?: boolean) =>
  `w-full rounded-[3px] border bg-navy-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors ${
    invalid ? 'border-red-500/60' : 'border-navy-700/70 hover:border-navy-600 focus:border-navy-600'
  }`;

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-cyan-400';

export default function WorkWithUsPage() {
  const { toast } = useToast();

  const [discord, setDiscord] = useState('');
  const [email, setEmail] = useState('');
  const [games, setGames] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [proof, setProof] = useState('');
  const [availability, setAvailability] = useState('');
  const [motivation, setMotivation] = useState('');

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stage, setStage] = useState<'form' | 'submitting' | 'done'>('form');

  const discordInvalid = submitAttempted && discord.trim().length < 2;
  const emailInvalid = submitAttempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const gamesInvalid = submitAttempted && games.length === 0;
  const experienceInvalid = submitAttempted && experience.trim().length < 10;

  const toggleGame = (g: string) =>
    setGames((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const valid =
      discord.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      games.length > 0 &&
      experience.trim().length >= 10;
    if (!valid) return;

    // Webhook not wired yet — hand the applicant to the live chat instead.
    if (!DISCORD_WEBHOOK_URL) {
      toast({
        title: 'Almost there',
        description: 'Applications are currently handled by our live chat manager — tell them you want to boost for Grand Dice.',
        variant: 'cyan',
      });
      openLiveChat();
      return;
    }

    setStage('submitting');
    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Grand Dice Applications',
          embeds: [
            {
              title: 'New booster application',
              color: 0x22d3ee,
              timestamp: new Date().toISOString(),
              fields: [
                { name: 'Discord', value: discord.trim(), inline: true },
                { name: 'Email', value: email.trim(), inline: true },
                { name: 'Games', value: games.join(', '), inline: false },
                { name: 'Specialization', value: specialization.trim() || '—', inline: false },
                { name: 'Experience & achievements', value: experience.trim().slice(0, 1024), inline: false },
                { name: 'Proof links', value: proof.trim() || '—', inline: false },
                { name: 'Availability', value: availability.trim() || '—', inline: true },
                { name: 'Why them?', value: motivation.trim() || '—', inline: false },
              ],
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      setStage('done');
    } catch {
      setStage('form');
      toast({
        title: 'Something went wrong',
        description: 'Your application could not be sent. Please try again, or reach us through the live chat.',
        variant: 'cyan',
      });
    }
  };

  return (
    <div>
      <PageMeta
        title="Work With Us — Apply to be a Grand Dice Booster"
        description="Join the Grand Dice roster. Apply to be a Grand Dice booster and get paid to clear FFXIV, WoW, Lost Ark, Warframe and RuneScape content on your own schedule."
        path="/work-with-us"
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
              <span className="text-cyan-400">Work With Us</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Apply to be a <span className="text-gradient-blue">Grand Dice booster</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              You clear the hardest content in your game for fun — we pay you for it. Fill in the application below
              and our roster manager will get back to you on Discord.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ PERKS ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="card-surface flex h-full items-start gap-4 rounded-[5px] p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-navy-800">
                  <p.icon className="h-5 w-5 text-cyan-400" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400 max-sm:text-xs">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ============ APPLICATION FORM ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <section className="purchase-box-glow rounded-[5px] bg-navy-800 p-5 sm:p-8">
              {stage === 'done' ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-cyan-400" strokeWidth={1.5} />
                  <h2 className="mt-4 font-display text-2xl font-bold text-white">Application sent</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                    Thanks for applying to be a Grand Dice booster. Our roster manager reviews every application by
                    hand and will contact you on Discord — usually within a few days.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-lg font-bold text-white">Booster application</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Tell us who you are and what you clear. Fields marked * are required.
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className={labelClass}>Discord username *</span>
                        <div className="relative">
                          <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={discord}
                            onChange={(e) => setDiscord(e.target.value)}
                            placeholder="username"
                            className={`${inputClass(discordInvalid)} pl-10`}
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className={labelClass}>E-mail *</span>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className={`${inputClass(emailInvalid)} pl-10`}
                          />
                        </div>
                      </label>
                    </div>

                    <div>
                      <span className={labelClass}>Games you boost *</span>
                      <div className="flex flex-wrap gap-2">
                        {GAMES.map((g) => {
                          const active = games.includes(g);
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => toggleGame(g)}
                              aria-pressed={active}
                              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                                active
                                  ? 'bg-cyan-600 text-navy-900 glow'
                                  : `border bg-navy-850/80 text-slate-300 hover:text-white ${
                                      gamesInvalid ? 'border-red-500/60' : 'border-navy-700/70'
                                    }`
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block">
                      <span className={labelClass}>Main specialization</span>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Ultimate raider, Savage speed-runner, Deep Dungeon solo, PvP gladiator"
                        className={inputClass()}
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>Experience &amp; achievements *</span>
                      <textarea
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        rows={4}
                        placeholder="Your clears, ranks and titles — e.g. all five Ultimates on multiple jobs, Necromancer, rank 1 Crystalline Conflict…"
                        className={`${inputClass(experienceInvalid)} resize-y`}
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>
                        Proof links{' '}
                        <span className="font-medium normal-case tracking-normal text-slate-600">
                          (FFXIV Logs, raider.io, YouTube…)
                        </span>
                      </span>
                      <input
                        type="text"
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                        placeholder="https://…"
                        className={inputClass()}
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>Availability</span>
                      <input
                        type="text"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. evenings & weekends, EU time"
                        className={inputClass()}
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>Why should we pick you?</span>
                      <textarea
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        rows={3}
                        placeholder="Anything that sets you apart — speedrun times, world-firsts, previous boosting experience…"
                        className={`${inputClass()} resize-y`}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={stage === 'submitting'}
                      className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-gradient-to-r from-cyan-500 to-cyan-700 px-8 py-3.5 font-display text-sm font-bold text-navy-900 transition-all hover:brightness-110 disabled:opacity-60"
                    >
                      {stage === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {stage === 'submitting' ? 'Sending application…' : 'Submit application'}
                    </button>

                    <p className="text-xs leading-relaxed text-slate-500">
                      Submitting sends your application to our roster manager on Discord. We only use your details to
                      review and answer your application.
                    </p>
                  </form>
                </>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
