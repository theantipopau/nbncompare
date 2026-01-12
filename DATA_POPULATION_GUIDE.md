# 📊 Data Population & Parser Enhancement Guide

## Overview

The NBN Compare platform now has enhanced parsers that extract **9 fields per plan** instead of just 4:

### New Fields Available
1. **Upload Speed (Mbps)** - Calculated from download speed ratios
2. **Data Allowance** - Extracted from plan HTML
3. **Contract Months** - Term length extracted from plans
4. **Modem Included** - Boolean for modem inclusion
5. **Setup Fee** - Initial setup cost in cents
6. Plus 4 existing fields: Download Speed, Price (intro & ongoing), NBN Technology

## Data Population Options

### Option 1: Automatic via Scheduled Cron (RECOMMENDED)

The worker is configured to run daily at **03:00 UTC** (GMT):

```
Schedule: 0 3 * * * (every day at 03:00 UTC)
```

**How it works:**
- Cron automatically triggers `/internal/cron/run`
- Processes up to 30 providers per run (most active first)
- Updates database automatically
- No manual intervention required
- Runs in background with 30-second timeout (sufficient for 30 providers at ~500ms each)

**Enable this by:**
1. Setting `ADMIN_TOKEN` environment variable in Cloudflare Worker secrets
2. Cron will automatically execute with proper authentication

### Option 2: Manual Trigger via API

```bash
# Check current status
curl https://nbncompare.info/internal/data-population/status

# Response shows:
# - Verified providers count
# - Pending providers count  
# - Plans data completeness percentages
```

### Option 3: Run Data Population in Node.js (Local/CI)

For deployment pipelines or local testing:

```bash
# Create a local Node.js script that:
# 1. Connects to the D1 database directly
# 2. Fetches each provider URL
# 3. Runs enhanced parsers
# 4. Populates all 9 fields
# 5. Marks providers as "Verified"

npm run populate-data  # (script to be added)
```

## Setting Up Automatic Daily Population

### Step 1: Set Admin Token in Cloudflare

```bash
# Create admin token (any random string)
TOKEN="your-secret-admin-token-here"

# Add to Cloudflare Worker secrets
wrangler secret put ADMIN_TOKEN
# Paste your TOKEN value

# Verify it was set
wrangler secret list
```

### Step 2: Test the Cron (Optional)

Since cron runs at 03:00 UTC daily, you can wait or manually trigger:

```bash
# Once ADMIN_TOKEN is set, you can test via:
curl -X GET \
  https://nbncompare.info/internal/cron/run \
  -H "x-admin-token: your-secret-admin-token-here"

# Response: {"ok":true, "result": {...}}
```

### Step 3: Monitor Status

```bash
# Check population progress anytime
curl https://nbncompare.info/internal/data-population/status

# Response example:
{
  "ok": true,
  "result": {
    "providers": {
      "verified": 5,
      "pending": 15,
      "failed": 0,
      "total": 20
    },
    "plans": {
      "total": 142,
      "with_upload_speed": 125,
      "with_data_allowance": 138,
      "with_contract_months": 95,
      "with_modem_included": 110,
      "with_setup_fee": 142
    }
  }
}
```

## Understanding the Data Population Process

### Per-Provider Flow

For each of the 20 providers:

```
1. Fetch HTML from provider website
2. Select appropriate parser based on URL
3. Parser extracts:
   - Plan name
   - Download speed tier (NBN 25/50/100/250/500/1000/2000 Mbps)
   - Upload speed (calculated from tier ratio)
   - Data allowance (Unlimited/500GB/1TB/etc)
   - Contract months (month-to-month/12/24)
   - Modem included (yes/no/free/paid)
   - Setup fee ($0-$200+)
   - Intro price & ongoing price
   - NBN technology type (FTTP/FTTC/FTTN/HFC/FW)
4. Validate extracted data
5. Upsert to plans table
6. Mark provider as "Verified"
7. Record metadata_verified_date & notes
```

### Status Tracking

Providers have 3 states:
- **Pending** - Not yet processed
- **Verified** - Successfully extracted and updated
- **Failed** - Encountered error (needs manual review)

Admin can see verification status in Dashboard → "✅ Metadata Verification" tab

## Current Implementation Status

