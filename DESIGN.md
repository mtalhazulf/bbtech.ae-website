# DESIGN.md: BB Tech design system

The single source of design truth for the bbtech.ae rebuild. It covers brand, tokens, type, layout,
components, motion, imagery, and voice. Agents: read this before any UI change. If this file and
the code disagree, this file wins; fix the code, or propose an edit here.

**How we got these values:**
- Brand colors are sampled from the BB Tech logo (`public/images/logos/logo.webp`) and checked
  against the live site's theme variables (`/wp-content/uploads/the7-css/css-vars.css`).
- Structure, spacing, and components come from the Bexon template this repo is built on.
- Contrast ratios below are computed with the WCAG 2.x formula.

**Decisions locked with the owner:**
- Palette is logo-derived (not The7's violet gradient, not the homepage's inline orange/blue).
- Typeface stays Mona Sans.
- Code stays in JS.

---

## 1. Brand essence

| | |
|---|---|
| Name in UI | **BB Tech**. Legal line: *Binary Bridge Technology Services* |
| Tagline | **We Make IT Happen** (the "IT" pun is intentional; keep it capitalised) |
| Mark | "B²": a blue gradient **B** with an orange circle holding a white **2** (binary → bridge) |
| Personality | Dependable, practical, senior-engineer calm. A UAE IT partner, not a startup. |
| Feel | Clean light pages, confident deep-navy anchors, one warm orange spark per view |

Design test: *would a facilities manager in Al Ain trust this company with their ERP?*
Prefer clarity over flourish.

---

## 2. Logo and brand assets

| Asset | Path | Status |
|---|---|---|
| Logo mark (icon only, 152×224) | `public/images/logos/logo.webp` | ✅ BB Tech |
| Light-header logo | `public/images/logos/logo-2.webp` | ⚠️ identical file to `logo.webp`; no white variant yet |
| `logo-icon.webp`, `logo-large.webp` | `public/images/logos/` | ⚠️ also identical copies |
| Favicon | `src/app/favicon.ico` (64×64, BB Tech blues) | ✅ in use |
| Template favicon | `public/images/fav.png` (teal cube) | ✅ deleted (content import, no remaining references) |
| Wordmark / horizontal lockup | `public/images/bbtech/shared/logo-png.webp` | ✅ harvested from the live site's own header logo (`wp-content/uploads/2020/08/logo-png.png`); not yet wired into `Logo.js` in place of the icon-only mark — ask the client if this raster lockup should be vectorized/redrawn instead of used as-is |
| OG image | `public/images/bbtech/shared/branding.webp` | ✅ harvested from the live site's Yoast `og:image` (`wp-content/uploads/2020/08/branding.png`, 1200×750); used as every real page's `metadata.openGraph.images` fallback. Not the navy "We Make IT Happen" design described below — that's still open if a rebrand is wanted |
| ISO certification badges | `public/images/bbtech/shared/{45001,27001,14001,9001}.webp` | ✅ harvested; only display once the client confirms the certifications are current (see `content-import/needs-client-input.md`) |

Rules:
- Render with `Logo.js` at **52px height**, width auto. Never stretch, recolor, rotate, add effects,
  or place the mark on busy imagery.
- Clear space: at least the diameter of the orange circle on every side.
- On dark surfaces the full-color mark works as is (the gradient and orange both clear 3:1 against
  navy). A white variant is optional.

---

## 3. Color

### 3.1 Brand palette

