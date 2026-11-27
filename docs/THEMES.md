# Themes

StoreDesk uses the six palettes from Kunal's portfolio. Tokens live in `apps/web/app/themes.css` (shadcn/ui variable names); swatches for docs and v0 are in `design/themes.json`, and `design/theme-preview.png` shows all six. Hex colours are allowed only in `themes.css`, `lib/theme-builder.ts` defaults and product colour swatches in mock data.

| Key | Name | Dark (sidebar) | Page | Button |
| --- | --- | --- | --- | --- |
| `brown` (default) | Brown and baby blue | `#3B2418` | `#F2E8DA` | `#8EC5FF` |
| `sage` | Sage and tomato | `#2F3A2B` | `#F7F5EF` | `#E8412C` |
| `graphite` | Graphite and yellow | `#2B2D31` | `#ECEDEF` | `#FFC93C` |
| `olive` | Olive and bone | `#3A3D22` | `#EEE7D7` | `#4F5330` |
| `maroon` | Maroon and blush | `#4A1622` | `#F6E6E3` | `#4A1622` |
| `terracotta` | Terracotta and clay | `#3A2117` | `#EFE4D6` | `#A8492B` |

Fonts (same as the portfolio): **Instrument Sans** for UI, **Newsreader** for big numbers and page titles, **JetBrains Mono** for SKUs, bill numbers and codes.

## How themes are applied

- `<html data-theme="<key>">` picks the palette; the `dark` class (next-themes) switches light/dark.
- Light: page = palette page colour, cards = lighter paper, **sidebar = the palette's dark colour**, buttons = palette button colour.
- Dark: background = the palette's dark colour, buttons use the palette's light accent so they stay readable.
- Status colours (success, warning, destructive) are fixed across themes.

## Who controls what (feature: Themes & appearance)

| Who | Can do | Where |
| --- | --- | --- |
| Super admin / Admin | Turn each theme on or off for the whole platform; set the platform default | Admin → Platform settings → Themes |
| Super admin / Admin | Choose which themes a company may use and its default theme | Admin → Companies → [company] → Appearance tab |
| Store owner | Pick one of the allowed themes for the store; upload logo | Store → Settings → Appearance |
| Any user | Light / dark / system on their own device | Top navbar → theme toggle |

Rules:
- A company with one allowed theme sees no theme picker, only light/dark.
- If an admin removes the theme a company is using, the company falls back to its default.
- Theme changes are written to the audit log.
- Custom themes (US-THM-05): super admin creates a theme from 3 colours (dark, page, button) in Admin → Themes → Create theme. The full token set is generated, checked for contrast, saved in the database and applied at runtime, so new themes need no code change.
- TODO (later): let Pro companies make their own brand theme with the same builder.
