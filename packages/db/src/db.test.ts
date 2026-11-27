// Runs against local Postgres (bun run db:up). Each run migrates a brand-new
// throwaway database, then drops it.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { auditLog, companies, createDb, invitations, memberships, sessions, stores, users, withCompany, type Db } from "./index";
import { runMigrations } from "./migrate";
import { readSeedEnv, seed, SEED_COMPANY } from "./seed";

const ADMIN_URL = process.env.TEST_DATABASE_URL ?? "postgres://storedesk:storedesk@localhost:5432/storedesk";
const dbName = `storedesk_test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
const testUrl = (() => {
  const u = new URL(ADMIN_URL);
  u.pathname = `/${dbName}`;
  return u.toString();
})();

/** Resolves to the Postgres error message (drizzle wraps it in `cause`), or throws if it succeeded. */
async function pgError(q: PromiseLike<unknown>): Promise<string> {
  try {
    await q;
  } catch (e) {
    const err = e as Error & { cause?: Error };
    return err.cause?.message ?? err.message;
  }
  throw new Error("expected the query to fail");
}

let admin: postgres.Sql;
let conn: ReturnType<typeof createDb>;
let db: Db;
const ids = { a: "", b: "", storeA: "", storeB: "", userA: "", userB: "" };

beforeAll(async () => {
  admin = postgres(ADMIN_URL, { max: 1, onnotice: () => {} });
  try {
    await admin`select 1`;
  } catch {
    throw new Error(`Postgres not reachable at TEST_DATABASE_URL / localhost:5432. Run: bun run db:up`);
  }
  await admin.unsafe(`CREATE DATABASE ${dbName}`);
  await runMigrations(testUrl);
  conn = createDb(testUrl);
  db = conn.db;

  // Two companies, created as owner (RLS does not filter the owner).
  const [a, b] = await db.insert(companies).values([{ name: "Company A" }, { name: "Company B" }]).returning();
  const [sa, sb] = await db
    .insert(stores)
    .values([
      { companyId: a!.id, name: "A store" },
      { companyId: b!.id, name: "B store" },
    ])
    .returning();
  const [ua, ub] = await db
    .insert(users)
    .values([
      { name: "Owner A", email: "a@example.com", passwordHash: "x" },
      { name: "Owner B", email: "b@example.com", passwordHash: "x" },
    ])
    .returning();
  await db.insert(memberships).values([
    { userId: ua!.id, companyId: a!.id, storeId: sa!.id, role: "owner" },
    { userId: ub!.id, companyId: b!.id, storeId: sb!.id, role: "owner" },
  ]);
  const expiresAt = new Date(Date.now() + 86_400_000);
  await db.insert(invitations).values([
    { email: "x@a.com", tokenHash: "ta", companyId: a!.id, storeId: sa!.id, role: "cashier", expiresAt },
    { email: "x@b.com", tokenHash: "tb", companyId: b!.id, storeId: sb!.id, role: "cashier", expiresAt },
    { email: "admin@x.com", tokenHash: "tp", role: "admin", expiresAt },
  ]);
  await db.insert(auditLog).values([
    { companyId: a!.id, action: "test", entityType: "store" },
    { companyId: b!.id, action: "test", entityType: "store" },
    { action: "platform", entityType: "plan" },
  ]);
  await db.insert(sessions).values({ userId: ua!.id, refreshTokenHash: "r", expiresAt });
  Object.assign(ids, { a: a!.id, b: b!.id, storeA: sa!.id, storeB: sb!.id, userA: ua!.id, userB: ub!.id });
});

afterAll(async () => {
  await conn?.client.end();
  await admin?.unsafe(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
  await admin?.end();
});

describe("migrations", () => {
  test("run on a fresh database and create every table", async () => {
    const rows = await db.execute<{ tablename: string }>(
      sql`select tablename from pg_tables where schemaname = 'public' order by tablename`,
    );
    expect(rows.map((r) => r.tablename)).toEqual([
      "audit_log",
      "companies",
      "invitations",
      "memberships",
      "sessions",
      "stores",
      "users",
    ]);
  });

  test("running again is a no-op", async () => {
    await runMigrations(testUrl);
  });

  test("every table with company_id has RLS enabled and a policy", async () => {
    const rows = await db.execute<{ table: string; rls: boolean; policies: number }>(sql`
      select c.relname as table, c.relrowsecurity as rls,
             (select count(*)::int from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
        and exists (select 1 from information_schema.columns col
                    where col.table_schema = 'public' and col.table_name = c.relname and col.column_name = 'company_id')`);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect({ table: r.table, rls: r.rls, hasPolicy: r.policies > 0 }).toEqual({ table: r.table, rls: true, hasPolicy: true });
  });
});

describe("company isolation (rls_user)", () => {
  test("company A sees only its own rows", async () => {
    const seen = await withCompany(db, ids.a, async (tx) => ({
      companies: (await tx.select({ id: companies.id }).from(companies)).map((r) => r.id),
      stores: (await tx.select({ id: stores.id }).from(stores)).map((r) => r.id),
      memberships: (await tx.select({ c: memberships.companyId }).from(memberships)).map((r) => r.c),
      invitations: (await tx.select({ c: invitations.companyId }).from(invitations)).map((r) => r.c),
      audit: (await tx.select({ c: auditLog.companyId }).from(auditLog)).map((r) => r.c),
      users: (await tx.select({ id: users.id }).from(users)).map((r) => r.id),
    }));
    expect(seen).toEqual({
      companies: [ids.a],
      stores: [ids.storeA],
      memberships: [ids.a],
      invitations: [ids.a],
      audit: [ids.a],
      users: [ids.userA],
    });
  });

  test("company B's record by id is not found from company A", async () => {
    const rows = await withCompany(db, ids.a, (tx) => tx.select().from(stores).where(eq(stores.id, ids.storeB)));
    expect(rows).toEqual([]);
  });

  test("company A cannot write a row for company B", async () => {
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.insert(stores).values({ companyId: ids.b, name: "Hack" })))).toMatch(/row-level security/);
  });

  test("company A cannot update company B's rows", async () => {
    const updated = await withCompany(db, ids.a, (tx) =>
      tx.update(stores).set({ name: "Hacked" }).where(eq(stores.id, ids.storeB)).returning(),
    );
    expect(updated).toEqual([]);
  });

  test("company A cannot move its own store to company B", async () => {
    expect(
      await pgError(withCompany(db, ids.a, (tx) => tx.update(stores).set({ companyId: ids.b }).where(eq(stores.id, ids.storeA)))),
    ).toMatch(/row-level security/);
  });

  test("a store cannot create companies or change its status", async () => {
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.insert(companies).values({ name: "New" })))).toMatch(/permission denied/);
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.update(companies).set({ status: "Active" })))).toMatch(/permission denied/);
  });

  test("company id does not carry over to the next transaction", async () => {
    await withCompany(db, ids.a, async () => {});
    const rows = await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE rls_user`);
      return tx.select({ id: stores.id }).from(stores);
    });
    expect(rows).toEqual([]);
  });

  test("rejects a company id that is not a uuid", async () => {
    await expect(withCompany(db, "' OR 1=1 --", async () => {})).rejects.toThrow(/uuid/);
  });

  test("no company set means no rows", async () => {
    const rows = await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE rls_user`);
      return tx.select({ id: stores.id }).from(stores);
    });
    expect(rows).toEqual([]);
  });

  test("sessions, password hashes and platform roles are not readable", async () => {
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.select({ r: users.platformRole }).from(users)))).toMatch(/permission denied/);
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.select().from(sessions)))).toMatch(/permission denied/);
    expect(await pgError(withCompany(db, ids.a, (tx) => tx.select({ h: users.passwordHash }).from(users)))).toMatch(/permission denied/);
  });

  test("a membership cannot point to another company's store", async () => {
    expect(
      await pgError(db.insert(memberships).values({ userId: ids.userA, companyId: ids.a, storeId: ids.storeB, role: "cashier" })),
    ).toMatch(/memberships_store_same_company_fk/);
  });
});

describe("audit_log", () => {
  test("is append-only, even for the owner", async () => {
    expect(await pgError(db.update(auditLog).set({ action: "changed" }))).toMatch(/append-only/);
    expect(await pgError(db.delete(auditLog))).toMatch(/append-only/);
    expect(await pgError(db.execute(sql`TRUNCATE audit_log`))).toMatch(/append-only/);
  });
});

describe("seed", () => {
  const env = {
    DATABASE_URL: testUrl,
    SEED_SUPERADMIN_NAME: "Super",
    SEED_SUPERADMIN_EMAIL: "super@example.com",
    SEED_SUPERADMIN_PASSWORD: "test-pass-1",
    SEED_OWNER_NAME: "Owner",
    SEED_OWNER_EMAIL: "owner@example.com",
    SEED_OWNER_PASSWORD: "test-pass-2",
  };

  test("refuses to run without passwords in env, or with the same email twice", () => {
    expect(() => readSeedEnv({ ...env, SEED_OWNER_PASSWORD: undefined })).toThrow(/SEED_OWNER_PASSWORD/);
    expect(() => readSeedEnv({ ...env, SEED_OWNER_EMAIL: "SUPER@example.com" })).toThrow(/must be different/);
  });

  test("creates super admin, Brand Hub, its store and owner; safe to re-run", async () => {
    await seed(readSeedEnv(env));
    await seed(readSeedEnv({ ...env, SEED_SUPERADMIN_PASSWORD: "changed-pass" })); // re-run never resets passwords
    const [company] = await db.select().from(companies).where(eq(companies.name, SEED_COMPANY));
    const [superAdmin] = await db.select().from(users).where(eq(users.email, "super@example.com"));
    const owned = await db.select().from(memberships).where(eq(memberships.companyId, company!.id));
    expect(superAdmin!.platformRole).toBe("super_admin");
    expect(await Bun.password.verify("test-pass-1", superAdmin!.passwordHash!)).toBe(true);
    expect(owned.map((m) => m.role)).toEqual(["owner"]);
    expect((await db.select().from(stores).where(eq(stores.companyId, company!.id))).length).toBe(1);
  });
});
