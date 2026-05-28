# Tasks: Phase 3.5 Finance Atomicity

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 430-560 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 migration/RPC/tests → PR 2 frontend action/tests |
| Delivery strategy | ask-on-risk; user confirmed stacked-to-main |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add DB-owned atomic mutation boundary | PR 1 to `main` | Migration + SQL rollback/happy-path tests. |
| 2 | Wire Server Action to RPC | PR 2 to `main` after PR 1 | Frontend contract tests and removal of split writes. |

## Phase 1: Migration / RPC Foundation

- [x] 1.1 Create `supabase/migrations/0002_finance_atomic_rpc.sql` with `public.create_finance_transaction(...)` RPC for income, expense, and transfer.
- [x] 1.2 In the RPC, validate `auth.uid()`, account ownership, active category, category type, amount, dates, and same-account transfer rejection.
- [x] 1.3 In the RPC, insert `transactions` and update one or both `accounts.current_balance` inside one PL/pgSQL function so exceptions roll back all effects.
- [x] 1.4 Add safe `raise exception using errcode/message` branches for validation vs operation failures without exposing internals.
- [x] 1.5 Grant RPC execution only to `authenticated`; keep existing RLS policies unchanged.

## Phase 2: Frontend Server Action Integration

- [x] 2.1 Update `frontend/lib/actions/finance.ts` to remove `applyBalanceDelta` and direct `transactions.insert` writes.
- [x] 2.2 Map `createTransactionAction` form input to `supabase.rpc('create_finance_transaction', ...)` arguments.
- [x] 2.3 Convert RPC success/error outcomes to stable redirects: saved, validation error, operation error, unauthenticated login.
- [x] 2.4 Preserve `revalidatePath('/dashboard')` only after confirmed RPC success.

## Phase 3: Tests / Error Contracts

- [x] 3.1 Add `supabase/tests/002_finance_atomic_rpc.sql` for expense income transfer happy paths and ownership/category validation.
- [x] 3.2 In SQL tests, assert transfer same-account and inactive/category mismatch failures leave transaction count and balances unchanged.
- [x] 3.3 In SQL tests, force an operation failure path and assert rollback leaves both source and destination balances unchanged.
- [x] 3.4 Rewrite `frontend/lib/actions/finance.test.ts` mocks around `supabase.rpc` happy paths for expense, income, and transfer.
- [x] 3.5 Add frontend tests for validation redirects, RPC operation-error redirects, and no `revalidatePath` on failure.

## Phase 4: Migration Wiring / Verification

- [x] 4.1 Ensure local Supabase migration order applies `0001_phase2_security_foundation.sql` before `0002_finance_atomic_rpc.sql`.
- [x] 4.2 Run `npm --prefix frontend run test`, `npm --prefix frontend run lint`, and `npm --prefix frontend run typecheck`.
- [x] 4.3 Document SQL test command used for `supabase/tests/002_finance_atomic_rpc.sql` in the apply/verify report.
