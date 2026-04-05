# 🚀 NEXT ACTIONS - Continue Phase 1 Momentum

**Status:** 2/30 parsers enhanced ✅ Continue immediately

---

## Pick Your Next Task (30 min - 2 hours)

### Option 1: Enhance Optus Parser (30 min)
**File:** `packages/shared/src/parsers/providers/optus.ts`

```typescript
// 1. Copy helper functions from telstra.ts:
// - extractUploadSpeed()
// - extractDataAllowance()
// - extractContractMonths()
// - extractModemIncluded()
// - extractSetupFee()

// 2. Update return object to include:
uploadSpeedMbps: extractUploadSpeed(el, normalizedSpeed),
dataAllowance: extractDataAllowance(el),
contractMonths: extractContractMonths(el),
modemIncluded: extractModemIncluded(el),
setupFeeCents: extractSetupFee(el),

// 3. Test:
npm run test:parsers

// 4. Commit:
git commit -m "feat: enhance optus parser with upload speed, contracts, data allowance"
```

---

### Option 2: Enhance TPG Parser (30 min)
**File:** `packages/shared/src/parsers/providers/tpg.ts`

Same process as Option 1 - copy template, adapt selectors, test.

---

### Option 3: Run URL Verification (30 min)
**File:** Already created: `apps/worker/src/tools/verify-provider-urls.ts`

```bash
cd apps/worker
npx ts-node src/tools/verify-provider-urls.ts

# Output: URL_VERIFICATION_REPORT.md
# Shows which URLs are broken, redirected, or valid
```

---

### Option 4: Batch Enhance 5 Providers (2-3 hours)
Do Optus, TPG, iiNet, Vodafone, Dodo in sequence.

Each provider takes ~30 min once you have the template.

---

## 📋 Quick Copy-Paste: Helper Functions

Use this template for any new parser:

```typescript
// Add these helper functions to the top of provider file

function extractUploadSpeed(planElement: Element, downloadSpeed: number | null): number | null {
  if (!downloadSpeed) return null;
  const planText = planElement.textContent || "";
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload|↑)/i);
  if (uploadMatch) {
    return parseInt(uploadMatch[1]);
  }
  const uploadRatios: { [key: number]: number } = {
    12: 1, 25: 1, 50: 2, 100: 10, 200: 20, 250: 20, 400: 40, 500: 40, 1000: 50, 2000: 100,
  };
  return uploadRatios[downloadSpeed] || null;
}

function extractDataAllowance(planElement: Element): string | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("unlimited")) return "Unlimited";
  const amountMatch = planText.match(/(\d+\.?\d*)\s*(tb|gb)/i);
  return amountMatch ? `${amountMatch[1]}${amountMatch[2].toUpperCase()}` : null;
}

function extractContractMonths(planElement: Element): number | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("no contract") || planText.includes("month-to-month")) return 0;
  if (planText.includes("24 month") || planText.includes("2 year")) return 24;
  if (planText.includes("12 month") || planText.includes("1 year")) return 12;
  return null;
}

function extractModemIncluded(planElement: Element): boolean | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("modem included") || planText.includes("router included") || planText.includes("free modem")) return true;
  if (planText.includes("modem $") || planText.includes("bring your own") || planText.includes("your own modem")) return false;
  return null;
}

function extractSetupFee(planElement: Element): number | null {
  const planText = planElement.textContent || "";
  if (planText.match(/free\s*(setup|connection|installation)/i)) return 0;
  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  return feeMatch ? Math.round(parseFloat(feeMatch[2]) * 100) : null;
}
```

---

## 📊 Current Status Dashboard

```
PHASE 1 PROGRESS
├─ Parsers Enhanced: 2/30 (6.7%)
├─ Telstra ...................... ✅ DONE
├─ Aussie Broadband ............ ✅ DONE
├─ Optus ....................... ⏳ READY (30 min)
├─ TPG ......................... ⏳ READY (30 min)
├─ iiNet ....................... ⏳ READY (30 min)
├─ Vodafone .................... ⏳ READY (30 min)
├─ Dodo ........................ ⏳ READY (30 min)
├─ Superloop ................... ⏳ READY (30 min)
├─ Spintel ..................... ⏳ READY (30 min)
├─ Exetel ...................... ⏳ READY (30 min)
└─ 20+ others .................. ⏳ READY

URL Verification: ⏳ READY TO RUN (30 min)
Database Migrations: ✅ CREATED (ready to deploy)
Tests: ✅ PASSING (no regressions)
```

