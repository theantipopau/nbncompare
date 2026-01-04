---
title: "ISP Routing and Regional Peering: Why Your NBN Speed Depends on More Than Just Your Plan"
slug: "isp-routing-peering-latency-explained"
excerpt: "Discover how ISP routing policies, peering agreements, and regional traffic routing affect your internet performance, latency, and gaming experience in Australia."
date: "2026-01-04"
author: "NBN Compare Team"
tags: ["Routing", "Peering", "Latency", "Technical", "Network Performance"]
---

# ISP Routing and Regional Peering: Why Geography Still Matters

You've got NBN 100, but your mate on the same plan with a different ISP gets better ping in games. Your video calls to Sydney lag despite having a fast connection in Melbourne. What gives?

**The answer: routing and peering.** Where your ISP sends your traffic matters as much as your connection speed.

## What is ISP Routing?

**Routing** is the path your internet traffic takes from your home to its destination.

```
Simple View:
You → Your ISP → Internet Backbone → Destination

Reality:
You → Your ISP → Regional Router → Transit Provider → 
Internet Exchange → Peering Point → Content Provider → Destination
```

Every "hop" adds latency. The path your ISP chooses dramatically affects your experience.

## The Problem: Regional Routing

### Example: Carbon Comms (Sydney-Only Routing)

Some smaller ISPs route ALL traffic through a single city:

```
You (Brisbane)
    ↓
Your Router
    ↓
Carbon Comms Infrastructure
    ↓
Sent to SYDNEY (even for Brisbane servers!)
    ↓
Routed back to Brisbane
    ↓
Destination (Brisbane)
```

**Result:** Traffic travels 2,000km+ for a destination 10km away!

### Real-World Impact

| Scenario | Direct Routing | Sydney-Only Routing |
|----------|---------------|---------------------|
| Brisbane → Brisbane Server | 2-5ms | 35-50ms |
| Perth → Perth Server | 1-3ms | 75-95ms |
| Adelaide → Adelaide Server | 2-4ms | 45-60ms |
| Melbourne → Sydney Server | 12-18ms | 15-22ms ✅ |

**If you're in Sydney:** Great latency everywhere  
**If you're anywhere else:** Unnecessary 30-80ms penalty

## Australian Internet Exchange Points (IXPs)

### Major Internet Exchanges in Australia

#### **IX Australia**
- **Locations:** Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra
- **Members:** 200+ ISPs, CDNs, cloud providers
- **Traffic:** 2+ Tbps peak
- **Best for:** Low-latency regional peering

#### **Equinix**
- **Locations:** Sydney, Melbourne
- **Members:** Global carriers, enterprises
- **Traffic:** High-capacity international links
- **Best for:** International connectivity

### How Peering Works

**Peering** = ISPs directly exchanging traffic instead of paying transit providers.

```
Good Peering:
Telstra Customer → Telstra → IX Australia (Melbourne) → 
Netflix Cache → Fast!

Bad Peering:
Budget ISP Customer → Budget ISP → Transit to Singapore → 
Back to Australia → Netflix → Slow!
```

## Types of ISP Routing Policies

### 1. **Multi-Region Peering** (Best)
**ISPs:** Aussie Broadband, Telstra, Optus, TPG

- Peer at multiple Australian exchanges
- Regional traffic stays regional
- Best latency across Australia
- More expensive infrastructure

**Example:** Aussie Broadband
- Peers in Sydney, Melbourne, Brisbane, Perth, Adelaide
- Brisbane users hit Brisbane exchange
- Perth users hit Perth exchange
- Optimal latency everywhere

### 2. **Single-Region Peering** (Common)
**ISPs:** Many mid-tier providers

- All traffic routed through one city (usually Sydney)
- Works well if you're in that city
- Poor latency if you're not
- Cheaper to operate

**Example:** Carbon Comms (before improvements)
- All traffic through Sydney
- Great for Sydney residents
- 30-80ms latency penalty for others
- Simple network topology

### 3. **International Transit** (Budget)
**ISPs:** Some budget providers

- Route through international carriers
- Traffic might leave Australia and return
- Highest latency
- Cheapest for ISP

**Example:** Some MVNO mobile carriers
- Route through Singapore or USA
- Can add 100-200ms to latency
- Fine for browsing, terrible for gaming

### 4. **Hybrid** (Reality)
**ISPs:** Most providers

- Mix of direct peering and transit
- Different paths for different destinations
- Cost vs performance tradeoff
- Varies by time of day

## How to Check Your ISP's Routing

### Method 1: Traceroute

**Windows PowerShell:**
```powershell
tracert google.com
tracert 1.1.1.1
tracert speedtest.telstra.com
```

**Mac/Linux:**
```bash
traceroute google.com
mtr google.com  # Real-time traceroute
```

**What to look for:**
- Number of hops (fewer = better)
- Hop locations (should stay local when possible)
- Latency at each hop

**Red flags:**
```
# Bad: Brisbane to Brisbane going via Sydney
1  10.0.0.1 (Your Router)           1 ms
2  100.64.1.1 (ISP)                 5 ms
3  syd-core1.isp.net.au            35 ms  ← Goes to Sydney!
4  bris-edge1.isp.net.au           45 ms  ← Comes back
5  server.bris.example.com         48 ms
```

