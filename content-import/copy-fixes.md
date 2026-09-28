# Copy fixes

Every typo fix applied during Phase 3 content extraction, per D6 (fix only unambiguous
spelling errors; log every fix). Wording, grammar, and word-choice issues were **not**
touched — see the warnings noted per-page in `REPORT.md` for those (they're flagged, not
silently corrected).

| Page | Original | Fixed |
|---|---|---|
| `/` | intigration | integration |
| `/` | Megento | Magento |
| `/` | wil | will |
| `/` | Construction Industires | Construction Industries |
| `/` | Consultancy Compnies | Consultancy Companies |
| `/` | 27 Clinets | 27 Clients |
| `/` | 60 plus factories as clinets | 60 plus factories as clients |
| `/` | SOCIAL MEDIA MARKEETING | SOCIAL MEDIA MARKETING |
| `/about-us/` | Intigration | Integration |
| `/erp/` | vehicles tacking | vehicles tracking |
| `/services/erp/` | vehicles tacking | vehicles tracking |
| `/school-system-isms/` | Managment | Management |
| `/school-system-isms/` | Minuates | Minutes |
| `/school-system-isms/` | Assests | Assets |
| `/school-system-isms/` | Powerfull | Powerful |

**Total: 15 fixes across 6 pages.** All other real pages had zero unambiguous spelling
errors (verified explicitly by each page's extraction agent, not just unreported).

## Deliberately NOT fixed (wording/grammar, not spelling)

Per D6, only unambiguous *spelling* errors are corrected — grammar, word choice, and
ambiguous wording are left verbatim even when clearly awkward. Flagging the more
noticeable ones here since they read oddly but are intentional per the source-fidelity
rule:

- `/` — "Don't decrease there goal. Increase the effort!" (there/their)
- `/about-us/` — see `needs-client-input.md`: this page also contains leftover copy from
  a different company's template, not just a wording slip.
- `/erp/`, `/services/erp/` — "Every department of an enterprise are related...", "These
  problems is solved by..." (subject/verb agreement)
- `/it-outsourcing/` — "off to experts enhanced efficiencies", "are tactfully designed
  enables the client" (awkward original phrasing)
- `/school-system-isms/` — "ISMS is is also an excellent..." (duplicated word); "Principle
  message" (likely means "Principal", but "principle" is a valid word — homophone
  confusion, not a broken spelling)
- `/services/mobile-app-development/` — "should compliment your website" (likely means
  "complement", but "compliment" is valid — usage choice, not misspelling)
- `/services/social-media-marketing/` — "Search Engine Optimization now cover" (agreement);
  "Social media a platform where..." (missing verb); "an impress cookie in your pocket"
  (odd but valid-word phrasing)
