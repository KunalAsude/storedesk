# v0 prompt — StoreDesk full frontend

## How to use (read first)
1. Open a **new v0 chat**. Attach two files: `apps/web/app/themes.css` and `design/theme-preview.png`.

> Status: done. This prompt plus FOLLOWUP-1 and FOLLOWUP-2 produced the design now in `apps/web` (merged 27 Nov 2026). Keep these files for future v0 work: start a new v0 chat from the current `apps/web` code, not from this prompt.
2. Paste everything inside the box below as the first message.
3. If v0 stops before finishing, reply: `continue from where you stopped, keep the same style`.
4. Refine in the **same chat** page by page (e.g. "companies table: make rows denser", "POS on mobile: bigger product cards"). Never start a second chat; the style drifts.
5. When happy: download the zip and follow `docs/HANDOFF.md` → "Merging the v0 design".

---

````text
Build the complete frontend for "StoreDesk", a multi-tenant SaaS for retail shops in India: inventory, billing (POS), sales history, customers and revenue. I attached themes.css (all colour tokens) and theme-preview.png (how the themes should look). Use them exactly.

## Product in one paragraph
One Next.js app, one login, two levels. ADMIN level is only for us, the software owners (platform admins): business analytics, all companies (our customers) with their plans and subscriptions, plans, users and email invitations, history (audit log), themes and platform settings. STORE level is for each company: the owner and staff see ONLY their own store — dashboard, inventory, billing, sales history, customers, reports, staff, store settings. A store user never sees the Admin section. A platform admin sees the Admin section and can also open any company's store in a read-only "support view".

