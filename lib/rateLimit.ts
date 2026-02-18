import { getRedis } from "./redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10; // 10 requests per minute per IP

export async function rateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = `rl:min:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_REQUESTS - count };
}

// ── Daily generation limit (10 per day per IP for free tier) ──

const DAILY_LIMIT = 10;

/** Check if daily limit allows a request (does NOT increment counter) */
export async function dailyLimitCheck(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = `rl:daily:${ip}`;
  const count = await redis.get<number>(key);

  if (count === null) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  if (count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: DAILY_LIMIT - count };
}

/** Increment daily counter after successful generation */
export async function dailyLimitIncrement(ip: string): Promise<void> {
  const redis = getRedis();
  const key = `rl:daily:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    // Set expiry to midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const secondsUntilMidnight = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);
    await redis.expire(key, secondsUntilMidnight);
  }
}

// ── AI Edit limit (3 per conversion for free tier) ──

const EDIT_LIMIT_PER_CONVERSION = 3;

/** Check if edit limit allows a request for a specific conversion */
export async function editLimitCheck(ip: string, resultId: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = `rl:edit:${ip}:${resultId}`;
  const count = await redis.get<number>(key);

  if (count === null) {
    return { allowed: true, remaining: EDIT_LIMIT_PER_CONVERSION };
  }

  if (count >= EDIT_LIMIT_PER_CONVERSION) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: EDIT_LIMIT_PER_CONVERSION - count };
}

/** Increment edit counter after successful edit */
export async function editLimitIncrement(ip: string, resultId: string): Promise<void> {
  const redis = getRedis();
  const key = `rl:edit:${ip}:${resultId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    // Edit keys expire after 24 hours (auto-cleanup)
    await redis.expire(key, 86400);
  }
}

// ── Free tier framework restriction ──
const FREE_FRAMEWORKS = ["html-tailwind"];

export function isFrameworkFree(framework: string): boolean {
  return FREE_FRAMEWORKS.includes(framework);
}
