import { BadgeCheck, Gem, Medal, Trophy, type LucideIcon } from 'lucide-react';

export interface ServicePageReward {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface ServicePageAccordionSection {
  title: string;
  items?: string[];
  groups?: { heading: string; items: string[] }[];
}

export interface ServicePageContent {
  /** Short label used as the last breadcrumb segment, e.g. 'DSR' */
  short: string;
  rewards: ServicePageReward[];
  accordion: ServicePageAccordionSection[];
}

const HOW_IT_WORKS: ServicePageAccordionSection = {
  title: 'How does it work?',
  items: [
    'Contact The Live Chat',
    'Pay the required amount with your selected payment method',
    "It's scheduled based on raider availability and times you'll be logged in",
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
      'The Dreadwyrm Legend',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon defeating Bahamut Prime in The Unending Coil of Bahamut.',
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 730 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-uwu': {
    short: 'UWU',
    rewards: rewards(
      'Ultima Totem',
      "The Weapon's Refrain Adventure Plate",
      'The Perfect Legend',
      {
        title: 'Ultimate Achievement',
        text: "Achievement unlocked upon defeating The Ultima Weapon in The Weapon's Refrain.",
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 730 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-tea': {
    short: 'TEA',
    rewards: rewards(
      'Alexander Totem',
      'The Epic of Alexander Adventure Plate',
      'The Alpha Legend',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon defeating Perfect Alexander in The Epic of Alexander.',
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 730 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
  'ffxiv-top': {
    short: 'TOP',
    rewards: rewards(
      'Omega Totem',
      'The Omega Protocol Adventure Plate',
      'The Omega Legend',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon defeating Alpha Omega in The Omega Protocol.',
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-fru': {
    short: 'FRU',
    rewards: rewards(
      'Edenmorn Totem',
      'The Futures Rewritten Adventure Plate',
      'The Eternal Legend',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon completing The Futures Rewritten.',
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-udm': {
    short: 'UDM',
    rewards: rewards(
      'Dancing Mad Totem',
      'Dancing Mad Adventure Plate',
      'Exclusive Ultimate Title',
      {
        title: 'Ultimate Achievement',
        text: 'Achievement unlocked upon completing Dancing Mad.',
      },
    ),
    accordion: [
      requirements('Required unlock duty completed (available as an add-on)', 'ilvl 760 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_ONLY,
    ],
  },
  'ffxiv-ultimate-bundle': {
    short: 'Bundle',
    rewards: [
      {
        icon: Gem,
        title: 'All Ultimate Weapons',
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
        title: 'Ultimate Achievements',
        text: 'Achievements unlocked upon completing every included Ultimate.',
      },
    ],
    accordion: [
      requirements('All required unlock duties completed (available as add-ons)', 'ilvl 740 or higher gear'),
      HOW_IT_WORKS,
      PILOTED_VS_AFK,
    ],
  },
};

export function getServicePage(id?: string) {
  return id ? SERVICE_PAGES[id] : undefined;
}
