import { ArrowUp, BadgeCheck, Coins, Gem, Medal, Package, ShieldCheck, Swords, Timer, Trophy, Undo2, type LucideIcon } from 'lucide-react';

export interface ServicePageReward {
  icon: LucideIcon;
  title: string;
  text?: string;
  /** Replaces `text`: mount names rendered as buttons (future mount links) */
  items?: string[];
  /** Duty name rendered as a linked button under the title (mount drop sources) */
  dutyButton?: { label: string; to: string };
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
  title: 'Piloted Boost',
  items: ['A Professional Raider will be logged onto your account and complete the content on your behalf'],
};

/** Leveling services: same single-method accordion, booster wording. */
const PILOTED_BOOST: ServicePageAccordionSection = {
  title: 'Piloted Boost',
  items: ['A Professional Booster will be logged onto your account and complete the content on your behalf'],
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
      title: 'Encounter-Specific Mount Drops',
      items: ['(P4S) Demi-Phoinix', '(P8S) Sunforged', '(P12S) Megaloambystoma'],
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
      title: 'Encounter-Specific Mount Drops',
      items: ['(M4S) Monowheel S1', '(M8S) Air-wheeler C9', '(M12S) Lowrider T1RANT'],
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
  short: '(E12S) Eden',
  rewards: [
    {
      icon: Swords,
      title: 'Savage Gear',
      text: 'Savage gear ranging from ilvl 470 to 535 depending on the tier (various weapon types).',
    },
    {
      icon: Trophy,
      title: 'Encounter-Specific Mount Drops',
      items: ['(E4S) Skyslipper', '(E8S) Ramuh', '(E12S) Eden'],
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
      title: 'Encounter-Specific Mount Drops',
      items: ['(O4S) Alte Roite', '(O8S) Air Force', '(O12S) Model O'],
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
      title: 'Encounter-Specific Mount Drops',
      items: ['(A4S) Gobwalker', '(A12S) Arrhidaeus'],
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
    PILOTED_BOOST,
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
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-blu-leveling-boost'] = {
  short: 'Blue Mage',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'Level Up!',
      text: 'Blue Mage leveled to your chosen level, up to the level 80 cap.',
    },
    {
      icon: Gem,
      title: 'Every Spell in the Book',
      text: 'All Blue Mage spells learned (available as an add-on).',
    },
    {
      icon: BadgeCheck,
      title: 'Masked Carnivale Access',
      text: 'Job quests and the Masked Carnivale unlocked along the way (available as an add-on).',
    },
    {
      icon: Timer,
      title: 'Time Saver',
      text: 'Skip the spell hunting and the level grind entirely.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 50 or higher Disciple of War or Magic',
        'Blue Mage unlocked on your account',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-pvp-series-boost'] = {
  short: 'PvP Series',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'PvP Series Levels',
      text: 'Multiple levels in the PvP series granting you the current series loot.',
    },
    {
      icon: Gem,
      title: 'Trophy Crystals',
      text: 'Thousands of Trophy Crystals to exchange for glamour.',
    },
    {
      icon: BadgeCheck,
      title: 'PvP Experience',
      text: 'Exclusive exp only acquired from playing in PvP game modes.',
    },
    {
      icon: Trophy,
      title: 'Mount OR Gearset',
      text: 'Unique Mount or Gearset depending on the current PvP series at level 25.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 30 Job', 'Crystal Conflict unlocked'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-cc-rank-boost'] = {
  short: 'CC Rank',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'PvP Rank Boost',
      text: 'Acquire a rank boost to your desired rank and get exclusive loot based on it.',
    },
    {
      icon: BadgeCheck,
      title: 'Adventurer Plate Designs',
      text: 'Exclusive Adventurer Plate Designs from PvP ranks.',
    },
    {
      icon: Gem,
      title: 'PvP Currency',
      text: 'Wolf Marks and Trophy Crystals to exchange for your favourite weapons and glamour.',
    },
    {
      icon: Trophy,
      title: 'Be on the leaderboard!',
      text: 'High ranks put you on the official FFXIV leaderboard, up to Top 300.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 30 Job', 'Crystalline Conflict unlocked'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-wolf-marks'] = {
  short: 'Wolf Marks',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Coins,
      title: 'Wolf Marks',
      text: 'Exclusive currency used to trade in for glamour and weapons.',
    },
    {
      icon: ArrowUp,
      title: 'PvP Series EXP',
      text: 'Gain series experience as you purchase more Wolf Marks.',
    },
    {
      icon: Gem,
      title: 'Allagan Tomestones',
      text: 'Tomes acquired from participating in Wolf Mark farm.',
    },
    {
      icon: Medal,
      title: 'Achievement Progress',
      text: 'Progress toward PvP achievements along the way.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 30 Job', 'Crystalline Conflict unlocked'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

/** Shared content shapes for the extreme-trial mount pages. */
const mountSeriesPage = (
  short: string,
  mountCount: number,
  requirement: string,
  trialsLabel: string,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      dutyButton: { label: trialsLabel, to: '/boosting/ffxiv?cat=trials' },
      text: '— guaranteed, no matter how many runs it takes.',
    },
    {
      icon: Package,
      title: `All ${mountCount} Series Mounts`,
      text: 'Every required mount farmed until it drops — or only the ones you are missing.',
    },
    {
      icon: Gem,
      title: 'Totems & Trial Loot',
      text: 'Guaranteed totems, orchestrion rolls and gear from every clear.',
    },
    {
      icon: Medal,
      title: 'Achievement Progress',
      text: 'Extreme trial achievements unlocked along the way.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [requirement, 'Extreme trials unlocked (available as additional services)'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
});

const wingPage = (short: string, trial: string, totem: string): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      dutyButton: { label: trial, to: '/boosting/ffxiv?cat=trials' },
      text: '— guaranteed, no matter how many runs it takes.',
    },
    {
      icon: Gem,
      title: totem,
      text: 'Trial totems from every clear, exchangeable for mounts and gear.',
    },
    {
      icon: Swords,
      title: 'Extreme Trial Clears',
      text: 'Every run completed by a veteran raider on your behalf.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'The Extreme trial achievement on completion.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have a level 100 Job',
        'Own the Dawntrail Expansion',
        'Trial unlocked (available as an additional service)',
      ],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
});

