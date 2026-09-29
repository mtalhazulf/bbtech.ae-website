# Phase 2: brand re-theme (DESIGN.md §3–§9)

## Tokens

- `_colors.scss`: every template teal value replaced with its BB Tech value per §3.2's
  table; added `primary-hover`, `sky`, `mid`, `accent`, `accent-hover`.
- `_root.scss`: added `--tj-gradient-brand`/`--tj-gradient-brand-ui`, built from the
  theme map (not pasted hex) so `_colors.scss` stays the only literal source; bound
  `--tj-ff-heading: var(--tj-ff-body)` (see Fonts below).
- `_mixins.scss`: added the `tj-rgba($group, $shade, $alpha)` helper from §3.4.
- Fixed the 3 undefined variables (`common-black-2`, `common-black-3`,
  `--tj-color-body-text`) in `_mega-menu.scss`/`_careers.scss`.

## Literal replacement (§3.4)

Every `rgba(30, 138, 138, …)`, `rgba(12, 30, 33, …)`, `#0c1e21`, the two preloader
neons, and every `rgba(255,255,255,…)`/`rgba(0,0,0,…)` neutral converted to a
`tj-rgba()` call — 44 files. Also found and fixed 6 occurrences DESIGN.md's own literal
table didn't cover: old-palette hex baked into **URL-encoded inline SVG data-URIs**
(`fill="%230c1e21"` etc.) in `_h10-process.scss`, `_about.scss`, `_h10-service.scss`,
`_h8-header.scss` — invisible to a plain `#hex` grep. `_rangeSlider.scss` (38 literals,
jQuery-UI vendor CSS for the now-removed `react-range-slider-input`) was deleted rather
than re-themed — nothing renders a range slider.

Verified: zero `1e8a8a` / `30, 138, 138` anywhere in `src/`; the literal grep across
`src/app/assets/sass` returns only `_colors.scss` and `tj-rgba()` calls.

## Dark-surface rule (§3.3)

Real scope problem: DESIGN.md names 6 priority files, but 66 files reference
`theme-primary`, and most of the h4–h9 numbered template variants are dead code (no
`src/app` route reaches them — confirmed against every real page's actual built HTML,
not by filename guess). Rather than 66 blind edits, each candidate was checked against the
production build's rendered HTML first, then read for context (a `background:
theme-primary` fill with white text is correct and not a violation; only solid
text/icon color styled `theme-primary` on a confirmed `theme-dark`/`dark-2`/`bg-3`
background is the bug). Fixed on sight:

- `_services.scss` — the `.sec-heading.style-2 .sub-title` eyebrow and the
  `.service-item.style-1` hover-link, both on `theme-dark`.
- `_page-header.scss` — the breadcrumb separator icon (`.tj-page-header`, live on
  every inner page's hero banner).
- `_h10-process.scss` — `.sec-heading.style-3 .sub-title`, live via `HomeWhy.js`
  (the sibling `.sec-title` override already existed; `.sub-title` didn't).
- `_hamburger.scss` — the mobile `.mean-nav` link hover/active/dropdown states (the
  offcanvas panel's own dark backdrop).
- `_footer.scss` / `_h5-footer.scss` — the `.footer-2` (Footer10) widget-link hover
  and subscribe-label hover.

The 4 `_ci-*.scss` files from the earlier design-restoration pass turned out to
already handle this correctly (an explicit `.ci-footer-dark` override block, a
`$ci-on-dark-accent: var(--tj-color-theme-sky, var(--tj-color-text-body-2))` fallback
variable, and inline `var(--tj-color-theme-sky, var(--tj-color-theme-primary))` swaps)
— read in full, nothing to fix.

**Scope note (logged, not silently dropped):** the remaining h4/h6/h7/h8/h9 partials
(excluding footer, which Footer10 does pull from) are confirmed unreachable by any real
route today — same dead-code status AGENTS.md already documents for those variants. If
one is ever wired into a real page, it needs this same pass first.

## Components (§7)

- `.tj-primary-btn:hover` now fills `primary-hover` (was animation-only); `.btn-dark`
  keeps its own dark fill on hover instead of relighting primary.
- Added `.btn-accent` (orange fill, navy text — white fails on orange; `accent-hover`
  on hover), per the "at most one per page" budget in §3.5.
- Global `:focus-visible` ring (**the template had none** — `_theme.scss` was
  hard-coding `outline: none` even on `:focus-visible`, not just `:focus`): 2px
  primary + 2px offset by default, swapped to sky via a zero-specificity `:where()`
  covering the confirmed dark surfaces (page-header, hamburger/offcanvas, h10-process,
  footer-2/3) — so it never fights the content-import partials' own per-component
  focus-visible rules, which already existed for some elements.

## Footer unification (D3)

Every real route (`about-us`, `contact`, `services`, the catch-all, plus `error`,
`not-found`, and the dead `/about` placeholder) now renders `Footer10` instead of
`Footer`. `Footer.js` (footer-1) is only still referenced by the D4 hidden/non-routable
pages (`_careers`, `_faq`, `_history`, `_industries`, `_solutions`, `_team`,
`_terms-and-conditions`) — left alone per the existing hidden-section policy — and the
component file itself, kept per D3.

## Reduced motion (§9)

- `ClientWrapper.js`: wrapped the GSAP setup in `gsap.matchMedia()`. Under
  `prefers-reduced-motion: reduce`, `ScrollSmoother` and the SplitText-based reveals
  (`titleAnim`/`2`/`3`, `textReavealAnim`, `animateInvertText`) don't run, and WOW isn't
  imported; a `revealWithoutSplitText()` helper adds the `start-anim` class those
  modules would have added themselves, so `.title-anim`/`.text-anim`/`.hero-text-anim`
  content isn't left stuck at `opacity: 0`. A CSS `@media (prefers-reduced-motion:
  reduce)` rule on the same selectors is a second safety net. Every other scroll-tied
  tween (parallax, stack reveals, sidebar-sticky, etc.) is a plain position/opacity
  tween, not the vestibular-trigger-grade motion DESIGN.md calls out, so it's left
  running either way.
- Both live carousels already handled this before Phase 2 touched anything:
  `HomeMarquee.js` stops its Swiper autoplay under reduced motion and is `aria-hidden`
  (decorative duplicate of real page content); `HeroSlider.js` already ships a visible
  pause control.

## Fonts (§4)

`layout.js` loaded Mona Sans **twice** (200–900 + italics, for `--tj-ff-body` and
`--tj-ff-heading` separately) — 16 font files each instance. Now one `next/font`
instance (400/500/600/700, no italics) feeds `--tj-ff-body`; `_root.scss` binds
`--tj-ff-heading: var(--tj-ff-body)` so the two tokens can still diverge later without
a second load today. This is the fix for the FontDisplay insight from the baseline
trace (~3s of estimated FCP savings) — same family, one download instead of two.

## Verification

- `bun run build`: passes, 0 warnings.
- `bun scripts/import/verify.mjs`: unchanged from baseline — 26/26 routes, **815/815**
  strings, 64/64 images, 0 broken links, 0 remote refs/residue, 0 failures.
- Literal grep: `_colors.scss` only (plus the `tj-rgba()`/mixin definitions themselves).
- Manual pass on `/`, `/services/erp/`, `/contact/`, `/services/` at 1440px and 390px:
  no teal anywhere, no console errors beyond the two pre-existing accessibility
  advisories already logged in Phase 1 (deferred to Phase 6), no horizontal scroll.
- Screenshots: `content-import/screenshots/after-theme/` (gitignored) — see the
  before/after comparison presented at the Phase 2 checkpoint.
