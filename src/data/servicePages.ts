import { ArrowUp, BadgeCheck, Coins, Gem, Medal, ShieldCheck, Swords, Timer, Trophy, Undo2, type LucideIcon } from 'lucide-react';

export interface ServicePageReward {
  icon: LucideIcon;
  title: string;
  text?: string;
  /** Replaces `text`: mount names rendered as buttons (future mount links) */
  items?: string[];
}

export interface ServicePageAccordionSection {
  title: string;
  items?: string[];
  groups?: { heading: string; items: string[] }[];
}

export interface ServicePageContent {
  /** Short label used as the last breadcrumb segment, e.g. 'DSR' */
  short: string;
  /** Section heading above the rewards — defaults to "Duty's Rewards" */
  rewardsHeading?: string;
  rewards: ServicePageReward[];
  accordion: ServicePageAccordionSection[];
}

const HOW_IT_WORKS: ServicePageAccordionSection = {
  title: 'How does it work?',
  items: [
    'Contact The Live Chat',
    'Pay the required amount with your selected payment method',
    "It's scheduled based on our availability and times you'll be logged in",
    "You'll be notified of completion via discord or email",
  ],
};

const PILOTED_VS_AFK: ServicePageAccordionSection = {
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
};

const PILOTED_ONLY: ServicePageAccordionSection = {
  title: 'Piloted Version',
  groups: [
    {
      heading: 'Piloted Version',
      items: ['A Professional Raider will be logged onto your account and complete the content on your behalf'],
    },
  ],
};

/** Requirements shared by every Ultimate; `duty` is the unlock duty line. */
const requirements = (duty: string, ilvl: string): ServicePageAccordionSection => ({
  title: 'Requirements',
  items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', duty, ilvl],
});

const rewards = (
  totem: string,
  plate: string,
  title: string,
  achievement: { title: string; text: string },
): ServicePageReward[] => [
  {
    icon: Gem,
    title: totem,
    text: 'Ultimate Specific totems that can be exchanged for a weapon of your choosing.',
  },
  {
    icon: BadgeCheck,
    title: plate,
    text: 'Exclusive Adventure Plate Designs.',
  },
  {
    icon: Trophy,
    title,
    text: 'Exclusive title acquired from completing the duty.',
  },
  {
    icon: Medal,
    title: achievement.title,
    text: achievement.text,
  },
];

/** Dedicated subpage content per service. Any service id present here gets a
    /boosting/ffxiv/<id> subpage; everything else links to its category page. */
