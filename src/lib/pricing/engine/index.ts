/* Pricing engine entry point. The site imports family modules directly; the
   orders worker uses computeLine() to recompute every order line
   authoritatively from its config. Configs arrive from the client and are
   untrusted — family computes validate and return null on anything
   malformed. */
import type { PricingDb } from '../../../data/pricing.ts';
import type { LinePrice } from './shared.ts';
import { computeRunLine } from './run.ts';
import { computeLevelingLine } from './leveling.ts';
import { computeGilLine } from './gil.ts';
import { computeDeepDungeonLine } from './deepdungeon.ts';
import { computeSavageSeriesLine } from './savageseries.ts';
import { computeRelicLine } from './relic.ts';
import { computeMsqLine } from './msq.ts';
import { computeCCRankLine } from './ccrank.ts';
import { computeWolfMarksLine } from './wolfmarks.ts';
import { computeWingLine } from './wing.ts';
import { computeSavageMountLine } from './savagemount.ts';
import { computeMountSeriesLine } from './mountseries.ts';
import { computeTrialLine } from './trial.ts';
import { computeTrialBundleLine } from './trialbundle.ts';
import { computeCriterionLine } from './criterion.ts';
import { computeReputationLine } from './reputation.ts';

export * from './shared.ts';
export * from './run.ts';
export * from './leveling.ts';
export * from './gil.ts';
export * from './deepdungeon.ts';
export * from './savageseries.ts';
export * from './relic.ts';
export * from './msq.ts';
export * from './ccrank.ts';
export * from './wolfmarks.ts';
export * from './wing.ts';
export * from './savagemount.ts';
export * from './mountseries.ts';
export * from './trial.ts';
export * from './trialbundle.ts';
export * from './criterion.ts';
export * from './reputation.ts';

/** Cart-item config as serialized for the order payload. Family modules
    export their precise config types; this is the transport-level shape. */
export type OrderConfig = { family: string } & { [k: string]: unknown };

/** Authoritative price parts for one configured line. staticBase is the
    site's bundled fallback price (only the site has it; the worker passes
    nothing and simply can't recompute static-only services — it fails open).
    Returns null when the family is unknown or the config is malformed. */
type FamilyCompute = (
  db: PricingDb,
  serviceId: string,
  cfg: never,
  staticBase?: number,
) => (LinePrice & { qty: number }) | null;

const FAMILIES: Record<string, FamilyCompute> = {
  run: computeRunLine,
  leveling: computeLevelingLine,
  gil: computeGilLine,
  deepdungeon: computeDeepDungeonLine,
  savageseries: computeSavageSeriesLine,
  relic: computeRelicLine,
  msq: computeMsqLine,
  ccrank: computeCCRankLine,
  wolfmarks: computeWolfMarksLine,
  wing: computeWingLine,
  savagemount: computeSavageMountLine,
  mountseries: computeMountSeriesLine,
  trial: computeTrialLine,
  trialbundle: computeTrialBundleLine,
  criterion: computeCriterionLine,
  reputation: computeReputationLine,
};

export const computeLine = (
  db: PricingDb,
  serviceId: string,
  config: OrderConfig,
  staticBase?: number,
): (LinePrice & { qty: number }) | null =>
  FAMILIES[config?.family]?.(db, serviceId, config as never, staticBase) ?? null;
