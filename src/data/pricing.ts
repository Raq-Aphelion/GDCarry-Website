/**
 * Pricing database layer.
 *
 * All prices and multipliers live in the editable JSON database at
 * `public/db/pricing.json` (served at `db/pricing.json`). The app loads it at
 * startup; the defaults below are only a fallback if the database cannot be
 * reached. To change any price or multiplier, edit the JSON file — no rebuild
 * is required.
 */

export interface PricingOption {
  label: string;
  price: number;
}

export interface PricingAddon {
  id: string;
  label: string;
  price: number;
}

export interface PricingDb {
  currency: {
    /** Conversion multiplier: 1 EUR = usdPerEur USD */
    usdPerEur: number;
  };
  purchaseBox: {
    /** Flat EUR discount applied to the AFK Carry method */
    afkDiscount: number;
    runsMin: number;
    runsMax: number;
    /** Total multiplier when the Priority add-on is selected */
    priorityMultiplier: number;
    gearOptions: PricingOption[];
    logOptions: PricingOption[];
    addons: PricingAddon[];
  };
  /** Service id -> base price in EUR (overrides the bundled fallback) */
  servicePrices: Record<string, number>;
}

/** Bundled fallback, used only if the JSON database cannot be loaded. */
export const DEFAULT_PRICING: PricingDb = {
  currency: { usdPerEur: 1.15 },
  purchaseBox: {
    afkDiscount: 40,
    runsMin: 1,
    runsMax: 10,
    priorityMultiplier: 2,
    gearOptions: [
      { label: "I don't need extra gear", price: 0 },
      { label: 'Full BiS-ready set', price: 79.99 },
    ],
    logOptions: [
      { label: "I don't want a parse", price: 0 },
      { label: 'FFXIV Logs parse included', price: 14.99 },
    ],
    addons: [
      { id: 'totem', label: 'Extra Totem', price: 39.99 },
      { id: 'stream', label: 'Private Stream', price: 10.0 },
      { id: 'priority', label: 'Priority', price: 0 },
    ],
  },
  servicePrices: {},
};

/** Fetch the pricing database, falling back to the bundled defaults. */
export async function loadPricing(): Promise<PricingDb> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}db/pricing.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const db = (await res.json()) as PricingDb;
    return {
      currency: { ...DEFAULT_PRICING.currency, ...db.currency },
      purchaseBox: { ...DEFAULT_PRICING.purchaseBox, ...db.purchaseBox },
      servicePrices: db.servicePrices ?? {},
    };
  } catch {
    return DEFAULT_PRICING;
  }
}
