# NBN Compare - Development Roadmap & TODO

## 🎯 Current Status (January 2026)
- ✅ 82 active plans across 19 providers (53% coverage)
- ✅ Speed tiers: 25, 50, 100, 250, 1000, 2000 Mbps
- ✅ Contract filtering (month-to-month, 12-month, 24-month)
- ✅ Dark mode, favorites, search functionality
- ✅ Mobile responsive design
- ✅ Provider favicons with fallback logos
- ✅ Database migration for Fixed Wireless support
- ✅ Technology type filtering in UI

---

## 🔥 PRIORITY 1: Critical Features (Complete First)

### Data Coverage
- [x] **Add Fixed Wireless plans** (25/5, 50/20, 100/20 tiers) ✅ COMPLETED
  - [x] Telstra Fixed Wireless plans (3 plans) ✅
  - [x] Optus Fixed Wireless plans (3 plans) ✅
  - [x] TPG Fixed Wireless plans (2 plans) ✅
  - [x] Aussie Broadband Fixed Wireless (3 plans) ✅
  - [x] Budget providers: Mate, Exetel, Tangerine (7 plans total) ✅
  - Completed: 18 Fixed Wireless plans added
  - Impact: Serves ~600k rural/regional Australians

- [ ] **Complete provider coverage** - Add plans for remaining providers
  - [x] Leaptel (4 plans) ✅
  - [x] Skymesh (4 plans) ✅
  - [x] Origin Broadband (2 plans) ✅
  - [x] MyNetFone (2 plans) ✅
  - [x] On the Net (1 plan) ✅
  - [ ] Future Broadband (3 plans)
  - [x] Improve Spintel coverage
  - [x] Improve Dodo coverage
  - **Progress: 24/36 providers now have plans (67% coverage, up from 53%)**
  - **Total: 113 plans (up from 82)**

### Scraper Improvements
- [ ] **Fix broken scrapers** - Currently only 7/31 working
  - [ ] Test each provider's scraper manually
  - [ ] Update selectors for changed website structures
  - [ ] Implement retry logic with exponential backoff
  - [ ] Add better error logging/tracking
  - Estimated time: 1 week
  - Impact: Automated daily updates instead of manual data entry

- [ ] **Run manual scrape** via `/internal/cron/run` endpoint
  - [ ] Verify scraper execution
  - [ ] Check error logs
  - [ ] Update broken provider URLs
  - Estimated time: 30 mins
  - Impact: Validate current scraping status

---

## ⚡ PRIORITY 2: UX Enhancements (High Impact)

### Visual Improvements
- [ ] **Add provider comparison table** (side-by-side)
  - [ ] "Compare Selected" button (max 3 plans)
  - [ ] Modal or dedicated page for comparison
  - [ ] Highlight differences (price, speed, features)
  - Estimated time: 3-4 hours
  - Impact: Easier decision-making for users

- [ ] **Improve mobile table UX**
  - [ ] Card-based layout for mobile (instead of horizontal scroll)
  - [ ] Collapsible plan details
  - [ ] Sticky filter bar
  - Estimated time: 2-3 hours
  - Impact: Better mobile experience (40-50% of traffic)

- [ ] **Add plan detail modal** (instead of external links)
  - [ ] Show all plan information in popup
  - [ ] Contract terms, setup fees, conditions
  - [ ] "Visit Provider" button
  - Estimated time: 2 hours
  - Impact: Keep users on site longer

### Search & Discovery
- [ ] **Enhance address check integration**
  - [ ] Display technology type (FTTP/FTTC/HFC/FW) on address check
  - [ ] Auto-filter plans by available technology
  - [ ] Show max speed available for address
  - Estimated time: 3 hours
  - Impact: Personalized recommendations

- [ ] **Add "Best Value" recommendations**
  - [ ] Badge for cheapest plan per speed tier
  - [ ] "Editor's Choice" for best overall value
  - [ ] "Most Popular" based on clicks/favorites
  - Estimated time: 2 hours
  - Impact: Guide users to best deals

---

## 🚀 PRIORITY 3: Advanced Features (Medium Priority)