---

## ⏱️ Time Estimates

| Task | Time | Difficulty |
|------|------|-----------|
| Enhance Optus | 30 min | Easy (use template) |
| Enhance TPG | 30 min | Easy |
| Enhance 5 more | 2-3 hours | Easy |
| All 30 providers | 12-15 hours | Easy (repetitive) |
| URL Verification | 30 min | Very easy (tool ready) |

---

## 🎯 Week 1 Goal: 10+ By Jan 18

**Current pace:** 2 done in 1.5 hours  
**To reach 10:** Need 8 more = 4 hours  
**To reach all 30:** Need 28 more = 14 hours

**Timeline:**
- ✅ Day 1 (Today): 2 done
- ⏳ Day 2: 5 more = 7 total
- ⏳ Day 3: 5 more = 12 total (goal exceeded!)
- ⏳ Days 4-5: Finish remaining + URL verification

**Status:** On track to complete parser enhancements by Jan 15 ✅

---

## 💻 Commands Reference

### Run Tests:
```bash
cd packages/shared
npm run test:parsers
```

### Check Which Providers Need Enhancement:
```bash
# Look in packages/shared/src/parsers/providers/
# Files ending in .ts are parsers to enhance
```

### Run URL Verification:
```bash
cd apps/worker
npx ts-node src/tools/verify-provider-urls.ts
```

### Git Workflow:
```bash
# Create branch
git checkout -b feature/phase-1-parser-enhancements

# Make changes
# Test locally
npm run test:parsers

# Commit
git commit -m "feat: enhance [provider] parser"

# Push
git push origin feature/phase-1-parser-enhancements
```

---

## 🎁 What's Already Done

- ✅ Types updated (supports new fields)
- ✅ Helper functions working (tested)
- ✅ Telstra parser enhanced (2/30 ✅)
- ✅ Aussie Broadband parser enhanced (2/30 ✅)
- ✅ Tests passing (no regressions ✅)
- ✅ URL tool ready (just run it)
- ✅ Database migrations created (ready to deploy)

**Everything is ready. Just keep going.**

---

## 🚀 Momentum

You have established a working pattern:

1. ✅ Open provider parser file
2. ✅ Add helper functions
3. ✅ Update return object
4. ✅ Test
5. ✅ Commit

**Time per provider:** 30 min  
**All providers:** 15 hours total

---

## 📞 If You Get Stuck

**Parser not extracting?**
- Check live website HTML (right-click → Inspect)
- Update selector in extraction function
- Re-test: `npm run test:parsers`

**Tests failing?**
- Check error message
- Verify sample HTML in `test-samples/[provider].html`
- Selector likely needs adjustment

**Git issues?**
- Pull latest: `git pull origin main`
- Stash changes: `git stash`
- Start fresh on new branch

---

## ✨ Summary

**What you accomplished:**
- Enhanced type system
- Upgraded 2 major parsers
- Created replicable template
- All tests passing

**What's left:**
- Enhance 28 more parsers (14 hours)
- Run URL verification (30 min)
- Deploy database migrations (2 hours)
- Update UI (12 hours)
- Build admin dashboard (8 hours)

**You're at 6.7% completion after 1.5 hours.**  
**If you keep this pace, Phase 1 is complete in 4-5 days.**

---

## 🎯 Pick One and Go

**Choose Your Challenge:**

🟢 **Easy:** Enhance Optus parser (30 min, copy template)  
🟡 **Medium:** Enhance 5 parsers (2-3 hours, batch work)  
🔵 **Fast Win:** Run URL verification (30 min, pre-built tool)  
🟣 **Deep Dive:** Enhance all 30 providers (12-15 hours, repetitive)

**Pick one, finish it, report back.**

**Let's keep this momentum going.** 🚀

---

**Status:** Ready to continue  
**Next:** Pick a task above  
**Pace:** 1 parser per 30 min = 2 per hour  
**Completion:** All parsers by Jan 15 ✅

**LET'S GO.** 🚀
