export interface Service {
  id: string;
  name: string;
  description: string;
  /** Base price in EUR */
  price: number;
  delivery: string;
  image: string;
  /** Optional third bullet — defaults to 'Hand-played · Money-back guarantee' */
  note?: string;
  /** Long-form text shown on a dedicated service subpage */
  longDescription?: string;
  tag?: 'Popular' | 'Hot' | 'New' | 'Best Value';
}

export interface Subcategory {
  id: string;
  name: string;
  services: Service[];
}

export interface Game {
  id: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  /** Card art used in the home carousel, navbar games menu and game page header */
  cardImage: string;
  main?: boolean;
  subcategories: Subcategory[];
}

import cardFfxiv from '@/assets/images/game-cards/GameCard_FFXIV.webp';
import cardWow from '@/assets/images/game-cards/GameCard_WoW.webp';
import cardLostArk from '@/assets/images/game-cards/GameCard_LostArk.webp';
import cardWarframe from '@/assets/images/game-cards/GameCard_Warframe.webp';
import cardOsrs from '@/assets/images/game-cards/GameCard_OSRS.webp';
import dsrMain from '@/assets/images/service-cards/ffxiv/ultimate-raids/dsr-main.png';

const img = (id: number, w = 640, h = 400) => `https://picsum.photos/id/${id}/${w}/${h}`;

