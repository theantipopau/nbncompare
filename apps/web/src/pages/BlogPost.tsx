import React from "react";
import { usePageTitle } from "../lib/usePageTitle";

interface BlogPostContent {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}

const blogContent: Record<string, BlogPostContent> = {
  "what-is-cgnat-carrier-grade-nat": {
    slug: "what-is-cgnat-carrier-grade-nat",
    title: "What is CGNAT? Understanding Carrier-Grade NAT and Its Limitations",
    date: "2026-01-04",
    readTime: "12 min read",
    category: "Technical",
    content: (
      <>
        <p>If you've tried to set up port forwarding, host a game server, or access your home network remotely and run into issues, CGNAT might be the culprit. Let's break down what it is and why it matters.</p>
        
        <h2>What is CGNAT?</h2>
        <p><strong>CGNAT (Carrier-Grade NAT)</strong> is a technology that allows multiple customers to share a single public IPv4 address. Think of it as your ISP adding an extra layer of NAT (Network Address Translation) before your connection reaches the internet.</p>
        
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'monospace', margin: '20px 0' }}>
          Your Device → Your Router (NAT) → ISP's CGNAT (Another NAT) → Internet<br/>
          &nbsp;&nbsp;10.x.x.x&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;100.64.x.x&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Public IPv4
        </div>

        <h2>Why Do ISPs Use CGNAT?</h2>
        <h3>1. IPv4 Address Exhaustion</h3>
        <p>The world has run out of IPv4 addresses. With billions of devices online, there simply aren't enough public IPv4 addresses to go around. CGNAT lets ISPs serve thousands of customers with just a handful of public IPs.</p>

        <h3>2. Cost Savings</h3>
        <p>Public IPv4 addresses are expensive - they can cost $30-50 each on the open market. By using CGNAT, ISPs can dramatically reduce their IP address costs.</p>

        <h2>What Doesn't Work Behind CGNAT?</h2>
        
        <h3>❌ Port Forwarding</h3>
        <p><strong>Impact:</strong> Can't open ports to host services<br/>
        <strong>Affected:</strong> Game servers, Plex, home automation, CCTV remote access</p>
        <p>You can't forward ports from the internet to your devices because you don't have a unique public IP. Other users share your public IP, so there's no way for incoming connections to know which customer to route to.</p>

        <h3>❌ Hosting Servers</h3>
        <p><strong>Impact:</strong> Can't run public-facing servers<br/>
        <strong>Affected:</strong> Web servers, game servers, FTP servers, mail servers</p>

        <h3>❌ Remote Desktop & VPN</h3>
        <p><strong>Impact:</strong> Difficult to access home network remotely<br/>
        <strong>Affected:</strong> Remote desktop (RDP), VPN servers, SSH access</p>

        <h3>❌ Some Online Gaming</h3>
        <p><strong>Impact:</strong> NAT type issues, can't host matches<br/>
        <strong>Affected:</strong> P2P games, hosting lobbies, voice chat quality</p>

        <h2>How to Check if You Have CGNAT</h2>
        
        <h3>Method 1: Check Your Router's WAN IP</h3>
        <ol>
          <li>Log into your router's admin panel</li>
          <li>Look at the "WAN IP" or "Public IP" address</li>
          <li>If it starts with <code>100.64.x.x</code>, <code>10.x.x.x</code>, <code>172.16-31.x.x</code>, or <code>192.168.x.x</code>, you're behind CGNAT</li>
        </ol>

        <h3>Method 2: Compare IPs</h3>
        <ol>
          <li>Check your router's public IP</li>
          <li>Visit whatismyip.com</li>
          <li>If they don't match, you're behind CGNAT</li>
        </ol>

        <h2>Solutions and Workarounds</h2>

        <h3>1. Request a Public IP (Best Solution)</h3>
        <p>Many ISPs offer public IPv4 addresses for $5-15/month extra:</p>
        <ul>
          <li><strong>Aussie Broadband:</strong> $5/month for static IP, no CGNAT</li>
          <li><strong>Superloop:</strong> Static IP available, opt-out of CGNAT</li>
          <li><strong>Telstra/Optus:</strong> Usually have public IPs by default on NBN</li>
        </ul>

        <h3>2. Use IPv6 (Future-Proof)</h3>
        <p>If your ISP provides native IPv6, every device gets a globally routable IPv6 address. No NAT needed, port forwarding works naturally.</p>

        <h3>3. Cloud-Based VPN (Workaround)</h3>
        <p>Services like Tailscale, ZeroTier, or ngrok create encrypted tunnels that work behind CGNAT.</p>

        <h2>Australian ISPs and CGNAT</h2>
        
        <h3>🟢 ISPs Without CGNAT (or Opt-Out Available)</h3>
        <ul>
          <li><strong>Aussie Broadband</strong> - Public IP $5/month</li>
          <li><strong>Superloop</strong> - Can opt-out of CGNAT</li>
          <li><strong>Telstra</strong> - Usually public IP on NBN</li>
          <li><strong>Optus</strong> - Public IP on most NBN plans</li>
        </ul>

        <h3>🟡 ISPs With CGNAT (Some Plans)</h3>
        <ul>
          <li><strong>TPG/iiNet</strong> - CGNAT on some plans, static IP available</li>
          <li><strong>Vodafone</strong> - CGNAT common, public IP on request</li>
        </ul>

        <h3>🔴 ISPs With CGNAT (Limited Options)</h3>
        <ul>
          <li><strong>Dodo</strong> - CGNAT standard, expensive to upgrade</li>
          <li><strong>Kogan</strong> - CGNAT on most plans</li>
          <li><strong>Budget ISPs</strong> - Generally use CGNAT to reduce costs</li>
        </ul>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Key Takeaways</h3>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>CGNAT</strong> shares one public IP among many customers</li>
            <li><strong>Why:</strong> IPv4 addresses have run out, they're expensive</li>
            <li><strong>Problems:</strong> Blocks port forwarding, hosting, remote access</li>
            <li><strong>Solutions:</strong> Pay for public IP, use IPv6, or cloud VPN services</li>
          </ul>
        </div>
      </>
    )
  },
  "ipv4-vs-ipv6-explained": {
    slug: "ipv4-vs-ipv6-explained",
    title: "IPv4 vs IPv6: What's the Difference and Why It Matters",
    date: "2026-01-04",
    readTime: "15 min read",
    category: "Technical",
    content: (
      <>
        <p>You might have seen "IPv6 support" listed in ISP features or noticed IPv6 settings in your router. But what exactly is IPv6, how does it differ from IPv4, and does it matter for your NBN connection?</p>
        
        <h2>The Basics: What Are IPv4 and IPv6?</h2>
        <p><strong>IP (Internet Protocol)</strong> is how devices find each other on the internet. Think of it like a postal address system for the digital world.</p>

        <h3>IPv4 (The Old Standard)</h3>
        <ul>
          <li><strong>Launched:</strong> 1983</li>
          <li><strong>Format:</strong> Four numbers (0-255) separated by dots</li>
          <li><strong>Example:</strong> 192.168.1.1 or 8.8.8.8</li>
          <li><strong>Total Addresses:</strong> ~4.3 billion</li>
          <li><strong>Problem:</strong> We ran out in 2011</li>
        </ul>

        <h3>IPv6 (The New Standard)</h3>
        <ul>
          <li><strong>Launched:</strong> 1998 (standardized), gaining adoption now</li>
          <li><strong>Format:</strong> Eight groups of hexadecimal numbers</li>
          <li><strong>Example:</strong> 2001:0db8:85a3:0000:0000:8a2e:0370:7334</li>
          <li><strong>Total Addresses:</strong> 340 undecillion</li>
          <li><strong>Future:</strong> We'll never run out</li>
        </ul>

        <h2>Key Differences</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Feature</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>IPv4</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>IPv6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Address Length</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>32 bits</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>128 bits</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Total Addresses</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>4.3 billion</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>340 undecillion</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>NAT Required</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Yes (usually)</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>No</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Security</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Optional (IPsec)</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Built-in (IPsec mandatory)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>What Does IPv6 Mean for You?</h2>

        <h3>✅ Advantages of IPv6</h3>
        
        <h4>1. No More CGNAT Issues</h4>
        <p>Every device gets a unique global address:</p>
        <ul>
          <li>✅ Port forwarding works naturally</li>
          <li>✅ Host game servers without issues</li>
          <li>✅ Direct device-to-device communication</li>
          <li>✅ VPN setup is straightforward</li>
        </ul>

        <h4>2. Better Performance (In Theory)</h4>
        <ul>
          <li>Simpler routing (smaller routing tables)</li>
          <li>No NAT translation overhead</li>
          <li>Better multicast support</li>
        </ul>

        <h4>3. Improved Security</h4>
        <ul>
          <li>IPsec built into the protocol</li>
          <li>Better end-to-end encryption</li>
          <li>More straightforward firewall rules</li>
        </ul>

        <h3>⚠️ Current Challenges</h3>

        <h4>1. Limited Adoption</h4>
        <p>As of 2026 in Australia:</p>
        <ul>
          <li>Only ~40-50% of ISPs offer native IPv6</li>
          <li>Many websites still IPv4-only</li>
          <li>Some apps and games don't support IPv6</li>
        </ul>

        <h4>2. Compatibility Issues</h4>
        <ul>
          <li>Some older routers don't support IPv6</li>
          <li>Certain VPN services IPv4-only</li>
          <li>Legacy equipment may not work</li>
        </ul>

        <h2>How Does Dual-Stack Work?</h2>
        <p>Most ISPs offering IPv6 use <strong>dual-stack</strong>:</p>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'monospace', margin: '20px 0' }}>
          Your Device<br/>
          &nbsp;&nbsp;↓<br/>
          Both IPv4 and IPv6 simultaneously<br/>
          &nbsp;&nbsp;↓<br/>
          ISP routes based on destination<br/>
          &nbsp;&nbsp;↓<br/>
          IPv6 site? → Use IPv6<br/>
          IPv4 site? → Use IPv4
        </div>

        <h2>IPv6 Adoption in Australia</h2>

        <h3>🟢 ISPs With Full IPv6 Support</h3>
        <ul>
          <li><strong>Aussie Broadband</strong> - Native dual-stack on all plans</li>
          <li><strong>Superloop</strong> - Full IPv6 support</li>
          <li><strong>Internode/iiNet</strong> - IPv6 available (TPG Group)</li>
          <li><strong>Exetel</strong> - Native IPv6 on NBN</li>
        </ul>

        <h3>🟡 ISPs With Partial IPv6 Support</h3>
        <ul>
          <li><strong>Telstra</strong> - Rolling out, available on some plans</li>
          <li><strong>Optus</strong> - Available but not default on all plans</li>
          <li><strong>TPG</strong> - Available on newer plans</li>
        </ul>

        <h3>🔴 ISPs Without IPv6 (Yet)</h3>
        <ul>
          <li><strong>Dodo</strong> - No native IPv6 (as of 2026)</li>
          <li><strong>Vodafone</strong> - Limited availability</li>
          <li><strong>Budget ISPs</strong> - Generally no IPv6</li>
        </ul>

        <h2>Should You Care About IPv6?</h2>

        <h3>You Should Prioritize IPv6 If You:</h3>
        <ul>
          <li>Want to avoid CGNAT problems</li>
          <li>Host game servers or services</li>
          <li>Are future-proofing your network</li>
          <li>Work in IT/development</li>
          <li>Have many IoT devices</li>
        </ul>

        <h3>IPv6 Might Not Matter If You:</h3>
        <ul>
          <li>Just browse, stream, and use social media</li>
          <li>Don't host anything</li>
          <li>Are happy with your current setup</li>
          <li>Don't have CGNAT issues</li>
        </ul>

        <h2>How to Check If You Have IPv6</h2>
        <ol>
          <li>Visit <strong>test-ipv6.com</strong></li>
          <li>It'll tell you instantly if IPv6 works</li>
          <li>Check your router for IPv6 address (starts with 2001: or similar)</li>
        </ol>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Key Takeaways</h3>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>IPv4</strong> is the old standard with 4.3 billion addresses (exhausted)</li>
            <li><strong>IPv6</strong> provides 340 undecillion addresses (we'll never run out)</li>
            <li><strong>Dual-stack</strong> lets you use both simultaneously</li>
            <li><strong>Benefits:</strong> No CGNAT, better for hosting, future-proof</li>
            <li>~40-50% of Australian ISPs offer native IPv6</li>
          </ul>
        </div>
      </>
    )
  },
  "isp-routing-peering-latency-explained": {
    slug: "isp-routing-peering-latency-explained",
    title: "ISP Routing and Regional Peering: Why Your NBN Speed Depends on More Than Just Your Plan",
    date: "2026-01-04",
    readTime: "18 min read",
    category: "Technical",
    content: (
      <>
        <p>You've got NBN 100, but your mate on the same plan with a different ISP gets better ping in games. Your video calls to Sydney lag despite having a fast connection in Melbourne. What gives?</p>
        <p><strong>The answer: routing and peering.</strong> Where your ISP sends your traffic matters as much as your connection speed.</p>
        
        <h2>What is ISP Routing?</h2>
        <p><strong>Routing</strong> is the path your internet traffic takes from your home to its destination.</p>
        
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'monospace', margin: '20px 0', fontSize: '0.9em' }}>
          <strong>Simple View:</strong><br/>
          You → Your ISP → Internet Backbone → Destination<br/>
          <br/>
          <strong>Reality:</strong><br/>
          You → Your ISP → Regional Router → Transit Provider →<br/>
          Internet Exchange → Peering Point → Content Provider → Destination
        </div>

        <p>Every "hop" adds latency. The path your ISP chooses dramatically affects your experience.</p>

        <h2>The Problem: Regional Routing</h2>

        <h3>Example: Sydney-Only Routing</h3>
        <p>Some smaller ISPs route ALL traffic through a single city:</p>
        
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
          <p><strong>You (Brisbane)</strong><br/>
          &nbsp;&nbsp;↓<br/>
          Your Router<br/>
          &nbsp;&nbsp;↓<br/>
          ISP Infrastructure<br/>
          &nbsp;&nbsp;↓<br/>
          <strong>Sent to SYDNEY (even for Brisbane servers!)</strong><br/>
          &nbsp;&nbsp;↓<br/>
          Routed back to Brisbane<br/>
          &nbsp;&nbsp;↓<br/>
          Destination (Brisbane)</p>
        </div>

        <p><strong>Result:</strong> Traffic travels 2,000km+ for a destination 10km away!</p>

        <h2>Real-World Impact</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Scenario</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Direct Routing</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Sydney-Only Routing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Brisbane → Brisbane Server</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>2-5ms</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>35-50ms</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Perth → Perth Server</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>1-3ms</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>75-95ms</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Adelaide → Adelaide Server</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>2-4ms</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>45-60ms</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Melbourne → Sydney Server</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>12-18ms</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>15-22ms ✅</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p><strong>If you're in Sydney:</strong> Great latency everywhere<br/>
        <strong>If you're anywhere else:</strong> Unnecessary 30-80ms penalty</p>

        <h2>Types of ISP Routing Policies</h2>

        <h3>1. Multi-Region Peering (Best)</h3>
        <p><strong>ISPs:</strong> Aussie Broadband, Telstra, Optus, TPG</p>
        <ul>
          <li>Peer at multiple Australian exchanges</li>
          <li>Regional traffic stays regional</li>
          <li>Best latency across Australia</li>
          <li>More expensive infrastructure</li>
        </ul>

        <h3>2. Single-Region Peering (Common)</h3>
        <p><strong>ISPs:</strong> Many mid-tier providers</p>
        <ul>
          <li>All traffic routed through one city (usually Sydney)</li>
          <li>Works well if you're in that city</li>
          <li>Poor latency if you're not</li>
          <li>Cheaper to operate</li>
        </ul>

        <h3>3. International Transit (Budget)</h3>
        <p><strong>ISPs:</strong> Some budget providers</p>
        <ul>
          <li>Route through international carriers</li>
          <li>Traffic might leave Australia and return</li>
          <li>Highest latency</li>
          <li>Cheapest for ISP</li>
        </ul>

        <h2>How to Check Your ISP's Routing</h2>

        <h3>Method 1: Traceroute</h3>
        <p><strong>Windows PowerShell:</strong></p>
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'monospace', margin: '10px 0' }}>
          tracert google.com<br/>
          tracert 1.1.1.1
        </div>

        <p><strong>What to look for:</strong></p>
        <ul>
          <li>Number of hops (fewer = better)</li>
          <li>Hop locations (should stay local when possible)</li>
          <li>Latency at each hop</li>
        </ul>

        <h3>Method 2: Ping Regional Servers</h3>
        <p>Test latency to different cities:</p>
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'monospace', margin: '10px 0' }}>
          ping sydney.speedtest.telstra.com<br/>
          ping melbourne.speedtest.telstra.com<br/>
          ping brisbane.speedtest.telstra.com<br/>
          ping perth.speedtest.telstra.com
        </div>

        <p><strong>What to expect:</strong></p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', fontSize: '0.9em' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Your Location</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Sydney</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Melbourne</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Brisbane</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Perth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Sydney</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>1-5ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>12-18ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>25-35ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>60-75ms</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Melbourne</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>12-18ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>1-5ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>40-50ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>55-70ms</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Brisbane</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>25-35ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>40-50ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>1-5ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>70-85ms</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Perth</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>60-75ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>55-70ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>70-85ms</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>1-5ms</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p><strong>If your local ping is 40ms+</strong>, traffic is probably routing elsewhere first.</p>

        <h2>Impact on Different Activities</h2>

        <h3>Gaming 🎮 (Most Affected)</h3>
        <ul>
          <li><strong>Sensitivity:</strong> High (every ms counts)</li>
          <li><strong>Recommendation:</strong> Multi-region ISP with local peering</li>
          <li><strong>Best:</strong> Aussie BB, Telstra for competitive gaming</li>
        </ul>

        <h3>Video Calls 💼 (Moderately Affected)</h3>
        <ul>
          <li><strong>Sensitivity:</strong> Medium (50ms+ noticeable)</li>
          <li><strong>Recommendation:</strong> Avoid international transit</li>
          <li><strong>Best:</strong> Any Tier 1 or 2 ISP</li>
        </ul>

        <h3>Streaming 📺 (Least Affected)</h3>
        <ul>
          <li><strong>Sensitivity:</strong> Low (buffering can compensate)</li>
          <li><strong>Recommendation:</strong> ISP with CDN peering</li>
          <li><strong>Best:</strong> Most major ISPs work fine</li>
        </ul>

        <h2>How to Choose Based on Location</h2>

        <h3>Sydney Residents</h3>
        <ul>
          <li>Any major ISP works well (Sydney is the internet hub)</li>
          <li>Even budget ISPs have OK latency</li>
          <li>Focus on price and features</li>
        </ul>

        <h3>Melbourne Residents</h3>
        <ul>
          <li>Choose ISPs with Melbourne peering</li>
          <li>Aussie BB, Telstra, Optus, TPG all good</li>
          <li>Avoid Sydney-only ISPs</li>
        </ul>

        <h3>Brisbane Residents</h3>
        <ul>
          <li>Brisbane exchange access important</li>
          <li>Aussie BB, Telstra, TPG recommended</li>
          <li>Sydney-only routing adds 25-35ms</li>
        </ul>

        <h3>Perth Residents</h3>
        <ul>
          <li><strong>Perth peering essential</strong> (furthest from east coast)</li>
          <li>Telstra, Aussie BB best options</li>
          <li>Avoid anything routing via east coast</li>
          <li>Check latency tests carefully</li>
        </ul>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Key Takeaways</h3>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>ISP routing matters as much as speed</strong> for latency-sensitive tasks</li>
            <li><strong>Multi-region peering</strong> provides best performance across Australia</li>
            <li><strong>Sydney-only routing</strong> adds 30-80ms latency for non-Sydney users</li>
            <li><strong>Check traceroutes</strong> to regional servers before choosing ISP</li>
            <li><strong>Perth users</strong> especially need ISPs with Perth peering</li>
            <li><strong>Aussie BB, Telstra, Optus, TPG</strong> generally have best routing</li>
          </ul>
        </div>
      </>
    )
  },
  "how-to-choose-nbn-plan": {
    slug: "how-to-choose-nbn-plan",
    title: "How to Choose the Right NBN Plan for Your Needs",
    date: "2026-01-02",
    readTime: "5 min read",
    category: "Guides",
    content: (
      <>
        <p>Choosing an NBN plan doesn't have to be complicated. By understanding your needs and usage patterns, you can find the perfect plan that balances speed, price, and reliability.</p>
        
        <h2>1. Assess Your Household Size and Usage</h2>
        <p>The number of people and devices in your home directly impacts your bandwidth needs:</p>
        <ul>
          <li><strong>1-2 people:</strong> 25-50 Mbps is typically sufficient for browsing, emails, and streaming.</li>
          <li><strong>3-4 people:</strong> 50-100 Mbps handles multiple devices, 4K streaming, and video calls.</li>
          <li><strong>5+ people:</strong> 100-250 Mbps or higher for heavy usage, gaming, and simultaneous streaming.</li>
        </ul>

        <h2>2. Consider Your Internet Activities</h2>
        <p>Different activities require different speeds:</p>
        <ul>
          <li><strong>Light use</strong> (email, browsing): 25 Mbps</li>
          <li><strong>HD streaming:</strong> 50 Mbps</li>
          <li><strong>4K streaming & online gaming:</strong> 100 Mbps</li>
          <li><strong>Large file transfers, multiple 4K streams:</strong> 250+ Mbps</li>
        </ul>

        <h2>3. Budget Considerations</h2>
        <p>NBN plans range from $50-$150+ per month. Don't overpay for speed you won't use. Look for:</p>
        <ul>
          <li>Promotional pricing for new customers</li>
          <li>Month-to-month contracts for flexibility</li>
          <li>Bundled deals if you need home phone or entertainment</li>
        </ul>

        <h2>4. Check Your Address Technology Type</h2>
        <p>Your connection type (FTTP, FTTC, HFC, Fixed Wireless) affects available speeds. Use our comparison tool to see what's available at your address.</p>

        <h2>5. Read Provider Reviews</h2>
        <p>Speed on paper isn't everything. Consider:</p>
        <ul>
          <li>Customer service quality</li>
          <li>Typical evening speeds (not just maximum speeds)</li>
          <li>Setup fees and modem costs</li>
          <li>Contract terms and exit fees</li>
        </ul>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Pro Tip</h3>
          <p style={{ marginBottom: 0 }}>Start with a slightly faster plan than you think you need. It's easier to downgrade later than to deal with slow speeds while waiting to upgrade.</p>
        </div>
      </>
    )
  },
  "nbn-speed-tiers-explained": {
    slug: "nbn-speed-tiers-explained",
    title: "NBN Speed Tiers Explained: 25, 50, 100, 250, or 1000 Mbps?",
    date: "2026-01-02",
    readTime: "7 min read",
    category: "Education",
    content: (
      <>
        <p>Understanding NBN speed tiers is crucial for choosing the right plan. Let's break down what each tier offers and who they're best suited for.</p>
        
        <h2>NBN 25 (Basic Evening Speed)</h2>
        <p><strong>Download:</strong> 25 Mbps | <strong>Upload:</strong> 5-10 Mbps | <strong>Price:</strong> $50-$70/month</p>
        <p><strong>Best for:</strong> Singles or couples with light internet use. Good for browsing, email, and SD streaming.</p>
        <p><strong>Limitations:</strong> May struggle with multiple devices or HD streaming simultaneously.</p>

        <h2>NBN 50 (Standard Evening Speed)</h2>
        <p><strong>Download:</strong> 50 Mbps | <strong>Upload:</strong> 20 Mbps | <strong>Price:</strong> $60-$80/month</p>
        <p><strong>Best for:</strong> Small families (3-4 people). Handles HD streaming, video calls, and moderate gaming.</p>
        <p><strong>Sweet spot:</strong> Most popular tier offering good balance of speed and value.</p>

        <h2>NBN 100 (Fast Evening Speed)</h2>
        <p><strong>Download:</strong> 100 Mbps | <strong>Upload:</strong> 20-40 Mbps | <strong>Price:</strong> $70-$100/month</p>
        <p><strong>Best for:</strong> Medium families (4-6 people). Multiple 4K streams, online gaming, large downloads.</p>
        <p><strong>Note:</strong> Requires FTTP, FTTB, or HFC connection. Not available on FTTN in many areas.</p>

        <h2>NBN 250 (Superfast Evening Speed)</h2>
        <p><strong>Download:</strong> 250 Mbps | <strong>Upload:</strong> 25-50 Mbps | <strong>Price:</strong> $90-$120/month</p>
        <p><strong>Best for:</strong> Large households or power users. Professional work from home, content creators.</p>
        <p><strong>Requirements:</strong> Only available on FTTP, HFC, and some FTTB connections.</p>

        <h2>NBN 1000 (Ultrafast Evening Speed)</h2>
        <p><strong>Download:</strong> 1000 Mbps | <strong>Upload:</strong> 50-400 Mbps | <strong>Price:</strong> $100-$150/month</p>
        <p><strong>Best for:</strong> Tech enthusiasts, businesses, or ultra-heavy users.</p>
        <p><strong>Availability:</strong> Limited to FTTP connections only. Check if your address qualifies.</p>

        <h2>Upload Speeds Matter Too</h2>
        <p>Don't forget about upload speeds if you:</p>
        <ul>
          <li>Regularly video conference (Zoom, Teams)</li>
          <li>Upload large files to cloud storage</li>
          <li>Stream on Twitch or YouTube</li>
          <li>Work from home with remote desktop access</li>
        </ul>

        <h2>Typical Evening Speeds</h2>
        <p>The speeds advertised are "typical evening speeds" (7pm-11pm). This is when network congestion is highest. Your actual speeds during off-peak hours will often be faster.</p>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Quick Recommendation</h3>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>Budget conscious:</strong> NBN 50</li>
            <li><strong>Balanced household:</strong> NBN 100</li>
            <li><strong>Power users:</strong> NBN 250 or 1000</li>
          </ul>
        </div>
      </>
    )
  },
  "fixed-wireless-vs-fttp": {
    slug: "fixed-wireless-vs-fttp",
    title: "Fixed Wireless vs FTTP: What's the Difference?",
    date: "2026-01-02",
    readTime: "6 min read",
    category: "Technology",
    content: (
      <>
        <p>Not all NBN connections are created equal. Understanding your connection type helps set realistic expectations and choose the right plan.</p>
        
        <h2>FTTP (Fibre to the Premises)</h2>
        <p><strong>How it works:</strong> Fibre optic cable runs directly to your home.</p>
        <p><strong>Speeds available:</strong> All tiers (25 Mbps to 1000 Mbps)</p>
        <p><strong>Pros:</strong></p>
        <ul>
          <li>Fastest and most reliable connection type</li>
          <li>Symmetrical upload speeds available (important for video calls, cloud uploads)</li>
          <li>Future-proof technology</li>
          <li>Minimal latency</li>
        </ul>
        <p><strong>Cons:</strong></p>
        <ul>
          <li>Limited availability (mostly new developments)</li>
          <li>Typically more expensive at higher tiers</li>
        </ul>

        <h2>FTTC (Fibre to the Curb)</h2>
        <p><strong>How it works:</strong> Fibre to the pit in your street, then copper to your home.</p>
        <p><strong>Speeds available:</strong> Up to 100 Mbps typically</p>
        <p><strong>Pros:</strong></p>
        <ul>
          <li>More reliable than FTTN</li>
          <li>Good speeds for most households</li>
          <li>No in-home equipment changes needed</li>
        </ul>

        <h2>FTTN (Fibre to the Node)</h2>
        <p><strong>How it works:</strong> Fibre to a node/cabinet in your area, then copper to your home.</p>
        <p><strong>Speeds available:</strong> Variable, often limited to 50-100 Mbps</p>
        <p><strong>Note:</strong> Speed depends heavily on distance from node. Some properties may not achieve 100 Mbps.</p>

        <h2>HFC (Hybrid Fibre Coaxial)</h2>
        <p><strong>How it works:</strong> Uses existing pay TV cable infrastructure.</p>
        <p><strong>Speeds available:</strong> Up to 1000 Mbps</p>
        <p><strong>Pros:</strong></p>
        <ul>
          <li>High speeds available</li>
          <li>Generally reliable</li>
        </ul>

        <h2>Fixed Wireless</h2>
        <p><strong>How it works:</strong> Radio signal from a transmission tower to an antenna on your roof.</p>
        <p><strong>Speeds available:</strong> 25/5, 50/20, 100/20 Mbps (limited tiers)</p>
        <p><strong>Best for:</strong> Rural and regional areas without fixed-line access</p>
        <p><strong>Pros:</strong></p>
        <ul>
          <li>Available in areas without cable infrastructure</li>
          <li>No physical line required</li>
          <li>Faster than old ADSL</li>
        </ul>
        <p><strong>Cons:</strong></p>
        <ul>
          <li>Weather can affect connection quality</li>
          <li>Subject to network congestion in busy areas</li>
          <li>Lower upload speeds</li>
          <li>Limited speed tiers (no 250 or 1000 Mbps options)</li>
        </ul>

        <h2>Satellite</h2>
        <p><strong>How it works:</strong> Satellite dish on your property connects to Sky Muster satellites.</p>
        <p><strong>Best for:</strong> Very remote areas with no other options</p>
        <p><strong>Limitations:</strong> High latency, data caps, weather-dependent</p>

        <h2>How to Check Your Connection Type</h2>
        <p>Use the NBN Co website or our comparison tool to check what technology is available at your address. This information is crucial for setting realistic speed expectations.</p>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Important for Fixed Wireless Users</h3>
          <p style={{ marginBottom: 0 }}>Fixed Wireless has different peak/off-peak data allowances and may experience congestion during busy periods. Consider this when choosing your plan, especially if you work from home or stream frequently.</p>
        </div>
      </>
    )
  },
  "save-money-nbn-plan": {
    slug: "save-money-nbn-plan",
    title: "5 Ways to Save Money on Your NBN Plan",
    date: "2026-01-02",
    readTime: "4 min read",
    category: "Money Saving",
    content: (
      <>
        <p>Internet bills can add up quickly, but there are several strategies to reduce costs without sacrificing too much speed or reliability.</p>
        
        <h2>1. Take Advantage of Promotional Offers</h2>
        <p>Many providers offer significant discounts for new customers:</p>
        <ul>
          <li>Look for "$85/6 months" or similar promotional pricing</li>
          <li>Compare the total cost over 12 months, not just the regular price</li>
          <li>Set a calendar reminder to review your plan when the promotion ends</li>
          <li>Consider switching providers annually to keep getting new customer deals</li>
        </ul>

        <h2>2. Choose the Right Speed Tier</h2>
        <p>Many Australians over-buy speed they don't need:</p>
        <ul>
          <li>If you're working from home alone, NBN 50 is typically plenty</li>
          <li>Track your usage: if you're not hitting your speed limit during peak times, downgrade</li>
          <li>Remember: higher speeds don't improve streaming quality once you meet the minimum (25 Mbps for 4K)</li>
        </ul>
        <p><strong>Potential savings:</strong> $20-40/month by dropping from 100 Mbps to 50 Mbps</p>

        <h2>3. Avoid Unnecessary Add-ons</h2>
        <p>Review your plan for extras you don't use:</p>
        <ul>
          <li>Home phone line (if you only use mobile)</li>
          <li>Static IP addresses (unless you run servers)</li>
          <li>Modem rental (buy your own for $100-200 one-time cost)</li>
          <li>Entertainment bundles you don't watch</li>
        </ul>
        <p><strong>Potential savings:</strong> $10-30/month</p>

        <h2>4. Choose Month-to-Month Contracts</h2>
        <p>While 12 or 24-month contracts may offer slight discounts:</p>
        <ul>
          <li>Month-to-month gives you flexibility to switch when better deals appear</li>
          <li>No exit fees if you need to move or change plans</li>
          <li>Providers compete harder for month-to-month customers</li>
        </ul>

        <h2>5. Bundle Wisely (But Don't Over-Bundle)</h2>
        <p>Bundling can save money, but only if you need all services:</p>
        <ul>
          <li>Energy + Internet bundles can save $10-20/month</li>
          <li>Mobile + Internet combos sometimes offer discounts</li>
          <li>BUT: Make sure each service is competitively priced individually</li>
          <li>Don't bundle just for a small discount if individual services are cheaper elsewhere</li>
        </ul>

        <h2>Bonus Tip: Negotiate!</h2>
        <p>Before your promotional period ends or when considering switching:</p>
        <ul>
          <li>Call your provider's retention team (say you're thinking of leaving)</li>
          <li>Mention specific competitor offers you're considering</li>
          <li>Ask about loyalty discounts or retention offers</li>
          <li>Be polite but firm – they'd rather keep you at a discount than lose you entirely</li>
        </ul>

        <h2>Use Our Comparison Tool</h2>
        <p>We track 150+ plans from 30+ providers, including promotional offers. Filter by your needs and sort by price to find the best value.</p>

        <div style={{ 
          padding: '24px', 
          background: 'var(--highlight-bg)', 
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary-color)',
          marginTop: '32px'
        }}>
          <h3 style={{ marginTop: 0 }}>Real Example</h3>
          <p style={{ marginBottom: 0 }}>
            Sarah was paying $99/month for NBN 100 with Telstra. By switching to Exetel NBN 100 at $69/month (with 6-month promo at $59), she saves $360-$480 in the first year. Over 2 years, that's $720+ savings for the same speed.
          </p>
        </div>
      </>
    )
  }
};

