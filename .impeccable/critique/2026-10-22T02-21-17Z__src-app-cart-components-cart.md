---
target: src/app/cart/components/cart
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\marti\\Desktop\\Personal\\AprendiendoAngularSeminario\\seminario-angular\\src\\app\\cart\\components\\cart"
timestamp: 2026-10-22T02-21-17Z
slug: src-app-cart-components-cart
closed: true
---
Method: dual-agent (A: design-review sub-agent · B: detector+browser-evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Backend total-recalc (CartService.obtainTotalOnChange) has no loading indicator |
| 2 | Match System / Real World | 4 | Solid — correct voseo, sensible icons, domain terms |
| 3 | User Control and Freedom | 1 | Escape doesn't close the role="dialog" panel; Tab leaks focus into dimmed background content |
| 4 | Consistency and Standards | 3 | role="dialog" promises modal keyboard behavior the component doesn't deliver |
| 5 | Error Prevention | 2 | No confirm/undo on item removal; rapid-click removal unreliable |
| 6 | Recognition Rather Than Recall | 3 | cart-panel-item title clamp truncated 2 of 4 real catalog titles live, no tooltip fallback |
| 7 | Flexibility and Efficiency | 1 | No bulk clear, no undo, no accelerators beyond default tab/enter |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and restrained; docked for stray hover-scale and one-off shadow |
| 9 | Error Recovery | 1 | Template has exactly two branches (@if/@else) — no error branch exists |
| 10 | Help and Documentation | 1 | Nothing beyond one reassurance line before the CTA |
| **Total** | | **22/40** | **Acceptable** |

Operate-mode surface; heuristics 7 and 10 scored normally (not n/a).

## Design Specificity Verdict

LLM assessment: Grounded in Udemix's own tokens where it matters (fab/panel shadow matches DESIGN.md Elevation by value, panel background matches documented "Blanco Ficha," voseo copy correct). Slips back to generic exactly in the newest interaction-layer work: .btn-empty-cta:hover scales instead of lifting (hits DESIGN.md's "La Regla del Levante" directly), and role="dialog" borrows modal visual language without the modal keyboard contract.

Deterministic scan: impeccable detect --json returned 5 advisory findings, exit 0: design-system-color on an .sr-only span (rgb(0,0,0), invisible, zero visual impact — cascade mismatch worth a look), two bounce-easing hits on the badge spring curve, two design-system-font-size hits (0.7rem badge digit, 0.9rem close glyph — both icon-glyph sizing, false positives, confirmed earlier this session). Bounce-easing is mechanically real but Assessment A independently called the same animation a strength — the one deliberately-contrasted spring moment, with the main panel transition explicitly de-sprung in a code comment. Detector and human review agree on facts, differ on verdict. Clean radius scan confirms this session's earlier polish pass landed. Detector missed entirely: the scale-hover violation, the undocumented lateral-offset shadow, and everything behavioral (focus trap, Escape, error branch).

Visual overlays: not applicable — this run used browser-screenshot evidence, not script-injected overlays.

## Overall Impression

Visual shell is genuinely on-system and recently polished — shadows, shapes, type mostly trace to documented tokens, two interaction details (WAAPI item-removal collapse, counting total tween) show real craft. But the drawer carries the UX weight of a payment gateway's entry point while behaving like a static popover underneath: no focus trap, no Escape, no error state in the template at all. Biggest opportunity: close the gap between how finished it looks and how finished it behaves.

## What's Working

1. The fab/panel shadow is a literal, named match to DESIGN.md (cart.component.scss:3) — specific adherence, not coincidence.
2. The empty-state anchoring fix is good UX with its reasoning left legible in the code (cart.component.scss:211-214).
3. Removal and total-count micro-interactions are bespoke: a real WAAPI collapse that waits for animation.finished before mutating state, and a rAF-tweened counting total, both respecting prefers-reduced-motion.

## Priority Issues

[P0] No focus trap, and Escape doesn't close the role="dialog" cart panel
Why it matters: confirmed live — Tab leaks focus into dimmed background content behind the 32%-opacity overlay; Escape does nothing, on the surface leading directly to a real Mercado Pago payment.
Fix: (keydown.escape)="closeCart($event)" while open, trap focus within .cart-panel (CDK cdkTrapFocus or manual), move initial focus into the panel on open, restore focus to the fab on close.
Suggested command: /impeccable harden

[P1] No error state anywhere in the template; silent failure on total recalculation
Why it matters: cart.component.html has exactly two branches, populated and empty. CartService.obtainTotalOnChange fails silently to console.error — displayed total goes stale with zero UI cue right before payment.
Fix: inline error affordance when calculateTotal fails; consider a brief undo window after removal.
Suggested command: /impeccable harden

[P1] .btn-empty-cta:hover uses transform: scale(1.05), violating DESIGN.md's own named rule
Why it matters: cart.component.scss:272. "La Regla del Levante" is explicit: hover lifts vertically, never scales — DESIGN.md names scale-hover as legacy debt elsewhere. New instance of the exact anti-pattern, in a file polished this session.
Fix: transform: translateY(v.$lift-control), matching .btn-pay:hover two blocks below it.
Suggested command: /impeccable polish

[P2] .btn-pay's rest shadow carries an undocumented 2px lateral offset
Why it matters: $btn-shadow: 2px 4px 15px rgba(v.$black-custom, 0.15) (cart.component.scss:5). "Regla de la Sombra Difusa" bans exactly this lateral-offset tell. The fab shadow two lines above gets this right.
Fix: drop the horizontal component — reuse the documented chrome or panel shadow vocabulary.
Suggested command: /impeccable polish

[P2] Secondary text colors fall under WCAG AA contrast
Why it matters: .header-count/.secure-note (rgba black 0.55, ≈3.5:1) and .subtotal-label/.subtotal-value (0.6, ≈3.7:1) sit below the 4.5:1 floor. .empty-copy's 0.7 opacity (≈5.5:1) already clears it in the same file.
Fix: raise to ≥0.7 opacity.
Suggested command: /impeccable polish

## Persona Red Flags

Sam (accessibility-dependent): Opens cart via keyboard, tabs to review items — focus leaves the dialog entirely, lands on visually-obscured footer controls behind the overlay. Escape does nothing. The fab's aria-expanded/aria-controls wiring is correct, making the missing focus management more jarring.

Riley (stress-tester): Rapidly clicking remove at a fixed position removed only 1 of 4 items in live testing — the 300ms collapse reflows the list under the cursor. No undo if the wrong course gets removed.

## Minor Observations

- cart-panel-item's remove touch target is 28×28px against the project's own stated 44px minimum.
- subtotal and total are now always numerically identical since the discount-code UI was removed this session.
- Mobile bottom-sheet variant not visually verified by either sub-agent — window-resize tool didn't take visible effect in either session. Source-reviewed only.

## Questions to Consider

- If "el acabado es el producto" is the stated differentiator, why does the one surface that leads to real money have zero visible error state?
- role="dialog" here has a modal's visual commitment without its keyboard contract — does that read worse to assistive tech than not claiming the role at all?
