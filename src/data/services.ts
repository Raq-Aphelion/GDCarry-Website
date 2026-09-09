/**
 * Service catalog + subpage database layer.
 *
 * The catalog lives in per-service JSON files under `public/db/` (served at
 * `db/`):
 * - `services/<gameId>/index.json` — the manifest: game card meta plus
 *   subcategories mapping to service id lists (array order = display order).
 * - `services/<gameId>/shared-sections.json` — shared accordion sections that
 *   subpage accordions reference via `{ "ref": "<slug>" }`.
 * - `services/<gameId>/<serviceId>.json` — one service per file:
 *   `{ game, subcategory, service, subpage? }` (subpage reward icons are
 *   kebab-case names resolved through ./iconMap.ts).
 *
 * Byte-identical copies are bundled under ./bundled/ as the fallback when the
 * database cannot be reached; scripts/validate-services.mjs (part of
 * `npm run build`) machine-checks the layout and keeps the copies honest.
 * Staff add/remove services with `npm run add:service` / `remove:service`; to
 * add a game, drop its directory into both places and extend GAME_IDS.
 */

import type { Game, Service } from '@/data/games';

/** A services/<gameId>/index.json file — game meta plus subcategory ->
    service id lists (the Game shape with service ids in place of services,
    and without the synthetic 'all' subcategory). */
export interface GameIndexData {
  game: Omit<Game, 'subcategories'>;
  subcategories: { id: string; name: string; proxies?: string[]; services: string[] }[];
}

/** A services/<gameId>.json-equivalent assembled catalog — the Game shape
    minus the synthetic 'all' subcategory. */
export type GameCatalog = Game;

/** Raw reward row in a subpage — ServicePageReward with the icon as a
    kebab-case ICON_MAP name instead of the component. */
export interface ServicePageRewardData {
  icon: string;
  title: string;
  text?: string;
  link?: { label: string; href: string };
  group?: string;
  items?: string[];
  dutyButton?: { label: string; to: string };
}

export interface ServicePageAccordionItemData {
  text: string;
  link?: { label: string; href: string };
  dash?: boolean;
  plain?: boolean;
  muted?: boolean;
}

export interface ServicePageAccordionSectionData {
  title: string;
  items?: (string | ServicePageAccordionItemData)[];
  groups?: { heading: string; items: (string | ServicePageAccordionItemData)[] }[];
}

/** Accordion entry in the JSON: an inline section or a shared-section ref. */
export type ServicePageAccordionEntry = ServicePageAccordionSectionData | { ref: string };

export interface ServicePageData {
  short: string;
  rewardsHeading?: string;
  gallery?: string[];
  rewards: ServicePageRewardData[];
  accordion: ServicePageAccordionEntry[];
}

/** A services/<gameId>/<serviceId>.json file. */
export interface ServiceFileData {
  game: string;
  subcategory: string;
  service: Service;
  subpage?: ServicePageData;
}

/** Assembled subpage content across all games: the merged shared-section
    maps plus the per-service pages (service ids are globally unique). */
export interface ServicePagesDb {
  shared: Record<string, ServicePageAccordionSectionData>;
  pages: Record<string, ServicePageData>;
}

export interface ServicesDb {
  games: GameCatalog[];
  pages: ServicePagesDb;
}

/** Games with a database directory, in display order. */
export const GAME_IDS = ['ffxiv', 'wow', 'lost-ark', 'warframe', 'runescape'] as const;

/** Manifest id with no service file: bundled data throws (authoring error —
    the validator catches it at build time); fetched data skips the service,
    so a broken new file degrades only itself. */
type MissingService = (gameId: string, serviceId: string) => void;

/**
 * Assemble a game catalog + its subpages from a manifest and its service
 * files. A file whose `game`/`subcategory` contradicts its folder/manifest
 * placement is an authoring error and throws (also validator-checked).
 */
function assembleGame(
  gameId: string,
  index: GameIndexData,
  files: ReadonlyMap<string, ServiceFileData>,
  onMissing: MissingService,
): { catalog: GameCatalog; pages: Record<string, ServicePageData> } {
  const pages: Record<string, ServicePageData> = {};
  const catalog: GameCatalog = {
    ...index.game,
    subcategories: index.subcategories.flatMap((sub) => {
      const services: Service[] = [];
      for (const id of sub.services) {
        const file = files.get(id);
        if (!file) {
          onMissing(gameId, id);
          continue;
        }
        if (file.game !== gameId || file.subcategory !== sub.id) {
          throw new Error(
            `services/${gameId}/${id}.json: declares game "${file.game}" / subcategory "${file.subcategory}", expected "${gameId}" / "${sub.id}"`,
          );
        }
        services.push(file.service);
        if (file.subpage) pages[id] = file.subpage;
      }
      return [{ id: sub.id, name: sub.name, proxies: sub.proxies, services }];
    }),
  };
  return { catalog, pages };
}

