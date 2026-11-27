import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";
export { schema };

export function createDb(url: string) {
  const client = postgres(url, { max: 10, prepare: false });
  return { db: drizzle(client, { schema }), client };
}

export type Db = ReturnType<typeof createDb>["db"];
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Database role that RLS applies to (created in migrations/0001_rls.sql). */
export const RLS_ROLE = "rls_user";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Runs fn in a transaction as rls_user with app.company_id set, so Postgres
 * RLS only lets it see and write that company's rows. Use for every store query.
 */
export function withCompany<T>(db: Db, companyId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (!UUID.test(companyId)) return Promise.reject(new Error("withCompany: companyId must be a uuid"));
  return db.transaction(async (tx) => {
    await tx.execute(sql.raw(`SET LOCAL ROLE ${RLS_ROLE}`));
    await tx.execute(sql`SELECT set_config('app.company_id', ${companyId}, true)`);
    return fn(tx);
  });
}
