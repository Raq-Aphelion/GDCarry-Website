import type { Game } from './index';
import cardWarframe from '@/assets/images/game-cards/GameCard_Warframe.webp';
import logoWarframe from '@/assets/images/game-logos/warframe.png';

export const warframeGame: Game = {
    id: 'warframe',
    name: 'Warframe',
    short: 'Warframe',
    tagline: 'Tenno, we lift the grind',
    description:
      'Content ranging from Mastery ranks to endgame bosses done by verified professionals with decades of experience & thousands of hours in the Origin System.',
    cardImage: cardWarframe,
    logo: logoWarframe,
    subcategories: [],
};
