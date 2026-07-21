export interface Service {
  id: string;
  name: string;
  description: string;
  /** Base price in USD */
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
            image: img(571),
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
        services: [
          {
            id: 'wow-mythic-clear',
            name: 'Mythic Raid Full Clear',
            description: 'Current-tier Mythic clear with Cutting Edge, loot funnels and a shot at the raid mount.',
            price: 199.99,
            delivery: '1 week',
            image: img(485),
            tag: 'Hot',
          },
          {
            id: 'wow-aotc',
            name: 'Ahead of the Curve',
            description: 'Final boss Heroic kill for the AotC feat — scheduled same-week, self-play available.',
            price: 29.99,
            delivery: 'Same day',
            image: img(502),
            tag: 'Popular',
          },
          {
            id: 'wow-glory',
            name: 'Glory of the Raider',
            description: 'Full raid meta-achievement run with every tricky mechanic handled for you.',
            price: 44.99,
            delivery: '1–2 days',
            image: img(529),
          },
        ],
      },
      {
        id: 'mythic-plus',
        name: 'Mythic+',
        services: [
          {
            id: 'wow-m10',
            name: '+10 Keystone Carry',
            description: 'Timed +10 (or any key level up to +15) with a full premade — armor stack and trader included.',
            price: 19.99,
            delivery: 'Same day',
            image: img(553),
            tag: 'Best Value',
          },
          {
            id: 'wow-ksm',
            name: 'Keystone Master',
            description: 'Seasonal KSM achievement and mount — all dungeons pushed to the required rating.',
            price: 89.99,
            delivery: '3–5 days',
            image: img(580),
          },
          {
            id: 'wow-vault',
            name: 'Great Vault Weekly Fill',
            description: 'Eight timed dungeons on schedule every week so your Vault always offers three choices.',
            price: 49.99,
            delivery: 'Weekly',
            image: img(596),
          },
        ],
      },
      {
        id: 'leveling',
        name: 'Leveling',
        services: [
          {
            id: 'wow-1-80',
            name: '1–80 Powerleveling',
            description: 'Fresh character to the level cap with campaign progress and riding unlocks included.',
            price: 79.99,
            delivery: '2–3 days',
            image: img(627),
          },
          {
            id: 'wow-renown',
            name: 'Renown & Reputation Catch-Up',
            description: 'All faction renown maxed with the cosmetics, mounts and recipes that come with it.',
            price: 39.99,
            delivery: '2–4 days',
            image: img(660),
          },
        ],
      },
      {
        id: 'pvp',
        name: 'PvP',
        services: [
          {
            id: 'wow-arena-1800',
            name: 'Arena Rating 1800',
            description: 'Rival title and the elite PvP set appearance, earned in 2v2 or 3v3 by gladiator players.',
            price: 69.99,
            delivery: '2–4 days',
            image: img(687),
            tag: 'Popular',
          },
          {
            id: 'wow-solo-shuffle',
            name: 'Solo Shuffle Elite Set',
            description: 'Shuffle rating pushed to the elite set breakpoint — piloted by multi-R1 specialists.',
            price: 99.99,
            delivery: '3–6 days',
            image: img(715),
          },
        ],
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
        services: [
          {
            id: 'la-thaemine',
            name: 'Thaemine Legion Raid Clear',
            description: 'Full Thaemine clear on Normal or Hard — the endgame wall, torn down for you.',
            price: 59.99,
            delivery: '1–2 days',
            image: img(766),
            tag: 'Hot',
          },
          {
            id: 'la-echidna',
            name: 'Echidna / Aegir Clear',
            description: 'Kazeros raid bosses cleared with your loot and auction priority guaranteed.',
            price: 49.99,
            delivery: '1–2 days',
            image: img(788),
          },
          {
            id: 'la-brelshaza',
            name: 'Brelshaza HM Farm',
            description: 'Hard mode Brel gates farmed weekly for ancient gear and honing materials.',
            price: 34.99,
            delivery: 'Weekly',
            image: img(823),
          },
        ],
      },
      {
        id: 'dungeons',
        name: 'Dungeons',
        services: [
          {
            id: 'la-abyssal',
            name: 'Abyssal Dungeon Clear',
            description: 'Any Abyssal dungeon cleared on your roster — Moko shortcuts, full rewards.',
            price: 14.99,
            delivery: 'Same day',
            image: img(870),
          },
          {
            id: 'la-kayangel',
            name: 'Kayangel Hard Mode',
            description: 'All Kayangel HM gates with elixir materials and light farmed clean.',
            price: 24.99,
            delivery: 'Same day',
            image: img(892),
          },
        ],
      },
      {
        id: 'progression',
        name: 'Progression',
        services: [
          {
            id: 'la-1-60',
            name: '1–60 Powerleveling',
            description: 'Story to endgame-ready with knowledge transfer optimization — alts done in days, not weeks.',
            price: 49.99,
            delivery: '2–3 days',
            image: img(903),
            tag: 'Popular',
          },
          {
            id: 'la-honing',
            name: 'Item Level Honing Boost',
            description: 'Target item level reached with our materials routing — pity protection managed smartly.',
            price: 99.99,
            delivery: '1–2 weeks',
            image: img(931),
          },
          {
            id: 'la-elixirs',
            name: 'Elixir & Transcendence Farm',
            description: 'Full elixir set and weapon transcendence completed by min-max specialists.',
            price: 69.99,
            delivery: '1 week',
            image: img(960),
          },
        ],
      },
      {
        id: 'collectibles',
        name: 'Collectibles',
        services: [
          {
            id: 'la-island-souls',
            name: 'Island Soul Farm',
            description: 'Any Island Souls you’re missing, RNG-heavy ones included, with rapport handled.',
            price: 39.99,
            delivery: '1–2 weeks',
            image: img(985),
          },
          {
            id: 'la-mokoko',
            name: 'Mokoko Seed Clear',
            description: 'Every Mokoko seed on the map collected — yes, all of them.',
            price: 29.99,
            delivery: '3–5 days',
            image: img(1002),
            tag: 'Best Value',
          },
        ],
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
        services: [
          {
            id: 'wf-mr30',
            name: 'Mastery Rank Boost',
            description: 'MR tests passed and gear leveled in bulk — push toward Legendary ranks without the slog.',
            price: 39.99,
            delivery: '3–5 days',
            image: img(1016),
            tag: 'Popular',
          },
          {
            id: 'wf-steel-path',
            name: 'Steel Path Unlock',
            description: 'Every star chart node cleared on Steel Path — incursions and rewards unlocked.',
            price: 54.99,
            delivery: '2–3 days',
            image: img(1024),
          },
        ],
      },
      {
        id: 'farming',
        name: 'Farming',
        services: [
          {
            id: 'wf-prime-farm',
            name: 'Prime Set Farm',
            description: 'Any Prime Warframe or weapon set — relics cracked, parts traded, delivered complete.',
            price: 24.99,
            delivery: '1–3 days',
            image: img(1029),
            tag: 'Best Value',
          },
          {
            id: 'wf-lich',
            name: 'Kuva Lich / Sister Hunt',
            description: 'Your Lich or Sister vanquished with the weapon and ephemera secured.',
            price: 19.99,
            delivery: 'Same day',
            image: img(1035),
          },
          {
            id: 'wf-arbitrations',
            name: 'Arbitrations Farm',
            description: 'Vitus essence, galvanized mods and endo farmed in hour-long rotation runs.',
            price: 14.99,
            delivery: 'Same day',
            image: img(1041),
          },
        ],
      },
      {
        id: 'bosses',
        name: 'Bosses',
        services: [
          {
            id: 'wf-eidolon',
            name: 'Eidolon Hunt 5x3',
            description: 'Full tridolon captures across the night cycle — arcanes and standing in bulk.',
            price: 29.99,
            delivery: 'Same day',
            image: img(1043),
            tag: 'Hot',
          },
          {
            id: 'wf-profit-taker',
            name: 'Profit-Taker Orb Runs',
            description: 'Speed-kill Profit-Taker runs for credits, toroids and Vox Solaris standing.',
            price: 17.99,
            delivery: 'Same day',
            image: img(1050),
          },
        ],
      },
      {
        id: 'endgame',
        name: 'Endgame',
        services: [
          {
            id: 'wf-netracells',
            name: 'Netracells Clear',
            description: 'Weekly Netracell missions cleared for archon shards and cavia standing.',
            price: 12.99,
            delivery: 'Weekly',
            image: img(1052),
          },
          {
            id: 'wf-archon',
            name: 'Archon Hunt Weekly',
            description: 'All three Archon Hunt missions done each week — guaranteed tauforged progress.',
            price: 9.99,
            delivery: 'Weekly',
            image: img(1054),
          },
        ],
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
        services: [
          {
            id: 'rs-zulrah',
            name: 'Zulrah Kill Count',
            description: 'Any KC target farmed — pet chance, uniques and profit stack up while you sleep.',
            price: 24.99,
            delivery: '1–2 days',
            image: img(1062),
            tag: 'Popular',
          },
          {
            id: 'rs-toa',
            name: 'Tombs of Amascut Raid',
            description: 'Expert-mode ToA completions with invocation scaling — shadow hunting included.',
            price: 49.99,
            delivery: '1–3 days',
            image: img(1067),
            tag: 'Hot',
          },
          {
            id: 'rs-nex',
            name: 'Nex / God Wars Carries',
            description: 'High-value boss kills in efficient teams with all drops logged to your account.',
            price: 34.99,
            delivery: '1–2 days',
            image: img(1071),
          },
        ],
      },
      {
        id: 'skilling',
        name: 'Skilling',
        services: [
          {
            id: 'rs-99',
            name: '99 Skill Powerleveling',
            description: 'Any skill from current level to 99 — hand-trained with efficient tick-perfect methods.',
            price: 89.99,
            delivery: '1–3 weeks',
            image: img(1074),
            tag: 'Best Value',
          },
          {
            id: 'rs-quests',
            name: 'Quest Point Cape',
            description: 'Every quest completed from wherever you stand — including all grandmasters.',
            price: 119.99,
            delivery: '1–2 weeks',
            image: img(1076),
          },
        ],
      },
      {
        id: 'capes',
        name: 'Capes & Titles',
        services: [
          {
            id: 'rs-infernal',
            name: 'Infernal Cape Service',
            description: 'The Inferno, completed by a cape specialist with thousands of waves logged. The real flex.',
            price: 149.99,
            delivery: '2–4 days',
            image: img(1080),
            tag: 'Hot',
          },
          {
            id: 'rs-fire-cape',
            name: 'Fire Cape Fast Run',
            description: 'Jad down in under an hour of account time. Classic cape, zero stress.',
            price: 14.99,
            delivery: 'Same day',
            image: img(1081),
          },
        ],
      },
      {
        id: 'accounts',
        name: 'Account Builds',
        services: [
          {
            id: 'rs-pure',
            name: 'Pure / Zerker Build',
            description: 'PK-ready account built to exact combat brackets — quests, stats and gear all planned.',
            price: 99.99,
            delivery: '1–2 weeks',
            image: img(1082),
          },
          {
            id: 'rs-ironman',
            name: 'Ironman Starter Package',
            description: 'Early-game ironman bootstrap — quests, diaries and gear milestones locked in.',
            price: 69.99,
            delivery: '1 week',
            image: img(1083),
          },
        ],
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
