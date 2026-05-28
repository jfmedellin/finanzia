# Tasks: Build FinanzIA MVP

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3,000-6,000+ across scaffold, migrations, UI, OCR, tests |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Foundation → Supabase/RLS → Auth → Finance → UI shell → Fixed/Savings → OCR → Reports → Tests/Docs |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation/local env | PR 1 | `/frontend`, `/backend/ocr`, `/supabase`, `docker-compose.yml`; re-detect test runner after scaffold. |
| 2 | Supabase schema/RLS | PR 2 | Migrations, private Storage, policy tests; depends on PR 1. |
| 3 | Auth/profile | PR 3 | Supabase auth, profile onboarding, route protection. |
| 4 | Finance core | PR 4 | Accounts, categories, rules, transactions, validators. |
| 5 | Dashboard/UI shell from Stitch | PR 5 | Use `frontend-design`; desktop/mobile fidelity to Stitch sources. |
| 6 | Fixed expenses/savings | PR 6 | Recurrence states, goals, progress flows. |
| 7 | OCR upload/review | PR 7 | PDF/JPG/PNG upload, draft rows, confirm flow. |
| 8 | Reports | PR 8 | Filters, monthly/period comparisons. |
| 9 | Tests/docs hardening | PR 9 | Fill gaps, Docker docs, responsive/a11y checks. |

## Phase 1: Foundation / Local Environment

- [x] 1.1 Scaffold `/frontend` as Next.js 14+ App Router with Tailwind and shadcn/ui-style `components.json`; no feature logic yet.
- [x] 1.2 Create `/backend/ocr` boundary and `/supabase` structure plus root `docker-compose.yml` and `.env.example` placeholders.
- [x] 1.3 Re-detect available test runner after scaffold; record commands in `openspec/config.yaml` before enabling stricter TDD.

## Phase 2: Supabase Security Foundation

- [x] 2.1 Create `/supabase/migrations/*` for `profiles`, accounts, categories/rules, transactions, fixed expenses, savings, statement uploads, OCR batches/rows.
- [x] 2.2 Add RLS policies for `auth.uid()` ownership and private `statements/{userId}/{statementId}` Storage access.
- [x] 2.3 Add seed/default category workflow and SQL policy tests for own-vs-other-user denial.

## Phase 3: Auth and Finance Core

- [x] 3.1 Implement `/frontend/app/(public)` auth pages, protected `/frontend/app/(app)` layout, and profile onboarding actions.
- [x] 3.2 Implement `/frontend/lib/actions/*` and `/frontend/lib/data/*` for accounts, categories/rules, transactions, validation, and balance effects.
- [x] 3.3 Verify spec scenarios: invalid login, private route redirect, create expense, transfer, invalid amount, disabled category.

## Phase 4: Stitch-Guided UI and Metrics

- [x] 4.1 Use `frontend-design` and Stitch `projects/16421650138318590896` as UI source of truth for tokens: navy `#1A2B3C`, emerald `#2ECC71`, Inter, 8px spacing, ambient/glass states.
- [x] 4.2 Build dashboard shell from desktop `9804d58210334282b772e405022314dd` and mobile `cfb45554f21545dcbf8aadd6029c39db`; derive tablet from breakpoints.
- [x] 4.3 Add dashboard metrics, zero states, period comparison, accessible validation feedback, and responsive navigation.

## Phase 5: Fixed Expenses and Savings

- [x] 5.1 Build fixed expenses using Stitch desktop `77082db94c4948738cb213802c12b918` and mobile `f2ad89c1e6d5408c92bafcf416b3676e`.
- [x] 5.2 Build savings/variable expense flows using desktop `288646b77b10456fb445c661c40ba295` and mobile `ca1e555250ae4608858d13ffb1e4793f`.
- [x] 5.3 Verify due-date validation, paid/pending/overdue, invalid goal target, and progress ownership scenarios.

## Phase 6: OCR and Reports

- [x] 6.1 Implement `/backend/ocr` extraction contract and `/frontend` upload/review flow from Stitch desktop `2a0942e8385c4b5eb4f6987b70366118` and mobile `7b254da128854100a24aa0fa6773850b`.
- [x] 6.2 Enforce PDF/JPG/PNG validation, draft-only extraction, category suggestions, manual correction, and confirm-to-transaction.
- [x] 6.3 Build `/frontend` reports for month, empty period, filters, and period comparison.

## Phase 7: Verification / Documentation

- [x] 7.1 Add unit/integration/e2e coverage for validators, actions, RLS, OCR golden samples, and responsive desktop/tablet/mobile flows.
- [x] 7.2 Document Docker startup, Supabase reset/migrations, OCR limits, chain strategy, and remaining production exclusions.
