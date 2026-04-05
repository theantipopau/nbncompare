# 🚀 PHASE 1 - START CODING NOW

**Status:** Ready to Execute  
**Timeline:** January 11-24, 2026 (2 weeks)  
**Team:** 2-3 developers + QA  
**Total Time:** ~120 developer hours

---

## 🎯 Your Assignment

You have 3 independent tracks you can work on in parallel:

### **Track A: URL Verification** (8 hours total)
- Owner: Backend Developer
- Tool created: `apps/worker/src/tools/verify-provider-urls.ts`
- **What to do:**
  1. Run the verification tool
  2. Get report of all 30 URLs
  3. Identify broken/redirected URLs
  4. Create SQL updates
  5. Document findings

**Start now:**
```bash
cd apps/worker
npx ts-node src/tools/verify-provider-urls.ts
```

---

### **Track B: Enhance Telstra Parser** (4 hours)
- Owner: Parser/Frontend Developer
- File: `packages/shared/src/parsers/providers/telstra.ts`
- Guide: `packages/shared/src/parsers/ENHANCEMENT_GUIDE.ts`
- **What to do:**
  1. Open Telstra parser
  2. Add extraction for: upload speed, data allowance, contract terms, modem included, setup fee
  3. Test with sample HTML
  4. All 5 new fields must extract correctly

**Start now:**
```bash
# Open this file
code packages/shared/src/parsers/providers/telstra.ts

# Reference this guide
code packages/shared/src/parsers/ENHANCEMENT_GUIDE.ts

# Test when done
npm run test:parsers
```

---

### **Track C: Enhance Optus Parser** (3 hours)
- Owner: Parser/Frontend Developer (different person)
- File: `packages/shared/src/parsers/providers/optus.ts`
- Same enhancements as Track B

**Start now:**
```bash
code packages/shared/src/parsers/providers/optus.ts
npm run test:parsers
```

---

## 📝 Example: How to Enhance a Parser

### Before (Current):
```typescript
// packages/shared/src/parsers/providers/telstra.ts

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  // ... extracts planName, speedTier, price only
  
  return {
    planName: "NBN 100",
    speedTier: 100,
    introPriceCents: 9999,
    ongoingPriceCents: 12999,
    sourceUrl: url,
  };
}
```

### After (Enhanced):
```typescript
// packages/shared/src/parsers/providers/telstra.ts

// 1. Add extraction functions
function extractUploadSpeed(planElement: Element, downloadSpeed: number): number | null {
  const planText = planElement.textContent || "";
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload)/i);
  if (uploadMatch) return parseInt(uploadMatch[1]);
  
  // Fallback ratios
  const ratios: { [key: number]: number } = { 25: 1, 50: 2, 100: 10, 250: 20, 500: 40, 1000: 50 };
  return ratios[downloadSpeed] || null;
}

function extractDataAllowance(planElement: Element): string | null {
  const text = (planElement.textContent || "").toLowerCase();
  if (text.includes("unlimited")) return "Unlimited";
  const match = text.match(/(\d+)\s*(tb|gb)/i);
  return match ? `${match[1]}${match[2].toUpperCase()}` : null;
}

function extractContractMonths(planElement: Element): number | null {
  const text = (planElement.textContent || "").toLowerCase();
  if (text.includes("no contract")) return 0;
  if (text.includes("24 month")) return 24;
  if (text.includes("12 month")) return 12;
  return null;
}

function extractModemIncluded(planElement: Element): boolean | null {
  const text = (planElement.textContent || "").toLowerCase();
  if (text.includes("modem included")) return true;
  if (text.includes("bring your own")) return false;
  return null;
}

function extractSetupFee(planElement: Element): number | null {
  const text = planElement.textContent || "";
  if (text.match(/free\s*(setup|connection)/i)) return 0;
  const match = text.match(/(setup|connection)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  return match ? Math.round(parseFloat(match[2]) * 100) : null;
}

// 2. Use new extraction functions in parser
export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".plan-card"));
  
  return cards.map((card) => {
    const planName = card.querySelector("h3")?.textContent?.trim() || "Not stated";
    const speedMatch = planName.match(/(\d{1,4})\s*Mbps/);
    const speedTier = speedMatch ? parseInt(speedMatch[1]) : 0;
    
    // Extract new fields
    const uploadSpeed = extractUploadSpeed(card, speedTier);
    const dataAllowance = extractDataAllowance(card);
    const contractMonths = extractContractMonths(card);
    const modemIncluded = extractModemIncluded(card);
    const setupFee = extractSetupFee(card);
    
    return {
      planName,
      speedTier,
      uploadSpeed,           // NEW
      dataAllowance,         // NEW
      contractMonths,        // NEW
      modemIncluded,         // NEW
      setupFeeCents: setupFee, // NEW
      introPriceCents: parsePriceToCents(card.querySelector(".price")?.textContent),
      ongoingPriceCents: parsePriceToCents(card.querySelector(".price")?.textContent),
      sourceUrl: url,
    };
  });
}
```

