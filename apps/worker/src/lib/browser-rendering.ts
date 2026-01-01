/**
 * Cloudflare Browser Rendering
 * 
 * FREE: 2 million requests/month
 * Perfect for JavaScript-heavy sites that need full browser rendering
 * 
 * Docs: https://developers.cloudflare.com/browser-rendering/
 */

interface BrowserBinding {
  launch(): Promise<Browser>;
}

interface Browser {
  newPage(): Promise<Page>;
  close(): Promise<void>;
}

interface Page {
  goto(url: string, options?: { waitUntil?: string }): Promise<void>;
  content(): Promise<string>;
  close(): Promise<void>;
}

/**
 * Fetch HTML using Cloudflare Browser Rendering
 * Best for JavaScript-heavy sites
 */
export async function fetchViaBrowser(
  url: string,
  browserBinding: BrowserBinding
): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`Launching browser for ${url}...`);
    browser = await browserBinding.launch();
    page = await browser.newPage();
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    console.log(`Extracting content from ${url}...`);
    const html = await page.content();
    
    return html;
  } catch (error) {
    console.error(`Browser rendering failed for ${url}:`, error);
    throw error;
  } finally {
    // Clean up
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error('Failed to close page:', e);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Failed to close browser:', e);
      }
    }
  }
}

/**
 * Smart fallback chain:
 * 1. User-Agent rotation (fast, free)
 * 2. Browser rendering (slower but handles JavaScript)
 */
export async function fetchWithSmartFallback(
  url: string,
  browserBinding?: BrowserBinding
): Promise<string> {
  // Import user-agent rotation
  const { fetchWithFallback } = await import('./scraper-api');
  
  try {
    // First: Try user-agent rotation (fast)
    console.log(`Attempting user-agent rotation for ${url}...`);
    return await fetchWithFallback(url);
  } catch (error) {
    console.log(`User-agent rotation failed for ${url}, trying browser rendering...`);
    
    // Second: Try browser rendering if available
    if (browserBinding) {
      try {
        return await fetchViaBrowser(url, browserBinding);
      } catch (browserError) {
        console.error(`Browser rendering also failed for ${url}:`, browserError);
        throw new Error(`All fetch methods failed for ${url}`);
      }
    }
    
    // No browser available, re-throw original error
    throw error;
  }
}
