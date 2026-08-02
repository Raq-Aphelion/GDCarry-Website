import { ArrowUp, BadgeCheck, Coins, Gem, Medal, Package, Shield, ShieldCheck, Swords, Timer, Trophy, Undo2, type LucideIcon } from 'lucide-react';

export interface ServicePageReward {
  icon: LucideIcon;
  title: string;
  text?: string;
  /** Replaces `text`: mount names rendered as buttons (future mount links) */
  items?: string[];
  /** Duty name rendered as a linked button under the title (mount drop sources) */
  dutyButton?: { label: string; to: string };
}

export interface ServicePageAccordionItem {
  text: string;
  /** Optional leading hyperlink rendered before the text (external) */
  link?: { label: string; href: string };
  /** Render as a plain dash line instead of the diamond pointer */
  dash?: boolean;
  /** Render with no marker at all */
  plain?: boolean;
  /** Darker text colour (slate-500) */
  muted?: boolean;
}

export interface ServicePageAccordionSection {
  title: string;
  items?: (string | ServicePageAccordionItem)[];
  groups?: { heading: string; items: (string | ServicePageAccordionItem)[] }[];
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
    'Place your desired order and contact us via the Live Chat or Discord',
    'Pay the required amount with your selected payment method',
    "The service is scheduled based on our availability and times you'll be logged in",
    "You'll be notified of the order's completion via Discord or E-mail",
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

/** Method accordion for the four deep dungeons that offer group play —
    same grouped layout as the ultimate-raid method accordions. */
const GROUP_PLAY_VS_PILOTED: ServicePageAccordionSection = {
  title: 'Group Play vs Piloted Boost',
  groups: [
    {
      heading: 'Group Play',
      items: [
        "You'll be following 3 other raiders as they guide you through the deep dungeon until you complete it.",
        "Speedrun — you'll be ignoring all loot to maximise efficiency and clear the run as fast as possible",
        "Farm — you'll be collecting chests throughout the run to increase aetherpool and collect rewards",
      ],
    },
    {
      heading: 'Piloted Boost',
      items: ['A Professional Booster will be logged onto your account and complete the content on your behalf'],
    },
  ],
};

/** Method accordion for the Echoes of Vana'diel alliance raids — same grouped
    layout as the other Group Play pages. */
const ALLIANCE_GROUP_VS_PILOTED: ServicePageAccordionSection = {
  title: 'Group Play vs Piloted Boost',
  groups: [
    {
      heading: 'Group Play',
      items: ["You'll be raiding alongside our team on your own character"],
    },
    {
      heading: 'Piloted Boost',
      items: ['A professional raider will be logged onto your account and complete the content on your behalf'],
    },
  ],
};

/** Requirements shared by every Ultimate; `duty` is the unlock duty line,
    `job`/`expansion` default to the current-expansion requirements. */
const requirements = (
  duty: string,
  ilvl: string,
  job = 'Have a level 100 Job',
  expansion = 'Own the Dawntrail Expansion',
): ServicePageAccordionSection => ({
  title: 'Requirements',
  items: [job, expansion, duty, ilvl],
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
      {
        ...requirements('Asphodelos: The Fourth Circle (Savage) Completed', 'ilvl 600 or higher gear', 'Have a lvl 90 Job', 'Own the Endwalker Expansion'),
        groups: [
          {
            heading: 'AFK Carry only (DSR Specific)',
            items: [
              "You'll need to be on a Physical DPS Job (ilvl 605 or higher)",
              'Be attentive and accept raises — there are more than 10 per run; alternatively you can install the Yes Already plugin, which auto-accepts raises for you (PC only)',
            ],
          },
        ],
      },
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
      requirements('Deltascape V4.0 (Savage) Completed (available as an add-on)', 'ilvl 345 or higher gear', 'Have a lvl 70 Job', 'Own the Stormblood Expansion'),
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
      requirements('Sigmascape V4.0 (Savage) Completed (available as an add-on)', 'ilvl 375 or higher gear', 'Have a lvl 70 Job', 'Own the Stormblood Expansion'),
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
      {
        ...requirements("Eden's Gate: Sepulture (Savage) Completed (available as an add-on)", 'ilvl 470 or higher gear', 'Have a lvl 80 Job', 'Own the Shadowbringers Expansion'),
        groups: [
          {
            heading: 'AFK Carry only (TEA Specific)',
            items: [
              "You'll need to be on any melee job (except Samurai) that's level 80 or above (ilvl 475 or higher)",
              'Be attentive and accept raises — alternatively you can install the Yes Already plugin, which auto-accepts raises for you (PC only)',
              "You'll be required to use the Limit Break at the end of the fight, make sure to have it on your hotbar",
            ],
          },
        ],
      },
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
      requirements('Abyssos: The Eighth Circle (Savage) Completed (available as an add-on)', 'ilvl 630 or higher gear', 'Have a lvl 90 Job', 'Own the Endwalker Expansion'),
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
        'Be eligible to trade or have the requirements for a mannequin transaction',
        'Be available for the trade at the agreed place and time if face to face trades',
      ],
    },
    HOW_IT_WORKS,
    {
      title: 'How is the gil delivered?',
      groups: [
        {
          heading: 'Mannequin Trade (safest option)',
          items: [
            {
              link: { label: 'Mannequins', href: 'https://na.finalfantasyxiv.com/lodestone/playguide/db/item/ec327b876c4/' },
              text: ' are housing items that use your retainers to sell off items',
            },
            { text: 'Mannequins can be placed in any of the following areas:', plain: true, muted: true },
            { text: 'Apartments [Requires Second Lieutenant Grand Company Rank] + Lvl 50', dash: true, muted: true },
            { text: 'FC House - If you have permissions', dash: true, muted: true },
            { text: 'Personal House [Requires Second Lieutenant Grand Company Rank] + Lvl 50', dash: true, muted: true },
            'Simply put an item up for the requested gil amount and open your housing estate for guest access',
            'Let us know your mannequin location — e.g. Goblet Ward 7 Plot 44, Leviathan server',
          ],
        },
        {
          heading: 'Face to Face (manual trade)',
          items: [
            'A manager schedules the trade with you right after the order is confirmed',
            'You meet our trader in-game and the gil is handed over face to face',
            'You confirm the received amount and the order is marked complete',
          ],
        },
        {
          heading: 'Direct Account Delivery (optional)',
          items: [
            'A professional trader logs onto your account and completes the delivery for you (+10% fee)',
            'Delivery is scheduled around times you are not playing',
            'You are notified once the full amount is on your account',
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

/** Relic weapon/armour pages share one shape; requirement line differs per relic. */
const relicPage = (
  short: string,
  kind: 'weapon' | 'armour',
  expansion: string,
  requirement: string,
  rewardText: string,
  rewardTitle?: string,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'Any Step of the Relic Chain',
      text: 'From the base stage to the final glow — pick exactly the steps you need, priced per step.',
    },
    {
      icon: kind === 'weapon' ? Swords : Shield,
      title: rewardTitle ?? (kind === 'weapon' ? 'Relic Weapon for Your Job' : 'Elemental Armour Set'),
      text: rewardText,
    },
    {
      icon: Gem,
      title: 'All Materials Kept',
      text: 'Tomestones, crystals and every material farmed along the way stays on your character.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'Achievement unlocked upon completing the relic chain.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Own the ${expansion} Expansion`, requirement],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
});

SERVICE_PAGES['ffxiv-cosmic-exploration'] = {
  short: 'Cosmic Exploration',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'Cosmic Tools at Any Stage',
      text: 'Cosmic, Stellar, Hypertool or Stars tools for any DoH or DoL job — pick exactly the stages you need.',
    },
    {
      icon: Trophy,
      title: 'High Mobility Vacuum Suit Mount',
      items: ['High Mobility Vacuum Suit'],
      text: '— 500K Cosmic Tracker on all 11 DoH and DoL jobs.',
    },
    {
      icon: Gem,
      title: 'Cosmic Credits & Materials Kept',
      text: 'Credits, scrips and every material earned along the way stays on your character.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'Achievements unlocked upon completing the Cosmic Tool stages.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have any DoH or DoL job at level 100', 'Own the Dawntrail Expansion', 'Cosmic Exploration unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-phantom-weapon'] = relicPage('Phantom Weapon', 'weapon', 'Dawntrail', 'Occult Crescent unlocked (available as an additional service)', 'The Dawntrail Phantom Weapon for your chosen job — Penumbrae to Occultum.', 'BiS Relic Weapon for Your Job (ilvl 795)');
SERVICE_PAGES['ffxiv-manderville-weapon'] = relicPage('Manderville Weapon', 'weapon', 'Endwalker', 'Manderville weapon questline unlocked (available as an additional service)', 'The Endwalker Manderville Weapon for your chosen job, at any stage.');
SERVICE_PAGES['ffxiv-resistance-weapon'] = relicPage('Resistance Weapon', 'weapon', 'Shadowbringers', 'Bozjan Southern Front unlocked (available as an additional service)', 'The Shadowbringers Resistance Weapon for your chosen job, at any stage.');
SERVICE_PAGES['ffxiv-eureka-weapon'] = relicPage('Eurekan Weapon', 'weapon', 'Stormblood', 'Eureka Anemos unlocked (available as an additional service)', 'The Stormblood Eurekan Weapon for your chosen job, at any stage.');
SERVICE_PAGES['ffxiv-eurekan-elemental-armour'] = relicPage('Eurekan Armour', 'armour', 'Stormblood', 'Eureka Pyros unlocked (available as an additional service)', 'The full Elemental Armour set for your chosen role type.');
SERVICE_PAGES['ffxiv-anima-weapon'] = relicPage('Anima Weapon', 'weapon', 'Heavensward', 'Anima weapon questline unlocked (available as an additional service)', 'The Heavensward Anima Weapon for your chosen job, at any stage.');
SERVICE_PAGES['ffxiv-zodiac-weapon'] = relicPage('Zodiac Weapon', 'weapon', 'A Realm Reborn', 'Zodiac weapon questline unlocked (available as an additional service)', 'The A Realm Reborn Zodiac Weapon for your chosen job, at any stage.');

SERVICE_PAGES['ffxiv-crafter-gatherer-leveling'] = {  short: 'Crafter & Gatherer Leveling',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: ArrowUp,
      title: 'Level Up!',
      text: 'Any Disciple of the Hand or Land leveled to your chosen level.',
    },
    {
      icon: BadgeCheck,
      title: 'Crafting & Gathering Unlocked',
      text: 'Higher-tier recipes, gathering nodes and job actions at your target level.',
    },
    {
      icon: Gem,
      title: 'Scrips & Materials Kept',
      text: 'Every scrip, collectable and material earned along the way stays on your character.',
    },
    {
      icon: Timer,
      title: 'Time Saver',
      text: 'Skip the leve and collectable grind — straight to endgame crafting and gathering.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have the chosen job unlocked'],
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

/** Shared content shapes for the extreme-trial mount pages. The 'Guaranteed
    Mount Drop From' duty button links to the expansion's Extreme Trials
    Bundle service page; with `linkTrials: false` the trials label renders as
    plain text instead (used for A Realm Reborn, whose extremes aren't listed
    on the site). */
const mountSeriesPage = (
  short: string,
  mountCount: number,
  requirement: string,
  trialsLabel: string,
  linkTrials = true,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      ...(linkTrials
        ? {
            dutyButton: {
              label: trialsLabel,
              to: `/boosting/ffxiv/ffxiv-${trialsLabel.replace(' Extreme Trials', '').toLowerCase()}-trials-bundle`,
            },
            text: '— guaranteed, no matter how many runs it takes.',
          }
        : {
            text: `${trialsLabel} — guaranteed, no matter how many runs it takes.`,
          }),
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
    PILOTED_VS_AFK,
  ],
});

const wingPage = (short: string, trial: string, totem: string, to: string): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      dutyButton: { label: trial, to },
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
    PILOTED_VS_AFK,
  ],
});

SERVICE_PAGES['ffxiv-kirin-mount'] = mountSeriesPage('Kirin', 6, 'Have a level 50 Job', 'A Realm Reborn Extreme Trials', false);
SERVICE_PAGES['ffxiv-firebird-mount'] = mountSeriesPage('Firebird', 7, 'Have a level 60 Job', 'Heavensward Extreme Trials');
SERVICE_PAGES['ffxiv-kamuy-nine-tails'] = mountSeriesPage('Nine Tails', 7, 'Have a level 70 Job', 'Stormblood Extreme Trials');
SERVICE_PAGES['ffxiv-landerwaffe'] = mountSeriesPage('Landerwaffe', 7, 'Have a level 80 Job', 'Shadowbringers Extreme Trials');
SERVICE_PAGES['ffxiv-apocryphal-bahamut'] = mountSeriesPage('Bahamut', 7, 'Have a level 90 Job', 'Endwalker Extreme Trials');
SERVICE_PAGES['ffxiv-wings-of-legacy'] = mountSeriesPage('Legacy', 7, 'Have a level 100 Job', 'Dawntrail Extreme Trials');

SERVICE_PAGES['ffxiv-wings-of-ruin'] = wingPage('Wings of Ruin', 'Worqor Lar Dor (Extreme)', 'Skyruin Totems', '/boosting/ffxiv/ffxiv-worqor-lar-dor');
SERVICE_PAGES['ffxiv-wings-of-resolve'] = wingPage('Wings of Resolve', 'Everkeep (Extreme)', 'Resilient Totems', '/boosting/ffxiv/ffxiv-everkeep');
SERVICE_PAGES['ffxiv-wings-of-eternity'] = wingPage('Wings of Eternity', "The Minstrel's Ballad: Sphene's Burden", 'Totems Eternal', '/boosting/ffxiv/ffxiv-sphenes-burden');
SERVICE_PAGES['ffxiv-wings-of-knighthood'] = wingPage('Wings of the Knighthood', 'Recollection (Extreme)', 'Knight Totems', '/boosting/ffxiv/ffxiv-recollection');
SERVICE_PAGES['ffxiv-wings-of-death'] = wingPage('Wings of Death', "The Minstrel's Ballad: Necron's Embrace", 'Grave Totems', '/boosting/ffxiv/ffxiv-necrons-embrace');
SERVICE_PAGES['ffxiv-wings-of-mist'] = wingPage('Wings of Mist', 'Hell on Rails (Extreme)', 'Runaway Totems', '/boosting/ffxiv/ffxiv-hell-on-rails');
SERVICE_PAGES['ffxiv-wings-of-nihility'] = wingPage('Wings of Nihility', 'The Unmaking (Extreme)', 'Totems of Naught', '/boosting/ffxiv/ffxiv-the-unmaking');

/** Savage raid mount pages share one shape; level varies by expansion.
    `note` appends plain text next to the duty button (e.g. clears required).
    `pilotedOnly` removes every AFK mention (method reward row + accordion);
    `groupPlay` swaps AFK for group play (method reward row + accordion);
    `methodAccordion` overrides the group-play accordion variant;
    `rows` replaces the bottom two reward rows;
    `dropTitle` overrides the 'Guaranteed Mount Drop From' reward title. */
const savageMountPage = (
  short: string,
  duty: string,
  level: number,
  dutyTo: string,
  note?: string,
  opts?: { pilotedOnly?: boolean; groupPlay?: boolean; methodAccordion?: ServicePageAccordionSection; rows?: ServicePageReward[]; dropTitle?: string },
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: opts?.dropTitle ?? 'Guaranteed Mount Drop From',
      dutyButton: { label: duty, to: dutyTo },
      ...(note ? { text: note } : {}),
    },
    opts?.pilotedOnly
      ? {
          icon: Swords,
          title: 'Piloted Service',
          text: 'Cleared by a veteran raider on your account.',
        }
      : opts?.groupPlay
        ? {
            icon: Swords,
            title: 'Group Play or Piloted',
            text: 'Cleared by a veteran raider on your account, or alongside our team on your own character.',
          }
        : {
            icon: Swords,
            title: 'Piloted or AFK Carry',
            text: 'Cleared by a veteran raider on your account, or alongside you in the party.',
          },
    ...(opts?.rows ?? [
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
    ]),
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Have a level ${level} Job`, 'Duty unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    opts?.methodAccordion ?? (opts?.pilotedOnly ? PILOTED_ONLY : opts?.groupPlay ? ALLIANCE_GROUP_VS_PILOTED : PILOTED_VS_AFK),
  ],
});

SERVICE_PAGES['ffxiv-monowheel-s1'] = savageMountPage('Monowheel S1', 'AAC Light-heavyweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage');
SERVICE_PAGES['ffxiv-air-wheeler-c9'] = savageMountPage('Air-wheeler C9', 'AAC Cruiserweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage');
SERVICE_PAGES['ffxiv-lowrider-t1rant'] = savageMountPage('Lowrider T1RANT', 'AAC Heavyweight M4 (Savage)', 100, '/boosting/ffxiv/ffxiv-arcadion-savage', undefined, { pilotedOnly: true });
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
SERVICE_PAGES['ffxiv-juedi-mount'] = savageMountPage('Juedi', 'Heaven-on-High (Deep Dungeon)', 100, '/boosting/ffxiv/ffxiv-hoh', '— 4 full clears required.', { groupPlay: true, methodAccordion: GROUP_PLAY_VS_PILOTED });
SERVICE_PAGES['ffxiv-aeturna-mount'] = savageMountPage('Aeturna', 'Eureka Orthos (Deep Dungeon)', 100, '/boosting/ffxiv/ffxiv-orthos', '— 4 full clears required.', { groupPlay: true, methodAccordion: GROUP_PLAY_VS_PILOTED });
SERVICE_PAGES['ffxiv-genie-of-the-lamp-mount'] = savageMountPage('Genie of the Lamp', "Another Merchant's Tale", 100, '/boosting/ffxiv/ffxiv-another-merchants-tale', '— random drop or 100 Corvosi Manuscripts exchange.', { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-royal-magicked-carpet-mount'] = savageMountPage('Royal Magicked Carpet', "Variant: Merchant's Tale", 90, '/boosting/ffxiv/ffxiv-variant-merchants-tale', '— random drop or 100 Corvosi Brass exchange.', { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-quaqua-mount'] = savageMountPage('Quaqua', 'Another Aloalo Island', 90, '/boosting/ffxiv/ffxiv-another-aloalo-island', '— random drop or 100 Aloalo Coins exchange.', { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-spectral-statice-mount'] = savageMountPage('Spectral Statice', 'Variant: Aloalo Island', 90, '/boosting/ffxiv/ffxiv-variant-aloalo-island', '— all 12 routes required.', { pilotedOnly: true });
SERVICE_PAGES['ffxiv-shishioji-mount'] = savageMountPage('Shishioji', 'Another Mount Rokkon', 90, '/boosting/ffxiv/ffxiv-another-mount-rokkon', '— random drop or 100 Shishu Coin exchange.', { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-burabura-chochin-mount'] = savageMountPage('Burabura Chochin', 'Variant: Mount Rokkon', 90, '/boosting/ffxiv/ffxiv-variant-mount-rokkon', '— all 12 routes required.', { pilotedOnly: true });
SERVICE_PAGES['ffxiv-sildihn-throne-mount'] = savageMountPage("Sil'dihn Throne", "Another Sil'dihn Subterrane", 90, '/boosting/ffxiv/ffxiv-another-sildihn-subterrane', "— random drop or 100 Sil'dihn Silver exchange.", { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-silkie-mount'] = savageMountPage('Silkie', "Variant: The Sil'dihn Subterrane", 90, '/boosting/ffxiv/ffxiv-variant-sildihn-subterrane', '— all 12 routes required.', { pilotedOnly: true });

SERVICE_PAGES['ffxiv-forked-tower-blood'] = {
  short: 'The Forked Tower: Blood',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Demon Haul Mount',
      items: ['Demon Haul'],
      text: '— guaranteed for your collection.',
    },
    {
      icon: Gem,
      title: 'All Loot Included',
      text: 'Gear, fragments and every drop from the clear stays yours.',
    },
    {
      icon: Swords,
      title: '48-Player Field Operation Clear',
      text: 'The Forked Tower: Blood completed.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'Achievement unlocked upon clearing The Forked Tower: Blood.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', 'The Forked Tower: Blood unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};

SERVICE_PAGES['ffxiv-forked-tower-magic'] = {
  short: 'The Forked Tower: Magic',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Duck-billed Porter Mount',
      items: ['Duck-billed Porter'],
      text: '— random drop or 500 Arcane Amulets exchange.',
    },
    {
      icon: Gem,
      title: 'Arcane Amulets & Loot',
      text: 'Arcane Amulets, gear and every drop from the clear stays yours.',
    },
    {
      icon: Swords,
      title: '48-Player Field Operation Clear',
      text: 'The Forked Tower: Magic completed — Normal or Extreme.',
    },
    {
      icon: Medal,
      title: 'Achievement Unlocked',
      text: 'Achievement unlocked upon clearing The Forked Tower: Magic.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', 'The Forked Tower: Magic unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};

SERVICE_PAGES['ffxiv-baldesion-arsenal'] = {
  short: 'The Baldesion Arsenal',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Demi-Ozma Mount',
      items: ['Demi-Ozma'],
      text: '— guaranteed completion with a veteran group.',
    },
    {
      icon: Gem,
      title: 'Conditional Virtue (Minion)',
      text: 'Minion drop chance, cryptic seals and Eureka fragments from every clear.',
    },
    {
      icon: Swords,
      title: '56-Player Field Operation Clear',
      text: 'The Baldesion Arsenal completed.',
    },
    {
      icon: Medal,
      title: 'Achievement: "We\'re on Your Side I"',
      text: 'Achievement unlocked upon clearing the Baldesion Arsenal.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 70 Job', 'Own the Stormblood Expansion', 'Eureka Hydatos story completed', 'Elemental level 50+'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};

SERVICE_PAGES['ffxiv-delubrum-reginae-savage'] = {
  short: 'Delubrum Reginae',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Cerberus Mount',
      items: ['Cerberus'],
      text: '— guaranteed via the Savage Queen of Swords achievement.',
    },
    {
      icon: BadgeCheck,
      title: 'Title: Savage Queen of Swords',
      text: 'Exclusive title earned from the savage clear.',
    },
    {
      icon: Swords,
      title: '48-Player Savage Raid Clear',
      text: 'Delubrum Reginae (Savage) completed with a veteran group.',
    },
    {
      icon: Medal,
      title: 'Achievement: "Savage Queen of Swords"',
      text: 'Achievement unlocked upon clearing Delubrum Reginae (Savage).',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 80 Job', 'Own the Shadowbringers Expansion', 'Delubrum Reginae (Normal) completed'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};

SERVICE_PAGES['ffxiv-morbol-mount'] = {  short: 'Morbol',
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Trophy,
      title: 'Guaranteed Mount Drop From',
      text: 'Completing the Blue Unchained and Masked Conqueror Achievements (Blue Mage).',
    },
    {
      icon: Swords,
      title: 'Savage Loot',
      text: 'Savage specific loot from completing the Alexander and Bahamut fights as Blue Mage.',
    },
    {
      icon: BadgeCheck,
      title: 'Blue Justice & Unbound Blue',
      text: 'Exclusive titles acquired from completing the Blue Mage fights.',
    },
    {
      icon: Medal,
      title: 'Achievement: "True Blue"',
      text: 'Achievement unlocked upon obtaining the Blue Unchained and Masked Conqueror achievements.',
    },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [
        'Have Blue Mage at lvl 70 or higher',
        'Own the Dawntrail Expansion',
        'Alexander & Bahamut fights unlocked',
        'ilvl 270 or higher on Blue Mage',
        'Specific Spells',
      ],
    },
    {
      title: 'Specific Spells',
      items: ['Mimicry', 'Shock Strike', 'Whistle', 'Moon Flute', 'Nightbloom', 'Surpanakha', 'Phantom Flurry', 'The Rose of Destruction'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};
SERVICE_PAGES['ffxiv-cerberus-mount'] = savageMountPage('Cerberus', 'Delubrum Reginae (Savage)', 80, '/boosting/ffxiv/ffxiv-delubrum-reginae-savage', undefined, { pilotedOnly: true });
SERVICE_PAGES['ffxiv-demi-ozma'] = savageMountPage('Demi-Ozma', 'The Baldesion Arsenal', 70, '/boosting/ffxiv/ffxiv-baldesion-arsenal', undefined, {
  pilotedOnly: true,
  rows: [
    {
      icon: Medal,
      title: 'Cryptic Seals & Eureka Fragments',
      text: 'Exclusive drops earned for completing the encounters',
    },
    {
      icon: Trophy,
      title: 'Achievement: "We\'re on Your Side I"',
      text: 'Achievement unlocked upon clearing the Baldesion Arsenal',
    },
  ],
});
SERVICE_PAGES['ffxiv-demon-haul'] = savageMountPage('Demon Haul', 'The Forked Tower: Blood', 100, '/boosting/ffxiv/ffxiv-forked-tower-blood', undefined, { pilotedOnly: true });
SERVICE_PAGES['ffxiv-duck-billed-porter-mount'] = savageMountPage('Duck-billed Porter', 'The Forked Tower: Magic', 100, '/boosting/ffxiv/ffxiv-forked-tower-magic', '— random drop or 500 Arcane Amulets exchange.', { pilotedOnly: true, dropTitle: 'Mount Drop From' });
SERVICE_PAGES['ffxiv-vacuum-suit-mount'] = savageMountPage('High Mobility Vacuum Suit', 'Cosmic Exploration', 100, '/boosting/ffxiv/ffxiv-cosmic-exploration', '— 500K Cosmic Tracker on all 11 DoH and DoL jobs.', { pilotedOnly: true });
SERVICE_PAGES['ffxiv-dais-of-darkness-mount'] = savageMountPage('Dais of Darkness', 'The Cloud of Darkness (Chaotic)', 100, '/boosting/ffxiv/ffxiv-cloud-of-darkness', undefined, { pilotedOnly: true });
SERVICE_PAGES['ffxiv-shroud-of-darkness-mount'] = savageMountPage('Shroud of Darkness', 'The Cloud of Darkness (Chaotic)', 100, '/boosting/ffxiv/ffxiv-cloud-of-darkness', undefined, { pilotedOnly: true });

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
  'Dais of Darkness': 'ffxiv-dais-of-darkness-mount',
  'Shroud of Darkness': 'ffxiv-shroud-of-darkness-mount',
  'Juedi': 'ffxiv-juedi-mount',
  'Aeturna': 'ffxiv-aeturna-mount',
  'Genie of the Lamp': 'ffxiv-genie-of-the-lamp-mount',
  'Royal Magicked Carpet': 'ffxiv-royal-magicked-carpet-mount',
  'Quaqua': 'ffxiv-quaqua-mount',
  'Spectral Statice': 'ffxiv-spectral-statice-mount',
  'Shishioji': 'ffxiv-shishioji-mount',
  'Burabura Chochin': 'ffxiv-burabura-chochin-mount',
  "Sil'dihn Throne": 'ffxiv-sildihn-throne-mount',
  'Silkie': 'ffxiv-silkie-mount',
  'Cerberus': 'ffxiv-cerberus-mount',
  'Demi-Ozma': 'ffxiv-demi-ozma',
  'Demon Haul': 'ffxiv-demon-haul',
  'Duck-billed Porter': 'ffxiv-duck-billed-porter-mount',
  'High Mobility Vacuum Suit': 'ffxiv-vacuum-suit-mount',
};


/** Extreme trial pages share one shape; trials that drop a mount link to it. */
const trialPage = (short: string, level: number, mount?: { label: string; to: string }): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    ...(mount
      ? [
          {
            icon: Trophy,
            title: 'Mount Drop (Not Guaranteed)',
            dutyButton: { label: mount.label, to: mount.to },
            text: '— Rare drop, can drop from this trial.',
          } as const,
        ]
      : [
          {
            icon: Trophy,
            title: 'Totems & Loot',
            text: 'Trial totems, orchestrion rolls and materials from every clear.',
          } as const,
        ]),
    {
      icon: Gem,
      title: 'Trial Totems',
      text: 'Exchangeable for mounts, weapons and glamour.',
    },
    {
      icon: Swords,
      title: 'Piloted or AFK Carry',
      text: 'Cleared by a veteran raider on your account, or alongside you in the party.',
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
      items: [`Have a level ${level} Job`, 'Trial unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
});

/** Extreme trial bundle pages share one shape; duties are listed by name. */
const trialBundlePage = (
  short: string,
  level: number,
  duties: string[],
  mount: string,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    {
      icon: Package,
      title: `All ${duties.length} Extreme Trials`,
      text: 'Every trial cleared in one package — pick the ones you need or take them all.',
    },
    { icon: Gem, title: 'Trial Totems', text: 'Totems from every clear, exchangeable for mounts and gear.' },
    { icon: Trophy, title: 'Mount Guaranteed Option', text: `One run with every trial checked guarantees the ${mount} at its own price.` },
    { icon: Medal, title: 'Achievements Unlocked', text: 'Every Extreme trial achievement on completion.' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Have a level ${level} Job`, 'Trials unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_VS_AFK,
  ],
});

SERVICE_PAGES['ffxiv-dawntrail-trials-bundle'] = trialBundlePage('Dawntrail Trials', 100, [
  'Worqor Lar Dor (Extreme)', 'Everkeep (Extreme)', "The Minstrel's Ballad: Sphene's Burden",
  'Recollection (Extreme)', "The Minstrel's Ballad: Necron's Embrace", 'Hell on Rails (Extreme)',
  'The Unmaking (Extreme)',
], 'Wings of Legacy');
SERVICE_PAGES['ffxiv-endwalker-trials-bundle'] = trialBundlePage('Endwalker Trials', 90, [
  "The Minstrel's Ballad: Zodiark's Fall", "The Minstrel's Ballad: Hydaelyn's Call",
  "The Minstrel's Ballad: Endsinger's Aria", "Storm's Crown (Extreme)", 'Mount Ordeals (Extreme)',
  'The Voidcast Dais (Extreme)', 'The Abyssal Fracture (Extreme)',
], 'Apocryphal Bahamut');
SERVICE_PAGES['ffxiv-shadowbringers-trials-bundle'] = trialBundlePage('Shadowbringers Trials', 80, [
  'The Dancing Plague (Extreme)', 'The Crown of the Immaculate (Extreme)', 'Cinder Drift (Extreme)',
  'Castrum Marinum (Extreme)', 'The Cloud Deck (Extreme)', "The Minstrel's Ballad: Hades's Elegy",
  'The Seat of Sacrifice (Extreme)',
], 'Landerwaffe');
SERVICE_PAGES['ffxiv-stormblood-trials-bundle'] = trialBundlePage('Stormblood Trials', 70, [
  'The Pool of Tribute (Extreme)', 'Emanation (Extreme)', "Shinryu's Domain (Extreme)",
  'The Jade Stoa (Extreme)', "Tsukuyomi's Pain (Extreme)", "Hells' Kier (Extreme)",
  'The Wreath of Snakes (Extreme)',
], 'Kamuy of the Nine Tails');
SERVICE_PAGES['ffxiv-heavensward-trials-bundle'] = trialBundlePage('Heavensward Trials', 60, [
  'Limitless Blue (Extreme)', 'Thok ast Thok (Extreme)', "Thordan's Reign (Extreme)",
  'Containment Bay S1T7 (Extreme)', "Nidhogg's Rage (Extreme)", 'Containment Bay P1T6 (Extreme)',
  'Containment Bay Z1T9 (Extreme)',
], 'Firebird');

SERVICE_PAGES['ffxiv-great-hunt'] = trialPage('The Great Hunt', 70, { label: 'Rathalos', to: '/boosting/ffxiv/ffxiv-rathalos-mount' });
SERVICE_PAGES['ffxiv-memoria-misera'] = trialPage('Memoria Misera', 80);
SERVICE_PAGES['ffxiv-worqor-lar-dor'] = trialPage('Worqor Lar Dor', 100, { label: 'Wings of Ruin', to: '/boosting/ffxiv/ffxiv-wings-of-ruin' });
SERVICE_PAGES['ffxiv-everkeep'] = trialPage('Everkeep', 100, { label: 'Wings of Resolve', to: '/boosting/ffxiv/ffxiv-wings-of-resolve' });
SERVICE_PAGES['ffxiv-sphenes-burden'] = trialPage('Sphene\'s Burden', 100, { label: 'Wings of Eternity', to: '/boosting/ffxiv/ffxiv-wings-of-eternity' });
SERVICE_PAGES['ffxiv-recollection'] = trialPage('Recollection', 100, { label: 'Wings of the Knighthood', to: '/boosting/ffxiv/ffxiv-wings-of-knighthood' });
SERVICE_PAGES['ffxiv-necrons-embrace'] = trialPage('Necron\'s Embrace', 100, { label: 'Wings of Death', to: '/boosting/ffxiv/ffxiv-wings-of-death' });
SERVICE_PAGES['ffxiv-windward-wilds'] = trialPage('The Windward Wilds', 100, { label: 'Felyne Support Team Cart', to: '/boosting/ffxiv/ffxiv-felyne-cart' });
SERVICE_PAGES['ffxiv-hell-on-rails'] = trialPage('Hell on Rails', 100, { label: 'Wings of Mist', to: '/boosting/ffxiv/ffxiv-wings-of-mist' });
SERVICE_PAGES['ffxiv-the-unmaking'] = trialPage('The Unmaking', 100, { label: 'Wings of Nihility', to: '/boosting/ffxiv/ffxiv-wings-of-nihility' });

SERVICE_PAGES['ffxiv-rathalos-mount'] = savageMountPage('Rathalos', 'The Great Hunt (Extreme)', 70, '/boosting/ffxiv/ffxiv-great-hunt');
SERVICE_PAGES['ffxiv-felyne-cart'] = savageMountPage('Felyne Cart', 'The Windward Wilds (Extreme)', 100, '/boosting/ffxiv/ffxiv-windward-wilds');


/** Deep dungeon pages share one shape. */
const deepDungeonPage = (
  short: string,
  rewards: ServicePageContent['rewards'],
  requirements: string[],
  methodAccordion: ServicePageContent['accordion'][number] = PILOTED_BOOST,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards,
  accordion: [
    { title: 'Requirements', items: requirements },
    HOW_IT_WORKS,
    methodAccordion,
  ],
});

const ddRewards = (
  title: string,
  achievement: { title: string; text: string },
  /** Mount name rendered as a linked button in the 2nd reward spot */
  mount?: string,
): ServicePageContent['rewards'] => [
  { icon: Swords, title: 'Aetherpool Levels & Armour', text: 'Upgrades on your Aetherpool Level & Armour.' },
  ...(mount
    ? [{ icon: Trophy, title: `${mount} Mount (4 Full Clears)`, items: [mount] } satisfies ServicePageReward]
    : [{ icon: Gem, title: 'Tomestones & Loot', text: 'Various loot from acquiring and clearing the floors of the deep dungeon.' } satisfies ServicePageReward]),
  { icon: BadgeCheck, title, text: 'Exclusive title achieved by completing the deep dungeon solo.' },
  { icon: Medal, title: achievement.title, text: achievement.text },
];


SERVICE_PAGES['ffxiv-custom-deliveries'] = {
  short: 'Custom Deliveries',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: ArrowUp, title: 'Full Satisfaction Reached', text: 'Any Custom Delivery NPC raised to your chosen satisfaction level — no weekly-cap grind.' },
    { icon: Trophy, title: 'Mounts & Glamour Sets', text: 'NPC-specific mounts, outfits and glamour at max satisfaction.' },
    { icon: BadgeCheck, title: 'Titles & Stories', text: 'Unique titles and questlines unlocked at every level.' },
    { icon: Gem, title: 'Scrips & EXP Kept', text: 'Crafters’ and Gatherers’ Scrips, materia and every reward stays yours.' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Own the relevant expansion', 'NPC unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-beast-tribes'] = {
  short: 'Allied Society',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: ArrowUp, title: 'Target Rank Reached', text: 'Any Allied Society raised to your chosen rank — no daily-reset grind.' },
    { icon: Trophy, title: 'Exclusive Society Mounts', text: 'Each faction offers an exclusive mount at max rank.' },
    { icon: BadgeCheck, title: 'Titles & Questlines', text: 'Unique titles and NPC stories unlocked across every rank tier.' },
    { icon: Gem, title: 'Currencies & Rewards Kept', text: 'Tribe currencies, minions and every reward from each session stays yours.' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Own the relevant expansion', 'Society unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

SERVICE_PAGES['ffxiv-cloud-of-darkness'] = {
  short: 'The Cloud of Darkness',
  rewardsHeading: 'Rewards',
  rewards: [
    { icon: Trophy, title: 'Mount Drops (Guaranteed at minimum ilvl)', items: ['Dais of Darkness', 'Shroud of Darkness'] },
    { icon: Package, title: 'Clouddark Armours & Wisp of Darkness Minion', text: 'Exclusive Clouddark demimateria earned for completing the encounter.' },
    { icon: Swords, title: 'Chaotic Alliance Raid Completion', text: 'The Cloud of Darkness (Chaotic) completed.' },
    { icon: BadgeCheck, title: 'Achievement: "Cloud Strife"', text: 'Achievement unlocked upon defeating The Cloud of Darkness (Chaotic).' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', 'Normal Mode Completion / Fight Unlocked', 'ilvl 740 or higher gear'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};

const allianceRaidPage = (
  short: string,
  token: string,
): ServicePageContent => ({
  short,
  rewardsHeading: 'Rewards',
  rewards: [
    { icon: Package, title: token, text: 'High item level gear from every clear, straight to your armoury.' },
    { icon: Gem, title: 'All Loot Kept', text: 'Minions, orchestrion rolls, cards and tomestones — every drop from the run stays on your character.' },
    { icon: Swords, title: 'Alliance Raid Completion', text: `${short} completed.` },
    { icon: Medal, title: 'Achievement Unlocked', text: `Achievement unlocked upon completing ${short}.` },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', 'Duty unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    ALLIANCE_GROUP_VS_PILOTED,
  ],
});

SERVICE_PAGES['ffxiv-jeuno-first-walk'] = allianceRaidPage('Jeuno: The First Walk', 'Guaranteed Gear');
SERVICE_PAGES['ffxiv-san-doria-second-walk'] = allianceRaidPage("San d'Oria: The Second Walk", 'Guaranteed Gear Upgrade Token');
SERVICE_PAGES['ffxiv-windurst-third-walk'] = allianceRaidPage('Windurst: The Third Walk', 'Guaranteed Gear Upgrade Token');

/** Variant dungeon pages share one shape; level/expansion differ per dungeon.
    `mount` replaces the generic cosmetics row (2nd spot) with a mount button;
    title/note overridable (e.g. exchange mounts drop the routes mention). */
const variantPage = (
  short: string,
  level: number,
  expansion: string,
  mount?: { name: string; title?: string; note?: string },
  routes = 12,
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    { icon: Package, title: `All ${routes} Routes Available`, text: 'Branching paths, secret bosses and every lore entry can be completed on request.' },
    ...(mount
      ? [{
          icon: Trophy,
          title: mount.title ?? `${mount.name} Mount (All 12 Routes)`,
          items: [mount.name],
          ...(mount.note ? { text: mount.note } : {}),
        } satisfies ServicePageReward]
      : [{ icon: Gem, title: 'Cosmetics & Glamour Rewards', text: 'Mounts, minions and glamour items earned from route completion stay yours.' } satisfies ServicePageReward]),
    { icon: BadgeCheck, title: 'V&C Dungeon Finder Entries', text: 'Lore entries unlocked in your V&C Dungeon Finder record.' },
    { icon: Medal, title: 'Achievement Unlocked', text: `Achievement unlocked upon completing ${short}.` },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Have a level ${level} Job`, `Own the ${expansion} Expansion`, 'Dungeon unlocked (available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
});

/** Criterion ("Another …") pages; `extra` is the dungeon-specific 3rd row.
    `mount` replaces the generic coins row (2nd spot) with a mount button. */
const criterionPage = (
  short: string,
  level: number,
  expansion: string,
  extra: ServicePageReward,
  mount?: { name: string; note?: string },
): ServicePageContent => ({
  short,
  rewardsHeading: 'What you get',
  rewards: [
    { icon: Swords, title: 'Criterion Clear', text: 'Difficult 4-player content cleared with a veteran group.' },
    ...(mount
      ? [{
          icon: Trophy,
          title: `${mount.name} Mount`,
          items: [mount.name],
          ...(mount.note ? { text: mount.note } : {}),
        } satisfies ServicePageReward]
      : [{ icon: Coins, title: '4 Dungeon Coins per Clear', text: 'Coins trade for materia, orchestrion rolls and the exclusive mount (100 coins).' } satisfies ServicePageReward]),
    extra,
    { icon: Medal, title: 'Achievement Unlocked', text: `Achievement unlocked upon completing ${short}.` },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: [`Have a level ${level} Job`, `Own the ${expansion} Expansion`, 'Criterion unlocked (variant completion available as an additional service)'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
});

SERVICE_PAGES['ffxiv-variant-merchants-tale'] = variantPage("Variant: Merchant's Tale", 90, 'Dawntrail', {
  name: 'Royal Magicked Carpet',
  title: 'Royal Magicked Carpet Mount (Advanced only)',
  note: '— random drop or 100 Corvosi Brass exchange.',
}, 13);
SERVICE_PAGES['ffxiv-variant-aloalo-island'] = variantPage('Variant: Aloalo Island', 90, 'Endwalker', { name: 'Spectral Statice' });
SERVICE_PAGES['ffxiv-variant-mount-rokkon'] = variantPage('Variant: Mount Rokkon', 90, 'Endwalker', { name: 'Burabura Chochin' });
SERVICE_PAGES['ffxiv-variant-sildihn-subterrane'] = variantPage("Variant: The Sil'dihn Subterrane", 90, 'Endwalker', { name: 'Silkie' });

SERVICE_PAGES['ffxiv-another-merchants-tale'] = criterionPage("Another Merchant's Tale", 100, 'Dawntrail', {
  icon: BadgeCheck,
  title: 'Exclusive Title & Rewards',
  text: 'Title and dungeon-specific rewards from the criterion clear.',
}, { name: 'Genie of the Lamp', note: '— random drop or 100 Corvosi Manuscripts exchange.' });
SERVICE_PAGES['ffxiv-another-aloalo-island'] = criterionPage('Another Aloalo Island', 90, 'Endwalker', {
  icon: Coins,
  title: '4 Aloalo Coins per Clear',
  text: 'Coins trade for materia, orchestrion rolls and the Quaqua mount (100 coins).',
}, { name: 'Quaqua', note: '— random drop or 100 Aloalo Coins exchange.' });
SERVICE_PAGES['ffxiv-another-mount-rokkon'] = criterionPage('Another Mount Rokkon', 90, 'Endwalker', {
  icon: Coins,
  title: '4 Rokkon Coins per Clear',
  text: 'Coins trade for materia, orchestrion rolls and the Shishioji mount (100 coins).',
}, { name: 'Shishioji', note: '— random drop or 100 Shishu Coin exchange.' });
SERVICE_PAGES['ffxiv-another-sildihn-subterrane'] = criterionPage("Another Sil'dihn Subterrane", 90, 'Endwalker', {
  icon: BadgeCheck,
  title: 'Title: Infamy of Sil\'dih',
  text: 'Exclusive title from the criterion clear.',
}, { name: "Sil'dihn Throne", note: "— random drop or 100 Sil'dihn Silver exchange." });

SERVICE_PAGES['ffxiv-potd-solo'] = deepDungeonPage(
  'Palace of the Dead',
  ddRewards('Necromancer Title (Solo Piloted Boost Method)', { title: 'Achievement: “Pal-less Palace III”', text: 'Achievement unlocked upon clearing Palace of the Dead Floor 200 Solo.' }),
  ['Have a level 100 Job', '95+ Aetherpool Weapon & Armour (available as an add-on)', 'ilvl 740 or higher gear'],
  GROUP_PLAY_VS_PILOTED,
);
SERVICE_PAGES['ffxiv-hoh'] = deepDungeonPage(
  'Heaven-on-High',
  ddRewards('Lone Hero Title', { title: 'Achievement: “Heaven Is a Lonely Place II”', text: 'Achievement unlocked upon clearing Heaven-on-High Floor 100 Solo.' }, 'Juedi'),
  ['Have a level 100 Job', '95+ Aetherpool Weapon & Armour (available as an add-on)', 'ilvl 740 or higher gear'],
  GROUP_PLAY_VS_PILOTED,
);
SERVICE_PAGES['ffxiv-orthos'] = deepDungeonPage(
  'Eureka Orthos',
  ddRewards('Once and Future King/Queen Title', { title: 'Achievement: “All by Eurekaself II”', text: 'Achievement unlocked upon clearing Eureka Orthos Floor 100 Solo.' }, 'Aeturna'),
  ['Have a level 100 Job', '95+ Aetherpool Weapon & Armour (available as an add-on)', 'ilvl 740 or higher gear'],
  GROUP_PLAY_VS_PILOTED,
);
SERVICE_PAGES['ffxiv-pilgrims-traverse'] = deepDungeonPage(
  "Pilgrim's Traverse",
  ddRewards('The Enlightened Title', { title: 'Achievement: “Solo Traveler II”', text: "Achievement unlocked upon clearing Pilgrim's Traverse Floor 99 Solo." }),
  ['Have a level 100 Job', '95+ Aetherpool Weapon & Armour (available as an add-on)', 'ilvl 740 or higher gear'],
  GROUP_PLAY_VS_PILOTED,
);
SERVICE_PAGES['ffxiv-deep-dungeon-bundle'] = deepDungeonPage(
  'DD Bundle',
  [
    { icon: Swords, title: "POTD, HOH, EO and Pilgrim's Traverse Completion", text: 'Completion of 4 Deep Dungeons Solo.' },
    { icon: Gem, title: 'Exclusive Loot', text: 'Exclusive loot from all 4 Deep Dungeons.' },
    { icon: BadgeCheck, title: 'Deep Dungeon Solo Titles', text: 'Necromancer, Lone Hero, Once and Future King/Queen and The Enlightened titles.' },
    { icon: Medal, title: 'Deep Dungeon Specific Achievements', text: 'All solo achievements from clearing 4 Deep Dungeons.' },
  ],
  ['Have a level 100 Job', '90+ Aetherpool & Armour (available as an add-on)', 'ilvl 740 or higher gear'],
  GROUP_PLAY_VS_PILOTED,
);

SERVICE_PAGES['ffxiv-resistance-rank'] = {
  short: 'Resistance Rank',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: ArrowUp, title: 'Increased Resistance Rank', text: 'Your Bozja Rank increased to your desired level' },
    { icon: BadgeCheck, title: 'Completion of Bozjan and Zadnor content', text: 'Bozja Story mode completed up to your desired level' },
    { icon: Undo2, title: 'Access to Main Raids', text: 'Gain access to the 48 Man Raids inside of Bozja' },
    { icon: Package, title: 'Access to Bozja exclusive mounts, minions, and cosmetics', text: 'Acquire mounts, minions and cosmetics from Bozja or Zadnor' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 90 Job', 'Own the Shadowbringers Expansion', 'Bozja Unlocked'],
    },
    HOW_IT_WORKS,
    PILOTED_ONLY,
  ],
};
SERVICE_PAGES['ffxiv-eureka-leveling'] = {
  short: 'Eureka',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: Swords, title: 'Increased Elemental Level', text: 'Get your elemental level increased to your specific requirement!' },
    { icon: Package, title: 'Completion of Eureka zone progression', text: 'Eureka zone progression from lvl 1 to lvl 60' },
    { icon: Medal, title: 'Baldesion Arsenal', text: 'Unlock the Baldesion Arsenal' },
    { icon: Trophy, title: 'Eureka Relic Weapon', text: 'Progress toward Eureka relic weapons and armor' },
  ],
  accordion: [
    { title: 'Requirements', items: ['Own the relevant expansion', 'Content unlocked (available as an additional service)'] },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};
SERVICE_PAGES['ffxiv-occult-crescent'] = {
  short: 'Occult Crescent',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: Swords, title: 'Occult Crescent Glamour', text: 'Exclusive glamour only accessible via the Occult Crescent' },
    { icon: Package, title: 'Phantom Jobs', text: 'Level up your Phantom Jobs to your desired level' },
    { icon: Medal, title: 'Relic Steps', text: 'Gain access to the Dawntrail Relic steps and weapons' },
    { icon: Trophy, title: 'Occult Crescent Bunnies', text: 'Gain access to the fortune carrot events that can make you lots of gil!' },
  ],
  accordion: [
    {
      title: 'Requirements',
      items: ['Have a level 100 Job', 'Own the Dawntrail Expansion', 'Occult Crescent Unlocked'],
    },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};
SERVICE_PAGES['ffxiv-island-sanctuary'] = {
  short: 'Island Sanctuary',
  rewardsHeading: 'What you get',
  rewards: [
    { icon: ArrowUp, title: 'Sanctuary Ranks 1 - 20', text: 'Your Sanctuary Rank increased to your desired level.' },
    { icon: Gem, title: 'Landmarks, Rare Animals & Automation', text: 'Every landmark, rare animal and workshop automation unlocked along the way.' },
    { icon: BadgeCheck, title: 'All Logs completion (available as an add-on)', text: 'Full Gathering and Hunting Logs completed on request — every node, catch and creature recorded.' },
    { icon: Medal, title: 'Achievement Progress', text: 'Island sanctuary achievements unlocked en route.' },
  ],
  accordion: [
    { title: 'Requirements', items: ['Own the relevant expansion', 'Content unlocked (available as an additional service)'] },
    HOW_IT_WORKS,
    PILOTED_BOOST,
  ],
};

export function getServicePage(id?: string) {
  return id ? SERVICE_PAGES[id] : undefined;
}
