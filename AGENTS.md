# AGENTS.md — rules for every developer and every AI tool

Read in this order before touching code: `docs/HANDOFF.md` → `docs/STATUS.md` → `docs/stories/USER_STORIES.md` → `docs/FEATURES.md` → `docs/THEMES.md` → `docs/RELEASES.md` → `docs/FREE_STACK.md`.

## Product
StoreDesk: multi-tenant SaaS for retail shops. One app, two levels: **Admin** (platform owners: analytics, companies, plans, users, history, themes) and **Store** (each company sees only its own store: inventory, billing, sales, customers, reports, staff, settings). First customer: Brand Hub Mens Wear, Kopargaon.

## Stack (free tier only — see docs/FREE_STACK.md)
Bun workspaces + Turborepo · Next.js (design from v0, shadcn/ui) · NestJS API · PostgreSQL on Neon · Drizzle · pg-boss for jobs (no Redis) · Cloudflare R2 for files · Resend for email.

## Hard rules
1. **Bun only** (`bun install`, `bun run`, `bun test`). No npm/yarn/pnpm lockfiles.
2. **Free services only.** Adding any paid service or library needs Kunal's OK first.
3. **Work by story.** Every change belongs to a story ID from `docs/stories/USER_STORIES.md`. Branch `feat/US-XXX-00-short-name` from `develop`. Tick the story's boxes and update `docs/STATUS.md` when done.
4. **RBAC everywhere.** Every API route has `@Can('<permission key>')`; every menu item and button checks `can()`. Keys live only in `packages/shared/src/permissions.ts`.
5. **Tenant isolation.** Every store query runs through the company-scoped DB helper (sets `app.company_id`, Postgres RLS on). Every new store table gets `company_id`, an RLS policy and a cross-company test.
6. **Money is integer paise.** Never floats. Server recalculates every total.
7. **Bills and stock movements are never edited or deleted.** Cancel with a reason; correct stock with an adjustment.
8. **Design comes from v0.** Keep v0's components and layout. Change look in the v0 chat first, then copy over. Only colours from `apps/web/app/themes.css` (no hex anywhere else, no Tailwind colour classes like `bg-blue-500`, no gradients).
9. **Audit** every important write (see US-HIS-01 list).
10. **Tests:** every API route has tests incl. permission refused + other-company refused. `bun run test` and `bun run typecheck` pass before a PR.
11. **Git:** `develop` = staging, `main` = production (see `docs/RELEASES.md`). Feature PRs go into `develop`; only `develop` (release PR) or `hotfix/*` may go into `main`. Kunal approves every PR (CODEOWNERS); CI must pass. Migrations must be backward-compatible (add first, remove in a later release). **AI tools only stage changes (`git add`); never commit or push.** No AI attribution in commits, PRs or code.
12. Pages not designed yet show the shared TodoCard. Don't invent features that are not in a story.
13. **Release flags** (`docs/RELEASES.md`): every `/admin` or `/store` page is registered in `packages/shared/src/release.ts`. Production shows only `live` features. Move a feature to `beta`/`live` only when all its stories are Done; going `live` is its own PR.
