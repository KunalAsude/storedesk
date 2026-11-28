// Test helpers (imported by *.test.ts only).
import type { Clock } from "./common/clock";
import type { AppConfig } from "./config";

export function testConfig(databaseUrl = "postgres://unused:unused@localhost:5432/unused", over: Partial<AppConfig> = {}): AppConfig {
  return {
    databaseUrl,
    jwtSecret: "test-only-secret-that-is-at-least-32-chars",
    stage: "development",
    webOrigins: ["http://localhost:3000"],
    loginRateLimit: 1000,
    refreshCookiePath: "/auth",
    trustProxyHops: 0,
    ...over,
  };
}

/** Clock the test can move forward. */
export class TestClock implements Clock {
  private t = Date.now();
  now() {
    return new Date(this.t);
  }
  reset() {
    this.t = Date.now();
  }
  advance(ms: number) {
    this.t += ms;
  }
}
