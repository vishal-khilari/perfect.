// Simple in-memory rate limiter (use Redis/KV on production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '5');
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);
