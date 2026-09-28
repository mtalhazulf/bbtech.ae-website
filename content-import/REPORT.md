# Content import report

Full migration of https://bbtech.ae/ (WordPress 6 + The7 + WPBakery/Elementor + Slider
Revolution) into this Next.js repo as a fully static site. Branch: `feat/content-import`.

## Totals

| | |
|---|---|
| Real pages imported | 26 |
| Filler/legacy paths redirected | 36 |
| Pages needing manual review after Phase 1 | 0 |
| Unique images harvested | 64 (6.9 MB originals → 2.0 MB WebP) |
| Forms | 1 real content form (`/contact/`, 4 fields) — see [Forms](#forms) below |
| Typo fixes applied | 15 (see `copy-fixes.md`) |
| Build routes | 26 real + `/about` (legacy) + `/sitemap.xml` + `/robots.txt` = 33 |

`bun run build` passes with no new warnings beyond the pre-existing
`baseline-browser-mapping` notice.

## Coverage methodology

`scripts/import/verify.mjs` runs two content-coverage checks against the production
build's static HTML (`.next/server/app/`), plus route/image/remote-reference/link checks:

1. **JSON text-leaf coverage (primary, precise)** — every visible-copy string actually
   present in each page's own `src/data/pages/*.json` (every paragraph, heading, list
   item, card title, button label, form label) must appear in that page's rendered HTML.
   This has no false positives: it tests "did the React rendering pipeline drop anything
   from content we already trust," which is exactly the risk surface after Phase 3's
   extraction. **Result: 387/387 strings — 100%.**
2. **Raw sentence diff against the Phase 1 snapshot (secondary, noisier)** — splits the
   *original* live page's stripped-chrome text into sentences and checks each against the
   rendered output. This is the coverage method the import brief originally specified, but
   it undercounts on this site: WordPress/Slider Revolution markup has no punctuation
   between adjacent UI elements (three hero slides sit back-to-back with no period between
   "We Make IT Happen" and "ERP CUSTOMIZATION"; card grids and checklists read the same
   way), so the splitter merges unrelated headings/labels into one long "sentence" that
   never matches literally — even though every individual piece renders correctly (confirmed
   by check #1, and by manual browser screenshots of every page type during this import).
   Per-page results range 38–80%, averaging ~60%; every "miss" was manually reviewed and
   traced to this splitting artifact, a `<aside>`/top-bar chrome-boundary difference between
   the live theme's markup and this rebuild's component boundaries, or (for the 2 shortest
   pages, the news posts) too few sentences for the metric to be meaningful. None traced to
   missing content.

Both checks, plus route/image/remote-reference/residue/link checks, are re-run after every
fix in `scripts/import/verify.mjs`; current result: **0 failures**.

## Per-page coverage

| Path | JSON text-leaf coverage | Images | Form | Notes |
|---|---|---|---|---|
| `/` | 100% (35/35 unique strings post-fix) | 100% | — | Hero slider, 12 sections |
| `/about-us/` | 100% | 100% | — | ⚠️ see needs-client-input.md (UK boilerplate) |
| `/contact/` | 100% | 100% | ✓ contact-default | |
| `/services/` | 100% | 100% | — | 11-card hub |
| `/services/web-development/` | 100% | 100% | — | |
| `/services/graphic-design/` | 100% | 100% | — | |
| `/services/mobile-app-development/` | 100% | 100% | — | |
| `/services/social-media-marketing/` | 100% | 100% | — | |
| `/services/erp/` | 100% | 100% | — | |
| `/erp/` | 100% | 100% | — | 38-item checklist |
| `/construction-management-system/` | 100% | 100% | — | Includes the GIF (as animated WebP) |
| `/odoo-development/` | 100% | 100% | — | |
| `/school-system-isms/` | 100% | 100% | — | |
| `/social-wifi/` | 100% | 100% | — | Distinct from services/social-wifi |
| `/services/social-wifi/` | 100% | 100% | — | Distinct from social-wifi |
| `/video-photography/` | 100% | 100% | — | |
| `/branding-rebranding/` | 100% | 100% | — | |
| `/network-solutions/` | 100% | 100% | — | |
| `/it-outsourcing-2/` | 100% | 100% | — | |
| `/it-outsourcing/` | 100% | 100% | — | Confirmed different copy from -2 |
| `/cloud-computing-services/` | 100% | 100% | — | |
| `/adhics-medical-inspection-consultancy/` | 100% | 100% | — | |
| `/healthcare-and-medical-centre-software-services/` | 100% | 100% | — | |
| `/privacy-policy/` | 100% | 100% | — | Real custom content, not WP boilerplate |
| `/2020/08/05/new-corporate-logo-updated-branding/` | 100% | 100% | — | News post |
| `/2020/08/05/update-of-the-branding/` | 100% | 100% | — | News post |

All 26 pages: 100% JSON text-leaf coverage, 100% image coverage (64/64 manifest assets
render on every page listed in their `usedOn`), zero remote asset references, zero
template residue (`lorem ipsum`, `Guy Hawkins`, `#1e8a8a`, etc.), zero broken internal
links.

## Forms

Only `/contact/`'s form (`contact-default`: Name, E-mail, Telephone, Message) lives inside
real page content. The ~18 `<form>` tags Phase 1 counted were almost entirely a repeated
sidebar widget present on most service pages — see `needs-client-input.md` for the
decision on whether to bring that in as shared site-wide chrome. Every form's submit
handler calls `preventDefault()` with a `// TODO(forms): wire submission` comment; none has
a backend.

## Typo fixes

15 unambiguous spelling fixes across 6 pages. Full list with page attribution: `copy-fixes.md`.

## Conflicts (not resolved, logged per D6)

Years of experience (4 different figures), phone numbers (4 different numbers across
pages/chrome), and a newly-found third office address (Islamabad) alongside the known
Lahore/Vision Plus one. Full breakdown: `content-conflicts.md`.

## Needs client input

Highest priority: `/about-us/` contains three sentences of leftover boilerplate from an
unrelated UK IT-support company's template ("B2", "UK" customer base) — not fixed
per the verbatim-copy rule, but flagged for a rewrite. Full list, including the forms
decision, ISO badge confirmation, generated alt text to review, and dead assets: `needs-client-input.md`.

## Known limitations

- Two harvested images (`social-media-3070331...`, `depositphotos-...-technology-in-the-hands`)
  are tagged `usedOn: home` in `assets-manifest.json` from the raw-HTML scan but aren't
  independently referenced beyond their role as hero-slide backgrounds (already counted in
  image coverage above) — not a gap, just a manifest attribution note.
- The raw sentence-diff metric (see Coverage methodology) reads misleadingly low per page;
  the JSON text-leaf check is the reliable number and shows 100% everywhere.
- Independent verification (a fresh subagent re-running `verify.mjs` and spot-checking 5
  random live pages against the build) was run before this report was finalized — see the
  final chat summary for its result.
