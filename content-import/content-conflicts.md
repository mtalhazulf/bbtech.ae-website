# Content conflicts

Facts that differ across pages on the live site, collected verbatim during Phase 3
extraction. Per D6, none of these are resolved or picked — each page keeps its own
version in `src/data/pages/`. This file is the cross-page view for the client to reconcile.

## Years of experience

The live site states **four different figures** depending on the page:

| Page | Claim |
|---|---|
| `/about-us/` | "over 5 years" |
| `/` (home) | "over 6 years" |
| `/odoo-development/` | "more than 7 years" |
| `/` (home) | "10 Years of Experience" |
| `/` (home) | "Over 10 years of domain experience" |

This extends the conflict already known from `AGENTS.md` (which only had 5/6/10) — the
Odoo page's "7 years" is a new instance found during this crawl. Third-party listings put
the founding year at 2016, which is ~10 years ago from today, but the client should
confirm which figure (if any) is correct.

## Phone numbers

| Page | Number | Context |
|---|---|---|
| `/about-us/` | (+971) 54 405 6829 | "call ... or complete our online inquiry form" |
| `/contact/` | (+971) 3 755 5069 | Primary contact number |
| `/contact/` | (+971) 56 128 6321 | Secondary contact number |
| `/contact/` | +92 300 4320015 / +92 321 8099577 | Listed under the Pakistan/Vision Plus office |

Matches the three UAE numbers already known from `AGENTS.md`, plus the Pakistan numbers
tied to the Vision Plus sister-company block on `/contact/`.

## Addresses

| Page | Address | Notes |
|---|---|---|
| `/contact/` | AL HILI INDUSTRIAL AREA, AL AIN, UAE, P.O # 202135 | Head office (UAE) |
| `/contact/` | Khiyaban-e-Faiz, H-13, street no#3, Ali block, Near Bread and Cake Bakery, Islamabad, Pakistan | **New** — not previously documented in `AGENTS.md`, which only mentioned the Lahore address |
| `/contact/` | 574, Block G1 Phase 2, Johar Town, Lahore | Matches `AGENTS.md`'s known Vision Plus/Lahore mix-up in `site.json` |

`/contact/` now shows **three** offices (Al Ain, Islamabad, Lahore) under what `site.json`
currently treats as a two-office setup with UAE phone numbers on the Pakistan address —
needs correcting in Phase 5, and the client should confirm which Pakistan office (or
both) is current for Vision Plus.

## Client / project count stats (home page only — not really conflicting, just numerous)

The home page cites a different client count per industry/section; listed here for
reference since they all appear on the same page and aren't inconsistent with each other,
just worth knowing they're all real, distinct figures: "More then 30 plus Clients", "60
plus factories as clients", "35 plus transport companies as client", "12 Clients", "25
Plus clients", "120 Plus Clients", "35 Clients", "60 Plus Clients", "Over 500+ Positive
Customers", "27 Clients".

## Resolved via canonical facts (Phase 4, launch-completion)

The two conflicts above (years of experience, phone numbers) are no longer "logged, not
resolved" — the launch-completion brief's D4 explicitly overrides D6 for exactly these
categories: `src/data/site.json`'s new `facts` block is now the single source, referenced
from page JSON as a `{{facts.<path>}}` token and resolved at build time
(`src/libs/resolveFacts.js`, applied in `src/data/pages/index.js` and each bespoke
`page.js`). `facts._status` is flagged `"DEFAULTS — pending client sign-off"`; the values
below are the launch-completion brief's own pre-approved defaults, not a value I chose.
Every substitution, verbatim:

| File | Old | Token | Rendered |
|---|---|---|---|
| `about-us.json` | "for over 5 years." | `for {{facts.yearsExperience}}.` | "for 10+ years." |
| `about-us.json` | "call (+971) 54 405 6829 or complete" | `call {{facts.phonePrimary.display}} or complete` | "call +971 54 405 6829 or complete" |
| `home.json` | "for over 6 years, BBTECH" | `for {{facts.yearsExperience}}, BBTECH` | "for 10+ years, BBTECH" |
| `home.json` | "10 Years of Experience" | `{{facts.yearsExperience}} of Experience` | "10+ years of Experience" |
| `home.json` | "More than one decades of service excellence…" | `{{facts.yearsExperience}} of service excellence…` | "10+ years of service excellence…" |
| `home.json` | "Over 10 years of domain experience…" | `{{facts.yearsExperience}} of domain experience…` | "10+ years of domain experience…" |
| `home.json` | "– Over 500+ Positive Customers –" | `– Over {{facts.customersClaim}} Positive Customers –` | "– Over 500+ Positive Customers –" (unchanged value, now single-sourced) |
| `odoo-development.json` (description + subtitle) | "experience of more than 7 years." | `experience of {{facts.yearsExperience}}.` | "experience of 10+ years." |
| `contact.json` | "(+971) 3 755 5069\n(+971) 56 128 6321" | `{{facts.phoneOffice.display}}\n(+971) 56 128 6321` | "+971 3 755 5069 / (+971) 56 128 6321" |
| `contact.json` ×3 | `info@bbtech.ae`, `muhammad@bbtech.ae`, `director@bbtech.ae` (text + `mailto:` href) | `{{facts.emailPrimary}}` / `{{facts.emailSupport}}` / `{{facts.emailDirector}}` | unchanged values (the `mailto:Director@` href's stray capital is now normalized to lowercase — cosmetic, mail is case-insensitive) |
| `site.json` | `contact.phone`, `header.variantPhone` | `{{facts.phoneOffice.*}}` | "+971 3 755 5069" |
| `site.json` | `footer.phone` | `{{facts.phonePrimary.*}}` | "+971 54 405 6829" |
| `site.json` | `contact.email`, `.directorEmail`, `.supportEmail`, `.location`, `.hours` | `{{facts.emailPrimary}}` / `.emailDirector` / `.emailSupport` / `.addressHQ` / `.hours` | unchanged values |

**`(+971) 56 128 6321` is intentionally still a plain literal**, not a fact token: per the
brief's own instruction ("remove it from chrome unless its purpose is known"), it isn't in
chrome at all — it was only ever unused dead data on `site.json.contact.phoneSecondary`
(now deleted) and this one line of `/contact/` page copy, where the live site lists it
right next to the office number with no distinguishing label. Its purpose is genuinely
unknown, so it's kept (real content, not chrome) but not promoted to a fact.

**`site.json`'s `offices` array and `visionPlus` block needed no fix**: contra the "Phase 5"
note above, they already model Vision Plus (Lahore, its own +92 numbers) as a sister
company separate from BB Tech's own two offices, and neither BB Tech office carries a
Pakistan-office-with-a-UAE-phone-number bug — that historical issue was already corrected
before this task.

## Content-accuracy issue (not a numeric conflict, but related)

See `needs-client-input.md` — `/about-us/` contains literal leftover boilerplate from an
unrelated UK-based IT support company's template ("...a strong customer base across the
UK", references to "B2" as the company name). Not logged here since it isn't a
conflicting *fact* so much as wrong content, but it directly touches the same paragraph
as the (+971) 54 405 6829 phone number above.
