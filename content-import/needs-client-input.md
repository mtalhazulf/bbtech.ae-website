# Needs client input

Running list of items the content import surfaced that need an owner decision or real
content before launch. Updated as later phases add more. See `REPORT.md` for the full
coverage picture once Phase 7/8 land.

## ⚠️ Wrong-company boilerplate on `/about-us/`

Three sentences in the live `/about-us/` page's main content read as leftover template
copy from an **unrelated UK-based IT support company**, never fully swapped out for BB
Tech:

> "Operating 24 hours a day B2 provide a bespoke range of managed, hosted and support
> services..." / "...allowed us to win, keep and grow a strong customer base across the
> **UK**..." / "For more information ... at **B2**, or to speak to a business information
> technology expert..."

"B2" doesn't match the company's real name (BB Tech / Binary Bridge Technology Services),
and "UK" contradicts a UAE company. Per the verbatim-copy rule this was **not** rewritten
or removed — it's copied through exactly as it appears live, in
`src/data/pages/about-us.json` — but it should not ship without the client rewriting that
paragraph. This is the single highest-priority item in this file.

## Naming mismatch: "Digital Marketing" card vs "Social Media Marketing" page

The `/services/` hub card is labeled "Digital Marketing", but it links to
`/services/social-media-marketing/`, whose own title/H1 is "Social Media Marketing". Both
are real, live labels — not fixing silently. `public/fakedata/services.json` uses the
destination page's own title ("Social Media Marketing") since that's what the page is
actually about; flagging the mismatch in case the client wants the hub card relabeled to
match, or vice versa.

## Duplicate / overlapping content

- **`/erp/` vs `/construction-management-system/`**: near-identical structure on the live
  site — both share the headings "TOP Reasons to have Construction ERP", "...cloud based
  web system with the following key features", and "ONE STOP SOLUTION FOR UNLIMITED
  EMPLOYEES". Both are being imported as distinct real pages per the seed inventory, but
  this looks like the same content published twice under two URLs. **Decision needed:**
  keep both as-is (matches live site), or treat one as canonical with the other pointing
  to it?
- **`/it-outsourcing/` vs `/it-outsourcing-2/`**: confirmed different copy (285 vs 403
  words) — importing both as instructed. `-2` is the current/longer version; `/it-outsourcing/`
  is older and shorter. Flagging in case the client wants the older one retired instead of
  imported.
- **`/social-wifi/` vs `/services/social-wifi/`**: confirmed different copy (360 vs 512
  words). The live nav only links `/social-wifi/`; `/services/social-wifi/` is orphaned
  (in the sitemap, not linked anywhere). Importing both since content differs, but the
  orphaned one may be stale.

## Assets that failed to download (dead links on the live site itself)

These URLs 404 directly on bbtech.ae (verified independently with curl, not a crawler
issue) — the live site is currently serving broken images at these spots. Per the import
brief, no template stock was substituted; the corresponding pages will simply be missing
these images until real replacements are supplied.

| URL | Used on | Likely role |
|---|---|---|
| `wp-content/uploads/2018/12/t-img047.jpg` | `/`, `/about-us/` | Stale Slider Revolution admin thumbnail (see note below) |
| `wp-content/uploads/2018/12/t-img050.jpg` | `/` | Stale Slider Revolution admin thumbnail |
| `wp-content/uploads/2018/12/t-img054.jpg` | `/` | Stale Slider Revolution admin thumbnail |
| `wp-content/uploads/2018/11/img062.jpg` | `/services/social-wifi/` | Background image |
| `wp-content/uploads/2018/11/s001.jpg` | `/services/` | Background image |
| `visionplus.com.pk/assets/base/img/layout/logos/logo-02.png` | `/about-us/`, `/contact/` | Vision Plus (sister company) logo, hotlinked from their site |

**Correction:** the three `t-img0*.jpg` files are the home hero slider's `data-thumb`
attribute (a Slider Revolution admin-panel thumbnail reference) — they are **not** what
actually displays. Each slide has a separate, live `<rs-bg-elem>` background layer with a
working image, which the import correctly used instead
(`depositphotos-12286955-...-technology-in-the-hands.webp`,
`Binary-Bridge-Technology-services.png`, `social-media-3070331_1280-...-Copy.jpg` for
slides 1–3). The hero slider is not actually missing any imagery; only the admin-only
thumbnail references are dead. No decision needed here.

**Decision needed:** supply replacement images for the two dead background images above
(`/services/social-wifi/` and `/services/`), and get a working Vision Plus logo (their own
site returns 404 for the one bbtech.ae links to).

## Generated alt text to review

