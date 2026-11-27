import { defineConfig } from "drizzle-kit";

// Neon (free) connection string in DATABASE_URL. See docs/FREE_STACK.md.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
