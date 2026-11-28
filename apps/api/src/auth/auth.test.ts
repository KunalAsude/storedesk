// US-AUTH-01 against a real throwaway Postgres (bun run db:up locally; service container in CI).
import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { companies, createDb, memberships, stores, users } from "@storedesk/db";
import { createTestDatabase } from "@storedesk/db/testing";
import { eq } from "drizzle-orm";
import { createApp } from "../main";
import { TestClock, testConfig } from "../test-utils";
import { MAX_FAILED_LOGINS, normalizeIdentifier } from "./auth.service";

const PASSWORD = "correct-horse-1";
const MIN = 60_000;
const DAY = 86_400_000;

let dropDb: () => Promise<void>;
let conn: ReturnType<typeof createDb>;
let app: Awaited<ReturnType<typeof createApp>>;
let base = "";
const clock = new TestClock();
const ids = { store1: "", store2: "", company: "" };

beforeAll(async () => {
  const tdb = await createTestDatabase();
  dropDb = tdb.drop;
  conn = createDb(tdb.url);
  const db = conn.db;

  const passwordHash = await Bun.password.hash(PASSWORD, { algorithm: "argon2id" });
  const [company] = await db.insert(companies).values({ name: "Brand Hub" }).returning();
  const [s1, s2] = await db
    .insert(stores)
    .values([
      { companyId: company!.id, name: "Kopargaon" },
      { companyId: company!.id, name: "Shirdi" },
    ])
    .returning();
  const [, owner, cashier, , , , , leaver] = await db
    .insert(users)
    .values([
      { name: "Kunal", email: "admin@example.com", passwordHash, platformRole: "super_admin" },
      { name: "Owner", email: "Owner@Example.com", passwordHash, lastStoreId: s2!.id },
      { name: "Cashier", phone: "+919822412345", passwordHash },
      { name: "Gone", email: "gone@example.com", passwordHash, isActive: false },
      { name: "Nobody", email: "nostore@example.com", passwordHash },
      { name: "Locky", email: "lock@example.com", passwordHash, platformRole: "support" },
      { name: "Racer", email: "race@example.com", passwordHash, platformRole: "support" },
      { name: "Leaver", email: "leaver@example.com", passwordHash },
    ])
    .returning();
  await db.insert(memberships).values([
    { userId: owner!.id, companyId: company!.id, storeId: s1!.id, role: "owner" },
    { userId: owner!.id, companyId: company!.id, storeId: s2!.id, role: "owner" },
    { userId: cashier!.id, companyId: company!.id, storeId: s1!.id, role: "cashier" },
    { userId: leaver!.id, companyId: company!.id, storeId: s1!.id, role: "cashier" },
  ]);
  Object.assign(ids, { store1: s1!.id, store2: s2!.id, company: company!.id });

  app = await createApp({ config: testConfig(tdb.url), clock });
  app.useLogger(false);
  await app.listen(0);
  base = (await app.getUrl()).replace("[::1]", "localhost");
});

afterAll(async () => {
  await app?.close();
  await conn?.client.end();
  await dropDb?.();
});

beforeEach(() => clock.reset());

function login(identifier: string, password = PASSWORD) {
  return fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
}

function refreshCookie(res: Response): string {
  const raw = res.headers.getSetCookie().find((c) => c.startsWith("sd_refresh="));
  if (!raw) throw new Error("no refresh cookie");
  return raw.split(";")[0]!;
}

function refresh(cookie: string, contentType = "application/json") {
  return fetch(`${base}/auth/refresh`, { method: "POST", headers: { "content-type": contentType, cookie }, body: "{}" });
}

const me = (accessToken: string) => fetch(`${base}/auth/me`, { headers: { authorization: `Bearer ${accessToken}` } });

