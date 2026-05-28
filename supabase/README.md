# FinanzIA Supabase boundary

This folder now contains the Phase 2 security foundation: schema migrations, RLS ownership policies, private Storage groundwork, and seed/policy test SQL.

## Folders

| Folder | Purpose |
|--------|---------|
| `migrations/` | Versioned SQL migrations for tables, compatibility views, RLS, and storage policies. |
| `seed/` | Local seed SQL for system default categories. |
| `tests/` | SQL sanity checks for own-vs-other-user RLS behavior. |
| `functions/` | Optional Supabase Edge Functions if a later slice chooses them. |

## Quick path (local Supabase CLI)

1. Apply migrations (example): `supabase db reset`.
2. Validate default categories seed: `supabase db query < supabase/seed/0001_default_categories.sql` (if reset does not auto-run your seed workflow).
3. Run SQL policy sanity checks: `supabase db query < supabase/tests/001_rls_ownership_checks.sql`.

## Notes

- Canonical Phase 2 tables include `classification_rules`, `bank_statements`, and `ocr_extracted_transactions`.
- Compatibility views (`category_rules`, `statement_uploads`, `ocr_batches`, `ocr_rows`) are included to align with existing SDD wording used in design/tasks.

## Next slice

Implement Phase 3 auth/profile and finance-core actions on top of this schema baseline.
