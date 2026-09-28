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

## Content-accuracy issue (not a numeric conflict, but related)

See `needs-client-input.md` — `/about-us/` contains literal leftover boilerplate from an
unrelated UK-based IT support company's template ("...a strong customer base across the
UK", references to "B2" as the company name). Not logged here since it isn't a
conflicting *fact* so much as wrong content, but it directly touches the same paragraph
as the (+971) 54 405 6829 phone number above.