### Price Tracking & Alerts
- [ ] **Implement price history tracking**
  - [ ] Populate `price_history` table on plan updates
  - [ ] Display price change indicators (↑ ↓)
  - [ ] Show historical price chart (Chart.js or similar)
  - Estimated time: 4-5 hours
  - Impact: Build trust, show price trends

- [ ] **Email price alerts** (requires email service)
  - [ ] Subscribe to plan price changes
  - [ ] Weekly best deals newsletter
  - [ ] Use Cloudflare Email Workers or SendGrid API
  - Estimated time: 1 day
  - Impact: User retention, recurring traffic

### Provider Ratings & Reviews
- [ ] **Add provider ratings system**
  - [ ] 5-star rating per provider
  - [ ] User reviews (moderated)
  - [ ] Display average rating in table
  - [ ] New table: `reviews` (provider_id, rating, comment, created_at)
  - Estimated time: 1 week
  - Impact: Community-driven insights

### Performance Optimization
- [ ] **Implement caching**
  - [ ] Cache API responses in Cloudflare KV (5 min TTL)
  - [ ] Cache static assets with longer TTL
  - [ ] Add `Cache-Control` headers
  - Estimated time: 2-3 hours
  - Impact: Faster page loads, reduced database queries

- [ ] **Reduce bundle size**
  - [ ] Code splitting for routes
  - [ ] Lazy load images
  - [ ] Remove unused dependencies
  - [ ] Target: <50KB gzipped JS
  - Estimated time: 3 hours
  - Impact: Better performance on slow connections

---

## 📊 PRIORITY 4: Analytics & SEO (Growth)

### Analytics
- [ ] **Add privacy-focused analytics**
  - [ ] Plausible Analytics or Cloudflare Web Analytics
  - [ ] Track: page views, popular plans, speed tier preferences
  - [ ] No cookies, GDPR-friendly
  - Estimated time: 1 hour
  - Impact: Understand user behavior

### SEO Optimization
- [ ] **Add meta tags & structured data**
  - [ ] Open Graph tags for social sharing
  - [ ] Schema.org markup for plans
  - [ ] Provider-specific landing pages
  - Estimated time: 3 hours
  - Impact: Better search rankings

- [ ] **Create sitemap**
  - [ ] Dynamic sitemap.xml generation
  - [ ] List all providers and speed tiers
  - Estimated time: 1 hour
  - Impact: Improved crawlability

- [ ] **Add robots.txt**
  - [ ] Allow all crawlers
  - [ ] Disallow /admin, /internal
  - Estimated time: 15 mins
  - Impact: Better SEO

### Content Marketing
- [ ] **Add blog/guides section**
  - [ ] "How to choose an NBN plan"
  - [ ] "NBN speed tiers explained"
  - [ ] "Fixed Wireless vs FTTP"
  - Estimated time: Ongoing
  - Impact: Organic traffic, establish authority

---

## 🎨 PRIORITY 5: Design & Branding (Polish)

### Visual Design
- [ ] **Add screenshots to README**
  - [ ] Homepage screenshot
  - [ ] Comparison table
  - [ ] Dark mode screenshot
  - Estimated time: 30 mins
  - Impact: Better GitHub presentation

- [ ] **Create proper logo**
  - [ ] Replace placeholder with custom logo
  - [ ] Add to header
  - [ ] Update favicon
  - Estimated time: 2 hours (if designing) or 30 mins (if using template)
  - Impact: Professional appearance

- [ ] **Improve color scheme**
  - [ ] Consistent brand colors throughout
  - [ ] Better dark mode contrast
  - [ ] Accessibility audit (WCAG AA compliance)
  - Estimated time: 2-3 hours
  - Impact: Better UX, accessibility

### UI Components
- [ ] **Add loading skeletons for all async content**
  - [ ] Address suggestions
  - [ ] Provider logos
  - Estimated time: 1 hour
  - Impact: Better perceived performance

- [ ] **Add empty states**
  - [ ] "No plans found" with filter reset button
  - [ ] "No favorites yet" with call-to-action
  - Estimated time: 1 hour
  - Impact: Better UX

