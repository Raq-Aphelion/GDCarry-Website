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
import scCrafterGatherer from '@/assets/images/service-cards/ffxiv/leveling/ffxiv-crafter-gatherer-leveling.webp';
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
import scJuedi from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-juedi.webp';
import scCerberus from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-cerberus.webp';
import scDemiOzma from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-demi-ozma.webp';
import scDemonHaul from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-demon-haul.webp';
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
import scWorqorLarDor from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-worqor-lar-dor.webp';
import scEverkeep from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-everkeep.webp';
import scSphenesBurden from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-sphenes-burden.webp';
import scRecollection from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-recollection.webp';
import scNecronsEmbrace from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-necrons-embrace.webp';
import scWindwardWilds from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-the-windward-wilds.webp';
import scHellOnRails from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-hell-on-rails.webp';
import scTheUnmaking from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-the-unmaking.webp';
import scDawntrailTrialsBundle from '@/assets/images/service-cards/ffxiv/extreme-trials/dawntrail-extreme-trials/ffxiv-dawntrail-extreme-bundle.webp';
import scEndwalkerTrialsBundle from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-endwalker-extreme-bundle.webp';
import scShadowbringersTrialsBundle from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-shadowbringers-extreme-bundle.webp';
import scStormbloodTrialsBundle from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-stormblood-extreme-bundle.webp';
import scHeavenswardTrialsBundle from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-heavensward-extreme-bundle.webp';
import scMemoriaMisera from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-memoria-misera.webp';
import scGreatHunt from '@/assets/images/service-cards/ffxiv/extreme-trials/ffxiv-the-great-hunt.webp';
import scAlliedSociety from '@/assets/images/service-cards/ffxiv/reputation/ffxiv-allied-society.webp';
import scCustomDelivery from '@/assets/images/service-cards/ffxiv/reputation/ffxiv-custom-delivery.webp';
import scOccultCrescent from '@/assets/images/service-cards/ffxiv/field-ops-misc/ffxiv-occult-crescent-leveling.webp';
import scResistanceRank from '@/assets/images/service-cards/ffxiv/field-ops-misc/ffxiv-resistance-rank.webp';
import scEurekaLeveling from '@/assets/images/service-cards/ffxiv/field-ops-misc/ffxiv-eureka-leveling.webp';
import scIslandSanctuary from '@/assets/images/service-cards/ffxiv/field-ops-misc/ffxiv-island-sanctuary-rank.webp';
import scCloudOfDarkness from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-cloud-of-darkness.webp';
import scDelubrumReginae from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-delubrum-reginae.webp';
import scBaldesionArsenal from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-the-baldesion-arsenal.webp';
import scForkedTowerBlood from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-the-forked-tower-blood.webp';
import scForkedTowerMagic from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-the-forked-tower-magic.webp';
import scJeunoFirstWalk from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-jueno-the-first-walk.webp';
import scSanDoriaSecondWalk from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-san-doria-the-second-walk.webp';
import scWindurstThirdWalk from '@/assets/images/service-cards/ffxiv/24-player-raids/ffxiv-windurst-the-third-walk.webp';
import scDaisOfDarkness from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-dais-of-darkness.webp';
import scShroudOfDarkness from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-shroud-of-darkness.webp';
import scAeturna from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-aeturna.webp';
import scMorbol from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-morbol.webp';
import scDuckBilledPorter from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-duck-billed-porter.webp';
import scVacuumSuit from '@/assets/images/service-cards/ffxiv/mounts/ffxiv-high-mobility-vacuum-suit.webp';
import scPhantomWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-phantom-weapon.webp';
import scMandervilleWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-manderville-weapon.webp';
import scResistanceWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-resistance-weapon.webp';
import scEurekanWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-eurekan-weapon.webp';
import scEurekanArmour from '@/assets/images/service-cards/ffxiv/relics/ffxiv-eurekan-elemental-armour.webp';
import scAnimaWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-anima-weapon.webp';
import scZodiacWeapon from '@/assets/images/service-cards/ffxiv/relics/ffxiv-zodiac-weapon.webp';
import scGenieOfTheLamp from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-genie-of-the-lamp.webp';
import scRoyalMagickedCarpet from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-royal-magicked-carpet.webp';
import scQuaqua from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-quaqua.webp';
import scSpectralStatice from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-spectral-statice.webp';
import scShishioji from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-shishioji.webp';
import scBuraburaChochin from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-burabura-chochin.webp';
import scSildihnThrone from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-sildihn-throne.webp';
import scSilkie from '@/assets/images/service-cards/ffxiv/mounts/vc-dungeons/ffxiv-silkie.webp';
import scCosmicExploration from '@/assets/images/service-cards/ffxiv/field-ops-misc/ffxiv-cosmic-exploration.webp';
import scAnotherMerchantsTale from '@/assets/images/service-cards/ffxiv/vc-dungeons/criterion/ffxiv-another-merchants-tale.webp';
import scAnotherAloaloIsland from '@/assets/images/service-cards/ffxiv/vc-dungeons/criterion/ffxiv-another-aloalo-island.webp';
import scAnotherMountRokkon from '@/assets/images/service-cards/ffxiv/vc-dungeons/criterion/ffxiv-another-mount-rokkon.webp';
import scAnotherSildihnSubterrane from '@/assets/images/service-cards/ffxiv/vc-dungeons/criterion/ffxiv-another-sildihn-subterrane.webp';
import scVariantMerchantsTale from '@/assets/images/service-cards/ffxiv/vc-dungeons/variant/ffxiv-variant-merchants-tale.webp';
import scVariantAloaloIsland from '@/assets/images/service-cards/ffxiv/vc-dungeons/variant/ffxiv-variant-aloalo-island.webp';
import scVariantMountRokkon from '@/assets/images/service-cards/ffxiv/vc-dungeons/variant/ffxiv-variant-mount-rokkon.webp';
import scVariantSildihnSubterrane from '@/assets/images/service-cards/ffxiv/vc-dungeons/variant/ffxiv-variant-sildihn-subterrane.webp';
import { SERVICE_PAGES } from '@/data/servicePages';
import type { CatalogConfig } from '@/data/pricing';