| Role | Hex | Source | Use |
|---|---|---|---|
| **Primary** | `#3057A8` | Logo lower blue; also the live `--the7-accent-color` and favicon | Buttons, links, active states, highlights on **light** surfaces |
| Primary hover | `#264787` | Derived (primary, darker) | Hover/pressed for primary fills |
| **Sky** | `#08A5E9` | Logo upper blue (gradient start) | Gradients, decorative shapes, highlights on **dark** surfaces |
| Brand mid-blue | `#1D7BC6` | Logo gradient midpoint | Second gradient stop only |
| **Accent (orange)** | `#F48916` | Logo "2" circle | One spark per view: badges, secondary CTA fills, key numbers on dark |
| Accent hover | `#F59732` | Derived (accent, lighter) | Hover for accent fills (keeps navy text ≥ 7:1) |
| **Navy (dark)** | `#0B1832` | Derived from primary hue 220° | Headings, dark sections, footer |

**Gradients**
- `--tj-gradient-brand: linear-gradient(135deg, #08A5E9 0%, #3057A8 100%)`: follows the logo's
  direction. **Decorative only**, since white text fails on the sky end (2.77:1).
- `--tj-gradient-brand-ui: linear-gradient(135deg, #1D7BC6 0%, #3057A8 100%)`: allowed behind
  **large/bold white text only** (≥ 24px, or ≥ 18.66px bold). The weakest point is 4.47:1.

### 3.2 Token map (template teal → BB Tech)

Keep the SCSS map keys in `src/app/assets/sass/utilities/_colors.scss` and change only the values,
so the existing 1,000+ `var(--tj-color-*)` references re-theme automatically. CSS variables are
generated as `--tj-color-{group}-{shade}`.

| Token (CSS var) | Template | **BB Tech** | Refs | Role |
|---|---|---|---|---|
| `--tj-color-theme-primary` | `#1e8a8a` | **`#3057A8`** | 219 | Brand primary |
| `--tj-color-heading-primary` | `#0c1e21` | **`#0B1832`** | 55 | Headings |
| `--tj-color-theme-dark` | `#0c1e21` | **`#0B1832`** | 95 | Dark surfaces, dark buttons |
| `--tj-color-theme-dark-2` | `#18292c` | **`#182744`** | 8 | Raised dark surface |
| `--tj-color-theme-dark-3` | `#364e52` | **`#35435F`** | 4 | |
| `--tj-color-theme-dark-4` | `#67787a` | **`#5C687F`** | 2 | |
| `--tj-color-theme-dark-5` | `#676e7a` | `#676E7A` (keep) | 1 | |
| `--tj-color-theme-bg` | `#d8e5e5` | **`#D9E0ED`** | 32 | Tinted section background |
| `--tj-color-theme-bg-2` | `#cee0e0` | **`#CBD4E7`** | 4 | |
| `--tj-color-theme-bg-3` | `#202e30` | **`#1E293E`** | 2 | Dark tinted background |
| `--tj-color-text-body` | `#364e52` | **`#35435F`** | 29 | Body text |
| `--tj-color-text-body-2` | `#a9b8b8` | **`#A9B3C6`** | 59 | Body text on dark |
| `--tj-color-text-body-3` | `#67787a` | **`#5C687F`** | 19 | Muted text (passes AA on grey-1) |
| `--tj-color-text-body-4` | `#18292c` | **`#182744`** | 3 | |
| `--tj-color-text-body-5` | `#ffffffcc` | keep | | White 80% on dark |
| `--tj-color-grey-1` | `#ecf0f0` | **`#EEF1F6`** | 26 | Page background (`body`) |
| `--tj-color-grey-2` | `#a9b8b8` | **`#A9B3C6`** | 6 | |
| `--tj-color-grey-3` | `#ffffff1a` | keep | 18 | |
| `--tj-color-border-1` | `#c9d1d1` | **`#CAD0DD`** | 60 | Borders on light |
| `--tj-color-border-2` | `#313d3d` | **`#2F3A50`** | 30 | Borders on dark |
| `--tj-color-border-3/4` | white 15%/20% | keep | | |
| `--tj-color-border-5` | `#1e8a8a26` | **`#3057A826`** | 2 | Primary 15% |
| `--tj-color-red-1`, `common-*` | | keep | | |

**New tokens to add** (same map, new keys):

