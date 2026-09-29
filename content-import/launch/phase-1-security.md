# Phase 1: security and dependencies

## Swiper (critical alert #30, GHSA-hmx5-qpq5-p643, CVE-2026-27212)

Prototype pollution via `extendDefaults()`, fixed in swiper `12.1.2`. Upgraded `11.2.10` →
`12.2.0` (latest 12.x patch; not the newest overall `14.3.0`, on purpose — that's two more
majors with an unresearched blast radius, and the brief's ask was to close the alert, not chase
`latest`). Migration notes for `11 → 12` show three breaking-change areas: loop mode reworked
(`loopedSlides` removed), image-preload options removed (`preloadImages`,
`updateOnImagesReady`), and the Angular/Svelte/SolidJS components dropped in favor of a web
component (React support unaffected). Grepped the codebase for all three — none are used here
(every `loop` prop is a plain boolean). `12.0.1–12.2.0` are bug-fix-only patches on top of that.

All 6 CSS import paths (`swiper/css`, `swiper/css/effect-{coverflow,fade}`,
`swiper/css/{navigation,pagination,thumbs}`) and `swiper/react`, `swiper/modules` still resolve
under 12.2.0.

**Manually verified** (production build, `bun run start`) — of the 8 files that import swiper,
only 2 are reachable from a real route (the rest are template variants with zero importers from
`src/app`, or importers only reachable through the pre-import placeholder `/about/`, which
`next.config.js` permanently redirects to `/about-us/`):
- `HeroSlider.js` (home hero, `.ci-hero-slider`): effect-fade initialized, autoplay observed
  advancing slide 1 → 2 automatically, tab buttons in sync, pause control present, no console
  errors at 1440px or 390px.
- `HomeMarquee.js` (home service marquee, `.marquee-slider`): free-mode loop initialized,
  scrolling text content correct and duplicated for the loop, no console errors.

## Other dependency vulnerabilities (`bun audit`)

Before any change: **50 vulnerabilities (2 critical, 25 high, 19 moderate, 4 low)**, almost all
on `next@16.0.7` (range `>=16.0.0 <16.2.5` — includes 2 critical RCEs: Windows-hosted server RCE
and an AVIF Image-Optimization-API RCE), plus transitive `nanoid`/`postcss` pulled in through
`next` and through `nice-select2`'s own (unused) build toolchain, plus a `sharp`/libvips range
that a since-removed package's own dependency tree was pulling in.

- `next` `16.0.7 → 16.3.6` (latest patch within major 16) — closes every `next`-range advisory,
  including both criticals.
- `react` / `react-dom` `19.2.1 → 19.3.0` (latest patch within major 19) — no CVEs were open on
  these; bumped per the brief regardless.
- `sass` (dev) `1.94.2 → 1.105.0` (latest 1.x) — brings in a newer `immutable` transitively,
  closing 3 high `immutable` prototype-pollution/DoS advisories that had nothing to do with our
  own code (`sass`'s in-process compiler, not the CLI watch mode).
- Remaining after that: 2 vulnerabilities, both `picomatch <2.3.2` via
  `sass → @parcel/watcher → micromatch → picomatch` — `@parcel/watcher` is an **optional**
  dependency of `sass` used only by `sass`'s own CLI `--watch` mode (glob-matching watched
  paths), never invoked by Next's own Sass integration, and `sass` is already at its newest
  1.x release with no fix upstream yet. Pinned it down anyway with a `package.json`
  `"overrides": { "picomatch": "^2.3.2" }` (a patch-level bump of a leaf dependency, effectively
  zero risk). **After this, `bun audit` reports 0 vulnerabilities.**

None of the above needed a major-version bump on `next`/`react`/`react-dom` themselves, so there
was nothing to stop and ask about beyond the swiper major bump, which the brief pre-approved and
described exactly how to handle.

## Removed dependencies (nothing imports them)

Grepped every candidate from the brief across `src/`, `public/`, and `next.config.js` before
removing. All 8 had **zero** references anywhere outside their own vendored CSS files under
`src/app/assets/css/` (which are unrelated static files, not tied to the npm packages):

| Package | Why it's dead |
|---|---|
| `chart.js`, `react-chartjs-2` | No chart component anywhere in `src` |
| `isotope-layout`, `imagesloaded` | No portfolio/masonry grid in the imported content |
| `nice-select2` | The actual dropdown (`Contact2`/`Contact3`) is a hand-rolled React component (`ReactNiceSelect.js`) that only borrows the `nice-select` CSS class name — the vendored `assets/css/nice-select2.css` stays, the npm package doesn't need to |
| `sweetalert2` | No `Swal` usage anywhere |
| `glightbox` | No lightbox trigger anywhere; its CSS import in `layout.js` was pure dead weight, removed |
| `react-odometerjs` | **Kept** — it's live in `FunfactSingle.js`, used by `HomeAbout.js` on the real home page |
| `react-range-slider-input` | Component never rendered; only its CSS was globally imported in `layout.js` for no reason — both removed |

Removing `nice-select2` also removed its own (mis-declared, should've been dev-only)
`css-loader`/`postcss-modules-scope`/`postcss-selector-parser` chain, closing that low-severity
advisory as a side effect.

## Build hygiene

Next 16.3.6's Turbopack now warns when it finds an unrelated lockfile above the repo root while
guessing the workspace root (here: a stray `package-lock.json` in the Windows user profile
folder, unrelated to this project). Pinned `turbopack.root` in `next.config.js` to silence it —
this is a new warning class introduced by the Next upgrade, not present in the Phase 0 baseline,
and `CLAUDE.md` requires the build to have no new warnings.

## Verification

- `bun audit`: 0 vulnerabilities (was 50).
- `bun run build`: passes, 0 warnings (baseline had the pre-existing `baseline-browser-mapping`
  notice; this build didn't even print that one).
- `bun scripts/import/verify.mjs` against the fresh build: unchanged from baseline — 26/26
  routes, **815/815** strings, 64/64 images, 0 broken links, 0 remote refs/residue, 0 failures.
- Manual carousel check above; no console errors on `/` at 1440px or 390px beyond two
  pre-existing accessibility advisories (lazy images without explicit dimensions, a form field
  missing `id`/`name` — both real, both deferred to Phase 6).
