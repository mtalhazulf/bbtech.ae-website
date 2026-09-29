# Phase 4: canonical facts (D4)

## What was added

`src/data/site.json` gained a `facts` block (exact defaults from the launch-completion
brief, flagged `_status: "DEFAULTS — pending client sign-off"`) and `src/libs/resolveFacts.js`:
a small pure function that deep-walks a JSON value and replaces every `{{facts.<path>}}`
token with the matching fact, plus one computed field — `{{facts.yearsExperience}}` →
`` `${new Date().getFullYear() - facts.foundedYear}+ years` `` (10+ in 2026). It's called
in Node at module load, never in the browser:

- `src/data/pages/index.js` resolves every entry in the catch-all registry.
- Each bespoke route (`/`, `/about-us/`, `/contact/`, `/services/`) resolves its own
  directly-imported JSON, since those bypass the registry.
- `src/libs/getSiteConfig.js` resolves `site.json` itself, so its own `contact`/`header`/
  `footer` fields (now `{{facts.*}}` tokens) come out as plain values everywhere they're
  read — including `layout.js`'s Organization JSON-LD, which read `site.json` directly
  before this and would otherwise have emitted the literal token string into structured
  data (caught before it shipped, not after).
- `scripts/import/lib/text-leaves.mjs` calls the same resolver on every collected copy
  string, so `verify.mjs`/`check-page.mjs` check the *resolved* text automatically — no
  separate exceptions list to maintain when a token is added or a fact's value changes.

## What was replaced

Every hard-coded phone/email/address/hours/experience instance in `src/data` — full
before → token → after table in `content-import/content-conflicts.md` under "Resolved
via canonical facts". Summary: 4 years-of-experience variants (5/6/7/10, across
`about-us.json`, `home.json` ×3, `odoo-development.json` ×2) now all read
`{{facts.yearsExperience}}`; 3 phone-number call-sites now read `{{facts.phonePrimary}}`
or `{{facts.phoneOffice}}` depending on which of the two numbers they originally showed;
`site.json`'s own `contact`/`header`/`footer` phone/email/address/hours fields do too;
the home page's "500+ Positive Customers" line now reads `{{facts.customersClaim}}`
(same value, single-sourced). `public/fakedata/**` had nothing to replace (checked, no
hard-coded facts found there).

`(+971) 56 128 6321` (the third, unlabeled phone number, `/contact/` only): removed from
`site.json` (`contact.phoneSecondary` was dead — no component read it) but **left as a
plain literal in the page's own copy**, not tokenized — its purpose is genuinely unknown
and the facts block has no field for it; the brief's instruction to remove it applied to
chrome, and it was never actually in chrome.

`site.json`'s `offices`/`visionPlus` needed no changes — Vision Plus (Lahore) was already
modeled as a separate sister company with its own +92 numbers, and neither BB Tech office
carries a stray UAE phone number. That historical bug (noted in `AGENTS.md`) was already
fixed before this task.

## Verification

- All edited JSON files parse.
- `bun run build`: passes, 0 warnings.
- Spot-checked the built HTML directly: every `{{facts.*}}` token resolves (10+ years,
  500+, both phone numbers, all 3 emails); zero literal `{{facts` anywhere in `.next/server`.
- `bun scripts/import/verify.mjs`: **815/815** strings, 64/64 images, 0 failures — the
  resolver-aware text-leaf check passed with no manual exceptions needed, confirming the
  design goal (change a fact once, verification and rendering never disagree).
- `AGENTS.md` updated: the years/phone entries in "Known conflicts" now point at the new
  "Canonical facts" section instead of describing them as still-open; the underlying
  client sign-off is still pending, only the "which page has which number" duplication
  is gone.