29 of 64 harvested images had no usable alt text from WordPress or the page markup, so
alt text was generated — either from a descriptive filename (24 images) or, where the
filename was uninformative (a stock-photo ID or hash), from actually looking at the image
(5 images, marked below). All are `altSource: "generated"` in `assets-manifest.json`;
please review for accuracy before launch. The 5 vision-reviewed ones:

| File | Generated alt |
|---|---|
| `services/graphic-design/2172250.webp` | Illustration of a design team collaborating around a giant lightbulb with design tool icons |
| `services/ee649a989e3ceecbd4d46f9aeefd7d94.webp` | Doctor with a microscope icon |
| `services/fotolia-194190212-subscription-monthly-m-1024x512-1.webp` | Healthcare technology collage showing digital health records, telemedicine devices, and medical staff |
| `services/istockphoto-1353929637-612x612-1.webp` | Film clapperboard held in front of a video camera on a production set |
| `services/istockphoto-1648044864-612x612-1.webp` | Hands typing on a laptop with digital marketing icons overlaid |

Also worth a look: the 4 ISO badges (45001/27001/14001/9001) all carry the **same**
WordPress alt text, "ISO Certifications" — real source data, correctly carried over per
the alt-text priority order, but not distinguishing one badge from another for screen
reader users. Consider asking the client to set badge-specific alt text in WordPress (or
approve us overriding it locally).

## ISO badge confirmation

The live site displays ISO 45001, 27001, 14001, and 9001 badges on `/` and `/about-us/`.
Per `AGENTS.md`, these should only ship if the client confirms the certifications are
still current.

## Missing or truncated meta descriptions

10 of 26 real pages have **no** meta description in WordPress/Yoast at all (not
truncated — entirely absent): `/adhics-medical-inspection-consultancy/`,
`/branding-rebranding/`, `/cloud-computing-services/`, `/contact/`,
`/healthcare-and-medical-centre-software-services/`, `/it-outsourcing-2/`,
`/network-solutions/`, `/privacy-policy/`, `/services/erp/`, `/video-photography/`. Per
the brief we're keeping these as-is (absent) rather than writing new copy — flagging so
the client can add real descriptions in WordPress before the old site goes away (the
snapshot is otherwise the only record).

## Forms — wired (D5, launch-completion), sidebar widget still not rebuilt

Phase 3's per-page extraction found only **one** distinct form actually inside main page
content: `contact-default` on `/contact/` (4 fields). Phase 1's rough count of 18
`<form>` tags was almost entirely the **same reusable sidebar widget** ("Have a project
for us? Get in touch!" — name/email/telephone/message) repeated across most service
pages (`adhics-medical-inspection-consultancy`, `cloud-computing-services`,
`healthcare-and-medical-centre-software-services`, `it-outsourcing-2`,
`network-solutions`, `privacy-policy`, `services/mobile-app-development`,
`services/social-media-marketing`, `services/web-development`, `video-photography`,
`school-system-isms`, and others), plus a longer variant with
Country/City/Company/Website fields on some pages. These were treated as **site-wide
chrome** (like the header/footer) and excluded from each page's own JSON, consistent with
how the header/footer/nav are handled separately.

**`/contact/`'s form now sends real email** (SMTP + Turnstile + rate-limit + honeypot —
see `AGENTS.md` "Forms" and `content-import/launch/phase-5-forms.md`) — the `// TODO
(forms)` stub is gone. **The sidebar widget was never rebuilt as a real component** (it
still doesn't exist anywhere in the codebase, confirmed again during Phase 5) — the
decision below is still open, and would need its own `data/forms.json` entry + zod
schema, not a code change to the pipeline itself, once decided:

**Decision needed:** should this "quick contact" sidebar form be modeled as a real
shared component (so it renders on the service pages that had it live) instead of being
dropped?

## Hidden sections awaiting real content (D4)

Per `AGENTS.md`'s existing open decisions — carried forward, not yet re-resolved:

- **Testimonials, team profiles, careers, FAQ, brand/client logos**: the live site has no
  real content for any of these (confirmed again in Phase 1 — `dt_team` entries are
  placeholder role names like "The Geeks"/"Founder", `dt_portfolio` entries are literally
  Lorem ipsum). Staying hidden until the client supplies real people/logos/projects.
- **ERP sub-products** (ISMS, Odoo, Construction ERP): currently separate pages per the
  1:1 URL-parity decision (D2) — this supersedes the old "fold into `/services/erp`"
  question from `AGENTS.md`, which will be removed in the Phase 8 doc update.

## Conflicting facts

See `content-conflicts.md` for the full per-page breakdown (years of experience: now
**four** different figures including a newly-found "7 years" on `/odoo-development/`;
phone numbers; and a newly-found **third office address** in Islamabad, Pakistan on
`/contact/` in addition to the Lahore/Vision Plus one already known from `AGENTS.md`).
