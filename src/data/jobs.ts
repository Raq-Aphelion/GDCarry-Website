import { Axe, Crosshair, Hammer, HeartPulse, Shield, Sparkles, Swords, type LucideIcon } from 'lucide-react';

/** A job role group: renders as a divider header in job dropdowns. */
export interface JobGroup {
  label: string;
  icon: LucideIcon;
  jobs: string[];
}

/** Split 'Set of Fending (PLD, WAR)' into main + parenthesized accent part. */
export const splitParens = (s: string): [string, string?] => {
  const i = s.indexOf(' (');
  return i < 0 ? [s] : [s.slice(0, i), s.slice(i)];
};

/** Combat jobs grouped by role (job-leveling and MSQ dropdowns). */
export const JOB_GROUPS: JobGroup[] = [
  { label: 'Tanks', icon: Shield, jobs: ['Paladin (PLD)', 'Warrior (WAR)', 'Dark Knight (DRK)', 'Gunbreaker (GNB)'] },
  { label: 'Healers', icon: HeartPulse, jobs: ['White Mage (WHM)', 'Scholar (SCH)', 'Astrologian (AST)', 'Sage (SGE)'] },
  { label: 'Melee DPS', icon: Swords, jobs: ['Monk (MNK)', 'Dragoon (DRG)', 'Ninja (NIN)', 'Samurai (SAM)', 'Reaper (RPR)', 'Viper (VPR)'] },
  { label: 'Ranged DPS', icon: Crosshair, jobs: ['Bard (BRD)', 'Machinist (MCH)', 'Dancer (DNC)'] },
  { label: 'Ranged Magical DPS', icon: Sparkles, jobs: ['Black Mage (BLM)', 'Summoner (SMN)', 'Red Mage (RDM)', 'Pictomancer (PCT)'] },
];

/** Disciples of the Hand & Land — the crafter/gatherer leveling job groups. */
export const CRAFTER_JOB_GROUPS: JobGroup[] = [
  {
    label: 'Crafters',
    icon: Hammer,
    jobs: [
      'Carpenter (CRP)',
      'Blacksmith (BSM)',
      'Armorer (ARM)',
      'Goldsmith (GSM)',
      'Leatherworker (LTW)',
      'Weaver (WVR)',
      'Alchemist (ALC)',
      'Culinarian (CUL)',
    ],
  },
  { label: 'Gatherers', icon: Axe, jobs: ['Miner (MIN)', 'Botanist (BTN)', 'Fisher (FSH)'] },
];

/** Expansion each combat job was released in — relic weapons only exist for
    jobs up to their series' expansion (e.g. no Viper/Pictomancer Manderville). */
export type JobEra = 'arr' | 'hw' | 'stb' | 'shb' | 'ew' | 'dt';
const JOB_ERA: Record<string, JobEra> = {
  'Paladin (PLD)': 'arr',
  'Warrior (WAR)': 'arr',
  'White Mage (WHM)': 'arr',
  'Scholar (SCH)': 'arr',
  'Monk (MNK)': 'arr',
  'Dragoon (DRG)': 'arr',
  'Ninja (NIN)': 'arr',
  'Bard (BRD)': 'arr',
  'Black Mage (BLM)': 'arr',
  'Summoner (SMN)': 'arr',
  'Dark Knight (DRK)': 'hw',
  'Astrologian (AST)': 'hw',
  'Machinist (MCH)': 'hw',
  'Samurai (SAM)': 'stb',
  'Red Mage (RDM)': 'stb',
  'Gunbreaker (GNB)': 'shb',
  'Dancer (DNC)': 'shb',
  'Reaper (RPR)': 'ew',
  'Sage (SGE)': 'ew',
  'Viper (VPR)': 'dt',
  'Pictomancer (PCT)': 'dt',
};
const ERA_ORDER: JobEra[] = ['arr', 'hw', 'stb', 'shb', 'ew', 'dt'];

/** JOB_GROUPS trimmed to jobs released up to (and including) `era`. */
export const jobGroupsUpTo = (era: JobEra): JobGroup[] => {
  const max = ERA_ORDER.indexOf(era);
  return JOB_GROUPS.map((g) => ({
    ...g,
    jobs: g.jobs.filter((j) => ERA_ORDER.indexOf(JOB_ERA[j] ?? 'dt') <= max),
  })).filter((g) => g.jobs.length > 0);
};

/** Eurekan Elemental Armour sets grouped by role — the parenthesized job
    abbreviations render in blue in the dropdown. */
export const ARMOUR_GROUPS: JobGroup[] = [
  { label: 'Tanks', icon: Shield, jobs: ['Set of Fending (PLD, WAR, DRK, GNB)'] },
  { label: 'Healers', icon: HeartPulse, jobs: ['Set of Healing (WHM, SCH, AST, SGE)'] },
  {
    label: 'Melee DPS',
    icon: Swords,
    jobs: ['Set of Maiming (DRG, RPR)', 'Set of Striking (MNK, SAM, BST)', 'Set of Scouting (NIN, VPR)'],
  },
  { label: 'Ranged DPS', icon: Crosshair, jobs: ['Set of Aiming (BRD, MCH, DNC)'] },
  { label: 'Ranged Magical DPS', icon: Sparkles, jobs: ['Set of Casting (BLM, SMN, RDM, BLU, PCT)'] },
];
