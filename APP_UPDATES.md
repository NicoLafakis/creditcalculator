# App Update Plan (No UI Restyle)

This plan adds content and calculation fidelity only—preserving the current look and layout.

## Scope
- Keep styling/structure intact.
- Expand data inputs and calculator logic to match catalog details and betas.
- Improve print/PDF details and clarity.

---

## Task Order (checklist)

1) Calculator foundations (constants and data)
- [x] Add currency overage price table (USD, EUR, GBP, JPY, AUD, CAD, COP, INR, SGD).
- [x] Add function to round overage credits up to nearest 10 (for invoicing increments).
- [x] Add included-credits maps for both product groups (Main Hubs vs. Data Hub/Customer Platform).
- [x] Add feature availability map (Customer Agent, Prospecting Agent, Data Agent beta) by owned editions.
- [x] Add Data Studio (Beta) rates: small=25, medium=75, large=200 credits per destination sync.

2) Ownership profile (included credits per catalog)
- [x] Add two edition pickers: (A) Smart CRM/Marketing/Sales/Service/Content and (B) Data Hub/Customer Platform.
- [x] Compute included credits as the single highest applicable inclusion across those two groups (not additive).
- [x] Show a small inline note clarifying the “highest edition applies; not additive” rule.

3) Currency and overage pricing
- [x] Add a Currency selector to Calculator (default USD).
- [x] Use the selected currency’s per-credit price for overage path.
- [x] Apply 10-credit rounding before pricing: billedOverageCredits = ceil(O/10) * 10.
- [x] Surface a tiny text note: “Overage invoices issue in 10-credit increments.”

4) Policy selection and spend controls
- [x] Add a toggle: “Auto-upgrade to capacity packs” vs. “Stay at committed capacity + overages.”
- [x] Keep the existing comparison card, but reflect the user’s actual policy selection in the summary and print.
- [x] Add optional “Overage monthly cap” input; cap the billed overage cost when chosen and show the truncated result.

5) Pack proration awareness
 - [x] Add optional “Days remaining this billing period” slider (1–30); only affects the first-month pack cost.
 - [x] Show both costs when proration is enabled: first-month prorated cost and steady-state monthly cost.
 - [x] Add a tiny note: “Added packs persist through term until renewal change.”

6) Beta features
- [x] Add Data Studio inputs (counts of small/medium/large source syncs × destinations/month); include only when GA+Beta is selected.
- [x] Include Data Studio credits in totals and show them on Rates (under a Beta section) with the confirmed numbers.
- [x] Add a small Beta policy info note on Rates/Calculator: “Beta rates may change; HubSpot aims to give ~30 days’ notice.”

7) Feature availability guardrails (non-blocking)
 - [x] When the ownership profile doesn’t meet availability, show a subtle inline hint on that input.
 - [x] Optional: provide a “model anyway” checkbox that re-enables inputs for exploration.

8) Scenarios and sensitivity
- [ ] Add two scenario quick-toggles on Scenarios page: “Steady-state month” and “Mid-cycle surge (+30% actions).”
- [ ] Optional: add a “±10% usage wiggle” toggle to display a small band in the recommendation card.

9) Print/PDF completeness
- [ ] Ensure print view includes: ownership profile, included credits rule, currency, policy selection, any overage cap, 10-credit rounding note, proration assumption (if set).

10) Accessibility and content polish (no restyle)
- [ ] Verify contrast and semantics remain AA (icons marked aria-hidden, inputs labelled).
- [x] Add 1–2 tiny helper texts where we introduce new inputs (currency, policy, cap; proration pending).

11) Tests and QA
- [ ] Unit tests for: included credits (highest rule), overage rounding (10-credit), multi-currency pricing, pack count, proration math, Data Studio beta credits.
- [ ] Edge cases: zero usage, just-under/just-over included, huge usage, cap lower than overage, GA-only vs GA+Beta.
- [ ] Manual smoke test: change editions, currency, policy, proration, and verify recommendation switches correctly.

12) Docs
- [ ] Update README “Notes” with: currency support, rounding, policy/proration options, Data Studio beta assumptions, and source references.

---

## Success Criteria
- Calculator math aligns with catalog details (included credits, overage prices by currency, 10-credit rounding, packs/proration).
- Beta features modeled when GA+Beta is chosen (Data Agent and Data Studio); GA-only excludes them.
- Ownership profile drives included credits per “highest-level edition applies; not additive.”
- Printout contains the full context for approvals (policy, currency, cap, rounding, proration, ownership profile).

## Out of Scope
- Visual redesign or re-layout of cards/tabs.
- New third-party dependencies.

## References
- HubSpot Credits overview, included credits, overage price per credit, capacity packs, proration behavior, and beta policy per the provided catalog docs.
