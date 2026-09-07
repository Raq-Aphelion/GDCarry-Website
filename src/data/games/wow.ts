import type { Game } from './index';
import cardWow from '@/assets/images/game-cards/GameCard_WoW.webp';
import logoWow from '@/assets/images/game-logos/wow.png';

export const wowGame: Game = {
    id: 'wow',
    name: 'World of Warcraft',
    short: 'WoW',
    tagline: 'Azeroth, handled',
    description:
      'Content ranging from Mythic+ keys to Mythic raid clears done by verified professionals with decades of experience who are part of world race teams.',
    cardImage: cardWow,
    logo: logoWow,
    // No live services yet — empty categories are deleted, not shown; the
    // carousel marks the game "Coming soon"
    subcategories: [],
};
