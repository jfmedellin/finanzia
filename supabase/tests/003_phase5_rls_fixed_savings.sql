-- Phase 5.3 runtime RLS checks for fixed_expenses and savings_goals ownership.
-- Run: psql "$SUPABASE_DB_URL" -f supabase/tests/003_phase5_rls_fixed_savings.sql

begin;

create or replace function pg_temp.assert_eq(label text, actual bigint, expected bigint)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '[FAIL] %: expected %, got %', label, expected, actual;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

create or replace function pg_temp.assert_true(label text, ok boolean)
returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then
    raise exception '[FAIL] %', label;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

do $$
declare
  user_a constant uuid := '55555555-5555-5555-5555-555555555555';
  user_b constant uuid := '66666666-6666-6666-6666-666666666666';
  account_a uuid;
  account_b uuid;
  category_a uuid;
  fixed_a uuid;
  savings_a uuid;
  visible_count bigint;
  updated_rows bigint;
  deleted_rows bigint;
  unchanged_fixed boolean;
  unchanged_savings boolean;
  has_categories_type boolean;
begin
  if to_regclass('public.fixed_expenses') is null then
    raise exception 'MISSING_TABLE: public.fixed_expenses';
  end if;

  if to_regclass('public.savings_goals') is null then
    raise exception 'MISSING_TABLE: public.savings_goals';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'type'
  ) into has_categories_type;

  insert into auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values
    (
      user_a, 'authenticated', 'authenticated', 'phase5-a@example.com', crypt('test-password', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    ),
    (
      user_b, 'authenticated', 'authenticated', 'phase5-b@example.com', crypt('test-password', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    )
  on conflict (id) do nothing;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  -- Seed user A fixtures
  perform set_config('request.jwt.claim.sub', user_a::text, true);

  insert into public.accounts (user_id, name, kind, current_balance)
  values (user_a, 'A Budget', 'bank', 1000)
  returning id into account_a;

  if has_categories_type then
    insert into public.categories (user_id, name, type, category_type, is_system, is_active)
    values (user_a, 'A Fixed Expense', 'expense', 'expense', false, true)
    returning id into category_a;
  else
    insert into public.categories (user_id, name, category_type, is_system, is_active)
    values (user_a, 'A Fixed Expense', 'expense', false, true)
    returning id into category_a;
  end if;

  insert into public.fixed_expenses (
    user_id, account_id, category_id, name, amount, recurrence, due_day, status, starts_on
  ) values (
    user_a, account_a, category_a, 'Arriendo', 1500, 'monthly', 5, 'pending', current_date
  ) returning id into fixed_a;

  insert into public.savings_goals (
    user_id, name, target_amount, current_amount, status
  ) values (
    user_a, 'Fondo emergencia', 5000, 1200, 'in_progress'
  ) returning id into savings_a;

  -- Seed user B fixtures
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  insert into public.accounts (user_id, name, kind, current_balance)
  values (user_b, 'B Budget', 'bank', 300)
  returning id into account_b;

  -- Visibility checks
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  select count(*) into visible_count from public.fixed_expenses;
  perform pg_temp.assert_eq('fixed_expenses: user A sees only own rows', visible_count, 1);

  select count(*) into visible_count from public.savings_goals;
  perform pg_temp.assert_eq('savings_goals: user A sees only own rows', visible_count, 1);

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  select count(*) into visible_count from public.fixed_expenses;
  perform pg_temp.assert_eq('fixed_expenses: user B sees only own rows', visible_count, 0);

  select count(*) into visible_count from public.savings_goals;
  perform pg_temp.assert_eq('savings_goals: user B sees only own rows', visible_count, 0);

  -- Cross-user update should affect zero rows.
  update public.fixed_expenses
     set status = 'paid'
   where id = fixed_a;
  get diagnostics updated_rows = row_count;
  perform pg_temp.assert_eq('fixed_expenses: cross-user update affects zero rows', updated_rows, 0);

  update public.savings_goals
     set current_amount = 9999
   where id = savings_a;
  get diagnostics updated_rows = row_count;
  perform pg_temp.assert_eq('savings_goals: cross-user update affects zero rows', updated_rows, 0);

  -- Cross-user delete should affect zero rows.
  delete from public.fixed_expenses where id = fixed_a;
  get diagnostics deleted_rows = row_count;
  perform pg_temp.assert_eq('fixed_expenses: cross-user delete affects zero rows', deleted_rows, 0);

  delete from public.savings_goals where id = savings_a;
  get diagnostics deleted_rows = row_count;
  perform pg_temp.assert_eq('savings_goals: cross-user delete affects zero rows', deleted_rows, 0);

  -- Verify user A rows unchanged after user B attempts.
  perform set_config('request.jwt.claim.sub', user_a::text, true);

  select exists (
    select 1
      from public.fixed_expenses
     where id = fixed_a
       and status = 'pending'
  ) into unchanged_fixed;
  perform pg_temp.assert_true('fixed_expenses: owner row unchanged after cross-user attempts', unchanged_fixed);

  select exists (
    select 1
      from public.savings_goals
     where id = savings_a
       and current_amount = 1200
  ) into unchanged_savings;
  perform pg_temp.assert_true('savings_goals: owner row unchanged after cross-user attempts', unchanged_savings);
end
$$;

rollback;
