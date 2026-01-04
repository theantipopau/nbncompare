---
title: "IPv4 vs IPv6: What's the Difference and Why It Matters for Your NBN Connection"
slug: "ipv4-vs-ipv6-explained"
excerpt: "Understand the differences between IPv4 and IPv6 internet protocols, why the transition matters, and how it affects your NBN connection in Australia."
date: "2026-01-04"
author: "NBN Compare Team"
tags: ["IPv6", "IPv4", "Technical", "Internet Protocol", "Networking"]
---

# IPv4 vs IPv6: What's the Difference and Why It Matters

You might have seen "IPv6 support" listed in ISP features or noticed IPv6 settings in your router. But what exactly is IPv6, how does it differ from IPv4, and does it matter for your NBN connection?

## The Basics: What Are IPv4 and IPv6?

**IP (Internet Protocol)** is how devices find each other on the internet. Think of it like a postal address system for the digital world.

### IPv4 (The Old Standard)
- **Launched:** 1983
- **Format:** Four numbers (0-255) separated by dots
- **Example:** `192.168.1.1` or `8.8.8.8`
- **Total Addresses:** ~4.3 billion (4,294,967,296)
- **Problem:** We ran out in 2011

### IPv6 (The New Standard)
- **Launched:** 1998 (standardized), gaining adoption now
- **Format:** Eight groups of hexadecimal numbers
- **Example:** `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **Total Addresses:** 340 undecillion (340,282,366,920,938,463,463,374,607,431,768,211,456)
- **Future:** We'll never run out

## Why Did We Need IPv6?

### The IPv4 Crisis

With only 4.3 billion addresses, IPv4 seemed like plenty in 1983. But fast forward to 2026:

- **10+ billion internet devices** globally
- Multiple devices per person (phone, laptop, tablet, smart TV, IoT devices)
- Growing demand in Asia, Africa, and emerging markets
- Businesses requiring large IP blocks

**The math doesn't work.** We literally ran out of IPv4 addresses.

### Temporary Solutions (That Became Permanent)

Instead of fixing the problem properly, the industry implemented workarounds:

1. **NAT (Network Address Translation)** - Multiple devices share one public IP
2. **CGNAT (Carrier-Grade NAT)** - Multiple *customers* share one public IP
3. **IP address trading markets** - IPv4 addresses now sell for $30-50 each!

These workarounds have downsides. [Learn more about CGNAT problems](/blog/what-is-cgnat-carrier-grade-nat).

## Key Differences Between IPv4 and IPv6

| Feature | IPv4 | IPv6 |
|---------|------|------|
| **Address Length** | 32 bits | 128 bits |
| **Address Format** | Decimal (192.168.1.1) | Hexadecimal (2001:db8::1) |
| **Total Addresses** | 4.3 billion | 340 undecillion |
| **Configuration** | Manual or DHCP | Automatic (SLAAC) + DHCPv6 |
| **Security** | Optional (IPsec) | Built-in (IPsec mandatory) |
| **NAT Required** | Yes (usually) | No |
| **Header Size** | Variable (20-60 bytes) | Fixed (40 bytes) |
| **Fragmentation** | Routers can fragment | Only sender fragments |
| **Checksum** | Header checksum included | No header checksum |
| **Broadcast** | Yes | No (uses multicast) |

## What Does IPv6 Mean for You?

### ✅ Advantages of IPv6

#### 1. **No More CGNAT Issues**
Every device gets a unique global address:
- ✅ Port forwarding works naturally
- ✅ Host game servers without issues
- ✅ Direct device-to-device communication
- ✅ VPN setup is straightforward
- ✅ Security cameras work without cloud services

#### 2. **Better Performance** (In Theory)
- Simpler routing (smaller routing tables)
- No NAT translation overhead
- Better multicast support
- Stateless auto-configuration

#### 3. **Improved Security**
- IPsec built into the protocol (not just optional)
- Better end-to-end encryption
- Harder to do certain types of attacks
- More straightforward firewall rules

#### 4. **Future-Proof**
- No address exhaustion concerns
- IoT devices can have public addresses
- Simplifies network architecture
- Aligns with global internet standards

### ⚠️ Current Challenges

#### 1. **Limited Adoption**
As of 2026 in Australia:
- Only ~40-50% of ISPs offer native IPv6
- Many websites still IPv4-only
- Some apps and games don't support IPv6
- Corporate networks often IPv4-only

#### 2. **Compatibility Issues**
- Some older routers don't support IPv6
- Certain VPN services IPv4-only
- Legacy equipment may not work
- Some ISP-provided modems have buggy IPv6

#### 3. **Security Concerns**
- Firewalls need reconfiguration (every device is publicly addressable)
- Default configs may be insecure
- Scanning/reconnaissance is harder but still possible
- More complex to audit

#### 4. **Learning Curve**
- IPv6 addresses are harder to remember
- Different subnetting rules
- New troubleshooting techniques
- Admins need retraining

## How Does Dual-Stack Work?

Most ISPs offering IPv6 use **dual-stack**:

```
Your Device
    ↓
Both IPv4 and IPv6 simultaneously
    ↓
ISP routes based on destination
    ↓
