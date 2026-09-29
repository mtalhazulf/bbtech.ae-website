# Phase 3: visual polish

## The 3 named items

1. **Hero slide 1 empty space.** Root cause: slide 1 (home.json) genuinely has no
   `cta` — confirmed against the live snapshot (`content-import/snapshot/home/page.html`
   has exactly 2 "Discover more" buttons, matching slides 2 and 3; slide 1 never had
   one). Fabricating a button would violate the no-invented-content rule. Swiper (no
   `autoHeight`) sizes every slide to the tallest one, and Bootstrap's `.row` default
   (`align-items: stretch`) top-aligns each slide's shorter content inside that shared
   height — so slide 1's title+subtitle (no button) left a gap below where 2/3's
   button sits. Fixed with `align-items: center` on `.ci-hero-row`: content balances
   vertically instead of top-aligning, no new content, no imagery added.
2. **About photo looks stretched.** The harvested source
   (`binary-bridge-technology-services.webp`, reused here via the section's own
   `mediaFrom: "hero.0"` presentation key) is landscape, 600×416 — the only resolution
   the live site had. The media column's `min-height: 520px` forced `object-fit: cover`
   to upscale it ~40% to cover a near-square box, reading soft. `width`/`height` were
   already correct (from the JSON) and `object-fit: cover` was already applied; per
   DESIGN.md's own two remaining levers, lowered `min-height` to 420px (400px at `$lg`)
   so less blow-up is needed, and set an intentional focal point
   (`object-position: center 75%`) toward the photo's actual subject (the hands/device
   hologram) instead of the dead-center default, which framed mostly torso.
3. **Hero tab labels wrap to 3 lines on phones.** Checked first — this was **already
   fixed**: `_ci-home.scss` has `@media #{$xs} { .ci-hero-thumb-title { display: none; } }`,
   and the button's `aria-label` (`"02: ERP CUSTOMIZATION"`) already carries the full
   title for assistive tech, so nothing was lost. Confirmed live at a genuine 390px
   viewport: tabs show only `01 / 02 / 03`, one line each, no wrap. (My apparent
   "wrapped 3 lines" observation earlier this session traced to a tooling problem, not
   a real page bug — see the note below.)

## Tooling note: `resize_page` vs `emulate()`

Mid-session, `resize_page` started silently landing on the wrong CSS viewport width in
this environment (390 requested → 666px actual; 1200 → 1600px actual) while still
*reporting* the requested size — every earlier "mobile" screenshot in this session was
real Chrome output, just not reliably at the claimed width. `emulate({ viewport:
"WxH,mobile" })` does not have this problem (confirmed exact `window.innerWidth` at
320/390/768/1024/1440/1920 for every page checked below). All Phase 3 breakpoint
verification below used `emulate()`, not `resize_page`.

## Branded 404 and error pages

Both `not-found.js` and `error.js` already render through `HeroInner` + `Footer10` +
the same global re-theme — no separate "branding" work needed after Phases 1–2. Found
and fixed one real gap: `not-found.js` (a Server Component) had no `export const
metadata`, so it silently inherited the root layout's title (home's) — confirmed via
`document.title` on a genuinely missing URL. Added `metadata.title` from the page's own
`pages.json` copy ("Error 404 - BB Tech") and `robots: { index: false }`. `error.js`
must stay a Client Component (Next.js's error-boundary contract) and Client Components
can't export `metadata`, so it has no separate fix — its use case (a runtime exception,
not a missing route) is rare on a fully static site with `dynamicParams = false`, and
the surrounding document's own metadata already applies.

## Responsive sweep (320 / 390 / 768 / 1024 / 1440 / 1920px)

Representative real page types: home, about-us, services (hub), a service detail with
sidebar (`/cloud-computing-services/`), a landing-layout product (`/erp/`), a news post,
contact, and 404. **48/48 checks** (`document.documentElement.scrollWidth ===
window.innerWidth`, via `emulate()`) — zero horizontal overflow on any page at any
breakpoint. Spot-checked 320px visually on 3 of them (home, erp, cloud-computing-services)
for clipped/overlapping text the scrollWidth check wouldn't catch — clean.

Tap targets: the template's own `.ci-hero-thumb`/nav/button sizing already targets
44px (see `min-height: 44px` on `.ci-hero-thumb`, `_theme.scss`'s `:focus-visible`
work in Phase 2); no new small targets were introduced this phase. A full per-element
audit is Phase 6's job.

## Verification

- `bun run build`: passes, 0 warnings.
- `bun scripts/import/verify.mjs`: unchanged — 26/26 routes, 815/815 strings, 64/64
  images, 0 failures.
- All 3 named items and the 404 title fix confirmed visually against the rebuilt
  production server.
