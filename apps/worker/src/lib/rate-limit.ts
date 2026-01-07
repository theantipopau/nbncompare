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

export function rateLimit(options: RateLimitOptions) {
  const limiter = createRateLimiter(options);

  return async (request: Request) => {
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

    // Add rate limit headers to successful requests
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0');
    newResponse.headers.set('X-RateLimit-Reset', result.resetTime?.toString() || '');

    return newResponse;
  };
}