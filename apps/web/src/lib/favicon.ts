/**
 * Favicon utility for generating and resolving provider logos
 */

export function getFaviconUrl(providerName: string, storedUrl?: string | null, sourceUrl?: string | null): string {
  // If we have a stored URL and it's valid, use it
  if (storedUrl && isValidUrl(storedUrl)) {
    return storedUrl;
  }

  // Try to get from favicons.io API (free service)
  const domain = getProviderDomain(providerName, sourceUrl);
  if (domain) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }

  // Fallback: return empty string to use initials
  return '';
}

function getProviderDomain(providerName: string, sourceUrl?: string | null): string | null {
  if (sourceUrl) {
    try {
      return new URL(sourceUrl).hostname.replace(/^www\./, '');
    } catch {
      // Fall through to the known-provider map.
    }
  }
  // Fallback map used only when neither a stored logo nor a source URL is
  // available. Domains verified against providers.canonical_url (Oct 2026).
  const providerDomains: Record<string, string> = {
    'Telstra': 'telstra.com.au',
    'Optus': 'optus.com.au',
    'TPG': 'tpg.com.au',
    'Aussie Broadband': 'aussiebroadband.com.au',
    'Aussie Broadband Business': 'aussiebroadband.com.au',
    'iiNet': 'iinet.net.au',
    'Vodafone': 'vodafone.com.au',
    'MyRepublic': 'myrepublic.com',
    'Dodo': 'dodo.com',
    'Superloop': 'superloop.com',
    'Launtel': 'launtel.net.au',
    'Leaptel': 'leaptel.com.au',
    'Internode': 'internode.on.net',
    'Activ8me': 'activ8me.net.au',
    'Tangerine': 'tangerine.com.au',
    'Westnet': 'westnet.com.au',
    'Exetel': 'exetel.com.au',
    'Foxtel Broadband': 'foxtel.com.au',
    'Arctel': 'arctel.com.au',
    'AGL': 'agl.com.au',
    'Amaysim': 'amaysim.com.au',
    'AusBBS': 'ausbbs.net',
    'Belong': 'belong.com.au',
    'Buddy': 'buddytelco.com.au',
    'Carbon Communications': 'carboncomms.com.au',
    'Clear Networks': 'clearnetworks.com.au',
    'Flip': 'flip.com.au',
    'Future Broadband': 'futurebroadband.com.au',
    'Harbour ISP': 'harbourisp.com.au',
    'iPrimus': 'iprimus.com.au',
    'Kogan': 'kogan.com',
    'Mate': 'letsbemates.com.au',
    'Moose Mobile': 'moosemobile.com.au',
    'More Telecom': 'moretelecom.com.au',
    'MyNetFone': 'mynetfone.com.au',
    'MyOwn': 'myown.com.au',
    'Neptune': 'neptune.net.au',
    'Occom': 'occom.com.au',
    'OnTheNet': 'onthenet.com.au',
    'Origin': 'originenergy.com.au',
    'Peak Connect': 'peakconnect.com.au',
    'Pentanet': 'pentanet.com.au',
    'Quokka': 'quokka.net.au',
    'Skymesh': 'skymesh.net.au',
    'Southern Phone': 'southernphone.com.au',
    'Spintel': 'spintel.net.au',
    'Starlink': 'starlink.com',
    'Swoop': 'swoop.com.au',
    'Telair': 'telair.com.au',
    'TeleChoice': 'telechoice.com.au',
    'Uniti Wireless': 'unitiwireless.com',
    'URL Networks': 'urlnetworks.com.au',
    'Yomojo': 'yomojo.com.au',
  };

  if (providerDomains[providerName]) return providerDomains[providerName];

  const guessedDomain = providerName
    .toLowerCase()
    .replace(/\b(telecom|communications|internet|broadband|mobile)\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
  return guessedDomain ? `${guessedDomain}.com.au` : null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get provider initials for avatar display
 */
export function getProviderInitials(providerName: string): string {
  return providerName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

/**
 * Get provider color for avatar background
 */
export function getProviderColor(providerName: string): string {
  const colors = [
    '#0f766e', '#155e75', '#14b8a6', '#2563eb', '#0e7490',
    '#16a34a', '#059669', '#115e59', '#0d9488', '#1d4ed8',
    '#047857', '#0369a1', '#134e4a', '#1e40af', '#065f46',
    '#2dd4bf', '#5eead4', '#38bdf8', '#34d399', '#0ea5e9',
  ];

  let hash = 0;
  for (let i = 0; i < providerName.length; i++) {
    hash = providerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