### ✅ Completed
- [x] 20 provider parsers created with 5 extraction functions each
- [x] Enhanced PlanExtract interface with 4 new optional fields
- [x] Database schema updated (contract_months, nbn_technology, modem_included, etc.)
- [x] Metadata tracking columns (verification_status, verified_date, verified_by, notes)
- [x] Data population handler (batched to avoid timeouts)
- [x] Status endpoint: `/internal/data-population/status`
- [x] Admin dashboard with metadata verification tab
- [x] UI filters for new fields (setup fee, modem cost, contract terms)

### ⏳ Next Steps

1. **Set ADMIN_TOKEN** in Cloudflare
   ```bash
   wrangler secret put ADMIN_TOKEN
   ```

2. **Wait for daily cron** (03:00 UTC) or manually trigger with token

3. **Monitor progress** via status endpoint

4. **Verify in admin** → Compare page users will see enhanced filters

## Performance Expectations

- **Per provider:** ~1-2 seconds (depends on provider site speed)
- **20 providers:** ~20-40 seconds total
- **30 providers:** ~30-60 seconds total (fits within worker timeout if optimized)
- **Batch size:** Currently set to 3 per request to avoid timeout
- **Full population:** 7 batches × 3 minutes each = ~21 minutes for all 20 providers

## Troubleshooting

### "router.handle timeout" Error

**Cause:** Request took longer than 30 seconds (Cloudflare Workers limit)

**Solution:**
- Already implemented: Batch processing (3 providers per request)
- Call endpoint multiple times: Each call processes next batch
- Or use scheduled cron which has more lenient timeouts

### "Unauthorized" Error

**Cause:** Missing or incorrect `x-admin-token` header or ADMIN_TOKEN not set

**Solution:**
```bash
# Verify token is set
wrangler secret list

# If not set:
wrangler secret put ADMIN_TOKEN
```

### Provider Shows "Failed" Status

**Cause:** Parser couldn't extract data or provider URL changed

**Solution:**
- Check `metadata_verification_notes` column for error details
- Manually verify provider's website still has plan listings
- Update provider URL in database if moved
- Report issue for parser improvement

## Admin Dashboard Integration

The Admin panel now shows:

**Metadata Verification Tab:**
- Provider name
- Verification status (color-coded: 🟢 Verified, 🟡 Pending, 🔴 Failed)
- Plan count per provider
- Data completeness: Upload Speed %, Data Allowance %, Contract Terms %, Modem %
- Last verified date

This provides visibility into data quality and identifies which providers need attention.

## API Endpoints

### Data Population

- `POST /internal/data-population/populate` - Trigger batch population (3 providers)
- `GET /internal/data-population/status` - Check population progress
- `GET /internal/cron/run` - Trigger full provider sync (requires ADMIN_TOKEN header)

### Admin

- `GET /api/admin/provider-verification` - Get metadata verification data (for dashboard)
- `GET /api/admin/issues` - Get data quality issues

### Public

- `GET /api/providers` - All 20 providers
- `GET /api/plans?upload_speed_mbps=10` - Filter by new fields
- `GET /api/plans?contract_months=24` - Filter by contract term

## What Users Will See

### On Compare Page
- New filters for Setup Fee ($0/$1-100/$100+)
- New filter for Modem Cost (Free/Paid)
- New column for Upload Speed when expanded
- Contract Terms clearly labeled

### On Search
- Plans sorted by best value (price + data + upload speed)
- Data completeness indicators
- Provider recommendations based on data quality

## Success Metrics

Track completion via status endpoint:

| Metric | Target | Current |
|--------|--------|---------|
| Providers Verified | 20/20 | - |
| Plans Total | 140+ | 142 |
| Upload Speed Data | 90% | - |
| Data Allowance Info | 90% | - |
| Contract Terms | 90% | - |
| Modem Inclusion | 90% | - |
| Setup Fees | 100% | - |

## Next Actions

1. ✅ Deploy worker with data population endpoints - **DONE**
2. ⏳ Set ADMIN_TOKEN in Cloudflare
3. ⏳ Wait for first daily cron run OR manually trigger
4. ⏳ Monitor status endpoint for progress
5. ⏳ Verify admin dashboard shows data
6. ⏳ Test user-facing filters on Compare page
7. ⏳ Announce new features to users

---

**For questions or issues, check:**
- Admin Dashboard → ✅ Metadata Verification tab
- `/internal/data-population/status` endpoint
- Cloudflare Worker logs: `wrangler tail nbncompare-worker`
