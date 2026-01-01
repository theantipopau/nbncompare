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
    'aussie-broadband': 'aussiebroadband.com.au',
    'iinet': 'iinet.net.au',
    'exetel': 'exetel.com.au',
    'launtel': 'launtel.net.au',
    'myrepublic': 'myrepublic.net',
    'tangerine': 'tangerine.com.au',
    'superloop': 'superloop.com',
    'mate': 'mate.com.au',
    'dodo': 'dodo.com',
    'ipstar': 'ipstar.com.au',
    'belong': 'belong.com.au',
    'southern-phone': 'southernphone.com.au',
    'moose-mobile': 'moosemobile.com.au',
    'amaysim': 'amaysim.com.au',
    'internode': 'internode.on.net',
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
