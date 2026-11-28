import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  APP_STAGE: z.enum(["development", "staging", "production"]).default("production"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(20),
  // Path the browser sees for /auth (e.g. "/api/auth" once the web proxies the API, US-OPS-02).
  REFRESH_COOKIE_PATH: z.string().startsWith("/").default("/auth"),
  // Proxies in front of the API whose X-Forwarded-For we trust (Render = 1; +1 per extra proxy).
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).optional(),
});

export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  stage: "development" | "staging" | "production";
  webOrigins: string[];
  /** Login attempts allowed per IP per 15 minutes. */
  loginRateLimit: number;
  refreshCookiePath: string;
  trustProxyHops: number;
}

export const CONFIG = Symbol("CONFIG");

/** Reads env once at startup; the API refuses to start with missing or weak settings. */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid API config: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  const e = parsed.data;
  if (e.APP_STAGE !== "development" && !env.WEB_ORIGIN) {
    throw new Error("Invalid API config: WEB_ORIGIN is required outside development");
  }
  return {
    databaseUrl: e.DATABASE_URL,
    jwtSecret: e.JWT_SECRET,
    stage: e.APP_STAGE,
    webOrigins: e.WEB_ORIGIN.split(",").map((o) => o.trim()),
    loginRateLimit: e.LOGIN_RATE_LIMIT,
    refreshCookiePath: e.REFRESH_COOKIE_PATH,
    trustProxyHops: e.TRUST_PROXY_HOPS ?? (e.APP_STAGE === "development" ? 0 : 1),
  };
}
