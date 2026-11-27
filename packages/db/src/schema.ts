// Phase 1 tables. Every store table has company_id; RLS policies live in
// migrations/0001_rls.sql (drizzle-kit does not manage them).
import type { PlatformRoleKey, StoreRoleKey } from "@storedesk/shared";
import { sql } from "drizzle-orm";
import { boolean, check, foreignKey, index, jsonb, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Platform-wide: a user can belong to several companies, so no company_id here.
export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email"),
    phone: text("phone"),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    // null = store-only user
    platformRole: text("platform_role").$type<PlatformRoleKey>(),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(sql`lower(${t.email})`),
    uniqueIndex("users_phone_key").on(t.phone),
  ],
);

export const companies = pgTable("companies", {
  id: id(),
  name: text("name").notNull().unique(),
  status: text("status").notNull().default("Trial"),
  createdAt: createdAt(),
});

export const stores = pgTable(
  "stores",
  {
    id: id(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    address: text("address"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("stores_company_name_key").on(t.companyId, t.name),
    // lets other tables check that a store belongs to the same company
    unique("stores_company_id_id_key").on(t.companyId, t.id),
  ],
);

// A user's role in one store of one company.
export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    storeId: uuid("store_id").notNull(),
    role: text("role").notNull().$type<StoreRoleKey>(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("memberships_user_store_key").on(t.userId, t.storeId),
    index("memberships_company_idx").on(t.companyId),
    foreignKey({
      name: "memberships_store_same_company_fk",
      columns: [t.companyId, t.storeId],
      foreignColumns: [stores.companyId, stores.id],
    }),
  ],
);

// company_id null = invite to a platform role.
export const invitations = pgTable(
  "invitations",
  {
    id: id(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    companyId: uuid("company_id").references(() => companies.id),
    storeId: uuid("store_id"),
    role: text("role").notNull().$type<PlatformRoleKey | StoreRoleKey>(),
    invitedBy: uuid("invited_by").references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("invitations_company_idx").on(t.companyId),
    // a store invite must name its company (the FK below is skipped when company_id is null)
    check("invitations_store_needs_company", sql`${t.companyId} IS NOT NULL OR ${t.storeId} IS NULL`),
    foreignKey({
      name: "invitations_store_same_company_fk",
      columns: [t.companyId, t.storeId],
      foreignColumns: [stores.companyId, stores.id],
    }),
  ],
);

// Refresh tokens (hash only). Read by the auth module as owner, never by rls_user.
export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    refreshTokenHash: text("refresh_token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedBy: uuid("replaced_by"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

// Append-only. company_id null = platform event.
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    companyId: uuid("company_id").references(() => companies.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_log_company_created_idx").on(t.companyId, t.createdAt)],
);
