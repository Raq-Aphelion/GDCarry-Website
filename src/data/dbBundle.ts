/**
 * Single-request database bundle (db/bundle.json).
 *
 * The db/ JSONs stay as separate per-service / per-category files for
 * editing (public/db/…); the db-bundle Vite plugin (vite.config.ts) compiles
 * them into this one file at build time — the client then needs a single
 * request instead of ~150 individual JSON fetches, which tripped CDN rate
 * limiting. loadServices()/loadPricing() try the bundle first and fall back
 * to the individual files when it is missing (older deploys).
 */

import type { PricingDb } from './pricing';
import type { GameIndexData, ServiceFileData, ServicePagesDb } from './services';

export interface DbBundle {
  pricing: {
    global: PricingDb;
    /** Keyed by CATEGORY_FILES entry (e.g. 'pricing/ffxiv/Trials') */
    categories: Record<string, Partial<PricingDb>>;
  };
  services: Record<
    string,
    {
      index: GameIndexData;
      shared?: ServicePagesDb['shared'];
      /** Service files keyed by service id */
      files: Record<string, ServiceFileData>;
    }
  >;
}

let cached: Promise<DbBundle | null> | null = null;

/** Fetch the bundle once per session; concurrent callers share the request.
    null when the bundle is missing/unreachable — callers fall back to the
    individual files. */
export function loadDbBundle(): Promise<DbBundle | null> {
  cached ??= (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}db/bundle.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      return (await res.json()) as DbBundle;
    } catch {
      return null;
    }
  })();
  return cached;
}
