import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export const MIGRATIONS_DIR = new URL("../migrations", import.meta.url).pathname;

/** Applies all pending migrations as the login (owner) user in `url`. */
export async function runMigrations(url: string) {
  // prepare: false so it also works through Neon's pooled (PgBouncer) connection string.
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_DIR });
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (see packages/db/.env.example)");
    process.exit(1);
  }
  await runMigrations(url);
  console.log("Migrations applied");
}
