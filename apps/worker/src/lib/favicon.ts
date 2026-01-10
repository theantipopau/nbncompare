import { getDb } from "../lib/db";

/**
 * Fetch high-resolution provider logo from multiple sources
 * Priority: Clearbit > Brandfetch > Google Favicons
 */
export async function fetchProviderLogo(domain: string, _providerName: string): Promise<string> {
  // Clearbit Logo API - high quality, 128px, transparent PNG
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  
  // Brandfetch - alternative high-res source
  const _brandfetchUrl = `https://cdn.brandfetch.io/${domain}/w/400/h/400`;
  
  // Google Favicons - fallback, lower quality but reliable
  const _googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  // Return Clearbit as primary - it returns a good 404 image if not found
  // Google Favicons will be used as fallback in the frontend if Clearbit fails
  return clearbitUrl;
}

export async function updateProviderFavicons() {
  const db = await getDb() as any;
  const providers = await db.prepare('SELECT id, name, slug FROM providers').all();
  
  const domainMap: Record<string, string> = {
    'telstra': 'telstra.com.au',
    'optus': 'optus.com.au',
    'tpg': 'tpg.com.au',
    'aussiebroadband': 'aussiebroadband.com.au',
    'iinet': 'iinet.net.au',
    'vodafone': 'vodafone.com.au',
    'dodo': 'dodo.com',
    'spintel': 'spintel.net.au',
    'belong': 'belong.com.au',
    'kogan': 'kogan.com',
    'myrepublic': 'myrepublic.net.au',
    'amaysim': 'amaysim.com.au',
    'superloop': 'superloop.com',
    'exetel': 'exetel.com.au',
    'southernphone': 'southernphone.com.au',
    'mynetfone': 'mynetfone.com.au',
    'mate': 'mate.com.au',
    'arctel': 'arctel.com.au',
    'buddy': 'buddy.com.au',
    'carboncomms': 'carboncomms.com.au',
    'future': 'futurebroadband.com.au',
    'foxtel': 'foxtel.com.au',
    'launtel': 'launtel.net.au',
    'leaptel': 'leaptel.com.au',
    'onthenet': 'onthenet.com.au',
    'origin': 'originbroadband.com.au',
    'skymesh': 'skymesh.com.au',
    'tangerine': 'tangerine.com.au',
    'internode': 'internode.on.net',
    'moose-mobile': 'moosemobile.com.au',
    'agl': 'agl.com.au',
    'myown': 'myown.com.au',
    'occom': 'occom.com.au',
    'peakconnect': 'peakconnect.com.au',
    'quokka': 'quokka.net.au',
    'telair': 'telair.com.au',
    'urlnetworks': 'urlnetworks.com.au',
  };
  
  let updated = 0;
  for (const provider of (providers as any).results || []) {
    const domain = domainMap[provider.slug];
    if (domain) {
      const logoUrl = fetchProviderLogo(domain, provider.name);
      await db.prepare('UPDATE providers SET favicon_url = ? WHERE id = ?')
        .bind(logoUrl, provider.id)
        .run();
      updated++;
    }
  }
  
  return { updated };
}
