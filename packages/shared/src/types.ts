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
  uploadSpeedMbps?: number | null; // Upload speed for high-tier plans (e.g., 2000/200)
  dataAllowance?: string | null; // "Unlimited", "1TB", "500GB", etc.
  contractMonths?: number | null; // 0 = month-to-month, 12, 24, etc.
  contractType?: string | null; // "month-to-month", "12-month", "24-month", etc.
  modemIncluded?: boolean | null; // true if modem/router included in plan
  introPriceCents: number | null;
  introDurationDays: number | null; // normalized to days
  ongoingPriceCents: number | null;
  minTermDays: number | null;
  setupFeeCents: number | null;
  modemCostCents: number | null;
  promoCode?: string | null;
  promoDescription?: string | null;
  promoExpiresAt?: string | null; // ISO date when promo ends, e.g. "2026-06-30"
  conditionsText: string | null;
  typicalEveningSpeedMbps: number | null;
  sourceUrl: string;
  technologyType?: 'standard' | 'fixed-wireless' | '5g-home' | 'satellite';
  planType?: 'residential' | 'business'; // Business plans typically have SLAs, static IPs, priority support
  serviceType?: 'nbn' | '5g-home' | 'satellite';
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
