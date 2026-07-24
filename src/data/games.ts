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
import scBlank from '@/assets/images/service-cards/ffxiv/sc-blank.webp';
import scGil from '@/assets/images/service-cards/ffxiv/gil-currency/sc-gil.webp';
import scDmu from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-dmu.webp';
import scFru from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-fru.webp';
import scTop from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-top.webp';
import scDsr from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-dsr.webp';
import scTea from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-tea.webp';
import scUcob from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-ucob.webp';
import scUwu from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-uwu.webp';
import scUltBundle from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-ult-bundle.webp';

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
        name: 'Gil Currency',
        services: [
          {
            id: 'ffxiv-gil-pack',
            name: 'Gil Pack',
            description: 'Delivered through secure trade within hours — any world, any amount.',
            price: 9.99,
            delivery: '10–100 M Gil',
            image: scGil,
            tag: 'Popular',
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
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-new-ex',
            name: 'New Extreme Trial Farm',
            description: 'Latest EX trial farmed — mount and totems included.',
            price: 29.99,
            delivery: 'Day-one kills',
            image: scBlank,
          },
          {
            id: 'ffxiv-patch-catchup',
            name: 'Patch Catch-Up Bundle',
            description: 'MSQ, unlocks and gear catch-up for the newest patch.',
            price: 79.99,
            delivery: 'Same week',
            image: scBlank,
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
            image: scDmu,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-fru',
            name: 'The Futures Rewritten',
            description: 'Adventurer Plate + Title',
            price: 399.99,
            delivery: 'Ultimate Edenmorn Weapon',
            note: 'Piloted Service',
            image: scFru,
          },
          {
            id: 'ffxiv-top',
            name: 'The Omega Protocol',
            description: 'Adventurer Plate + Title',
            price: 349.99,
            delivery: 'Ultimate Omega Weapon',
            note: 'Piloted Service',
            image: scTop,
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
            image: scDsr,
          },
          {
            id: 'ffxiv-tea',
            name: 'The Epic of Alexander',
            description: 'Adventurer Plate + Title',
            price: 279.99,
            delivery: 'Ultimate Alexander Weapon',
            note: 'Piloted or AFK Carry',
            image: scTea,
          },
          {
            id: 'ffxiv-ucob',
            name: 'The Unending Coil of Bahamut',
            description: 'Adventurer Plate + Title',
            price: 249.99,
            delivery: 'Ultima Weapon',
            note: 'Piloted or AFK Carry',
            image: scUcob,
          },
          {
            id: 'ffxiv-uwu',
            name: 'The Weapon’s Refrain',
            description: 'Adventurer Plate + Title',
            price: 249.99,
            delivery: 'Ultimate Dreadwyrm Weapon',
            note: 'Piloted or AFK Carry',
            image: scUwu,
          },
          {
            id: 'ffxiv-ultimate-bundle',
            name: 'The Ultimate Bundle',
            description: 'Adventurer Plates + Titles',
            price: 1299.99,
            delivery: 'Ultimate Weapons',
            note: 'Piloted or AFK Carry*',
            image: scUltBundle,
            tag: 'Best Value',
          },
        ],
      },
      {
        id: 'raids',
        name: 'Savage Raids',
        services: [
          {
            id: 'ffxiv-savage-tier',
            name: 'Arcadion Savage Series',
            description: 'Get 790/795 ilvl gear',
            price: 19.99,
            delivery: 'Exclusive mounts & minions',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-pandaemonium-savage',
            name: 'Pandaemonium Savage Series',
            description: 'Sunforged + 2 more mounts',
            price: 59.99,
            delivery: 'Quick clears of all tiers',
            image: scBlank,
          },
          {
            id: 'ffxiv-eden-savage',
            name: 'Eden Savage Series',
            description: 'Full loot priority',
            price: 49.99,
            delivery: '3 unique sets of glamour',
            image: scBlank,
          },
          {
            id: 'ffxiv-omega-savage',
            name: 'Omega Savage Series',
            description: 'Iconic Stormblood glamour',
            price: 49.99,
            delivery: '3 unique mounts for a full run',
            image: scBlank,
          },
          {
            id: 'ffxiv-alexander-savage',
            name: 'Alexander Savage Series',
            description: 'Iconic Heavensward glamour',
            price: 49.99,
            delivery: 'Full series clear with all loot',
            image: scBlank,
          },
        ],
      },
      {
        id: 'alliance-raids',
        name: '24 Player Raids',
        services: [
          {
            id: 'ffxiv-delubrum-reginae-savage',
            name: 'Delubrum Reginae (Savage)',
            description: '48-man savage raid clear',
            price: 99.99,
            delivery: 'Cerberus mount chance & title',
            image: scBlank,
          },
          {
            id: 'ffxiv-baldesion-arsenal',
            name: 'The Baldesion Arsenal',
            description: 'Full BA clear with a veteran group',
            price: 79.99,
            delivery: 'Demi-Ozma mount chance',
            image: scBlank,
          },
          {
            id: 'ffxiv-forked-tower-blood',
            name: 'The Forked Tower: Blood',
            description: 'Occult Crescent raid clear',
            price: 59.99,
            delivery: 'All loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-forked-tower-magic',
            name: 'The Forked Tower: Magic',
            description: 'Occult Crescent raid clear',
            price: 59.99,
            delivery: 'All loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-jeuno-first-walk',
            name: 'Jeuno: The First Walk',
            description: 'Quick 7.1 Alliance Raid run',
            price: 59.99,
            delivery: 'Chance at 720 ilvl gear & Nano Lord minion',
            image: scBlank,
          },
          {
            id: 'ffxiv-san-doria-second-walk',
            name: "San d'Oria: The Second Walk",
            description: 'Quick 7.3 raid clear',
            price: 59.99,
            delivery: 'Guaranteed Gear Upgrade Token',
            image: scBlank,
          },
          {
            id: 'ffxiv-windurst-third-walk',
            name: 'Windurst: The Third Walk',
            description: "Echoes of Vana'diel alliance raid clear",
            price: 59.99,
            delivery: 'Guaranteed Gear Upgrade Token',
            image: scBlank,
          },
        ],
      },
      {
        id: 'trials',
        name: 'Extreme Trials',
        services: [
          {
            id: 'ffxiv-limitless-blue',
            name: 'The Limitless Blue (Extreme)',
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-thok-ast-thok',
            name: 'Thok ast Thok (Extreme)',
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-thordans-reign',
            name: "The Minstrel's Ballad: Thordan's Reign",
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-s1t7',
            name: 'Containment Bay S1T7 (Extreme)',
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-nidhoggs-rage',
            name: "The Minstrel's Ballad: Nidhogg's Rage",
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-p1t6',
            name: 'Containment Bay P1T6 (Extreme)',
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-z1t9',
            name: 'Containment Bay Z1T9 (Extreme)',
            description: 'Heavensward Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-pool-of-tribute',
            name: 'The Pool of Tribute (Extreme)',
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-emanation',
            name: 'Emanation (Extreme)',
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-shinryus-domain',
            name: "The Minstrel's Ballad: Shinryu's Domain",
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-jade-stoa',
            name: 'The Jade Stoa (Extreme)',
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-tsukuyomis-pain',
            name: "The Minstrel's Ballad: Tsukuyomi's Pain",
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-great-hunt',
            name: 'The Great Hunt (Extreme)',
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hells-kier',
            name: "Hells' Kier (Extreme)",
            description: 'Stormblood Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-dancing-plague',
            name: 'Dancing Plague (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-crown-of-the-immaculate',
            name: 'Crown of the Immaculate (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-cinder-drift',
            name: 'Cinder Drift (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-castrum-marinum',
            name: 'Castrum Marinum (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-cloud-deck',
            name: 'The Cloud Deck (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hadess-elegy',
            name: "The Minstrel's Ballad: Hades's Elegy",
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-seat-of-sacrifice',
            name: 'The Seat of Sacrifice (Extreme)',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-memoria-misera',
            name: 'Memoria Misera',
            description: 'Shadowbringers Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-zodiarks-fall',
            name: "The Minstrel's Ballad: Zodiark's Fall",
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hydaelyns-call',
            name: "The Minstrel's Ballad: Hydaelyn's Call",
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-endsingers-aria',
            name: "The Minstrel's Ballad: Endsinger's Aria",
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-storms-crown',
            name: "Storm's Crown (Extreme)",
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-mount-ordeals',
            name: 'Mount Ordeals (Extreme)',
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-voidcast-dais',
            name: 'The Voidcast Dais (Extreme)',
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-abyssal-fracture',
            name: 'The Abyssal Fracture (Extreme)',
            description: 'Endwalker Extreme trial clear',
            price: 9.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-worqor-lar-dor',
            name: 'Worqor Lar Dor (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 12.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-everkeep',
            name: 'Everkeep (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 12.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-sphenes-burden',
            name: "The Minstrel's Ballad: Sphene's Burden",
            description: 'Dawntrail Extreme trial clear',
            price: 19.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-recollection',
            name: 'Recollection (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 14.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-necrons-embrace',
            name: "The Minstrel's Ballad: Necron's Embrace",
            description: 'Dawntrail Extreme trial clear',
            price: 24.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-windward-wilds',
            name: 'The Windward Wilds (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 24.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hell-on-rails',
            name: 'Hell on Rails (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 49.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-the-unmaking',
            name: 'The Unmaking (Extreme)',
            description: 'Dawntrail Extreme trial clear',
            price: 49.99,
            delivery: 'Totems & all loot included',
            image: scBlank,
            tag: 'New',
          },
        ],
      },
      {
        id: 'deep-dungeon',
        name: 'Deep Dungeons',
        services: [
          {
            id: 'ffxiv-potd-solo',
            name: 'Palace of the Dead',
            description: 'The Necromancer title run — solo floor 200 by one of the few who can do it.',
            price: 299.99,
            delivery: '1–2 weeks',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven on High',
            description: 'Floors 1–100 cleared with Empyrean aetherpool progress and the title.',
            price: 69.99,
            delivery: '2–3 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-orthos',
            name: 'Eureka Orthos',
            description: 'Full Orthos clear with the weapon glow and all achievements along the climb.',
            price: 89.99,
            delivery: '2–4 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-pilgrims-traverse',
            name: 'Pilgrims Traverse',
            description: 'Dawntrail deep dungeon cleared with all achievements along the climb.',
            price: 99.99,
            delivery: '2–4 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-deep-dungeon-bundle',
            name: 'Deep Dungeons Bundle',
            description: 'All four deep dungeons cleared at a bundle discount.',
            price: 399.99,
            delivery: '2–3 weeks',
            image: scBlank,
            tag: 'Best Value',
          },
        ],
      },
      {
        id: 'criterion-dungeons',
        name: 'Criterion Dungeons',
        services: [
          {
            id: 'ffxiv-variant-sildihn-subterrane',
            name: "Variant: The Sil'dihn Subterrane",
            description: 'All 12 routes available',
            price: 20,
            delivery: 'Fresh cosmetic rewards',
            image: scBlank,
          },
          {
            id: 'ffxiv-variant-mount-rokkon',
            name: 'Variant: Mount Rokkon',
            description: 'All 12 routes available',
            price: 20,
            delivery: 'Rewards & glamour sets',
            image: scBlank,
          },
          {
            id: 'ffxiv-variant-aloalo-island',
            name: 'Variant: Aloalo Island',
            description: 'All 12 routes available',
            price: 20,
            delivery: 'Chance for a special mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-criterion-glamour-set',
            name: 'Glamour Set from 1 Criterion',
            description: 'Full glamour set from any Criterion dungeon',
            price: 70,
            delivery: 'All paths cleared',
            image: scBlank,
          },
          {
            id: 'ffxiv-criterion-mount-all-paths',
            name: 'Mount from 1 Criterion [All Paths]',
            description: 'Guaranteed mount from any Criterion dungeon',
            price: 70,
            delivery: 'All paths cleared',
            image: scBlank,
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-another-sildihn-subterrane',
            name: "Another Sil'dihn Subterrane",
            description: 'Criterion clear with all loot',
            price: 90,
            delivery: "Infamy of Sil'dih title",
            image: scBlank,
          },
          {
            id: 'ffxiv-another-mount-rokkon',
            name: 'Another Mount Rokkon',
            description: 'Criterion clear with all loot',
            price: 90,
            delivery: 'Chance at Shishioji mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-aloalo-island',
            name: 'Another Aloalo Island',
            description: 'Criterion clear with all loot',
            price: 90,
            delivery: 'Mount and title',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-sildihn-savage',
            name: "Another Sil'dihn Subterrane (Savage)",
            description: 'Savage Criterion clear',
            price: 300,
            delivery: 'Exclusive rewards & title',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-another-rokkon-savage',
            name: 'Another Mount Rokkon (Savage)',
            description: 'Savage Criterion clear',
            price: 300,
            delivery: 'Exclusive rewards & title',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-aloalo-savage',
            name: 'Another Aloalo Island (Savage)',
            description: 'Savage Criterion clear',
            price: 300,
            delivery: 'Exclusive rewards & title',
            image: scBlank,
          },
        ],
      },
      {
        id: 'mounts',
        name: 'Mounts',
        services: [
          {
            id: 'ffxiv-wings-of-nihility',
            name: 'Wings of Nihility',
            description: 'Patch 7.5 wings without wipes',
            price: 700,
            delivery: '785 ilvl upgrades included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-apocryphal-bahamut',
            name: 'Apocryphal Bahamut',
            description: 'Extremely difficult to unlock',
            price: 699.99,
            delivery: '7 extra Lynx mounts + title',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-ruin',
            name: 'Wings of Ruin',
            description: '~5% drop chance skip',
            price: 175,
            delivery: 'Tomestones & Skyruin Totems',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-resolve',
            name: 'Wings of Resolve',
            description: 'Extreme trial mount',
            price: 175,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-eternity',
            name: 'Wings of Eternity',
            description: 'Extreme trial mount',
            price: 250,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-knighthood',
            name: 'Wings of the Knighthood',
            description: '7.2 mount in 5 days',
            price: 300,
            delivery: 'Currency for high ilvl gear',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-death',
            name: 'Wings of Death',
            description: 'Extreme trial mount',
            price: 400,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-mist',
            name: 'Wings of Mist',
            description: 'Patch 7.4 Extreme trial mount',
            price: 450,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-cerberus-mount',
            name: 'Cerberus',
            description: 'Delubrum Reginae (Savage) mount',
            price: 199.99,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-demi-ozma',
            name: 'Demi-Ozma',
            description: 'The Baldesion Arsenal mount',
            price: 249.99,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-demon-haul',
            name: 'Demon Haul',
            description: 'Rare savage mount',
            price: 149.99,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
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
            image: scBlank,
          },
          {
            id: 'ffxiv-island-sanctuary',
            name: 'Island Sanctuary Maxing',
            description: 'Sanctuary rank 20, all landmarks, rare animals and workshop automation.',
            price: 44.99,
            delivery: '1 week',
            image: scBlank,
          },
          {
            id: 'ffxiv-blue-mage',
            name: 'Blue Mage Spellbook',
            description: 'All Blue Mage spells learned and the Masked Carnivale cleared.',
            price: 59.99,
            delivery: '3–5 days',
            image: scBlank,
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
            image: scBlank,
            tag: 'Popular',
          },
          {
            id: 'ffxiv-alt-job',
            name: 'Alt Job Boost 90–100',
            description: 'Push any combat job through the last stretch with optimized dungeon spam.',
            price: 49.99,
            delivery: '2–3 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-msq-skip',
            name: 'MSQ Completion Boost',
            description: 'Main Scenario completed from any point — ARR through Dawntrail.',
            price: 139.99,
            delivery: '4–6 days',
            image: scBlank,
          },
        ],
      },
      {
        id: 'pvp',
        name: 'PvP',
        services: [
          {
            id: 'ffxiv-cc-rank',
            name: 'Crystalline Conflict',
            description: 'Reach the chosen PvP tier',
            price: 33,
            delivery: "PvP glamour & Framer's Kit",
            image: scBlank,
          },
          {
            id: 'ffxiv-series-malmstones',
            name: 'Series Malmstones',
            description: 'Up to 30 Series levels',
            price: 20.99,
            delivery: 'Wanyudo mount at rank 25',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-frontline-wins',
            name: 'Frontline Wins',
            description: 'Any desired number of wins',
            price: 9.99,
            delivery: 'Plenty of Wolf Marks',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-cc-wins',
            name: 'Crystalline Conflict Wins',
            description: 'Preferred number of victories',
            price: 8,
            delivery: 'Series Malmstones progress',
            image: scBlank,
          },
          {
            id: 'ffxiv-cc-top-300',
            name: 'Crystalline Conflict Top 300',
            description: 'Join the Top 300 PvP players',
            price: 399.99,
            delivery: "Conflict Framer's Kits & crystals",
            image: scBlank,
          },
          {
            id: 'ffxiv-wolfs-mark-farm',
            name: "Wolf's Mark Farm",
            description: 'Any amount of Wolf Marks',
            price: 22.5,
            delivery: 'Glamour, mounts & emotes in reach',
            image: scBlank,
          },
          {
            id: 'ffxiv-pvp-gear',
            name: 'PvP Gear',
            description: 'Rare PvP armor for any job',
            price: 119.99,
            delivery: 'Top gear from 3 expansions',
            image: scBlank,
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
            image: scBlank,
          },
          {
            id: 'ffxiv-pvp-coaching',
            name: 'PvP Coaching Session',
            description: 'Crystalline Conflict VOD review and live coaching.',
            price: 24.99,
            delivery: '1-on-1 · 2 hours',
            image: scBlank,
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

// 'All services' aggregates every game's services without duplicating data entries
for (const game of games) {
  const uniqueServices = [
    ...new Map(game.subcategories.flatMap((s) => s.services).map((sv) => [sv.id, sv])).values(),
  ];
  game.subcategories.unshift({ id: 'all', name: 'All services', services: uniqueServices });
}

export const getGame = (id: string) => games.find((g) => g.id === id);

export const serviceCount = (game: Game) =>
  new Set(game.subcategories.flatMap((s) => s.services.map((sv) => sv.id))).size;

export const totalServiceCount = games.reduce((sum, g) => sum + serviceCount(g), 0);

export interface ServiceSearchResult {
  game: Game;
  subId: string;
  subName: string;
  service: Service;
}

/** Flat index of every service, used by the navbar search. */
export const allServices: ServiceSearchResult[] = games.flatMap((game) =>
  game.subcategories
    .filter((sub) => sub.id !== 'all')
    .flatMap((sub) =>
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
