# v0 follow-up 1 — fixes after first review

Paste the box below into the **same v0 chat**. If it stops, reply `continue, same style`.

What was checked (27 Nov 2026): every route at 1440 px and 390 px, POS add-to-bill, theme menu, dark mode, code structure. The look is right; keep it. These are the gaps.

````text
Great start — keep the exact look, colours, fonts and layout. Now fix these, in this order.

1) CODE STRUCTURE (most important — we will merge this into a real repo)
- Remove the catch-all app/[...segments] router. Create a real route file for every page: app/(auth)/login/page.tsx, app/(admin)/admin/analytics/page.tsx, app/(admin)/admin/companies/page.tsx, app/(admin)/admin/companies/[id]/page.tsx, … and app/(store)/store/dashboard/page.tsx, app/(store)/store/billing/page.tsx, app/(store)/store/inventory/products/page.tsx, …/products/new/page.tsx, …/products/[id]/page.tsx, etc. for every route in the first prompt. Shared shell in app/(admin)/layout.tsx and app/(store)/layout.tsx.
- Split components/storedesk-app.tsx, storedesk-pages.tsx and storedesk-utility.tsx into one component per file: components/layout/*, components/admin/*, components/store/*, components/common/*. Normal formatting (Prettier, max ~100 chars per line), no very long one-line files.
- Use real shadcn/ui components: add select, dialog, sheet, dropdown-menu, tabs, table, badge, input, label, textarea, switch, checkbox, tooltip, popover, command, card, separator, avatar, progress, skeleton, toggle-group, scroll-area, chart. Replace all 8 native <select> elements with shadcn Select.
- Remove `ignoreBuildErrors` from next.config and fix every TypeScript error. Remove @vercel/analytics.

2) POS — variants are missing
- Clicking a product must open a popover (desktop) / bottom sheet (mobile) with size chips, colour swatches, stock left for the chosen size + colour (disable sold-out combos), qty stepper, and "Add". Right now it adds "Default variant" straight away.
- Cart lines show "L · Navy", qty stepper, editable price, line discount (% / ₹), remove.
- Finish the flow: Charge dialog (Cash with change, UPI QR, Card, Udhaar, Split with live "₹ left") → success view with receipt preview, Print 58 mm, PDF, WhatsApp, New bill. Quick item dialog (name, size, colour, qty, price).
- Hold bill / Held bills (2) must work with mock state.

3) ADD PRODUCT — real variant grid
- Size set and colours must be pickers, not text inputs: size set = select of saved sets (Shirts M–XXL, Waist 28–38, Kids 2–14Y) showing chips you can untick; colours = swatch chips + "Add colour".
- Then a GRID: rows = colours, columns = sizes; each cell = stock input; toggle "Different price per variant" adds a price input per cell; "Fill row" / "Fill column" helpers; SKU preview per cell in mono (BH-SH-NAVY-L).
- Add sub-category select. Photos: tiles with drag-to-reorder, "Cover" badge, tag a photo to a colour.

4) ANALYTICS fixes
- MRR chart y-axis shows 0–8 with no unit: show ₹ values (₹40k, ₹80k, ₹1.2L) and a tooltip with the exact amount.
- "Expiring in the next 14 days" lists Kids Corner with 22 Nov 2026 (already past) — past-due companies go in their own "Past due" table with a red badge; only future dates in "Expiring".
- Donut legends: value right next to its label, aligned in a tidy two-column list.

5) SHELL fixes
- Sidebar: nav list scrolls on its own (scroll-area) and the plan card + collapse button stay pinned at the bottom. Right now "Adjustments" is cut off behind the plan card on a 900 px tall screen.
- Store switcher in the navbar: on /admin pages show "Platform"; on /store pages show the store name (logo + "Brand Hub Mens Wear"); dropdown has "My stores" and, for admins, "Open a store" with a search list of all companies.
- Role preview in the profile menu (Super admin / Store owner / Cashier / Stock staff) must change the sidebar: store owner and staff never see the ADMIN group or the "Support view" banner; cashier sees only Dashboard, Billing, Sales history, Customers; stock staff sees Dashboard + Inventory. Pages a role can't open show the 403 page.

6) CONTRAST
- The light-blue primary is for filled buttons only. Text links ("All companies →", "Forgot password?", "Need help?") and small text on cream must use foreground colour with underline on hover, never primary-coloured text on a light background. Check every theme in light and dark for AA contrast.

7) MAKE EVERY TAB AND PAGE COMPLETE
- Store settings: Billing tab (bill title, prefix with live example BH/26-27/0001, footer, round-off, "You saved" line) with live receipt preview 58 mm / A5; Printing, Payments (UPI ID + QR preview), Taxes, Appearance (only the themes the admin allowed for this company + logo upload), Subscription (plan, expiry, usage bars).
- Company detail: every tab filled (Subscription timeline + Record payment dialog, Services switches, Stores, Users with invite, Appearance with allowed themes + default, Activity, Notes).
- Product detail page with Variants matrix, History ledger and Sales tabs; Sales bill detail with receipt + Cancel bill reason dialog; Customers detail with dues ledger.
- Phone (390 px): data tables become stacked cards; dialogs become bottom sheets.

8) NEW: CUSTOM THEMES (theme builder) on /admin/themes
- Keep the 6 preset theme cards. Add "Create theme": a side sheet with name + three colour pickers — Dark (sidebar), Page, Button — plus optional Button text colour.
- From those 3 colours, generate the full token set (card = slightly lighter page, borders, muted text, hover, chart colours, and a dark-mode version) with a function generateTheme({dark, page, button}) in lib/theme-builder.ts.
- Live preview while editing: mini app (sidebar, card, table row, primary button, badge, chart) in light AND dark side by side.
- Contrast check under the preview: button text on button, text on page, sidebar text on sidebar — show pass/fail (WCAG AA 4.5:1) and block saving when a check fails, with a "Fix automatically" button that nudges the colour until it passes.
- Saved custom themes appear as cards next to the presets with Edit, Duplicate, Delete and the same enable switch / "Set as default". Presets can be duplicated and edited as a custom copy.
- Apply themes at runtime by writing the generated CSS variables into a <style> tag for [data-theme="custom-<id>"], so new themes need no code change. Mock-save them in local state.
````
