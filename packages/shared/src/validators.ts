import type { PlanExtract, SpeedTier } from "./types";

const SPEED_MAP: Record<string, SpeedTier> = {
  'nbn 12': 12,
  'nbn 25': 25,
  'nbn 50': 50,
  'nbn 100': 100,
  'nbn 250': 250,
  'nbn 500': 500,
  'nbn 1000': 1000,
  'standard': 12,
  'standard plus': 100,
  'superfast': 250,
};

export function parsePriceToCents(text: string | null | undefined): number | null {
  if (!text) return null;
  const clean = text.replace(/[ ,]/g, "");
  const m = clean.match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  if (!isFinite(val)) return null;
  return Math.round(val * 100);
}

export function parseDurationToDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(month|months)/i);
  if (!m) return null;
  return parseInt(m[1]) * 30;
}

export function normalizeSpeed(text: string | number | null | undefined): SpeedTier | null {
  if (!text) return null;
  if (typeof text === 'number') {
    const n = text as number;
    if ([12,25,50,100,250,500,1000].includes(n)) return n as SpeedTier;
    return null;
  }
  const s = String(text).trim().toLowerCase();
  const exact = s.match(/(\d{1,4})/);
  if (exact) {
    const n = parseInt(exact[1]);
    if ([12,25,50,100,250,500,1000].includes(n)) return n as SpeedTier;
  }
  for (const key of Object.keys(SPEED_MAP)) {
    if (s.includes(key)) return SPEED_MAP[key];
  }
  return null;
}

export function validatePlan(p: PlanExtract) {
  const errors: string[] = [];
  // price plausibility check
  if (p.ongoingPriceCents !== null) {
    if (p.ongoingPriceCents < 3000 || p.ongoingPriceCents > 20000) {
      // allow as maybe intro price, but flag
      errors.push(`ongoing_price_cents ${p.ongoingPriceCents} out of plausible range`);
    }
  }
  // speed must map to known tiers
  if (p.speedTier !== null) {
    if (![12,25,50,100,250,500,1000].includes(p.speedTier)) errors.push(`unknown speed tier ${p.speedTier}`);
  }
  // if intro exists, ongoing should exist too
  if (p.introPriceCents !== null && p.ongoingPriceCents === null) errors.push("intro price present but ongoing price missing");

  return { ok: errors.length === 0, errors };
}

export function normalizeExtract(ex: PlanExtract): PlanExtract {
  return {
    ...ex,
    introPriceCents: typeof ex.introPriceCents === 'number' ? ex.introPriceCents : parsePriceToCents(String(ex.introPriceCents)) ?? null,
    ongoingPriceCents: typeof ex.ongoingPriceCents === 'number' ? ex.ongoingPriceCents : parsePriceToCents(String(ex.ongoingPriceCents)) ?? null,
    speedTier: normalizeSpeed(ex.speedTier),
    introDurationDays: typeof ex.introDurationDays === 'number' ? ex.introDurationDays : parseDurationToDays(String(ex.introDurationDays)) ?? null,
  };
}
