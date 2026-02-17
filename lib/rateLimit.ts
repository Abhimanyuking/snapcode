// WARNING: In-memory rate limiting. On serverless (Vercel), this resets on cold starts.
// For production, migrate to Redis/Upstash KV.

// Per-minute rate limiter
const requests = new Map<string, number[]>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

export function rateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];

  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    requests.set(ip, valid);
    return { allowed: false, remaining: 0 };
  }

  valid.push(now);
  requests.set(ip, valid);

  // Cleanup expired entries periodically
  if (requests.size > 200) {
    for (const [key, val] of requests) {
      if (val.every((t) => now - t >= WINDOW_MS)) {
        requests.delete(key);
      }
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS - valid.length };
}

// ── Daily generation limit (5 per day per IP for free tier) ──
const dailyUsage = new Map<string, { count: number; resetAt: number }>();

const DAILY_LIMIT = 10;

/** Check if daily limit allows a request (does NOT increment counter) */
export function dailyLimitCheck(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Cleanup expired daily entries periodically
  if (dailyUsage.size > 200) {
    for (const [key, val] of dailyUsage) {
      if (now >= val.resetAt) {
        dailyUsage.delete(key);
      }
    }
  }

  const entry = dailyUsage.get(ip);

  if (!entry || now >= entry.resetAt) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

/** Increment daily counter after successful generation */
export function dailyLimitIncrement(ip: string): void {
  const now = Date.now();
  const entry = dailyUsage.get(ip);

  if (!entry || now >= entry.resetAt) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    dailyUsage.set(ip, { count: 1, resetAt: tomorrow.getTime() });
    return;
  }

  entry.count++;
}

// ── AI Edit limit (3 per conversion for free tier) ──
const editUsage = new Map<string, number>(); // key: ip:resultId -> count

const EDIT_LIMIT_PER_CONVERSION = 3;

/** Check if edit limit allows a request for a specific conversion */
export function editLimitCheck(ip: string, resultId: string): { allowed: boolean; remaining: number } {
  const key = `${ip}:${resultId}`;
  const count = editUsage.get(key) || 0;

  if (count >= EDIT_LIMIT_PER_CONVERSION) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: EDIT_LIMIT_PER_CONVERSION - count };
}

/** Increment edit counter after successful edit */
export function editLimitIncrement(ip: string, resultId: string): void {
  const key = `${ip}:${resultId}`;
  const count = editUsage.get(key) || 0;
  editUsage.set(key, count + 1);

  // Cleanup old entries (keep max 500)
  if (editUsage.size > 500) {
    const keys = [...editUsage.keys()];
    for (let i = 0; i < keys.length - 300; i++) {
      editUsage.delete(keys[i]);
    }
  }
}

// ── Free tier framework restriction ──
const FREE_FRAMEWORKS = ["html-tailwind"];

export function isFrameworkFree(framework: string): boolean {
  return FREE_FRAMEWORKS.includes(framework);
}