describe("login", () => {
  test("super admin lands on Admin → Analytics", async () => {
    const res = await login("admin@example.com");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ landing: "/admin/analytics", store: null, expiresIn: 900 });
    expect(body.user).toMatchObject({ name: "Kunal", platformRole: "super_admin" });
    expect(body.user.passwordHash).toBeUndefined();

    const cookie = res.headers.getSetCookie().find((c) => c.startsWith("sd_refresh="))!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/auth");
    expect(cookie).toContain("SameSite=Lax");

    expect((await me(body.accessToken)).status).toBe(200);
  });

  test("store user lands on the dashboard of the last store used (email is case-insensitive)", async () => {
    const res = await login("owner@example.com");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      landing: "/store/dashboard",
      store: { id: ids.store2, name: "Shirdi", companyId: ids.company, companyName: "Brand Hub", role: "owner" },
    });
  });

  test("phone login works with spaces, dashes, or without +91", async () => {
    for (const phone of ["+91 98224-12345", "98224 12345"]) {
      const res = await login(phone);
      expect(res.status).toBe(200);
      expect((await res.json()).store).toMatchObject({ id: ids.store1, role: "cashier" });
    }
    expect(normalizeIdentifier("abc")).toBe("");
  });

  test("wrong password and unknown user get the same reply", async () => {
    try {
      const wrong = await login("admin@example.com", "nope-nope");
      const unknown = await login("ghost@example.com", "nope-nope");
      expect(wrong.status).toBe(401);
      expect(unknown.status).toBe(401);
      const body = await wrong.json();
      expect(body).toEqual(await unknown.json());
      expect(body).toMatchObject({ code: "INVALID_CREDENTIALS", message: "Email/phone or password is incorrect" });
    } finally {
      // keep tests independent of this failed try
      await conn.db.update(users).set({ failedLogins: 0 }).where(eq(users.email, "admin@example.com"));
    }
  });

  test("unknown email locks the same way, so the lock doesn't reveal who has an account", async () => {
    for (let i = 1; i < MAX_FAILED_LOGINS; i++) expect((await login("phantom@example.com", "x-wrong")).status).toBe(401);
    const fifth = await login("phantom@example.com", "x-wrong");
    expect(fifth.status).toBe(423);
    expect(await fifth.json()).toMatchObject({ code: "ACCOUNT_LOCKED", retryAfterSeconds: 900 });
  });

  test("parallel wrong guesses can't skip the lock", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => login("race@example.com", "wrong-pass")));
    expect(results.filter((r) => r.status === 423).length).toBeGreaterThanOrEqual(10 - (MAX_FAILED_LOGINS - 1));
    expect((await login("race@example.com")).status).toBe(423);
  });

  test(`${MAX_FAILED_LOGINS} wrong passwords lock the account for 15 min`, async () => {
    for (let i = 1; i < MAX_FAILED_LOGINS; i++) expect((await login("lock@example.com", "wrong-pass")).status).toBe(401);
    const fifth = await login("lock@example.com", "wrong-pass");
    expect(fifth.status).toBe(423);
    expect(await fifth.json()).toMatchObject({ code: "ACCOUNT_LOCKED", retryAfterSeconds: 900 });

    // even the right password is refused while locked
    expect((await login("lock@example.com")).status).toBe(423);

    clock.advance(14 * MIN);
    expect((await login("lock@example.com")).status).toBe(423);
    clock.advance(2 * MIN);
    expect((await login("lock@example.com")).status).toBe(200);
  });

  test("deactivated user: told only after the right password", async () => {
    expect(await (await login("gone@example.com", "wrong-pass")).json()).toMatchObject({ code: "INVALID_CREDENTIALS" });
    const res = await login("gone@example.com");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "ACCOUNT_DISABLED" });
  });

  test("store user without any store is refused", async () => {
    const res = await login("nostore@example.com");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "NO_STORE_ACCESS" });
  });

  test("login needs JSON (blocks cross-site form posts)", async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `identifier=admin%40example.com&password=${PASSWORD}`,
    });
    expect(res.status).toBe(400);
  });

  test("bad input → 400 VALIDATION_FAILED", async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier: "a" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });
});

