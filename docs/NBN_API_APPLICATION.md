# How to Apply for NBN Co Location API Access

## Overview
NBN Co provides **FREE** access to their Location API for developers. This API lets you:
- Search for Australian addresses
- Get NBN service qualification (FTTP/FTTC/FTTN/HFC/Fixed Wireless)
- Check service availability and maximum speeds
- Get detailed location data

**Cost:** FREE (no usage limits)
**Approval Time:** 1-2 business days

---

## Step-by-Step Application Process

### 1. Visit NBN Co Developer Portal

**Main Portal:** https://www.nbnco.com.au/develop

However, the developer portal appears to have been restructured. The Location API access is now handled through:

**Enterprise & Government API Portal:** https://www.nbnco.com.au/support/contact-us/enterprise-and-government-enquiries

### 2. Contact NBN Co for API Access

Since the self-service developer portal seems unavailable, you'll need to contact NBN Co directly:

**Email:** enterprisesales@nbnco.com.au

**Subject:** "Location API Access Request - NBN Compare Website"

**Email Template:**
```
Dear NBN Co API Team,

I am developing a public NBN plan comparison website called "NBN Compare" 
(https://nbncompare-web.pages.dev) that helps Australian consumers find 
and compare NBN plans from various providers.

I would like to request access to the NBN Co Location API to provide:
1. Address search functionality
2. NBN service qualification (technology type and availability)
3. Maximum speed tier information

This will help consumers make informed decisions about NBN plans 
available at their specific address.

Website Details:
- Domain: nbncompare-web.pages.dev (transitioning to custom domain)
- Purpose: Public NBN plan comparison tool
- Expected Usage: Low to moderate (residential consumer lookups)
- Contact: [Your Email]
- Phone: [Your Phone]

Could you please advise on the process to obtain API credentials 
for the Location API v2?

Thank you,
[Your Name]
[Your Company/Project Name]
```

### 3. Alternative: Check for Updated Developer Portal

Try these URLs to see if there's an updated portal:

- https://www.nbnco.com.au/learn/api-suite
- https://api.nbnco.net.au/ (requires existing credentials)
- https://www.nbnco.com.au/business/wholesale

### 4. What to Expect

Once approved, you'll receive:
- **API Base URL:** `https://api.nbnco.net.au/location/v2/`
- **Authentication:** Bearer token or API key
- **Documentation:** Detailed API specifications
- **Rate Limits:** Typically generous or unlimited for reasonable use

### 5. API Endpoints You'll Get Access To

**Address Search:**
```
POST https://api.nbnco.net.au/location/v2/address/search
```

**Service Qualification:**
```
GET https://api.nbnco.net.au/location/v2/address/{locationId}
```

**Response includes:**
- Technology type (FTTP/FTTC/FTTN/HFC/Fixed Wireless/Satellite)
- Service availability status
- Maximum speed tier
- Connection readiness
- Disconnection dates (if applicable)

---

## In The Meantime...

While waiting for NBN API approval, **your site is already live with OpenStreetMap address search!**

✅ **Currently Working:**
- Real address autocomplete (OpenStreetMap Nominatim - FREE)
- Address suggestions as you type
- Australian addresses only
- Simulated NBN qualification

Once you get NBN API credentials, just:
1. Add API key: `wrangler secret put NBN_API_KEY`
2. Uncomment NBN API code in `address.ts`
3. Deploy: `wrangler deploy`

No frontend changes needed - the API endpoint stays the same!

---

## Quick Checklist

- [ ] Email enterprisesales@nbnco.com.au requesting Location API access
- [ ] Include website details and intended use case
- [ ] Wait 1-2 business days for response
- [ ] Receive API credentials
- [ ] Add credentials to Cloudflare Worker
- [ ] Update code to use real NBN API
- [ ] Deploy and test

---

## Questions?

If you need help with the API integration once you get credentials, I can:
1. Update the code to use real NBN API calls
2. Add proper error handling
3. Cache responses in D1 database to reduce API calls
4. Add fallback logic if API is unavailable

Just let me know when you have the credentials! 🚀