### Method 2: Ping Regional Servers

Test latency to different cities:

```powershell
# Test Sydney
ping sydney.speedtest.telstra.com

# Test Melbourne
ping melbourne.speedtest.telstra.com

# Test Brisbane
ping brisbane.speedtest.telstra.com

# Test Perth
ping perth.speedtest.telstra.com
```

**What to expect:**

| Your Location | Sydney | Melbourne | Brisbane | Perth |
|--------------|--------|-----------|----------|-------|
| **Sydney** | 1-5ms | 12-18ms | 25-35ms | 60-75ms |
| **Melbourne** | 12-18ms | 1-5ms | 40-50ms | 55-70ms |
| **Brisbane** | 25-35ms | 40-50ms | 1-5ms | 70-85ms |
| **Perth** | 60-75ms | 55-70ms | 70-85ms | 1-5ms |

**If your local ping is 40ms+**, traffic is probably routing elsewhere first.

### Method 3: Looking Glass Tools

Many ISPs provide "Looking Glass" tools:
- See routing tables
- Check AS paths
- View BGP routes
- Identify peering points

**Australian Looking Glass Servers:**
- Aussie Broadband: lg.aussiebroadband.com.au
- Superloop: lg.superloop.com
- Telstra: lg.telstra.net

### Method 4: PeeringDB

