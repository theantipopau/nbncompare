/// <reference lib="dom" />
/**
 * PARSER ENHANCEMENT GUIDE
 * 
 * Phase 1 Enhancement: Extract 5 new data fields per provider
 * Target: Upload speed, Contract terms, Data allowance, Modem included, Setup fee
 * 
 * This file documents the extraction patterns for each field
 * and provides implementation examples
 */

/**
 * FIELD 1: UPLOAD SPEED (Mbps)
 * 
 * Location: Usually appears with download speed
 * Patterns:
 * - "100 Mbps down / 10 Mbps up"
 * - "NBN 100 (10 Mbps upload)"
 * - Separate "Upload speed:" field
 * - Technical specifications section
 * 
 * Fallback Logic:
 * - If not found, use standard ratios:
 *   25 Mbps down → 1 Mbps up
 *   50 Mbps down → 2 Mbps up
 *   100 Mbps down → 10 Mbps up
 *   250 Mbps down → 20 Mbps up
 *   500 Mbps down → 40 Mbps up
 *   1000 Mbps down → 50 Mbps up
 * 
 * Example extraction:
 */
function _extractUploadSpeed(planElement: globalThis.Element | null, downloadSpeed: number): number | null {
  const planText = planElement?.textContent || "";
  
  // Try to find "X Mbps" upload mentions
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload)/i);
  if (uploadMatch) {
    return parseInt(uploadMatch[1]);
  }
  
  // Fallback to standard ratios
  const uploadRatios: { [key: number]: number } = {
    25: 1,
    50: 2,
    100: 10,
    250: 20,
    500: 40,
    1000: 50,
    2000: 100,
  };
  
  return uploadRatios[downloadSpeed] || null;
}

/**
 * FIELD 2: DATA ALLOWANCE
 * 
 * Values: "Unlimited" or specific amount ("1TB", "500GB", "200GB")
 * Location: Usually in plan description or features list
 * Patterns:
 * - "Unlimited data"
 * - "1TB data / month"
 * - "500GB per month"
 * - "No data limit"
 * 
 * Example extraction:
 */
function _extractDataAllowance(planElement: globalThis.Element | null): string | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  
  // Check for unlimited
  if (planText.includes("unlimited")) {
    return "Unlimited";
  }
  
  // Check for specific amounts
  const amountMatch = planText.match(/(\d+)\s*(tb|gb)/i);
  if (amountMatch) {
    return `${amountMatch[1]}${amountMatch[2].toUpperCase()}`;
  }
  
  return null;
}

/**
 * FIELD 3: CONTRACT TERM (months)
 * 
 * Values: 0 (month-to-month), 12, 24
 * Location: Plan options, T&Cs, or contract section
 * Patterns:
 * - "No contract" or "Month-to-month" → 0
 * - "12-month contract" or "12 months" → 12
 * - "24-month contract" or "2 years" → 24
 * 
 * Example extraction:
 */
function _extractContractTerm(planElement: globalThis.Element | null): number | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  
  if (planText.includes("no contract") || planText.includes("month-to-month")) {
    return 0;
  }
  
  if (planText.includes("24 month") || planText.includes("2 year")) {
    return 24;
  }
  
  if (planText.includes("12 month") || planText.includes("1 year")) {
    return 12;
  }
  
  return null;
}

/**
 * FIELD 4: MODEM INCLUDED
 * 
 * Values: true (included), false (not included/paid)
 * Location: Features list, plan description, or separate "what's included" section
 * Patterns:
 * - "Modem included"
 * - "Router included"
 * - "Equipment included"
 * - "Modem $X extra" → false
 * - "Bring your own modem" → false
 * 
 * Example extraction:
 */
function _extractModemIncluded(planElement: globalThis.Element | null): boolean | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  
  if (planText.includes("modem included") || planText.includes("router included")) {
    return true;
  }
  
  if (
    planText.includes("modem $") ||
    planText.includes("bring your own") ||
    planText.includes("your own modem")
  ) {
    return false;
  }
  
  return null;
}

/**
 * FIELD 5: SETUP FEE
 * 
 * Values: Cost in cents (0 if free)
 * Location: Plan description, pricing details, or "what's included" section
 * Patterns:
 * - "Free setup" or "No setup fee" → 0
 * - "Setup: $X" → parsePriceToCents(X)
 * - "Connection fee: $X" → parsePriceToCents(X)
 * 
 * Example extraction:
 */