export const games: Game[] = [
  {
    id: 'ffxiv',
    name: 'Final Fantasy XIV',
    short: 'FFXIV',
    tagline: 'Eorzea’s most trusted carry crew',
    description:
      'Our flagship category. Ultimate raiders, Savage speed-runners and Deep Dungeon veterans — the sharpest Grand Dice rollers in Eorzea handle your order.',
    cardImage: cardFfxiv,
    main: true,
    subcategories: [
      {
        id: 'gil',
        name: 'Gil (In-game currency)',
        services: [
          {
            id: 'ffxiv-gil-pack',
            name: 'Gil Pack',
            description: 'Delivered through secure trade within hours — any world, any amount.',
            price: 9.99,
            delivery: '10–100 M Gil',
            image: img(599),
            tag: 'Popular',
          },
          {
            id: 'ffxiv-gil-weekly',
            name: 'Weekly Gil Supply',
            description: 'A standing weekly delivery so you never have to craft for gil again.',
            price: 39.99,
            delivery: 'Up to 500 M / month',
            image: img(604),
          },
        ],
      },
      {
        id: 'current-patch',
        name: 'Current Patch',
        services: [
          {
            id: 'ffxiv-aac-savage',
            name: 'AAC Savage Tier Clear',
            description: 'Current raid tier cleared with loot priority on your job.',
            price: 129.99,
            delivery: 'All 4 floors',
            image: img(611),
            tag: 'Hot',
          },
          {
            id: 'ffxiv-new-ex',
            name: 'New Extreme Trial Farm',
            description: 'Latest EX trial farmed — mount and totems included.',
            price: 29.99,
            delivery: 'Day-one kills',
            image: img(618),
          },
          {
            id: 'ffxiv-patch-catchup',
            name: 'Patch Catch-Up Bundle',
            description: 'MSQ, unlocks and gear catch-up for the newest patch.',
            price: 79.99,
            delivery: 'Same week',
            image: img(622),
          },
        ],
      },
      {
        id: 'ultimate-raids',
        name: 'Ultimate Raids',
        services: [
          {
            id: 'ffxiv-dancing-mad',
            name: 'Dancing Mad',
            description: 'Adventurer Plate + Title',
            price: 449.99,
            delivery: 'Palazzo Diamond Weapon',
            note: 'Piloted Service',
            image: img(550),
            tag: 'Hot',
          },
          {
            id: 'ffxiv-fru',
            name: 'The Futures Rewritten',
            description: 'Adventurer Plate + Title',
            price: 399.99,
            delivery: 'Ultimate Edenmorn Weapon',
            note: 'Piloted Service',
            image: img(558),
          },
          {
            id: 'ffxiv-top',
            name: 'The Omega Protocol',
            description: 'Adventurer Plate + Title',
            price: 349.99,
            delivery: 'Ultimate Omega Weapon',
            note: 'Piloted Service',
            image: img(564),
          },
          {
            id: 'ffxiv-dsr',
            name: 'Dragonsong’s Reprise',
            description: 'Adventurer Plate + Title',
            price: 299.99,
            delivery: 'Ultimate Heaven Weapon',
            note: 'Piloted or AFK Carry',
            longDescription:
              '“There are no ifs in history, yet man is wont to cast his mind towards the path not walked.” Thus spoke the wandering minstrel, and at his urging, you reflect upon bygone trials with newfound perspective. Your imagination stirred by the man\'s masterfully woven verse, you dream of an alternate conclusion to the Dragonsong War─one in which a dear comrade is spared his tragic fate...',
            image: dsrMain,
          },
          {
            id: 'ffxiv-tea',
            name: 'The Epic of Alexander',
            description: 'Adventurer Plate + Title',
            price: 279.99,
            delivery: 'Ultimate Alexander Weapon',
            note: 'Piloted or AFK Carry',
            image: img(576),
          },
          {
            id: 'ffxiv-ucob',
            name: 'The Unending Coil of Bahamut',
            description: 'Adventurer Plate + Title',
            price: 249.99,
            delivery: 'Ultima Weapon',
            note: 'Piloted or AFK Carry',
            image: img(582),
          },
          {
            id: 'ffxiv-uwu',
            name: 'The Weapon’s Refrain',
            description: 'Adventurer Plate + Title',
            price: 249.99,
            delivery: 'Ultimate Dreadwyrm Weapon',
            note: 'Piloted or AFK Carry',
            image: img(588),
          },
          {
            id: 'ffxiv-ultimate-bundle',
            name: 'The Ultimate Bundle',
            description: 'Adventurer Plates + Titles',
            price: 1299.99,
            delivery: 'Ultimate Weapons',
            note: 'Piloted or AFK Carry*',
            image: img(594),
            tag: 'Best Value',
          },
        ],
      },
      {
        id: 'raids',
        name: 'Raids',
        services: [
          {
            id: 'ffxiv-savage-tier',
            name: 'Savage Tier Full Clear',
            description: 'All four floors of the current Savage tier, piloted or self-play.',
            price: 119.99,
            delivery: '2–4 days',
            image: img(48),
            tag: 'Popular',
          },
          {
            id: 'ffxiv-raid-glamour',
            name: 'Raid Glamour & Mount Farm',
            description: 'Mounts, glamours and achievements farmed from older raid tiers.',
            price: 39.99,
            delivery: 'Any raid tier',
            image: img(630),
          },
        ],
      },
      {
        id: 'alliance-raids',
        name: '24 Player Raids',
        services: [
          {
            id: 'ffxiv-alliance-weekly',
            name: 'Alliance Raid Weekly Clear',
            description: 'Latest 24-player raid cleared with coin and loot rolls.',
            price: 14.99,
            delivery: 'Same day',
            image: img(635),
          },
          {
            id: 'ffxiv-alliance-glamour',
            name: 'Alliance Glamour Sets',
            description: 'Full glamour sets farmed from every alliance raid series.',
            price: 34.99,
            delivery: '1–2 weeks',
            image: img(642),
          },
        ],
      },
      {
        id: 'trials',
        name: 'Trials',
        services: [
          {
            id: 'ffxiv-extreme-farm',
            name: 'Extreme Trial Farm',
            description: 'Any number of Extreme trial kills with mount and totem farming handled.',
            price: 24.99,
            delivery: 'Same day',
            image: img(60),
          },
          {
            id: 'ffxiv-unreal',
            name: 'Unreal Trial Clear',
            description: 'Weekly Unreal clear for faux leaves and relic progression.',
            price: 14.99,
            delivery: 'Same day',
            image: img(119),
          },
        ],
      },
      {
        id: 'deep-dungeon',
        name: 'Deep Dungeons',
        services: [
          {
            id: 'ffxiv-orthos',
            name: 'Eureka Orthos 1–100',
            description: 'Full Orthos clear with the weapon glow and all achievements along the climb.',
            price: 89.99,
            delivery: '2–4 days',
            image: img(287),
          },
          {
            id: 'ffxiv-potd-solo',
            name: 'Palace of the Dead Solo 200',
            description: 'The Necromancer title run — solo floor 200 by one of the few who can do it.',
            price: 299.99,
            delivery: '1–2 weeks',
            image: img(315),
            tag: 'Hot',
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven-on-High Title Run',
            description: 'Floors 1–100 cleared with Empyrean aetherpool progress and the title.',
            price: 69.99,
            delivery: '2–3 days',
            image: img(326),
          },
        ],
      },
      {
        id: 'mounts',
        name: 'Mounts',
        services: [
          {
            id: 'ffxiv-mount-farm',
            name: 'Extreme Mount Farm',
            description: 'Any Extreme or Savage mount farmed until it drops. Guaranteed.',
            price: 34.99,
            delivery: '1–3 days',
            image: img(341),
            tag: 'Popular',
          },
          {
            id: 'ffxiv-mount-bundle',
            name: 'Current Patch Mount Bundle',
            description: 'Every mount from the current patch cycle in one discounted bundle.',
            price: 89.99,
            delivery: '1–2 weeks',
            image: img(648),
          },
        ],
      },
      {
        id: 'gear',
        name: 'Gearing',
        services: [
          {
            id: 'ffxiv-bis-farm',
            name: 'Best-in-Slot Gear Farm',
            description: 'Full BiS set for your job — Savage drops, tomestone pieces and melds.',
            price: 99.99,
            delivery: '1–2 weeks',
            image: img(237),
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-tomes',
            name: 'Tomestone Weekly Cap',
            description: 'Weekly capped tomes farmed on schedule so you never fall behind.',
            price: 19.99,
            delivery: 'Weekly',
            image: img(249),
          },
          {
            id: 'ffxiv-relic',
            name: 'Relic Weapon Boost',
            description: 'Any relic chain — Zodiac, Anima, Eureka, Resistance or Manderville.',
            price: 79.99,
            delivery: '3–5 days',
            image: img(274),
          },
        ],
      },
      {
        id: 'reputation',
        name: 'Reputation',
        services: [
          {
            id: 'ffxiv-beast-tribes',
            name: 'Beast Tribe Reputation Max',
            description: 'Allied rank with every tribe — mounts, minions and questlines unlocked.',
            price: 44.99,
            delivery: '1–2 weeks',
            image: img(654),
          },
          {
            id: 'ffxiv-island-sanctuary',
            name: 'Island Sanctuary Maxing',
            description: 'Sanctuary rank 20, all landmarks, rare animals and workshop automation.',
            price: 44.99,
            delivery: '1 week',
            image: img(366),
          },
          {
            id: 'ffxiv-blue-mage',
            name: 'Blue Mage Spellbook',
            description: 'All Blue Mage spells learned and the Masked Carnivale cleared.',
            price: 59.99,
            delivery: '3–5 days',
            image: img(350),
          },
        ],
      },
      {
        id: 'leveling',
        name: 'Leveling',
        services: [
          {
            id: 'ffxiv-level-100',
            name: 'Level 1–100 Powerleveling',
            description: 'Full journey to the Dawntrail cap on any job — aetherytes unlocked.',
            price: 189.99,
            delivery: '5–8 days',
            image: img(160),
            tag: 'Popular',
          },
          {
            id: 'ffxiv-alt-job',
            name: 'Alt Job Boost 90–100',
            description: 'Push any combat job through the last stretch with optimized dungeon spam.',
            price: 49.99,
            delivery: '2–3 days',
            image: img(180),
          },
          {
            id: 'ffxiv-msq-skip',
            name: 'MSQ Completion Boost',
            description: 'Main Scenario completed from any point — ARR through Dawntrail.',
            price: 139.99,
            delivery: '4–6 days',
            image: img(201),
          },
        ],
      },
      {
        id: 'pvp',
        name: 'PvP',
        services: [
          {
            id: 'ffxiv-cc-rank',
            name: 'Crystalline Conflict Rank Boost',
            description: 'From any rank to Crystal by top-100 ladder players. Earned, never traded.',
            price: 129.99,
            delivery: '3–6 days',
            image: img(392),
            tag: 'Hot',
          },
          {
            id: 'ffxiv-frontline',
            name: 'Frontline 100 Wins',
            description: 'The mount and title grind done for you — a hundred victories.',
            price: 54.99,
            delivery: '1 week',
            image: img(431),
          },
          {
            id: 'ffxiv-series-rewards',
            name: 'PvP Series Level 25',
            description: 'Full seasonal Series pass — emotes, framer’s kits and the glamour set.',
            price: 39.99,
            delivery: '5–7 days',
            image: img(445),
          },
        ],
      },
      {
        id: 'coaching',
        name: 'Coaching',
        services: [
          {
            id: 'ffxiv-raid-coaching',
            name: 'Raid Coaching Session',
            description: 'Learn your job and mechanics from a world-class raider.',
            price: 29.99,
            delivery: '1-on-1 · 2 hours',
            image: img(662),
          },
          {
            id: 'ffxiv-pvp-coaching',
            name: 'PvP Coaching Session',
            description: 'Crystalline Conflict VOD review and live coaching.',
            price: 24.99,
            delivery: '1-on-1 · 2 hours',
            image: img(668),
          },
        ],
      },
    ],
  },
  {
    id: 'wow',
    name: 'World of Warcraft',
    short: 'WoW',
    tagline: 'Azeroth, handled',
    description:
      'Mythic raiding rosters, MDI-level key pushers and gladiator-ranked PvPers across US and EU realms.',
    cardImage: cardWow,
    subcategories: [
      {
        id: 'raids',
        name: 'Raid Boosts',
        services: [],
      },
      {
        id: 'mythic-plus',
        name: 'Mythic+',
        services: [],
      },
      {
        id: 'leveling',
        name: 'Leveling',
        services: [],
      },
      {
        id: 'pvp',
        name: 'PvP',
        services: [],
      },
    ],
  },
  {
    id: 'lost-ark',
    name: 'Lost Ark',
    short: 'Lost Ark',
    tagline: 'Arkesia without the homework',
    description:
      'Legion Raid veterans and bus drivers with thousands of clears. Skip the gatekeeping, keep the loot.',
    cardImage: cardLostArk,
    subcategories: [
      {
        id: 'legion-raids',
        name: 'Legion Raids',
        services: [],
      },
      {
        id: 'dungeons',
        name: 'Dungeons',
        services: [],
      },
      {
        id: 'progression',
        name: 'Progression',
        services: [],
      },
      {
        id: 'collectibles',
        name: 'Collectibles',
        services: [],
      },
    ],
  },
  {
    id: 'warframe',
    name: 'Warframe',
    short: 'Warframe',
    tagline: 'Tenno, we lift the grind',
    description:
      'Veteran Tenno who run Eidolons in their sleep. Farming, mastery and endgame clears at speed.',
    cardImage: cardWarframe,
    subcategories: [
      {
        id: 'mastery',
        name: 'Mastery',
        services: [],
      },
      {
        id: 'farming',
        name: 'Farming',
        services: [],
      },
      {
        id: 'bosses',
        name: 'Bosses',
        services: [],
      },
      {
        id: 'endgame',
        name: 'Endgame',
        services: [],
      },
    ],
  },
  {
    id: 'runescape',
    name: 'RuneScape',
    short: 'RuneScape',
    tagline: 'Gielinor’s finest mercenaries',
    description:
      'Inferno-certified pvmers and maxed skillers for both OSRS and RS3. No bots, no shortcuts — just clicks.',
    cardImage: cardOsrs,
    subcategories: [
      {
        id: 'bossing',
        name: 'Bossing',
        services: [],
      },
      {
        id: 'skilling',
        name: 'Skilling',
        services: [],
      },
      {
        id: 'capes',
        name: 'Capes & Titles',
        services: [],
      },
      {
        id: 'accounts',
        name: 'Account Builds',
        services: [],
      },
    ],
  },
];

export const getGame = (id: string) => games.find((g) => g.id === id);

export const serviceCount = (game: Game) =>
  game.subcategories.reduce((sum, s) => sum + s.services.length, 0);

export const totalServiceCount = games.reduce((sum, g) => sum + serviceCount(g), 0);

export interface ServiceSearchResult {
  game: Game;
  subId: string;
  subName: string;
  service: Service;
}

/** Flat index of every service, used by the navbar search. */
export const allServices: ServiceSearchResult[] = games.flatMap((game) =>
  game.subcategories.flatMap((sub) =>
    sub.services.map((service) => ({ game, subId: sub.id, subName: sub.name, service })),
  ),
);

/** Services that have their own dedicated subpage. */
const SERVICE_PAGE_IDS = new Set(['ffxiv-dsr']);

/** Where a service card links: its dedicated subpage if it has one, else its category page. */
export const serviceLink = (serviceId: string): string => {
  const hit = allServices.find((s) => s.service.id === serviceId);
  if (!hit) return '/';
  if (SERVICE_PAGE_IDS.has(serviceId)) return `/boosting/${hit.game.id}/${serviceId}`;
  return `/boosting/${hit.game.id}?cat=${hit.subId}`;
};
