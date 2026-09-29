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
bun run build                   # production build; currently prerenders 33 static pages/routes
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
src/app/assets/sass/content-import    _ci-*.scss: styles for the imported-content components (one partial per area, see Content import)
src/app/assets/css|fonts      Vendored third-party CSS and icon fonts. Don't edit.
src/components/layout/        Header (variants via headerType), Footer, Footer10 (+ FooterParts), ServiceDetailsMain
src/components/sections/      Page sections, grouped by type; numbered variants (About3, About9...)
src/components/sections/dynamic|service|home|pages  Data-driven sections for the imported content (see Content import)
src/components/shared/        Cards, buttons, sliders, wrappers (ClientWrapper = all animation init)
src/data/site.json             Company, logos, contact, offices, Vision Plus, socials, footer content
src/data/pages.json             Legacy per-page hero titles (only src/app/about's old route still uses it)
src/data/pages/*.json           Real bbtech.ae content, one file per live page (see Content import below)
src/data/pages/index.js         Static registry of every src/data/pages/*.json, keyed by path (no slashes)
src/data/sections/*.json      Copy for the template's own hardcoded sections (unrelated to content import)
public/fakedata/*.json        Collection data: services + nav-items (real, from content import); team/careers/testimonials/brands (still template -- hidden, see Hidden sections)
public/images/bbtech/          Real harvested images from bbtech.ae, one subfolder per page + shared/
src/libs/get*.js              Thin getters over the JSON (getALlServices, getNavItems, getSiteConfig...)
src/libs/*Anim*.js, tj*.js    GSAP animation modules, all run from ClientWrapper
public/images, public/video   Remaining assets; most are still template stock outside public/images/bbtech/
content-import/                 Content-import working artifacts: inventory, snapshots, reports (see below)
scripts/import/                 Content-import tooling (Bun scripts, see below)
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
- Where facts conflict, don't pick one yourself unless a locked decision says otherwise —
  flag it for the owner (full breakdown: `content-import/content-conflicts.md`).
  - **Experience and phone numbers are the one exception**, resolved by the launch-completion
    task's D4 (overrides this rule for exactly these two categories): every page now reads
    a `{{facts.<path>}}` token off `src/data/site.json`'s `facts` block instead of its own
    hard-coded figure — see "Canonical facts" below. `facts._status` still flags them as
    defaults pending the client's sign-off; the underlying disagreement isn't settled, only
    centralized to one place to fix once instead of in every page's own copy.
  - **Offices:** BB Tech itself has a UAE HQ (Al Ain) and a Pakistan office (Islamabad).
    Separately, sister company **Vision Plus** has its own Lahore office (+92 numbers,
    info@visionplus.com.pk) — modeled as `site.json`'s `visionPlus` key, not as a BB Tech
    "office." (An earlier version of this repo's `site.json` incorrectly attached UAE phone
    numbers to a Lahore "office" entry; that's been fixed.)
- ISO badges shown on the live site: 45001, 27001, 14001, 9001. Only display them if the client confirms they're current.
- Spelling: US English. Brand name is always "BB Tech" (not "BBTech", "BBTECH", or "B2").

## Content import

The real site content lives in `src/data/pages/*.json` (one file per live page, mirroring
its URL path — e.g. `/services/erp/` → `src/data/pages/services/erp.json`), registered in
`src/data/pages/index.js`. Each file has `{ slug, path, source, metadata, hero, sections }`;
`sections` is an ordered array of `{ type: "richText" | "cardGrid" | "checklist" | "cta" |
"form", ... }` blocks. The template's own section components hardcode their own
`src/data/sections/*.json`, so the imported content is rendered by data-driven components
that **reuse the template's markup and classes** (`.sec-heading` + `.sub-title` eyebrow,
`h2.sec-title` with a highlight `<span>`, service-details sidebar, numbered service cards,
choose-box cards, `Cta` band, `bg-shape` tinted bands, WOW/`title-anim` animations). Plain
text walls and generic blocks are a regression: the premium template look is a requirement.

- `sections/dynamic/`: `SectionRenderer`'s 5 section types plus `textBlocks.js` (segments,
  check lists, "Label:" bold leads, images).
- `sections/service/`: the catch-all page layout (`ServicePage` → `SectionShell`,
  `SecHeading`, `ServiceSidebar` with menus from `sidebarMenus.js`, `PostDetails` for the
  two 2020 posts). `presentation.js` decides per-section layout from the JSON.
- `sections/home/` (home page) and `sections/pages/` (about-us, contact, services).
- Styles: `src/app/assets/sass/content-import/_ci-sections|_ci-home|_ci-pages|_ci-footer.scss`,
  one partial per area, tokens only. The home top bar spacing in `_ci-footer.scss` relies on
  the `#smooth-content > main` shell and the `.space-for-header` spacer; keep both.

Page JSON may carry **presentation-only keys** next to the copy (`layout`, `sidebarMenu`,
`variant`, `fit`, `mediaFit`, `mediaFrom`, `highlight`, `tabLabel`, `tabIcon`, `link`).
They pick a layout or reuse an existing live label; they never add new copy.

Routes: the 4 pages with a bespoke layout (`/`, `/about-us/`, `/contact/`, `/services/`) have
their own `src/app/**/page.js`, each importing its JSON directly and placing sections by
`variant`. Every other real page goes through the catch-all `src/app/[...slug]/page.js`, which
looks up `slug.join("/")` in the registry (`dynamicParams = false`, so anything not
registered 404s) and renders `HeroInner` + `ServicePage`.

If you need to add or change a page's content, edit its JSON (or run the import tooling
below to re-derive it) — don't hand-write JSX for it. If a new content shape doesn't fit,
extend the components above using the template's existing classes (see `DESIGN.md`) rather
than inventing new ones.

**Tooling** (`scripts/import/*.mjs`, run with `bun scripts/import/<file>.mjs`):
- `discover.mjs` — crawls bbtech.ae's sitemaps/REST API/menu, classifies every URL
  real/filler against `lib/seed-inventory.mjs`, writes `content-import/inventory.json` +
  raw snapshots.
- `harvest-assets.mjs` — downloads and converts every image a real page references into
  `public/images/bbtech/`, writes `content-import/assets-manifest.json`.
- `verify.mjs` — run after any content or rendering change. Checks route coverage, a
  per-page JSON-text-leaf coverage (every string in a page's JSON must render — this is
  the reliable number), image coverage, zero remote asset references, zero template
  residue, and internal links. Run against a production build: `bun run build && bun
  scripts/import/verify.mjs`.
- `check-page.mjs` — the same text and image checks against a running server, for a quick
  loop while editing: `bun scripts/import/check-page.mjs <slug|all> [--base=http://localhost:3000]`.
  Both scripts share `lib/text-leaves.mjs` (what counts as copy, how rendered HTML is
  normalized). Presentation may restyle copy but every JSON string must still render.

**Working artefacts** in `content-import/` (all committed except `.cache/`/`originals/`,
which are gitignored): `inventory.json`, `assets-manifest.json`, `copy-fixes.md` (every
typo fix, with page attribution), `content-conflicts.md`, `needs-client-input.md`,
`REPORT.md`, and `snapshot/` (the permanent archive of the live site's raw HTML/JSON, one
folder per page, since bbtech.ae itself won't be around forever).

## Canonical facts

`src/data/site.json`'s `facts` block is the one owner-editable source for every phone
number, email, address, hour, and experience claim; page/section JSON references a leaf
with a `{{facts.<path>}}` token (e.g. `{{facts.phonePrimary.display}}`,
`{{facts.yearsExperience}}` — the one computed field, `new Date().getFullYear() -
facts.foundedYear` rendered as "10+ years"). `src/libs/resolveFacts.js` resolves every
token in a JSON value tree; it runs in Node at module load (`src/data/pages/index.js` for
the catch-all registry, each bespoke `page.js` for `/`, `/about-us/`, `/contact/`,
`/services/`, and `getSiteConfig.js` for site.json's own chrome fields) — never in the
browser. `scripts/import/lib/text-leaves.mjs` calls the same resolver on every collected
copy string, so `verify.mjs`/`check-page.mjs` check against the resolved text
automatically; don't add a separate exceptions list when you add a new token. See
`content-import/content-conflicts.md` → "Resolved via canonical facts" for what's been
substituted and why. `facts._status` flags the current values as defaults pending the
client's sign-off (`content-import/needs-client-input.md`) — don't add a new fact without
also flagging it there if it isn't independently confirmed.

## Forms

`src/data/forms.json` lists every real form by `formId`, one entry today
(`contact-default`, the only real `<form>` in the codebase — the service-enquiry/ERP/
sidebar-widget variants an earlier plan called for were never built; see
`content-import/launch/phase-5-forms.md`). `src/components/shared/forms/ContactForm.js`
renders any of them and posts to the single `POST /api/contact` route handler
(`src/app/api/contact/route.js`, `runtime: "nodejs"` — the only server code the whole
site has, per D1). `DynamicForm.js`/`ContactFormCard.js` are thin wrappers that keep
their own card markup and delegate the `<form>` itself to `ContactForm`.

Adding a new form: add an entry to `forms.json`, a matching branch in
`src/libs/forms/schemas.js` (`FORM_SCHEMAS`) — the route handler rejects any `formId`
without one — and reuse `ContactForm` from the new section's component.

Pipeline (in order): content-type/size check → per-IP rate limit
(`src/libs/forms/spam.js`, in-memory, single-instance) → honeypot + minimum-fill-time
→ Cloudflare Turnstile (`src/libs/forms/turnstile.js`) → zod validation
(`src/libs/forms/schemas.js`, shared client+server) → SMTP send via `nodemailer`
(`src/libs/mail/transport.js`) of a Handlebars-rendered, brand-themed HTML+text pair
(`src/libs/mail/render.js`, templates in `src/emails/`) — a team notification, then a
best-effort auto-reply that never echoes the visitor's own message (anti-relay). Every
env var it needs is validated lazily by `src/libs/mail/env.js`, never at build time —
see `.env.example`. `bun run email:preview` renders every template × fixture to
`tmp/email-previews/` without needing SMTP configured; `bun run test` runs the vitest
suite (`schemas`, `spam`, `render`, the route handler with a mocked transport).

One deliberate trade-off: the minimum-fill-time check uses the client's own
`Date.now()`, not a server-signed timestamp — a determined bot could forge it, but
Turnstile is the real gate here, and this site is fully static (no per-request dynamic
endpoint to issue a signed value from without breaking D1). Handlebars partials that
need `theme` (the color tokens) inside an `{{#each}}` loop must pass it explicitly
(`theme=../theme`) — Handlebars doesn't walk up to the parent context for a bare
`{{theme.x}}` once the loop has changed `this` to the array item; see `field-row.hbs`'s
call site in `contact-notification.html.hbs` for the pattern.

## Routing, redirects, and SEO

Decision (locked): **1:1 URL parity** — every real page lives at the exact same path it had
on the live site, with `trailingSlash: true` in `next.config.js` so URLs match byte for
byte. This replaced an earlier plan to consolidate ERP/service variants under
`/services/*` slugs; that plan is no longer in effect.

- `next.config.js` `redirects()` (all `permanent: true`, emitting a 308) covers every
  filler/legacy path from `content-import/inventory.json` — named pages (testimonials,
  projects, about-us/company|team|gallery, texture_test, my-account, services/service-page)
  plus wildcard collections (`/project/:path*`, `/dt_portfolio/:path*`, `/dt_team/:path*`,
  WordPress system archives) — plus `/about/ → /about-us/` for this repo's own pre-import
  placeholder route. **Redirect `source` patterns need their own trailing slash to match
  once `trailingSlash: true` has normalized the incoming path** — a source without one
  silently never matches.
- Numeric `/services/<n>` routes are gone; `src/app/services/[id]/` was deleted (it would
  otherwise collide with the catch-all for paths like `/services/erp/`, since Next.js
  prefers a more specific single-segment dynamic route over a catch-all).
- **Metadata:** every real page's `generateMetadata`/`metadata` export reads
  `page.metadata.{title,description,canonical,ogImage}` straight from its JSON (sourced
  from the live Yoast data during import — `ogImage` was resolved to the locally-harvested
  asset, not the original remote bbtech.ae URL). Root layout sets
  `metadataBase: new URL("https://bbtech.ae")` and an `Organization` JSON-LD block from
  `site.json` + the live Yoast schema graph.
- `src/app/sitemap.js` and `src/app/robots.js` are in place, generated from the page registry.
- `/privacy-policy/` is real content (735 words, not WP boilerplate) — see
  `src/data/pages/privacy-policy.json`.

## Definition of done

1. `bun run build` passes with no new warnings.
2. `bun scripts/import/verify.mjs` (against that build) reports 0 failures if you touched
   any content/rendering code.
3. Pages you changed render correctly at desktop (≥1200px) and mobile (≤575px) in `bun run dev`,
   with no console errors and no leftover teal (`#1E8A8A`) or template copy.
4. New copy traces to the live site or to the client; no placeholders presented as real content.
5. New styles use tokens only; text contrast meets the pairs table in `DESIGN.md`.
6. Changed or added URLs are reflected in redirects, nav JSON, and footer content.

## Hidden sections (D4 — no real content exists)

Testimonials, team, careers, history, FAQ, solutions, and industries have **no real content
on the live site** (confirmed during the import: `dt_team` entries are placeholder role
names like "The Geeks", `dt_portfolio` entries are literally Lorem ipsum). Their routes are
renamed to Next.js private folders (`src/app/_team/`, `_careers/`, `_history/`, `_faq/`,
`_solutions/`, `_industries/`, `_terms-and-conditions/`) so they're non-routable; the
component code stays in place for whenever the client supplies real content. Don't re-route
them without checking `content-import/needs-client-input.md` first.

## Open decisions (ask the owner; don't decide silently)

- Should the sidebar "quick contact" form widget (present on most service pages live, with
  an extended Country/City/Company/Website variant on the ERP service page) be modeled as a
  real shared component, or does the single `/contact/` form cover it? See
  `content-import/needs-client-input.md`.
- Contact form backend (the live site uses Contact Form 7). Every form here calls
  `preventDefault()` with a `// TODO(forms): wire submission` comment; none submits anywhere.
- A logo lockup with a wordmark and a branded OG image (the repo only has the icon mark).
- `/erp/` and `/construction-management-system/` share near-identical structure/headings —
  keep both as distinct real pages (current state) or treat one as canonical?

## Don't

- Don't edit vendored files in `src/app/assets/css/` or `src/app/assets/fonts/`.
- Don't change `bun.lock` by hand or switch package managers.
- Don't delete the `#smooth-wrapper`/`#smooth-content` structure or the sticky header duplicate.
- Don't add dependencies without asking. Bootstrap, GSAP, and Swiper already cover layout, motion, and carousels.
- Don't commit secrets. There are no env vars today; if one is introduced, add `.env.example`.
