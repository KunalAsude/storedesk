import type { Clock } from "../common/clock";

/**
 * In-memory fixed-window limiter (one API instance on Render free). Moves to Postgres
 * if we ever run more than one instance.
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private nextSweep = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly clock: Clock,
  ) {}

  /** Counts one attempt for `key`; returns seconds to wait when over the limit. */
  hit(key: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const now = this.clock.now().getTime();
    // Drop expired entries at most once a minute (keeps memory bounded without O(n) per hit).
    if (now >= this.nextSweep) {
      this.nextSweep = now + 60_000;
      for (const [k, v] of this.hits) if (v.resetAt <= now) this.hits.delete(k);
    }
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }
    entry.count += 1;
    if (entry.count > this.limit) return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    return { allowed: true };
  }
}
