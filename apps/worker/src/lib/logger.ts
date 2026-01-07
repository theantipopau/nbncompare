interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: unknown;
}

export class Logger {
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || crypto.randomUUID();
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      requestId: this.requestId,
    });
  }

  info(message: string, data?: unknown) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...(data && typeof data === 'object' ? data as Record<string, unknown> : {}),
    };
    console.log(this.formatLog(entry));
  }

  warn(message: string, data?: unknown) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...(data && typeof data === 'object' ? data as Record<string, unknown> : {}),
    };
    console.warn(this.formatLog(entry));
  }

  error(message: string, error?: unknown, data?: unknown) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: (error as Error)?.message || error,
      ...(data && typeof data === 'object' ? data as Record<string, unknown> : {}),
    };
    console.error(this.formatLog(entry));
  }

  request(request: Request, startTime: number, statusCode?: number) {
    const duration = Date.now() - startTime;
    this.info('Request completed', {
      method: request.method,
      url: request.url,
      statusCode,
      duration,
      userAgent: request.headers.get('User-Agent'),
      ip: request.headers.get('CF-Connecting-IP') ||
          request.headers.get('X-Forwarded-For') ||
          request.headers.get('X-Real-IP'),
    });
  }
}

export function createLogger(request?: Request): Logger {
  const requestId = request?.headers.get('X-Request-ID') || crypto.randomUUID();
  return new Logger(requestId);
}