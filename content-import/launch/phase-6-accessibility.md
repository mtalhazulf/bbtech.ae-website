# Phase 6: accessibility (WCAG 2.1 AA)

## Method

No Playwright/axe-core install — this environment already has a live Chromium reachable
via the chrome-devtools MCP tooling used throughout Phases 0–5, and Lighthouse's
accessibility category runs on the same axe-core engine, so it doubles as the Phase 7 SEO/
best-practices check without adding a dev dependency. Ran `lighthouse_audit` (mobile,
navigation mode) against one page per template — home (`/`), about-us, contact (the one
real form), services hub, a catch-all service page (`/services/erp/`), a dynamic post
(`/2020/08/05/new-corporate-logo-updated-branding/`), and the 404 page (snapshot mode,
since Lighthouse's navigation mode refuses to score a real 404 response — confirmed via
its own `ERRORED_DOCUMENT_REQUEST` runtime error, not a site bug: returning a genuine 404
status is correct and is what Phase 3's `robots: {index:false}` metadata assumes).
Cross-checked every finding against `DESIGN.md` §13's checklist, then verified each fix
live (keyboard-only interaction, `getComputedStyle`, the accessibility-tree snapshot) —
Lighthouse's own accessibility score wouldn't have caught the keyboard-only mega-menu bug
below on its own, since axe-core can't simulate real hover/focus interaction sequences.

## Findings and fixes

**1. Desktop mega-menu was keyboard-inoperable (WCAG 2.1.1 Keyboard).** The "ERP" and
"Services" nav dropdowns only revealed their submenu on `:hover`
(`.mainmenu ul > li:hover > .sub-menu { opacity:1; visibility:visible; pointer-events:inherit }`
in `_header.scss`) — zero `:focus-within` rules existed anywhere in the SCSS tree. A
keyboard-only sighted user tabbing through the header could never see or reach "ISMS –
School System" or any of the 5 services links from the desktop nav. Added `:focus-within`
alongside `:hover` on both the submenu-reveal rule and its chevron-rotation rule. Verified
live: focusing "ERP" now makes its submenu `visibility:visible`/`pointer-events:auto`, and
a real Tab press from "ERP" lands on "ISMS – School System" next.

**2. The header's two main toggle controls were `<div onClick>`, not buttons — completely
unreachable by keyboard (WCAG 2.1.1).** `Header.js`'s mobile hamburger toggle
(`.menu_bar.mobile_menu_bar`, the control that opens the *entire* mobile nav on every
page) and the desktop "contact menu" toggle (`.menu_bar.menu_offcanvas`) were plain
`<div>`s with an `onClick` and three empty decorative `<span>`s — no `role`, no
`tabIndex`, no accessible name. A `<div>` isn't in the tab order at all, so a keyboard-only
user had **no way to open the mobile menu on any page**. Converted both to real
`<button type="button">` elements with `aria-label`s ("Open menu" / "Open contact menu")
and `aria-hidden` on the decorative spans; added a matching CSS reset
(`border:0; background-color:transparent; padding:0; font:inherit`) to `.menu_bar` in
`_header.scss` so the native button doesn't introduce browser-default chrome.

**3. Several icon-only controls had no accessible name (WCAG 4.1.2 Name, Role, Value),**
caught by Lighthouse's `button-name`/`link-name` audits:
- `Header.js`'s search-open and search-close buttons → `aria-label="Open search"` /
  `"Close search"`.
- `MobileMenu.js`'s hamburger-close button (`.hamburger_close_btn`) → `aria-label="Close menu"`.
- `MobileMenu.js`'s social links → these were the one place in the codebase that skipped
  the shared `getSocialLabel()` helper (already used consistently by `HeaderTop.js` and
  `ContactMenu.js`, per that helper's own doc comment) — wired it in, matching the other
  two call sites exactly.
- The mobile hamburger nav's own submenu-expand control (`MobileMenuItem.js`) was a
  `<Link href="#">` styled as a button, icon-only, no label, no expanded/collapsed state
  exposed to assistive tech — screen readers announced it as an unnamed link. Rewritten as
  a real `<button type="button">` with `aria-expanded`, `aria-controls` (pointing at the
  submenu's `useId()`-generated id), and an `aria-label` that flips between "Expand"/
  "Collapse {section} submenu". `_hamburger.scss` already had a `button.mean-expand`
  selector alongside `a.mean-expand` — this component was the only thing not using it.

**4. `MobileNavbar.js` carried a dead `<Link href="#nav" className="meanmenu-reveal">`**
(leftover from the template's original meanmenu jQuery plugin, never wired to any handler
— the real mobile-menu open/close is `Header.js`'s own `isMobileMenuOpen` React state via
`MobileMenu.js`). It had no CSS tied to the class itself and no click behavior, but was
still focusable and read by screen readers as an unlabeled, non-functional link. Removed
it outright rather than labeling dead functionality.

**5. ERP's dropdown was silently missing everywhere (not an accessibility finding by
itself, but found while fixing #1 and #3 above).** `public/fakedata/nav-items.json`
declares a submenu under "ERP" (`ISMS – School System`), but both `Navbar.js` (desktop)
and `MobileNavbar.js` (mobile) rendered ERP as a plain link, ignoring `.submenu` entirely
— dead data, not a broken link (footer's Services column already linked ISMS, confirmed
via the built HTML), but the header's declared nav structure and its actual markup had
drifted apart. Rendered it the same way "Services" already was — a `.has-dropdown` with a
`.sub-menu` list — on both desktop and mobile, reusing existing dropdown styles with no
new CSS. This also means finding #1's `:focus-within` fix and finding #3's ARIA-expand
fix now apply to a previously-invisible piece of real navigation, not just cosmetic reveal.

**6. `HomeMarquee`'s continuous auto-scroll had no pause mechanism (WCAG 2.2.2 Pause,
Stop, Hide).** It honored `prefers-reduced-motion` but moved indefinitely for sighted
users with no reduced-motion preference and no other way to stop it. `HeroSlider.js` (the
homepage's real content carousel) already had a pause button with `aria-label`, `inert` on
hidden slides, and reduced-motion handling — clearly built carefully in an earlier phase.
`HomeMarquee` is `aria-hidden` (purely decorative, duplicates real headings rendered
elsewhere on the same page), so a visible pause button isn't warranted for a11y purposes,
but the *sighted*-user distraction requirement in 2.2.2 doesn't hinge on `aria-hidden`.
Added pause-on-hover/focus via the same `swiper.autoplay.stop()/.start()` pattern
`HeroSlider` already uses.

## Not changed / flagged instead of fixed

- **`/contact/` and `/services/erp/` score SEO 92, not 100** — both are 2 of the 10 pages
  already documented in `needs-client-input.md` as having **no** meta description in the
  original WordPress/Yoast data. Per the content rules (never fabricate copy), this was
  deliberately kept absent during the content import and stays that way here; Phase 7/9
  will decide whether a generic site-wide fallback description is acceptable or whether
  this stays a client-supplied item.
- **An unused `<link rel=preload>` for `h7-testimonial-shape-blur.svg`** (browser console
  warning, unrelated to accessibility) — a template asset preload hint left over from an
  unrelated component; noted for Phase 7's performance pass rather than fixed here.
- Did not touch the dead `/about` route's components (`Testimonials2`, `Brands1`) or any
  other component unreachable from a real, routed page — consistent with AGENTS.md's
  "leave unused template variants in place" rule; they were confirmed unreachable via
  grep against `src/app`, not skipped by assumption.

## Verification

- `bun run build`: passes, 0 new warnings.
- `bun run test`: 45/45.
- `bun scripts/import/verify.mjs` (against the build): 815/815 strings, 0 failures.
- Lighthouse (mobile), before → after the fixes above, home page:
  Accessibility 90→**100**, Best Practices 100→100, SEO 100→100, Agentic Browsing 50→**100**.
- Lighthouse (mobile) on every other sampled template: Accessibility **100**, Best
  Practices **100**, Agentic Browsing **100**; SEO **100** except the two known-gap pages above.
- Live keyboard verification (not just Lighthouse, which can't simulate focus sequences):
  Tab from "ERP" reaches "ISMS – School System"; focusing "Services" reveals all 5 service
  links with `pointer-events:auto`; the mobile hamburger's ERP/Services expand buttons
  correctly toggle `aria-expanded` (false→true) and their `aria-label` text, verified via
  the accessibility-tree snapshot showing both as "Expand ERP submenu"/"Expand Services
  submenu", "expandable".
- 320px width: no horizontal scroll on home or contact (`scrollWidth === clientWidth`).
- No new console errors; the only warnings present (Turnstile site-key-missing, the
  unrelated SVG preload) are pre-existing and already accounted for above.
- Not independently re-verified: real screen reader software (NVDA/VoiceOver) — the
  fixes above were verified via the accessibility tree and axe-core (Lighthouse), which is
  the same engine `@axe-core/playwright` would have used, but neither substitutes for a
  real AT smoke test before launch.
