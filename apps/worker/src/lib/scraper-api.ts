/**
 * Free Scraping with User-Agent Rotation
 * 
 * Simple, free alternative to paid scraping services.
 * Works for most sites without strong bot protection.
 * 
 * Features:
 * - User-Agent rotation (looks like different browsers)
 * - Random delays to avoid rate limiting
 * - Realistic browser headers
 * - Referer spoofing
 * 
 * Cost: $0/month (completely free!)
 */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

interface FetchOptions {
  render?: boolean; // Legacy: kept for compatibility
  delay?: boolean; // Add random delay (1-3 seconds)
  country_code?: string; // Legacy: kept for compatibility
  timeoutMs?: number;
  maxRetries?: number;
}

type CircuitState = {
  failures: number;
  openUntil: number;
};

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_CONSECUTIVE_FAILURES = 4;
const CIRCUIT_OPEN_MS = 5 * 60 * 1000;
const circuitStateByHost = new Map<string, CircuitState>();

/**
 * Fetch with rotating user agents and realistic headers
 */
export async function fetchViaScraperAPI(
  url: string,
  _apiKey: string, // Kept for backward compatibility
  options: FetchOptions = {}
): Promise<string> {
  return await fetchWithRotation(url, options);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutAfter<T>(ms: number, label: string): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
}

function circuitKey(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function assertCircuitClosed(url: string): void {
  const key = circuitKey(url);
  const state = circuitStateByHost.get(key);
  if (!state) return;
  if (state.openUntil > Date.now()) {
    const retryInSec = Math.ceil((state.openUntil - Date.now()) / 1000);
    throw new Error(`Circuit open for ${key}, retry in ${retryInSec}s`);
  }
}

function recordSuccess(url: string): void {
  circuitStateByHost.delete(circuitKey(url));
}

function recordFailure(url: string): void {
  const key = circuitKey(url);
  const current = circuitStateByHost.get(key) ?? { failures: 0, openUntil: 0 };
  const failures = current.failures + 1;
  if (failures >= MAX_CONSECUTIVE_FAILURES) {
    circuitStateByHost.set(key, { failures, openUntil: Date.now() + CIRCUIT_OPEN_MS });
    return;
  }
  circuitStateByHost.set(key, { failures, openUntil: 0 });
}

async function fetchWithRotation(url: string, options: FetchOptions = {}): Promise<string> {
  assertCircuitClosed(url);

  // Random user agent
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  
  // Optional delay to avoid rate limiting
  const delay = options.delay ? Math.random() * 2000 + 1000 : 0; // 1-3 seconds

  if (delay > 0) {
    await sleep(delay);
  }

  try {
    const response = await Promise.race([
      fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,en-AU;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://www.google.com/',
        },
      }),
      timeoutAfter<Response>(timeoutMs, 'Fetch request'),
    ]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await Promise.race([
      response.text(),
      timeoutAfter<string>(timeoutMs, 'Response body read'),
    ]);
    recordSuccess(url);
    return html;
  } catch (error) {
    recordFailure(url);
    console.error(`Fetch with rotation failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Fallback: Try direct fetch first, use ScraperAPI if blocked
 */
export async function fetchWithFallback(
  url: string,
  scraperApiKey?: string,
  retryCount = 0,
  options: FetchOptions = {}
): Promise<string> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = 1000;
  
  try {
    // First attempt: no delay
    console.log(`Fetching ${url} with user-agent rotation (attempt ${retryCount + 1})...`);
    return await fetchWithRotation(url, { ...options, delay: retryCount > 0 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Check if it's a 403 (rate limited/blocked)
    if (errorMsg.includes('403') && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`403 Forbidden for ${url}, waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return await fetchWithFallback(url, scraperApiKey, retryCount + 1, options);
    }
    
    // For non-403 errors or max retries reached
    if (retryCount < 1) {
      console.log(`First attempt failed for ${url}, retrying with delay...`);
      try {
        // Second attempt: with delay
        return await fetchWithRotation(url, { ...options, delay: true });
      } catch (retryError) {
        console.error(`All fetch attempts failed for ${url}:`, retryError);
        throw new Error(`Could not fetch ${url}: ${retryError}`);
      }
    }
    
    console.error(`All fetch attempts failed for ${url}:`, error);
    throw new Error(`Could not fetch ${url}: ${errorMsg}`);
  }
}

/**
 * Check ScraperAPI account status
 */
export async function getScraperAPIStatus(_apiKey: string): Promise<{ message: string; cost: string; unlimited: boolean; service: string }> {
  return {
    message: 'Now using free User-Agent rotation instead of ScraperAPI',
    cost: '$0/month',
    unlimited: true,
    service: 'User-Agent Rotation (Free)',
  };
}
