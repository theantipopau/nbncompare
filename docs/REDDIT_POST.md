# Reddit Post for NBN Compare

## Title Options:

**Option 1 (Direct):**
I built a free NBN plan comparison site that actually works - nbncompare.info

**Option 2 (Problem-focused):**
Tired of comparing NBN plans across 30+ provider websites? I made a tool for that

**Option 3 (Community-focused):**
Free NBN comparison tool with daily price updates - thought r/australia might find it useful

---

## Post Body:

Hey everyone! 👋

I got frustrated trying to compare NBN plans across dozens of provider websites (seriously, who has time to check Telstra, Optus, TPG, Aussie Broadband, and 25+ others individually?), so I built **[nbncompare.info](https://nbncompare.info)** to solve that problem.

### What it does:

✅ **Compares 150+ NBN plans** from 30+ Australian providers  
✅ **Updates daily** via automated scraping (runs at 3 AM AEDT)  
✅ **Shows promotional pricing** with promo codes  
✅ **Tracks price changes** over time (see if your plan went up!)  
✅ **Fixed Wireless NBN** support for regional/rural areas  
✅ **ISP metadata filters** - filter by IPv6 support, no CGNAT, Australian support teams, static IP availability  
✅ **"Best Value" scoring** - considers both price AND quality factors (AU support, network quality, no CGNAT, etc.)  
✅ **Provider landing pages** with detailed metadata about each ISP

### Features I'm particularly proud of:

- **Smart filtering**: Speed tiers, contract length, data allowance, modem included, plus all the tech stuff (IPv6, CGNAT, etc.)
- **Price history tracking**: See if that "great deal" was actually cheaper 3 months ago
- **Fixed Wireless section**: Separate category for FW Plus/Max/Ultra (100/200/400 Mbps)
- **Best Value badges**: Not just the cheapest - factors in AU support, network quality, CGNAT policies
- **Dark mode** (because of course)

### Tech stack (for the curious):
- Frontend: React + Vite on Cloudflare Pages
- Backend: Cloudflare Workers + D1 SQLite
- Scrapers: Automated daily updates with custom parsers per provider

### What it's NOT:
- ❌ Not affiliated with any ISP
- ❌ No affiliate links or revenue
- ❌ No ads
- ❌ No tracking/analytics beyond basic Cloudflare stats
- ❌ Not selling your data

It's completely free to use. I built it because I needed it myself and figured others might too.

**Try it out:** https://nbncompare.info

Would love feedback! If you spot any issues, outdated prices, or have feature requests, let me know in the comments or on GitHub (theantipopau/nbncompare).

---

### Common Questions (FAQ):

**Q: How do you make money if it's free?**  
A: I don't. It's a side project that costs me about $5/month in Cloudflare fees. I might add a "buy me a coffee" button eventually, but no affiliate links or ads.

**Q: How accurate are the prices?**  
A: Scrapers run daily and I update parsers when providers change their websites. Some plans might be slightly out of date if a provider just launched a promo, but it's generally accurate within 24 hours.

**Q: Can you add [specific provider]?**  
A: Probably! Drop the name in the comments. I've got 30+ providers now but always happy to add more.

**Q: My NBN plan isn't showing?**  
A: Either the provider's website structure changed (breaking the scraper), or it's a very new plan. Let me know and I'll fix the parser.

**Q: This is great! How can I support it?**  
A: Just use it and share it! Word of mouth is the best support. If you're technical, PRs are welcome on GitHub.

---

## Alternative Shorter Version (if character limits):

Hey! Built a free NBN comparison site → **nbncompare.info**

Compares 150+ plans from 30+ providers (Telstra, Optus, TPG, Aussie BB, etc.) with:
- Daily automatic updates
- Promo codes & intro pricing
- Price history tracking
- Fixed Wireless support
- ISP metadata (IPv6, CGNAT, AU support)
- "Best Value" scoring (price + quality)

No ads, no affiliate links, no BS. Just helpful plan comparison.

Feedback welcome! Open source on GitHub (theantipopau/nbncompare).

---

## Suggested Subreddits:

1. **r/australia** - Main audience, broad reach
2. **r/AusFinance** - Money-conscious users comparing costs
3. **r/nbn** - NBN-specific community (if it exists)
4. **r/sydney**, **r/melbourne**, **r/brisbane**, etc. - City-specific subs
5. **r/AussieTech** - Tech-focused Australians
6. **r/InternetIsBeautiful** - For cool web tools (international but allows)

---

## Tips for Posting:

1. **Be authentic** - Reddit hates corporate marketing speak
2. **Engage with comments** - Answer questions, take feedback seriously
3. **Don't spam** - Post once, maybe cross-post to 2-3 relevant subs max
4. **Mention it's open source** - Reddit loves FOSS
5. **Lead with the problem you solved** - "I was frustrated with X, so I built Y"
6. **Be ready for criticism** - Reddit will find issues. Take it constructively!
7. **Post at peak times** - Weekday mornings/lunchtimes AEDT for Australian subs

---

## Example Comment Responses:

**If someone says "this is just an ad":**
> Fair concern! I don't make any money from this (no ads, no affiliate links). Built it for myself because I was sick of checking 30 different provider sites. Figured others might find it useful too. It's open source on GitHub if you want to verify: github.com/theantipopau/nbncompare

**If someone finds a bug:**
> Thanks for catching that! I'll fix the [provider] parser tonight. The scrapers run daily but sometimes websites change their structure and break things. Really appreciate you reporting it.

**If someone suggests a feature:**
> That's a great idea! I'll add it to the roadmap. Should be pretty straightforward to implement. [Describe briefly how you'll do it]

**If someone asks for their small ISP:**
> Happy to add them! Do you have a direct link to their NBN plans page? I'll create a parser for them this weekend.

---

Good luck with the post! 🚀
