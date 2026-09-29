# Phase 8: final verification and independent review

Two fresh subagents reviewed the work with no context from the phases that built it — one
a security audit of the forms/mail pipeline, one a DESIGN.md compliance audit of 5 pages
not already spot-checked in this task. Findings from both were fixed and re-verified below.

## Security review (src/app/api, src/libs/forms, src/libs/mail, src/emails)

Confirmed sound, no completeness issues: the CRLF-stripping fix, the structured
`{name, address}` Reply-To fix, and the `safePageUrl` origin check from the forms commit
(all three previously found by an earlier automated review). Also checked and found
nothing beyond what's documented: Handlebars template injection (impossible — only static
files are compiled, user data is only ever bound as variables), missing output encoding
(everything auto-escapes; the one raw-HTML helper only ever emits its own escaped output),
prototype pollution, SSRF, ReDoS, and the Turnstile verification flow.

Three new findings, all fixed:

1. **Body fully buffered before the size cap was checked (high).** `request.text()` read
   and materialized the entire body before `MAX_BODY_BYTES` was ever checked — on this
   single Docker instance (D1, no load balancer), a few large-body requests could exhaust
   memory before the rate limiter or size check ever ran. Fixed: `readBodyWithLimit()`
   checks `Content-Length` first, then reads the body via a streaming reader that aborts
   the instant the byte count exceeds the cap, so an oversized body is never fully
   materialized.
2. **The rate-limit fix assumes an unenforced reverse proxy (medium/high).** The IP logic
   itself (prefer `cf-connecting-ip`, else the last `x-forwarded-for` hop) is correct only
   if the origin is genuinely unreachable except through Cloudflare — nothing in this repo
   enforces that, and the Docker image exposes port 3000 directly. This is infrastructure
   configuration, not something a code change can fix — documented as a required
   deployment step in `needs-client-input.md` ("Deployment requirement") and in the
   `clientIpFromHeaders` doc comment, rather than silently left as an implicit assumption.
3. **Uncaught exception on malformed input (low/medium).** A non-string honeypot value
   (`{"website": true, ...}`) or a JSON body that parses to `null`/an array/a primitive
   crashed the handler with a 500 instead of the API's normal 4xx contract, reachable
   before Turnstile/zod ever ran. Fixed: `looksLikeBot()` treats any non-string, defined
   `website` as bot-like instead of calling `.trim()` on it; the route now rejects any
   parsed body that isn't a plain object before touching it. 5 new tests cover both.

## DESIGN.md compliance audit (`/erp/`, `/construction-management-system/`,
`/branding-rebranding/`, `/it-outsourcing-2/`, `/privacy-policy/`)

Color tokens, contrast, component reuse, and `:focus-visible` were all already compliant
(confirmed independently, not re-fixed). Two real findings, both fixed:

1. **Heading hierarchy skips (§13 "headings in order") on 4 of 5 pages**, traced to
   `ServiceBlocks.js`'s card/tile/group renderers hardcoding their title level (h4, h5)
   regardless of what level the section heading above them actually used. This wasn't a
   per-page content bug — it was systemic in the shared renderer, so it affected far more
   than the 5 audited pages. Fixed properly rather than patched: `BlockHeading` now
   computes its own level from `context` ("main" → h3, "full" → h2, matching the one
   variant that was already doing this correctly), and every card/tile/group title
   renders exactly one level below it via a new `itemHeadingLevel()` helper — including
   the edge case where a block has no heading of its own (nothing rendered at the
   intermediate level, so items take that slot instead of skipping past it, caught by a
   full-site sweep after the initial fix, not just the 5 audited pages). Also fixed:
   `CtaSidebar`'s "Have a project for us?" widget (h4→h3) and `PostDetails.js`'s related-posts
   heading (which has no page-level h2 to nest under, unlike every other sidebar-layout
   page) via a new `headingAs` override on `PostsBlock`.
   **Verified with a full sweep, not just the 5 audited pages**: every one of the 26 real
   pages' `<main>` heading sequence was extracted from the built HTML and checked for any
   level increase greater than 1. Zero skips remain (the only page still showing a skip is
   `/about`, the dead pre-import placeholder route `next.config.js` redirects to
   `/about-us/` before it can ever render — confirmed unreachable, left as-is per AGENTS.md's
   "leave unused template code in place" rule).
2. **Icon-only controls with no accessible name (§13, §8)**: `BackToTop.js` was a
   `<div onClick>` — no role, no keyboard handler, no name, present on every page. Fixed
   to a real `<button>` with `aria-label="Back to top"` (CSS reset added to
   `_backtotop.scss` for the native button chrome, same pattern as Phase 6's header fixes).
   The header's search-submit button was missing `aria-label="Search"` (its sibling
   open/close toggles already had one — this one was missed in Phase 6).

Also fixed while investigating: `branding-concept-keywords-icons-600nw-197106008.webp`'s
alt text was just the humanized stock-photo filename ("Branding Concept Keywords Icons
600nw", including the raw "600nw" preview-size suffix) — `altSource: "generated"` (not
live-site data, so this was mine to improve, unlike the WordPress-sourced alt text on the
other flagged page, `it-outsourcing-2`, which stays as-is per the content rules). Replaced
with an actual description of the image, added to `needs-client-input.md`'s existing
vision-reviewed-alt-text table.

## Full verification

- `bun run build`: passes, 0 new warnings.
- `bun run test`: **50/50** (5 new tests from this phase's security fixes).
- `bun scripts/import/verify.mjs`: 815/815 strings, 0 failures.
- Full-site heading-order sweep (all 26 real pages' built HTML): 0 skips.
- `grep` for raw hex/rgba across every file this phase touched: 0 literals outside
  `_colors.scss` (only `tj-rgba()` token calls).
- Live browser: no new console errors on the previously-flagged pages; visually unchanged
  (heading-level changes are semantic, not visual — no CSS classes were touched on the
  affected elements).
