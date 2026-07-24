import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import PageMeta, { JsonLd } from '@/components/PageMeta';
import Reveal from '@/components/Reveal';

interface FaqAnswer {
  heading?: string;
  text: string;
}

interface FaqItem {
  q: string;
  answers: FaqAnswer[];
}

interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        q: 'Available Payment Methods',
        answers: [
          { text: 'We currently accept PayPal, Cryptocurrency and Revolut as our primary payment methods.' },
        ],
      },
      {
        q: 'Currency',
        answers: [
          {
            text: 'We primarily accept EURO and USD currency. The conversion rate and prices of each product can be changed at the top right of the main page, depending on whether you prefer USD or EURO payments.',
          },
        ],
      },
      {
        q: 'How to pay?',
        answers: [
          { text: 'All payments are made once we can confirm your order and you’re happy with the price.' },
          {
            text: 'There’s no automated payment system in place yet, so every transaction is manually made via the livechat manager.',
          },
        ],
      },
    ],
  },
  {
    id: 'orders',
    title: 'Orders',
    items: [
      {
        q: 'Order Confirmation',
        answers: [
          { text: 'We will confirm your order via Discord or email, depending on what you have provided for chat.' },
        ],
      },
      {
        q: 'Order Cancellation',
        answers: [{ text: 'You are free to cancel any order before it starts.' }],
      },
      {
        q: 'Order Types',
        answers: [
          { text: 'We have three order types.' },
          {
            heading: 'Pilot',
            text: 'This means a raider / booster will be logging into your account using a secure login method and a VPN to mask our location. You don’t need to be logged in during this duration, but you will need to provide the account credentials for the booster to login and start your run. Your account information is not stored and isn’t shared with anyone.',
          },
          {
            heading: 'AFK',
            text: 'This is the alternative to Pilot. For this method you would need to be online at the same time as the raider and will be a part of the party. You don’t need any knowledge of the fight, nor will you be asked to do any DPS aside from accepting raises if the fight requires it. This is for players that want to keep full control of their account.',
          },
          {
            heading: 'Self Play / Coaching',
            text: 'This is the third and last option, where you play alongside the raiders while they coach and help you with the fight itself, practicing with you for the duration of the fight. This is for people that want to enjoy and learn the fight themselves, but don’t want to waste time in pug or party finder groups to fill.',
          },
        ],
      },
    ],
  },
  {
    id: 'general',
    title: 'General',
    items: [
      {
        q: 'How long does an average boost take?',
        answers: [
          {
            text: 'Boosts can take a day or multiple days depending on the size and the end goal of the request. Ultimates and Raids can be done within a day, while long term content like Relics can take up to a week.',
          },
        ],
      },
      {
        q: 'Which data centers do you operate on?',
        answers: [
          {
            text: 'We operate on the North American and European servers primarily, but can take requests from other data centers as well!',
          },
        ],
      },
      {
        q: 'Can the boost be done on PS5?',
        answers: [
          {
            text: 'The boosts can be done on both platforms, though PS5 will have an additional fee — if you wish to avoid that, then purchase the Windows Edition of the game. With the recent patch, all achievements done on PC transfer to PS5.',
          },
        ],
      },
      {
        q: 'Can I do a custom request?',
        answers: [
          {
            text: 'Yes you can — just message us and let us know your custom request. We’ll give you an accurate pricing depending on the difficulty and time it takes to complete it.',
          },
        ],
      },
    ],
  },
];

export default function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answers.map((a) => (a.heading ? `${a.heading}: ${a.text}` : a.text)).join(' '),
        },
      })),
    ),
  };

  return (
    <div>
      <JsonLd data={faqSchema} />
      <PageMeta
        title="FAQ — Payments, Orders & Boost Types"
        description="Frequently asked questions about Grand Dice boosting services: payment methods (PayPal, crypto, Revolut), order types (Pilot, AFK, Self Play / Coaching), delivery times and custom carry requests."
        path="/faq"
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
              <span className="text-cyan-400">FAQ</span>
            </nav>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Frequently Asked Questions
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Payments, orders and everything in between. Can’t find your answer? Reach us through the live chat.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ SECTIONS ============ */}
      <div className="mx-auto max-w-[1440px] px-[25px] py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {SECTIONS.map((section, si) => (
            <div key={section.id} className={si === 0 ? '' : 'mt-12'}>
              <Reveal>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{section.title}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-navy-700/70 to-transparent" />
                </div>
              </Reveal>
              <div className="mt-5 space-y-3">
                {section.items.map((item, i) => {
                  const id = `${section.id}-${i}`;
                  const open = openId === id;
                  return (
                    <Reveal key={id} delay={i * 80}>
                      <div className="card-surface rounded-[5px]">
                        <button
                          onClick={() => setOpenId(open ? null : id)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="font-display text-base font-bold text-white">{item.q}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ${
                            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="space-y-4 px-5 pb-5 text-left">
                              {item.answers.map((a, ai) => (
                                <div key={ai}>
                                  {a.heading && (
                                    <p className="mb-1.5 text-sm font-bold text-cyan-400 max-sm:text-xs">{a.heading}</p>
                                  )}
                                  <p className="text-sm leading-relaxed text-slate-400 max-sm:text-xs">{a.text}</p>
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
            </div>
          ))}

          {/* ============ STILL HAVE QUESTIONS ============ */}
          <Reveal>
            <div className="card-surface mt-12 rounded-[5px] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-display text-base font-bold text-cyan-400">
                <MessageCircle className="h-4 w-4" />
                Still have questions?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Our live chat manager answers around the clock — payments, custom requests and order updates all go
                through the chat.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