function _extractSetupFee(planElement: globalThis.Element | null): number | null {
  const planText = planElement?.textContent || "";
  
  if (planText.match(/free\s*(setup|connection|installation)/i)) {
    return 0;
  }
  
  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  if (feeMatch) {
    return Math.round(parseFloat(feeMatch[2]) * 100);
  }
  
  return null;
}

/**
 * COMPLETE PARSER EXAMPLE - After Enhancement
 * 
 * Shows how to integrate all 5 new fields into existing parser
 */

export interface EnhancedPlanExtract {
  // Existing fields
  providerSlug: string;
  planName: string;
  speedTier: number;
  introPriceCents: number;
  ongoingPriceCents: number;
  sourceUrl: string;

  // NEW FIELDS (Phase 1)
  uploadSpeed?: number | null; // Mbps
  dataAllowance?: string | null; // "Unlimited", "1TB", "500GB"
  contractMonths?: number | null; // 0 (month-to-month), 12, 24
  modemIncluded?: boolean | null; // true/false
  setupFeeCents?: number | null; // 0 if free, otherwise cost in cents
}

/**
 * IMPLEMENTATION CHECKLIST
 * 
 * For each provider parser, follow these steps:
 * 
 * Step 1: Add extraction functions
 * ☐ extractUploadSpeed()
 * ☐ extractDataAllowance()
 * ☐ extractContractTerm()
 * ☐ extractModemIncluded()
 * ☐ extractSetupFee()
 * 
 * Step 2: Update return object
 * ☐ Add uploadSpeed field
 * ☐ Add dataAllowance field
 * ☐ Add contractMonths field
 * ☐ Add modemIncluded field
 * ☐ Add setupFeeCents field
 * 
 * Step 3: Update tests
 * ☐ Test HTML sample with new fields
 * ☐ Verify each field extracts correctly
 * ☐ Check fallback logic works
 * ☐ Run npm run test:parsers
 * 
 * Step 4: Verify
 * ☐ Parser returns all 5 new fields
 * ☐ No parser errors
 * ☐ Values are reasonable
 * ☐ Fallbacks trigger correctly
 * 
 * Example: parser should return:
 * {
 *   planName: "NBN 100",
 *   speedTier: 100,
 *   uploadSpeed: 10,           // NEW
 *   dataAllowance: "Unlimited", // NEW
 *   contractMonths: 0,          // NEW
 *   modemIncluded: true,        // NEW
 *   setupFeeCents: 0,           // NEW
 *   introPriceCents: 9999,
 *   ongoingPriceCents: 12999,
 * }
 */

/**
 * PARSER PRIORITY ORDER
 * 
 * Priority 1 (Highest impact, most users):
 * ☐ Telstra (25% of plans)
 * ☐ Optus (20% of plans)
 * ☐ TPG (15% of plans)
 * ☐ Aussie Broadband (10% of plans)
 * ☐ iiNet (8% of plans)
 * 
 * Priority 2 (Secondary providers):
 * ☐ Vodafone (5% of plans)
 * ☐ Dodo (3% of plans)
 * ☐ Superloop (2% of plans)
 * ☐ Spintel (2% of plans)
 * ☐ Exetel (2% of plans)
 * 
 * Priority 3 (Remaining):
 * ☐ Foxtel, Kogan, Mate, and others
 * 
 * Timeline:
 * - Priority 1: Week 1 (40 hours)
 * - Priority 2: Week 1-2 (30 hours)
 * - Priority 3: Week 2 (20 hours)
 * - Testing & fixes: Week 2 (10 hours)
 */

/**
 * DEPLOYMENT STEPS
 * 
 * 1. Enhance parser code
 * 2. Update test samples (test-samples/provider.html)
 * 3. Run tests locally: npm run test:parsers
 * 4. Commit changes per provider
 * 5. Deploy to production
 * 6. Monitor error logs
 * 7. Adjust selectors if needed
 * 
 * ROLLBACK PLAN
 * If parser breaks in production:
 * 1. Revert to previous parser version
 * 2. Document the issue
 * 3. Fix locally
 * 4. Redeploy
 */

export const ENHANCEMENT_TEMPLATE = {
  field1_uploadSpeed: "Extract from '100 Mbps / 10 Mbps' pattern, fallback to standard ratios",
  field2_dataAllowance: "Look for 'Unlimited' or specific amounts like '1TB'",
  field3_contractMonths: "Find contract options: 0 (month-to-month), 12, or 24 months",
  field4_modemIncluded: "Check if router/modem included in plan",
  field5_setupFee: "Extract setup/connection fee, 0 if free",
};