## Tech (use exactly)
- Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui (new-york), lucide-react icons, recharts through shadcn charts, next-themes, sonner toasts, cmdk command menu, date-fns, @tanstack/react-table for data tables, react-hook-form + zod for forms.
- UI only, no backend. All data from typed mock files in /lib/mock/*.ts with realistic Indian data. Keep everything clickable with local state (dialogs open, forms validate, toggles switch, carts update).
- Folder layout: app/(auth)/..., app/(admin)/admin/..., app/(store)/store/..., app/(public)/b/[token]; components/ui (shadcn), components/layout (sidebar, navbar, page header, banners), components/admin/*, components/store/*, components/common/* (data-table, empty-state, todo-card, stat-card, receipt, theme-picker, status-badge, money).
- Types in /lib/types.ts. Money is integer paise in data (49900 = ₹499); format with a helper formatINR() → "₹1,02,500", "₹53.65" (Indian grouping, hide .00). Dates "26 Nov 2026, 4:12 pm" in Asia/Kolkata.
- A /lib/permissions.ts file with permission keys and a hook can('inventory.edit'); sidebar items and buttons check it.

## Look and feel
- Calm, warm, professional SaaS — the quality of Shopify Admin, Linear and Vercel dashboard, with the warm palettes from themes.css. NOT a generic template.
- Use ONLY the CSS variables from themes.css (shadcn names: background, card, primary, muted-foreground, border, sidebar, sidebar-primary, chart-1..5, success, warning, destructive …). No hex colours in components, no Tailwind colour classes like bg-blue-500, no gradients, no glassmorphism, no glow, no emoji, no illustrations of people.
- Themes: brown (default), sage, graphite, olive, maroon, terracotta. Applied with <html data-theme="…">; light/dark with next-themes class. The SIDEBAR uses the dark palette colour (var(--sidebar)) in light mode — this is the signature look.
- Fonts: "Instrument Sans" for UI (14px base), "Newsreader" (serif) for page titles and big KPI numbers, "JetBrains Mono" for SKUs, bill numbers, codes. Load with next/font/google.
- Radius 12px cards, 8px inputs/buttons, 1px borders (var(--border)), almost no shadows (only popovers/dialogs). Comfortable spacing on dashboards, compact rows (40px) in tables.
- Every list: search, filter chips, sortable columns, pagination, row action menu, empty state with one action, loading skeleton, error state with "Try again".
- Responsive: 390px phone, 768px tablet, 1280px+ laptop. On phones tables turn into stacked cards and dialogs into bottom sheets. Tap targets ≥ 44px.
- Accessible: labels on every input, visible focus ring (var(--ring)), role="switch" on toggles, contrast AA.

## App shell (every logged-in page)
- LEFT SIDEBAR: logo + "StoreDesk" (Newsreader) at top; grouped nav with small uppercase group labels; active item = var(--sidebar-accent) background + 3px left bar in var(--sidebar-primary); collapsible to a 64px icon rail with tooltips (remember state in localStorage); on mobile a slide-out sheet from a hamburger. Bottom of sidebar: plan badge for store users ("Pro · renews 12 Jan"), collapse button.
- TOP NAVBAR (56px, var(--background), bottom border): breadcrumb + page title on the left; global search button "Search… ⌘K" opening a command menu (pages, products, bills, companies); STORE SWITCHER dropdown (when a user has several stores; for admins it also lists all companies under "Open a store"); notifications bell with a dropdown (low stock, trial ending, invite accepted); THEME menu at the top right (Light / Dark / System + the allowed colour themes as swatch rows); PROFILE AVATAR menu at the far right (name, email, role badge, My profile, Change password, Log out).
- BANNERS under the navbar when needed: "Trial ends on 10 Dec — choose a plan", red "Payment overdue — 5 days left before read-only", grey "Read-only: subscription expired", amber "Support view — you are viewing Brand Hub as StoreDesk support".
- DEMO ROLE SWITCHER: in the profile menu add "Preview as: Super admin / Store owner / Cashier / Stock staff" so I can see the sidebar and buttons change per role (mock only).

Sidebar for a platform admin:
ADMIN — Analytics, Companies, Plans, Users & invites, History, Themes, Platform settings
STORE (shows when viewing a store) — same as below

Sidebar for a store user (items hidden when the role lacks permission):
OVERVIEW — Dashboard
SELL — Billing (POS), Sales history
INVENTORY — Products, Categories, Stock, Purchases, Adjustments, Suppliers
PEOPLE — Customers, Staff
INSIGHTS — Reports
SETTINGS — Store settings
COMING SOON — Offers, Online store, Enquiries, Expenses, Branches, Integrations (each opens a TODO page)

## Auth pages (no shell)
- /login: split layout — left: form (email or phone, password, "Remember me", Log in, "Forgot password?"); right: a calm panel in var(--sidebar) colour with the StoreDesk wordmark, one line "Billing and stock for your shop" and a cropped screenshot-style preview of the dashboard (built from real components, no stock photos).
- /forgot-password, /reset-password, /accept-invite (shows who invited you, company, role; set name + password).
- /403 (you don't have access), /404, a "Choose a store" screen for users in several stores.

## ADMIN pages
1. /admin/analytics — header with date range (30 days / 90 days / 12 months). KPI cards (Newsreader numbers): MRR, Active companies, New this month, Trials ending in 7 days, Churned this month, Bills processed today — each with delta and sparkline. Charts: MRR over 12 months (area), Companies by plan Free/Plus/Pro (donut), New vs churned per month (bars), Platform bills per day (bars). Tables: Expiring in next 14 days (company, plan, expires, owner, "Extend" action), Near plan limits (usage bars), Top companies by bills. A TODO card: "More analytics — revenue by city, feature usage, cohorts".
2. /admin/companies — page header with "Add company" primary button. Data table: Company (logo + name + city), Owner (name + email), Plan badge, Status badge (Trial / Active / Past due / Expired / Paused / Cancelled — each with its own token colour), Stores, Users, Expires on, Last active, Created; row menu (Open, Change plan, Extend, Pause, Resume, Cancel subscription). Filters: plan, status, expiring in 7/30 days, city. "Add company" = multi-step dialog: Company (name, business type, city, phone, GST yes/no) → Owner (name, email) → Plan (plan cards, trial days) → Review → "Create and send invite".
3. /admin/companies/[id] — header: logo, name, status + plan badges, "Expires 12 Jan 2027", owner, buttons Change plan / Extend / Pause / Stop subscription (danger, confirm dialog with reason). Tabs:
   - Overview: business info card, KPIs (bills 30d, sales 30d, products, users), usage vs limits (progress bars: stores, users, products, bills this month, storage).
   - Subscription: current plan card, price, cycle, start, renews/expires; timeline of events (trial started, upgraded, payment recorded, paused …); "Record payment" dialog (amount, mode UPI/bank/cash, reference, new expiry); Upgrade/Downgrade with a warning if usage exceeds the new plan.
   - Services: list of modules (Inventory, Billing, Sales, Returns, Customers, Reports, Profit, CSV import, Branches, Offers, Online store) with switches; "included in plan" vs "added manually" tags.
   - Stores: list of stores (branches) — TODO card for adding branches.
   - Users: members table (name, email/phone, role, last login, status), Invite user, Resend invite, Deactivate, Send password reset.
   - Appearance: which themes this company may use (6 theme cards with swatches + checkboxes) and its default theme; preview of the store sidebar in the chosen theme.
   - Activity: audit timeline for this company.
   - Notes: internal notes list with author and date, add note.
4. /admin/plans — plan cards (Free ₹0, Plus ₹299/mo, Pro ₹599/mo, mark as editable): monthly/yearly price, limits (stores, users, products, bills/month, storage), modules list; "New plan" and "Edit" in a side sheet; default plan toggle; archived plans section. TODO card: "Coupons and online payment (Razorpay)".
5. /admin/users — tabs "Platform team" and "All users". Invite by email dialog: email, type (Platform / Store), role (Super admin, Admin, Support / Owner, Manager, Cashier, Stock staff), company + store pickers for store roles, personal message. Invitations table: email, role, company, sent, expires, status (Pending / Accepted / Expired / Revoked), Resend, Revoke.
6. /admin/history — audit log timeline: time, actor (avatar + name + role), company, action ("changed plan Plus → Pro"), entity; expandable row with before/after JSON shown as a readable diff. Filters: company, person, action type, date range. TODO: export.
7. /admin/themes — the 6 themes as large preview cards (mini sidebar + card + button rendered with that theme), switch to enable/disable each for the platform, "Set as default", and a light/dark preview toggle.
8. /admin/settings — tabs: Company info (our name, address, GST for invoices), Email (sender name, reply-to), Subscriptions (default trial days, reminder days 7/3/1, grace days 7), Security (session length), and TODO cards for Announcements and Maintenance mode.

## STORE pages (example: Brand Hub Mens Wear, Kopargaon — men's clothing; owner bills on an Android phone, thermal printer 58 mm, not GST registered)
1. /store/dashboard — greeting "Good evening, Rahul" + date range (Today, 7 days, 30 days, custom). KPI cards: Sales, Bills, Avg bill, Items sold, Udhaar outstanding, Stock value (owner only). Charts: Sales by day stacked by Cash/UPI/Card; Sales by category. Lists: Top products (thumb, units, revenue), Low stock (with "Stock in"), Recent bills. Quick actions: New bill, Add product, Stock in, Add customer.
2. /store/billing — POS.
   Desktop: left 60% = search bar ("Search product or scan barcode", scan icon button), category chips, product grid cards (photo, name, price, stock left, greyed when out of stock). Clicking a product opens a popover: size chips, colour swatches, stock for the chosen combo, qty stepper, Add. "Quick item" button for items not in inventory (name, size, colour, qty, price).
   Right 40% = cart: customer picker (search by mobile, "Walk-in", add new inline), cart lines (name, size · colour, qty stepper, editable price, line discount, remove), Hold / Held bills (2), bill discount with %/₹ toggle, totals (Items, Discount, Round off, TOTAL in Newsreader large), big primary "Charge ₹1,019".
   Charge dialog: segmented Cash / UPI / Card / Udhaar / Split; cash received → change; UPI shows a QR panel with UPI ID and amount; split shows rows with live "₹200 left"; "Complete sale". Success view: receipt preview + Print (58 mm), Download PDF, WhatsApp, New bill.
   Phone: product list full screen + sticky bottom bar "3 items · ₹1,019 → Cart"; cart opens as a full-height sheet. Keyboard on desktop: F2 search, F4 charge, Esc close.
3. /store/sales — summary strip (sales, bills, by payment mode) + table: Bill no (mono), Date, Customer, Items, Payment, Total, Due, Status (Paid / Part paid / Udhaar / Cancelled), Staff. Filters: date range, payment mode, status, staff.
   /store/sales/[id] — left: receipt card; right: details (customer, payments, staff, notes) and actions: Print, PDF, WhatsApp, Return items, Cancel bill (reason dialog, owner only). Cancelled bills show a banner.
4. /store/inventory/products — table/grid toggle; columns: photo, name, category, variants, price, stock (pill: In stock / Low / Out), status (Active / Draft); filters: department, category, stock status; bulk actions; "Add product" and "Import CSV" buttons.
   /store/inventory/products/new and /[id]/edit — full-page form with sticky Save bar; cards: Photos (drag-drop up to 8, reorder, tag to colour), Details (name, brand, department, category, sub-category, description), Pricing (MRP, selling price, cost price with "Only owner" lock, live margin %), Variants (choose size set + colours → grid rows=colours, columns=sizes; each cell: stock, optional price; bulk-fill row/column; SKU preview in mono).
   /store/inventory/products/[id] — header (photo, name, price, stock total, Edit, Stock in, Adjust); tabs: Variants (stock matrix, red 0 / amber low / normal), History (movement ledger: date, type badge Sale / Purchase / Return / Adjust / Damage, qty +/−, reference link, by), Sales (small chart + recent bills).
5. /store/inventory/categories — three columns Departments → Categories → Sub-categories with add/rename/reorder/hide; tabs for Size sets (name + size chips) and Colours (name + swatch).
6. /store/inventory/stock — cards (total units, stock value at cost, at MRP, low stock, out of stock) + table per variant with filters.
7. /store/inventory/purchases — list + "New stock in" page (supplier, add products by search/scan, qty per size × colour, cost, total, save).
8. /store/inventory/adjustments — list + "New adjustment" dialog (variant, qty +/−, reason: Damaged / Lost / Count correction / Other, note).
9. /store/inventory/suppliers — table + detail drawer with purchases.
10. /store/customers and /[id] — table (name, mobile, visits, total spent, last visit, udhaar due pill); detail: profile, KPIs, bills, dues ledger, "Record payment", "Send WhatsApp reminder".
11. /store/staff — table (name, email/phone, role, discount limit, last active, status) + Invite dialog (role presets Owner / Manager / Cashier / Stock staff, discount limit %, permission checkboxes grouped by area).
12. /store/reports — cards grid (Sales summary, By payment mode, By staff, Best sellers, By category, By size, By colour, Dead stock 60/90 days, Profit — locked if plan lacks it) → each opens a page with date range, chart and table, Export CSV.
13. /store/settings — tabs: Store profile (name, logo upload, address, phone), Billing (bill title e.g. "Cash Memo", number prefix with live example "BH/26-27/0001", footer note, round-off, "You saved" line) with live receipt preview 58 mm / A5, Printing (paper 58/80 mm, test print), Payments (UPI ID + QR preview), Taxes (GST off/on, GSTIN), Appearance (theme cards limited to the themes the admin allowed + logo), Subscription (plan, expiry, usage bars, read-only, "Contact us to upgrade").
14. Coming soon pages — each uses a shared TodoCard: icon, title, two-line description of the idea, "Planned" badge.
15. Locked pages — when a module is not in the plan: lock icon in sidebar; page shows "Not in your plan" with plan names that include it.

## Shared pieces
- Receipt component with variants: screen, thermal58, thermal80, a5. Thermal = mono font, black on white, dashed rules, stacked lines fitting 48 mm / 72 mm.
- /b/[token] public bill page: no shell, store logo + name (Newsreader), receipt card, "Download PDF", "Message shop on WhatsApp", tiny "Powered by StoreDesk".
- StatusBadge (plan statuses, bill statuses, stock levels), StatCard (KPI + delta + sparkline), DataTable, EmptyState, TodoCard, ThemePicker, Money, PageHeader.

## Mock data
- Companies: Brand Hub Mens Wear (Kopargaon, Pro, Active, renews 12 Jan 2027), Shree Saree Centre (Shirdi, Trial ends 10 Dec 2026), Kids Corner (Kopargaon, Plus, Past due), Om Footwear (Rahata, Free, Expired), Patil Electronics (Sangamner, Plus, Paused). Owners with Indian names, emails, 10-digit mobiles.
- Brand Hub products: Premium Plain Shirt ₹499 (M–XXL; White, Black, Navy, Sky, Olive, Maroon, Beige), Button-Down Shirt ₹649, Formal Stretch Trousers ₹899 (waist 28–38), 2-in-1 Jacket ₹1,499, Puffer Half Jacket ₹1,199, Cap + Mask ₹75. Departments: Men's wear, Kids' wear.
- Bills BH/26-27/0001 … 0142 across November 2026; customers Rahul Patil, Sagar Shinde, Amit Kale + walk-ins; staff: Owner (Rahul), Cashier (Pooja, 10% discount limit), Stock staff (Ganesh).
- Platform team: Kunal (Super admin), Friend (Admin), Support (Support).
````
