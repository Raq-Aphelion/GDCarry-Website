import type { Game } from './index';
import cardOsrs from '@/assets/images/game-cards/GameCard_OSRS.webp';
import logoRunescape from '@/assets/images/game-logos/runescape.webp';

export const runescapeGame: Game = {
    id: 'runescape',
    name: 'RuneScape',
    short: 'RuneScape',
    tagline: 'Gielinor’s finest mercenaries',
    description:
      'Content ranging from Skilling to the Inferno done by verified professionals with decades of experience & maxed accounts across OSRS and RS3.',
    cardImage: cardOsrs,
    logo: logoRunescape,
    subcategories: [],
};
