# Proposal: Build FinanzIA MVP

## Intent

Build the MVP foundation for FinanzIA: responsive finance tracking, Supabase-backed security, OCR statement review, reports, and local Docker execution.

## Scope

### In Scope
- Scaffold plan for separated `/frontend` Next.js 14+ App Router and `/backend` artifacts.
- Supabase PostgreSQL/Auth/Storage/RLS plan for profiles, accounts, categories, transactions, fixed expenses, savings goals, OCR, and reports.
- Auth/profile, dashboard metrics, accounts/categories/transactions, fixed expenses, savings goals, OCR upload/extraction/review, reports MVP.
- Docker local environment and UI guidance: sober, minimal, financial; neutral whites/grays/soft black with green accent.

### Out of Scope
- Production cloud deployment, direct bank integrations, advanced AI recommendations.
- Multi-currency conversion, payment processing.
- Notifications beyond simple MVP placeholders.

## Capabilities

### New Capabilities
- `auth-profile`: Supabase auth, profile onboarding, session boundaries.
- `finance-core`: accounts, categories, income/expense transactions.
- `dashboard-metrics`: summary cards, balances, expense/income trends.
- `fixed-expenses`: recurring/fixed expense registration and tracking.
- `savings-goals`: goal creation, progress, contribution tracking.
- `ocr-statements`: PDF/JPG/PNG upload, extraction, review-before-confirm.
- `categories-rules`: category management and basic classification rules.
- `reports`: MVP financial reports and filters.
- `security-rls`: tenant isolation with RLS-first policies.
- `local-environment`: Docker local stack and developer commands.
- `responsive-ui`: responsive UI system and accessibility expectations.

### Modified Capabilities
- None; no existing specs exist.

## Approach

Use Next.js App Router in `/frontend`, Supabase artifacts under `/backend` or `/supabase`, and OCR under `/backend/ocr`. Prefer Server Actions/Route Handlers internally. Model RLS-first with owner-protected storage. OCR stages extracted rows for review before confirmation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `/frontend` | New | Next.js, Tailwind, shadcn/ui-style components, responsive UI. |
| `/backend` | New | Backend service boundaries, OCR module location. |
| `/backend/ocr` | New | Statement parsing and review staging. |
| `/supabase` | New | Migrations, RLS policies, storage/auth configuration. |
| `/docker-compose.yml` | New | Local app/database/service orchestration. |
| `openspec/specs/*` | New | Spec domains listed above. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OCR accuracy varies by statement format | High | Review-before-confirm, validation, manual correction. |
| RLS/Auth mistakes expose data | Med | Security specs, policy tests after scaffold. |
| Storage access leaks uploads | Med | Private buckets and owner-scoped policies. |
| Docker complexity slows setup | Med | Minimal services first, documented commands. |
| `/frontend` + `/backend` boundary blurs | Med | Explicit design decisions before apply. |

## Rollback Plan

Before implementation, delete this change folder and Engram artifact. During implementation, revert by work unit; keep Supabase migrations reversible where possible and isolate OCR under `/backend/ocr`.

## Dependencies

- Next.js 14+, Tailwind, shadcn/ui-style components, Supabase, Docker, OCR library selected during design.

## Success Criteria

- [ ] Specs can be generated for all listed capabilities.
- [ ] Design can choose OCR/backend boundaries with tradeoffs.
- [ ] Tasks can forecast reviewable work units against the 400-line budget.
- [ ] No application source code is generated in proposal phase.
