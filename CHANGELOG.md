# Changelog

## 0.1.0 - MVP verification

### Added

- Fixed expenses and savings goals flows with validation, data access, and tests.
- Statement OCR review flow with deterministic mock parsing, category suggestion, manual correction, and transaction confirmation.
- Reports page with period/account/type filters, summaries, category breakdowns, and previous-period comparison.
- Playwright public smoke suite for desktop Chromium and mobile Chrome.
- Supabase runtime RLS checks for `fixed_expenses` and `savings_goals` ownership boundaries.

### Changed

- Migrated the auth refresh boundary from deprecated Next.js `middleware.ts` to `proxy.ts`.
- Expanded dashboard metrics for monthly savings, income/expense comparison, and category totals.
- Updated operational documentation for setup, Supabase migrations, OCR limitations, and delivery strategy.

### Fixed

- Stabilized E2E execution without local Supabase public env by using dummy public env fallbacks in Playwright.
- Narrowed login smoke test locator to the `Entrar` button to avoid collision with the Next.js Dev Tools button.