```scss
theme: (
	/* existing keys with new values… */
	primary-hover: #264787,
	sky: #08A5E9,
	mid: #1D7BC6,
	accent: #F48916,
	accent-hover: #F59732,
),
```

Also add `--tj-gradient-brand` and `--tj-gradient-brand-ui` to `:root` in `_root.scss`.

**Fix undefined variables.** These are referenced but never generated:
- `common-black-2` in `_mega-menu.scss:296` and `_careers.scss:336,346`
- `common-black-3` in `_careers.scss:61,77`
- `--tj-color-body-text` in `_careers.scss:256`

Point them at `heading-primary`, `text-body`, and `text-body` respectively.

### 3.3 Contrast rules (WCAG AA: 4.5:1 normal text, 3:1 large text and UI)

| Foreground on background | Ratio | Verdict |
|---|---|---|
| White on primary `#3057A8` | 6.88 | ✅ Primary buttons |
| Primary on white / on grey-1 | 6.88 / 6.07 | ✅ Links and highlights on light |
| Primary on theme-bg / bg-2 | 5.18 / 4.62 | ✅ |
| Navy on white / theme-bg | 17.63 / 13.30 | ✅ |
| Body `#35435F` on grey-1 | 8.75 | ✅ |
| Muted `#5C687F` on grey-1 / white | 4.96 / 5.61 | ✅ |
| White on navy | 17.63 | ✅ |
| Body-2 `#A9B3C6` on navy / dark-2 | 8.36 / 7.04 | ✅ |
| Sky on navy / dark-2 | 6.36 / 5.36 | ✅ Highlights on dark |
| Orange on navy | 7.08 | ✅ Key numbers and icons on dark |
| Navy on orange / on accent-hover | 7.08 / 7.86 | ✅ Accent buttons use **navy text** |
| White on primary-hover | 9.00 | ✅ |
| **White on orange** | **2.49** | ❌ never |
| **White on sky** | **2.77** | ❌ never (decorative sky only) |
| **Orange on white / grey-1** | **2.49 / 2.20** | ❌ no orange text or thin orange icons on light |
| **Primary on navy** | **2.56** | ❌ see the dark-surface rule |

**Dark-surface rule (important).** The template colors highlighted words, icons, links, and hover
states with `--tj-color-theme-primary` everywhere. On dark surfaces (`theme-dark`, `dark-2`,
`bg-3`, footer) that becomes illegible in BB Tech blue. On those surfaces, use `theme-sky` (or
`accent` for a single emphasis) instead. Audit these first, since they're live pages with dark
backgrounds and primary text:

| File | Why it's a priority |
|---|---|
| `components/_footer.scss` | 3 dark backgrounds, 18 primary-text rules |
| `layout/_services.scss` | 7 dark backgrounds, 10 primary-text rules |
| `layout/_h10-process.scss` | Dark background, home page |
| `layout/_h10-testimonial.scss` | Dark background, home page |
| `layout/_h5-services.scss` | Mixed dark and primary text |
| `layout/_page-header.scss` | Mixed dark and primary text |

### 3.4 Literals to replace

No hex or rgba literals outside `_colors.scss`. The remaining template literals are:

| Literal | Replace with | Files |
|---|---|---|
| `rgba(30, 138, 138, α)` (teal) | `tj-rgba(theme, primary, α)` | `_mega-menu`, `_services`, `_animate`, `_h5-about`, `_h5-working-process`, `_h7-hero`, `_h8-hero` |
| `rgba(12, 30, 33, α)` and `#0c1e21` | `tj-rgba(theme, dark, α)` / `var(--tj-color-theme-dark)` | `_footer`, `_search`, `_slider`, `_client`, `_h4/_h5/_h7/_h8/_h9-hero`, `_h9-about`, `_h6-testimonial` |
| Neon `#00ffc2`, `#20e7b7` | Primary / sky | `_preloader.scss` |
| Range-slider palette | Tokens | `_rangeSlider.scss` (38 literals) |

