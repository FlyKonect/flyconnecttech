# 03 · Design system

The website, the client portal and the team panel share this system. The values come from the design files.

## Brand
- **Logo:** `design/assets/northstack-mark.svg` (gold bar plus two navy bars) next to the word "Northstack" in Inter Tight 700, 20–21px, letter-spacing -0.02em. On navy backgrounds use `northstack-mark-on-navy.svg` (the navy bars become white).
- **Hero art:** `design/assets/route-map.svg`, a world map with flight routes, laid over navy heroes at about 22% opacity.

## Colours

| Token | Value | Use |
|---|---|---|
| `navy` | `#021A54` | Primary text, headings, primary buttons, team sidebar |
| `navy-700` | `#0C3584` | Gradient start, text on light navy tints |
| `navy-900` | `#01123D` | Footer, gradient end |
| `gold` | `#D3AF34` | Main CTA on navy (navy text on gold), badges, focus ring |
| `gold-text` | `#846E21` | Gold text on white: links and eyebrows (passes AA, also on the light tints). The design files use `#887122`, which falls just short of AA on the light blue and gold tints, so it was darkened slightly. |
| `gold-on-navy` | `#E9D27A` | Links on navy panels |
| `ink-2` | `#23324F` | Strong body text |
| `body` | `#3E4C66` | Body text |
| `muted` | `#5A6882` | Secondary text, labels |
| `on-navy` | `#C5D0EA` | Body text on navy |
| `on-navy-muted` | `#9FB0D6` | Secondary text on navy |
| `nav-label` | `#8D9DC0` | Section labels in the team sidebar |
| `line` | `#E1E8F2` | Card borders |
| `line-2` | `#E8EDF4` | Dividers, section lines |
| `line-3` | `#EEF2F7` | Row dividers |
| `input` | `#CBD5E4` | Input borders |
| `soft` | `#F6F9FF` | Soft section background on the website |
| `chip` | `#F1F5FA` | Tab track background |
| `portal-bg` | `#F6F8FC` | Client portal page background |
| `team-bg` | `#F4F6FA` | Team panel page background |
| `tint` | `#EEF2FA` | Selected and active backgrounds (customer sidebar item, avatars) |
| `unread` | `#FBF7EA` | Unread notification rows |

**Gradients**
- Hero: `radial-gradient(90% 120% at 88% 0%, #0C3584 0%, #021A54 52%, #01123D 100%)`.
- Dashboard welcome cards: `radial-gradient(90% 140% at 88% 0%, #0C3584 0%, #021A54 55%, #01123D 100%)`.
- CTA band: `radial-gradient(90% 120% at 0% 100%, #0C3584 0%, #021A54 55%)`.

**Semantic colours**
- Success button: `#16A34A`, white text. Used for Submit request, Mark as resolved, Confirm it's fixed, Mark as won, Mark as completed.
- Danger: text `#B91C1C`, border `#FECACA`, filled button `#B91C1C`.
- Waiting / warning banner: background `#FFF7ED`, border `#FED7AA`, text `#9A3412`.
- Internal notes (amber, a deliberate exception):
  - Note background `#FFFBEB`, border `#FDE68A`, label `#92400E`, text `#451A03`.
  - Composer in note mode: `2px dashed #F59E0B`, background `#FFFBEB`.
  - Note tab and save button: `#F59E0B` background, `#451A03` text.
- Banners:
  - Info: `#EEF2FA` / `#DCE3EE` / `#021A54`.
  - OK: `#ECFDF5` / `#BBF7D0` / `#166534`.
  - Muted: `#F1F5F9` / `#E2E8F0` / `#475569`.

### Pills (background / text, fully rounded, 12px, 700)

| Group | Value | Colours |
|---|---|---|
| Request status | Submitted | `#EEF2F7` / `#3E4C66` |
| | Under Review | `#FEF3C7` / `#92400E` |
| | In Progress | `#E3E9F5` / `#0C3584` |
| | Waiting for Customer | `#FFEDD5` / `#C2410C` |
| | Resolved | `#DCFCE7` / `#15803D` |
| | Closed | `#E5E7EB` / `#374151` |
| Priority | Low | `#F1F5F9` / `#475569` |
| | Medium | `#E0F2FE` / `#0369A1` |
| | High | `#FFEDD5` / `#C2410C` |
| | Urgent | `#FEE2E2` / `#B91C1C` |
| Role | Super admin | `#021A54` / `#FFFFFF` |
| | Admin | `#E3E9F5` / `#0C3584` |
| | Manager | `#EDE9FE` / `#6D28D9` |
| | Developer | `#DCFCE7` / `#15803D` |
| Account | Invited | `#FEF3C7` / `#92400E` |
| | Active | `#DCFCE7` / `#15803D` |
| Project | Planning | `#F1F5F9` / `#475569` |
| | In design | `#EDE9FE` / `#6D28D9` |
| | In development | `#E3E9F5` / `#0C3584` |
| | Live | `#DCFCE7` / `#15803D` |
| Leads | New | `#EEF2FA` / `#0C3584` |
| | Scheduled | `#EDE9FE` / `#6D28D9` |
| | Completed | `#ECFDF5` / `#047857` |
| | Cancelled | `#F1F5F9` / `#475569` |
| | Reviewing | `#FEF3C7` / `#92400E` |
| | Estimate sent | `#E0F2FE` / `#0369A1` |
| | Won | `#DCFCE7` / `#15803D` |
| | Lost | `#FEE2E2` / `#B91C1C` |
| | Replied | `#E0F2FE` / `#0369A1` |
| SLA | At risk | `#FEE2E2` / `#B91C1C` |
| | Paused | `#F1F5F9` / `#475569` |
| | On track / Met | `#ECFDF5` / `#047857` |

