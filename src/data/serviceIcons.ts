import { Coins, Gamepad2, Globe, ShieldCheck, Swords, Trophy, type LucideIcon } from 'lucide-react';

/** Per-service tag icons — [tag1, tag2, tag3] — used on the service subpage
    pill row and on service cards (falling back to the default diamonds/icons
    when a service has no entry). */
export const SERVICE_TAG_ICONS: Record<string, [LucideIcon, LucideIcon, LucideIcon]> = {
  'ffxiv-gil-pack': [Coins, ShieldCheck, Globe],
  'ffxiv-dsr': [Swords, Trophy, Gamepad2],
  'ffxiv-ucob': [Swords, Trophy, Gamepad2],
  'ffxiv-uwu': [Swords, Trophy, Gamepad2],
  'ffxiv-tea': [Swords, Trophy, Gamepad2],
  'ffxiv-top': [Swords, Trophy, Gamepad2],
  'ffxiv-fru': [Swords, Trophy, Gamepad2],
  'ffxiv-udm': [Swords, Trophy, Gamepad2],
  'ffxiv-ultimate-bundle': [Swords, Trophy, Gamepad2],
};
