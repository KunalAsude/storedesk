// Test helper: a brand-new migrated database on local/CI Postgres, dropped afterwards.
import postgres from "postgres";
import { runMigrations } from "./migrate";

const ADMIN_URL = process.env.TEST_DATABASE_URL ?? "postgres://storedesk:storedesk@localhost:5432/storedesk";

export async function createTestDatabase(): Promise<{ url: string; drop: () => Promise<void> }> {
  const admin = postgres(ADMIN_URL, { max: 1, onnotice: () => {} });
  try {
    await admin`select 1`;
  } catch {
    await admin.end();
    throw new Error("Postgres not reachable at TEST_DATABASE_URL / localhost:5432. Run: bun run db:up");
  }
  const name = `storedesk_test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  await admin.unsafe(`CREATE DATABASE ${name}`);
  const u = new URL(ADMIN_URL);
  u.pathname = `/${name}`;
  const url = u.toString();
  await runMigrations(url);
  return {
    url,
    drop: async () => {
      await admin.unsafe(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await admin.end();
    },
  };
}
