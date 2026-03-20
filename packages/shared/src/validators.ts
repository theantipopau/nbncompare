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

const MONTH_NAMES: Record<string, number> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
  april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
  august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12,
};

/**
 * Extracts a promo/offer expiry date from free text.
 * Handles patterns like:
 *   "offer ends 31 March 2026", "expires 30/06/2026", "valid until March 31, 2026",
 *   "Ends 30 Jun 26", "until 31-03-2026"
 * Returns ISO date string "YYYY-MM-DD" or null if not found.
 */
export function extractPromoExpiry(text: string | null | undefined): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ');

  // Keyword triggers: ends/expires/valid until/offer ends
  const triggerRe = /(?:offer\s+ends?|expires?|valid\s+(?:till|until)|ends?\s+on|until|till)\s+/i;

  // Pattern A: trigger + day + month-name + year  ("ends 31 March 2026" / "ends 31st Mar 26")
  const patternA = new RegExp(
    triggerRe.source +
    '(\\d{1,2})(?:st|nd|rd|th)?\\s+([a-z]{3,9})\\s+(\\d{2,4})',
    'i'
  );
  // Pattern B: trigger + month-name + day + year  ("until March 31, 2026")
  const patternB = new RegExp(
    triggerRe.source +
    '([a-z]{3,9})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{2,4})',
    'i'
  );
  // Pattern C: trigger + numeric date  ("expires 30/06/2026" / "until 30-03-26" / "until 30.06.26")
  const patternC = new RegExp(
    triggerRe.source +
    '(\\d{1,2})[\\-/.](\\d{1,2})[\\-/.](\\d{2,4})',
    'i'
  );

  function toISO(day: number, month: number, year: number): string | null {
    const y = year < 100 ? 2000 + year : year;
    if (month < 1 || month > 12 || day < 1 || day > 31 || y < 2020 || y > 2035) return null;
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  let m: RegExpMatchArray | null;

  m = clean.match(patternA);
  if (m) {
    const monthNum = MONTH_NAMES[m[2].toLowerCase()];
    if (monthNum) return toISO(parseInt(m[1]), monthNum, parseInt(m[3]));
  }

  m = clean.match(patternB);
  if (m) {
    const monthNum = MONTH_NAMES[m[1].toLowerCase()];
    if (monthNum) return toISO(parseInt(m[2]), monthNum, parseInt(m[3]));
  }

  m = clean.match(patternC);
  if (m) {
    // Numeric: assume DD/MM/YYYY (Australian convention)
    return toISO(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  }

  return null;
}

export function parseDurationToDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(month|months)/i);
  if (!m) return null;
  return parseInt(m[1]) * 30;
}

export function extractPromoFromText(text: string | null | undefined): { promoCode: string | null; promoDescription: string | null } {
  if (!text) return { promoCode: null, promoDescription: null };
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { promoCode: null, promoDescription: null };

  const codeMatch = clean.match(/\b(?:promo\s*code|code|use\s*code)\s*[:-]?\s*([A-Z0-9]{4,12})\b/i);
  const discountMatch = clean.match(/\$\s*\d+(?:\.\d{1,2})?\s*(?:off|discount|credit)/i) ||
    clean.match(/\b(save|saving)\s*\$?\d+(?:\.\d{1,2})?\b/i);
  const freeMatch = clean.match(/\bfree\s*(modem|setup|installation|activation|connection)\b/i);
  const durationMatch = clean.match(/\b(\d+)\s*(month|months|mo)\b/i);

  const parts: string[] = [];
  if (discountMatch) parts.push(discountMatch[0]);
  if (freeMatch) parts.push(freeMatch[0]);
  if (durationMatch) parts.push(`for ${durationMatch[1]} months`);

  const promoDescription = parts.length > 0 ? parts.join("; ") : null;
  const promoCode = codeMatch ? codeMatch[1].toUpperCase() : null;

  return { promoCode, promoDescription };
}

function extractIntroFromText(text: string | null | undefined): { introPriceCents: number | null; introDurationDays: number | null } {
  if (!text) return { introPriceCents: null, introDurationDays: null };
  const clean = text.replace(/\s+/g, " ");
  const match = clean.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/mo|\/month|per\s*month|pm)?\s*(?:for|first)\s*(\d{1,2})\s*(?:months|month|mo)/i);
  if (!match) return { introPriceCents: null, introDurationDays: null };
  const introPriceCents = Math.round(parseFloat(match[1]) * 100);
  const introDurationDays = parseInt(match[2], 10) * 30;
  return {
    introPriceCents: introPriceCents >= 2000 ? introPriceCents : null,
    introDurationDays,
  };
}

