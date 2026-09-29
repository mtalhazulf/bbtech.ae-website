# Phase 5: forms via SMTP (D5/D6)

## Real-forms inventory (checked before writing any code)

`content-import/needs-client-input.md` already recorded, from the content-import phase,
that only **one** distinct form exists inside main page content: `contact-default` on
`/contact/` (name/email/telephone/message). The other ~17 `<form>` tags the earlier
crawl counted are all the same reusable "quick contact" sidebar widget, treated as
site-wide chrome and never imported into any page's JSON — confirmed again by grep
across `src/components` and `src/data/pages/*.json` before starting this phase: the
widget genuinely doesn't exist anywhere in this codebase yet. So D5's "each form" scope
is exactly one form. The sidebar widget stays an open decision (still recorded in
`needs-client-input.md`, "Forms" section) rather than being invented to hit a form
count.

## What was built

- `src/data/forms.json` — one entry, `contact-default`, declaring its fields and labels.
- `src/libs/forms/schemas.js` — zod v4 schema per `formId`; `validateFormSubmission()`
  returns `{success, data}` or `{success: false, fieldErrors}` from `z.flattenError()`.
- `src/libs/forms/spam.js` — `looksLikeBot()` (honeypot field + minimum fill time),
  `checkRateLimit()` (in-memory, 5 submissions / 10 min / IP — acceptable for D1's
  no-database, single-instance deployment), `clientIpFromHeaders()`.
- `src/libs/forms/turnstile.js` — `verifyTurnstile()` posts to Cloudflare's `siteverify`;
  exports the documented public test keys for local/dev use only.
- `src/libs/mail/{env,transport,render}.js` — `getMailEnv()` validates required SMTP env
  vars once and caches; `getMailTransport()` wraps `nodemailer.createTransport`;
  `render.js` compiles each `.hbs` template once (cached) with Handlebars, then
  `juice`-inlines the CSS for HTML-email-client compatibility, and separately renders a
  plain-text sibling (`.txt.hbs`) — no HTML-to-text guessing.
- `src/emails/` — `theme.json` (brand colors/fonts for templates), a `base.hbs` layout,
  shared partials (`preheader`, `header`, `footer`, `button`, `field-row`), and the two
  real templates: `contact-notification` (to `MAIL_TO`, `Reply-To` the visitor, one
  `field-row` per submitted field, full message body) and `contact-autoreply` (to the
  visitor, branded, **never echoes their message** — see D5.4 below).
- `src/app/api/contact/route.js` — the one Route Handler this task's D1 allows.
  `runtime = "nodejs"` (nodemailer needs `net`/`tls`), `dynamic = "force-dynamic"` (per-IP
  rate-limit state must never be statically evaluated). Pipeline, in order: content-type
  check → body-size cap (20 KB) → rate limit (429 + `Retry-After`) → honeypot/fill-time
  (bot gets a silent 200, nothing sent) → Turnstile verify → zod validation (422 +
  per-field errors) → team notification send (failure → 502, since the notification *is*
  the point of the form) → best-effort auto-reply (failure only logged, never fails the
  request) → structured single-line log per outcome (formId + outcome + duration; no
  message bodies, emails, or phone numbers logged).
- `src/components/shared/forms/Turnstile.js` — explicit-render widget wrapper. Renders
  nothing and logs a warning if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset (expected until
  the client supplies real keys) instead of crashing; the server still fails closed on
  submission either way.
- `src/components/shared/forms/ContactForm.js` — client logic: honeypot field, fill-time
  timestamp, Turnstile token wiring, client-side validation mirroring the server schema
  for instant feedback, submit/error/success states, `aria-invalid`/error-text per field.
- `ContactFormCard.js` and `DynamicForm.js` now both delegate to `ContactForm` instead of
  each hand-rolling a form with a `// TODO(forms)` stub.
- `_ci-pages.scss` — honeypot (visually hidden, still in the tab/AT order per WCAG so a
  screen-reader-driven bot-check would need the field described, but it's `aria-hidden`
  with a decoy label so real assistive tech skips it), Turnstile container sizing, status
  banner, field-error text, `:disabled` button state — tokens only.