/* --- Bundled fallback (src/data/bundled/services/, mirrored layout) -------- */

interface BundledGame {
  index?: GameIndexData;
  shared: Record<string, ServicePageAccordionSectionData>;
  files: Map<string, ServiceFileData>;
}

const bundledModules = import.meta.glob('./bundled/services/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const bundledByGame = new Map<string, BundledGame>();
for (const [path, data] of Object.entries(bundledModules)) {
  const m = /^\.\/bundled\/services\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (!m) continue;
  const [, gameId, name] = m;
  let entry = bundledByGame.get(gameId);
  if (!entry) bundledByGame.set(gameId, (entry = { shared: {}, files: new Map() }));
  if (name === 'index') entry.index = data as GameIndexData;
  else if (name === 'shared-sections') entry.shared = data as BundledGame['shared'];
  else entry.files.set(name, data as ServiceFileData);
}

const throwMissing: MissingService = (gameId, serviceId) => {
  throw new Error(`bundled services/${gameId}/index.json lists "${serviceId}" but ${serviceId}.json is missing`);
};

function assembleBundledGame(gameId: string): {
  catalog: GameCatalog;
  pages: Record<string, ServicePageData>;
  shared: Record<string, ServicePageAccordionSectionData>;
} {
  const bundled = bundledByGame.get(gameId);
  if (!bundled?.index) throw new Error(`bundled services/${gameId}/index.json is missing`);
  return { ...assembleGame(gameId, bundled.index, bundled.files, throwMissing), shared: bundled.shared };
}

function assembleBundled(): ServicesDb {
  const games: GameCatalog[] = [];
  const shared: ServicePagesDb['shared'] = {};
  const pages: ServicePagesDb['pages'] = {};
  for (const gameId of GAME_IDS) {
    const assembled = assembleBundledGame(gameId);
    games.push(assembled.catalog);
    Object.assign(shared, assembled.shared);
    Object.assign(pages, assembled.pages);
  }
  return { games, pages: { shared, pages } };
}

const BUNDLED = assembleBundled();

/** Bundled fallback copies (src/data/bundled/) — the catalog at module init,
    and the per-file fallback when a fetch fails. */
export const BUNDLED_GAMES: GameCatalog[] = BUNDLED.games;
export const BUNDLED_SERVICE_PAGES: ServicePagesDb = BUNDLED.pages;

/** Fetch the service database (manifests + shared sections + one file per
    service), falling back to the bundled copy of any file that fails. A
    service with no bundled copy is skipped, so a broken new file degrades
    only itself. Same base-URL handling and cache policy as loadPricing. */
export async function loadServices(): Promise<ServicesDb> {
  const base = import.meta.env.BASE_URL;
  const fetchJson = async <T>(rel: string): Promise<T | null> => {
    try {
      const res = await fetch(`${base}${rel}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };
  const loaded = await Promise.all(
    GAME_IDS.map(async (gameId) => {
      const index = await fetchJson<GameIndexData>(`db/services/${gameId}/index.json`);
      if (!index) return assembleBundledGame(gameId);
      const shared = await fetchJson<ServicePagesDb['shared']>(`db/services/${gameId}/shared-sections.json`);
      const bundled = bundledByGame.get(gameId);
      const ids = [...new Set(index.subcategories.flatMap((s) => s.services))];
      const files = new Map<string, ServiceFileData>();
      await Promise.all(
        ids.map(async (id) => {
          const file =
            (await fetchJson<ServiceFileData>(`db/services/${gameId}/${id}.json`)) ?? bundled?.files.get(id);
          if (file) files.set(id, file);
          else console.warn(`[services] db/services/${gameId}/${id}.json failed to load and has no bundled copy — skipped`);
        }),
      );
      const skipMissing: MissingService = () => {};
      return { ...assembleGame(gameId, index, files, skipMissing), shared: shared ?? bundled?.shared ?? {} };
    }),
  );
  const games: GameCatalog[] = [];
  const shared: ServicePagesDb['shared'] = {};
  const pages: ServicePagesDb['pages'] = {};
  for (const l of loaded) {
    games.push(l.catalog);
    Object.assign(shared, l.shared);
    Object.assign(pages, l.pages);
  }
  return { games, pages: { shared, pages } };
}
