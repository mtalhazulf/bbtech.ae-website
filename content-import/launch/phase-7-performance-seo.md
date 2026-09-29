# Phase 7: performance, SEO, launch hygiene

## What was added

- **`src/app/opengraph-image.js`** (D7) — a code-generated 1200×630 OG image (`next/og`'s
  `ImageResponse`, statically optimized at build time, zero runtime cost) for any route
  that doesn't set its own `openGraph.images`. All 26 real pages already carry a real,
  harvested photo as their `ogImage` (`src/data/pages/*.json`, confirmed via a full sweep
  — nothing was actually missing one), so this never overrides a real page image; it's a
  safety net for the 404 page and anything added later. Built from the existing icon mark
  (`public/images/logos/logo-icon.webp`, converted to PNG via `sharp` since Satori's image
  support is more reliable with PNG than WebP) plus the shortname/tagline from
  `site.json`, on the navy/sky/accent brand colors from `_colors.scss`. Per D7, no fake
  wordmark was invented — the real icon mark plus typeset text, exactly as specified.
  Colors are literal hex here (not `var(--tj-color-*)` tokens) because this file renders
  in Satori's isolated JSX-to-image engine, which has no access to the page's CSS custom
  properties — the values are copied from `_colors.scss` directly (`#0b1832`, `#08a5e9`,
  `#f48916`) with a comment pointing back to the source of truth, not re-guessed.
- **`src/app/icon.png` / `apple-icon.png`** (512×512 transparent, 180×180 flattened onto
  brand navy) and **`public/icons/icon-192.png` / `icon-512.png`** — generated the same
  way, from the same source mark. Next.js's file-convention now injects real
  `<link rel="icon">` / `<link rel="apple-touch-icon">` tags (previously only the bare
  `public/favicon.ico` existed, with nothing for iOS home-screen or Android/PWA install).
- **`src/app/manifest.js`** — a Web App Manifest (`name`/`short_name`/`description` from
  `site.json`, navy theme/background color, the two new icon sizes). Serves at
  `/manifest.webmanifest`, linked automatically in `<head>`.

## Performance

No axe-core/Lighthouse *performance* score is available through this environment's
chrome-devtools MCP tooling (`lighthouse_audit` explicitly excludes the performance
category here — a tooling limit, not a site issue) — used its `performance_start_trace`
instead, which reports the same underlying Core Web Vitals the brief's targets are stated
in, under real throttling (4x CPU, Fast 4G network, mobile viewport):

| Page | LCP (target <2.5s) | CLS (target <0.1) |
|---|---|---|
| `/` | **1.34s** | **0.00** |
| `/services/erp/` | **1.22s** | **0.00** |

Both pages clear the targets with wide margin under throttled mobile conditions, not just
on fast hardware. No TBT figure is directly surfaced by this trace tool, but neither trace
flagged a long-task/main-thread-blocking insight, which a TBT problem would produce.

Two low-value findings surfaced, both explicitly rated "0ms estimated savings" by the
tool's own insight, so left alone rather than chased for their own sake:
- ~14.4kB of legacy JS transforms/polyfills (a build-tooling default, not a per-file issue
  to hand-fix).
- One `<link rel=preload>` for `h7-testimonial-shape-blur.svg` that's fetched but unused
  within a few seconds (a stray template asset hint, console-warning only, not a real
  regression) — noted here rather than fixed since it isn't part of anything Phase 1-6
  touched and has no measurable performance cost.

## Not done: h4–h9 dead SCSS partial pruning

`AGENTS.md`'s own Conventions section is explicit: "Leave the template's unused variant
styles (h4-h9 partials) in place during the content migration. Pruning them is its own
task, and it needs a build plus a visual check afterwards." The live Core Web Vitals
above show this isn't costing anything measurable today (LCP/CLS are both excellent), and
a 106-partial SCSS tree has real regression risk if pruned without the dedicated,
per-variant visual sweep AGENTS.md itself calls for. Deferring this by design, not by
oversight — it's a separate task with its own review gate, not a Phase 7 blocker.

## SEO

- Sitemap (`/sitemap.xml`): 26/26 real pages, no metadata routes (`/api/contact`,
  `/opengraph-image`, `/icon.png`, `/manifest.webmanifest`) leaked in.
- `/robots.txt`: unchanged, correct, references the sitemap.
- Lighthouse SEO: **100** on every sampled page except `/contact/` and `/services/erp/`
  (**92**, `meta-description` audit) — both are 2 of the already-documented 10 pages with
  no meta description in the original WordPress/Yoast data (`needs-client-input.md`).
  Per the content rules (never fabricate copy to fill a slot), this stays as the earlier
  phases decided: absent rather than invented. Not re-litigated here.

## Verification

- `bun run build`: passes, 0 new warnings, 3 new static routes (`/icon.png`,
  `/apple-icon.png`, `/manifest.webmanifest`) plus `/opengraph-image`.
- `bun run test`: 45/45.
- `bun scripts/import/verify.mjs`: 815/815 strings, 0 failures.
- Visual check: the generated OG image at `/opengraph-image` renders correctly (icon mark
  with intact alpha transparency, "BB Tech", accent divider, tagline, navy background) —
  screenshotted directly in a live browser, not just trusted from code.
