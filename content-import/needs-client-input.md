# Needs client input

Running list of items the content import surfaced that need an owner decision or real
content before launch. Updated as later phases add more. See `REPORT.md` for the full
coverage picture once Phase 7/8 land.

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
| `wp-content/uploads/2018/12/t-img047.jpg` | `/`, `/about-us/` | Hero slider background |
| `wp-content/uploads/2018/12/t-img050.jpg` | `/` | Hero slider background |
| `wp-content/uploads/2018/12/t-img054.jpg` | `/` | Hero slider background |
| `wp-content/uploads/2018/11/img062.jpg` | `/services/social-wifi/` | Background image |
| `wp-content/uploads/2018/11/s001.jpg` | `/services/` | Background image |
| `visionplus.com.pk/assets/base/img/layout/logos/logo-02.png` | `/about-us/`, `/contact/` | Vision Plus (sister company) logo, hotlinked from their site |

**Decision needed:** supply replacement images for the three hero-slider slides (currently
broken on the live site) and the two background images, and get a working Vision Plus
logo (their own site returns 404 for the one bbtech.ae links to).

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

## Forms to wire (D5)

18 `<form>` elements were detected across real pages in Phase 1 (rough count from raw
HTML — Phase 3 will extract exact fields/labels/consent text per form). None will have a
submission backend; every submit handler will call `preventDefault()` with a
`// TODO(forms): wire submission` comment. Full per-form field list lands here once Phase
3 completes.

## Hidden sections awaiting real content (D4)

Per `AGENTS.md`'s existing open decisions — carried forward, not yet re-resolved:

- **Testimonials, team profiles, careers, FAQ, brand/client logos**: the live site has no
  real content for any of these (confirmed again in Phase 1 — `dt_team` entries are
  placeholder role names like "The Geeks"/"Founder", `dt_portfolio` entries are literally
  Lorem ipsum). Staying hidden until the client supplies real people/logos/projects.
- **ERP sub-products** (ISMS, Odoo, Construction ERP): currently separate pages per the
  1:1 URL-parity decision (D2) — this supersedes the old "fold into `/services/erp`"
  question from `AGENTS.md`, which will be removed in the Phase 8 doc update.

## Conflicting facts (carried from `AGENTS.md`, reconfirmed live)

- **Phone numbers**: live top bar shows `+971 3 7555069`; `AGENTS.md` also lists
  `+971 54 405 6829` and `+971 56 128 6321` elsewhere on the site. Not resolving — each
  page keeps its own number per the "don't pick one" rule; full per-page breakdown lands
  with Phase 3/5 content extraction.
- **Years of experience**: "5 years" (About) vs "6 years" / "10 years" (home) — still
  unresolved, still present on the live site as of this crawl.
- **Offices**: Lahore address mixed with UAE phone numbers in `src/data/site.json`; Lahore
  belongs to sister company Vision Plus. Needs correcting in Phase 5.