---

## 🔧 PRIORITY 6: Developer Experience (DX)

### Testing
- [ ] **Add unit tests**
  - [ ] Test parsers for each provider
  - [ ] Test API endpoints
  - [ ] Use Vitest or Jest
  - Estimated time: 2 days
  - Impact: Prevent regressions

- [ ] **Add E2E tests**
  - [ ] Playwright tests for critical flows
  - [ ] Test plan filtering, search, favorites
  - Estimated time: 1 day
  - Impact: Catch UI bugs

### Documentation
- [ ] **Create CONTRIBUTING.md**
  - [ ] How to add a new provider
  - [ ] Code style guidelines
  - [ ] PR process
  - Estimated time: 1 hour
  - Impact: Easier for contributors

- [ ] **Add API documentation**
  - [ ] Document all endpoints
  - [ ] Example requests/responses
  - [ ] Rate limits, authentication
  - Estimated time: 2 hours
  - Impact: Easier integration

### CI/CD
- [ ] **Set up GitHub Actions**
  - [ ] Run tests on PR
  - [ ] Auto-deploy to Cloudflare on merge to main
  - [ ] Lint code
  - Estimated time: 2-3 hours
  - Impact: Automated deployments

---

## 🌟 PRIORITY 7: Long-term Vision (Future)

### Advanced Features
- [ ] **Speed test integration**
  - [ ] Embed speed test on homepage
  - [ ] Recommend plans based on current speed
  - [ ] Partner with Ookla or Speedtest.net
  - Estimated time: 1 week
  - Impact: Personalized recommendations

- [ ] **Bundle deals**
  - [ ] Track internet + phone bundles
  - [ ] Mobile + NBN combos
  - [ ] Entertainment bundle tracking
  - Estimated time: 1 week
  - Impact: Comprehensive comparison

- [ ] **Student/concession discounts**
  - [ ] Track special pricing
  - [ ] Filter by eligibility
  - Estimated time: 3-4 hours
  - Impact: Serve underserved market

- [ ] **Business NBN plans**
  - [ ] Separate section for business plans
  - [ ] SLAs, static IPs, support tiers
  - Estimated time: 1 week
  - Impact: New market segment

### Platform Expansion
- [ ] **Mobile app** (React Native or PWA)
  - [ ] Offline favorites
  - [ ] Push notifications for price drops
  - Estimated time: 1 month
  - Impact: Mobile-first experience

- [ ] **API for partners**
  - [ ] Public API with authentication
  - [ ] Rate limiting
  - [ ] Monetization strategy
  - Estimated time: 1 week
  - Impact: Revenue potential

---

## 📈 Success Metrics

### Traffic Goals
- [ ] **100 daily active users** by Month 1
- [ ] **500 daily active users** by Month 3
- [ ] **2,000 daily active users** by Month 6

### Data Goals
- [ ] **100% provider coverage** (all 40+ providers with plans)
- [ ] **95%+ scraper success rate**
- [ ] **Update plans daily** (automated)

### Engagement Goals
- [ ] **50+ favorites per day** (indicates user engagement)
- [ ] **20+ comparisons per day** (when feature exists)
- [ ] **5 min average session duration**

---

## 🛠️ Immediate Next Steps (This Week)

1. ⚡ **Deploy Fixed Wireless changes** (backend + frontend)
2. ⚡ **Add 20-30 Fixed Wireless plans** to database
3. ⚡ **Test scraper** on 5 major providers
4. ⚡ **Add provider comparison feature**
5. ⚡ **Push all changes to GitHub**

---

## 💡 Ideas for Consideration

- Reddit bot to auto-respond to "best NBN plan" threads
- Chrome extension for NBN plan comparison
- Partnership with real estate sites (show plans available at address)
- Affiliate partnerships (ethically disclosed)
- White-label solution for other comparison sites
- International expansion (UK, NZ broadband markets)

---

**Last Updated:** January 1, 2026
**Next Review:** Weekly
**Repository:** https://github.com/theantipopau/nbncompare
**Live Site:** https://nbncompare.info