Add this helper to `utilities/_mixins.scss`. It compiles to static rgba, so there are no
browser-support concerns:

```scss
@use "sass:map";
@use "colors" as *;
@function tj-rgba($group, $shade, $alpha) {
	@return rgba(map.get(map.get($colors, $group), $shade), $alpha);
}
```

### 3.5 Usage ratios per view

Roughly **60% light neutrals** (grey-1/white), **25% navy** (text, one or two dark bands),
**12% primary/sky** (actions, highlights, gradients), and **≤ 3% orange**. If orange appears in
more than one or two places on screen, remove it from the less important one.

---

## 4. Typography

- **Family:** Mona Sans (Google, variable), loaded once in `src/app/layout.js` via `next/font`
  and exposed as `--tj-ff-body` and `--tj-ff-heading`. Both use Mona Sans today. Keep the two
  variables so the families can diverge later.
- Load only the weights actually used. `layout.js` currently requests 200–900 plus italics for
  **two identical instances**. Trim to 400/500/600/700 in one instance (a perf win, no visual change).
- Headings: weight **500** (`--tj-fw-medium`), letter-spacing **−0.03em**, color `heading-primary`.
- Body: 16px / 1.5, `text-body`.

| Token | Desktop | ≤1399 | ≤1199 | ≤991 | ≤767 | ≤575 | Line height |
|---|---|---|---|---|---|---|---|
| h1 `--tj-fs-h1` | 74 | 60 | 50 | 45 | 45 | 45 | 1.108 |
| h2 `--tj-fs-h2` | 48 | – | 40 | 40 | 36 | 30 | 1.125 |
| h3 `--tj-fs-h3` | 32 | – | – | 28 | 25 | 25 | 1.25 |
| h4 `--tj-fs-h4` | 24 | – | – | 22 | 20 | 20 | 1.333 |
| h5 `--tj-fs-h5` | 20 | | | | | | 1.4 |
| h6 `--tj-fs-h6` | 18 | | | | | | 1.444 |
| body / p | 16 | | | | | | 1.5 |

- **Eyebrow** (`.sec-heading .sub-title`): 14px, bold, uppercase, 1.4px tracking, dashed
  `border-1` pill with 4px radius, plus an icon in primary. Keep it to 1–3 words (e.g. "OUR SERVICES").
- **Title highlight:** one key phrase per heading, wrapped in `<span>` and colored primary on light
  or sky on dark. Never highlight more than about 4 words.
- Headline copy is sentence case, except the tagline and product names.

---

## 5. Layout and spacing

- **Grid:** Bootstrap 5.3 (`container`, `row`, `col-*`). Don't add another grid system.
- **Breakpoints** (`utilities/_breakpoints.scss`): `$xxxxl` ≥1765, `$xxxl` 1601–1764,
  `$xxl` 1400–1600, `$xl` 1200–1399, `$lg` 992–1199, `$md` 768–991, `$sm` 576–767,
  `$xs` ≤575, `$xxs` ≤390. Use them as `@media #{$md, $sm} { … }`.
- **Section rhythm:**
  - `.section-gap`: 120px top and bottom, 100px at `lg`, 70px at `md` and below. This is the default between sections.
  - `.section-gap-2`: 100 / 80 / 60px, for tighter sub-sections.
  - `.section-gap-x`: 15px side inset (12px on mobile), used for the "floating card" section look.
- Alternate light (grey-1 or white) with at most **one or two navy bands per page**, and always
  end on the navy footer.
- Minimum tap target is 44×44px. Keep a 16px gutter at mobile width with no horizontal scroll.

---

## 6. Shape, depth, borders

- **Radius scale:**
  - 12px: cards and panels (the template default, 85 uses)
  - 8–10px: inner elements, inputs, images in cards
  - 4px: eyebrow pill
  - 50px: buttons and chips (pill)
  - 50%: avatars and icon circles
