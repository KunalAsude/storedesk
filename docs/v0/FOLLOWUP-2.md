# v0 follow-up 2 — visual fixes only

Checked on 27 Nov 2026 (project_6). Fixed since follow-up 1: shadcn components, type checking on, ₹ chart axis, Past due table, POS size/colour picker, theme builder with contrast check, settings billing tab with live receipt, mobile cards, store switcher name.

Code structure is NOT fixed (pages return null; one big component still draws every page by reading the URL). **Don't spend more v0 credits on that** — the IDE merge step does it (see `docs/HANDOFF.md`, Step 2). Ask v0 only for the visual fixes below, in the same chat.

````text
Thanks, this is much better. Visual fixes only now — don't change the routing or file structure.

1) Add product → Variants card is broken:
- "Different price per variant" shows a big unstyled white box: use the shadcn Switch with a label, aligned right in the card header.
- Colours show as raw text "White|Black|Navy…": render them as swatch chips (dot + name) that can be removed with an x, plus an "Add colour" combobox.
- The size × colour grid overflows the card (only M and L are visible). Make the grid scroll horizontally inside the card with a sticky first column (colour names). Cells: compact 64px number inputs, SKU in small mono text under the input. Put "Fill row" at the end of each row and "Fill column" in the header, as small ghost buttons.
- Photos card: unstyled icons and "CoverFront view" text. Use square tiles (thumbnail placeholder, "Cover" badge on the first, colour tag select under each, remove button on hover) in a 3-column grid with an "Add photo" tile.

2) Companies on phone (390px): card labels are wrong ("Date · Rahul Patil", "Customer · Pro", bare numbers "1" and "4"). Each card should read: name + city, owner name + email, plan badge + status badge, "Stores 1 · Users 4", "Expires 12 Jan 2027", "Last active today". Check every other table's phone cards for the same label mix-up.

3) Sidebar on a 1440×900 screen: "Adjustments" is half hidden behind the Pro plan card. The nav list must scroll inside its own area; plan card and collapse button pinned at the bottom with a top border.

4) Donut legends (Companies by plan, Sales by category): the value sits far from its label. Use a two-column legend where each item is "● Free  10" with the value right after the label.

5) Store settings → Billing:
- "Bill number prefix" should hold only the prefix (BH). Financial year and number are added automatically; keep the "Next bill: BH/26-27/0143" hint under it.
- The round-off checkbox is oversized; use the shadcn Switch.
- "You saved ₹0 on this bill" shows even with no discount; show it in the receipt preview only when the saving is above zero, and turn it into a setting "Show 'You saved' line on bills".

6) Theme builder previews are cramped (labels wrap: "Dashboar d", "Premium Plain Shirt In stock"). Make the sheet wider (640px) and the two previews stack vertically at full width.

7) Add a favicon (simple "S" mark in the primary colour) — there's a 404 for it.
````
