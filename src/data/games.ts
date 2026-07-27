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
import scPandaemonium from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-pandaemonium.png';
import scArcadion from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-arcadion.png';
import scEden from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-eden.png';
import scOmega from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-omega.png';
import scAlexander from '@/assets/images/service-cards/ffxiv/savage-raids/ffxiv-alexander.png';
import scLeveling from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-leveling.png';
import scMsq from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-msq.png';
import scBlu from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-blue-mage.png';
import { SERVICE_PAGES } from '@/data/servicePages';

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
      },
      {
        id: 'current-patch',
        name: 'Current Patch',
        services: [],
        // Proxy cards from other categories, shown here as duplicates — they
        // share the original service's id, so serviceCount dedupes them and
        // they never inflate the totals. Both the name and the proxy list are
        // overridden by the `currentPatch` entry in public/db/pricing.json.
        proxies: ['ffxiv-dmu', 'ffxiv-arcadion-savage'],
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
            id: 'ffxiv-limitless-blue',
            name: 'The Limitless Blue (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-thok-ast-thok',
            name: 'Thok ast Thok (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-thordans-reign',
            name: "The Minstrel's Ballad: Thordan's Reign",
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-s1t7',
            name: 'Containment Bay S1T7 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-nidhoggs-rage',
            name: "The Minstrel's Ballad: Nidhogg's Rage",
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-p1t6',
            name: 'Containment Bay P1T6 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-containment-bay-z1t9',
            name: 'Containment Bay Z1T9 (Extreme)',
            tag2: 'Heavensward Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-pool-of-tribute',
            name: 'The Pool of Tribute (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-emanation',
            name: 'Emanation (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-shinryus-domain',
            name: "The Minstrel's Ballad: Shinryu's Domain",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-jade-stoa',
            name: 'The Jade Stoa (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-tsukuyomis-pain',
            name: "The Minstrel's Ballad: Tsukuyomi's Pain",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-great-hunt',
            name: 'The Great Hunt (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hells-kier',
            name: "Hells' Kier (Extreme)",
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-dancing-plague',
            name: 'Dancing Plague (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-crown-of-the-immaculate',
            name: 'Crown of the Immaculate (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-cinder-drift',
            name: 'Cinder Drift (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-castrum-marinum',
            name: 'Castrum Marinum (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-cloud-deck',
            name: 'The Cloud Deck (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hadess-elegy',
            name: "The Minstrel's Ballad: Hades's Elegy",
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-seat-of-sacrifice',
            name: 'The Seat of Sacrifice (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-memoria-misera',
            name: 'Memoria Misera',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-zodiarks-fall',
            name: "The Minstrel's Ballad: Zodiark's Fall",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hydaelyns-call',
            name: "The Minstrel's Ballad: Hydaelyn's Call",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-endsingers-aria',
            name: "The Minstrel's Ballad: Endsinger's Aria",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-storms-crown',
            name: "Storm's Crown (Extreme)",
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-mount-ordeals',
            name: 'Mount Ordeals (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-voidcast-dais',
            name: 'The Voidcast Dais (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-abyssal-fracture',
            name: 'The Abyssal Fracture (Extreme)',
            tag2: 'Endwalker Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-worqor-lar-dor',
            name: 'Worqor Lar Dor (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-everkeep',
            name: 'Everkeep (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-sphenes-burden',
            name: "The Minstrel's Ballad: Sphene's Burden",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-recollection',
            name: 'Recollection (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-necrons-embrace',
            name: "The Minstrel's Ballad: Necron's Embrace",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-windward-wilds',
            name: 'The Windward Wilds (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
          },
          {
            id: 'ffxiv-hell-on-rails',
            name: 'Hell on Rails (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-the-unmaking',
            name: 'The Unmaking (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
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
            tag2: 'The Necromancer title run — solo floor 200 by one of the few who can do it.',
            price: 0,
            tag1: '1–2 weeks',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven on High',
            tag2: 'Floors 1–100 cleared with Empyrean aetherpool progress and the title.',
            price: 0,
            tag1: '2–3 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-orthos',
            name: 'Eureka Orthos',
            tag2: 'Full Orthos clear with the weapon glow and all achievements along the climb.',
            price: 0,
            tag1: '2–4 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-pilgrims-traverse',
            name: 'Pilgrims Traverse',
            tag2: 'Dawntrail deep dungeon cleared with all achievements along the climb.',
            price: 0,
            tag1: '2–4 days',
            image: scBlank,
          },
          {
            id: 'ffxiv-deep-dungeon-bundle',
            name: 'Deep Dungeons Bundle',
            tag2: 'All four deep dungeons cleared at a bundle discount.',
            price: 0,
            tag1: '2–3 weeks',
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
            id: 'ffxiv-wings-of-nihility',
            name: 'Wings of Nihility',
            tag2: 'Patch 7.5 wings without wipes',
            price: 0,
            tag1: '785 ilvl upgrades included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-apocryphal-bahamut',
            name: 'Apocryphal Bahamut',
            tag2: 'Extremely difficult to unlock',
            price: 0,
            tag1: '7 extra Lynx mounts + title',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-ruin',
            name: 'Wings of Ruin',
            tag2: '~5% drop chance skip',
            price: 0,
            tag1: 'Tomestones & Skyruin Totems',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-resolve',
            name: 'Wings of Resolve',
            tag2: 'Extreme trial mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-eternity',
            name: 'Wings of Eternity',
            tag2: 'Extreme trial mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-knighthood',
            name: 'Wings of the Knighthood',
            tag2: '7.2 mount in 5 days',
            price: 0,
            tag1: 'Currency for high ilvl gear',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-death',
            name: 'Wings of Death',
            tag2: 'Extreme trial mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-mist',
            name: 'Wings of Mist',
            tag2: 'Patch 7.4 Extreme trial mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-cerberus-mount',
            name: 'Cerberus',
            tag2: 'Delubrum Reginae (Savage) mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-demi-ozma',
            name: 'Demi-Ozma',
            tag2: 'The Baldesion Arsenal mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-demon-haul',
            name: 'Demon Haul',
            tag2: 'Rare savage mount',
            price: 0,
            tag1: 'Guaranteed farm until drop',
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
          {
            id: 'ffxiv-island-sanctuary',
            name: 'Island Sanctuary Maxing',
            tag2: 'Sanctuary rank 20, all landmarks, rare animals and workshop automation.',
            price: 0,
            tag1: '1 week',
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
        id: 'pvp',
        name: 'PvP',
        services: [
          {
            id: 'ffxiv-cc-rank',
            name: 'Crystalline Conflict',
            tag2: 'Reach the chosen PvP tier',
            price: 0,
            tag1: "PvP glamour & Framer's Kit",
            image: scBlank,
          },
          {
            id: 'ffxiv-series-malmstones',
            name: 'Series Malmstones',
            tag2: 'Up to 30 Series levels',
            price: 0,
            tag1: 'Wanyudo mount at rank 25',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-frontline-wins',
            name: 'Frontline Wins',
            tag2: 'Any desired number of wins',
            price: 0,
            tag1: 'Plenty of Wolf Marks',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-cc-wins',
            name: 'Crystalline Conflict Wins',
            tag2: 'Preferred number of victories',
            price: 0,
            tag1: 'Series Malmstones progress',
            image: scBlank,
          },
          {
            id: 'ffxiv-cc-top-300',
            name: 'Crystalline Conflict Top 300',
            tag2: 'Join the Top 300 PvP players',
            price: 0,
            tag1: "Conflict Framer's Kits & crystals",
            image: scBlank,
          },
          {
            id: 'ffxiv-wolfs-mark-farm',
            name: "Wolf's Mark Farm",
            tag2: 'Any amount of Wolf Marks',
            price: 0,
            tag1: 'Glamour, mounts & emotes in reach',
            image: scBlank,
          },
          {
            id: 'ffxiv-pvp-gear',
            name: 'PvP Gear',
            tag2: 'Rare PvP armor for any job',
            price: 0,
            tag1: 'Top gear from 3 expansions',
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

/** Where a service card links: its dedicated subpage if it has one, else its category page. */
export const serviceLink = (serviceId: string): string => {
  const hit = allServices.find((s) => s.service.id === serviceId);
  if (!hit) return '/';
  if (SERVICE_PAGES[serviceId]) return `/boosting/${hit.game.id}/${serviceId}`;
  return `/boosting/${hit.game.id}?cat=${hit.subId}`;
};
