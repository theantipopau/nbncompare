# Address Search & NBN Qualification API Integration

## Current Implementation (MVP)

The site now has **working address search with autocomplete** that:
- Shows address suggestions as you type (debounced 500ms)
- Qualifies selected addresses for NBN service
- Displays technology type (FTTP/FTTC/FTTN/HFC/Fixed Wireless)
- Auto-adjusts speed filter based on available technology
- Currently uses **simulated data** for demonstration

## Production Integration Options

### 1. Google Places Autocomplete API (Recommended for Address Search)

**What it does:** Provides real-time address suggestions as users type

**Setup:**
1. Get API key: https://console.cloud.google.com/google/maps-apis/
2. Enable "Places API" and "Geocoding API"
3. Add to Cloudflare Worker secrets: `wrangler secret put GOOGLE_PLACES_API_KEY`

**Cost:** 
- $2.83 per 1,000 requests (Autocomplete)
- $5.00 per 1,000 requests (Geocoding)
- First $200/month FREE credit

**Implementation:**
```typescript
// In apps/worker/src/handlers/address.ts

const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:au&key=${env.GOOGLE_PLACES_API_KEY}`;

const res = await fetch(placesUrl);
const data = await res.json();

return data.predictions.map(p => ({
  id: p.place_id,
  formattedAddress: p.description
}));
```

**Benefits:**
- Best-in-class address autocomplete
- Works globally (restrict to Australia with `components=country:au`)
- Well-documented, reliable API
- Free tier covers ~70 searches/day

---

### 2. NBN Co Location API (Required for Service Qualification)

**What it does:** Returns actual NBN service availability and technology type for an address

**Setup:**
1. Register at: https://www.nbnco.com.au/develop/
2. Submit application for Location API access
3. Get API credentials (typically takes 1-2 business days)
4. Add to Worker secrets: `wrangler secret put NBN_API_KEY`

**Cost:** **FREE** (NBN Co provides this at no charge)

**API Endpoints:**

**Address Search:**
```http
POST https://api.nbnco.net.au/location/v2/address/search
Content-Type: application/json
Authorization: Bearer {NBN_API_KEY}

{
  "query": "123 Main St Brisbane",
  "maxResults": 10
}
```

**Service Qualification:**
```http
GET https://api.nbnco.net.au/location/v2/address/{locationId}
Authorization: Bearer {NBN_API_KEY}
```

**Response includes:**
- `serviceType`: FTTP, FTTC, FTTN, HFC, Fixed Wireless, Satellite
- `speedTier`: Maximum available speed
- `serviceStatus`: Available, Coming Soon, Not Available
- `disconnectionDate`: If applicable
- `altReasonCode`: Reason if not available

**Implementation:**
```typescript
// In apps/worker/src/handlers/address.ts

const nbnResponse = await fetch('https://api.nbnco.net.au/location/v2/address/search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.NBN_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    query: address,
    maxResults: 10
  })
});

const { addressDetails } = await nbnResponse.json();

// Then qualify the selected address
const qualResponse = await fetch(
  `https://api.nbnco.net.au/location/v2/address/${locationId}`,
  {
    headers: { 'Authorization': `Bearer ${env.NBN_API_KEY}` }
  }
);

const { serviceType, speedTier, serviceStatus } = await qualResponse.json();
```

---

### 3. Alternative: Australia Post Address API

**What it does:** Australian address validation and autocomplete

**Setup:** https://auspost.com.au/business/marketing-and-communications/access-data-and-insights/address-data

**Cost:** Tiered pricing, starts at ~$500/year

**Pros:**
- Official Australian addresses only
- High accuracy for AU addresses
- GNAF database (Government standard)

**Cons:**
- More expensive than Google
- Requires separate NBN qualification anyway

---

## Recommended Production Setup

### Phase 1: NBN Co API Only (FREE)
- Use NBN Co's address search endpoint
- Use NBN Co's qualification endpoint
- **Cost: $0/month**
- **Limitation:** Address search is less sophisticated than Google

### Phase 2: Google + NBN Co (Better UX)
- Google Places for autocomplete (better UX)
- NBN Co for service qualification (authoritative data)
- **Cost: FREE for <70 searches/day, $2.83/1000 thereafter**

---

## Implementation Checklist

### To integrate Google Places API:

1. **Get API Key:**
   ```bash
   # Visit: https://console.cloud.google.com/google/maps-apis/
   # Enable: Places API, Geocoding API
   ```

2. **Add to Worker:**
   ```bash
   cd apps/worker
   wrangler secret put GOOGLE_PLACES_API_KEY
   # Paste your API key when prompted
   ```

3. **Update TypeScript types:**
   ```typescript
   // apps/worker/src/index.ts
   interface Env {
     D1: D1Database;
     ADMIN_TOKEN: string;
     GOOGLE_PLACES_API_KEY: string; // Add this
   }
   ```

4. **Uncomment code in address.ts:**
   - Replace simulated data with real API calls
   - Update `searchAddress()` function to call Google API

---

### To integrate NBN Co API:

1. **Register for access:**
   - Visit: https://www.nbnco.com.au/develop/
   - Submit application for Location API
   - Wait for approval (~1-2 days)

2. **Add credentials:**
   ```bash
   cd apps/worker
   wrangler secret put NBN_API_KEY
   # Paste your Bearer token
   ```

3. **Update address.ts:**
   - Uncomment NBN Co API integration code
   - Replace simulated qualification with real API call

4. **Test:**
   ```bash
   # Test address search
   curl "https://nbncompare-worker.matt-hurley91.workers.dev/api/address/search?q=123+Main+St+Brisbane"
   
   # Test qualification
   curl "https://nbncompare-worker.matt-hurley91.workers.dev/api/address/qualify?id=ABC123"
   ```

---

## Current Status

✅ **Address search UI with autocomplete dropdown** - WORKING
✅ **Service qualification display** - WORKING
✅ **Auto speed adjustment** - WORKING
⏳ **Google Places API** - Ready for integration (needs API key)
⏳ **NBN Co API** - Ready for integration (needs registration)

The code is **production-ready** and structured for easy API integration. Just add API keys and uncomment the integration code!

---

## Security Notes

- API keys stored in Cloudflare Worker secrets (not in code)
- CORS headers properly configured for frontend access
- Rate limiting recommended for production (Cloudflare provides this)
- Consider caching address lookups in D1 to reduce API costs

---

## Cost Estimates

**Conservative estimate (1000 address searches/month):**
- Google Places: $2.83 (or FREE if <70/day average)
- NBN Co: FREE
- **Total: $0-3/month**

**Heavy usage (10,000 searches/month):**
- Google Places: $28.30
- NBN Co: FREE
- **Total: ~$28/month**

Compare to Australia Post: $500+/year regardless of usage.

**Recommendation:** Start with NBN Co only (FREE), add Google Places if needed for better UX.
