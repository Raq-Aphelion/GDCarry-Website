export type GuideBlock = { type: 'p'; text: string } | { type: 'ul'; items: string[] };

export interface GuideSection {
  heading: string;
  blocks: GuideBlock[];
}

export interface Guide {
  id: string;
  /** Full SEO title, rendered as the page h1 */
  title: string;
  /** Short label used in the sidebar and mobile chips */
  navTitle: string;
  /** Card art on the guides grid and the faded header background on the article page */
  image: string;
  excerpt: string;
  updated?: string;
  sections: GuideSection[];
  /** Internal links rendered at the bottom of the guide */
  links?: { label: string; to: string }[];
}

export const guides: Guide[] = [
  {
    id: 'what-are-boosting-services',
    title: 'What Are Boosting Services? The Complete Guide to Gaming Boosts',
    navTitle: 'What are boosting services?',
    image: '/images/guides/boosting-services.jpg',
    excerpt:
      'Boosting services let you hire a verified professional player to complete in-game goals for you or alongside you. This guide explains what a gaming boost is, the types of boosting services available, and how ordering one works from start to finish.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'What is a gaming boost?',
        blocks: [
          {
            type: 'p',
            text: 'A gaming boost is a professional service where a highly skilled player helps you reach an in-game goal faster than you could alone. Boosting services cover almost anything a game can offer: raid clears, dungeon runs, PvP ratings, leveling, rare mounts, achievements and in-game currency. Instead of spending weeks grinding, you hand the goal to a pro — or play alongside one — and simply enjoy the rewards.',
          },
          {
            type: 'p',
            text: 'Modern boosting services are a far cry from the sketchy account-trading forums of the past. The best boosting services today operate like proper businesses: verified pro rosters, scheduled delivery windows, money-back guarantees and live customer support for every gaming boost they sell.',
          },
        ],
      },
      {
        heading: 'Types of boosting services',
        blocks: [
          {
            type: 'ul',
            items: [
              'Piloted boost — a pro logs into your account through a secure, VPN-matched session and completes the goal for you.',
              'AFK carry — you stay logged in and join the party, but the carrying team does all the work. No account sharing required.',
              'Self play / coaching — you play alongside the pros while they teach you the content, so you earn the clear yourself.',
            ],
          },
          {
            type: 'p',
            text: 'Which type of gaming boost you pick depends on how involved you want to be. If you never want to share your account, an AFK carry or self play session gives you the same rewards with zero account access needed.',
          },
        ],
      },
      {
        heading: 'Who uses game boosting services — and why?',
        blocks: [
          {
            type: 'p',
            text: 'Most customers are ordinary players with limited free time: working professionals, parents, students. They buy boosting services to skip repetitive grinding, catch up with friends, unlock time-limited rewards, or experience endgame content without spending months on the gear treadmill. A gaming boost is not about avoiding the game — it is about spending your playtime on the parts you actually enjoy.',
          },
        ],
      },
      {
        heading: 'How ordering a gaming boost works',
        blocks: [
          {
            type: 'ul',
            items: [
              'Pick your boost — browse the catalog, choose a game and a service, and place your order.',
              'Confirm the details — a manager contacts you through live chat, Discord or email to schedule the run and confirm the price.',
              'The pros roll out — a verified booster completes your order inside the agreed delivery window.',
              'Claim the rewards — log back in to your loot, titles, mounts and ratings. Done deal.',
            ],
          },
          {
            type: 'p',
            text: 'Every order type, payment step and delivery estimate is explained in our FAQ — and if none of the listed boosts fits, you can always request a custom order tailored to your exact goal.',
          },
        ],
      },
    ],
    links: [
      { label: 'Browse FFXIV boosting services', to: '/boosting/ffxiv' },
      { label: 'Read the FAQ', to: '/faq' },
    ],
  },
  {
    id: 'ffxiv-boosting-carry-explained',
    title: 'FFXIV Boosting & Carry Services Explained: Raids, Ultimates, Gil and More',
    navTitle: 'FFXIV boosting & carries',
    image: '/images/guides/ffxiv-boosting.jpg',
    excerpt:
      'FFXIV boosting is the single most popular category of game boosting — and for good reason. This guide breaks down every major FFXIV carry service, from Savage raid carries and Ultimate clears to Extreme trials, Deep Dungeons and gil, so you know exactly what to buy.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'What is FFXIV boosting?',
        blocks: [
          {
            type: 'p',
            text: 'FFXIV boosting (also called an FFXIV carry) is a professional service where veteran Final Fantasy XIV players complete difficult or time-consuming content for you or with you. An FFXIV carry service can clear a raid tier, farm a mount, level a job, deliver gil or climb a Deep Dungeon — anything that would otherwise take weeks of grinding or a static group you do not have.',
          },
          {
            type: 'p',
            text: 'Whether you search for "FFXIV boost", "FFXIV carry", "FFXIV boosting service" or "buy FFXIV raid clear", you are looking at the same thing: professional players saving you time in Eorzea.',
          },
        ],
      },
      {
        heading: 'The most popular FFXIV carry services',
        blocks: [
          {
            type: 'ul',
            items: [
              'Savage raid carry — full clears of Arcadion, Pandaemonium, Eden, Omega and Alexander Savage series with loot priority.',
              'Ultimate raid carry — the hardest content in the game: Dragonsong’s Reprise, The Omega Protocol, The Epic of Alexander and more, with title and Ultimate weapon rewards.',
              'Extreme trial boost — every EX trial from Heavensward to Dawntrail, farmed for mounts, weapons and totems.',
              'Deep Dungeon boost — Palace of the Dead, Heaven-on-High, Eureka Orthos and Pilgrim’s Traverse clears, including solo title runs.',
              'Criterion & Variant dungeon carry — mounts, glamour and titles from Sil’dihn, Mount Rokkon and Aloalo, Savage included.',
              'Mount farming — guaranteed Wings mounts, Cerberus, Demi-Ozma and other rare drops farmed until they fall.',
              'FFXIV gil delivery — fast, secure gil packs on any world and any data center.',
            ],
          },
        ],
      },
      {
        heading: 'FFXIV carry vs. FFXIV boost — is there a difference?',
        blocks: [
          {
            type: 'p',
            text: 'In practice, no. "Carry" usually emphasizes that a team plays your character through the content (or carries you in the party), while "boost" emphasizes the end result — a higher item level, a cleared tier, a bigger gil wallet. Every reputable FFXIV boosting service offers both piloted carries and self play options, so the words are interchangeable when you shop.',
          },
        ],
      },
      {
        heading: 'How to buy an FFXIV carry safely',
        blocks: [
          {
            type: 'p',
            text: 'Stick to established FFXIV boosting services with verified reviews, clear delivery windows and a money-back guarantee. If you never want to share your account, choose an AFK FFXIV carry or a coaching session — you keep full control while the pros do the heavy lifting. Read our secure boosting guide and account safety page before your first piloted order.',
          },
        ],
      },
    ],
    links: [
      { label: 'FFXIV Savage raid carries', to: '/boosting/ffxiv?cat=raids' },
      { label: 'FFXIV Ultimate carries', to: '/boosting/ffxiv?cat=ultimate-raids' },
      { label: 'All FFXIV boosting services', to: '/boosting/ffxiv' },
    ],
  },
  {
    id: 'secure-boosting',
    title: 'Secure Boosting: How Safe Carry Services Protect Your Account',
    navTitle: 'Secure boosting',
    image: '/images/guides/secure-boosting.jpg',
    excerpt:
      'A secure boosting service protects your account with hand-played orders, VPN-matched logins and strict credential hygiene. Here is how safe carry services actually work — and the red flags that tell you to walk away.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'What makes a boosting service "secure"?',
        blocks: [
          {
            type: 'p',
            text: 'Secure boosting means every part of the order is engineered around account safety: real humans playing by hand, logins that look like your own, and credentials that are never stored or shared. A secure carry is not a marketing slogan — it is a checklist of concrete practices the provider follows on every single order.',
          },
        ],
      },
      {
        heading: 'The secure boosting checklist',
        blocks: [
          {
            type: 'ul',
            items: [
              'Hand-played only — no bots, scripts or automation that anti-cheat systems can detect.',
              'VPN-matched sessions — the booster logs in from a location close to yours.',
              'Offline mode — the booster appears offline so your friends list never notices.',
              'No credential storage — your login details are used for the order and discarded afterwards.',
              'Secure payment methods — PayPal, Revolut or crypto, confirmed by a real manager before any money moves.',
              'Money-back guarantee — a secure service stands behind its delivery windows.',
            ],
          },
        ],
      },
      {
        heading: 'Red flags of an unsafe carry service',
        blocks: [
          {
            type: 'ul',
            items: [
              'Prices far below every competitor — cheap boosts are usually botted boosts.',
              'Asking for credentials through random Discord DMs instead of an official order process.',
              'No reviews, no refund policy, no named team — anonymity protects the scammer, not you.',
              'Pressure to disable two-factor authentication permanently rather than coordinating a login window.',
            ],
          },
        ],
      },
      {
        heading: 'The safest order types',
        blocks: [
          {
            type: 'p',
            text: 'If you want zero account sharing, pick an AFK carry or a self play / coaching session: you stay logged in, you keep full control, and the carrying team does the work with you in the party. When you do choose a piloted boost, set a temporary password first and change it back after completion. Our account safety page documents exactly how Grand Dice handles your account on every order.',
          },
        ],
      },
    ],
    links: [
      { label: 'Read our Account Safety policy', to: '/account-safety' },
      { label: 'Payments & order types FAQ', to: '/faq' },
    ],
  },
  {
    id: 'best-boosting-service',
    title: 'How to Choose the Best Boosting Service (and Avoid the Rest)',
    navTitle: 'Choosing the best service',
    image: '/images/guides/best-boosting.jpg',
    excerpt:
      'Every provider claims to be the best boosting service on the market. This checklist separates genuinely professional carry services from resellers and bot farms — before your account and your money are on the line.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'What "the best boosting service" actually means',
        blocks: [
          {
            type: 'p',
            text: 'The best boosting service is not the cheapest one — it is the one that completes your order safely, on time, exactly as described. The best carry services combine three things: genuinely elite players, professional operations (scheduling, support, guarantees) and transparent pricing with no hidden fees.',
          },
        ],
      },
      {
        heading: 'The quality checklist',
        blocks: [
          {
            type: 'ul',
            items: [
              'Verified pro roster — the best boosting services name their standard: world-class raiders, top PvP players, vetted and reviewed boosters.',
              'Delivery windows — every order carries a deadline, and the best providers compensate you if they run late.',
              'Money-back guarantee — if the service cannot deliver, you do not pay.',
              'Real-time support — a live chat manager who answers before, during and after your order.',
              'Genuine reviews — look for detailed, believable customer feedback rather than walls of generic five stars.',
            ],
          },
        ],
      },
      {
        heading: 'Why the cheapest carry is rarely the best carry',
        blocks: [
          {
            type: 'p',
            text: 'Rock-bottom prices are almost always subsidized by cutting corners: botted runs, shared boosters juggling ten accounts, or outright scams. A professional carry service pays world-class players for their time — if the price could not cover a skilled human, a skilled human is not what you are getting.',
          },
        ],
      },
      {
        heading: 'Questions to ask before you order',
        blocks: [
          {
            type: 'ul',
            items: [
              'Is the order hand-played, and can I get it AFK or self play instead?',
              'What is the exact delivery window — and what happens if you miss it?',
              'How are my credentials handled, and are they deleted afterwards?',
              'Which payment methods do you accept, and when is payment collected?',
            ],
          },
          {
            type: 'p',
            text: 'Any provider that hesitates on these questions is telling you something. The best boosting services answer them on their website before you even ask — which is exactly what we built Grand Dice to do.',
          },
        ],
      },
    ],
    links: [
      { label: 'Why players choose Grand Dice', to: '/guides/why-grand-dice' },
      { label: 'Browse all FFXIV services', to: '/boosting/ffxiv' },
    ],
  },
  {
    id: 'why-grand-dice',
    title: 'Why Players Choose Grand Dice: The GD Carry Difference',
    navTitle: 'Why Grand Dice?',
    image: '/images/guides/grand-dice.jpg',
    excerpt:
      'Grand Dice — also known as Grand Dice Carry, GD Carry or GD Boost — is a professional boosting service built by top-tier players. Here is who we are, what makes GD Carry different, and why thousands of gamers trust us with their accounts.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'Who is Grand Dice?',
        blocks: [
          {
            type: 'p',
            text: 'Grand Dice (GD Carry) is a professional game boosting and carry service covering Final Fantasy XIV, World of Warcraft, Lost Ark, Warframe and RuneScape. Whether you found us by searching Grand Dice, Grand Dice Carry, GD Carry or GD Boost — you are in the right place: the same team, the same verified pros, the same guarantee.',
          },
          {
            type: 'p',
            text: 'Our roster is built from Ultimate legends, gladiators and world-first raiders. Every Grand Dice booster is vetted, ranked and reviewed before they touch a single customer order — and every service on the site is hand-played, always.',
          },
        ],
      },
      {
        heading: 'What makes GD Carry different',
        blocks: [
          {
            type: 'ul',
            items: [
              'Account safety first — VPN-matched sessions, offline mode on request and zero third-party software. Your account never takes the risk — we do the rolling.',
              'Fast fulfilment — our own in-house team attends every order within the first day of purchase.',
              'On-time, guaranteed — every GD Boost order carries a delivery window; run late and the difference comes back to your wallet automatically.',
              'Verified pro roster — Ultimate legends, gladiators and world-first raiders, vetted and reviewed.',
            ],
          },
        ],
      },
      {
        heading: 'A boosting service built for FFXIV first',
        blocks: [
          {
            type: 'p',
            text: 'FFXIV boosting is our flagship category. Grand Dice Carry fields Ultimate raiders, Savage speed-runners and Deep Dungeon veterans covering every FFXIV carry imaginable — Savage and Ultimate raid carries, Extreme trial farms, Criterion dungeons, mount farming, gil delivery, PvP climbs, leveling and coaching. If it exists in Eorzea, a GD Carry pro can clear it.',
          },
        ],
      },
      {
        heading: 'How to start your GD Boost today',
        blocks: [
          {
            type: 'p',
            text: 'Browse the catalog, pick your boost, and drop it in the cart — a live chat manager confirms the schedule and price before any payment is made. Custom goal that is not listed? Request a custom order and Grand Dice will roll a quote within the hour.',
          },
        ],
      },
    ],
    links: [
      { label: 'Browse FFXIV carries', to: '/boosting/ffxiv' },
      { label: 'Our account safety practices', to: '/account-safety' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    id: 'ffxiv-carry-glossary',
    title: 'FFXIV Carry Glossary: Savage, Ultimate, Extreme Trials and Deep Dungeons Explained',
    navTitle: 'FFXIV carry glossary',
    image: '/images/guides/ffxiv-glossary.jpg',
    excerpt:
      'Shopping for an FFXIV carry but lost in the jargon? This glossary explains every major type of FFXIV boosting service — Savage carries, Ultimate boosts, Extreme trial farms, Deep Dungeon clears, Criterion dungeons, mount farming and gil — so you buy exactly what you need.',
    updated: 'Last Updated 24th July 2026',
    sections: [
      {
        heading: 'Savage raid carry',
        blocks: [
          {
            type: 'p',
            text: 'Savage is FFXIV’s high-end eight-player raid difficulty, released in four-fight tiers each expansion. An FFXIV Savage carry gets you full clears of the current Arcadion series or any legacy series — Pandaemonium, Eden, Omega and Alexander — with loot priority on your job, exclusive mounts and minions.',
          },
        ],
      },
      {
        heading: 'Ultimate raid boost',
        blocks: [
          {
            type: 'p',
            text: 'Ultimates are the hardest encounters in Final Fantasy XIV — fifteen-minute gauntlets like Dragonsong’s Reprise, The Omega Protocol and The Epic of Alexander. An Ultimate carry earns you the Adventure Plate, the title and the glowing Ultimate weapon that proves you conquered the peak of FFXIV raiding.',
          },
        ],
      },
      {
        heading: 'Extreme trial farm',
        blocks: [
          {
            type: 'p',
            text: 'Extreme trials are single-boss fights with rare mount drops and high item level weapons. An FFXIV Extreme trial boost farms any EX from Heavensward to Dawntrail — including the Minstrel’s Ballad versions — until your mount and totems are secured.',
          },
        ],
      },
      {
        heading: 'Deep Dungeon clear',
        blocks: [
          {
            type: 'p',
            text: 'Deep Dungeons — Palace of the Dead, Heaven-on-High, Eureka Orthos and Pilgrim’s Traverse — are roguelike climbs with their own progression systems and prestigious solo titles like Necromancer. A Deep Dungeon boost clears the floors you need, including full solo title runs.',
          },
        ],
      },
      {
        heading: 'Criterion and Variant dungeon carry',
        blocks: [
          {
            type: 'p',
            text: 'Criterion and Variant dungeons are FFXIV’s small-scale hardcore content for one to four players: the Sil’dihn Subterrane, Mount Rokkon and Aloalo Island. A Criterion carry covers story routes, all-paths mount rewards, glamour sets and the brutal Savage versions with their exclusive titles.',
          },
        ],
      },
      {
        heading: 'Mount farming and gil services',
        blocks: [
          {
            type: 'p',
            text: 'Mount farming services guarantee rare drops — the Wings mounts, Cerberus, Demi-Ozma and more — farmed until they fall, so you never rely on luck. FFXIV gil services deliver any amount of currency to any world through secure trade, usually within hours.',
          },
          {
            type: 'p',
            text: 'Whatever your goal in Eorzea, there is an FFXIV boosting service built for it — and Grand Dice carries them all.',
          },
        ],
      },
    ],
    links: [
      { label: 'All FFXIV boosting services', to: '/boosting/ffxiv' },
      { label: 'FFXIV boosting explained', to: '/guides/ffxiv-boosting-carry-explained' },
    ],
  },
];

export function getGuide(id?: string) {
  return guides.find((g) => g.id === id);
}
