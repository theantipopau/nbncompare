-- Deactivate junk plans with promotional text as plan names or incorrect data

-- Amaysim "Fair Go Policy" junk entry - $10 for 500Mbps is clearly wrong
UPDATE plans SET is_active = 0 WHERE id = 161;

-- Dodo "Save for 12 months" junk entry - this is promo text, not a plan
UPDATE plans SET is_active = 0 WHERE id = 160;

-- Internode "Plan" - generic name with no details
UPDATE plans SET is_active = 0 WHERE id = 155;

-- SpinTel empty plan name
UPDATE plans SET is_active = 0 WHERE id = 158;

-- Also deactivate the Amaysim plan with HTML tags in name (id 162)
UPDATE plans SET is_active = 0 WHERE id = 162;
