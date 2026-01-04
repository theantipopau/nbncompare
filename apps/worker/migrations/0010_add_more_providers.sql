-- Add more Australian ISPs that offer Fixed Wireless and regional NBN plans
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active) VALUES 
  ('Activ8me', 'activ8me', 'https://www.activ8me.net.au/nbn-plans', 1),
  ('Harbour ISP', 'harbourisp', 'https://www.harbourisp.com.au/nbn', 1),
  ('Clear Networks', 'clearnetworks', 'https://clearnetworks.com.au/nbn-plans', 1),
  ('Flip', 'flip', 'https://www.flip.com.au/nbn', 1),
  ('Spintel', 'spintel', 'https://www.spintel.net.au/nbn', 1),
  ('AusBBS', 'ausbbs', 'https://www.ausbbs.net/nbn-plans', 1),
  ('Westnet', 'westnet', 'https://www.westnet.com.au/internet/nbn', 1),
  ('Internode', 'internode', 'https://www.internode.on.net/residential/internet/nbn', 1),
  ('More Telecom', 'moretelecom', 'https://moretelecom.com.au/nbn-plans', 1);
