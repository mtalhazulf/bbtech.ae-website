# AGENTS.md: bbtech.ae website

Canonical, tool-agnostic instructions for any AI coding agent working in this repo.
Claude-specific workflow lives in `CLAUDE.md`. Visual rules live in `DESIGN.md`.

## Mission

Rebuild **https://bbtech.ae/** (WordPress + The7 theme) on this Next.js codebase, which is the
ThemeJunction **"Bexon"** template (`package.json` name is still `bexon`). The migration must:

1. Carry over the real BB Tech content from the live site.
2. Replace the template's teal theme with the BB Tech brand palette (spec in `DESIGN.md`).
3. Keep search rankings: slug routes that match the live URLs, plus permanent redirects for the rest.

Company facts: **BB Tech** is the UI name. The legal name is **Binary Bridge Technology Services**.
Tagline: "We Make IT Happen". Head office is in Al Ain, UAE. They sell ERP (custom and Odoo),
web and mobile apps, design and branding, SEO and social media, Social WiFi, networking,
IT outsourcing, cloud, and healthcare software/ADHICS compliance.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, **plain JavaScript** (no TypeScript, see Conventions)
- Styling: SCSS (`sass`) on top of vendored Bootstrap 5.3 CSS, Font Awesome Pro 6, and the `bexon-icons` font
- Motion: GSAP 3.13 (ScrollTrigger, ScrollSmoother, SplitText), WOW.js, Swiper 11
- Font: Mona Sans via `next/font/google` (set in `src/app/layout.js`)
- Package manager and runtime: **bun** (`bun.lock`; the Dockerfile uses `oven/bun:1`)

## Commands

```bash
bun install --frozen-lockfile   # install (never swap to npm/yarn/pnpm; keep bun.lock authoritative)
bun run dev                     # dev server at http://localhost:3000 (Turbopack)
bun run build                   # production build; currently prerenders 45 static pages
bun run start                   # serve the production build
docker build -t bbtech-web .    # container image (runs `bun run build`)
```

There is no linter, formatter, type-checker, or test suite yet. **`bun run build` is the only
automated gate.** It must pass before any task counts as done.

## Repository map

```
src/app/                      App Router pages (one folder per route; [id] = dynamic)
src/app/layout.js             Root layout: fonts, global CSS imports, root metadata
src/app/globals.scss          @forward list of every SCSS partial (order matters)
src/app/assets/sass/utilities Design tokens: _colors.scss, _typography.scss, _root.scss, _breakpoints.scss
src/app/assets/sass/components|layout  106 partials, per component/section (h4-h10 = template home variants)
src/app/assets/css|fonts      Vendored third-party CSS and icon fonts. Don't edit.
src/components/layout/        Header (variants via headerType), Footer, Footer10, ServiceDetailsMain
src/components/sections/      Page sections, grouped by type; numbered variants (About3, About9...)
src/components/shared/        Cards, buttons, sliders, wrappers (ClientWrapper = all animation init)
src/data/site.json            Company, logos, contact, offices, socials, footer menus
src/data/pages.json           Per-page hero titles and root metadata
src/data/sections/*.json      Copy for each section component
public/fakedata/*.json        Collection data: services, nav-items, team, careers, testimonials, brands
src/libs/get*.js              Thin getters over the JSON (getALlServices, getNavItems, getSiteConfig...)
src/libs/*Anim*.js, tj*.js    GSAP animation modules, all run from ClientWrapper
public/images, public/video   Assets; most are still template stock
```

## Architecture and patterns

- **Page composition.** Every page follows the same shell: `<BackToTop/>`, `<Header/>` plus a sticky
  duplicate `<Header isStickyHeader/>`, then `#smooth-wrapper > #smooth-content > <main>` holding the
  sections, then `<Footer/>`, then `<ClientWrapper/>` last. Keep the two `#smooth-*` wrappers;
  GSAP ScrollSmoother depends on them.
- **Content lives in JSON, not JSX.** Components import their copy from `src/data/**` or read it
  through a `src/libs/get*.js` getter. To change text, edit the JSON. Add a new key rather than
  hard-coding strings in components.
- **Variants via props.** Sections and headers take `type` or `headerType` props that switch class
  names. Before building something new, reuse an existing numbered variant.
- **Server by default.** Pages are Server Components. Add `"use client"` only where there's
  state, effects, or browser APIs (26 of 66 components already have it).
- **Animations are declarative.** Add classes and attributes (`wow fadeInUp` + `data-wow-delay`,
  `text-anim`, `title-anim`) and let `ClientWrapper` initialise them. Don't create new GSAP
  instances inside section components. `reactStrictMode: false` in `next.config.js` is intentional
  (it prevents double GSAP/WOW init). Don't flip it.
- **Imports** use the `@/` alias (`@/components/...`, `@/data/...`). `@/` resolves to `src/`.
- **Static output.** Dynamic routes use `generateStaticParams`. Keep the site fully prerenderable:
  no request-time data, cookies, or headers.

## Conventions

- **JavaScript only for now.** Don't add `.ts`/`.tsx` or a tsconfig; TypeScript migration is a
  separate, later project. Document non-obvious data shapes with JSDoc `@typedef` where you touch them.
- Code style (match existing files): **tabs**, double quotes, semicolons, functional components,
  `export default` per component file, PascalCase component files, camelCase libs and hooks.
