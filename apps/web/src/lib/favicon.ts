/**
 * Favicon utility for generating and resolving provider logos
 */

export function getFaviconUrl(providerName: string, storedUrl?: string | null): string {
  // If we have a stored URL and it's valid, use it
  if (storedUrl && isValidUrl(storedUrl)) {
    return storedUrl;
  }

  // Try to get from favicons.io API (free service)
  const domain = getProviderDomain(providerName);
  if (domain) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }

  // Fallback: return empty string to use initials
  return '';
}

function getProviderDomain(providerName: string): string | null {
  const providerDomains: Record<string, string> = {
    'Telstra': 'telstra.com.au',
    'Optus': 'optus.com.au',
    'TPG': 'tpg.com.au',
    'Aussie Broadband': 'aussiebb.com.au',
    'iiNet': 'iinet.net.au',
    'Vodafone': 'vodafone.com.au',
    'MyRepublic': 'myrepublic.com.au',
    'NBN Co': 'nbnco.com.au',
    'Dodo': 'dodo.com.au',
    'Superloop': 'superloop.com.au',
    'CanNet': 'cannet.com.au',
    'Launtel': 'launtel.net.au',
    'Leaptel': 'leaptel.net.au',
    'GoTalk': 'gotalk.com.au',
    'Netspace': 'netspace.net.au',
    'AusNET': 'ausnet.net.au',
    'Adam Internet': 'adam.com.au',
    'Internode': 'internode.on.net',
    'eMail': 'email.com.au',
    'Activ8me': 'activ8me.com.au',
    'Tangerine': 'tangerine.net.au',
    'easynet': 'easynet.net.au',
    'Orion': 'orion.net.au',
    'Westnet': 'westnet.com.au',
    'ACN': 'acn.net.au',
    'Exetel': 'exetel.com.au',
    'iFibre': 'ifibre.net.au',
    'Foxtel': 'foxtel.com.au',
    'Vocus': 'vocus.com.au',
    'Arctel': 'arctel.com.au',
  };

  return providerDomains[providerName] || null;
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
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#fed6e3', '#ff9a56', '#ff6b6b', '#ee5a6f',
    '#c44569', '#f8b195', '#c06c84', '#6c5b7b', '#355c7d',
  ];

  let hash = 0;
  for (let i = 0; i < providerName.length; i++) {
    hash = providerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