IPv6 site? → Use IPv6
IPv4 site? → Use IPv4
```

**Benefits:**
- Works with all websites (old and new)
- Gradual transition, no "flag day"
- Falls back to IPv4 if IPv6 fails
- Best of both worlds

**How it prioritizes:**
Modern operating systems prefer IPv6 when available (called "Happy Eyeballs"). If IPv6 is slow or broken, they automatically fall back to IPv4.

## IPv6 Adoption in Australia

### 🟢 ISPs With Full IPv6 Support
- **Aussie Broadband** - Native dual-stack on all plans
- **Superloop** - Full IPv6 support
- **Internode/iiNet** - IPv6 available (TPG Group)
- **Exetel** - Native IPv6 on NBN

### 🟡 ISPs With Partial IPv6 Support
- **Telstra** - Rolling out, available on some plans
- **Optus** - Available but not default on all plans
- **TPG** - Available on newer plans

### 🔴 ISPs Without IPv6 (Yet)
- **Dodo** - No native IPv6 (as of 2026)
- **Vodafone** - Limited availability
- **Budget ISPs** - Generally no IPv6

**Check our [provider comparison](/compare) for current IPv6 support status.**

## Should You Care About IPv6?

### You Should Prioritize IPv6 If You:
- Want to avoid CGNAT problems
- Host game servers or services
- Are future-proofing your network
- Work in IT/development
- Have many IoT devices
- Need simplified network setup

### IPv6 Might Not Matter If You:
- Just browse, stream, and use social media
- Don't host anything
- Are happy with your current setup
- Don't have CGNAT issues
- Use cloud services for everything

## How to Check If You Have IPv6

### Method 1: Test Website
Visit [test-ipv6.com](https://test-ipv6.com) - it'll tell you instantly if IPv6 works.

### Method 2: Command Line

**Windows PowerShell:**
```powershell
Test-Connection -TargetName ipv6.google.com -IPv6
```

**Mac/Linux:**
```bash
ping6 ipv6.google.com
```

### Method 3: Check Router
1. Log into your router admin panel
2. Look for "IPv6" or "Internet" settings
3. Check if you have an IPv6 address (starts with `2001:` or similar)

## Setting Up IPv6

### For Most Users:
1. **Check ISP Support** - Contact your ISP or check their website
2. **Enable on Router** - Usually automatic with modern routers
3. **Enable on Devices** - Usually automatic (enabled by default)
4. **Test Connectivity** - Visit test-ipv6.com

### For Advanced Users:

#### Configure Router
Most modern routers auto-configure with:
- **SLAAC** (Stateless Address Autoconfiguration)
- **DHCPv6-PD** (Prefix Delegation from ISP)

#### Firewall Rules
⚠️ **Important:** Unlike IPv4 with NAT, every device is directly addressable with IPv6!

```
# Example: Block incoming by default, allow outgoing
ip6tables -P INPUT DROP
ip6tables -P FORWARD DROP
ip6tables -P OUTPUT ACCEPT
ip6tables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

### Common Issues

**Problem:** IPv6 shows as "No connectivity"
- Check if ISP provides native IPv6 (not all do)
- Verify router supports IPv6
- Try disabling/re-enabling IPv6
- Update router firmware

**Problem:** Slower than IPv4
- Could be ISP routing issue
- Try disabling IPv6 temporarily
- Report to ISP

**Problem:** Can't access some websites
- Very rare - most sites have both
- Disable IPv6 for that site specifically
- Report to website owner

## IPv6 Privacy Extensions

IPv6 addresses can contain your device's MAC address, which could track you across networks.

**Solution: Privacy Extensions (RFC 4941)**

- Generates random IPv6 addresses
- Changes periodically
- Enabled by default on Windows, Mac, most Linux distros
- Prevents long-term tracking

**To check on Windows:**
```powershell
netsh interface ipv6 show privacy
```

## The Future: IPv6-Only Networks

Some ISPs globally are moving to IPv6-only networks:
- T-Mobile USA: IPv6-only on mobile
- Reliance Jio (India): IPv6-only
- Uses NAT64/DNS64 for IPv4 sites

**Not happening soon in Australia**, but shows the direction of the internet.

## Performance: IPv4 vs IPv6

### Benchmarks Show:
- **Latency:** Usually identical (±1-2ms difference)
- **Throughput:** No significant difference
- **Routing:** IPv6 can be faster (fewer hops) or slower (less optimized paths)
- **Reality:** You won't notice a difference in daily use

**Why no major performance gap?**
- Both protocols fundamentally similar
- Modern routers handle both efficiently
- Internet speed bottlenecked by other factors (NBN speed, Wi-Fi, servers)

## Common Myths Debunked

### ❌ "IPv6 is faster"
**Reality:** Minimal difference. Your NBN speed tier and Wi-Fi quality matter far more.

### ❌ "IPv6 is more secure"
**Reality:** Security depends on configuration. IPv6 requires proper firewall rules since devices are directly addressable.

### ❌ "You need IPv6 to avoid CGNAT"
**Reality:** While IPv6 eliminates NAT entirely, you can also pay for a public IPv4 address ($5-15/month) to avoid CGNAT.

### ❌ "IPv6 will break things"
**Reality:** Dual-stack means everything works. IPv6 is additive, not replacing.

### ❌ "IPv6 adoption failed"
**Reality:** Growing steadily. Google reports ~40% of their traffic is IPv6 globally, higher in some regions.

## Key Takeaways

- **IPv4** is the old standard with 4.3 billion addresses (exhausted in 2011)
- **IPv6** provides 340 undecillion addresses (we'll never run out)
- **Dual-stack** lets you use both simultaneously
- **Benefits:** No CGNAT, better for hosting, future-proof
- **Challenges:** Not universal yet, requires firewall configuration
- **In Australia:** ~40-50% of ISPs offer native IPv6

**Want to avoid CGNAT and port forwarding issues?** Choose an ISP with native IPv6 support or pay for a public IPv4 address.

---

**Looking for an ISP with IPv6?** Use our [comparison tool](/compare) and filter by "IPv6 Support" to find providers offering modern connectivity.