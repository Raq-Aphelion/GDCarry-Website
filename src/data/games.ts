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
import scBlank from '@/assets/images/service-cards/ffxiv/sc-blank.png';
import scGil from '@/assets/images/service-cards/ffxiv/gil-currency/sc-gil.png';
import scDmu from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-dmu.png';
import scFru from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-fru.png';
import scTop from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-top.png';
import scDsr from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-dsr.png';
import scTea from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-tea.png';
import scUcob from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-ucob.png';
import scUwu from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-uwu.png';
import scUltBundle from '@/assets/images/service-cards/ffxiv/ultimate-raids/sc-ult-bundle.png';

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
          {
            id: 'ffxiv-gil-weekly',
            name: 'Weekly Gil Supply',
            description: 'A standing weekly delivery so you never have to craft for gil again.',
            price: 39.99,
            delivery: 'Up to 500 M / month',
            image: scGil,
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
            name: 'The Arcadion Savage Raid',
            description: 'Get 790/795 ilvl gear',
            price: 19.99,
            delivery: 'Exclusive mounts & minions',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-pandaemonium-savage',
            name: 'Pandaemonium Savage Raid',
            description: 'Sunforged + 2 more mounts',
            price: 59.99,
            delivery: 'Quick clears of all tiers',
            image: scBlank,
          },
          {
            id: 'ffxiv-endgame-bundle',
            name: 'Endgame Bundle',
            description: '2 raids with 10% off — Arcadion + any Ultimate',
            price: 169.98,
            delivery: 'Mats for 790/795 ilvl gear',
            image: scBlank,
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-pandaemonium-abyssos-normal',
            name: 'Pandaemonium Abyssos Normal',
            description: 'Unsung Blade of Abyssos',
            price: 29.99,
            delivery: 'Unsung Tokens of Abyssos',
            image: scBlank,
          },
          {
            id: 'ffxiv-omega-savage',
            name: 'Omega Savage Raid',
            description: 'Iconic Stormblood glamour',
            price: 49.99,
            delivery: '3 unique mounts for a full run',
            image: scBlank,
          },
          {
            id: 'ffxiv-eden-savage',
            name: 'Eden Savage Raid',
            description: 'Full loot priority',
            price: 49.99,
            delivery: '3 unique sets of glamour',
            image: scBlank,
          },
          {
            id: 'ffxiv-hesperos-kill',
            name: 'Hesperos Kill',
            description: 'Hesperos boss defeated',
            price: 39.99,
            delivery: 'Demi-Phoinix mount chance',
            image: scBlank,
          },
          {
            id: 'ffxiv-phoinix-kill',
            name: 'Phoinix Kill',
            description: 'P3S completion',
            price: 29.99,
            delivery: 'Radiant Roborant & Twine',
            image: scBlank,
          },
          {
            id: 'ffxiv-hippokampos-kill',
            name: 'Hippokampos Kill',
            description: 'P2S completion',
            price: 19.99,
            delivery: 'Radiant Coating',
            image: scBlank,
          },
          {
            id: 'ffxiv-erichthonios-kill',
            name: 'Erichthonios Kill',
            description: 'P1S completion',
            price: 19.99,
            delivery: 'Pieces of 600 ilvl gear',
            image: scBlank,
          },
        ],
      },
      {
        id: 'alliance-raids',
        name: '24 Player Raids',
        services: [
          {
            id: 'ffxiv-endwalker-alliance-bundle',
            name: 'Endwalker Alliance Raids Bundle',
            description: 'Three Alliance Raid runs',
            price: 30.99,
            delivery: 'All Myths of the Realms raids',
            image: scBlank,
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-aglaia',
            name: 'Myth of the Realms: Aglaia',
            description: 'Panthean armor pieces',
            price: 11.99,
            delivery: 'Coins for BiS exchange per run',
            image: scBlank,
          },
          {
            id: 'ffxiv-euphrosyne',
            name: 'Myth of the Realms: Euphrosyne',
            description: 'Unique Hypostatic armor pieces',
            price: 11.99,
            delivery: 'No weekly loot limits',
            image: scBlank,
          },
          {
            id: 'ffxiv-thaleia',
            name: 'Myth of the Realms: Thaleia',
            description: '650 ilvl Theogonic armor set',
            price: 19.99,
            delivery: 'Mats for gear augmentation',
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
        ],
      },
      {
        id: 'trials',
        name: 'Extreme Trials',
        services: [
          {
            id: 'ffxiv-ageless-necropolis',
            name: 'The Ageless Necropolis',
            description: "Newest level 100 trial (Minstrel's Ballad)",
            price: 24.99,
            delivery: 'All rewards included',
            image: scBlank,
            tag: 'New',
          },
          {
            id: 'ffxiv-hell-on-rails',
            name: 'Hell On Rails',
            description: 'Doomtrain clear',
            price: 49.99,
            delivery: 'Totems for 775 ilvl gear',
            image: scBlank,
          },
          {
            id: 'ffxiv-the-unmaking',
            name: 'The Unmaking',
            description: 'Pick number of clears',
            price: 49.99,
            delivery: 'Totems of Naught & 785 weapon coffers',
            image: scBlank,
          },
          {
            id: 'ffxiv-sphenes-burden',
            name: "Sphene's Burden",
            description: 'Level 100 Dawntrail 7.1 trial',
            price: 19.99,
            delivery: 'Keep all loot',
            image: scBlank,
          },
          {
            id: 'ffxiv-recollection',
            name: 'Recollection',
            description: 'Level 100 trial clear',
            price: 14.99,
            delivery: 'Keep all loot',
            image: scBlank,
          },
          {
            id: 'ffxiv-everkeep',
            name: 'Everkeep',
            description: 'Highest-difficulty 8-player trial',
            price: 12.99,
            delivery: 'Full completion',
            image: scBlank,
          },
          {
            id: 'ffxiv-worqor-lar-dor',
            name: 'Worqor Lar Dor',
            description: 'Highest-difficulty 8-player trial',
            price: 12.99,
            delivery: 'Full completion',
            image: scBlank,
          },
          {
            id: 'ffxiv-abyssal-fracture',
            name: 'The Abyssal Fracture',
            description: 'ilvl 655 Voidvessel weapon',
            price: 9.99,
            delivery: 'Guaranteed drop after 5 runs',
            image: scBlank,
          },
          {
            id: 'ffxiv-voidcast-dais',
            name: 'The Voidcast Dais',
            description: 'Full extreme trial completion',
            price: 9.99,
            delivery: 'ilvl 655 Voidvessel weapon',
            image: scBlank,
          },
          {
            id: 'ffxiv-zodiarks-fall',
            name: "Zodiark's Fall",
            description: '580 ilvl rewards',
            price: 9.99,
            delivery: 'Eternal Dark jewelry',
            image: scBlank,
          },
          {
            id: 'ffxiv-storms-crown',
            name: "Storm's Crown",
            description: 'High-level rewards',
            price: 9.99,
            delivery: 'Chance at 615 ilvl weapon coffer',
            image: scBlank,
          },
          {
            id: 'ffxiv-hydaelyns-call',
            name: "Hydaelyn's Call",
            description: '580 ilvl rewards',
            price: 9.99,
            delivery: 'Divine Light weapon',
            image: scBlank,
          },
          {
            id: 'ffxiv-endsingers-aria',
            name: "Endsinger's Aria",
            description: '595 ilvl rewards',
            price: 9.99,
            delivery: 'Chance at rare mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-mount-ordeals',
            name: 'Mount Ordeals',
            description: 'ilvl 625 Flamecloaked weapon in 5 runs',
            price: 9.99,
            delivery: '20% discount offer',
            image: scBlank,
          },
          {
            id: 'ffxiv-wreath-of-snakes-unreal',
            name: 'The Wreath of Snakes (Unreal)',
            description: 'Level 100 patch 7.3 trial',
            price: 19.99,
            delivery: 'Exclusive rewards',
            image: scBlank,
          },
          {
            id: 'ffxiv-tsukuyomis-pain-unreal',
            name: "Tsukuyomi's Pain (Unreal)",
            description: 'Weekly Faux Hollows rewards',
            price: 19.99,
            delivery: 'Guaranteed smooth clear',
            image: scBlank,
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
            image: scBlank,
          },
          {
            id: 'ffxiv-potd-solo',
            name: 'Palace of the Dead Solo 200',
            description: 'The Necromancer title run — solo floor 200 by one of the few who can do it.',
            price: 299.99,
            delivery: '1–2 weeks',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven-on-High Title Run',
            description: 'Floors 1–100 cleared with Empyrean aetherpool progress and the title.',
            price: 69.99,
            delivery: '2–3 days',
            image: scBlank,
          },
        ],
      },
      {
        id: 'criterion-dungeons',
        name: 'Criterion Dungeons',
        services: [
          {
            id: 'ffxiv-merchants-tale',
            name: "Merchant's Tale Dungeon",
            description: 'Chance for Genie of the Lamp',
            price: 349.99,
            delivery: 'All loot and drops included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-criterion-savage-bundle',
            name: 'Criterion Dungeons Savage Bundle',
            description: '3 Criterion Dungeons',
            price: 499.99,
            delivery: 'Unique Epic Hero title',
            image: scBlank,
            tag: 'Best Value',
          },
          {
            id: 'ffxiv-another-aloalo-island',
            name: 'Another Aloalo Island',
            description: 'Brand new Criterion Dungeon',
            price: 99.99,
            delivery: 'Mount and title',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-mount-rokkon',
            name: 'Another Mount Rokkon',
            description: 'Level 90 Criterion dungeon',
            price: 49.99,
            delivery: 'Chance at Shishioji mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-another-sildihn-subterrane',
            name: "Another Sil'dihn Subterrane",
            description: '6.25 Criterion Dungeon',
            price: 49.99,
            delivery: "Infamy of Sil'dih title",
            image: scBlank,
          },
          {
            id: 'ffxiv-aloalo-island-variant',
            name: 'Aloalo Island Variant',
            description: 'Unique glamour set',
            price: 39.99,
            delivery: 'Chance for a special mount',
            image: scBlank,
          },
          {
            id: 'ffxiv-mount-rokkon-variant',
            name: 'Mount Rokkon Variant',
            description: '5 hard bosses, 6 achievements',
            price: 9.99,
            delivery: 'Rewards & glamour sets',
            image: scBlank,
          },
          {
            id: 'ffxiv-sildihn-subterrane',
            name: "The Sil'dihn Subterrane",
            description: 'Patch 6.25 dungeon',
            price: 9.99,
            delivery: 'Fresh cosmetic rewards',
            image: scBlank,
          },
        ],
      },
      {
        id: 'mounts',
        name: 'Mounts',
        services: [
          {
            id: 'ffxiv-lowrider-t1rant',
            name: 'Lowrider T1RANT',
            description: 'Guaranteed Lowrider drop',
            price: 699.99,
            delivery: 'Savage clear runs & bonus loot',
            image: scBlank,
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
            id: 'ffxiv-wings-of-nihility',
            name: 'Wings of Nihility',
            description: 'Patch 7.5 wings without wipes',
            price: 386.99,
            delivery: '785 ilvl upgrades included',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-wings-of-mist',
            name: 'Wings of Mist',
            description: 'Patch 7.4 Extreme trial mount',
            price: 323.99,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-wings-of-death',
            name: 'Wings of Death',
            description: 'Extreme trial mount',
            price: 161.99,
            delivery: 'Guaranteed farm until drop',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-knighthood',
            name: 'Wings of Knighthood',
            description: '7.2 mount in 5 days',
            price: 119.99,
            delivery: 'Currency for high ilvl gear',
            image: scBlank,
          },
          {
            id: 'ffxiv-wings-of-ruin',
            name: 'Wings of Ruin',
            description: '~5% drop chance skip',
            price: 89.99,
            delivery: 'Tomestones & Skyruin Totems',
            image: scBlank,
          },
        ],
      },
      {
        id: 'gear',
        name: 'Gearing',
        services: [
          {
            id: 'ffxiv-gear-boost',
            name: 'Gear Boost',
            description: 'The best endgame PvE items',
            price: 15.99,
            delivery: 'Any item level, preferred stats',
            image: scBlank,
          },
          {
            id: 'ffxiv-bis-farm',
            name: 'BiS Gear Set',
            description: 'BiS 790 ilvl gear — skip the 3-month grind',
            price: 549.99,
            delivery: 'Crush any content with ease',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-ultimate-weapons',
            name: 'Ultimate Weapons',
            description: 'Top-tier ultimate raid weapons',
            price: 49.99,
            delivery: 'Extra loot, materials & Gil',
            image: scBlank,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-phantom-weapons',
            name: 'Phantom Weapons',
            description: 'Any Phantom Weapon',
            price: 599.99,
            delivery: 'Best relics in Dawntrail',
            image: scBlank,
            tag: 'New',
          },
          {
            id: 'ffxiv-manderville-weapons',
            name: 'Manderville Weapons',
            description: 'BiS weapons in patch 6.57',
            price: 50,
            delivery: 'Upgrades up to 665 ilvl',
            image: scBlank,
          },
          {
            id: 'ffxiv-pandaemonium-savage-full-set',
            name: 'Pandaemonium Savage Full Set',
            description: '660/665 ilvl full set',
            price: 90,
            delivery: 'Full Anabaseios set',
            image: scBlank,
          },
          {
            id: 'ffxiv-crafting-gear',
            name: 'Crafting Gear',
            description: 'Complete pentamelded set',
            price: 125,
            delivery: 'Increased high-quality chance',
            image: scBlank,
          },
          {
            id: 'ffxiv-gathering-gear',
            name: 'Gathering Gear',
            description: 'Complete pentamelded set',
            price: 125,
            delivery: 'Increased material yield',
            image: scBlank,
          },
          {
            id: 'ffxiv-resistance-weapons',
            name: 'Resistance Weapons',
            description: 'Unique relic weapons',
            price: 30,
            delivery: 'Choose any weapon',
            image: scBlank,
          },
          {
            id: 'ffxiv-eureka-weapons',
            name: 'Eureka Weapons',
            description: 'Unique-looking relic weapon',
            price: 20,
            delivery: 'Choose any type',
            image: scBlank,
          },
          {
            id: 'ffxiv-eureka-gear',
            name: 'Eureka Gear',
            description: 'Wonderful gear sets',
            price: 349.99,
            delivery: 'Elemental Armor +1',
            image: scBlank,
          },
          {
            id: 'ffxiv-resistance-gear',
            name: 'Resistance Gear',
            description: 'All loot is yours',
            price: 389,
            delivery: 'Choose bosses and run count',
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
