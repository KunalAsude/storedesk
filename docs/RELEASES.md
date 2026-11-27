# Releases — only finished features reach production

Every page belongs to one feature in **`packages/shared/src/release.ts`**. A feature has a status, and the environment decides what is shown.

| Status | Meaning | development | staging | production |
| --- | --- | --- | --- | --- |
| `planned` | Idea only, TODO card | ✓ | — | — |
| `mock` | Designed, mock data, nothing saved | ✓ | — | — |
| `building` | Being connected to the API | ✓ | — | — |
| `beta` | Real API, tested, try it on staging | ✓ | ✓ | — |
| `live` | Finished and checked on staging | ✓ | ✓ | ✓ |

- **Environment:** `NEXT_PUBLIC_APP_STAGE` (web) and `APP_STAGE` (API, from Phase 1) = `development` | `staging` | `production`. Locally `bun run dev` = development. A build without the variable = production, so nothing unfinished leaks by accident.
- **Hidden means gone:** an unreleased page is removed from the sidebar and its URL shows "Page not found". In development the sidebar shows each page's status as a small badge.
- **Always allowed:** login, password reset, accept invite, choose store, and the public bill page.
- **Today:** every feature is `mock` or `planned`, so production shows an empty app until the first feature goes live. That's intended.

## Branches and environments
| Branch | Environment | Gets code from | Deploys to |
| --- | --- | --- | --- |
| `feat/US-…`, `fix/US-…` | development (your laptop) | branched from `develop` | — |
| `develop` | **staging** (`APP_STAGE=staging`) | feature PRs | staging web + API, Neon branch `staging` |
| `main` | **production** (`APP_STAGE=production`) | release PR from `develop`, or `hotfix/*` | production web + API, Neon `main` |

- **Release:** PR `develop` → `main`, title `release: <what>`. After a hotfix into `main`, merge `main` back into `develop`.
- **Protection (GitHub rulesets):** no direct pushes, no force push, no deleting `main`/`develop`; CI (`check`, `pr-source`) must pass for everyone. Kunal approves every PR (`.github/CODEOWNERS`); as admin he can merge his own PRs through a PR without a second reviewer.
- **Migrations** run on deploy, staging first. They must work with the code already running: add columns/tables first, remove them in a later release.

## Moving a feature forward (one at a time)
1. Pick the next feature in phase order (`docs/HANDOFF.md`).
2. Set it to `building` while the API is being connected.
3. When all its stories in `docs/stories/USER_STORIES.md` are Done (boxes ticked, tests pass) → `beta`. Deploy to staging and click through on phone + laptop.
4. When it works on staging with real data → `live` in a PR of its own. Title: `release: <feature> live`. The other dev approves.
5. Update `docs/STATUS.md`.

Going back is allowed: if something breaks in production, set it to `beta` and deploy — it disappears for shops while you fix it.

## Guard rails
- `bun run --cwd apps/web check:release` (runs in CI) fails if any page under `/admin` or `/store` isn't registered in `release.ts`.
- An unregistered `/admin` or `/store` path is hidden everywhere except development.
- API (Phase 1, US-REL-02): the same list guards the API — routes of an unreleased feature return 404 outside development.

## Later
Per-company switches (plan modules, Admin → Company → Services) sit on top: a feature must be released here **and** enabled for that company.
