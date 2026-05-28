# Proposal: Phase 3.5 Finance Atomicity

## Intent

Add atomic transaction handling before Phase 4 so transaction rows and account balance effects cannot diverge during create/update/delete/transfer operations.

## Scope

### In Scope
- Move transaction persistence plus balance mutations into one Supabase PostgreSQL RPC/function per operation or shared atomic function boundary.
- Keep current auth, profile onboarding, route protection, and RLS ownership behavior unchanged.
- Update finance actions/data access to call the atomic DB operation and surface existing validation errors safely.
- Add acceptance checks for expense, income, transfer, and failure rollback behavior.

### Out of Scope / Non-goals
- No dashboard/UI redesign, Phase 4 visual work, OCR, reports, fixed expenses, or savings features.
- No auth/profile behavior changes or new profile fields.
- No new banking integrations, multi-currency logic, or balance snapshot redesign.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `finance-core`: transaction writes and balance effects must be committed atomically.

## Approach

Introduce a database-owned atomic mutation boundary in `/supabase/migrations/*` for finance transaction operations. Frontend Server Actions in `/frontend/lib/actions/*` delegate transaction+balance effects to the RPC/function instead of coordinating multiple writes client-side. Preserve RLS/auth ownership checks and existing profile/session flows.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `/supabase/migrations/*` | Modified | Add RPC/function and rollback-safe SQL migration. |
| `/frontend/lib/actions/*` | Modified | Call atomic finance operation for transaction mutations. |
| `openspec/changes/build-finanzia-mvp/specs/finance-core/spec.md` | Modified | Add atomicity requirement/scenarios. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| RPC bypasses expected RLS semantics | Med | Use authenticated user context, owner checks, and policy tests. |
| Balance corrections break existing data | Med | Keep migration additive and validate with expense/income/transfer cases. |
| Scope creep into Phase 4 UI | Low | Limit to backend/action boundary and spec updates only. |

## Rollback Plan

Revert the additive migration and restore prior Server Action transaction writes. If deployed data exists, keep the function unused first, then remove it in a follow-up migration after confirming no callers remain.

## Dependencies

- Existing Phase 3 auth/profile and finance-core actions/schema.
- Supabase PostgreSQL RPC/function support under current RLS/auth model.

## Success Criteria / Acceptance Criteria

- [ ] Creating an expense saves the transaction and decrements balance in one atomic DB operation.
- [ ] Creating income and transfer operations update all affected balances atomically.
- [ ] Any failure rolls back both transaction row and balance effects.
- [ ] Existing auth/profile behavior and private route behavior remain unchanged.
- [ ] Slice stays reviewable under the 400-line budget for stacked-to-main delivery.