export const SERVICE_PAGES: Record<string, ServicePageContent> = {
  'ffxiv-dsr': {
    short: 'DSR',
    rewards: rewards(
      'Dragonsong Totem',
      "Dragonsong's Reprise Adventure Plate",
      "The Heavens' Legend",
      {
        title: 'Achievement: “As Suits a Hero”',
        text: "Achievement unlocked upon defeating King Thordan in Dragonsong's Reprise.",
      },
    ),
    accordion: [
      requirements('Asphodelos: The Fourth Circle (Savage) Completed', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-ucob': {
    short: 'UCOB',
    rewards: rewards(
      'Dreadwyrm Totem',
      'The Unending Coil of Bahamut Adventure Plate',
      'The Legend',
      {
        title: 'Achievement: “Resistance is Futile”',
        text: 'Achievement unlocked upon defeating Bahamut Prime in The Unending Coil of Bahamut.',
      },
    ),
    accordion: [
      requirements('Deltascape V4.0 (Savage) Completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-uwu': {
    short: 'UWU',
    rewards: rewards(
      'Ultima Totem',
      "The Weapon's Refrain Adventure Plate",
      'The Ultimate Legend',
      {
        title: 'Ultimate Achievement',
        text: "Achievement unlocked upon defeating The Ultima Weapon in The Weapon's Refrain.",
      },
    ),
    accordion: [
      requirements('Sigmascape V4.0 (Savage) Completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-tea': {
    short: 'TEA',
    rewards: rewards(
      'Colossus Totem',
      'The Epic of Alexander Adventure Plate',
      'The Perfect Legend',
      {
        title: 'Achievement: “When I Ruled the World”',
        text: 'Achievement unlocked upon defeating Perfect Alexander in The Epic of Alexander.',
      },
    ),
    accordion: [
      requirements("Eden's Gate: Sepulture (Savage) Completed (available as an add-on)", 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-top': {
    short: 'TOP',
    rewards: rewards(
      'Omega Totem',
      'The Omega Protocol Adventure Plate',
      'The Alpha Legend',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon defeating Alpha Omega in The Omega Protocol.',
      },
    ),
    accordion: [
      requirements('Abyssos: The Eighth Circle (Savage) Completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-fru': {
    short: 'FRU',
    rewards: rewards(
      'Oracle Totem',
      'The Futures Rewritten Adventure Plate',
      'Genesis of Legends',
      {
        title: 'Achievement: “Alternative Destiny”',
        text: 'Achievement unlocked upon completing The Futures Rewritten.',
      },
    ),
    accordion: [
      requirements('AAC Light-heavyweight M4 (Savage) Completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-dmu': {
    short: 'DMU',
    rewards: rewards(
      "Mad Harlequin's Totem",
      'The Dancing Mad Adventure Plate (in a later patch)',
      'Cruel Legend Title',
      {
        title: 'Achievement: “Son of a…”',
        text: 'Achievement unlocked upon defeating Ultimate Kefka.',
      },
    ),
    accordion: [
      requirements('AAC Heavyweight M4 (Savage) Completed (available as an add-on)', 'ilvl 790 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-ultimate-bundle': {
    short: 'Bundle',
    rewards: [
      {
        icon: Gem,
        title: '6 Piloted Totems OR 4 AFK ones',
        text: 'Every Ultimate weapon from UWU, UCOB, TEA, DSR, TOP and FRU in one bundle.',
      },
      {
        icon: BadgeCheck,
        title: 'All Adventure Plates',
        text: 'Exclusive Adventure Plate Designs from every included Ultimate.',
      },
      {
        icon: Trophy,
        title: 'All Ultimate Titles',
        text: 'Every Legend title acquired from completing the duties.',
      },
      {
        icon: Medal,
        title: 'All Ultimate Achievements',
        text: 'Achievements unlocked upon completing every included Ultimate.',
      },
    ],
    accordion: [
      requirements('All revelant savage fights Completed (M4S, P4S, P8S, E4S, O4S and O8S)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
};

/** The FFXIV Gil subpage — same layout as the ultimate pages, but with its
    own GilPurchaseBox instead of the standard one. */
SERVICE_PAGES['ffxiv-gil-pack'] = {
  short: 'Gil',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Coins,
      title: 'Any Amount, Any World',
      text: 'From 5M to 900M gil per order — delivered to any world on any data center.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Trade Methods',
      text: 'Only the safest hand-trade methods are used for every delivery.',
    },
    {
      icon: Timer,
      title: '15 Minute Average Delivery',
      text: 'Most orders are delivered within minutes of confirmation.',
    },
    {
      icon: Undo2,
      title: 'Money-Back Guarantee',
      text: 'If we can not deliver on time, the difference comes back to you.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have an active Final Fantasy XIV account subscription (Free Trial accounts cannot trade)',
        'Reach level 10 or higher with unlocked access to residential zones',
        'Be available for the trade at the agreed place and time',
      ],
    },
    HOW_IT_WORKS,
    {
      title: 'How is the gil delivered?',
      groups: [
        {
          heading: 'Secure trade',
          items: [
            'A manager schedules the trade with you right after the order is confirmed',
            'The gil is handed over in-game using only the safest trade methods',
            'You confirm the received amount and the order is marked complete',
          ],
        },
      ],
    },
  ],
};

SERVICE_PAGES['ffxiv-pandaemonium-savage'] = {
  short: 'Pandaemonium',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: 'Savage gear ranging from ilvl 600 to 660 depending on the tier (various weapon types).',
    },
    {
      icon: Trophy,
      title: 'Encounter Specific Mounts (Not guaranteed)',
      items: ['Demi-Phoinix', 'Sunforged', 'Megaloambystoma'],
    },
    {
      icon: Gem,
      title: 'Wind-up Athena (P12S)',
      text: 'Exclusive glamour and pet drops from the savage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: “Apotheosis Agria I” & More',
      text: 'Achievement unlocked upon defeating Endwalker Savage Tier.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 100 Job',
        'Own the Dawntrail Expansion',
        'Normal Mode Completion / Fight Unlocked (available as additional services)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-arcadion-savage'] = {
  short: 'Arcadion',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: "Dark Horse, Babyface & Grand Champion gear ranging from ilvl 730 to 795 depending on the tier.",
    },
    {
      icon: Trophy,
      title: 'Encounter Specific Mounts (Not guaranteed)',
      items: ['Monowheel S1', 'Air-wheeler C9', 'Lowrider T1RANT'],
    },
    {
      icon: Gem,
      title: 'Black Cat Card, Illustrated Tokens & Facewear',
      text: 'Exclusive collectibles, exchange tokens and glamour from the savage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: “Cruising at the Savage Apex I” & More',
      text: 'Achievement unlocked upon defeating Dawntrail Savage Tier.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 100 Job',
        'Own the Dawntrail Expansion',
        'Normal Mode Completion / Fight Unlocked (available as additional services)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-eden-savage'] = {
  short: 'Eden',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: 'Savage gear ranging from ilvl 470 to 535 depending on the tier (various weapon types).',
    },
    {
      icon: Trophy,
      title: 'Encounter Specific Mounts (Not guaranteed)',
      items: ['Skyslipper', 'Ramuh', 'Eden'],
    },
    {
      icon: Gem,
      title: 'Exclusive Glamour & Minion Drops',
      text: 'Exclusive glamour and collectibles from the savage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: “Savage Paradise Within Thee I” & More',
      text: 'Achievement unlocked upon defeating Shadowbringers Savage Tier.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 80 Job',
        'Normal Mode Completion / Fight Unlocked (available as additional services)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-omega-savage'] = {
  short: 'Omega',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: 'Savage gear ranging from ilvl 340 to 405 depending on the tier (various weapon types).',
    },
    {
      icon: Trophy,
      title: 'Encounter Specific Mounts (Not guaranteed)',
      items: ['Alte Roite', 'Air Force', 'Model O'],
    },
    {
      icon: Gem,
      title: 'Wind-up Exdeath & Glamour Drops',
      text: 'Exclusive minions and glamour from the savage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: “I Am the Savage Alpha, I Am the Savage Omega I” & More',
      text: 'Achievement unlocked upon defeating Stormblood Savage Tier.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 70 Job',
        'Normal Mode Completion / Fight Unlocked (available as additional services)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-alexander-savage'] = {
  short: 'Alexander',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: 'Gordian, Midan & Alexandrian gear ranging from ilvl 210 to 275 depending on the tier.',
    },
    {
      icon: Trophy,
      title: 'Encounter Specific Mounts (Not guaranteed)',
      items: ['Gobwalker', 'Arrhidaeus'],
    },
    {
      icon: Gem,
      title: 'Exclusive Glamour & Minion Drops',
      text: 'Exclusive glamour and collectibles from the savage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: “Sins of the Savage Creator I” & More',
      text: 'Achievement unlocked upon defeating Heavensward Savage Tier.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 60 Job',
        'Normal Mode Completion / Fight Unlocked (available as additional services)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-leveling-boost'] = {
  short: 'Job Leveling',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'Level Up!',
      text: 'Target job leveled to your chosen level.',
    },
    {
      icon: BadgeCheck,
      title: 'Become Powerful!',
      text: 'Access to higher level job actions and traits.',
    },
    {
      icon: Timer,
      title: 'Time Saver',
      text: 'Saved time compared to manual leveling.',
    },
    {
      icon: Swords,
      title: 'Start Raiding Quickly',
      text: 'Get your job to Max Level and start doing trials & raids instantly!',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a main Job at your desired level',
        'Own the Dawntrail Expansion',
        'Completion of Dawntrail MSQ (available as an add-on)',
        'Gear for all levels',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

SERVICE_PAGES['ffxiv-msq-skip'] = {
  short: 'MSQ Boost',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: BadgeCheck,
      title: 'MSQ Completed',
      text: 'Main Scenario completed up to your chosen expansion.',
    },
    {
      icon: Swords,
      title: 'Main Story Rewards',
      text: 'Acquire MSQ specific Mounts, Minions and Glamour.',
    },
    {
      icon: Timer,
      title: 'Time Saver',
      text: 'Skip hundreds of hours of story content and cutscenes.',
    },
    {
      icon: Trophy,
      title: 'Ready for Endgame',
      text: 'Jump straight into endgame content on your job of choice.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Own the expansions being completed',
        'Have a main Job at the level required for the furthest expansion selected',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
};

export function getServicePage(id?: string) {
  return id ? SERVICE_PAGES[id] : undefined;
}
