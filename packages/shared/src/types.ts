export type SpeedTier = 12 | 25 | 50 | 100 | 200 | 250 | 400 | 500 | 1000 | 2000;

export interface ProviderSeed {
  slug: string;
  name: string;
  canonicalUrl: string;
}

export interface PlanExtract {
  providerSlug: string;
  planName: string;
  speedTier: SpeedTier | null;
  introPriceCents: number | null;
  introDurationDays: number | null; // normalized to days
  ongoingPriceCents: number | null;
  minTermDays: number | null;
  setupFeeCents: number | null;
  modemCostCents: number | null;
  conditionsText: string | null;
  typicalEveningSpeedMbps: number | null;
  sourceUrl: string;
}

export interface ProviderRow {
  id: number;
  slug: string;
  name: string;
  canonical_url: string;
  active?: boolean;
  last_fetch_at?: string | null;
  last_hash?: string | null;
  last_error?: string | null;
  needs_review?: boolean;
  created_at?: string;
  updated_at?: string;
}
