-- Row Level Security. Hand-written; drizzle-kit does not manage this file.
-- Owner (login user in DATABASE_URL) creates tables and is NOT filtered.
-- rls_user is what withCompany() switches to: every store query is filtered by app.company_id.
-- New store table? Add GRANTs + ENABLE RLS + policy in its own custom migration (db.test.ts checks it).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rls_user') THEN
    CREATE ROLE rls_user NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
  -- the owner may SET ROLE rls_user but does not inherit its rights (needed on Neon, harmless for superusers)
  EXECUTE format('GRANT rls_user TO %I WITH INHERIT FALSE, SET TRUE', current_user);
END
$$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO rls_user;
--> statement-breakpoint

-- Current company for this transaction; null (= no rows) when not set.
CREATE FUNCTION app_company_id() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('app.company_id', true), '')::uuid $$;
--> statement-breakpoint

-- What rls_user may do. Not granted: sessions (auth module only), users.password_hash and
-- users.platform_role, UPDATE/DELETE on audit_log, companies.status and INSERT/DELETE on
-- companies (platform admin only).
GRANT SELECT, UPDATE (name) ON companies TO rls_user;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON stores TO rls_user;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON memberships TO rls_user;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON invitations TO rls_user;
--> statement-breakpoint
GRANT SELECT, INSERT ON audit_log TO rls_user;
--> statement-breakpoint
GRANT SELECT (id, email, phone, name, is_active, last_login_at, created_at) ON users TO rls_user;
--> statement-breakpoint

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY company_isolation ON companies TO rls_user
  USING (id = app_company_id()) WITH CHECK (id = app_company_id());
--> statement-breakpoint
CREATE POLICY company_isolation ON stores TO rls_user
  USING (company_id = app_company_id()) WITH CHECK (company_id = app_company_id());
--> statement-breakpoint
CREATE POLICY company_isolation ON memberships TO rls_user
  USING (company_id = app_company_id()) WITH CHECK (company_id = app_company_id());
--> statement-breakpoint
CREATE POLICY company_isolation ON invitations TO rls_user
  USING (company_id = app_company_id()) WITH CHECK (company_id = app_company_id());
--> statement-breakpoint
CREATE POLICY company_isolation ON audit_log TO rls_user
  USING (company_id = app_company_id()) WITH CHECK (company_id = app_company_id());
--> statement-breakpoint
-- A store sees only users who are members of it (memberships is itself filtered).
CREATE POLICY company_members ON users TO rls_user
  USING (EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = users.id));
--> statement-breakpoint
-- sessions: RLS on with no policy for rls_user = no rows.

-- audit_log is append-only for everyone, owner included (no UPDATE, DELETE or TRUNCATE).
CREATE FUNCTION audit_log_append_only() RETURNS trigger
  LANGUAGE plpgsql
  AS $$ BEGIN RAISE EXCEPTION 'audit_log is append-only'; END $$;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update_delete
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_append_only();
--> statement-breakpoint
CREATE TRIGGER audit_log_no_truncate
  BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_append_only();
