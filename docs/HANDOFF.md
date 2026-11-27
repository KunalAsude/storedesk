# HANDOFF — start here

## Where we are (27 Nov 2026)
- **Phase 0 (design) is done.** The full v0 design is merged into `apps/web` with real routes: one page file per URL, one component per file, a shared layout for admin + store. It still runs on **mock data** (`apps/web/lib/mock`).
- Monorepo is set up with Bun workspaces + Turborepo. `apps/api` (NestJS) only has `/health`. `packages/db` has the Phase 1 tables, RLS (`rls_user` + `withCompany()`) and seed — local Postgres: `bun run db:up && bun run db:migrate && bun run db:seed` (needs `packages/db/.env`, see `.env.example`).
- **Next: Phase 1 — foundation** (database, auth, RBAC, audit). See the kickoff prompt below.

Docs: plan (README link) · stories `docs/stories/USER_STORIES.md` · modules `docs/FEATURES.md` · progress `docs/STATUS.md` · colours `docs/THEMES.md` · free services `docs/FREE_STACK.md` · v0 prompt history `docs/v0/`.

## Git flow
`feat/US-XXX-…` from `develop` → PR into `develop` (= staging) → release PR `develop` → `main` (= production). Kunal approves; CI must pass. Details: `docs/RELEASES.md`.

## Run it
```bash
bun install
bun run dev:web     # http://localhost:3000 → redirects to /store/dashboard
bun run dev:api     # http://localhost:4000/health
bun run typecheck   # all packages
bun run test        # shared + api tests
```
The web app uses `next/font/google`, so the first `dev`/`build` needs internet to download the fonts.

## Code map (apps/web)
| Where | What |
| --- | --- |
| `app/(app)/layout.tsx` | Wraps every admin and store page in `AppShell` (sidebar, navbar, banners, shared dialog) |
| `app/(app)/admin/**/page.tsx` | Admin routes; each renders one component from `components/admin` |
| `app/(app)/store/**/page.tsx` | Store routes; each renders one component from `components/store` |
| `app/(auth)/*`, `app/(public)/b/[token]` | Login, forgot/reset password, accept invite, choose store, 403/404; customer bill page — no shell |
| `components/layout/app-shell.tsx` | Sidebar nav (filtered by role), store switcher, theme menu, profile menu with **Preview as** role switcher, permission gate |
| `components/layout/shell-context.tsx` | `useShell()` gives pages `route`, `setDialog`, `role`, `filter`, `title`, `fmt` |
| `components/admin/*` | Analytics, companies, company detail, plans, users, history, themes (theme builder), platform settings |
| `components/store/*` | Dashboard, POS, sales, products, product editor/detail, inventory pages, customers, reports, staff, store settings |
| `components/common/*` | StatCard, StatusBadge, TodoCard, TodoPage, SimpleTable, AccessDeniedPage |
| `components/ui/*` | shadcn/ui primitives |
| `app/themes.css` | The 6 themes × light/dark (only place for theme hex colours) |
| `lib/mock/data.ts` | All mock data — replace page by page with API calls |
| `lib/permissions.ts` | `useCan()` hook; keys and role grants come from `@storedesk/shared` |
| `lib/theme-builder.ts` | Generates a full theme from 3 colours + contrast checks |
| `lib/release.ts` | Reads `NEXT_PUBLIC_APP_STAGE`; the shell hides pages that aren't released (see docs/RELEASES.md) |

`packages/shared` holds roles, permission keys + default grants, `formatINR`/`toPaise`, and **release flags** (`release.ts`: which features each environment shows). Use it from both web and API.

## Kickoff prompt for Claude Code (paste at the start of every session)
```
Read AGENTS.md, docs/HANDOFF.md, docs/STATUS.md, docs/stories/USER_STORIES.md and docs/FEATURES.md.
Tell me in 5 lines what is done and the next "Not started" stories in phase order.
For the story I pick:
1. Explain the design (tables, endpoints, permission keys, UI pages touched) and compare options where there is a real choice. Wait for "go".
2. Build it: backend first, then connect the existing page (swap mock data for the API, keep the design exactly).
3. Tests: include "permission refused" and "other company refused". Run `bun run typecheck` and `bun run test`.
4. Tick the story's boxes, update docs/STATUS.md. If all stories of a feature are Done, propose moving it to "beta" in packages/shared/src/release.ts (never straight to "live"). Run `bun run --cwd apps/web check:release`. Stage changed files with git add. Never commit or push. No AI attribution.
```

## Phase 1 — what to build first (in this order)
1. **US-RBAC-01** Permission keys: already in `packages/shared/src/permissions.ts`; add the API `@Can()` guard that reads them.
2. **Database:** Neon project + `packages/db/src/schema.ts` with `users`, `companies`, `stores`, `memberships` (user + company + store + role), `platform_roles`, `invitations`, `sessions`, `audit_log`; RLS on `company_id`; migrations via drizzle-kit.
3. **US-AUTH-01…03** Login (email/phone + password), logout, forgot password (Resend free tier), JWT access + rotating refresh token.
4. **US-RBAC-03** Company isolation: company-scoped DB helper that sets `app.company_id`; cross-company tests.
5. **US-HIS-01** Audit log writer service.
6. **US-REL-02** API release guard: `@Feature('store.billing')` on controllers; 404 when the feature isn't released for `APP_STAGE`.
7. Web: replace the mock "Preview as" with the real logged-in user (keep the preview switcher only in development).

Done when: a super admin logs in and lands on Admin → Analytics; a store user is refused on every `/admin` API and page; tests prove company A can't read company B.

## Phase order
| Phase | Stories | Done when |
| --- | --- | --- |
| 0 Design ✅ | US-DES-01 | Every page works with mock data in apps/web |
| 1 Foundation | US-AUTH-01…03, US-RBAC-01, US-RBAC-03, US-HIS-01 | See above |
| 2 Admin | US-CMP-01…05, US-SUB-01…04, US-USR-01…03, US-HIS-01 page, US-THM-01…02, US-THM-05, US-AUTH-04 | We create Brand Hub, the owner accepts the invite and sees only his store |
| 3 Store shell | US-STO-01…03, US-STF-01…02, US-SUB-05…06, US-THM-03…04, US-RBAC-02, US-AUTH-05, US-CMP-06 | A cashier sees fewer items than the owner and the API refuses the rest |
| 4 Inventory | US-INV-01…10, US-SUB-07 | Brand Hub's real products are entered with stock from a phone |
| 5 Billing | US-BIL-01…08 | 20 parallel bills get unique numbers; a real bill prints on Brand Hub's printer |
| 6 Sales, customers, revenue | US-SAL, US-CUS, US-REP | Dashboard totals match the bills exactly |
| 7 Analytics + launch | US-ANA-01…03 | Brand Hub bills for a week without us fixing data |

## Who does what
| Person | Area |
| --- | --- |
| Kunal | Backend, database, RBAC, Brand Hub contact, reviews frontend PRs |
| Friend | Connecting pages to the API, frontend tests, design tweaks (v0 or by hand), reviews backend PRs |
| Claude Code | One story at a time under AGENTS.md |
