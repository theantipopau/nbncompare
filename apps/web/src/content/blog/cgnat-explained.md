---
title: "What is CGNAT? Understanding Carrier-Grade NAT and Its Limitations"
slug: "what-is-cgnat-carrier-grade-nat"
excerpt: "Learn about CGNAT (Carrier-Grade NAT), why ISPs use it, and how it affects your internet connection. Understand the restrictions on port forwarding, hosting servers, and remote access."
date: "2026-01-04"
author: "NBN Compare Team"
tags: ["CGNAT", "NAT", "IPv4", "Technical", "Networking"]
---

# What is CGNAT? Understanding Carrier-Grade NAT and Its Limitations

If you've tried to set up port forwarding, host a game server, or access your home network remotely and run into issues, CGNAT might be the culprit. Let's break down what it is and why it matters.

## What is CGNAT?

**CGNAT (Carrier-Grade NAT)** is a technology that allows multiple customers to share a single public IPv4 address. Think of it as your ISP adding an extra layer of NAT (Network Address Translation) before your connection reaches the internet.

### How it Works

```
Your Device → Your Router (NAT) → ISP's CGNAT (Another NAT) → Internet
     10.x.x.x       100.64.x.x            Public IPv4
```

Instead of getting a unique public IP address, you're assigned a private IP from the `100.64.0.0/10` range (known as "shared address space"). Your ISP then translates this to a public IP that's shared among many customers.

## Why Do ISPs Use CGNAT?

### 1. **IPv4 Address Exhaustion**
The world has run out of IPv4 addresses. With billions of devices online, there simply aren't enough public IPv4 addresses to go around. CGNAT lets ISPs serve thousands of customers with just a handful of public IPs.

### 2. **Cost Savings**
Public IPv4 addresses are expensive - they can cost $30-50 each on the open market. By using CGNAT, ISPs can dramatically reduce their IP address costs.

### 3. **Easier Network Management**
CGNAT simplifies routing and reduces the complexity of managing large networks, especially as ISPs transition to IPv6.

## What Doesn't Work Behind CGNAT?

### ❌ Port Forwarding
**Impact:** Can't open ports to host services  
**Affected:** Game servers, Plex, home automation, CCTV remote access

You can't forward ports from the internet to your devices because you don't have a unique public IP. Other users share your public IP, so there's no way for incoming connections to know which customer to route to.

### ❌ Hosting Servers
**Impact:** Can't run public-facing servers  
**Affected:** Web servers, game servers, FTP servers, mail servers

Without port forwarding, you can't make your local servers accessible from the internet. This affects gamers who want to host multiplayer sessions, developers running home labs, and anyone wanting to share files.

### ❌ Remote Desktop & VPN
**Impact:** Difficult to access home network remotely  
**Affected:** Remote desktop (RDP), VPN servers, SSH access

Standard VPN protocols that require port forwarding (like OpenVPN, WireGuard) won't work without workarounds. You'll need cloud-based solutions or reverse tunnels.

### ❌ Some Online Gaming
**Impact:** NAT type issues, can't host matches  
**Affected:** P2P games, hosting lobbies, voice chat quality

Games that use peer-to-peer connections may struggle with "Strict NAT" or "NAT Type 3" warnings. You might not be able to host game sessions or experience connection problems.

### ❌ Security Camera Remote Access
**Impact:** Can't view cameras remotely without cloud subscription  
**Affected:** Direct IP camera access, NVR remote viewing

Most affordable security cameras rely on port forwarding for remote access. Behind CGNAT, you're forced to use cloud services (often with monthly fees) or more complex solutions.

### ❌ BitTorrent Performance
**Impact:** Reduced download speeds, can't accept incoming connections  
**Affected:** Legal torrent downloads, Plex syncing

Your BitTorrent client will show "Not connectable" status, meaning you can only initiate connections, not receive them. This typically halves your available peer pool.

## What Still Works?

✅ **General web browsing** - No issues  
✅ **Streaming** - Netflix, YouTube, etc. work perfectly  
✅ **Online gaming (client mode)** - Playing games works fine, just can't host  
✅ **Video calls** - Zoom, Teams, etc. use techniques to work around NAT  
✅ **Most apps** - Anything that doesn't require incoming connections

## How to Check if You Have CGNAT

