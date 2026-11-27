# Status

Update after every story. One row per area; story-level detail lives in `docs/stories/USER_STORIES.md`.

**Status values:** Not started · Design (v0) · Mock UI · Connected (real API) · Tested · Live

What production actually shows is decided by `packages/shared/src/release.ts` (see `docs/RELEASES.md`). Today every feature is `mock`/`planned`, so production shows nothing yet.

| Phase | Area | Stories | Status | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-11-27 | US-OPS-01: `develop` = staging, `main` = production; GitHub rulesets (PR + CI, no force push), CODEOWNERS (Kunal approves), CI `pr-source` check; AGENTS.md rules 3 + 11 updated | Kunal |
| 0 | Full design in v0 | US-DES-01 | Mock UI ✅ | Kunal | Merged into apps/web with real routes; 40 routes × 2 sizes pixel-identical to the v0 export |
| 1 | Repo, CI, database, auth | US-AUTH-01…03, US-RBAC-01, 03, US-HIS-01 | In progress | Kunal | Step 1 (database base) done: tables, RLS via `rls_user` + `withCompany()`, seed, isolation tests. Next: step 2 `@Can` guard |
| 2 | Admin: companies, plans, users, history, themes | US-CMP, US-SUB-01…04, US-USR, US-HIS, US-THM-01…02 | Not started | | |
| 3 | Store shell, settings, staff, subscription banners | US-STO, US-STF, US-SUB-05…06, US-THM-03…04, US-RBAC-02 | Not started | | |
| 4 | Inventory | US-INV-01…10, US-SUB-07 | Not started | | |
| 5 | Billing | US-BIL-01…08 | Not started | | |
| 6 | Sales, customers, revenue | US-SAL, US-CUS, US-REP | Not started | | |
| 7 | Admin analytics + launch Brand Hub | US-ANA | Not started | | |

## Log (newest first)

| Date | What changed | By |
| --- | --- | --- |
| 2026-11-27 | Phase 1 step 1 — database base: `packages/db` schema (users, companies, stores, memberships, invitations, sessions, audit_log), migrations `0000_init` + `0001_rls` (role `rls_user`, grants, RLS policies on `app.company_id`, append-only audit_log), `withCompany()`, `db:up/generate/migrate/seed` scripts, env-only seed (Super admin + Brand Hub + store + Owner), role keys (`owner`, `stock_staff`…) in shared, Postgres in CI, tests for fresh migrate + cross-company isolation | Kunal |
| 2026-11-27 | Release flags: `packages/shared/src/release.ts` (planned → mock → building → beta → live); production shows only live, staging beta + live, development everything with badges; CI check that every page is registered | Kunal |
| 2026-11-27 | Merged v0 design into monorepo: Bun + Turborepo, apps/web (real routes, one component per file, shared AppShell layout), packages/shared (roles, permissions, money), apps/api (/health), packages/db (config). Fixed v0 importing `cn` from an npm package instead of lib/utils. Removed dead POS/cart code from the shell. | Kunal |
| 2026-11-27 | Reviewed v0 project_6: most follow-up 1 fixes done; routing still fake → fixed in IDE merge; FOLLOWUP-2 written | Kunal |
| 2026-11-27 | Fresh start: plan, user stories, features, themes, free stack, v0 prompt | Kunal |

## Known gaps (mock UI)
- All data is mock (`apps/web/lib/mock`); nothing is saved.
- "Preview as" role lives in memory: a full page reload goes back to Super admin. Replaced by real login in Phase 1.
- POS shows "Press F4 to charge" but F4 isn't wired (the old handler belonged to removed dead code). Wire it in US-BIL-01.
- `@base-ui/react` and `shadcn` CLI package came with v0; check if both are needed when touching components/ui.
