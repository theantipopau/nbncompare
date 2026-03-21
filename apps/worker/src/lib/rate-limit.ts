interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = options;
  const requests = new Map<string, { count: number; resetTime: number }>();

  function defaultKeyGenerator(request: Request): string {
    // Use IP address as key, fallback to a default for development
    const ip = request.headers.get('CF-Connecting-IP') ||
               request.headers.get('X-Forwarded-For') ||
               request.headers.get('X-Real-IP') ||
               'unknown';
    return ip;
  }

  return async (request: Request): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Clean up old entries
    for (const [k, data] of requests.entries()) {
      if (data.resetTime < now) {
        requests.delete(k);
      }
    }

    const userRequests = requests.get(key);
    if (!userRequests || userRequests.resetTime < now) {
      // First request in window
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, resetTime: now + windowMs, remaining: maxRequests - 1 };
    }

    if (userRequests.count >= maxRequests) {
      return { allowed: false, resetTime: userRequests.resetTime, remaining: 0 };
    }

    userRequests.count++;
    return { allowed: true, resetTime: userRequests.resetTime, remaining: maxRequests - userRequests.count };
  };
}

/**
 * Creates a rate-limit middleware that can be applied to async handlers.
 * The returned function takes the actual handler and wraps it with rate limiting.
 * 
 * Usage:
 *   const limitedHandler = rateLimit(options)(originalHandler);
 *   const response = await limitedHandler(request, env);
 */
export function rateLimit(options: RateLimitOptions) {
  const limiter = createRateLimiter(options);

  return (handler: (request: Request, env?: any) => Promise<Response>) => {
    return async (request: Request, env?: any): Promise<Response> => {
      const result = await limiter(request);

      if (!result.allowed) {
        return new Response(JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: result.resetTime
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': result.remaining?.toString() || '0',
            'X-RateLimit-Reset': result.resetTime?.toString() || '',
            'Retry-After': Math.ceil(((result.resetTime || Date.now()) - Date.now()) / 1000).toString()
          }
        });
      }

      // Call the actual handler with rate limit info attached to request
      const response = await handler(request, env);
      
      // Add rate limit headers to successful response
      response.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0');
      response.headers.set('X-RateLimit-Reset', result.resetTime?.toString() || '');

      return response;
    };
  };
}