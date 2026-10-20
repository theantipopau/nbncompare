-- Add three verified residential NBN providers (all confirmed selling
-- fixed-line NBN in 2026; GigaComm/Pineapple excluded — own-network fibre,
-- not NBN; Engin excluded — NBN offering dated/uncertain).
-- Parsed by the generic parser until dedicated parsers are added.
-- Technical metadata (IPv6/CGNAT/etc.) left NULL as unknown rather than
-- fabricated; descriptions are factual. needs_review=1 flags them for an
-- initial scrape + operator review.

INSERT OR IGNORE INTO providers (name, slug, canonical_url, active, favicon_url, description, needs_review) VALUES
  ('iPrimus', 'iprimus', 'https://www.iprimus.com.au/nbn-plans', 1,
   'https://www.iprimus.com.au/favicon.ico',
   'Long-running Australian ISP (part of Vocus Group) offering NBN across five speed tiers.', 1),
  ('TeleChoice', 'telechoice', 'https://telechoice.com.au/unlimited-nbn-plans/', 1,
   'https://telechoice.com.au/favicon.ico',
   'Unlimited NBN plans across seven speed tiers with no lock-in contracts.', 1),
  ('Yomojo', 'yomojo', 'https://www.yomojo.com.au/nbn/home-internet', 1,
   'https://www.yomojo.com.au/favicon.ico',
   'Budget-friendly NBN and mobile provider with six home internet tiers.', 1);
