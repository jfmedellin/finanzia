-- Runtime-quality RLS ownership checks for Phase 2 foundation.
-- Run after migrations with Supabase local DB (psql or supabase test db).
-- This script is self-contained, uses explicit assertions, and ROLLBACKs all data.

begin;

-- Assertion helpers
create or replace function pg_temp.assert_eq(label text, actual bigint, expected bigint)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception '[FAIL] %: expected %, got %', label, expected, actual;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

create or replace function pg_temp.assert_true(label text, ok boolean)
returns void
language plpgsql
as $$
begin
  if not coalesce(ok, false) then
    raise exception '[FAIL] %', label;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

-- Test identities
do $$
declare
  user_a constant uuid := '11111111-1111-1111-1111-111111111111';
  user_b constant uuid := '22222222-2222-2222-2222-222222222222';
  category_a uuid;
  account_a uuid;
  account_b uuid;
  statement_a uuid;
  visible_count bigint;
  updated_rows bigint;
  exists_cross_user_account boolean;
begin
  -- Ensure FK-safe auth fixtures exist for both users.
  insert into auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values
    (
      user_a, 'authenticated', 'authenticated', 'rls-user-a@example.com', crypt('test-password', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    ),
    (
      user_b, 'authenticated', 'authenticated', 'rls-user-b@example.com', crypt('test-password', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    )
  on conflict (id) do nothing;

  -- Work under authenticated role so RLS policies are active.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  -- Seed rows for user A.
  perform set_config('request.jwt.claim.sub', user_a::text, true);

  insert into public.accounts (user_id, name, kind)
  values (user_a, 'A Account', 'bank')
  returning id into account_a;

  insert into public.categories (user_id, name, category_type, is_system)
  values (user_a, 'A Custom Expense', 'expense', false)
  returning id into category_a;

  insert into public.classification_rules (user_id, category_id, keyword, priority)
  values (user_a, category_a, 'supermarket', 100);

  insert into public.bank_statements (user_id, account_id, original_filename, mime_type, storage_path)
  values (user_a, account_a, 'a.pdf', 'application/pdf', user_a::text || '/stmt-a.pdf')
  returning id into statement_a;

  insert into public.ocr_extracted_transactions (
    user_id, statement_id, category_id, row_index, raw_text, extracted_date, description, amount, direction, confidence
  ) values (
    user_a, statement_a, category_a, 1, 'RAW A', current_date, 'Purchase A', 10.50, 'expense', 0.94
  );

  -- Seed rows for user B.
  perform set_config('request.jwt.claim.sub', user_b::text, true);

  insert into public.accounts (user_id, name, kind)
  values (user_b, 'B Account', 'bank')
  returning id into account_b;

  insert into public.bank_statements (user_id, account_id, original_filename, mime_type, storage_path)
  values (user_b, account_b, 'b.pdf', 'application/pdf', user_b::text || '/stmt-b.pdf');

  -- Visibility assertions as user A.
  perform set_config('request.jwt.claim.sub', user_a::text, true);

  select count(*) into visible_count from public.accounts;
  perform pg_temp.assert_eq('accounts: user A sees only own rows', visible_count, 1);

  select count(*) into visible_count from public.statement_uploads;
  perform pg_temp.assert_eq('statement_uploads view: user A sees only own rows', visible_count, 1);

  select count(*) into visible_count from public.ocr_batches;
  perform pg_temp.assert_eq('ocr_batches view: user A sees only own rows', visible_count, 1);

  select count(*) into visible_count from public.ocr_rows;
  perform pg_temp.assert_eq('ocr_rows view: user A sees only own rows', visible_count, 1);

  select count(*) into visible_count from public.category_rules;
  perform pg_temp.assert_eq('category_rules view: user A sees only own rows', visible_count, 1);

  -- Cross-user write denial assertion as user B:
  -- RLS should block by affecting zero rows (not necessarily throw).
  perform set_config('request.jwt.claim.sub', user_b::text, true);

  update public.accounts
     set name = 'HACKED'
   where id = account_a;

  get diagnostics updated_rows = row_count;
  perform pg_temp.assert_eq('accounts: cross-user UPDATE affects zero rows', updated_rows, 0);

  -- Confirm no cross-user mutation happened.
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  select exists (
    select 1 from public.accounts
    where id = account_a
      and name = 'HACKED'
  ) into exists_cross_user_account;
  perform pg_temp.assert_true('accounts: user A row unchanged after user B attempt', not exists_cross_user_account);
end
$$;

rollback;
