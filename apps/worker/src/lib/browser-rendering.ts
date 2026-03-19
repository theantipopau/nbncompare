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

interface FetchSettings {
  timeoutMs?: number;
  maxRetries?: number;
}

const DEFAULT_BROWSER_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)),
  ]);
}

/**
 * Fetch HTML using Cloudflare Browser Rendering
 * Best for JavaScript-heavy sites
 */
export async function fetchViaBrowser(
  url: string,
  browserBinding: BrowserBinding,
  settings: FetchSettings = {}
): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const timeoutMs = settings.timeoutMs ?? DEFAULT_BROWSER_TIMEOUT_MS;

  try {
    console.log(`Launching browser for ${url}...`);
    browser = await withTimeout(browserBinding.launch(), timeoutMs, 'Browser launch');
    page = await withTimeout(browser.newPage(), timeoutMs, 'Page creation');
    
    console.log(`Navigating to ${url}...`);
    await withTimeout(page.goto(url, { waitUntil: 'networkidle' }), timeoutMs, 'Page navigation');
    
    console.log(`Extracting content from ${url}...`);
    const html = await withTimeout(page.content(), timeoutMs, 'Page content extraction');
    
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
  browserBinding?: BrowserBinding,
  settings: FetchSettings = {}
): Promise<string> {
  // Import user-agent rotation
  const { fetchWithFallback } = await import('./scraper-api');
  const maxRetries = settings.maxRetries ?? 3;
  
  try {
    // First: Try user-agent rotation (fast)
    console.log(`Attempting user-agent rotation for ${url}...`);
    return await fetchWithFallback(url, undefined, 0, { timeoutMs: settings.timeoutMs, maxRetries });
  } catch (error) {
    console.log(`User-agent rotation failed for ${url}, trying browser rendering...`);
    
    // Second: Try browser rendering if available
    if (browserBinding) {
      try {
        return await fetchViaBrowser(url, browserBinding, settings);
      } catch (browserError) {
        console.error(`Browser rendering also failed for ${url}:`, browserError);
        throw new Error(`All fetch methods failed for ${url} (maxRetries=${maxRetries})`);
      }
    }
    
    // No browser available, re-throw original error
    throw error;
  }
}