SERVICE_PAGES['ffxiv-kirin-mount'] = mountSeriesPage('Kirin', 6, 'Have a level 50 Job', 'A Realm Reborn Extreme Trials');
SERVICE_PAGES['ffxiv-firebird-mount'] = mountSeriesPage('Firebird', 7, 'Have a level 60 Job', 'Heavensward Extreme Trials');
SERVICE_PAGES['ffxiv-kamuy-nine-tails'] = mountSeriesPage('Nine Tails', 7, 'Have a level 70 Job', 'Stormblood Extreme Trials');
SERVICE_PAGES['ffxiv-landerwaffe'] = mountSeriesPage('Landerwaffe', 7, 'Have a level 80 Job', 'Shadowbringers Extreme Trials');
SERVICE_PAGES['ffxiv-apocryphal-bahamut'] = mountSeriesPage('Bahamut', 7, 'Have a level 90 Job', 'Endwalker Extreme Trials');
SERVICE_PAGES['ffxiv-wings-of-legacy'] = mountSeriesPage('Legacy', 7, 'Have a level 100 Job', 'Dawntrail Extreme Trials');

SERVICE_PAGES['ffxiv-wings-of-ruin'] = wingPage('Wings of Ruin', 'Worqor Lar Dor (Extreme)', 'Skyruin Totems');
SERVICE_PAGES['ffxiv-wings-of-resolve'] = wingPage('Wings of Resolve', 'Everkeep (Extreme)', 'Resilient Totems');
SERVICE_PAGES['ffxiv-wings-of-eternity'] = wingPage('Wings of Eternity', "The Minstrel's Ballad: Sphene's Burden", 'Totems Eternal');
SERVICE_PAGES['ffxiv-wings-of-knighthood'] = wingPage('Wings of the Knighthood', 'Recollection (Extreme)', 'Knight Totems');
SERVICE_PAGES['ffxiv-wings-of-death'] = wingPage('Wings of Death', "The Minstrel's Ballad: Necron's Embrace", 'Grave Totems');
SERVICE_PAGES['ffxiv-wings-of-mist'] = wingPage('Wings of Mist', 'Hell on Rails (Extreme)', 'Runaway Totems');
SERVICE_PAGES['ffxiv-wings-of-nihility'] = wingPage('Wings of Nihility', 'The Unmaking (Extreme)', 'Totems of Naught');

