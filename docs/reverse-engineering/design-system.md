# Design System & Token Specifications

**Target:** InstantDM (`app.instantdm.com`)
**Design Foundation:** Ant Design v5 Token Engine + Tailored Slate & Indigo Design System
**Verified Source:** Extracted from target `theme.js`, `tokens.css`, and live DOM computed styles.

---

## 1. Color Palette & Tokens

### 1.1. Brand & Semantic Colors

| Token Name | Hex Code | HSL / RGB | Usage Context |
|---|---|---|---|
| `colorPrimary` | `#6366f1` | `rgb(99, 102, 241)` / `hsl(239, 84%, 67%)` | Primary CTA buttons, active tab indicators, links, active node borders |
| `colorPrimaryHover` | `#4f46e5` | `rgb(79, 70, 229)` / `hsl(243, 75%, 59%)` | Button hover, focused menu item text |
| `colorPrimaryBg` | `#eef2ff` | `rgb(238, 242, 255)` / `hsl(226, 100%, 97%)` | Selected navigation backgrounds, active pill tints |
| `colorSuccess` | `#10b981` | `rgb(16, 185, 129)` / `hsl(160, 84%, 39%)` | Automated status badge, published indicator, security shield |
| `colorWarning` | `#f59e0b` | `rgb(245, 158, 11)` / `hsl(38, 92%, 50%)` | Trial expiration warnings, rate limit alerts |
| `colorError` | `#ef4444` | `rgb(239, 68, 68)` / `hsl(0, 84%, 60%)` | Disconnected account, failed webhook, delete node |
| `colorInstagram` | `#e1306c` | `rgb(225, 48, 108)` / `hsl(340, 75%, 54%)` | "Continue With Instagram" OAuth button, IG brand accents |
| `colorFacebook` | `#1877f2` | `rgb(24, 119, 242)` / `hsl(214, 89%, 52%)` | Facebook connection badges, Messenger accents |

### 1.2. Neutral & Surface Scale (Tailwind Slate Compatible)

| Token Name | Hex Code | Usage Context |
|---|---|---|
| `colorBgLayout` | `#f8fafc` | Global canvas and application page background (Slate 50) |
| `colorBgContainer` | `#ffffff` | Card surfaces, modal containers, node bodies, header |
| `colorTextBase` | `#1e293b` | Main headings, primary labels, card titles (Slate 800) |
| `colorTextSecondary` | `#475569` | Table headers, secondary descriptions, helper notes (Slate 600) |
| `colorTextMuted` | `#94a3b8` | Subtitles, disabled text, placeholder text (Slate 400) |
| `colorBorder` | `#e2e8f0` | Card borders, table dividers, input borders (Slate 200) |
| `colorBorderSecondary`| `#eef1f6` | Sider boundaries, subtle horizontal rules |

---

## 2. Typography

- **Primary Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Weights:**
  - Regular: `400` (body copy, table cells, descriptions)
  - Medium: `500` (buttons, tabs, form labels, node titles)
  - Semibold: `600` (card headers, section titles, table headers)
  - Bold: `700` (hero headlines, main page titles)

### Type Scale

| Style / Level | Font Size | Line Height | Letter Spacing | Target Usage |
|---|---|---|---|---|
| Display / Hero | `36px` | `44px` | `-0.02em` | Auth landing hero headline |
| H1 Page Title | `24px` | `32px` | `-0.01em` | `My Automations`, `Insights`, `Contacts` |
| H2 Section Title| `18px` | `24px` | `0` | Card headers, drawer titles |
| H3 Node Title | `15px` | `20px` | `0` | Canvas node headers (`Trigger`, `Send Message`) |
| Body Regular | `14px` | `20px` | `0` | Default UI text, input values, table data |
| Small / Caption | `12px` | `16px` | `0` | Status badges, timestamps, helper descriptions |
| Micro / Tag | `11px` | `14px` | `+0.01em` | Video duration pills, count chips |

---

## 3. Spacing, Radii & Shadows

### 3.1. Corner Radii (`borderRadius`)
- `borderRadiusSM` = `6px`: Small badges (`⚡ Automated`, duration tags)
- `borderRadius` = `8px`: Standard buttons, inputs, menu items, table rows
- `borderRadiusLG` = `12px`: Cards, Modals, Canvas Node boxes
- `borderRadiusXL` = `16px`: Large auth cards, phone simulator outer frame
- `borderRadiusPill` = `9999px`: Floating docks, filter pills, action chips

### 3.2. Spacing Scale (8pt Grid)
- `2xs` = `2px`
- `xs` = `4px`
- `sm` = `8px`
- `md` = `12px`
- `lg` = `16px`
- `xl` = `24px`
- `2xl` = `32px`
- `3xl` = `48px`

### 3.3. Elevation & Shadows
- **Card Shadow (Soft):** `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);`
- **Floating Dock / Popover Shadow:** `box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);`
- **Active Node Highlight Shadow:** `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);`
- **Button Shadow:** Stock AntD buttons deliberately set `primaryShadow: 'none'` for a flat, modern aesthetic.

---

## 4. Motion & Animation Tokens

1. **Accessibility (`prefers-reduced-motion`):**
   - The app actively monitors `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - When reduce motion is enabled, `motion: false` is supplied to Ant Design's theme seed to prevent zoom scale misalignment in flyout popovers.
2. **Interactive Transitions:**
   - Standard Hover: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);`
   - Drawer Slide: `transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);`
   - Phone Simulator Comment Animation: Staggered entry (delay `1.2s` for comment, `2.0s` for auto-reply).
