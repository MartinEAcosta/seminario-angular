---
target: src/app/shared/pages/not-found
total_score: 28
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\marti\\Desktop\\Personal\\AprendiendoAngularSeminario\\seminario-angular\\src\\app\\shared\\pages\\not-found"
timestamp: 2026-10-23T16-03-25Z
slug: src-app-shared-pages-not-found
---
Method: dual-agent (A: design-review subagent · B: detector+browser-evidence subagent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Tab title never changes on 404; no aria-live announcer anywhere in app |
| 2 | Match System / Real World | 4/4 | Copy names the two real causes |
| 3 | User Control and Freedom | 3/4 | 5 working exits to 3 real routes; no explicit back affordance |
| 4 | Consistency and Standards | 4/4 | Reuses badge-pill, focus-ring(), header-overlay-patch exactly per DESIGN.md |
| 5 | Error Prevention | 4/4 | All 5 links resolve to real routes |
| 6 | Recognition Rather Than Recall | 4/4 | Eyebrow -> digits -> message -> actions, nothing to remember |
| 7 | Flexibility and Efficiency | n/a | single-visit dead-end screen |
| 8 | Aesthetic and Minimalist Design | 3/4 | /explore linked twice (button + pill) |
| 9 | Error Recovery | 4/4 | Plain-language cause + two distinct recovery actions |
| 10 | Help and Documentation | n/a | not applicable to error-redirect surface |
| Total | | 28/32 | Good (87.5%) |

## Design Specificity Verdict

Authored for this system: badge-pill token reuse (not-found-page.scss:66-78), two-room split matching auth-layout precedent, eyebrow swaps $brand-color -> $brand-color-bright with contrast-math comment.

Deterministic scan (impeccable detect --json, exit 0, 3 advisory findings):
1. design-system-color on "Página no encontrada" span - likely false positive, actual rule uses $brand-color-bright (~6.43:1), static scan missed class-scoped rule.
2-3. design-system-font-size on .code-404 clamps (scss:56, :256) - deliberate half-width-column exception, same precedent as /about hero clamp. Not a real violation.

Live overlay (console + DOM overlay, screenshot captured):
- overused-font (Montserrat 97%) - false positive, system working as intended.
- low-contrast - REAL finding, missed by design-review agent: .panel-recovery .eyebrow (scss:181-189) renders #00788c on #e9e9e9 = 4.3:1, below 4.5:1 AA. Dark-panel eyebrow already solved this exact problem with $brand-color-bright; light-panel twin didn't get the same fix.

## Overall Impression

Solid, on-brand 404. Biggest miss: contrast discipline applied to the dark-panel eyebrow wasn't mirrored on the light-panel eyebrow, and the page is invisible to anything not looking at the screen (no title, no live-region).

## What's Working

- scss:46-48 eyebrow color backed by correct contrast-math comment (6.43:1, verified).
- scss:247-253 mobile stack correctly un-patches .panel-recovery's -80px header offset, with comment explaining why naive copy-paste would double-count it.
- Tab order clean and logical across all 5 focusable elements, all with focus-ring() (html:24-35).

## Priority Issues

[P1] Light-panel eyebrow fails WCAG AA contrast. .panel-recovery .eyebrow (scss:188) = 4.3:1, confirmed live by detector overlay. Fix: swap to $brand-color-deep (already used at line 165, passes AA).

[P1] No document title set on error. not-found-page.ts never calls Title.setTitle(...); confirmed live, tab stays "Udemix". Fix: inject(Title).setTitle('Página no encontrada · Udemix').

[P2] Header never enters transparent-over-dark mode here. header.component.ts's DARK_HERO_ROUTES allowlist excludes the wildcard 404 route. Fix: move dark-hero detection off route-string allowlist onto a per-page signal/token.

[P3] /explore linked twice. .btn-outline (html:25) and third recovery pill (html:33) point at identical route. Fix: replace pill with distinct destination or drop it.

[P3] Recovery pills under 44px touch-target floor. .recovery-links a (scss:197-208) has no min-height, unlike CTAs (scss:140). Fix: match min-height: 44px.

[P3] Copy skips voseo entirely. PRODUCT.md fixes voseo as "una decisión fijada, no una casualidad." Fix: "Puede que hayas escrito mal el link, o que el curso que buscás ya no esté publicado."

## Persona Red Flags

Sam (accessibility): tab order and focus rings correct, aria-hidden 404 digits properly backed by redundant text. Real gaps: eyebrow contrast failure (P1), and no title change/live-region means zero automatic signal that navigation happened.

Jordan (first-timer): reads in under a second; minor hesitation from duplicate "Explorar cursos" link.

Casey (mobile): stacked layout collapse handled correctly; friction is sub-44px pill targets. Note: detector agent's mobile screenshot didn't actually render at mobile viewport (environment resize issue, not a page bug) - verified from code/token math, not live capture.

## Minor Observations

- .panel-divider and .recovery-divider are each purposeful, not redundant.
- Dark-panel badge-pill contrast (7.66:1) and light-panel body copy contrast (6.51:1) both clean.
- .code-404's custom clamp values are a deliberate, commented deviation from the type ramp, consistent with /about's hero precedent.

## Questions to Consider

- Should dark-hero detection in header.component.ts become a per-route data flag instead of a hardcoded array?
- Should new UI copy get a specific voseo check before merge?
