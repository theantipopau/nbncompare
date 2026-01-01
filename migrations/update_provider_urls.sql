-- Update existing providers with proper canonical URLs
UPDATE providers SET canonical_url = "https://arctel.com.au/internet/nbn-plans" WHERE slug = "arctel";
UPDATE providers SET canonical_url = "https://buddytelco.com.au/internet/nbn" WHERE slug = "buddy";
UPDATE providers SET canonical_url = "https://www.carboncomms.com.au/nbn-plans" WHERE slug = "carboncomms";
UPDATE providers SET canonical_url = "https://www.futurebroadband.com.au/internet/nbn" WHERE slug = "future";
UPDATE providers SET canonical_url = "https://www.foxtel.com.au/broadband.html" WHERE slug = "foxtel";
UPDATE providers SET canonical_url = "https://www.launtel.net.au/residential-nbn" WHERE slug = "launtel";
UPDATE providers SET canonical_url = "https://www.leaptel.com.au/nbn-plans" WHERE slug = "leaptel";
UPDATE providers SET canonical_url = "https://onthenet.com.au/nbn-plans" WHERE slug = "onthenet";
UPDATE providers SET canonical_url = "https://www.originenergy.com.au/broadband/plans.html" WHERE slug = "origin";
UPDATE providers SET canonical_url = "https://www.skymesh.net.au/internet-plans/nbn" WHERE slug = "skymesh";
UPDATE providers SET canonical_url = "https://tangerine.com.au/nbn" WHERE slug = "tangerine";

-- Insert new providers if they don't exist
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Arctel", "arctel", "https://arctel.com.au/internet/nbn-plans", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Buddy", "buddy", "https://buddytelco.com.au/internet/nbn", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Carbon Communications", "carboncomms", "https://www.carboncomms.com.au/nbn-plans", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Future Broadband", "future", "https://www.futurebroadband.com.au/internet/nbn", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Foxtel Broadband", "foxtel", "https://www.foxtel.com.au/broadband.html", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Launtel", "launtel", "https://www.launtel.net.au/residential-nbn", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Leaptel", "leaptel", "https://www.leaptel.com.au/nbn-plans", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("On the Net", "onthenet", "https://onthenet.com.au/nbn-plans", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Origin Broadband", "origin", "https://www.originenergy.com.au/broadband/plans.html", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Skymesh", "skymesh", "https://www.skymesh.net.au/internet-plans/nbn", 1);
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES ("Tangerine", "tangerine", "https://tangerine.com.au/nbn", 1);