/** Savage raid mount pages share one shape; level varies by expansion. */
const savageMountPage = (short: string, duty: string, level: number, dutyTo: string): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      dutyButton: { label: duty, to: dutyTo },
    },
    {
      icon: Swords,
      title: 'Piloted or AFK Carry',
      text: 'Cleared by a veteran raider on your account, or alongside you in the party.',
    },
    {
      icon: Gem,
      title: 'Savage Loot Along the Way',
      text: 'Gear coffers, totems and glamours from every clear.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'The Savage achievement on completion.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Have a level ${level} Job`, 'Duty unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
});

SERVICE_PAGES['ffxiv-monowheel-s1'] = savageMountPage('Monowheel S1', 'AAC Light-heavyweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage');
SERVICE_PAGES['ffxiv-air-wheeler-c9'] = savageMountPage('Air-wheeler C9', 'AAC Cruiserweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage');
SERVICE_PAGES['ffxiv-lowrider-t1rant'] = savageMountPage('Lowrider T1RANT', 'AAC Heavyweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage');
SERVICE_PAGES['ffxiv-demi-phoinix'] = savageMountPage('Demi-Phoinix', 'Asphodelos: The Fourth Circle (Savage)', 90, '/boosting/ffxiv/ffxiv-pandaemonium-savage');
SERVICE_PAGES['ffxiv-sunforged'] = savageMountPage('Sunforged', 'Abyssos: The Eighth Circle (Savage)', 90, '/boosting/ffxiv/ffxiv-pandaemonium-savage');
SERVICE_PAGES['ffxiv-megaloambystoma'] = savageMountPage('Megaloambystoma', 'Anabaseios: The Twelfth Circle (Savage)', 90, '/boosting/ffxiv/ffxiv-pandaemonium-savage');
SERVICE_PAGES['ffxiv-skyslipper'] = savageMountPage('Skyslipper', "Eden's Gate: Sepulture (Savage)", 80, '/boosting/ffxiv/ffxiv-eden-savage');
SERVICE_PAGES['ffxiv-ramuh'] = savageMountPage('Ramuh', "Eden's Verse: Refulgence (Savage)", 80, '/boosting/ffxiv/ffxiv-eden-savage');
SERVICE_PAGES['ffxiv-eden-mount'] = savageMountPage('Eden', "Eden's Promise: Eternity (Savage)", 80, '/boosting/ffxiv/ffxiv-eden-savage');
SERVICE_PAGES['ffxiv-alte-roite'] = savageMountPage('Alte Roite', 'Deltascape V4.0 (Savage)', 70, '/boosting/ffxiv/ffxiv-omega-savage');
SERVICE_PAGES['ffxiv-air-force'] = savageMountPage('Air Force', 'Sigmascape V4.0 (Savage)', 70, '/boosting/ffxiv/ffxiv-omega-savage');
SERVICE_PAGES['ffxiv-model-o'] = savageMountPage('Model O', 'Alphascape V4.0 (Savage)', 70, '/boosting/ffxiv/ffxiv-omega-savage');
SERVICE_PAGES['ffxiv-gobwalker'] = savageMountPage('Gobwalker', 'Alexander - The Burden of the Father (Savage)', 60, '/boosting/ffxiv/ffxiv-alexander-savage');
SERVICE_PAGES['ffxiv-arrhidaeus'] = savageMountPage('Arrhidaeus', 'Alexander - The Soul of the Creator (Savage)', 60, '/boosting/ffxiv/ffxiv-alexander-savage');
SERVICE_PAGES['ffxiv-cerberus-mount'] = savageMountPage('Cerberus', 'Delubrum Reginae (Savage)', 80, '/boosting/ffxiv?cat=alliance-raids');
SERVICE_PAGES['ffxiv-demi-ozma'] = savageMountPage('Demi-Ozma', 'The Baldesion Arsenal', 70, '/boosting/ffxiv?cat=alliance-raids');
SERVICE_PAGES['ffxiv-demon-haul'] = savageMountPage('Demon Haul', 'The Forked Tower: Blood', 100, '/boosting/ffxiv?cat=alliance-raids');

/** Mount buttons in the savage subpage reward blocks → their mount services. */
export const MOUNT_LINKS: Record<string, string> = {
  '(M4S) Monowheel S1': 'ffxiv-monowheel-s1',
  '(M8S) Air-wheeler C9': 'ffxiv-air-wheeler-c9',
  '(M12S) Lowrider T1RANT': 'ffxiv-lowrider-t1rant',
  '(P4S) Demi-Phoinix': 'ffxiv-demi-phoinix',
  '(P8S) Sunforged': 'ffxiv-sunforged',
  '(P12S) Megaloambystoma': 'ffxiv-megaloambystoma',
  '(E4S) Skyslipper': 'ffxiv-skyslipper',
  '(E8S) Ramuh': 'ffxiv-ramuh',
  '(E12S) Eden': 'ffxiv-eden-mount',
  '(O4S) Alte Roite': 'ffxiv-alte-roite',
  '(O8S) Air Force': 'ffxiv-air-force',
  '(O12S) Model O': 'ffxiv-model-o',
  '(A4S) Gobwalker': 'ffxiv-gobwalker',
  '(A12S) Arrhidaeus': 'ffxiv-arrhidaeus',
};

export function getServicePage(id?: string) {
  return id ? SERVICE_PAGES[id] : undefined;
}