### Method 1: Check Your Router's WAN IP
1. Log into your router's admin panel
2. Look at the "WAN IP" or "Public IP" address
3. If it starts with `100.64.x.x`, `10.x.x.x`, `172.16-31.x.x`, or `192.168.x.x`, you're behind CGNAT

### Method 2: Compare IPs
1. Check your router's public IP
2. Visit [whatismyip.com](https://www.whatismyip.com)
3. If they don't match, you're behind CGNAT

## Solutions and Workarounds

### 1. **Request a Public IP** (Best Solution)
Many ISPs offer public IPv4 addresses for $5-15/month extra:
- **Aussie Broadband:** $5/month for static IP, no CGNAT
- **Superloop:** Static IP available, opt-out of CGNAT
- **Telstra/Optus:** Usually have public IPs by default on NBN

### 2. **Use IPv6** (Future-Proof)
If your ISP provides native IPv6:
- Every device gets a globally routable IPv6 address
- No NAT needed, port forwarding works naturally
- Check our [IPv4 vs IPv6 guide](/blog/ipv4-vs-ipv6-explained) for details

### 3. **Cloud-Based VPN** (Workaround)
Services like Tailscale, ZeroTier, or ngrok create encrypted tunnels:
- Works behind CGNAT
- No port forwarding needed
- Small latency penalty
- Some services free, some paid

### 4. **Cloudflare Tunnel** (For Web Services)
Free service to expose web services:
- Perfect for home web servers
- No exposed ports needed
- Built-in DDoS protection
- Only works for HTTP/HTTPS

### 5. **Reverse SSH Tunnel** (Advanced)
Use a VPS to tunnel traffic:
- Rent a cheap VPS ($5/month)
- Create reverse SSH tunnel
- Requires technical knowledge

## Australian ISPs and CGNAT

### 🟢 ISPs Without CGNAT (or Opt-Out Available)
- **Aussie Broadband** - Public IP $5/month
- **Superloop** - Can opt-out of CGNAT
- **Telstra** - Usually public IP on NBN
- **Optus** - Public IP on most NBN plans
- **Exetel** - Static IP available

### 🟡 ISPs With CGNAT (Some Plans)
- **TPG/iiNet** - CGNAT on some plans, static IP available
- **Vodafone** - CGNAT common, public IP on request
- **Spintel** - CGNAT default, upgrades available

### 🔴 ISPs With CGNAT (Limited Options)
- **Dodo** - CGNAT standard, expensive to upgrade
- **Kogan** - CGNAT on most plans
- **Budget ISPs** - Generally use CGNAT to reduce costs

*Check our [provider comparison](/compare) for detailed CGNAT information on each ISP.*

## Should You Avoid CGNAT?

**It depends on your needs:**

### You DON'T Need to Worry If You:
- Only browse, stream, and use social media
- Play online games but don't host servers
- Use cloud services for everything
- Don't need remote access to your home network

### You SHOULD Avoid CGNAT If You:
- Host game servers or multiplayer sessions
- Need VPN access to your home network
- Run a Plex server for remote streaming
- Work from home with remote desktop
- Have security cameras you want to access directly
- Use home automation systems requiring remote access
- Need to access your NAS remotely
- Run any kind of server (web, mail, file)

## The IPv6 Solution

CGNAT exists because of IPv4 exhaustion. IPv6 solves this problem permanently:
- **340 undecillion addresses** (that's 340 trillion trillion trillion!)
- Every device gets a unique global address
- No NAT needed
- Port forwarding works naturally

The transition is happening, but slowly. In the meantime, if you need features blocked by CGNAT, your best bet is:
1. Choose an ISP that offers public IPs
2. Pay for a static IP add-on ($5-15/month)
3. Use IPv6 if available

## Key Takeaways

- **CGNAT** shares one public IP among many customers
- **Why:** IPv4 addresses have run out, they're expensive
- **Problems:** Blocks port forwarding, hosting, remote access
- **Solutions:** Pay for public IP, use IPv6, or cloud VPN services
- **Check our comparison:** Filter by "No CGNAT" to find suitable ISPs

---

**Need an ISP without CGNAT?** Use our [plan comparison tool](/compare) and filter by providers that offer public IPv4 addresses or easy CGNAT opt-out options.