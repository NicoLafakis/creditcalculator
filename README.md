# HubSpot Credits — Infographic & Cost Calculator

This project renders the provided `hubspot-cost-calculator.tsx` component as a standalone web app using Vite + React + TypeScript with Tailwind CSS and lightweight UI primitives.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build

## Notes
- The UI components in `src/components/ui/*` are minimal wrappers to match the design (Card, Button, Tabs, etc.).
- Tailwind scans the top-level `hubspot-cost-calculator.tsx` file directly.

## Recent changes (documentation of intentional updates)

- Persistence and Clear button
	- The calculator now persists user inputs and settings in `localStorage` under the key `hubspot_credit_calc_state_v1` so values survive page refreshes. A "Clear" control in the header resets all settings to defaults and removes the saved state.

- Navigation and tabs
	- The app no longer exposes the Overview tab; the Calculator tab is the default landing view.

- Policy selector removed
	- The earlier "policy" selection UI has been removed. The calculator now compares both capacity packs and pay-as-you-go paths automatically and shows the cheaper path in the summary.

- Branding and copy
	- Small harvestROI branding appears next to the pay-as-you-go card as a recommended label. Copy across the UI has been simplified for clarity.

- FAQ / Guidance page
	- An in-app FAQ/guidance page is available via the FAQ button in the header. The app prefers an HTML source if present at `src/assets/CreditCalculatorFeedback.html` and falls back to `src/assets/Credit Calculator Feedback.md` (markdown) otherwise.
	- When the HTML FAQ is present, the build injects and scopes the FAQ's original `<style>` rules to the FAQ page only (CSS selectors are prefix-scoped to the FAQ container) to keep the FAQ styling self-contained.
	- The FAQ includes a left-side table-of-contents with sections and expandable question sub-links so users can jump directly to specific questions. The left nav defaults with the first section expanded.

Notes for developers
- The main component mounting the app is `src/HubspotCostCalculator.tsx` which now toggles between calculator and FAQ via a `showFAQ` state and renders `src/FAQPage.tsx` when the FAQ is open.
- The scoped-FAQ CSS approach is a heuristic prefixing of selectors; if you change the HTML FAQ markup or add complex selectors, review `src/FAQPage.tsx` for the scoping implementation.