export const games: Game[] = [
  {
    id: 'ffxiv',
    name: 'Final Fantasy XIV',
    short: 'FFXIV',
    tagline: 'Eorzea’s most trusted carry crew',
    description:
      'Content ranging from Trials to Ultimates done by verified professionals with decades of experience & part of world race teams.',
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
            tag2: 'Any world, any amount',
            longDescription:
              'Gil is the most widely accepted form of in-game currency. The amount of gil you hold is indicated on the currency panel. The gil cap is 999,999,999 for the player and each retainer, while players on a Free Trial are capped at 300,000 gil.',
            price: 0,
            tag1: '5M - 900M Gil',
            tag3: 'Mannequin or Face to Face Trade',
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
        proxies: ['ffxiv-dmu', 'ffxiv-arcadion-savage', 'ffxiv-wings-of-legacy', 'ffxiv-wings-of-nihility', 'ffxiv-lowrider-t1rant', 'ffxiv-dawntrail-trials-bundle', 'ffxiv-the-unmaking', 'ffxiv-leveling-boost', 'ffxiv-msq-skip', 'ffxiv-cc-rank-boost', 'ffxiv-pvp-series-boost', 'ffxiv-occult-crescent'],
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
        name: '24+ Player Raids',
        services: [
          {
            id: 'ffxiv-forked-tower-magic',
            name: 'The Forked Tower: Magic',
            tag2: '12 - 48 Player Field Operation Clear',
            price: 0,
            tag1: 'Arcane Amulets & mount chance',
            tag3: 'Piloted Service',
            longDescription:
              'Where the isle’s ley lines converge, a tower of pure arcanima hums with incantations no living mage has uttered in centuries. Every floor wrestles with another school of magic — and the answers sealed at its peak are worth every spell spent reaching it.',
            image: scForkedTowerMagic,
          },
          {
            id: 'ffxiv-forked-tower-blood',
            name: 'The Forked Tower: Blood',
            tag2: '24 - 48 Player Field Operation Clear',
            price: 0,
            tag1: 'Demon Haul mount & loot',
            tag3: 'Piloted Service',
            longDescription:
              'An ominous tower looms on the horizon of the isle’s south horn, twisted spires shimmering in the haze. What revelations await within its uppermost chambers?',
            image: scForkedTowerBlood,
          },
          {
            id: 'ffxiv-windurst-third-walk',
            name: 'Windurst: The Third Walk',
            tag2: "Echoes of Vana'diel (Alliance Raid)",
            price: 0,
            tag1: 'Guaranteed gear',
            tag3: 'Piloted Service',
            longDescription:
              "The third walk of the Echoes of Vana'diel series in Windurst — a full 24-player alliance clear with a guaranteed gear upgrade token and all loot kept. Cleared piloted by our veteran raiders.",
            image: scWindurstThirdWalk,
          },
          {
            id: 'ffxiv-san-doria-second-walk',
            name: "San d'Oria: The Second Walk",
            tag2: "Echoes of Vana'diel (Alliance Raid)",
            price: 0,
            tag1: 'Guaranteed gear',
            tag3: 'Piloted Service',
            longDescription:
              "The Echoes of Vana'diel continue in San d'Oria — a full 24-player alliance clear with a guaranteed gear upgrade token and all loot kept. Cleared piloted by our veteran raiders.",
            image: scSanDoriaSecondWalk,
          },
          {
            id: 'ffxiv-jeuno-first-walk',
            name: 'Jeuno: The First Walk',
            tag2: "Echoes of Vana'diel (Alliance Raid)",
            price: 0,
            tag1: 'Guaranteed gear',
            tag3: 'Piloted Service',
            longDescription:
              "The first walk through the ruined streets of Jeuno — a 24-player trip back to Vana'diel with 720+ ilvl gear, the Nano Lord minion and every drop along the way. Cleared piloted by our veteran raiders.",
            image: scJeunoFirstWalk,
          },
          {
            id: 'ffxiv-cloud-of-darkness',
            name: 'The Cloud of Darkness (Chaotic)',
            tag2: '12 - 24 Player Chaotic Raid Clear',
            price: 0,
            tag1: 'Darkness mounts and gear',
            tag3: 'Piloted Service',
            longDescription:
              'The dread cloud looms over the AAC — a chaotic alliance raid where one mistake cascades into wipe after wipe. Our raiders clear it piloted, with demimateria and the rare mount chance on top.',
            image: scCloudOfDarkness,
            tag: 'New',
          },
          {
            id: 'ffxiv-delubrum-reginae-savage',
            name: 'Delubrum Reginae (Savage)',
            tag2: '24 - 48 Player Savage Raid Clear',
            price: 0,
            tag1: 'Cerberus mount & title',
            tag3: 'Piloted Service',
            longDescription:
              "Bozja’s grandest stage: a 48-player savage gauntlet through the Queen’s halls. Our raiders clear Delubrum Reginae (Savage) — Cerberus and the Savage Queen of Swords title guaranteed.",

            image: scDelubrumReginae,
          },
          {
            id: 'ffxiv-baldesion-arsenal',
            name: 'The Baldesion Arsenal',
            tag2: '24 - 56 Player Field Operation Clear',
            price: 0,
            tag1: 'Demi-Ozma mount & minion chance',
            tag3: 'Piloted Service',
            longDescription:
              "Eureka’s deepest challenge: 56 players, one fragile timeline, Ozma waiting at the end. Our veterans clear the full Arsenal — Demi-Ozma, minion and fragments along the way.",

            image: scBaldesionArsenal,
          },
        ],
      },
      {
        id: 'trials',
        name: 'Extreme Trials',
        services: [
          {
            id: 'ffxiv-dawntrail-trials-bundle',
            name: 'Dawntrail Extreme Trials Bundle',
            tag2: 'All 7 Dawntrail Extreme trials',
            price: 0,
            tag1: 'Mount guaranteed option',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "All seven Dawntrail Extremes in one package — from the Skyruin’s tempest to Necron’s final stand, with the Wings of Legacy guaranteed along the way. Piloted or AFK, your totems and mounts included.",
            image: scDawntrailTrialsBundle,
          },
          {
            id: 'ffxiv-endwalker-trials-bundle',
            name: 'Endwalker Extreme Trials Bundle',
            tag2: 'All 7 Endwalker Extreme trials',
            price: 0,
            tag1: 'Mount guaranteed option',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "From Hydaelyn’s final trial to the Endsinger’s song — all seven Endwalker Extremes in one package, with mounts and totems kept. Piloted or AFK Carry.",
            image: scEndwalkerTrialsBundle,
          },
          {
            id: 'ffxiv-shadowbringers-trials-bundle',
            name: 'Shadowbringers Extreme Trials Bundle',
            tag2: 'All 7 Shadowbringers Extreme trials',
            price: 0,
            tag1: 'Mount guaranteed option',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Crown the Shadowbringers Extremes — every trial from the dancing Hades to the Diamond Weapon, one package, every mount chance kept.",
            image: scShadowbringersTrialsBundle,
          },
          {
            id: 'ffxiv-stormblood-trials-bundle',
            name: 'Stormblood Extreme Trials Bundle',
            tag2: 'All 7 Stormblood Extreme trials',
            price: 0,
            tag1: 'Mount guaranteed option',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "The Stormblood Extremes in one package — Lakshmi’s dance to Tsukuyomi’s moonlight, with Kamuy mounts and totems along the way.",
            image: scStormbloodTrialsBundle,
          },
          {
            id: 'ffxiv-heavensward-trials-bundle',
            name: 'Heavensward Extreme Trials Bundle',
            tag2: 'All 7 Heavensward Extreme trials',
            price: 0,
            tag1: 'Mount guaranteed option',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Every Heavensward Extreme in one package — from Bismarck’s back to Thordan’s knights, Lanners and totems included.",
            image: scHeavenswardTrialsBundle,
          },
          {
            id: 'ffxiv-the-unmaking',
            name: 'The Unmaking (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "The last verse of Alexandria’s story, unmade before your eyes. Clear The Unmaking on Extreme with our raiders — Wings of Nihility and Totems of Naught kept.",
            image: scTheUnmaking,
            tag: 'New',
          },

          {
            id: 'ffxiv-hell-on-rails',
            name: 'Hell on Rails (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "All aboard the doom train — a runaway locomotive of living lightning. Hell on Rails cleared on Extreme with our raiders, Wings of Mist and Runaway Totems included.",
            image: scHellOnRails,
            tag: 'Hot',
          },

          {
            id: 'ffxiv-windward-wilds',
            name: 'The Windward Wilds (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Arkveld, the White Wraith, stalks the forbidden lands. Take it down on Extreme — the Felyne Support Team Cart mount and every drop along the way.",
            image: scWindwardWilds,
          },

          {
            id: 'ffxiv-necrons-embrace',
            name: "The Minstrel's Ballad: Necron's Embrace",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Death itself wears a crown in the depths of the Underkeep. Face Necron’s Embrace on Extreme — Wings of Death and Grave Totems, piloted or AFK.",
            image: scNecronsEmbrace,
          },

          {
            id: 'ffxiv-recollection',
            name: 'Recollection (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "A memory given form: the Arcadion’s champion reborn in crystal. Recollection clears on Extreme with our raiders — Wings of the Knighthood and Knight Totems kept.",
            image: scRecollection,
          },

          {
            id: 'ffxiv-sphenes-burden',
            name: "The Minstrel's Ballad: Sphene's Burden",
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "The Minstrel’s Ballad retells Sphene’s sorrow as a hymn of steel. Clear the ballad on Extreme with our raiders — Wings of Eternity and Totems Eternal along the way.",
            image: scSphenesBurden,
          },

          {
            id: 'ffxiv-everkeep',
            name: 'Everkeep (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "The Resilient King defends his throne to the last spark. Zoraal Ja falls on Extreme with our raiders — Wings of Resolve and Resilient Totems kept.",
            image: scEverkeep,
          },

          {
            id: 'ffxiv-worqor-lar-dor',
            name: 'Worqor Lar Dor (Extreme)',
            tag2: 'Dawntrail Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Valigarmanda, the dread Skyruin, tears open the heavens above Urqopacha. Our raiders weather its calamities and bring home the Wings of Ruin — piloted or AFK.",
            image: scWorqorLarDor,
          },















          {
            id: 'ffxiv-memoria-misera',
            name: 'Memoria Misera (Extreme)',
            tag2: 'Shadowbringers Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "A misera memory of Bozja’s fall, replayed in crystal. Clear Memoria Misera on Extreme with our raiders — the mount chance is yours to keep.",
            image: scMemoriaMisera,
          },

















          {
            id: 'ffxiv-great-hunt',
            name: 'The Great Hunt (Extreme)',
            tag2: 'Stormblood Extreme trial clear',
            price: 0,
            tag1: 'Totems & all loot included',
            tag3: 'Piloted or AFK Carry',
            longDescription:
              "Rathalos, King of the Skies, descends on Eorzea in the Monster Hunter crossover. Guaranteed clears on Extreme — Rathalos mount and scales included.",
            image: scGreatHunt,
          },
























        ],
      },
      {
        id: 'deep-dungeon',
        name: 'Deep Dungeons',
        services: [
          {
            id: 'ffxiv-pilgrims-traverse',
            name: 'Pilgrim\'s Traverse (Deep Dungeon)',
            tag2: '1 - 100 Floors',
            price: 0,
            tag1: 'The Enlightened title & loot',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Beneath the verdant hills of Il Mheg, a holy road winds down into the dark. Pilgrim’s Traverse calls the faithful and the foolhardy alike to walk its ninety-nine floors, gathering offerings for the verse that waits at journey’s end.',
            image: scPilgrimsTraverse,
          },
          {
            id: 'ffxiv-orthos',
            name: 'Eureka Orthos (Deep Dungeon)',
            tag2: '1 - 100 Floors',
            price: 0,
            tag1: 'Once and Future King/Queen title',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Beneath the Crystal Tower in Mor Dhona, the Allagan Empire’s deepest secrets slumber. Eureka Orthos descends into a research facility abandoned for millennia — a hundred floors of Allagan horrors waiting beneath the syndicate’s watchful eye.',
            image: scEurekaOrthos,
          },
          {
            id: 'ffxiv-hoh',
            name: 'Heaven-on-High (Deep Dungeon)',
            tag2: '1 - 100 Floors',
            price: 0,
            tag1: 'Lone Hero title & achievements',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'Rising high above the Ruby Sea from the island of Onokoro, Heaven-on-High is said to be the stairway traversed by kami descending from their empyrean home. Following the discovery of a secret entrance, the Confederate leader Rasho asks you to investigate the tower and brave the hordes of vile fiends that lurk within.',
            image: scHeavenOnHigh,
          },
          {
            id: 'ffxiv-potd-solo',
            name: 'Palace of the Dead (Deep Dungeon)',
            tag2: '1 - 200 Floors',
            price: 0,
            tag1: 'Necromancer title & achievements',
            tag3: 'Group Play or Solo Piloted',
            longDescription:
              'In the subterranean city of Gelmorra, deep within a forgotten corner of Issom-Har, stout-hearted explorers have uncovered the entrance to a labyrinthine dungeon. Those who set foot inside its maddening halls find their vigor drained by an irresistible fog of innervation, and repeated excursions have failed to map its seemingly inconstant architecture.',
            image: scPalaceOfTheDead,
            tag: 'Hot',
          },
          {
            id: 'ffxiv-deep-dungeon-bundle',
            name: 'Deep Dungeons Bundle',
            tag2: '500 Floors — all four dungeons',
            price: 0,
            tag1: 'Every solo title & all loot',
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
        name: 'V&C Dungeons',
        services: [
          {
            id: 'ffxiv-another-merchants-tale',
            name: "Another Merchant's Tale",
            tag2: 'Criterion: Normal mode',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              "The Merchant's Tale depicts a Corvos from before the Garlean occupation, made even more wondrous by the flourishes of countless storytellers throughout the ages. As you relate the details of your time within its pages to Osmon, he continues the timeless storytelling tradition by adding his own embellishments to an already fantastic fable, and you feel yourself drawn back in to the beautiful but increasingly dangerous world of folklore...",
            image: scAnotherMerchantsTale,
            tag: 'New',
          },
          {
            id: 'ffxiv-another-aloalo-island',
            name: 'Another Aloalo Island',
            tag2: 'Criterion: Normal & Savage',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              'Inspired by your tale, Osmon rejoices as his imagination soars to heights untold. Visions of the glorious civilizations the peoples of Aloalo built take shape in his mind, populating the island with beasts imbued by esoteric magicks. Drawn into this tide of fantasy and swept to its remotest edge, you must now do battle with the mundane made legendary.',
            image: scAnotherAloaloIsland,
          },
          {
            id: 'ffxiv-another-mount-rokkon',
            name: 'Another Mount Rokkon',
            tag2: 'Criterion: Normal & Savage',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              'Delighted beyond measure to hear tell of the mononoke haunting Mount Rokkon, Osmon cannot help but speculate upon the nature of spirits—and what should result were they to grow more powerful than nature is wont to allow...',
            image: scAnotherMountRokkon,
          },
          {
            id: 'ffxiv-another-sildihn-subterrane',
            name: "Another Sil'dihn Subterrane",
            tag2: 'Criterion: Normal & Savage',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              "The retelling of your adventures has set Osmon's imagination aflame with visions of perilous passages and mighty sentinels. He wonders, however, if dwelling in the damp has weakened the guardians; if, before rust and decay set in, that they had once been far more powerful. You cannot help but ponder the possibilities, your thoughts drifting as Osmon's hypothetical scenario plays out in your mind...",
            image: scAnotherSildihnSubterrane,
          },
          {
            id: 'ffxiv-variant-merchants-tale',
            name: "Variant: Merchant's Tale",
            tag2: 'Variant: All 13 routes & Advanced',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              "Your latest odd job commission brings you together with one Y'nazqha, a gleaner who finds herself in possession of an unusual book inherited from her father and mentor. It contains a rendition of The Merchant's Tale, a fable passed down through generations in Corvos. While the beautifully illuminated pages of the manuscript set it apart from common storybooks, its most singular feature is the enchantment which can pull the very mind of its readers into the story.",
            image: scVariantMerchantsTale,
            tag: 'New',
          },
          {
            id: 'ffxiv-variant-aloalo-island',
            name: 'Variant: Aloalo Island',
            tag2: 'Variant: All 12 routes',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              "In a seldom-traveled corner of the south sea isles lies Aloalo, an island filled with lush vegetation and teeming with vibrant wildlife. Yet the survival of this paradise hinges on a delicate natural balance which has only grown more precarious since the island's stewards departed a century ago. Answering the plea of a messenger most peculiar, you must join Matsya on a journey to restore order to Aloalo, and in the process uncover secrets long forgotten.",
            image: scVariantAloaloIsland,
          },
          {
            id: 'ffxiv-variant-mount-rokkon',
            name: 'Variant: Mount Rokkon',
            tag2: 'Variant: All 12 routes',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              "On Hingashi's westernmost isle of Shishu lies the long-venerated Mount Rokkon. Once refuge for humble monks and weary pilgrims, the holy site lately fell to a host of malevolent mononoke, spurring the local liege lord to take the unprecedented step of inviting ijin to assist in reclaiming its slopes. As in his wont, Hancock has secured the promise of valuable rewards in exchange for his—and your—assistance, but each of these treasures has a life of its own...",
            image: scVariantMountRokkon,
          },
          {
            id: 'ffxiv-variant-sildihn-subterrane',
            name: "Variant: The Sil'dihn Subterrane",
            tag2: 'Variant: All 12 routes',
            price: 0,
            tag1: 'Exclusive Loot + Tokens',
            tag3: 'Piloted Service',
            longDescription:
              'An extensive warren of tunnels and waterways stretches beneath the barren lands of Thanalan, but none come now to marvel at this remnant of fallen Sil\'dih. Its memories lie undisturbed, festering silently in the dark and the damp. Yet not for much longer. You have come at the personal behest of Nanamo Ul Namo, and together will you throw open the gate to the desert nation\'s troubled past.',
            image: scVariantSildihnSubterrane,
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
            tag3: 'Piloted Service',
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
            tag3: 'Piloted Service',
            longDescription:
              'The three-headed hound of Delubrum Reginae (Savage) — guaranteed via the Savage Queen of Swords achievement on completion.',
            image: scCerberus,
          },
          {
            id: 'ffxiv-duck-billed-porter-mount',
            name: 'Duck-billed Porter (Mount)',
            tag2: 'The Forked Tower: Magic',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'The amiable porter of the Occult Crescent — earned in The Forked Tower: Magic as a random drop or through 500 Arcane Amulets. Guaranteed with our raiders on your account.',
            image: scDuckBilledPorter,
          },
          {
            id: 'ffxiv-demon-haul',
            name: 'Demon Haul (Mount)',
            tag2: 'The Forked Tower: Blood',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'A demonic palanquin earned in The Forked Tower: Blood — hauled by demons, guaranteed for your collection.',
            image: scDemonHaul,
          },
          {
            id: 'ffxiv-dais-of-darkness-mount',
            name: 'Dais of Darkness (Mount)',
            tag2: 'The Cloud of Darkness (Chaotic)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'A swirling throne of umbral energy from The Cloud of Darkness (Chaotic) — guaranteed at minimum ilvl with our raiders on your account.',
            image: scDaisOfDarkness,
          },
          {
            id: 'ffxiv-shroud-of-darkness-mount',
            name: 'Shroud of Darkness (Mount)',
            tag2: 'The Cloud of Darkness (Chaotic)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'Wings woven from pure darkness, earned in The Cloud of Darkness (Chaotic) — guaranteed at minimum ilvl with our raiders on your account.',
            image: scShroudOfDarkness,
          },
          {
            id: 'ffxiv-demi-ozma',
            name: 'Demi-Ozma (Mount)',
            tag2: 'The Baldesion Arsenal',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'A fragment of Ozma itself from the depths of The Baldesion Arsenal — guaranteed completion with a veteran group.',
            image: scDemiOzma,
          },
          {
            id: 'ffxiv-aeturna-mount',
            name: 'Aeturna (Mount)',
            tag2: 'Eureka Orthos (Deep Dungeon)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Group Play or Piloted',
            longDescription:
              'The eternal sentinel of Eureka Orthos — Aeturna answers only to those who master its hundred floors. Guaranteed with four full clears, piloted or alongside our raiders in group play.',
            image: scAeturna,
          },
          {
            id: 'ffxiv-juedi-mount',
            name: 'Juedi (Mount)',
            tag2: 'Heaven-on-High (Deep Dungeon)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Group Play or Piloted',
            longDescription:
              'The qirin steed of the Empyrean stair — Juedi descends only for those who conquer Heaven-on-High. Guaranteed with four full clears, piloted or alongside our raiders in group play.',
            image: scJuedi,
          },
          {
            id: 'ffxiv-genie-of-the-lamp-mount',
            name: 'Genie of the Lamp (Mount)',
            tag2: "Another Merchant's Tale",
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted Service',
            longDescription:
              "The lamp-dwelling spirit of Corvos — an imitation of legend that still carries you wherever you wish to go. Guaranteed from Another Merchant's Tale with our raiders on your account.",
            image: scGenieOfTheLamp,
          },
          {
            id: 'ffxiv-royal-magicked-carpet-mount',
            name: 'Royal Magicked Carpet (Mount)',
            tag2: "Variant: Merchant's Tale (Advanced)",
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted Service',
            longDescription:
              "The sole survivor of the pari's blaze — a flying carpet of Corvosi legend, yours for unlocking every route of the Merchant's Tale. Piloted by our raiders on your account.",
            image: scRoyalMagickedCarpet,
          },
          {
            id: 'ffxiv-quaqua-mount',
            name: 'Quaqua (Mount)',
            tag2: 'Another Aloalo Island',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted Service',
            longDescription:
              'A wooden familiar of ancient arcanima from Aloalo Island — guaranteed from the criterion clear with our raiders on your account.',
            image: scQuaqua,
          },
          {
            id: 'ffxiv-spectral-statice-mount',
            name: 'Spectral Statice (Mount)',
            tag2: 'Variant: Aloalo Island',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'The mischief-loving faerie of Aloalo — earned for unlocking every conservation record on the island. Piloted by our raiders on your account.',
            image: scSpectralStatice,
          },
          {
            id: 'ffxiv-shishioji-mount',
            name: 'Shishioji (Mount)',
            tag2: 'Another Mount Rokkon',
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted Service',
            longDescription:
              'The lion-dog guardian of Mount Rokkon — guaranteed from the criterion clear with our raiders on your account.',
            image: scShishioji,
          },
          {
            id: 'ffxiv-burabura-chochin-mount',
            name: 'Burabura Chochin (Mount)',
            tag2: 'Variant: Mount Rokkon',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'The swaying paper lantern of Mount Rokkon — earned for unlocking every route through the temple paths. Piloted by our raiders on your account.',
            image: scBuraburaChochin,
          },
          {
            id: 'ffxiv-sildihn-throne-mount',
            name: "Sil'dihn Throne (Mount)",
            tag2: "Another Sil'dihn Subterrane",
            price: 0,
            tag1: 'Guaranteed (any number of runs)',
            tag3: 'Piloted Service',
            longDescription:
              "The seat of Sil'dihn royalty, raised from the sunken city — guaranteed from the criterion clear with our raiders on your account.",
            image: scSildihnThrone,
          },
          {
            id: 'ffxiv-silkie-mount',
            name: 'Silkie (Mount)',
            tag2: "Variant: The Sil'dihn Subterrane",
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              "The fluffy marmot of the Sil'dihn aqueducts — earned for unlocking every route of the subterrane. Piloted by our raiders on your account.",
            image: scSilkie,
          },
          {
            id: 'ffxiv-morbol-mount',
            name: 'Morbol (Mount)',
            tag2: 'Alexander & Bahamut (Blue Mage)',
            price: 0,
            tag1: 'Guaranteed mount drop',
            tag3: 'Piloted Service',
            longDescription:
              'Though all it has ever wanted is to help, this morbol was found to be “too sweet” to present a challenge at the Celestium, and was transferred to the Blue Mages’ Guild before it had even seen its first match─only for it to be deemed “insufficiently vile” there as well.',
            image: scMorbol,
            tag: 'New',
          },
          {
            id: 'ffxiv-vacuum-suit-mount',
            name: 'High Mobility Vacuum Suit (Mount)',
            tag2: 'Cosmic Exploration',
            price: 0,
            tag1: 'Guaranteed mount acquisition',
            tag3: 'Piloted Service',
            longDescription:
              'A suit built for the vacuum of space — earned through 500K Cosmic Tracker on all 11 DoH and DoL jobs in Cosmic Exploration. Guaranteed with our raiders on your account.',
            image: scVacuumSuit,
            tag: 'New',
          },
        ],
      },
      {
        id: 'relics',
        name: 'Relics',
        services: [
          {
            id: 'ffxiv-phantom-weapon',
            name: 'Phantom Relic Weapon',
            tag2: 'Dawntrail Relic Weapon (ilvl 795)',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "Gerolt’s latest commission hums with demiatma from the Occult Crescent — the Phantom line is Dawntrail’s relic, and every stage from Penumbrae to Occultum is ours to grind for you.",
            image: scPhantomWeapon,
          },
          {
            id: 'ffxiv-manderville-weapon',
            name: 'Manderville Relic Weapon',
            tag2: 'Endwalker Relic Weapon',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "A Manderville weapon is never simply forged — it is dramatically unveiled. Every stage of the Endwalker relic chain, from the base blade to Mandervillous, completed on your account.",
            image: scMandervilleWeapon,
          },
          {
            id: 'ffxiv-resistance-weapon',
            name: 'Resistance Relic Weapon',
            tag2: 'Shadowbringers Relic Weapon',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "The Bozjan resistance forges weapons fit for a queen’s guard. We take your Resistance relic from its humble base to its final Augmented Law’s Order form.",
            image: scResistanceWeapon,
          },
          {
            id: 'ffxiv-eureka-weapon',
            name: 'Eurekan Relic Weapon',
            tag2: 'Stormblood Relic Weapon',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "Elemental magic seeps through every inch of Eureka — Antiquated to Physeos, our runners carry your Stormblood relic through every stage of the isles.",
            image: scEurekanWeapon,
          },
          {
            id: 'ffxiv-eurekan-elemental-armour',
            name: 'Eurekan Elemental Armour',
            tag2: 'Stormblood Relic Armour',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "The elemental armour of Eureka Pyros — a full set for your role, from the base set to the glowing final stages, farmed while you keep every drop.",
            image: scEurekanArmour,
          },
          {
            id: 'ffxiv-anima-weapon',
            name: 'Anima Relic Weapon',
            tag2: 'Heavensward Relic Weapon',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "Ardashir’s anima needs feeding — souls, aether oil and unidentifiable odds and ends. The full Heavensward anima chain, from Animated to Lux, done for you.",
            image: scAnimaWeapon,
          },
          {
            id: 'ffxiv-zodiac-weapon',
            name: 'Zodiac Relic Weapon',
            tag2: 'A Realm Reborn Relic Weapon',
            price: 0,
            tag1: 'Any Job, Any Step',
            tag3: 'Piloted Service',
            longDescription:
              "The relic that started it all — atma, books, light and more books. Our veterans carry your Zodiac weapon from the Starter Relic to Zeta, no Atma farm required of you.",
            image: scZodiacWeapon,
          },
        ],
      },
      {
        id: 'reputation',
        name: 'Reputation',
        services: [
          {
            id: 'ffxiv-beast-tribes',
            name: 'Allied Society Reputation Boost',
            tag2: 'Mounts, minions & questlines unlocked',
            price: 0,
            tag1: 'Any society, any rank',
            tag3: 'Piloted Service',
            longDescription:
              "From Neutral to Allied, every tribe has a story — and a mount. Our raiders run the daily quests for you, capping any Allied Society in any expansion, or all of them at once.",

            image: scAlliedSociety,
          },
          {
            id: 'ffxiv-custom-deliveries',
            name: 'Custom Delivery Reputation Boost',
            tag2: 'Scrips, mounts & glamour sets',
            price: 0,
            tag1: 'Any NPC, any level',
            tag3: 'Piloted Service',
            longDescription:
              'Weekly turn-ins without the wait. Our raiders handle your Custom Deliveries — any NPC raised to full Satisfaction while you keep every Scrip, title and glamour reward along the way.',
            image: scCustomDelivery,
          },
        ],
      },
      {
        id: 'leveling',
        name: 'Leveling',
        services: [
          {
            id: 'ffxiv-leveling-boost',
            name: 'Combat Job Leveling Boost',
            tag2: 'Job quests included',
            price: 0,
            tag1: 'Any job, any level',
            tag3: 'Piloted Service',
            longDescription:
              'Skip the grind and level your chosen job quickly and efficiently. Our Combat Job Leveling boost helps you reach your target level while saving time, letting you focus on endgame content, raiding, or gearing without the repetitive leveling process.',
            image: scLeveling,
            tag: 'Popular',
          },
          {
            id: 'ffxiv-blu-leveling-boost',
            name: 'Blue Mage Leveling Boost',
            tag2: 'All spells unlock (optional)',
            price: 0,
            tag1: 'Any level up to 80',
            tag3: 'Piloted Service',
            longDescription:
              'Blue Mage learns by watching — a limited job that copies the spells of friends and foes alike. Our Blue Mage Leveling boost powers your Blue Mage all the way to 80, with the option to fill your spellbook with every spell the job can learn.',
            image: scBlu,
          },
          {
            id: 'ffxiv-msq-skip',
            name: 'MSQ Completion Boost',
            tag2: 'Job quests included',
            price: 0,
            tag1: 'Any Expansion or Patches',
            tag3: 'Piloted Service',
            longDescription:
              'The main scenario is the heart of Eorzea’s story — but not everyone has the time to live through every chapter. Our MSQ Completion boost carries your character through the Main Scenario up to your chosen expansion, unlocking duties, trials and endgame content along the way.',
            image: scMsq,
          },
          {
            id: 'ffxiv-crafter-gatherer-leveling',
            name: 'Crafter & Gatherer Leveling Boost',
            tag2: 'Any DoH / DoL job',
            price: 0,
            tag1: 'Any job, any level',
            tag3: 'Piloted Service',
            longDescription:
              'Crafters and gatherers level on their own track — leves, collectables and cosmic missions included. Our Crafter & Gatherer Leveling boost takes any Disciple of the Hand or Land to your target level while you keep every scrip, material and reward.',
            image: scCrafterGatherer,
          },
        ],
      },
      {
        id: 'field-explorations',
        name: 'Field Explorations & Misc',
        services: [
          {
            id: 'ffxiv-occult-crescent',
            name: 'Occult Crescent Leveling Boost',
            tag2: 'Phantom Relic & Jobs',
            price: 0,
            tag1: 'Any Job, any level',
            tag3: 'Piloted Service',
            longDescription:
              'Unlock any Occult Crescent phantom job — Freeloader, Time Mage, Cannoneer, Berserker, Astrologian and more — without the questline grind. Pick exactly the jobs you need.',
            image: scOccultCrescent,
          },
          {
            id: 'ffxiv-cosmic-exploration',
            name: 'Cosmic Exploration Boost',
            tag2: 'Zone-specific credits & more',
            price: 0,
            tag1: 'All Cosmic Tool steps',
            tag3: 'Piloted Service',
            longDescription:
              "Among the stars, every tool tells a story — from Cosmic to Stars, plus the 500K-tracker Vacuum Suit for those who master all eleven jobs. Piloted through every stellar mission.",
            image: scCosmicExploration,
            tag: 'New',
          },
          {
            id: 'ffxiv-resistance-rank',
            name: 'Resistance Rank Boost',
            tag2: 'Resistance Relic',
            price: 0,
            tag1: '1 - 25 Rank',
            tag3: 'Piloted Service',
            longDescription:
              'The Bozjan southern front and the fields of Zadnor await. We grind your Resistance Rank from 1 to 25 through skirmishes, critical engagements and duels, unlocking every story beat and field note along the way.',
            image: scResistanceRank,
          },
          {
            id: 'ffxiv-eureka-leveling',
            name: 'Eureka Leveling Boost',
            tag2: 'Eureka Relic & Armour',
            price: 0,
            tag1: '1 - 60 Elemental Level',
            tag3: 'Piloted Service',
            longDescription:
              'The Forbidden Land of Eureka swallows the unprepared. Our runners carry you from elemental level 1 to 60 through Anemos, Pagos, Pyros and Hydatos, with every logogram and kettle filled en route.',
            image: scEurekaLeveling,
          },
          {
            id: 'ffxiv-island-sanctuary',
            name: 'Island Sanctuary Rank Boost',
            tag2: "Seafarer's & Islander's Cowries",
            price: 0,
            tag1: '1 - 20 Rank',
            tag3: 'Piloted Service',
            longDescription:
              "Your own island paradise awaits — crops, workshops and cowries without the daily chore loop. We raise your sanctuary rank from 1 to 20 while every Seafarer’s and Islander’s Cowrie stays in your pockets.",

            image: scIslandSanctuary,
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
    ],
  },
  {
    id: 'wow',
    name: 'World of Warcraft',
    short: 'WoW',
    tagline: 'Azeroth, handled',
    description:
      'Content ranging from Mythic+ keys to Mythic raid clears done by verified professionals with decades of experience & part of world race teams.',
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
      'Content ranging from Abyssal Dungeons to Legion Raids done by verified professionals with thousands of clears & part of world-first race teams.',
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
      'Content ranging from Mastery ranks to endgame bosses done by verified professionals with decades of experience & thousands of hours in the Origin System.',
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
      'Content ranging from Skilling to the Inferno done by verified professionals with decades of experience & maxed accounts across OSRS and RS3.',
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
