<!--
Guidance for AI coding agents working on the HubSpot Credits — Infographic & Cost Calculator
Keep this file concise (20–50 lines). Only include actionable, codebase-specific rules and examples.
-->

# Copilot / AI Agent Instructions — hubspot-credits-calculator

Quick orientation
- This is a small Vite + React + TypeScript single-page app that renders `src/HubspotCostCalculator.tsx` as the main component.
- Core data and business rules live in `src/catalog.ts` (rates, included credits, currency map, helper utilities).

What you're allowed to change
- UI layout and copy in `src/HubspotCostCalculator.tsx` (presentation only) unless the change affects calculation logic.
- Calculation logic (rates, rounding, availability rules) must stay consistent with `src/catalog.ts` unless updating the catalog file.

Important patterns & conventions
- Single entry: `src/main.tsx` mounts `HubSpotCreditsInfographic` from `src/HubspotCostCalculator.tsx`.
- Centralized domain constants: `src/catalog.ts` is the authoritative source for edition names, rates, DATA_STUDIO_RATES, and `OVERAGE_PRICE_PER_CREDIT`.
- UI primitives: small, project-specific components live under `src/components/ui/*` (Card, Button, Tabs, Input, Select, Switch). Reuse these rather than adding new style systems.
- Styling: Tailwind classes are used directly in TSX. Utility `cn` is in `src/lib/utils.ts` to merge classes.

Build / dev / test commands
- Dev server: `npm run dev` (runs `vite`).
- Production build: `npm run build` (runs `tsc -b` then `vite build`). When editing types or tsconfig settings, prefer running `npm run build` to catch type errors.
- Preview build: `npm run preview`.

Key implementation notes for edits
- When changing numeric rates or included credits, update `src/catalog.ts` and run `npm run build` to validate types and compile-time errors.
- UI changes that alter the DOM structure should preserve accessibility attributes already present (labels, `aria-*`, form element `id`s used by labels).
- Avoid adding new runtime dependencies. If a dependency is required, add it to `package.json` and prefer widely-used packages; update devDependencies for tooling (TypeScript, Vite) only with care.

Examples (copyable snippets)
- Read a rate or included value:
  - `import { INCLUDED, RATES } from './catalog'`
  - `const included = INCLUDED.main[edition]`
- Rounding helper:
  - `import { roundUpTo10 } from './catalog'`

Files to inspect first for context
- `src/HubspotCostCalculator.tsx` — bulk of UI + usage calculations.
- `src/catalog.ts` — domain model and helpers.
- `src/components/ui/*` — small UI primitives to reuse.
- `package.json` and `README.md` — scripts and high-level notes.

If you modify build or CI-related files
- Document why the change was needed in a short PR description. If changing scripts in `package.json`, run `npm run build` locally and ensure no type errors.

When in doubt
- Preserve numeric constants found in `src/catalog.ts` unless the task explicitly asks to update pricing or rates.
- Ask the human for policy/price authority if the change involves official pricing text or legal language.

End of instructions.
