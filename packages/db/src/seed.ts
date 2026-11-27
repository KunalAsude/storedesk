// Starter data: Super admin (Kunal), Brand Hub Mens Wear with one store and its Owner.
// Emails and passwords come only from env. Safe to run more than once: existing users,
// company, store and membership are left as they are (passwords are never reset).
import { and, eq, sql } from "drizzle-orm";
import { companies, createDb, memberships, stores, users } from "./index";

const REQUIRED = [
  "DATABASE_URL",
  "SEED_SUPERADMIN_NAME",
  "SEED_SUPERADMIN_EMAIL",
  "SEED_SUPERADMIN_PASSWORD",
  "SEED_OWNER_NAME",
  "SEED_OWNER_EMAIL",
  "SEED_OWNER_PASSWORD",
] as const;

type SeedEnv = Record<(typeof REQUIRED)[number], string>;

export function readSeedEnv(env: Record<string, string | undefined> = process.env): SeedEnv {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`Missing env for seed: ${missing.join(", ")} (see packages/db/.env.example)`);
  for (const k of ["SEED_SUPERADMIN_PASSWORD", "SEED_OWNER_PASSWORD"] as const) {
    if (env[k]!.length < 8) throw new Error(`${k} must be at least 8 characters`);
  }
  if (env.SEED_SUPERADMIN_EMAIL!.toLowerCase() === env.SEED_OWNER_EMAIL!.toLowerCase()) {
    throw new Error("SEED_SUPERADMIN_EMAIL and SEED_OWNER_EMAIL must be different");
  }
  return Object.fromEntries(REQUIRED.map((k) => [k, env[k]!])) as SeedEnv;
}

export const SEED_COMPANY = "Brand Hub Mens Wear";
export const SEED_STORE = "Brand Hub Mens Wear, Kopargaon";

export async function seed(env: SeedEnv) {
  const { db, client } = createDb(env.DATABASE_URL);
  try {
    await db.transaction(async (tx) => {
      const ensureUser = async (name: string, email: string, password: string, platformRole: "super_admin" | null) => {
        const [found] = await tx
          .select({ id: users.id })
          .from(users)
          .where(sql`lower(${users.email}) = ${email.toLowerCase()}`);
        if (found) return found.id;
        const passwordHash = await Bun.password.hash(password, { algorithm: "argon2id" });
        const [row] = await tx
          .insert(users)
          .values({ name, email: email.toLowerCase(), passwordHash, platformRole })
          .returning({ id: users.id });
        return row!.id;
      };

      await ensureUser(env.SEED_SUPERADMIN_NAME, env.SEED_SUPERADMIN_EMAIL, env.SEED_SUPERADMIN_PASSWORD, "super_admin");
      const ownerId = await ensureUser(env.SEED_OWNER_NAME, env.SEED_OWNER_EMAIL, env.SEED_OWNER_PASSWORD, null);

      const [company] = await tx
        .insert(companies)
        .values({ name: SEED_COMPANY, status: "Active" })
        .onConflictDoUpdate({ target: companies.name, set: { name: SEED_COMPANY } })
        .returning({ id: companies.id });

      const [store] = await tx
        .insert(stores)
        .values({ companyId: company!.id, name: SEED_STORE, address: "Kopargaon, Maharashtra" })
        .onConflictDoUpdate({ target: [stores.companyId, stores.name], set: { name: SEED_STORE } })
        .returning({ id: stores.id });

      const existing = await tx
        .select({ id: memberships.id })
        .from(memberships)
        .where(and(eq(memberships.userId, ownerId), eq(memberships.storeId, store!.id)));
      if (!existing.length) {
        await tx.insert(memberships).values({ userId: ownerId, companyId: company!.id, storeId: store!.id, role: "owner" });
      }
    });
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  try {
    await seed(readSeedEnv());
    console.log(`Seeded Super admin, ${SEED_COMPANY}, its store and Owner`);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