- `.env.example` — every var `getMailEnv()`/Turnstile/the route need, with comments.
  `.gitignore`/`.dockerignore` updated so no real `.env` can be committed or baked into
  the image; `Dockerfile` gained the one `ARG`/`ENV` a client build needs at build time
  (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` — a `NEXT_PUBLIC_*` var is inlined at build, not
  read at runtime).
- `next.config.js` — added a `headers()` block: CSP plus standard security headers
  (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, etc). The CSP needs
  `'unsafe-inline'` (React's inline `style=` props, used throughout, with no nonce
  plumbing in this template) and `'unsafe-eval'` (GSAP's ScrollSmoother/SplitText call
  `new Function()` internally — confirmed live, see below) — both documented inline as
  deliberate, tested trade-offs, not oversights.
- Tests: `schemas.test.js`, `spam.test.js`, `render.test.js`, `route.test.js` — 41 tests,
  covering valid/invalid submissions, honeypot/fill-time/rate-limit rejection, template
  rendering with the fixtures in `src/emails/fixtures/` (including a "hostile" fixture
  with HTML/CRLF in every field, to prove escaping holds), and the route's full
  success/failure branches with the mail transport stubbed. `vitest.config.mjs` aliases
  `@/` → `src/` (vitest doesn't read `jsconfig.json` paths).
- `scripts/email/preview.mjs` + `"email:preview"` script — renders both templates from
  their fixtures to `tmp/email-previews/*.html` for a fast visual loop without sending
  real mail or needing a local SMTP server.

## D5.4 (auto-reply never echoes the message) and other deliberate choices

- The auto-reply only ever includes the visitor's **first name**, extracted defensively
  (`firstNameFrom()` strips HTML tags and URLs, caps at 40 chars) — never the message
  body, so the auto-reply can't be turned into an open relay for arbitrary attacker text.
- CRLF/header injection: every value that lands inside an email header (Subject,
  Reply-To display name) is stripped of `\r`/`\n` before use (`stripHeaderUnsafe`).
- Handlebars auto-escapes `{{value}}` by default (confirmed via the hostile fixture test)
  — the one place raw HTML is intentionally emitted (`{{nl2br message}}`) goes through
  `Handlebars.Utils.escapeExpression` first, then a `Handlebars.SafeString` wraps only
  the `<br>` substitution, not the escaped text itself.
- Bug caught during manual template testing: `{{#each fields}}{{> field-row}}{{/each}}`
  rendered every field row colorless, because Handlebars doesn't walk up to the parent
  context for a bare `{{theme.x}}` reference once `this` changes inside an `#each`.
  Fixed by passing `theme=../theme` explicitly at the partial call site
  (`contact-notification.html.hbs`).
- Rate limiting is in-memory per D1 (no database) — acceptable for a single-instance
  `next start` deployment (this Docker image), resets on redeploy; documented as a known
  limitation rather than a gap, since a persistent store would violate D1.
- Turnstile timestamp/nonce isn't independently signed beyond what Cloudflare's
  `siteverify` itself returns — an accepted trade-off, since adding our own signing would
  need a secret-rotation story this task's scope doesn't cover.

## Known gaps (flagged, not hidden)

- **No live SMTP/Turnstile credentials exist in this environment.** Verified as much of
  the pipeline as possible without them (see below); real end-to-end delivery needs the
  client-supplied values in `.env` (see `needs-client-input.md`, updated this phase).
- **Docker + Mailpit end-to-end test was not run** — this machine's Docker daemon isn't
  running, and starting it was outside this task's scope. Fell back to the task brief's
  own permitted alternative: the preview script + a stubbed-transport test suite, plus
  real live-browser client-side testing of the form (below).
- **The sidebar "quick contact" widget stays unbuilt** — still an open decision, not a
  Phase 5 regression (see `needs-client-input.md`).

## Verification

- `bun run build`: passes, 0 new warnings. `/api/contact` correctly listed as
  `ƒ (Dynamic)` (not prerendered — it has per-request rate-limit state).
- `bun run test`: **41/41 passing**.
- `bun scripts/import/verify.mjs` (against the build): 815/815 strings, 0 failures — the
  forms/CSP changes touch no page copy.
- Live browser, `/contact/` at 320px width: no overflow, honeypot invisible, Turnstile
  placeholder renders (test env has no site key — confirmed the component degrades to
  "disabled, warn, still submittable" rather than crashing, per its fail-closed design).
- Live browser functional pass: filled all four fields, clicked submit. Confirmed (a)
  client-side validation correctly blocked the request with "Please fix the highlighted
  fields." because no Turnstile token exists without a real site key, (b) **zero**
  `/api/contact` network calls fired before validation passed — the client never
  short-circuits past Turnstile, even for a well-formed submission.
- Caught and fixed live: a Content-Security-Policy console violation from an inline
  `eval`/`new Function()` call inside a Next.js chunk — traced to GSAP, not to this
  phase's own code; added `'unsafe-eval'` to the CSP with an inline comment recording why.
- Caught and fixed live: an unhandled promise rejection from Turnstile
  (`Invalid or missing type for parameter "sitekey"`) when the env var is unset — fixed
  in `Turnstile.js` (see above).
