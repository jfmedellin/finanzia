-- Phase 3.5 finance atomic RPC tests.
-- Run: psql "$SUPABASE_DB_URL" -f supabase/tests/002_finance_atomic_rpc.sql

begin;

create or replace function pg_temp.assert_eq(label text, actual numeric, expected numeric)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '[FAIL] %: expected %, got %', label, expected, actual;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

create or replace function pg_temp.assert_eq_bigint(label text, actual bigint, expected bigint)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '[FAIL] %: expected %, got %', label, expected, actual;
  end if;
  raise notice '[PASS] %', label;
end;
$$;

do $do$
declare
  user_a constant uuid := '33333333-3333-3333-3333-333333333333';
  user_b constant uuid := '44444444-4444-4444-4444-444444444444';
  a1 uuid;
  a2 uuid;
  b1 uuid;
  cat_exp uuid;
  cat_inc uuid;
  cat_inactive uuid;
  baseline_count bigint;
  balance_a1 numeric;
  balance_a2 numeric;
  caught text;
begin
  insert into auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values
  (user_a, 'authenticated', 'authenticated', 'atomic-a@example.com', crypt('test-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  (user_b, 'authenticated', 'authenticated', 'atomic-b@example.com', crypt('test-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb)
  on conflict (id) do nothing;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', user_a::text, true);

  insert into public.accounts (user_id, name, kind, current_balance)
  values (user_a, 'A1', 'bank', 1000)
  returning id into a1;

  insert into public.accounts (user_id, name, kind, current_balance)
  values (user_a, 'A2', 'bank', 200)
  returning id into a2;

  insert into public.accounts (user_id, name, kind, current_balance)
  values (user_b, 'B1', 'bank', 500)
  returning id into b1;

  insert into public.categories (user_id, name, category_type, is_system, is_active)
  values (user_a, 'Food', 'expense', false, true)
  returning id into cat_exp;

  insert into public.categories (user_id, name, category_type, is_system, is_active)
  values (user_a, 'Salary', 'income', false, true)
  returning id into cat_inc;

  insert into public.categories (user_id, name, category_type, is_system, is_active)
  values (user_a, 'Old', 'expense', false, false)
  returning id into cat_inactive;

  -- Happy path expense
  perform public.create_finance_transaction(a1, null, cat_exp, 'expense', 100, current_date, 'Expense test');
  select current_balance into balance_a1 from public.accounts where id = a1;
  perform pg_temp.assert_eq('expense decreases source', balance_a1, 900);

  -- Happy path income
  perform public.create_finance_transaction(a1, null, cat_inc, 'income', 50, current_date, 'Income test');
  select current_balance into balance_a1 from public.accounts where id = a1;
  perform pg_temp.assert_eq('income increases source', balance_a1, 950);

  -- Happy path transfer
  perform public.create_finance_transaction(a1, a2, null, 'transfer', 25, current_date, 'Transfer test');
  select current_balance into balance_a1 from public.accounts where id = a1;
  select current_balance into balance_a2 from public.accounts where id = a2;
  perform pg_temp.assert_eq('transfer decreases source', balance_a1, 925);
  perform pg_temp.assert_eq('transfer increases destination', balance_a2, 225);

  -- Validation rollback: same-account transfer
  select count(*) into baseline_count from public.transactions where user_id = user_a;
  begin
    perform public.create_finance_transaction(a1, a1, null, 'transfer', 10, current_date, 'Invalid transfer');
  exception when others then
    caught := sqlerrm;
  end;
  perform pg_temp.assert_eq_bigint('same-account keeps tx count', (select count(*) from public.transactions where user_id = user_a), baseline_count);
  select current_balance into balance_a1 from public.accounts where id = a1;
  perform pg_temp.assert_eq('same-account keeps source balance', balance_a1, 925);

  -- Validation rollback: inactive category
  begin
    perform public.create_finance_transaction(a1, null, cat_inactive, 'expense', 10, current_date, 'Inactive category');
  exception when others then
    caught := sqlerrm;
  end;
  perform pg_temp.assert_eq_bigint('inactive category keeps tx count', (select count(*) from public.transactions where user_id = user_a), baseline_count);

  -- Validation rollback: category type mismatch
  begin
    perform public.create_finance_transaction(a1, null, cat_inc, 'expense', 10, current_date, 'Mismatch');
  exception when others then
    caught := sqlerrm;
  end;
  perform pg_temp.assert_eq_bigint('category mismatch keeps tx count', (select count(*) from public.transactions where user_id = user_a), baseline_count);

  -- Operation rollback: force transaction insert failure using overlong source value
  -- source has CHECK constraint in transactions; error must rollback prior balance updates.
  create or replace function public.create_finance_transaction_forced_failure(
    p_account_id uuid,
    p_to_account_id uuid,
    p_amount numeric
  ) returns void language plpgsql security invoker as $fn$
  begin
    update public.accounts set current_balance = current_balance - p_amount where id = p_account_id;
    update public.accounts set current_balance = current_balance + p_amount where id = p_to_account_id;
    insert into public.transactions (user_id, account_id, transaction_type, amount, description, happened_at, source)
    values (auth.uid(), p_account_id, 'transfer', p_amount, 'forced fail', current_date, 'invalid-source');
  exception when others then
    raise exception using errcode = 'P0002', message = 'OPERATION_FAILED';
  end;
  $fn$;
  grant execute on function public.create_finance_transaction_forced_failure(uuid, uuid, numeric) to authenticated;

  begin
    perform public.create_finance_transaction_forced_failure(a1, a2, 40);
  exception when others then
    caught := sqlerrm;
  end;
  select current_balance into balance_a1 from public.accounts where id = a1;
  select current_balance into balance_a2 from public.accounts where id = a2;
  perform pg_temp.assert_eq('forced failure keeps source balance', balance_a1, 925);
  perform pg_temp.assert_eq('forced failure keeps destination balance', balance_a2, 225);
end $do$;

rollback;
