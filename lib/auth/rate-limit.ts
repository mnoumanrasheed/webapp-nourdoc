type Attempt = { failures: number; windowStarted: number; blockedUntil: number };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map<string, Attempt>();

export function checkLoginRateLimit(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  const attempt = attempts.get(key);
  if (!attempt || attempt.blockedUntil <= now) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((attempt.blockedUntil - now) / 1000)) };
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const previous = attempts.get(key);
  const withinWindow = previous && now - previous.windowStarted < WINDOW_MS;
  const failures = withinWindow ? previous.failures + 1 : 1;
  const windowStarted = withinWindow ? previous.windowStarted : now;
  attempts.set(key, {
    failures,
    windowStarted,
    blockedUntil: failures >= MAX_FAILURES ? windowStarted + WINDOW_MS : 0,
  });
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}
