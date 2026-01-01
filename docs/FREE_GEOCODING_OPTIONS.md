# Free Geocoding & Address Search Alternatives

Since Google Maps API costs money after the free tier, here are **completely FREE** alternatives for address autocomplete and geocoding:

---

## 1. ✅ OpenStreetMap + Nominatim (100% FREE - RECOMMENDED)

**What it is:** Community-driven map data with free geocoding API

**API Endpoint:**
```
https://nominatim.openstreetmap.org/search?q={address}&format=json&addressdetails=1&countrycodes=au&limit=5
```

**Cost:** **FREE** (unlimited with fair usage policy)

**Usage Policy:**
- Max 1 request per second
- Must include User-Agent header
- No heavy usage (cache results when possible)

**Example Implementation:**
```typescript
// apps/worker/src/handlers/address.ts

export async function searchAddress(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  
  if (!query || query.trim().length < 3) {
    return jsonResponse({ ok: false, error: "Query too short" }, 400);
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `countrycodes=au&` +
      `limit=5`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'NBNCompare/1.0 (nbncompare.com.au; contact@nbncompare.com.au)'
      }
    });

    const results = await response.json();
    
    const addresses = results.map((r: any) => ({
      id: r.place_id,
      formattedAddress: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      street: r.address?.road,
      suburb: r.address?.suburb,
      state: r.address?.state,
      postcode: r.address?.postcode
    }));

    return jsonResponse({ ok: true, results: addresses });
  } catch (err) {
    console.error('Nominatim error:', err);
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}
```

**Pros:**
- ✅ Completely FREE
- ✅ No API key required
- ✅ Good Australian coverage
- ✅ Returns structured address components
- ✅ No daily/monthly limits

**Cons:**
- ⚠️ Rate limit: 1 request/second (easily handled with debouncing)
- ⚠️ Less polished than Google (but good enough)
- ⚠️ Must respect usage policy

---

## 2. Photon (Komoot) - 100% FREE

**What it is:** Fast geocoding API based on OpenStreetMap data

**API Endpoint:**
```
https://photon.komoot.io/api?q={address}&limit=5&lang=en
```

**Cost:** **FREE** (unlimited)

**Example:**
```typescript
const photonUrl = `https://photon.komoot.io/api?` +
  `q=${encodeURIComponent(query)}&` +
  `limit=5&` +
  `lang=en`;

const response = await fetch(photonUrl);
const data = await response.json();

const addresses = data.features.map((f: any) => ({
  id: f.properties.osm_id,
  formattedAddress: f.properties.name,
  latitude: f.geometry.coordinates[1],
  longitude: f.geometry.coordinates[0],
  street: f.properties.street,
  suburb: f.properties.city,
  state: f.properties.state,
  postcode: f.properties.postcode
}));
```

**Pros:**
- ✅ Very fast
- ✅ No rate limits
- ✅ No API key
- ✅ GeoJSON format

**Cons:**
- ⚠️ Less detailed than Nominatim for some addresses

---

## 3. Geoapify - FREE Tier (3000 requests/day)

**What it is:** Commercial geocoding service with generous free tier

**API Endpoint:**
```
https://api.geoapify.com/v1/geocode/autocomplete?text={address}&filter=countrycode:au&apiKey={YOUR_KEY}
```

**Cost:** 
- **FREE: 3,000 requests/day**
- Paid: $1 per 1,000 after free tier

**Setup:**
1. Register: https://www.geoapify.com/
2. Get free API key
3. Add to Worker: `wrangler secret put GEOAPIFY_API_KEY`

**Example:**
```typescript
const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?` +
  `text=${encodeURIComponent(query)}&` +
  `filter=countrycode:au&` +
  `apiKey=${env.GEOAPIFY_API_KEY}`;

const response = await fetch(geoapifyUrl);
const data = await response.json();

const addresses = data.features.map((f: any) => ({
  id: f.properties.place_id,
  formattedAddress: f.properties.formatted,
  latitude: f.geometry.coordinates[1],
  longitude: f.geometry.coordinates[0]
}));
```

**Pros:**
- ✅ 3,000/day free (plenty for small sites)
- ✅ Fast and reliable
- ✅ Good Australian coverage
- ✅ Professional API

**Cons:**
- ⚠️ Requires API key
- ⚠️ Costs money after free tier

---

