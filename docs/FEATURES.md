# Features

Each feature is a module with a key. Plans switch modules on or off per company; the admin can also turn a module on for one company by hand (Company → Services). Stories are in `docs/stories/USER_STORIES.md`.

## Platform (admin) features

| Key | Feature | Stories | Phase | Who uses it |
| --- | --- | --- | --- | --- |
| `admin.analytics` | Business analytics | US-ANA-01…04 | 7 | Super admin, Admin |
| `admin.companies` | Companies list, add, detail, pause/resume, notes | US-CMP-01…07 | 2 | Admin, Support (view) |
| `admin.plans` | Plans and subscriptions | US-SUB-01…08 | 2–3 | Super admin, Admin |
| `admin.users` | Users and invitations | US-USR-01…03, US-AUTH-04 | 2 | Admin |
| `admin.history` | Audit history | US-HIS-01…02 | 1–2 | All platform roles |
| `admin.themes` | Themes on/off, per-company themes | US-THM-01…02 | 2 | Super admin, Admin |
| `admin.settings` | Platform settings | — | 2 | Super admin |

## Store modules (switched by plan)

| Key | Module | Free | Plus | Pro | Stories | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| `inventory` | Products, categories, sizes, colours, stock, purchases, adjustments, suppliers | ✓ | ✓ | ✓ | US-INV-01…10 | 4 |
| `billing` | POS, discounts, payments, print, PDF, WhatsApp | ✓ | ✓ | ✓ | US-BIL-01…08 | 5 |
| `sales` | Sales history, cancel, reprint | ✓ | ✓ | ✓ | US-SAL-01…03 | 6 |
| `returns` | Returns and exchanges | — | ✓ | ✓ | US-SAL-04 | 6 |
| `customers` | Customers, udhaar, reminders | — | ✓ | ✓ | US-CUS-01…03 | 6 |
| `reports` | Dashboard + revenue + product reports | Basic | ✓ | ✓ | US-REP-01…03 | 6 |
| `profit` | Profit reports | — | — | ✓ | US-REP-04 | 6 |
| `csv_import` | Bulk product import | — | ✓ | ✓ | US-INV-10 | 4 |
| `branches` | More than one store | — | — | ✓ | US-TODO-05 | later |
| `offers` | Offers engine | — | — | ✓ | US-TODO-01 | later |
| `online_store` | Online store + enquiries | — | — | ✓ | US-TODO-02, 03 | later |
| `themes.custom` | Custom brand colour | — | — | ✓ | US-THM (later) | later |

Plan prices and limits are decided in Admin → Plans (open question in the plan doc).

## Always on (every company)
Auth, staff and roles, store settings, appearance (themes allowed by admin), light/dark, subscription view, audit logging.