export function normalizeSpeed(text: string | number | null | undefined): SpeedTier | null {
  if (!text) return null;
  if (typeof text === 'number') {
    const n = text as number;
    if ([12,25,50,100,200,250,400,500,1000,2000].includes(n)) return n as SpeedTier;
    return null;
  }
  const s = String(text).trim().toLowerCase();
  const exact = s.match(/(\d{1,4})/);
  if (exact) {
    const n = parseInt(exact[1]);
    if ([12,25,50,100,200,250,400,500,1000,2000].includes(n)) return n as SpeedTier;
  }
  for (const key of Object.keys(SPEED_MAP)) {
    if (s.includes(key)) return SPEED_MAP[key];
  }
  return null;
}

export function validatePlan(p: PlanExtract) {
  const errors: string[] = [];
  const warnings: string[] = [];

  const planName = (p.planName || '').trim();
  const sourceUrl = (p.sourceUrl || '').trim();

  // Hard rejects: things that are almost certainly garbage and should not be stored.
  if (!planName) errors.push('missing plan name');
  if (planName.length > 120) errors.push(`plan name too long (${planName.length})`);
  if (!p.speedTier) errors.push('missing speed tier');
  if (!sourceUrl) errors.push('missing source url');

  const price = p.ongoingPriceCents ?? p.introPriceCents;
  if (price === null) {
    errors.push('missing price');
  } else {
    // $1/day / promo fragments frequently get mis-parsed as plan prices
    if (price < 2000) errors.push(`price too low (${price})`);
    // $500+/month is unrealistic for residential NBN — likely a parse error (e.g., page title mis-parsed)
    if (price > 50000) errors.push(`price absurdly high (${price}) — likely parse error`);
  }

  // Reject common marketing/FAQ paragraphs accidentally captured as plan names.
  if (planName.length > 50 && /(what is|about|want to|download|stream|in a world of|plan to rule them all)/i.test(planName)) {
    errors.push('plan name looks like marketing copy');
  }

  // Soft plausibility checks (warnings only)
  if (p.ongoingPriceCents !== null) {
    if (p.ongoingPriceCents < 3000) warnings.push(`ongoing_price_cents ${p.ongoingPriceCents} unusually low`);
    if (p.ongoingPriceCents > 30000) warnings.push(`ongoing_price_cents ${p.ongoingPriceCents} unusually high`);
  }

  if (p.introPriceCents !== null && p.ongoingPriceCents !== null) {
    if (p.introPriceCents > p.ongoingPriceCents) warnings.push('intro price higher than ongoing price');
  }

  if (p.uploadSpeedMbps !== undefined && p.uploadSpeedMbps !== null && p.speedTier !== null) {
    if (p.uploadSpeedMbps > p.speedTier) warnings.push('upload speed greater than download speed');
  }

  return { ok: errors.length === 0, reject: errors.length > 0, errors, warnings };
}

export function normalizeExtract(ex: PlanExtract): PlanExtract {
  const promoSource = [ex.conditionsText, ex.planName].filter(Boolean).join(" ");
  const extractedPromo = extractPromoFromText(promoSource);
  const extractedIntro = extractIntroFromText(ex.conditionsText);
  const normalizedIntroDuration = typeof ex.introDurationDays === 'number'
    ? ex.introDurationDays
    : parseDurationToDays(String(ex.introDurationDays)) ?? null;
  const normalizedIntroPrice = typeof ex.introPriceCents === 'number'
    ? ex.introPriceCents
    : parsePriceToCents(String(ex.introPriceCents)) ?? null;
  const normalizedOngoingPrice = typeof ex.ongoingPriceCents === 'number'
    ? ex.ongoingPriceCents
    : parsePriceToCents(String(ex.ongoingPriceCents)) ?? null;
  const introDurationDays = normalizedIntroDuration ?? extractedIntro.introDurationDays;
  const introPriceCents = normalizedIntroPrice ?? extractedIntro.introPriceCents;
  const contractType = ex.contractType ?? (typeof ex.contractMonths === 'number'
    ? (ex.contractMonths === 0 ? 'month-to-month' : `${ex.contractMonths}-month`)
    : null);
  const serviceType = ex.serviceType ?? (ex.technologyType === '5g-home'
    ? '5g-home'
    : ex.technologyType === 'satellite'
      ? 'satellite'
      : 'nbn');
  return {
    ...ex,
    introPriceCents,
    ongoingPriceCents: normalizedOngoingPrice,
    speedTier: normalizeSpeed(ex.speedTier),
    introDurationDays,
    contractType,
    serviceType,
    promoCode: ex.promoCode ?? extractedPromo.promoCode,
    promoDescription: ex.promoDescription ?? extractedPromo.promoDescription,
    promoExpiresAt: ex.promoExpiresAt ?? extractPromoExpiry(
      [ex.conditionsText, ex.promoDescription, ex.planName].filter(Boolean).join(' ')
    ),
  };
}