## 4. Mapbox - FREE Tier (100,000 requests/month)

**What it is:** Professional mapping platform with generous free tier

**API Endpoint:**
```
https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json?country=au&access_token={YOUR_TOKEN}
```

**Cost:**
- **FREE: 100,000 requests/month**
- Paid: $0.50 per 1,000 after free tier

**Setup:**
1. Register: https://account.mapbox.com/
2. Get free access token
3. Add to Worker: `wrangler secret put MAPBOX_TOKEN`

**Example:**
```typescript
const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
  `${encodeURIComponent(query)}.json?` +
  `country=au&` +
  `access_token=${env.MAPBOX_TOKEN}`;

const response = await fetch(mapboxUrl);
const data = await response.json();

const addresses = data.features.map((f: any) => ({
  id: f.id,
  formattedAddress: f.place_name,
  latitude: f.center[1],
  longitude: f.center[0]
}));
```

**Pros:**
- ✅ 100,000/month free (huge allowance)
- ✅ Excellent quality
- ✅ Fast and reliable
- ✅ Great documentation

**Cons:**
- ⚠️ Requires API key/token
- ⚠️ Costs money after free tier (but very generous)

---

## 5. NBN Co Location API - FREE for NBN Qualification

**What it is:** Official NBN address search and service qualification

**Status:** Requires developer registration at https://www.nbnco.com.au/develop/

**Cost:** **FREE** (no usage limits)

**What you get:**
- Official address search
- Service qualification (FTTP/FTTC/FTTN etc.)
- Maximum speed tiers
- Service availability status

**Registration Process:**
1. Visit https://www.nbnco.com.au/develop/
2. Create developer account
3. Request Location API access
4. Wait 1-2 business days for approval
5. Get API credentials

**API Endpoints:**
```
POST https://api.nbnco.net.au/location/v2/address/search
GET  https://api.nbnco.net.au/location/v2/address/{locationId}
```

**Best Approach:** Use NBN API for both address search AND qualification (all free!)

---

## Recommended Implementation Strategy

### **Option A: 100% Free (No Registration Required)**

**Stack:**
- **Nominatim (OpenStreetMap)** for address autocomplete
- **NBN Co API** for service qualification (requires registration but is free)

**Pros:**
- Zero cost forever
- No rate limits that matter
- No API keys needed for Nominatim

**Cons:**
- Must respect 1 req/sec for Nominatim (easily handled with debouncing)
- NBN API requires registration

### **Option B: Best Free Tier (Registration Required)**

**Stack:**
- **Mapbox** for address autocomplete (100k/month free)
- **NBN Co API** for service qualification

**Pros:**
- Professional quality
- Huge free allowance
- Faster than Nominatim

**Cons:**
- Requires API key registration
- Costs money if you exceed limits

### **Option C: NBN Co Only (Simplest)**

**Stack:**
- **NBN Co API** for both address search AND qualification

**Pros:**
- Single API to integrate
- Official NBN data
- Completely free
- Made for this exact purpose!

**Cons:**
- Requires developer registration
- Less sophisticated autocomplete than mapping services

---

## My Recommendation for NBN Compare

**Use NBN Co API for everything** - it's purpose-built for this use case!

Here's why:
1. ✅ **FREE** forever
2. ✅ **Official NBN data** (most accurate for service qualification)
3. ✅ **Address search included** (why use two APIs when one does both?)
4. ✅ **No rate limits**
5. ✅ **Made specifically for NBN service lookups**

**Only use Nominatim/Mapbox if:**
- NBN's address search UX isn't good enough
- You want richer map data
- You need lat/lng coordinates for mapping

---

## Implementation Code Ready

I can implement any of these options immediately. Just let me know:

1. **Go with Nominatim (OpenStreetMap)** - 100% free, no registration, works now
2. **Go with NBN Co API** - Best for your use case, requires registration (1-2 days)
3. **Go with Mapbox** - Best quality, requires registration, huge free tier

Which would you prefer?

---

## Quick Setup: Nominatim (Can do right now)

Want me to implement Nominatim right now? It's free and works immediately:

```bash
# No setup needed! Just deploy the updated code
cd apps/worker
# (I update the address.ts file)
wrangler deploy

cd ../web
pnpm build
wrangler pages deploy dist --project-name=nbncompare-web
```

Live in 2 minutes! 🚀
