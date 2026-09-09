import type { LucideIcon } from 'lucide-react';
import { ICON_MAP } from '@/data/iconMap';
import { BUNDLED_SERVICE_PAGES, type ServicePagesDb } from '@/data/services';

export interface ServicePageReward {
  icon: LucideIcon;
  title: string;
  text?: string;
  /** Trailing external hyperlink after `text` (e.g. the Fantasia store link) */
  link?: { label: string; href: string };
  /** Optional group heading rendered above this row when the group changes
      (account listings render as spec sheets: Character / Jobs / …) */
  group?: string;
  /** Replaces `text`: mount names rendered as buttons (future mount links) */
  items?: string[];
  /** Duty name rendered as a linked button under the title (mount drop sources) */
  dutyButton?: { label: string; to: string };
}

export interface ServicePageAccordionItem {
  text: string;
  /** Optional leading hyperlink rendered before the text (external) */
  link?: { label: string; href: string };
  /** Render as a plain dash line instead of the diamond pointer */
  dash?: boolean;
  /** Render with no marker at all */
  plain?: boolean;
  /** Darker text colour (slate-500) */
  muted?: boolean;
}

export interface ServicePageAccordionSection {
  title: string;
  items?: (string | ServicePageAccordionItem)[];
  groups?: { heading: string; items: (string | ServicePageAccordionItem)[] }[];
}

export interface ServicePageContent {
  /** Short label used as the last breadcrumb segment, e.g. 'DSR' */
  short: string;
  /** Section heading above the rewards — defaults to "Duty's Rewards" */
  rewardsHeading?: string;
  /** Subpage image gallery (account listings): main shot + a thumbnail per
      image, so the strip grows with the list */
  gallery?: string[];
  rewards: ServicePageReward[];
  accordion: ServicePageAccordionSection[];
}

/** Dedicated subpage content per service. Any service id present here gets a
    /boosting/ffxiv/<id> subpage; everything else links to its category page.
    Populated from the service-pages JSON — bundled copy at module init,
    fetched database swapped in by PricingProvider before first render. */
export const SERVICE_PAGES: Record<string, ServicePageContent> = {};

/**
 * Resolve a service-pages database into SERVICE_PAGES (in place, so imported
 * references stay valid): kebab-case reward icons become their ICON_MAP
 * components and `{ref}` accordion markers become deep copies of the shared
 * sections. Unknown icon names and refs throw — they are authoring errors,
 * also machine-checked by scripts/validate-services.mjs.
 */
export function applyServicePages(db: ServicePagesDb): void {
  const pages: Record<string, ServicePageContent> = {};
  for (const [id, page] of Object.entries(db.pages)) {
    pages[id] = {
      short: page.short,
      rewardsHeading: page.rewardsHeading,
      gallery: page.gallery ? [...page.gallery] : undefined,
      rewards: page.rewards.map((r) => {
        const icon = ICON_MAP[r.icon];
        if (!icon) throw new Error(`service-pages: unknown icon "${r.icon}" on ${id}`);
        return { ...r, icon };
      }),
      accordion: page.accordion.map((entry) => {
        if ('ref' in entry) {
          const shared = db.shared[entry.ref];
          if (!shared) throw new Error(`service-pages: unknown accordion ref "${entry.ref}" on ${id}`);
          return structuredClone(shared);
        }
        return structuredClone(entry);
      }),
    };
  }
  for (const key of Object.keys(SERVICE_PAGES)) delete SERVICE_PAGES[key];
  Object.assign(SERVICE_PAGES, pages);
}
applyServicePages(BUNDLED_SERVICE_PAGES);

/** Mount buttons in the savage subpage reward blocks → their mount services. */
export const MOUNT_LINKS: Record<string, string> = {
  '(M4S) Monowheel S1': 'ffxiv-monowheel-s1',
  '(M8S) Air-wheeler C9': 'ffxiv-air-wheeler-c9',
  '(M12S) Lowrider T1RANT': 'ffxiv-lowrider-t1rant',
  '(P4S) Demi-Phoinix': 'ffxiv-demi-phoinix',
  '(P8S) Sunforged': 'ffxiv-sunforged',
  '(P12S) Megaloambystoma': 'ffxiv-megaloambystoma',
  '(E4S) Skyslipper': 'ffxiv-skyslipper',
  '(E8S) Ramuh': 'ffxiv-ramuh',
  '(E12S) Eden': 'ffxiv-eden-mount',
  '(O4S) Alte Roite': 'ffxiv-alte-roite',
  '(O8S) Air Force': 'ffxiv-air-force',
  '(O12S) Model O': 'ffxiv-model-o',
  '(A4S) Gobwalker': 'ffxiv-gobwalker',
  '(A12S) Arrhidaeus': 'ffxiv-arrhidaeus',
  'Dais of Darkness': 'ffxiv-dais-of-darkness-mount',
  'Shroud of Darkness': 'ffxiv-shroud-of-darkness-mount',
  'Juedi': 'ffxiv-juedi-mount',
  'Aeturna': 'ffxiv-aeturna-mount',
  'Genie of the Lamp': 'ffxiv-genie-of-the-lamp-mount',
  'Royal Magicked Carpet': 'ffxiv-royal-magicked-carpet-mount',
  'Quaqua': 'ffxiv-quaqua-mount',
  'Spectral Statice': 'ffxiv-spectral-statice-mount',
  'Shishioji': 'ffxiv-shishioji-mount',
  'Burabura Chochin': 'ffxiv-burabura-chochin-mount',
  "Sil'dihn Throne": 'ffxiv-sildihn-throne-mount',
  'Silkie': 'ffxiv-silkie-mount',
  'Cerberus': 'ffxiv-cerberus-mount',
  'Demi-Ozma': 'ffxiv-demi-ozma',
  'Demon Haul': 'ffxiv-demon-haul',
  'Duck-billed Porter': 'ffxiv-duck-billed-porter-mount',
  'High Mobility Vacuum Suit': 'ffxiv-vacuum-suit-mount',
};

export function getServicePage(id?: string) {
  return id ? SERVICE_PAGES[id] : undefined;
}