export default function BlogPost() {
  const slug = location.pathname.replace('/blog/', '');
  const post = slug ? blogContent[slug] : null;

  usePageTitle(
    post ? `${post.title} - NBN Compare Blog` : 'Blog Post Not Found - NBN Compare',
    post ? `${post.title}. ${post.category} guide. ${post.readTime}.` : undefined
  );

  if (!post) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1>Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist.</p>
        <a href="/blog" style={{ color: 'var(--primary-color)' }}>← Back to Blog</a>
      </div>
    );
  }

  return (
    <article style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px' 
    }}>
      <a 
        href="/blog" 
        style={{ 
          color: 'var(--primary-color)', 
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '20px'
        }}
      >
        ← Back to Blog
      </a>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        color: '#333'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '6px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '6px',
          fontSize: '0.9em',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          {post.category}
        </div>

        <h1 style={{ fontSize: '2.5em', marginBottom: '16px', lineHeight: '1.2', color: '#1a1a1a' }}>
          {post.title}
        </h1>

        <div style={{ 
          display: 'flex',
          gap: '20px',
          opacity: 0.6,
          marginBottom: '40px',
          fontSize: '0.95em',
          color: '#666'
        }}>
          <span>{new Date(post.date).toLocaleDateString('en-AU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        <div className="blog-content" style={{ 
          fontSize: '1.1em',
          lineHeight: '1.8',
          color: '#333'
        }}>
          {post.content}
        </div>

        <div style={{ 
          marginTop: '60px',
          padding: '32px',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          borderRadius: '12px',
          border: '1px solid #667eea30',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1a1a' }}>Ready to find your perfect NBN plan?</h3>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Compare NBN Plans
          </a>
        </div>
      </div>
    </article>
  );
}