Visit [peeringdb.com](https://www.peeringdb.com):
1. Search for your ISP
2. Check "Facilities" tab
3. See which exchanges they peer at
4. More locations = better routing

## Real-World Scenarios

### Gaming: Why Your Ping Matters

**Example: CS:GO Sydney Server**

| ISP | Location | Expected Ping | Actual Ping | Why? |
|-----|----------|---------------|-------------|------|
| Aussie BB | Sydney | 5ms | 6ms | ✅ Direct peering |
| Aussie BB | Melbourne | 14ms | 16ms | ✅ Regional exchange |
| Budget ISP | Sydney | 5ms | 8ms | ⚠️ Via transit |
| Budget ISP | Melbourne | 14ms | 45ms | ❌ Routes via Sydney |
| Budget ISP | Perth | 60ms | 125ms | ❌ International transit! |

**Impact:**
- **< 20ms:** Competitive gaming, no issues
- **20-50ms:** Playable, slight disadvantage
- **50-100ms:** Noticeable lag, frustrating
- **100ms+:** Nearly unplayable for fast-paced games

### Streaming: CDN Performance

**Netflix, YouTube, etc. use CDNs** (Content Delivery Networks) with servers in Australia.

**Ideal routing:**
```
You (Melbourne)
    ↓
Your ISP
    ↓
IX Australia (Melbourne)
    ↓
Netflix Cache (Melbourne)
    ↓
4K streaming, no buffering
```

**Poor routing:**
```
You (Melbourne)
    ↓
Your ISP
    ↓
Routes to Sydney
    ↓
Netflix Cache (Sydney)
    ↓
HD streams OK, 4K buffers
```

**ISPs with good CDN peering:**
- Host Netflix Open Connect caches locally
- Direct peering with Google, Cloudflare, Akamai
- Faster streaming, less buffering
- Doesn't count toward ISP backbone congestion

### Work From Home: Video Conferencing

**Zoom, Teams, Webex** use multiple data centers.

**Scenario: Melbourne → Sydney colleague**

| ISP Type | Your Routing | Expected Latency |
|----------|--------------|------------------|
| **Tier 1 ISP** | Melbourne → Sydney direct | 14-18ms ✅ |
| **Regional ISP** | Melbourne → Sydney direct | 16-22ms ✅ |
| **Sydney-Only ISP** | Melbourne → Sydney → Melbourne → Sydney | 30-40ms ⚠️ |
| **International Transit** | Melbourne → Singapore → Sydney | 80-150ms ❌ |

**Impact:**
- **< 50ms:** Natural conversation, no echo
- **50-150ms:** Slight delay, talking over each other
- **150ms+:** Frustrating, unusable

## ISPs and Their Routing Policies

### 🟢 **Tier 1: Multi-Region Peering**

#### **Telstra**
- **Peering:** Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra
- **Pros:** Best infrastructure, owns most backhaul
- **Cons:** Expensive
- **Best for:** Low latency everywhere, gaming, business

#### **Optus**
- **Peering:** Major cities, good regional presence
- **Pros:** Extensive network, good peering
- **Cons:** Can be congested at peak
- **Best for:** Major cities, reliable performance

#### **TPG/iiNet/Internode**
- **Peering:** All state capitals
- **Pros:** Good infrastructure, acquired regional networks
- **Cons:** Network integration ongoing
- **Best for:** Good all-rounder

#### **Aussie Broadband**
- **Peering:** Sydney, Melbourne, Brisbane, Perth, Adelaide
- **Pros:** Excellent peering strategy, transparent routing
- **Cons:** Smaller network than Tier 1s
- **Best for:** Gaming, enthusiasts, regional users

### 🟡 **Tier 2: Regional Peering**

#### **Superloop**
- **Peering:** Major cities, focus on business
- **Pros:** Good infrastructure, reliable
- **Cons:** Less regional presence
- **Best for:** Metro areas

#### **Exetel**
- **Peering:** Sydney, Melbourne, Brisbane
- **Pros:** Budget-friendly with decent routing
- **Cons:** Limited regional peering
- **Best for:** Price-conscious metro users

#### **Spintel**
- **Peering:** Major capitals
- **Pros:** Good gaming focus
- **Cons:** Smaller network
- **Best for:** Gamers in major cities

### 🔴 **Tier 3: Limited Peering**

#### **Budget ISPs** (Dodo, Kogan, etc.)
- **Peering:** Usually Sydney-only or via transit
- **Pros:** Cheap
- **Cons:** Higher latency outside Sydney, congestion
- **Best for:** Browsing, streaming (if you're in Sydney)

### **Regional/Wireless ISPs**
- **Peering:** Varies wildly
- **Pros:** Coverage in rural areas
- **Cons:** Often route via capital city
- **Best for:** Rural/remote, no NBN alternative

## How to Choose Based on Location

### Sydney Residents
- **Any major ISP works well** (Sydney is the internet hub)
- Even budget ISPs have OK latency
- Focus on price and features

### Melbourne Residents
- **Choose ISPs with Melbourne peering**
- Aussie BB, Telstra, Optus, TPG all good
- Avoid Sydney-only ISPs

### Brisbane Residents
- **Brisbane exchange access important**
- Aussie BB, Telstra, TPG recommended
- Sydney-only routing adds 25-35ms

### Perth Residents
- **Perth peering essential** (furthest from east coast)
- Telstra, Aussie BB best options
- Avoid anything routing via east coast
- Check latency tests carefully

### Adelaide Residents
- **Adelaide peering helpful**
- Major ISPs have presence
- Check if local exchange used

### Regional Areas
- **Physical distance matters most**
- Choose ISP with presence in nearest capital
- Satellite/wireless may route further
- Test before committing if possible

## Impact on Different Activities

### Gaming 🎮
**Most Affected**
- **Sensitivity:** High (every ms counts)
- **Recommendation:** Multi-region ISP with local peering
- **Check:** Ping to game servers before choosing ISP
- **Best:** Aussie BB, Telstra for competitive gaming

### Video Calls 💼
**Moderately Affected**
- **Sensitivity:** Medium (50ms+ noticeable)
- **Recommendation:** Avoid international transit
- **Check:** Test with colleagues in your region
- **Best:** Any Tier 1 or 2 ISP

### Streaming 📺
**Least Affected**
- **Sensitivity:** Low (buffering can compensate)
- **Recommendation:** ISP with CDN peering (Netflix, YouTube)
- **Check:** Does ISP host CDN caches?
- **Best:** Most major ISPs work fine

### Web Browsing 🌐
**Barely Affected**
- **Sensitivity:** Very low
- **Recommendation:** Any ISP works
- **Check:** Basic speed test sufficient

## Technical Deep Dive: BGP and AS Numbers

### Autonomous Systems (AS)

Each ISP has an AS number, indicating their routing domain.

**Major Australian ISPs:**
- **AS1221:** Telstra
- **AS4804:** Optus/Singtel
- **AS7545:** TPG
- **AS24115:** Aussie Broadband
- **AS38285:** Superloop

### BGP (Border Gateway Protocol)

**BGP decides internet routing:**
- ISPs announce their networks
- Routers choose shortest/cheapest/preferred path
- Updates propagate globally
- Can be manipulated (traffic engineering)

**Good BGP practices:**
- Short AS paths
- Local preference for regional traffic
- Direct peering agreements
- Redundant paths

**Bad BGP practices:**
- Long AS paths (many hops)
- Preferring cheap transit over good routing
- No local presence
- Single points of failure

## Future Trends

### 1. **More Regional Peering**
ISPs expanding to more cities to reduce latency.

### 2. **IPv6 Adoption**
Simpler routing, better end-to-end connectivity.

### 3. **Edge Computing**
Content moving closer to users (CDNs, gaming servers).

### 4. **Better Transit Competition**
More international cables, better prices, improved routing.

### 5. **5G and Wireless**
Mobile ISPs improving backhaul and peering.

## Key Takeaways

- **ISP routing matters as much as speed** for latency-sensitive tasks
- **Multi-region peering** provides best performance across Australia
- **Sydney-only routing** adds 30-80ms latency for non-Sydney users
- **Check traceroutes** to regional servers before choosing ISP
- **Perth users** especially need ISPs with Perth peering
- **Gaming and video calls** most affected by poor routing
- **Aussie BB, Telstra, Optus, TPG** generally have best routing

**Want low latency?** Check our [comparison tool](/compare) for ISP routing information, or look up ISPs on PeeringDB to see their exchange presence.

---

**Looking for an ISP with good routing in your city?** Use our [plan comparison](/compare) and filter by providers with regional peering infrastructure.