- This deliberately replaces the old site's square 1px corners. The modern softness is part of the refresh.
- **Shadows:** keep them minimal. The template relies on borders and background contrast, not
  elevation. When needed, use `0 0 15px 0 rgba(navy, .1)` via `tj-rgba`.
- **Borders:** 1px `border-1` on light, `border-2` on dark. Dashed `border-1` for separators (`.section-separator`).

---

## 7. Components

| Component | Class / file | BB Tech rules |
|---|---|---|
| Primary button | `.tj-primary-btn` via `ButtonPrimary.js` | Pill (50px radius); primary fill, white semibold 16px text, and a 42px navy icon chip with a −45° arrow. On hover the label rolls up (existing behavior). Adding `primary-hover` as the hover fill is recommended. |
| Dark button | `.tj-primary-btn.btn-dark` | Navy fill with a white icon chip. Use it on light sections as the secondary CTA. |
| Outline button | `.tj-primary-btn.transparent-btn` | `border-1` outline with navy text; the border darkens to navy on hover. |
| Accent button (new) | add `.btn-accent` | Orange fill, **navy text**, `accent-hover` on hover. **At most one per page** (e.g. "Get a quote"). |
| Section heading | `.sec-heading` (+ `style-*`) | Eyebrow, then `h2.sec-title` with one highlight span, then optional lead paragraph. |
| Service card | `ServiceCard4/11.js` | Icon from `bexon-icons`, title, short description, arrow link. Icons in primary (light) or sky (dark). |
| Header | `Header.js` | Home uses `headerType={10}`; inner pages use the default (1). Both render an absolute header and a sticky duplicate. |
| Footer | `Footer10.js` (home), `Footer.js` (inner) | Navy. Links in `text-body-2`, hover to white; social icons hover to sky. |
| Page hero | `HeroInner.js` | Title plus breadcrumb. Background image `bg/pheader-bg.webp` is template stock; replace it. |
| Forms | `Contact2/3.js` | 8–10px radius inputs with `border-1`, and a primary focus ring of 2px `tj-rgba(theme, primary, .4)`. Labels must be visible, not placeholder-only. |

**Focus states (a11y requirement):** every interactive element needs a visible `:focus-visible`
ring: 2px primary on light, 2px sky on dark, 2px offset. The template has none.

---

## 8. Iconography

- **Primary set:** `bexon-icons` (`tji-*`, e.g. `tji-service-1`, `tji-arrow-right`). It matches
  the template's line style.
- **Secondary:** Font Awesome Pro 6 (`fa-light`, `fa-regular`, and `fa-brands` for social). Use
  it only when `tji-*` lacks a glyph.
- Don't mix Font Awesome solid with the line icons in the same group.
- Decorative icons get `aria-hidden="true"`. Icon-only links need an `aria-label`.

---

## 9. Motion

- The stack is initialised in `ClientWrapper`:
  - GSAP ScrollSmoother (smooth 1.5)
  - SplitText title reveals (`.text-anim`, `.title-anim`)
  - WOW `fadeInUp` with `data-wow-delay` steps of about .1–.3s
  - Swiper carousels
  - The magic cursor (home only)
- **Tone:** calm and quick. Durations 0.3–0.8s, ease-out, stagger ≤ 0.1s. There should be no motion a user has to wait for.
- **Required:** respect `prefers-reduced-motion`. The codebase has no handling today. Wrap GSAP
  setup in `gsap.matchMedia()` and skip ScrollSmoother, SplitText, and WOW when
  `(prefers-reduced-motion: reduce)` matches, leaving content visible.
- Don't add new animation libraries. Build new effects as a `src/libs/*` module registered in `ClientWrapper`.

---

## 10. Imagery