---

## ✅ Checklist: Before You Start

- [ ] Read this file (5 min)
- [ ] Read PHASE_1_IMPLEMENTATION.md section for your task (10 min)
- [ ] Review ENHANCEMENT_GUIDE.ts if working on parsers
- [ ] Set up Git branch: `git checkout -b feature/phase-1-data-accuracy`
- [ ] Create feature branch for your specific task
- [ ] Test locally before committing

---

## 🎯 Daily Workflow

### Morning (Start):
1. Pull latest code: `git pull origin main`
2. Check your task in the checklist
3. Start coding
4. Commit frequently with clear messages

### Mid-Day (Check-in):
1. Run tests: `npm run test:parsers` (if parser work)
2. Check for blockers
3. Sync with team

### End of Day (Wrap-up):
1. Commit final changes
2. Push to feature branch
3. Update checklist with progress
4. Document any blockers

---

## 📊 Git Workflow

### Creating your branch:
```bash
git checkout -b feature/phase-1-{your-task}
# Examples:
# feature/phase-1-url-verification
# feature/phase-1-telstra-parser
# feature/phase-1-optus-parser
```

### Committing:
```bash
# Good commit messages:
git commit -m "feat: enhance telstra parser with upload speed, contracts, allowances"
git commit -m "fix: telstra parser upload speed extraction"
git commit -m "test: add telstra parser enhancement tests"
```

### Pushing:
```bash
git push origin feature/phase-1-{your-task}
```

---

## 🧪 Testing

### For URL Verification:
```bash
cd apps/worker
npx ts-node src/tools/verify-provider-urls.ts
# Should output: URL_VERIFICATION_REPORT.md
```

### For Parser Changes:
```bash
cd packages/shared
npm run test:parsers
# Should show: ✅ All tests passed
```

### Manual Testing:
```bash
cd apps/web
npm run dev
# Visit http://localhost:5173
# Check if plans display new fields correctly
```

---

## 🚨 If You Get Stuck

### Problem: Parser not extracting correctly
**Solution:** Check the HTML structure using browser inspector:
1. Visit provider's website
2. Right-click on plan → Inspect
3. Find the exact selector
4. Update parser selector

### Problem: Tests failing
**Solution:** Check test samples:
1. Open `test-samples/provider.html`
2. Verify HTML has the data you're trying to extract
3. Update selectors to match actual HTML

### Problem: Git conflicts
**Solution:**
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts
git push --force-with-lease
```

---

## 🎯 Definition of Done (Per Task)

### URL Verification:
- [x] Tool runs without errors
- [x] All 30 URLs tested
- [x] Report generated (URL_VERIFICATION_REPORT.md)
- [x] Issues categorized (critical/warning/info)
- [x] SQL updates ready for migrations

### Parser Enhancement:
- [x] All 5 new fields extract
- [x] Tests pass (npm run test:parsers)
- [x] No console errors
- [x] Fallback logic works
- [x] Commit message clear
- [x] Ready for code review

---

## 📅 Timeline

**Week 1 (Today - Jan 18):**
- [ ] Track A: URL verification complete
- [ ] Track B: Telstra parser enhanced
- [ ] Track C: Optus parser enhanced
- [ ] 5+ more parsers in progress

**Week 2 (Jan 18-24):**
- [ ] All parsers enhanced
- [ ] Database migrations deployed
- [ ] UI updated with new fields
- [ ] Admin dashboard built
- [ ] Phase 1 complete

---

## 💬 Questions?

- **How do I...** → Check PHASE_1_IMPLEMENTATION.md
- **Parser help** → Check ENHANCEMENT_GUIDE.ts
- **What's the plan** → Check COMPREHENSIVE_ROADMAP_2026.md
- **Am I doing this right** → Ask in standup

---

## 🚀 Let's Go!

Pick your task and start coding:

**Option A:** `cd apps/worker && npx ts-node src/tools/verify-provider-urls.ts`  
**Option B:** Open `packages/shared/src/parsers/providers/telstra.ts` and start enhancing  
**Option C:** Open `packages/shared/src/parsers/providers/optus.ts` and start enhancing

---

**Status:** ✅ READY TO START  
**Deadline:** January 24, 2026  
**Success:** Phase 1 complete, all new fields live

**NOW GO BUILD IT.** 🚀
