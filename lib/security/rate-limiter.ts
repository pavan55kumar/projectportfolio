interface RateLimitEntry {
  timestamps: number[];
}

// In-memory sliding window store
// On serverless environments (Vercel), each container has its own memory instance.
// For serverless cold starts, memory resets safely.
const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    // Keep entries that have timestamps in the last hour
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < 60 * 60 * 1000);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  windowMs: number;
  retryAfterSeconds: number;
}

/**
 * Checks and increments sliding window rate limit for a given key.
 *
 * @param key Unique key, e.g. `login:src_abc123` or `api:src_abc123`
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (e.g. 60000 for 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      count: entry.timestamps.length,
      limit,
      windowMs,
      retryAfterSeconds,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    allowed: true,
    count: entry.timestamps.length,
    limit,
    windowMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Checks if a source has repeated failed logins (> 3 within 15 mins).
 */
export function checkFailedLoginBurst(sourceFingerprint: string): {
  isBurst: boolean;
  failedCount: number;
} {
  const key = `failed_login:${sourceFingerprint}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const windowStart = now - windowMs;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  entry.timestamps.push(now);

  return {
    isBurst: entry.timestamps.length >= 3,
    failedCount: entry.timestamps.length,
  };
}
