# Free stack (₹0 to start)

Everything below has a free plan with no credit card or a forever-free tier. Limits were checked on 27 Nov 2026; re-check before launch because free tiers change.

| Need | Service | Free limit (Nov 2026) | Notes |
| --- | --- | --- | --- |
| Database | **Neon** Postgres | 1 GB storage per project, 100 CU-hours/month, scale to zero after 5 min idle, no credit card | Enough for many small shops. Use one project for prod, branches for dev/preview. Don't use Render's free Postgres (it expires). |
| API hosting | **Render** free web service | 750 instance hours/month per workspace; sleeps after 15 min idle, ~1 min to wake | A shop hitting a sleeping API waits ~1 min. For the pilot: a free uptime pinger every 10 min keeps it awake (one service 24/7 ≈ 720 h, inside 750). Move to a $7 instance when the first company pays. |
| Web (Next.js) | **Vercel Hobby** for dev/pilot; **Cloudflare** (OpenNext) when we charge | Hobby is for non-commercial use | Free Brand Hub pilot on Hobby is fine; move before taking money. |
| Email (invites, reset, reminders) | **Resend** | 3,000 emails/month, max 100/day, 1 domain | Plenty for invites and reminders. Until we buy a domain, use Resend's test sender for dev only. |
| Files (photos, logos, bill PDFs) | **Cloudflare R2** | 10 GB storage, 1M writes, 10M reads per month, zero egress | Resize photos before upload (≤ 200 KB each). |
| Background jobs | **pg-boss** (queue inside Postgres) | Free, no extra service | Jobs stay in Postgres: no idle polling cost, nothing lost if Redis hits its limit. |
| Cache + rate limits | **Upstash Redis** | 256 MB data, 500K commands/month, no credit card | Login/OTP rate limits, cached dashboard numbers and permission lookups. Not for the job queue (queue workers poll constantly and would use up the free commands). |
| Errors | Sentry Developer plan | Free tier | One project for api + web. |
| Uptime + keep-awake ping | UptimeRobot / cron-job.org | Free | 5–10 min interval on `/health`. |
| CI | GitHub Actions | Free minutes for private repos | Lint, typecheck, tests on every PR. |
| Design | v0 free plan | Limited credits | Keep everything in one v0 chat. |
| Domain | Free subdomains (`*.onrender.com`, `*.vercel.app`) | — | A real `.in` domain is the first thing worth paying for (~₹500–900/year). |

## Rules this puts on the code
- No Redis, no paid queues: jobs go through pg-boss.
- No server disk writes: files go to R2 (Render's free disk is wiped on restart).
- API must start fast (cold starts): keep boot work small, run migrations in CI, not on boot.
- Keep DB small: images in R2, never in Postgres; paginate everything.

Sources: [Neon free plan](https://neon.com/faqs/free-plan-limits-and-quotas) · [Render free tier](https://render.com/docs/free) · [Resend limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits) · [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing)
