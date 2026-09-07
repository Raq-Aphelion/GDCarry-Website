import type { Game } from './index';
import cardLostArk from '@/assets/images/game-cards/GameCard_LostArk.webp';
import logoLostArk from '@/assets/images/game-logos/lost-ark.png';

export const lostArkGame: Game = {
    id: 'lost-ark',
    name: 'Lost Ark',
    short: 'Lost Ark',
    tagline: 'Arkesia without the homework',
    description:
      'Content ranging from Abyssal Dungeons to Legion Raids done by verified professionals with thousands of clears who are part of world-first race teams.',
    cardImage: cardLostArk,
    logo: logoLostArk,
    subcategories: [],
};
