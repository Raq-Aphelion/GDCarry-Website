export interface Service {
  id: string;
  name: string;
  tag2: string;
  /** Fallback price in EUR when the pricing database has no entry (0 until
      the service gets its own methodPrices/category file) */
  price: number;
  tag1: string;
  image: string;
  /** Optional third bullet — defaults to 'Hand-played · Money-back guarantee' */
  tag3?: string;
  /** Long-form text shown on a dedicated service subpage */
  longDescription?: string;
  tag?: 'Popular' | 'Hot' | 'New' | 'Best Value';
}

export interface Subcategory {
  id: string;
  name: string;
  services: Service[];
  /** Ids of services from other subcategories to display here as duplicate
      proxy cards — deduped from counts by their shared id. */
  proxies?: string[];
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
import scBlank from '@/assets/images/service-cards/ffxiv/ffxiv-blank.webp';
import scGil from '@/assets/images/service-cards/ffxiv/gil-currency/ffxiv-gil.webp';
import scDmu from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-dmu.webp';
import scFru from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-fru.webp';
import scTop from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-top.webp';
import scDsr from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-dsr.webp';
import scTea from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-tea.webp';
import scUcob from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-ucob.webp';
import scUwu from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-uwu.webp';
import scUltBundle from '@/assets/images/service-cards/ffxiv/ultimate-raids/ffxiv-ult-bundle.webp';
import scPandaemonium from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-pandaemonium.webp';
import scArcadion from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-arcadion.webp';
import scEden from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-eden.webp';
import scOmega from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-omega.webp';
import scAlexander from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-alexander.webp';
import scLeveling from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-leveling.webp';
import scMsq from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-msq.webp';
import scBlu from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-blue-mage.webp';
import scPvpSeries from '@/assets/images/service-cards/ffxiv/pvp/ffxiv-pvp-series.webp';
import scCcRank from '@/assets/images/service-cards/ffxiv/pvp/ffxiv-cc-rank.webp';
import scWolfMarks from '@/assets/images/service-cards/ffxiv/pvp/ffxiv-wolf-marks.webp';
import scWingsOfLegacy from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-legacy.webp';
import scApocryphalBahamut from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-apocryphal-bahamut.webp';
import scLanderwaffe from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-landerwaffe.webp';
import scKamuy from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-kamuy.webp';
import scFirebird from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-firebird.webp';
import scKirin from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-kirin.webp';
import scRathalos from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-rathalos.webp';
import scFelyne from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-felyne-support-team-cart.webp';
import scMonowheelS1 from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-monowheel-s1.webp';
import scAirWheelerC9 from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-air-wheeler-c9.webp';
import scLowriderT1rant from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-lowrider-t1rant.webp';
import scDemiPhoinix from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-demi-phoinix.webp';
import scSunforged from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-sunforged.webp';
import scMegaloambystoma from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-megaloambystoma.webp';
import scSkyslipper from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-skyslipper.webp';
import scRamuh from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-ramuh.webp';
import scEdenMount from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-eden.webp';
import scAlteRoite from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-alte-roite.webp';
import scAirForce from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-air-force.webp';
import scModelO from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-model-o.webp';
import scGobwalker from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-gobwalker.webp';
import scArrhidaeus from '@/assets/images/service-cards/ffxiv/mounts/savage-raid-mounts/ffxiv-arrhidaeus.webp';
import scWingsOfRuin from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-ruin.webp';
import scWingsOfResolve from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-resolve.webp';
import scWingsOfEternity from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-eternity.webp';
import scWingsOfKnighthood from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-the-knighthood.webp';
import scWingsOfDeath from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-death.webp';
import scWingsOfMist from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-mist.webp';
import scWingsOfNihility from '@/assets/images/service-cards/ffxiv/mounts/extreme-trial-mounts/ffxiv-wings-of-nihility.webp';
import scPilgrimsTraverse from '@/assets/images/service-cards/ffxiv/deep-dungeons/ffxiv-pilgrims-traverse.webp';
import scHeavenOnHigh from '@/assets/images/service-cards/ffxiv/deep-dungeons/ffxiv-heaven-on-high.webp';
import scEurekaOrthos from '@/assets/images/service-cards/ffxiv/deep-dungeons/ffxiv-eureka-orthos.webp';
import scPalaceOfTheDead from '@/assets/images/service-cards/ffxiv/deep-dungeons/ffxiv-palace-of-the-dead.webp';
import scDdBundle from '@/assets/images/service-cards/ffxiv/deep-dungeons/ffxiv-dd-bundle.webp';
import { SERVICE_PAGES } from '@/data/servicePages';
import type { CatalogConfig } from '@/data/pricing';

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
        name: 'Currency',
        services: [
          {
            id: 'ffxiv-gil-pack',
            name: 'FFXIV Gil',
            tag2: 'Delivered through safest methods',
            longDescription:
              'Gil is the most widely accepted form of in-game currency. The amount of gil you hold is indicated on the currency panel. The gil cap is 999,999,999 for the player and each retainer, while players on a Free Trial are capped at 300,000 gil.',
            price: 0,
            tag1: '5M - 900M Gil',
            tag3: 'Any world, any amount',
            image: scGil,
            tag: 'Popular',
          },
        ],
        // Proxy cards from other categories (same shared-id dedupe as Current
        // Patch: shown here, never duplicated or counted in All Services)
        proxies: ['ffxiv-wolf-marks'],
      },
      {
        id: 'current-patch',
        name: 'Current Patch',
        services: [],
        // Proxy cards from other categories, shown here as duplicates — they
        // share the original service's id, so serviceCount dedupes them and
        // they never inflate the totals. Both the name and the proxy list are
        // overridden by the category entry in public/db/ffxiv-Catalog.json.
        proxies: ['ffxiv-dmu', 'ffxiv-arcadion-savage', 'ffxiv-wings-of-legacy', 'ffxiv-wings-of-nihility', 'ffxiv-lowrider-t1rant'],
      },
      {
        id: 'ultimate-raids',
        name: 'Ultimate Raids',
        services: [
          {
            id: 'ffxiv-dmu',
            name: 'Dancing Mad (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Palazzo Diamond Weapon',
            tag3: 'Piloted Service',
            longDescription:
              "You find the wandering minstrel ruminating on the curious tale of a phantasmal harlequin. A vile and terrible fiend by any measure, yet the entertainer believes the two of them share at least one artistic quality─a flair for creative flourishes. With every telling of their stories, every rendition of their songs, there is new meaning to be found. Thus are no two performances ever the same. The minstrel's melody soon transports you to a battlefield in your mind's eye, but what creative liberties will you contribute to his masterpiece?",
            image: scDmu,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-fru',
            name: 'The Futures Rewritten (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultimate Edenmorn Weapon',
            tag3: 'Piloted Service',
            longDescription:
              'Drawing upon his ever-fertile imagination, the wandering minstrel weaves his own interpretation of events surrounding the Flood of Light, the calamity that engulfed nigh the entirety of the First.',
            image: scFru,
          },
          {
            id: 'ffxiv-top',
            name: 'The Omega Protocol (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultimate Omega Weapon',
            tag3: 'Piloted Service',
            longDescription:
              "What if Omega's relentless testing had continued, and provided the elusive answer it sought? The minstrel's words invite you to imagine this scenario─to entertain the possibility of that which may have been─and follow the experiment to its ultimate conclusion.",
            image: scTop,
          },
          {
            id: 'ffxiv-dsr',
            name: 'Dragonsong’s Reprise (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultimate Heaven Weapon',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              '“There are no ifs in history, yet man is wont to cast his mind towards the path not walked.” Thus spoke the wandering minstrel, and at his urging, you reflect upon bygone trials with newfound perspective. Your imagination stirred by the man\'s masterfully woven verse, you dream of an alternate conclusion to the Dragonsong War─one in which a dear comrade is spared his tragic fate...',
            image: scDsr,
          },
          {
            id: 'ffxiv-tea',
            name: 'The Epic of Alexander (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultimate Alexander Weapon',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The clockwork fortress that manifested itself in the far reaches of snow-swept Dravania did bear an uncanny resemblance to the great steel giant sung of in the legends of the Hotgo, an Auri tribe hailing from far across the sea.',
            image: scTea,
          },
          {
            id: 'ffxiv-ucob',
            name: 'The Unending Coil of Bahamut (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultima Weapon',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'There once were brave souls who uncovered the truth of the Seventh Umbral Calamity. Such trials as they overcame were not to be recorded in history, but far from fading with the passage of time, they have been imagined in vivid detail by the wandering minstrel.',
            image: scUcob,
          },
          {
            id: 'ffxiv-uwu',
            name: 'The Weapon’s Refrain (Ultimate)',
            tag2: 'Adventurer Plate + Title',
            price: 0,
            tag1: 'Ultimate Dreadwyrm Weapon',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Just as warriors temper their spirits in battle, so too does the wandering minstrel hone his craft through colorful retellings of heroic deeds. His rendition of your triumph over the Ultima Weapon takes the threads of history and weaves them into an epic tapestry.',
            image: scUwu,
          },
          {
            id: 'ffxiv-ultimate-bundle',
            name: 'The Ultimate Bundle',
            tag2: 'Adventurer Plates + Titles',
            price: 0,
            tag1: 'Ultimate Weapons',
            tag3: 'Piloted or AFK Carry*',
            longDescription:
              "All of Final Fantasy XIV's hardest ultimates combined into one bundle whether its 6 Piloted ones or 4 AFK ones done at your convenience.",
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
            id: 'ffxiv-arcadion-savage',
            name: 'Arcadion Raids (Savage)',
            tag2: 'Full loot priority',
            price: 0,
            tag1: 'Savage ilvl 790/795 gear',
            tag3: 'Piloted or AFK Carry*',
            longDescription:
              'Fighters from across the star step into the Arcadion’s ring, where glory is won before a roaring crowd. From the Light-heavyweight ladder to the Heavyweight throne, only the unbroken earn the right to call themselves Grand Champion. Will you answer the call?',
            image: scArcadion,
            tag: 'Popular',
          },
          {
            id: 'ffxiv-pandaemonium-savage',
            name: 'Pandaemonium Raids (Savage)',
            tag2: 'Full loot priority',
            longDescription:
              'Far beneath the ground upon which mortals tread, steeped in darkness deep as starless night, ancient power lies dormant. Too hungry, too brutal, too monstrous─what cannot be controlled must be contained, here, in Pandæmonium. Dare you make the descent?',
            price: 0,
            tag1: 'Savage Endwalker glamour',
            tag3: 'Piloted or AFK Carry',
            image: scPandaemonium,
          },
          {
            id: 'ffxiv-eden-savage',
            name: 'Eden Raids (Savage)',
            tag2: 'Full loot priority',
            price: 0,
            tag1: 'Savage Shadowbringers glamour',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'In the light-swallowed emptiness of the First, the memories of primals past take shape once more. To restore the flow of the elements, you must face Eden’s recreations one by one — and the promise that waits at the journey’s end.',
            image: scEden,
          },
          {
            id: 'ffxiv-omega-savage',
            name: 'Omega Raids (Savage)',
            tag2: 'Full loot priority',
            price: 0,
            tag1: 'Savage Stormblood glamour',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Deep within the rift between worlds, the ancient machine Omega conducts its merciless experiments, pitting warriors against recreated foes from across the realms. Endure its trials and prove yourself the strongest subject of all.',
            image: scOmega,
          },
          {
            id: 'ffxiv-alexander-savage',
            name: 'Alexander Raids (Savage)',
            tag2: 'Full loot priority',
            price: 0,
            tag1: 'Savage Heavensward glamour',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'In the Dravanian hinterlands rises Alexander, a colossal primal of steel and steam summoned by the Illuminati. Within its iron frame, the goblins’ mad designs churn on — dare you shut the machine god down from the inside?',
            image: scAlexander,
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
            tag2: '48-man savage raid clear',
            price: 0,
            tag1: 'Cerberus mount chance & title',
            image: scBlank,
          },
          {
            id: 'ffxiv-baldesion-arsenal',
            name: 'The Baldesion Arsenal',
            tag2: 'Full BA clear with a veteran group',
            price: 0,
            tag1: 'Demi-Ozma mount chance',
            image: scBlank,
          },
          {
            id: 'ffxiv-forked-tower-blood',
            name: 'The Forked Tower: Blood',
            tag2: 'Occult Crescent raid clear',
            price: 0,
            tag1: 'All loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-forked-tower-magic',
            name: 'The Forked Tower: Magic',
            tag2: 'Occult Crescent raid clear',
            price: 0,
            tag1: 'All loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-jeuno-first-walk',
            name: 'Jeuno: The First Walk',
            tag2: 'Quick 7.1 Alliance Raid run',
            price: 0,
            tag1: 'Chance at 720 ilvl gear & Nano Lord minion',
            image: scBlank,
          },
          {
            id: 'ffxiv-san-doria-second-walk',
            name: "San d'Oria: The Second Walk",
            tag2: 'Quick 7.3 raid clear',
            price: 0,
            tag1: 'Guaranteed Gear Upgrade Token',
            image: scBlank,
          },
          {
            id: 'ffxiv-windurst-third-walk',
            name: 'Windurst: The Third Walk',
            tag2: "Echoes of Vana'diel alliance raid clear",
            price: 0,
            tag1: 'Guaranteed Gear Upgrade Token',
            image: scBlank,
          },
        ],
      },
      {
        id: 'trials',
        name: 'Extreme Trials',
        services: [
          {
            id: 'ffxiv-the-unmaking',
            name: 'The Unmaking (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Enuo, the undoing of all things — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
            tag: 'New',
          },

          {
            id: 'ffxiv-hell-on-rails',
            name: 'Hell on Rails (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'The Doomtrain, harbinger of souls — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
            tag: 'Hot',
          },

          {
            id: 'ffxiv-windward-wilds',
            name: 'The Windward Wilds (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Arkveld, the White Wraith from the forbidden lands — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-necrons-embrace',
            name: "The Minstrel's Ballad: Necron's Embrace",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Necron, the embodiment of death itself — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-recollection',
            name: 'Recollection (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'A treasured memory given terrible form — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-sphenes-burden',
            name: "The Minstrel's Ballad: Sphene's Burden",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Queen Sphene, eternal sovereign of Alexandria — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-everkeep',
            name: 'Everkeep (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Zoraal Ja, the Resilient King — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-worqor-lar-dor',
            name: 'Worqor Lar Dor (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Valigarmanda, the Skyruin — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-abyssal-fracture',
            name: 'The Abyssal Fracture (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Zeromus, the Void\'s greatest scourge — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-voidcast-dais',
            name: 'The Voidcast Dais (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Golbez, knight of the Thirteenth — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-mount-ordeals',
            name: 'Mount Ordeals (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Rubicante, Archfiend of Fire — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-storms-crown',
            name: "Storm's Crown (Extreme)",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Barbariccia, Empress of the winds — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-endsingers-aria',
            name: "The Minstrel's Ballad: Endsinger's Aria",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'The Endsinger, herald of the Final Days — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-hydaelyns-call',
            name: "The Minstrel's Ballad: Hydaelyn's Call",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Hydaelyn, the will of the star — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-zodiarks-fall',
            name: "The Minstrel's Ballad: Zodiark's Fall",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Zodiark, the eldest of the primals — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-memoria-misera',
            name: 'Memoria Misera (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Varis yae Galvus, relived through memory — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-seat-of-sacrifice',
            name: 'The Seat of Sacrifice (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Elidibus, bearing the face of the first Warrior of Light — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-hadess-elegy',
            name: "The Minstrel's Ballad: Hades's Elegy",
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Hades, the architect of the Ascian design — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-cloud-deck',
            name: 'The Cloud Deck (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'The Diamond Weapon, apex of the Weapon project — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-castrum-marinum',
            name: 'Castrum Marinum (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'The Emerald Weapon, master of thermal suppression — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-cinder-drift',
            name: 'Cinder Drift (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'The Ruby Weapon, resurrected warmachina — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-crown-of-the-immaculate',
            name: 'Crown of the Immaculate (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Innocence, the self-styled god of light — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-dancing-plague',
            name: 'Dancing Plague (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Titania, the faerie king of Il Mheg — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-hells-kier',
            name: "Hells' Kier (Extreme)",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Suzaku, the scarlet phoenix of the Four Lords — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-great-hunt',
            name: 'The Great Hunt (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Rathalos, the King of the Skies from another world — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-tsukuyomis-pain',
            name: "The Minstrel's Ballad: Tsukuyomi's Pain",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Tsukuyomi, the moonlit goddess — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-jade-stoa',
            name: 'The Jade Stoa (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Byakko, the white tiger of the Four Lords — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-shinryus-domain',
            name: "The Minstrel's Ballad: Shinryu's Domain",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Shinryu, the Dragon King — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-emanation',
            name: 'Emanation (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Lakshmi, the Lady of Bliss — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-pool-of-tribute',
            name: 'The Pool of Tribute (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Susano, the Lord of the Revel — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-containment-bay-z1t9',
            name: 'Containment Bay Z1T9 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Zurvan, the Demon of the Warring Triad — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-containment-bay-p1t6',
            name: 'Containment Bay P1T6 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Sophia, the Goddess of the Warring Triad — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-nidhoggs-rage',
            name: "The Minstrel's Ballad: Nidhogg's Rage",
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Nidhogg, the wyrmking of the Dragonsong War — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-containment-bay-s1t7',
            name: 'Containment Bay S1T7 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Sephirot, the Fiend of the Warring Triad — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-thordans-reign',
            name: "The Minstrel's Ballad: Thordan's Reign",
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'King Thordan and the Knights of the Round — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-thok-ast-thok',
            name: 'Thok ast Thok (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Ravana, the blood-maddened god of the Gnath — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },

          {
            id: 'ffxiv-limitless-blue',
            name: 'The Limitless Blue (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            longDescription:
              'Bismarck, the white whale of the Sea of Clouds — our raiders clear it on Extreme for you, Piloted or AFK.',
            image: scBlank,
          },
        ],
      },
      {
        id: 'deep-dungeon',
        name: 'Deep Dungeons',
        services: [
          {
            id: 'ffxiv-potd-solo',
            name: 'Palace of the Dead (Deep Dungeon)',
            tag2: 'Necromancer title & achievements',
            price: 0,
            tag1: '1 - 200 Floors',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'In the subterranean city of Gelmorra, deep within a forgotten corner of Issom-Har, stout-hearted explorers have uncovered the entrance to a labyrinthine dungeon. Those who set foot inside its maddening halls find their vigor drained by an irresistible fog of innervation, and repeated excursions have failed to map its seemingly inconstant architecture.',
            image: scPalaceOfTheDead,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven-on-High (Deep Dungeon)',
            tag2: 'Lone Hero title & achievements',
            price: 0,
            tag1: '1 - 100 Floors',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Rising high above the Ruby Sea from the island of Onokoro, Heaven-on-High is said to be the stairway traversed by kami descending from their empyrean home. Following the discovery of a secret entrance, the Confederate leader Rasho asks you to investigate the tower and brave the hordes of vile fiends that lurk within.',
            image: scHeavenOnHigh,
          },
          {
            id: 'ffxiv-orthos',
            name: 'Eureka Orthos (Deep Dungeon)',
            tag2: 'Once and Future King/Queen title',
            price: 0,
            tag1: '1 - 100 Floors',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Beneath the Crystal Tower in Mor Dhona, the Allagan Empire’s deepest secrets slumber. Eureka Orthos descends into a research facility abandoned for millennia — a hundred floors of Allagan horrors waiting beneath the syndicate’s watchful eye.',
            image: scEurekaOrthos,
          },
          {
            id: 'ffxiv-pilgrims-traverse',
            name: 'Pilgrim\'s Traverse (Deep Dungeon)',
            tag2: 'The Enlightened title & loot',
            price: 0,
            tag1: '1 - 100 Floors',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Beneath the verdant hills of Il Mheg, a holy road winds down into the dark. Pilgrim’s Traverse calls the faithful and the foolhardy alike to walk its ninety-nine floors, gathering offerings for the verse that waits at journey’s end.',
            image: scPilgrimsTraverse,
          },
          {
            id: 'ffxiv-deep-dungeon-bundle',
            name: 'Deep Dungeons Bundle',
            tag2: 'Every solo title & all loot',
            price: 0,
            tag1: '500 Floors — all four dungeons',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Palace of the Dead to Pilgrim’s Traverse, this bundle contains all of FFXIV’s current deep dungeons — every floor, every title and every achievement in one package.',
            image: scDdBundle,
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
            tag2: 'All 12 routes available',
            price: 0,
            tag1: 'Fresh cosmetic rewards',
            image: scBlank,
          },
          {
            id: 'ffxiv-variant-mount-rokkon',
            name: 'Variant: Mount Rokkon',
            tag2: 'All 12 routes available',
            price: 0,
            tag1: 'Rewards & glamour sets',
            image: scBlank,
          },
          {
            id: 'ffxiv-variant-aloalo-island',
            name: 'Variant: Aloalo Island',
            tag2: 'All 12 routes available',
            price: 0,
            tag1: 'Chance for a special mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-criterion-glamour-set',
            name: 'Glamour Set from 1 Criterion',
            tag2: 'Full glamour set from any Criterion dungeon',
            price: 0,
            tag1: 'All paths cleared',
            image: scBlank,
          },
          {
            id: 'ffxiv-criterion-mount-all-paths',
            name: 'Mount from 1 Criterion [All Paths]',
            tag2: 'Guaranteed mount from any Criterion dungeon',
            price: 0,
            tag1: 'All paths cleared',
            image: scBlank,
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-another-sildihn-subterrane',
            name: "Another Sil'dihn Subterrane",
            tag2: 'Criterion clear with all loot',
            price: 0,
            tag1: "Infamy of Sil'dih title",
            image: scBlank,
          },
          {
            id: 'ffxiv-another-mount-rokkon',
            name: 'Another Mount Rokkon',
            tag2: 'Criterion clear with all loot',
            price: 0,
            tag1: 'Chance at Shishioji mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-aloalo-island',
            name: 'Another Aloalo Island',
            tag2: 'Criterion clear with all loot',
            price: 0,
            tag1: 'Mount and title',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-sildihn-savage',
            name: "Another Sil'dihn Subterrane (Savage)",
            tag2: 'Savage Criterion clear',
            price: 0,
            tag1: 'Exclusive rewards & title',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-another-rokkon-savage',
            name: 'Another Mount Rokkon (Savage)',
            tag2: 'Savage Criterion clear',
            price: 0,
            tag1: 'Exclusive rewards & title',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-aloalo-savage',
            name: 'Another Aloalo Island (Savage)',
            tag2: 'Savage Criterion clear',
            price: 0,
            tag1: 'Exclusive rewards & title',
            image: scBlank,
          },
        ],
      },
      {
        id: 'mounts',
        name: 'Mounts',
        services: [
          {
            id: 'ffxiv-wings-of-legacy',
            name: 'Wings of Legacy (Mount)',
            tag2: 'Dawntrail Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Collect every Dawntrail wing in one package — from Worqor Lar Dor to The Unmaking — and unlock the Wings of Legacy quest mount on top of all seven Extreme Trial wings.',
            image: scWingsOfLegacy,
            tag: 'Best Value',
          },

          {
            id: 'ffxiv-wings-of-nihility',
            name: 'Wings of Nihility (Mount)',
            tag2: 'The Unmaking (Extreme)',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The newest Dawntrail wings, dropped by The Unmaking on Extreme — a guaranteed farm until the Wings of Nihility are yours, Totems of Naught included.',
            image: scWingsOfNihility,
            tag: 'Hot',
          },

          {
            id: 'ffxiv-wings-of-mist',
            name: 'Wings of Mist (Mount)',
            tag2: 'Hell on Rails (Extreme)',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'All aboard the Doomtrain: Hell on Rails on Extreme drops the Wings of Mist — we run it until the mount is guaranteed, with Runaway Totems to spare.',
            image: scWingsOfMist,
            tag: 'Hot',
          },

          {
            id: 'ffxiv-wings-of-death',
            name: 'Wings of Death (Mount)',
            tag2: "Necron's Embrace mount",
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Face the Minstrel’s Ballad: Necron’s Embrace on Extreme and take the Wings of Death — guaranteed, however many clears it takes.',
            image: scWingsOfDeath,
          },

          {
            id: 'ffxiv-wings-of-knighthood',
            name: 'Wings of the Knighthood (Mount)',
            tag2: 'Recollection (Extreme)',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Recollection on Extreme guards the Wings of the Knighthood — a guaranteed farm until they drop, with Knight Totems piling up along the way.',
            image: scWingsOfKnighthood,
          },

          {
            id: 'ffxiv-wings-of-eternity',
            name: 'Wings of Eternity (Mount)',
            tag2: "Sphene's Burden mount",
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The Minstrel’s Ballad: Sphene’s Burden holds the Wings of Eternity — our raiders run it on Extreme until the mount is guaranteed on your account.',
            image: scWingsOfEternity,
          },

          {
            id: 'ffxiv-wings-of-resolve',
            name: 'Wings of Resolve (Mount)',
            tag2: 'Everkeep (Extreme)',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Zoraal Ja’s wings from Everkeep on Extreme. Guaranteed farm until the Wings of Resolve drop — or until enough Resilient Totems stack to claim them outright.',
            image: scWingsOfResolve,
          },

          {
            id: 'ffxiv-wings-of-ruin',
            name: 'Wings of Ruin (Mount)',
            tag2: 'Worqor Lar Dor (Extreme)',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Valigarmanda’s wings, dropped by Worqor Lar Dor on Extreme. We farm the trial until the Wings of Ruin are yours — guaranteed, no matter how many runs it takes.',
            image: scWingsOfRuin,
          },

          {
            id: 'ffxiv-apocryphal-bahamut',
            name: 'Apocryphal Bahamut (Mount)',
            tag2: 'Endwalker Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The Wings of Hope quest mount, earned only after collecting all seven Endwalker Lynxes — our raiders farm every trial from Zodiark’s Fall to the Abyssal Fracture until the set is complete.',
            image: scApocryphalBahamut,
          },

          {
            id: 'ffxiv-landerwaffe',
            name: 'Landerwaffe (Mount)',
            tag2: 'Shadowbringers Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Shadowbringers’ ultimate collector’s prize: Landerwaffe unlocks once all seven Gwibers are yours — we clear every Extreme from the Dancing Plague to the Cloud Deck until they are.',
            image: scLanderwaffe,
          },

          {
            id: 'ffxiv-kamuy-nine-tails',
            name: 'Kamuy of the Nine Tails (Mount)',
            tag2: 'Stormblood Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Complete the full Stormblood Kamuy set — from the Pool of Tribute to the Wreath of Snakes — and claim the Fabled Kamuy Fife for the majestic Kamuy of the Nine Tails.',
            image: scKamuy,
          },

          {
            id: 'ffxiv-firebird-mount',
            name: 'Firebird (Mount)',
            tag2: 'Heavensward Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Every Heavensward Lanner in one package — White, Rose, Round, Warring, Dark, Sophic and Demonic — with the Firebird waiting at the end of the collection.',
            image: scFirebird,
          },

          {
            id: 'ffxiv-kirin-mount',
            name: 'Kirin (Mount)',
            tag2: 'A Realm Reborn Extreme Trials',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The original collector’s mount: gather Aithon, Xanthos, Gullfaxi, Markab, Boreas and Enbarr from the A Realm Reborn Extremes and answer the call of A Legend for a Legend.',
            image: scKirin,
          },

          {
            id: 'ffxiv-monowheel-s1',
            name: 'Monowheel S1 (Mount)',
            tag2: 'AAC Light-heavyweight M4 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Wicked Thunder’s single-wheeled speed machine from AAC Light-heavyweight M4 on Savage — farmed until the Monowheel S1 is guaranteed yours.',
            image: scMonowheelS1,
          },
          {
            id: 'ffxiv-air-wheeler-c9',
            name: 'Air-wheeler C9 (Mount)',
            tag2: 'AAC Cruiserweight M4 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The Howling Blade’s air-wheeler from AAC Cruiserweight M4 on Savage — a guaranteed farm until the identification key drops.',
            image: scAirWheelerC9,
          },
          {
            id: 'ffxiv-lowrider-t1rant',
            name: 'Lowrider T1RANT (Mount)',
            tag2: 'AAC Heavyweight M4 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Lindwurm’s muscle-car lowrider from AAC Heavyweight M4 on Savage, complete with a feline passenger — guaranteed, no matter the runs.',
            image: scLowriderT1rant,
          },
          {
            id: 'ffxiv-demi-phoinix',
            name: 'Demi-Phoinix (Mount)',
            tag2: 'Asphodelos: The Fourth Circle (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'A miniature phoenix born of Asphodelos: The Fourth Circle on Savage — we run P4S until the Demi-Phoinix is yours.',
            image: scDemiPhoinix,
          },
          {
            id: 'ffxiv-sunforged',
            name: 'Sunforged (Mount)',
            tag2: 'Abyssos: The Eighth Circle (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Forged in the fires of Abyssos: The Eighth Circle — a guaranteed Savage farm until the Sunforged mount drops.',
            image: scSunforged,
          },
          {
            id: 'ffxiv-megaloambystoma',
            name: 'Megaloambystoma (Mount)',
            tag2: 'Anabaseios: The Twelfth Circle (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Anabaseios: The Twelfth Circle’s rarest prize — guaranteed clears until the Megaloambystoma is on your account.',
            image: scMegaloambystoma,
          },
          {
            id: 'ffxiv-skyslipper',
            name: 'Skyslipper (Mount)',
            tag2: 'Eden’s Gate: Sepulture (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Eden’s Gate: Sepulture on Savage drops the Skyslipper — guaranteed, with a veteran party clearing on demand.',
            image: scSkyslipper,
          },
          {
            id: 'ffxiv-ramuh',
            name: 'Ramuh (Mount)',
            tag2: 'Eden’s Verse: Refulgence (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Eden’s Verse: Refulgence on Savage — we farm until the Ramuh mount is guaranteed yours.',
            image: scRamuh,
          },
          {
            id: 'ffxiv-eden-mount',
            name: 'Eden (Mount)',
            tag2: 'Eden’s Promise: Eternity (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Eden’s Promise: Eternity on Savage rewards the Eden mount itself — guaranteed, no matter the runs.',
            image: scEdenMount,
          },
          {
            id: 'ffxiv-alte-roite',
            name: 'Alte Roite (Mount)',
            tag2: 'Deltascape V4.0 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'A Stormblood classic from Deltascape V4.0 on Savage — Alte Roite, guaranteed with veteran unsynced clears.',
            image: scAlteRoite,
          },
          {
            id: 'ffxiv-air-force',
            name: 'Air Force (Mount)',
            tag2: 'Sigmascape V4.0 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Sigmascape V4.0 on Savage drops the Air Force mount — a guaranteed farm until it is yours.',
            image: scAirForce,
          },
          {
            id: 'ffxiv-model-o',
            name: 'Model O (Mount)',
            tag2: 'Alphascape V4.0 (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Alphascape V4.0 on Savage — Omega itself, in mount form. Guaranteed, no matter how many runs.',
            image: scModelO,
          },
          {
            id: 'ffxiv-gobwalker',
            name: 'Gobwalker (Mount)',
            tag2: 'Alexander - The Burden of the Father (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'Alexander: The Burden of the Father on Savage drops the Gobwalker — a guaranteed unsynced farm.',
            image: scGobwalker,
          },
          {
            id: 'ffxiv-arrhidaeus',
            name: 'Arrhidaeus (Mount)',
            tag2: 'Alexander - The Soul of the Creator (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The Soul of the Creator on Savage — we clear A12S until the Arrhidaeus mount is guaranteed yours.',
            image: scArrhidaeus,
          },
          {
            id: 'ffxiv-rathalos-mount',
            name: 'Rathalos (Mount)',
            tag2: 'The Great Hunt (Extreme)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The King of the Skies descends upon Eorzea — the Monster Hunter crossover mount, dropped by Rathalos in The Great Hunt on Extreme. Guaranteed with 50 Rathalos Scales+ or a lucky drop.',
            image: scRathalos,
          },
          {
            id: 'ffxiv-felyne-cart',
            name: 'Felyne Support Team Cart (Mount)',
            tag2: 'The Windward Wilds (Extreme)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The Felyne Support Team rolls in from the forbidden lands — the Monster Hunter Wilds crossover cart, dropped by Arkveld in The Windward Wilds on Extreme. Guaranteed, no matter the runs.',
            image: scFelyne,
          },
          {
            id: 'ffxiv-cerberus-mount',
            name: 'Cerberus (Mount)',
            tag2: 'Delubrum Reginae (Savage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'The three-headed hound of Delubrum Reginae (Savage) — guaranteed via the Savage Queen of Swords achievement on completion.',
            image: scBlank,
          },
          {
            id: 'ffxiv-demi-ozma',
            name: 'Demi-Ozma (Mount)',
            tag2: 'The Baldesion Arsenal',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'A fragment of Ozma itself from the depths of The Baldesion Arsenal — guaranteed completion with a veteran group.',
            image: scBlank,
          },
          {
            id: 'ffxiv-demon-haul',
            name: 'Demon Haul (Mount)',
            tag2: 'The Forked Tower: Blood',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              'A demonic palanquin earned in The Forked Tower: Blood — hauled by demons, guaranteed for your collection.',
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
            tag2: 'Allied rank with every tribe — mounts, minions and questlines unlocked.',
            price: 0,
            tag1: '1–2 weeks',
            image: scBlank,
          },
        ],
      },
      {
        id: 'leveling',
        name: 'Leveling',
        services: [
          {
            id: 'ffxiv-leveling-boost',
            name: 'Job Leveling Boost',
            tag2: 'Job quests included',
            price: 0,
            tag1: 'Save time and effort',
            tag3: 'Any job, any level',
            longDescription:
              'Skip the grind and level your chosen job quickly and efficiently. Our Job Leveling boost helps you reach your target level while saving time, letting you focus on endgame content, raiding, or gearing without the repetitive leveling process.',
            image: scLeveling,
            tag: 'Popular',
          },
          {
            id: 'ffxiv-blu-leveling-boost',
            name: 'Blue Mage Leveling Boost',
            tag2: 'All spells unlock (optional)',
            price: 0,
            tag1: 'Save time and effort',
            tag3: 'Any level up to 80',
            longDescription:
              'Blue Mage learns by watching — a limited job that copies the spells of friends and foes alike. Our Blue Mage Leveling boost powers your Blue Mage all the way to 80, with the option to fill your spellbook with every spell the job can learn.',
            image: scBlu,
          },
          {
            id: 'ffxiv-msq-skip',
            name: 'MSQ Completion Boost',
            tag2: 'Job quests included',
            price: 0,
            tag1: 'Save time and effort',
            tag3: 'Any Expansion or Patches',
            longDescription:
              'The main scenario is the heart of Eorzea’s story — but not everyone has the time to live through every chapter. Our MSQ Completion boost carries your character through the Main Scenario up to your chosen expansion, unlocking duties, trials and endgame content along the way.',
            image: scMsq,
          },
        ],
      },
      {
        id: 'field-explorations',
        name: 'Field Explorations & Misc',
        services: [
          {
            id: 'ffxiv-resistance-rank',
            name: 'Resistance Rank 1–25',
            tag2: 'Bozja & Zadnor field operations',
            price: 0,
            tag1: '1–2 weeks',
            longDescription:
              'The Bozjan southern front and the fields of Zadnor await. We grind your Resistance Rank from 1 to 25 through skirmishes, critical engagements and duels, unlocking every story beat and field note along the way.',
            image: scBlank,
          },
          {
            id: 'ffxiv-eureka-leveling',
            name: 'Eureka Level 1–60',
            tag2: 'Anemos to Hydatos — the full elemental climb',
            price: 0,
            tag1: '1–2 weeks',
            longDescription:
              'The Forbidden Land of Eureka swallows the unprepared. Our runners carry you from elemental level 1 to 60 through Anemos, Pagos, Pyros and Hydatos, with every logogram and kettle filled en route.',
            image: scBlank,
          },
          {
            id: 'ffxiv-occult-phantom-level',
            name: 'Phantom Job Level 1–10',
            tag2: 'Occult Crescent phantom job mastery',
            price: 0,
            tag1: '2–3 days',
            longDescription:
              'Phantom jobs define the Occult Crescent meta. We level any phantom job from 1 to 10, unlocking its full mastery set so you walk into every encounter with the strongest kit available.',
            image: scBlank,
          },
          {
            id: 'ffxiv-occult-job-unlocks',
            name: 'Occult Job Unlocks',
            tag2: 'Any phantom job unlocked on demand',
            price: 0,
            tag1: '24 hours',
            longDescription:
              'Unlock any Occult Crescent phantom job — Freeloader, Time Mage, Cannoneer, Berserker, Astrologian and more — without the questline grind. Pick exactly the jobs you need.',
            image: scBlank,
          },
            {
            id: 'ffxiv-island-sanctuary',
            name: 'Island Sanctuary Rank 1–20',
            tag2: 'Sanctuary rank 20, all landmarks, rare animals and workshop automation.',
            price: 0,
            tag1: '1 week',
            image: scBlank,
          },
        ],
      },
      {
        id: 'pvp',
        name: 'PvP',
        services: [
          {
            id: 'ffxiv-cc-rank-boost',
            name: 'Crystalline Conflict Rank Boost',
            tag2: 'Adventurer Plate & PvP Currency',
            price: 0,
            tag1: 'Bronze to Ultima (or Rank 1)',
            tag3: 'Piloted Service',
            longDescription:
              'PvP Ranked Boost ranging from Bronze to Crystal — grab a boost to your desired rank and acquire Adventurer Plate designs and more. Each PvP season resets with a major patch, and your end-of-season rank determines the loot you get.',
            image: scCcRank,
          },
          {
            id: 'ffxiv-pvp-series-boost',
            name: 'Series Malmstones Boost (PvP)',
            tag2: 'Mounts, glamour & minions',
            price: 0,
            tag1: 'Up to Series level 30',
            tag3: 'Piloted Service',
            longDescription:
              'The Series Malmstones system provides unique rewards to players who participate in PvP during a given series. Leveling up lets you acquire Trophy Crystals, Minions, Mounts and Sets of Glamour!',
            image: scPvpSeries,
          },
          {
            id: 'ffxiv-wolf-marks',
            name: 'Wolf Marks (PvP)',
            tag2: 'Emotes, hairstyles & PvP gear',
            price: 0,
            tag1: 'Crystalline Conflict farm',
            tag3: 'Piloted Service',
            longDescription:
              "Wolf Marks are the PvP currency earned in Crystalline Conflict, Frontline, and Rival Wings. Players earn Wolf Marks by participating in matches, with additional marks for winning. They can be exchanged for PvP gear and other exclusive items such as emotes and hairstyles at the Mark Quartermaster in the Wolves' Den Pier.",
            image: scWolfMarks,
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
            tag2: 'Learn your job and mechanics from a world-class raider.',
            price: 0,
            tag1: '1-on-1 · 2 hours',
            image: scBlank,
          },
          {
            id: 'ffxiv-pvp-coaching',
            name: 'PvP Coaching Session',
            tag2: 'Crystalline Conflict VOD review and live coaching.',
            price: 0,
            tag1: '1-on-1 · 2 hours',
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

/** Flat index of every service, used by the navbar search. */
export const allServices: ServiceSearchResult[] = [];

function rebuildSearchIndex() {
  allServices.length = 0;
  allServices.push(
    ...games.flatMap((game) =>
      game.subcategories
        .filter((sub) => sub.id !== 'all')
        .flatMap((sub) =>
          sub.services.map((service) => ({ game, subId: sub.id, subName: sub.name, service })),
        ),
    ),
  );
}
rebuildSearchIndex();

/**
 * Apply the database `catalog` block (ffxiv-Catalog.json) to the static
 * catalog before first render (called from PricingProvider once the DB loads
 * — rendering is held until then, so every consumer sees the DB-driven
 * state):
 * - `categories`: display order (array order; 'all' stays first, unlisted
 *   categories keep their relative order), display-name overrides, and proxy
 *   card lists (e.g. Current Patch, Currency).
 * - `services`: ids mapped to 0 are removed from every category, proxy list,
 *   'All services', and the search index (direct subpage URLs stop
 *   resolving). Unlisted ids stay enabled.
 */
export function applyCatalog(catalog?: CatalogConfig): void {
  if (!catalog) return;
  const byId = new Map((catalog.categories ?? []).map((c) => [c.id, c]));
  const rank = new Map((catalog.categories ?? []).map((c, i) => [c.id, i]));
  const disabled = new Set(
    Object.entries(catalog.services ?? {})
      .filter(([, v]) => v === 0)
      .map(([id]) => id),
  );
  for (const game of games) {
    if (byId.size) {
      for (const sub of game.subcategories) {
        const c = byId.get(sub.id);
        if (!c) continue;
        if (c.name) sub.name = c.name;
        if (c.proxies) sub.proxies = c.proxies;
      }
      const rest = game.subcategories.filter((s) => s.id !== 'all');
      rest.sort((a, b) => (rank.get(a.id) ?? byId.size) - (rank.get(b.id) ?? byId.size));
      const all = game.subcategories.find((s) => s.id === 'all');
      game.subcategories = all ? [all, ...rest] : rest;
    }
    if (disabled.size) {
      for (const sub of game.subcategories) {
        if (sub.id === 'all') continue;
        sub.services = sub.services.filter((sv) => !disabled.has(sv.id));
        if (sub.proxies) sub.proxies = sub.proxies.filter((id) => !disabled.has(id));
      }
      // Rebuild 'All services' from the remaining entries (dedup by id)
      const all = game.subcategories.find((s) => s.id === 'all');
      if (all) {
        all.services = [
          ...new Map(
            game.subcategories
              .filter((s) => s.id !== 'all')
              .flatMap((s) => s.services)
              .map((sv) => [sv.id, sv]),
          ).values(),
        ];
      }
    }
  }
  if (disabled.size) rebuildSearchIndex();
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

/** Where a service card links: its dedicated subpage if it has one, else its category page. */
export const serviceLink = (serviceId: string): string => {
  const hit = allServices.find((s) => s.service.id === serviceId);
  if (!hit) return '/';
  if (SERVICE_PAGES[serviceId]) return `/boosting/${hit.game.id}/${serviceId}`;
  return `/boosting/${hit.game.id}?cat=${hit.subId}`;
};
