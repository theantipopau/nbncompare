import { getDb } from "../lib/db";

export async function fetchProviderFavicon(domain: string): Promise<string | null> {
  try {
    // Try multiple favicon methods
    const attempts = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://${domain}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    ];
    
    // Use Google's favicon service as primary (most reliable)
    return attempts[0];
  } catch (err) {
    console.error(`Failed to fetch favicon for ${domain}:`, err);
    return null;
  }
}

export async function updateProviderFavicons() {
  const db = await getDb() as any;
  const providers = await db.prepare('SELECT id, slug FROM providers').all();
  
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
  };
  
  for (const provider of (providers as any).results || []) {
    const domain = domainMap[provider.slug];
    if (domain) {
      const faviconUrl = await fetchProviderFavicon(domain);
      if (faviconUrl) {
        await db.prepare('UPDATE providers SET favicon_url = ? WHERE id = ?')
          .bind(faviconUrl, provider.id)
          .run();
      }
    }
  }
  
  return { updated: (providers as any).results?.length || 0 };
}