## Typography
- **Inter** 400, 500, 600 and 700 for body and UI. **Inter Tight** 600 and 700 for headings, big numbers and the logo. Load both with `next/font/google`.
- **Website:**
  - h1: `clamp(38px, 4.8vw, 62px)`, line-height 1.04, -0.035em.
  - h2: `clamp(32px, 4vw, 48px)`, 1.08, -0.03em.
  - h3: 22px, -0.02em.
  - Lead: 18px, line-height 1.6, `#3E4C66`.
  - Eyebrow: 14px, 600, `gold-text`.
- **Portal and team panel:**
  - Page titles in the header: 18px, 700.
  - Welcome h1: `clamp(24px, 2.8vw, 36px)` Inter Tight.
  - Card titles: 17px, 700.
  - KPI numbers: 28–34px Inter Tight.
  - Table text: 14px.
  - Labels: 13px, 700.
  - Small text: 12–13px.

## Shape, spacing and depth
- **Radius:**
  - 10px: buttons, inputs, selects, tabs and chips.
  - 14–16px: inner tiles.
  - 18px: website cards.
  - 20–22px: portal cards.
  - 24px: hero panels.
  - 26px: dialogs.
  - Fully rounded: pills and avatars.
- **Website layout:**
  - Content max-width 1240px. Side padding `clamp(20px, 4vw, 40px)`. Section padding `clamp(64px, 8vw, 112px)` vertically.
  - Header height 76px, with a gold top bar above it.
- **Portal layout:**
  - Sidebar 270px. Header 72px, sticky and semi-transparent.
  - Main padding `clamp(16px, 3vw, 32px)`. Gap between cards 20px.
- **Shadows:**
  - Card hover: `0 22px 44px -26px rgba(2,26,84,0.38)`.
  - Floating panels: `0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)`.
  - Dialogs: `0 40px 80px -30px rgba(0,0,0,0.5)`.
- **Focus:** `outline: 3px solid rgba(211,175,52,0.6); outline-offset: 2px` on every interactive element.
- **Breakpoints:**
  - Website: below 1180px the menu collapses to a menu button; below 860px the phone layout shows the CTA row under the header.
  - Portal and team panel: below 900px the sidebar becomes a slide-in menu and tables become cards.

## Buttons
| Variant | Style |
|---|---|
| Gold | `#D3AF34` background, navy text. The main CTA on navy and the website's main CTA (Book a demo) |
| Navy | `#021A54` background, white text. Primary on white |
| Outline | White background, `1px #CBD5E4` border, navy text |
| Ghost on navy | `rgba(255,255,255,0.06)` background, `1px rgba(255,255,255,0.32)` border, white text |
| Success | `#16A34A`, white text |
| Danger outline | White background, `1px #FECACA` border, `#B91C1C` text. Filled danger `#B91C1C` |
| Text link | `gold-text`, 600, with an arrow → |

Sizes:
- Website buttons are 52px high, 0 24px padding, 16px, 600.
- Portal buttons are 44–48px high, 0 18–22px padding, 14–15px, 700.

## Components (shadcn/ui based)
- **Basics:** Button (variants above), Input, Select, Textarea and Checkbox with labels and inline errors (`#B91C1C`, 12–14px), Pill/Badge, Card, Tabs (pill tabs with counts), Chips (priority, status), Dialog, Toast (navy, fully rounded, bottom centre), Banner, Avatar (initials).
- **Shared layout:** KPI tile, data table with mobile cards, stepper (New request), radio cards (roles, lost reasons), sidebar nav item with count or badge, notification row (dot colour by kind, unread background).
- **Conversation:**
  - Customer bubble: navy, right-aligned, corner radius 18/18/4/18.
  - Team bubble: `#F6F8FC` with border, left-aligned, with avatar.
  - System line: small centred pill.
  - Internal note: amber.
  - Composer with a two-mode tab (Reply / Internal note) or (Email / Internal note).
- **Website:** top bar, header with dropdown, mobile menu, hero, section head (eyebrow, h2, lead), feature and link cards, CTA card, steps, FAQ accordion, CTA band, footer, the demo dialog (3 steps), the quote and message forms.

## Notification dot colours (by kind)
| Kind | Colour |
|---|---|
| reply, new | navy `#021A54` |
| info, high | `#EA580C` |
| status, invite | `#7C3AED` |
| ok | `#16A34A` |
| closed | `#64748B` |
| urgent | `#DC2626` |
| review | `#CA8A04` |
| lead (website) | gold `#D3AF34` |

## Tailwind / shadcn theme starter (adjust as needed)
```css
:root {
  --background: #ffffff;  --foreground: #021a54;
  --primary: #021a54;     --primary-foreground: #ffffff;
  --accent: #d3af34;      --accent-foreground: #021a54;
  --muted: #f1f5fa;       --muted-foreground: #5a6882;
  --border: #e1e8f2;      --input: #cbd5e4;  --ring: rgba(211,175,52,0.6);
  --destructive: #b91c1c; --radius: 10px;
  --portal-bg: #f6f8fc;   --team-bg: #f4f6fa; --gold-text: #846E21;
}
```
Dark mode is not part of the design. Don't add it unless the client asks.
