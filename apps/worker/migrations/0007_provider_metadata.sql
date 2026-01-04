-- Add provider metadata columns for technical details
ALTER TABLE providers ADD COLUMN ipv6_support INTEGER DEFAULT 0; -- 0 = no, 1 = yes
ALTER TABLE providers ADD COLUMN cgnat INTEGER DEFAULT 1; -- 0 = no CGNAT, 1 = uses CGNAT
ALTER TABLE providers ADD COLUMN cgnat_opt_out INTEGER DEFAULT 0; -- 0 = no opt-out, 1 = free opt-out, 2 = paid opt-out
ALTER TABLE providers ADD COLUMN static_ip_available INTEGER DEFAULT 0; -- 0 = no, 1 = free, 2 = paid addon
ALTER TABLE providers ADD COLUMN australian_support INTEGER DEFAULT 0; -- 0 = offshore, 1 = mixed, 2 = 100% Australian
ALTER TABLE providers ADD COLUMN parent_company TEXT; -- e.g., "TPG Telecom", "Telstra Corporation"
ALTER TABLE providers ADD COLUMN routing_info TEXT; -- e.g., "Singapore", "Direct to IX", "Via Vocus"
ALTER TABLE providers ADD COLUMN description TEXT; -- Short description of ISP
ALTER TABLE providers ADD COLUMN support_hours TEXT; -- e.g., "24/7", "Business hours"

-- Add promo code support to plans
ALTER TABLE plans ADD COLUMN promo_code TEXT; -- Required coupon code for intro pricing
ALTER TABLE plans ADD COLUMN promo_description TEXT; -- What the promo offers