- Don't run a formatter across the repo. There's no config, so it would rewrite every file.
- Use `next/image` for images, with explicit `width`/`height` and meaningful `alt`.
- **All colors, fonts, and sizes come from tokens** (`--tj-*` CSS variables backed by
  `utilities/_colors.scss` and `_typography.scss`). No new hex or rgba literals in SCSS or JSX.
  `DESIGN.md` is the source of truth for tokens and usage.
- Leave the template's unused variant styles (h4-h9 partials) in place during the content
  migration. Pruning them is its own task, and it needs a build plus a visual check afterwards.

## Content rules

- **Source of truth is the live site.** When migrating a page, fetch the live URL and use its copy.
  Don't paraphrase from memory. Fix obvious typos ("Clinets", "MARKEETING", "intigration") but
  keep every factual claim as written.
- **Never invent facts.** No fabricated testimonials, client logos, team members, stats, awards,
  or certifications. The live site has **no real testimonials, client logos, or team profiles**.
  Template placeholders (testimonials such as "Guy Hawkins", team members such as "Savannah Nguyen",
  London-based careers, `1-888-452-1505`) must be removed or hidden until the client supplies real data.
- Where facts conflict, don't pick one yourself. Flag it for the owner. Known conflicts:
  - **Experience:** "over 5 years" (About), "over 6 years" (home), and "10 Years" (home). The founding year is 2016 per third-party listings.
  - **Phones:** +971 54 405 6829 (primary), +971 3 755 5069, and +971 56 128 6321.
  - **Offices:** `site.json` gives Pakistan offices UAE phone numbers. The Lahore address
    (574 Block G1, Johar Town) belongs to sister company **Vision Plus** (+92 numbers, info@visionplus.com.pk).
    Verify before publishing.
- ISO badges shown on the live site: 45001, 27001, 14001, 9001. Only display them if the client confirms they're current.
- Spelling: US English. Brand name is always "BB Tech" (not "BBTech", "BBTECH", or "B2").

## Routing, redirects, and SEO

Decision: **slug-based routes plus permanent redirects** from every live URL.

- Convert `services/[id]` from numeric ids to slugs: add a `slug` field in `public/fakedata/services.json`,
  look it up with `find(s => s.slug === slug)`, and return slugs from `generateStaticParams`. Update
  every `/services/<n>` link (`nav-items.json`, `site.json` footer menus).
- Reuse a live slug where the service matches 1:1, so no redirect is needed.
- Put redirects in `next.config.js` `redirects()` with `permanent: true`. Next emits a 308, which
  search engines treat like a 301. Proposed map (confirm the ERP consolidation first; see Open decisions):

| Live URL | New route |
|---|---|
| `/about-us/` (+ `/about-us/company/`, `/team/`, `/gallery/`) | `/about` |
| `/services/web-development/` | `/services/web-development` (same slug) |
| `/services/mobile-app-development/` | `/services/mobile-app-development` (same slug) |
| `/services/graphic-design/`, `/branding-rebranding/`, `/video-photography/` | `/services/graphic-design` |
| `/services/social-media-marketing/` | `/services/social-media-marketing` (same slug) |
| `/erp/`, `/services/erp/`, `/construction-management-system/`, `/odoo-development/`, `/school-system-isms/` | `/services/erp` |
| `/social-wifi/`, `/services/social-wifi/` | `/services/social-wifi` |
| `/network-solutions/`, `/it-outsourcing/`, `/it-outsourcing-2/` | `/services/it-network-security` |
| `/cloud-computing-services/`, `/healthcare-and-medical-centre-software-services/`, `/adhics-medical-inspection-consultancy/` | `/services/cloud-healthcare` |
| `/testimonials/`, `/projects/`, `/project/:slug*`, `/2020/:path*` | `/` |

- **Metadata:** today only `src/app/layout.js` exports `metadata`. Every page needs its own
  `metadata` (or `generateMetadata` for dynamic routes), sourced from `src/data/pages.json`. Keep
  the live title pattern `"{Page} | BB Tech"` and port the live meta descriptions where they exist.
  Set `metadataBase: new URL("https://bbtech.ae")` and a branded OG image.
- Add `src/app/sitemap.js` and `src/app/robots.js` before launch.
- A `/privacy-policy` page is required. The footer "Privacy Policy" link currently points to `/contact`.

## Definition of done

1. `bun run build` passes with no new warnings.
2. Pages you changed render correctly at desktop (≥1200px) and mobile (≤575px) in `bun run dev`,
   with no console errors and no leftover teal (`#1E8A8A`) or template copy.
3. New copy traces to the live site or to the client; no placeholders presented as real content.
4. New styles use tokens only; text contrast meets the pairs table in `DESIGN.md`.
5. Changed or added URLs are reflected in redirects, nav JSON, and footer menus.

## Open decisions (ask the owner; don't decide silently)

- Should ERP sub-products (ISMS school system, Odoo, Construction ERP) get their own pages
  instead of folding into `/services/erp`?
- Careers, Team, History, FAQ, Testimonials: keep them (they need real content) or remove them from nav for launch?
- Contact form backend (the live site uses Contact Form 7). The current form doesn't submit anywhere.
- A logo lockup with a wordmark and a branded OG image (the repo only has the icon mark).

## Don't

- Don't edit vendored files in `src/app/assets/css/` or `src/app/assets/fonts/`.
- Don't change `bun.lock` by hand or switch package managers.
- Don't delete the `#smooth-wrapper`/`#smooth-content` structure or the sticky header duplicate.
- Don't add dependencies without asking. Bootstrap, GSAP, and Swiper already cover layout, motion, and carousels.
- Don't commit secrets. There are no env vars today; if one is introduced, add `.env.example`.
