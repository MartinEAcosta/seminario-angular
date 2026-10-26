---
target: src/app/teacher-request/pages/become-teacher-page
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:C:\\Users\\marti\\Desktop\\Personal\\AprendiendoAngularSeminario\\seminario-angular\\src\\app\\teacher-request\\pages\\become-teacher-page"
timestamp: 2026-10-22T15-33-49Z
slug: src-app-teacher-request-pages-become-teacher-page
closed: true
---
Method: dual-agent (A: design-review general-purpose agent · B: detector+browser-evidence general-purpose agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Category-fetch failure invisible; no in-flight/disabled state on submit |
| 2 | Match System / Real World | 4 | Consistent voseo Spanish, correct domain terms throughout |
| 3 | User Control and Freedom | 3 | Esc closes dropdown, retry exists; no save/exit mid-form |
| 4 | Consistency and Standards | 1 | 3 different button radii for one role (10px/20px/1.5rem); `scale()` hover reintroduced despite DESIGN.md retiring it elsewhere |
| 5 | Error Prevention | 2 | Field validation solid; unsatisfiable-required-field case (empty categories) has zero warning |
| 6 | Recognition Rather Than Recall | 3 | Roadmap sidebar aids memory; dropdown trigger truncates selection to unreadable ellipsis |
| 7 | Flexibility and Efficiency | 2 | No select-all/clear-all, no shortcuts |
| 8 | Aesthetic and Minimalist Design | 3 | Clean overall; raw `rgba(0,0,0,…)` blacks sit beside tokenized ink colors |
| 9 | Error Recovery | 2 | Field errors well-messaged; the one error that matters most (no categories) has none |
| 10 | Help and Documentation | 1 | "términos para profesores" is a styled but non-functional `<span>` — dead consent link |
| **Total** | | **23/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Mixed, leaning generic-SaaS where it matters most. The page shell (room alternation, voseo copy, token-based spacing) is clearly authored for Udemix. But the two places this feature had to invent new UI — form inputs and the status screen — fall back to patterns DESIGN.md doesn't own:
- Form text inputs (`teacher-request-form.component.scss:71-78`, `border-radius: 10px`, `border: 1px solid rgba(40,40,40,0.25)`) are a third, undocumented input dialect. DESIGN.md defines exactly two (dark boxed `input-auth`, light borderless `input-inline`); this matches neither.
- `category-multiselect-dropdown` is a near-verbatim copy of the pre-existing `category-select` component, carrying forward its pre-DESIGN.md styling (raw blacks, `0.6rem` radius) into new, spec-tracked work instead of reconciling it.
- Biggest miss: DESIGN.md names "pase de profesor" *by name* as a case for the signature Tarjeta-Ticket motif. The status screen instead renders a bare flex column with a raw emoji in a circle — the one screen that should feel like "the thing you get" reads like a toast notification.

**Deterministic scan (Assessment B, CLI `impeccable detect --json src/app/teacher-request`):** 21 advisory findings (exit 0), all design-token drift — no structural antipatterns:
- 5× `design-system-color`: raw `rgb(0,0,0)` / `rgba(0,0,0,…)` in `category-multiselect-dropdown.component.{html,scss}` and 3 spec-imported html files — **directly corroborates** the LLM's "raw black beside tokenized ink" finding.
- 5× `design-system-radius`: `0.6rem` (×2, dropdown + become-teacher-page.component.scss:142) and `10px` (×3, teacher-request-form.component.scss:74/123/185) — **corroborates** the LLM's button/surface radius-inconsistency finding with exact locations.
- 8× `design-system-font-size`: hardcoded sizes (`0.85rem`, `0.9rem`×2, `0.75rem`, `1.2rem`, `1.5rem`, `0.875rem`) across all four new files instead of the `$text-*` fluid scale — a drift the LLM review didn't catch, now confirmed with file:line.
- 4 of the 21 are computed-color findings on container elements (form/div/h1) that may reflect inherited default black rather than an authored override; flagged by B as possible false positives, not confirmed either way.

**Visual overlays:** Overlays are not available to view live in a browser tab — the live-server session was already stopped and the tab closed as part of Assessment B's run. Its injected in-page detector did report, independently of the CLI scan, **10 `low-contrast` findings below the 4.5:1 WCAG AA threshold**, concentrated on exactly the brand teal (`#00788c`) and secondary grays used for labels, hints, and the "términos" link — on both the dark sidebar and the light form panel (e.g. `#00788c` on `#0e1a1a` = 3.4:1, `#00788c` on `#e9e9e9` = 4.3:1, `#7f7f7f` on `#e9e9e9` = 3.3:1). This substantiates Assessment A's accessibility concerns with hard numbers the static review couldn't produce. One `overused-font` finding (Montserrat at 98% of text) is almost certainly a false positive here: DESIGN.md's own typography system deliberately keeps the display font to under 1% of text, by design, not by accident.

Caveat on evidence quality: Assessment B's mobile-width screenshot never actually changed viewport (`resize_window` reported success but `window.innerWidth` stayed at 1920px both times) — there is no genuine mobile-viewport evidence from this run, only two near-identical desktop captures.

## Overall Impression

The shell is on-brand; the net-new UI inside it is not. Every place this feature had to invent something — inputs, a dropdown, a status card — reached for generic or copy-pasted patterns instead of DESIGN.md's own vocabulary, and the one screen the design system explicitly names for this exact feature (the ticket-card for "pase de profesor") goes unused. Layered on top: a required field that can silently become impossible to satisfy in the no-backend scenario `PRODUCT.md` calls the most likely evaluation condition, a dead consent link, invisible keyboard focus on radio cards, and ten confirmed sub-threshold contrast pairs. The single biggest opportunity is the status screen — it's the emotional peak of the whole flow and currently has the same visual weight as a toast.

## What's Working

- **Copy is uniformly strong voseo Spanish** ("Enseñá lo que sabés", "Contanos sobre vos") — matches `PRODUCT.md`'s stated brand voice with no drift to neutral Spanish anywhere in the feature.
- **Room discipline holds at the page-shell level** — the two-column layout correctly assigns `#0e1a1a` to the dark roadmap side and papel-hueso to the light form side, reusing the shared header-overlay mixin faithfully from `auth-layout`.
- **Status icons differentiate by shape, not only color** (⏳ / ✓ / ✕), so pending/approved/rejected survives for colorblind users even where the fill colors are otherwise correctly semantic-only.

## Priority Issues

**[P0] Required category field can become permanently unsatisfiable, silently**
Why it matters: `CategoryService.getAllCategories` swallows HTTP errors via `catchError(() => of([]))`; the form template only branches on `isLoading()`, never on an error state, feeding `categoriesResource.value() ?? []` straight into the dropdown. Without a backend — the scenario `PRODUCT.md` names as most likely during evaluation — the dropdown opens empty, the required "Área de enseñanza" field can never validate, and the user sees only the generic "Elegí al menos un tema" hint with no indication the real cause is a failed network call. Violates Product Principle 3 ("Degradar con dignidad sin backend"): this degrades as a silent dead end, not a legible decision.
Fix: surface `categoriesResource.error()` and render an explicit "No pudimos cargar las categorías — reintentar" affordance.
Suggested command: /impeccable harden

**[P1] Ten confirmed WCAG AA contrast failures, concentrated on the brand teal and secondary grays**
Why it matters: live in-page detector found 10 text/background pairs under 4.5:1 (e.g. `#00788c` on `#0e1a1a` = 3.4:1; `#00788c` on `#e9e9e9` = 4.3:1; `#7f7f7f` on `#e9e9e9` = 3.3:1) across the step labels, section hints, char counter, and the "términos" link — low-vision users can't reliably read exactly the elements carrying the most information.
Fix: darken/lighten the affected teal and gray tokens for this feature's text roles until all pairs clear 4.5:1, or move those roles to a token that already clears it elsewhere in the system.
Suggested command: /impeccable audit

**[P1] Consent link to "términos para profesores" is visually a link but structurally dead**
Why it matters: `teacher-request-form.component.html:102` is a plain `<span class="link-terms">`, styled teal-and-underlined exactly like a working link, with no `href`/`routerLink`/click handler anywhere in the component. The user is visually invited to read terms they are asked to agree to, and cannot open them.
Fix: wrap in a real `<a>`/`routerLink` to an actual terms page, or drop the link styling if no such page exists yet.
Suggested command: /impeccable harden

**[P1] Signature Tarjeta-Ticket motif skipped on the one screen DESIGN.md names it for**
Why it matters: DESIGN.md explicitly calls out "pase de profesor" as a case for the ticket-card pattern ("acceso adquirido"). `teacher-request-status.component.html` instead renders a bare flex column with a 40px emoji badge — the emotional peak of the whole application flow gets the same visual weight as every other state, and the feature's biggest specificity gap is also its easiest fix, since the component already exists elsewhere in the codebase.
Fix: reuse the ticket-card shell (sello circular, perforation band, festón) for this screen, varying only the sello icon/color by status.
Suggested command: /impeccable polish

**[P1] Invisible keyboard focus on the experience-level radio cards**
Why it matters: the native `<input type="radio">` is hidden with `opacity: 0` inside `.option-experience-level`, and no `:focus-visible`/`:focus-within` rule exists on the wrapping label. A keyboard-only user tabbing through "Experiencia enseñando" gets zero visible indication of which option is focused. WCAG 2.4.7 failure on a form `PRODUCT.md` says must withstand real use.
Fix: add a focus-ring rule on `.option-experience-level:has(:focus-visible)` (or equivalent) using the system's existing focus-ring token.
Suggested command: /impeccable harden

## Persona Red Flags

**Jordan (First-Timer):** The sidebar roadmap visually promises 4 discrete steps, but only step 1 is interactive — steps 2-4 are static future-state copy. A first-timer may reasonably expect progressing through the form unlocks more of the roadmap, and be confused that it's actually one continuous scroll with no pagination.

**Sam (Accessibility-Dependent User):** Two confirmed failures stack here: the invisible radio-card focus state above, plus the custom dropdown has no ARIA at all — no `role="listbox"`/`combobox`, no `aria-expanded` on the trigger, no `aria-selected` on options, and list items carry click handlers with no keyboard equivalent (only the nested checkbox is independently tabbable, so a screen-reader user gets a sequence of unlabeled checkboxes with no indication they belong to one "Área de enseñanza" group). The 10 live-detected contrast failures compound this directly.

**Riley (Deliberate Stress Tester):** Selecting 5+ categories concatenates all of them into one `text-overflow: ellipsis` line with no count fallback — the user loses visibility into their own selection and must reopen the dropdown to verify it. Separately, `onSubmit` never disables the submit button or tracks an in-flight state, so a double-click during a slow round-trip can fire the request twice.

## Minor Observations

- Three different radii for the same "primary action" role in one feature (`btn-hero-cta` 1.5rem, `btn-action` 20px, `btn-submit` 10px), plus `scale(1.03)` hover reintroduced on two buttons on the same page where a sibling button correctly uses `translateY(-2px)` — DESIGN.md already names `scale()` hover as retired debt elsewhere; this adds two more instances instead of closing it out.
- Rejected-state "Volver a solicitar" remounts a blank form — `aboutYou`/`courseTitle`/`courseSummary` aren't pre-filled from the prior rejected request, so a user who just got bad news must retype a 50+ character personal essay from scratch.
- 8 hardcoded font-sizes across the four new files (`0.75rem`-`1.5rem` range) bypass the `$text-*` fluid scale entirely — confirmed by the CLI detector, not just a style-guide nitpick, since the scale already interpolates these exact ranges.
- `.title-section` divider uses `border-top: 1px dashed rgba(40,40,40,0.25)` — DESIGN.md's border vocabulary caps hairlines at 6-16% opacity and doesn't use dashed borders anywhere else in the system.
- Aside (outside design scope, worth a flag): Assessment B observed a raw JWT auth token logged to the browser console on page load (`chunk-DLTVOY5E.js:117`) while authenticated — not part of this critique's scope, but worth a separate look.

## Questions to Consider

- The status screen is the emotional payoff of the whole application process, and DESIGN.md hands you the exact component built for this moment by name — was Tarjeta-Ticket considered and rejected here, or just not checked against?
- If the most likely evaluation scenario has no backend running, and this route sits behind `AuthenticatedGuard` with no public preview, does this feature ever actually reach the audience it's built to impress?
- Three button radii and two more `scale()` hovers landed in one feature despite both being named, retired anti-patterns elsewhere in DESIGN.md — is there a step before a spec merges that diffs new component CSS against DESIGN.md's Do/Don't list?