describe("refresh token", () => {
  test("rotates: new cookie and access token, old cookie stops working", async () => {
    const first = refreshCookie(await login("admin@example.com"));
    const res = await refresh(first);
    expect(res.status).toBe(200);
    const second = refreshCookie(res);
    expect(second).not.toBe(first);
    expect((await me((await res.json()).accessToken)).status).toBe(200);
  });

  test("reusing a rotated token revokes the whole login (theft detection)", async () => {
    const first = refreshCookie(await login("admin@example.com"));
    const second = refreshCookie(await refresh(first));

    clock.advance(11_000); // past the two-tabs race window
    const reuse = await refresh(first);
    expect(reuse.status).toBe(401);
    expect(await reuse.json()).toMatchObject({ code: "SESSION_EXPIRED" });
    expect(reuse.headers.getSetCookie().some((c) => c.startsWith("sd_refresh=;"))).toBe(true);

    // the legitimate newest token is revoked too
    expect((await refresh(second)).status).toBe(401);
  });

  test("two tabs refreshing at once: one wins, the other gets 409 and nothing is revoked", async () => {
    const cookie = refreshCookie(await login("admin@example.com"));
    const [a, b] = await Promise.all([refresh(cookie), refresh(cookie)]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 409]);
    const winner = a.status === 200 ? a : b;
    const loser = a.status === 200 ? b : a;
    expect(await loser.json()).toMatchObject({ code: "REFRESH_RACE" });
    expect(loser.headers.getSetCookie().some((c) => c.startsWith("sd_refresh="))).toBe(false);
    expect((await refresh(refreshCookie(winner))).status).toBe(200);
  });

  test("losing store access ends the session at the next refresh", async () => {
    const cookie = refreshCookie(await login("leaver@example.com"));
    const [leaver] = await conn.db.select().from(users).where(eq(users.email, "leaver@example.com"));
    await conn.db.delete(memberships).where(eq(memberships.userId, leaver!.id));
    const res = await refresh(cookie);
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "NO_STORE_ACCESS" });
    expect((await refresh(cookie)).status).toBe(401);
  });

  test("expires after 30 days without use", async () => {
    const cookie = refreshCookie(await login("admin@example.com"));
    clock.advance(31 * DAY);
    expect((await refresh(cookie)).status).toBe(401);
  });

  test("deactivating a user ends their session at the next refresh", async () => {
    const cookie = refreshCookie(await login("+919822412345"));
    await conn.db.update(users).set({ isActive: false }).where(eq(users.phone, "+919822412345"));
    try {
      const res = await refresh(cookie);
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ code: "ACCOUNT_DISABLED" });
    } finally {
      await conn.db.update(users).set({ isActive: true }).where(eq(users.phone, "+919822412345"));
    }
  });

  test("needs a JSON request (blocks cross-site form posts)", async () => {
    const cookie = refreshCookie(await login("admin@example.com"));
    expect((await refresh(cookie, "application/x-www-form-urlencoded")).status).toBe(400);
  });

  test("no cookie → 401", async () => {
    const res = await fetch(`${base}/auth/refresh`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect(res.status).toBe(401);
  });
});

describe("access token", () => {
  test("expires after 15 minutes", async () => {
    const { accessToken } = await (await login("admin@example.com")).json();
    clock.advance(16 * MIN);
    expect((await me(accessToken)).status).toBe(401);
  });

  test("a tampered token is rejected", async () => {
    const { accessToken } = await (await login("admin@example.com")).json();
    const [h, p, s] = (accessToken as string).split(".");
    const payload = JSON.parse(Buffer.from(p!, "base64url").toString());
    const forged = Buffer.from(JSON.stringify({ ...payload, pr: "super_admin", sub: "someone-else" })).toString("base64url");
    expect((await me(`${h}.${forged}.${s}`)).status).toBe(401);
  });

  test("/me falls back to a store the user still belongs to", async () => {
    const { accessToken } = await (await login("owner@example.com")).json(); // token says store2
    const [owner] = await conn.db.select().from(users).where(eq(users.email, "Owner@Example.com"));
    await conn.db.delete(memberships).where(eq(memberships.storeId, ids.store2));
    try {
      expect(await (await me(accessToken)).json()).toMatchObject({ store: { id: ids.store1 } });
    } finally {
      await conn.db.insert(memberships).values({ userId: owner!.id, companyId: ids.company, storeId: ids.store2, role: "owner" });
    }
  });

  test("no token → 401 UNAUTHENTICATED", async () => {
    const res = await fetch(`${base}/auth/me`);
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: "UNAUTHENTICATED" });
  });
});

describe("rate limit", () => {
  test("too many login attempts from one IP → 429", async () => {
    const limited = await createApp({ config: testConfig(undefined, { loginRateLimit: 2 }), clock });
    limited.useLogger(false);
    await limited.listen(0);
    const url = (await limited.getUrl()).replace("[::1]", "localhost");
    try {
      const attempt = () =>
        fetch(`${url}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      expect((await attempt()).status).toBe(400);
      expect((await attempt()).status).toBe(400);
      const third = await attempt();
      expect(third.status).toBe(429);
      expect(third.headers.get("retry-after")).toBe("900");
      expect(await third.json()).toMatchObject({ code: "TOO_MANY_ATTEMPTS" });
    } finally {
      await limited.close();
    }
  });
});
