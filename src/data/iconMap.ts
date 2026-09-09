import { ArrowRightLeft, ArrowUp, BadgeCheck, Coins, Gem, Globe, Hammer, House, Medal, Monitor, NotebookText, Package, Shield, ShieldCheck, Swords, Timer, Trophy, Undo2, UserRound, createLucideIcon, type LucideIcon } from 'lucide-react';

/** Single coin — lucide only ships `Coins` (two coins); keeps the same stroke style. */
const SingleCoin = createLucideIcon('SingleCoin', [
  ['circle', { cx: '12', cy: '12', r: '8', key: 'c' }],
  ['path', { d: 'M10.5 9.5h1.5v5', key: 'p' }],
]);

/** Forward map from the kebab-case `icon` names used in the per-service JSON
    files (public/db/services/<gameId>/<id>.json subpage rewards) to their
    Lucide components. Kept in sync by hand; scripts/validate-services.mjs
    machine-checks that every icon name in the JSON resolves to a key here. */
export const ICON_MAP: Record<string, LucideIcon> = {
  'arrow-right-left': ArrowRightLeft,
  'arrow-up': ArrowUp,
  'badge-check': BadgeCheck,
  'coins': Coins,
  'gem': Gem,
  'globe': Globe,
  'hammer': Hammer,
  'house': House,
  'medal': Medal,
  'monitor': Monitor,
  'notebook-text': NotebookText,
  'package': Package,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'single-coin': SingleCoin,
  'swords': Swords,
  'timer': Timer,
  'trophy': Trophy,
  'undo-2': Undo2,
  'user-round': UserRound,
};
