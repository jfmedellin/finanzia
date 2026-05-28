# FinanzIA Supabase boundary

Este directorio contiene el baseline de esquema + seguridad (RLS) y pruebas SQL runtime del MVP.

## Folders

| Folder | Purpose |
|--------|---------|
| `migrations/` | Versioned SQL migrations for tables, compatibility views, RLS, and storage policies. |
| `seed/` | Local seed SQL for system default categories. |
| `tests/` | SQL sanity checks for own-vs-other-user RLS behavior. |
| `functions/` | Optional Supabase Edge Functions if a later slice chooses them. |

## Quick path (Supabase CLI)

1. Alinear schema local/remoto: `supabase db push`.
2. Reset local completo: `supabase db reset`.
3. Ejecutar checks SQL de seguridad/atomicidad:
   - `supabase db query < supabase/tests/001_rls_ownership_checks.sql`
   - `supabase db query < supabase/tests/002_finance_atomic_rpc.sql`
   - `supabase db query < supabase/tests/003_phase5_rls_fixed_savings.sql`

## Notes

- Tablas clave del MVP incluyen `accounts`, `categories`, `transactions`, `fixed_expenses`, `savings_goals`, `bank_statements`, `ocr_extracted_transactions`.
- Compatibility views (`category_rules`, `statement_uploads`, `ocr_batches`, `ocr_rows`) are included to align with existing SDD wording used in design/tasks.

## Runtime drift note

Durante la verificación de Phase 5 se detectó drift remoto (faltaban `fixed_expenses` y `savings_goals`) y se corrigió con migración de alineación (`0005_phase5_fixed_savings_alignment`).

## Próximo foco

- Completar pruebas de integración E2E acopladas a journeys UI.
- Mantener `db push` + SQL runtime checks como gate antes de cada release.
