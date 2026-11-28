# StoreDesk

Multi-tenant inventory + billing SaaS for retail shops. One app, two levels: **Admin** for us (analytics, companies, plans, users, history, themes) and **Store** for each company (inventory, billing, sales, customers, reports, staff, settings).

**Status:** design done and merged (mock data). Next: Phase 1 — database, auth, RBAC. See [docs/STATUS.md](docs/STATUS.md).

## Run
Needs [Bun](https://bun.sh) 1.3+.
```bash
bun install
bun run dev:web     # http://localhost:3000
bun run dev:api     # http://localhost:4000/health
bun run typecheck
bun run test
```
In the app, use the profile menu → **Preview as** to see the sidebar for Super admin, Owner, Cashier and Stock staff.

## Start here
1. [AGENTS.md](AGENTS.md) — rules for every developer and AI tool
2. [docs/HANDOFF.md](docs/HANDOFF.md) — code map, what's next, Claude Code kickoff prompt
3. [docs/stories/USER_STORIES.md](docs/stories/USER_STORIES.md) — every story with acceptance criteria
4. [docs/FEATURES.md](docs/FEATURES.md) — modules and which plan has them
5. [docs/THEMES.md](docs/THEMES.md) — the 6 colour themes and the theme builder
6. [docs/FREE_STACK.md](docs/FREE_STACK.md) — free services and their limits
7. [docs/RELEASES.md](docs/RELEASES.md) — release flags: only finished features reach production
8. [docs/v0/](docs/v0) — the prompts that produced the design (history; reuse for future v0 work)

Living plan (Claude Docs): https://claude.ai/artifact/B2ENkZWZ4V4ij9HFWQCSL2

## Repo layout
```
apps/web        Next.js app (design from v0): admin + store + auth + public bill page
apps/api        NestJS API on Bun (/health only for now)
packages/shared roles, permission keys + grants, money helpers (used by web and API)
packages/db     Drizzle config; schema grows story by story
design/         themes.json, theme-preview.png (for docs and v0)
docs/           plan, stories, features, status, handoff, v0 prompts
```