- Nearly everything in `public/images/` (about, hero, team, testimonial, brands, blog, project,
  award) and `public/video/h10-banner-videio.mp4` is **template stock and must be replaced**
  before launch.
- **Direction:**
  - Real people and real work in UAE business settings: offices, factories, clinics, retail, construction sites.
  - Screens showing ERP dashboards and apps.
  - Natural light, slightly cool grade to sit with the blues.
  - No clichéd handshake or glowing-brain stock.
- **Service art:** consistent line or isometric illustrations in the brand palette (navy lines,
  primary/sky fills, a small orange detail). The old site's PNG icons can guide subjects, not style.
- **Industry tiles** (9 from the live site): Construction, Food & Beverage, Manufacturing,
  Transportation, Healthcare, Consultancy, Retail, Institutes, Auto workshops.
- **Format:** WebP, ≤ 200KB for content images, ≤ 400KB for heroes. Always through `next/image`,
  with descriptive `alt` (empty `alt=""` only when decorative).
- **Trust marks:** ISO 45001/27001/14001/9001 badges only once the client confirms they're current.
  No invented client logos; the brand slider stays hidden until real logos arrive.

---

## 11. Voice and copy

- **Voice:** confident, plain, specific. Short sentences. Say what gets delivered ("We build and
  support custom ERP for construction firms") rather than adjectives ("world-class solutions").
- **Language:** US English. "BB Tech" (with a space). Product names: ERP, Odoo, ISMS, Social WiFi, ADHICS.
- **Numbers:** use only figures the client stands behind. The live site claims 500+ customers
  and per-industry client counts; its "years of experience" claims conflict (see `AGENTS.md`).
- **CTAs:** verb-first and specific: "Get a quote", "Talk to an ERP expert", "Contact us".
  Avoid "Click here" and "Learn more" on their own.
- **Microcopy:** errors say what happened and how to fix it. Success states confirm the next step
  ("We'll reply within one business day").

---

## 12. Page templates

**Home** (`src/app/page.js`), current order: Hero10, Services10, TextMarquee, About9, Process4,
Testimonials10, Brands3, then Footer10.

For launch, hide Testimonials10 and Brands3 until real content exists. Consider adding
Industries (live content exists) and a "Why BB Tech" block (10 years / 24/7 critical support /
domain experts, pending fact check).

**Inner page:** `HeaderSpace`, `HeroInner` (title + breadcrumb), 2–5 sections, `Cta`, `Footer`.
Service detail uses `ServiceDetailsMain`: main content plus a sticky service list sidebar.

---

## 13. Accessibility checklist (per page)

- [ ] Text contrast follows §3.3; no primary-on-navy and no white-on-orange/sky.
- [ ] Visible `:focus-visible` on all links, buttons, and inputs; logical tab order.
- [ ] One `h1` per page; headings in order.
- [ ] Images have correct `alt`; icon-only controls have `aria-label`.
- [ ] Reduced motion honored; any carousel that auto-advances has a pause control (WCAG 2.2.2).
- [ ] Works at 320px width with no horizontal scroll; tap targets ≥ 44px.
- [ ] Form fields have visible labels, associated errors, and `autocomplete` attributes.

---

## 14. Do / Don't

| Do | Don't |
|---|---|
| Change token values in `_colors.scss` | Paste hex/rgba into components or partials |
| Use sky for emphasis on navy | Use primary blue text on navy |
| Use orange as a single spark with navy text | Put white text on orange, or use orange text on light |
| Reuse numbered section variants | Build parallel one-off sections |
| Keep light pages with one or two navy bands | Make whole pages dark |
| Use real client content, or hide the section | Ship template stock or placeholder names |

## 15. Open design items

1. A logo lockup with a wordmark, plus a white/mono variant. The repo only has the icon mark.
2. OG image and social avatars.
3. Photography: commission or source real imagery (see §10).
4. Whether to adopt the accent button (§7) or keep orange purely decorative.
