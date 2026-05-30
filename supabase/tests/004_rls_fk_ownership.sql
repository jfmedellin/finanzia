-- Phase 8: RLS FK ownership tests
-- Validates that cross-tenant FK injection is blocked

begin;

-- Setup: create two users
do $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_account_a uuid;
  v_account_b uuid;
  v_category_a uuid;
  v_category_b uuid;
  v_statement_a uuid;
begin
  -- Create user A
  insert into auth.users (id, email)
  values (gen_random_uuid(), 'test_a@example.com')
  returning id into v_user_a;

  insert into public.profiles (id, full_name, currency_code)
  values (v_user_a, 'User A', 'USD');

  insert into public.accounts (id, user_id, name, kind, currency_code)
  values (gen_random_uuid(), v_user_a, 'Account A', 'bank', 'USD')
  returning id into v_account_a;

  insert into public.categories (id, user_id, name, category_type)
  values (gen_random_uuid(), v_user_a, 'Category A', 'expense')
  returning id into v_category_a;

  -- Create user B
  insert into auth.users (id, email)
  values (gen_random_uuid(), 'test_b@example.com')
  returning id into v_user_b;

  insert into public.profiles (id, full_name, currency_code)
  values (v_user_b, 'User B', 'USD');

  insert into public.accounts (id, user_id, name, kind, currency_code)
  values (gen_random_uuid(), v_user_b, 'Account B', 'bank', 'USD')
  returning id into v_account_b;

  insert into public.categories (id, user_id, name, category_type)
  values (gen_random_uuid(), v_user_b, 'Category B', 'expense')
  returning id into v_category_b;

  -- Create statement for user A
  insert into public.bank_statements (id, user_id, account_id, original_filename, mime_type, storage_path)
  values (gen_random_uuid(), v_user_a, v_account_a, 'test.pdf', 'application/pdf', v_user_a || '/test.pdf')
  returning id into v_statement_a;

  -- Test 1: User B cannot insert fixed_expense with user A's account
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_b::text)::text, true);

  begin
    insert into public.fixed_expenses (user_id, account_id, category_id, name, amount, recurrence, due_day)
    values (v_user_b, v_account_a, v_category_b, 'Test', 100, 'monthly', 1);
    raise exception 'Expected RLS to block cross-tenant account_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: fixed_expenses blocks cross-tenant account_id';
      else
        raise;
      end if;
  end;

  -- Test 2: User B cannot insert fixed_expense with user A's category
  begin
    insert into public.fixed_expenses (user_id, account_id, category_id, name, amount, recurrence, due_day)
    values (v_user_b, v_account_b, v_category_a, 'Test', 100, 'monthly', 1);
    raise exception 'Expected RLS to block cross-tenant category_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: fixed_expenses blocks cross-tenant category_id';
      else
        raise;
      end if;
  end;

  -- Test 3: User B cannot insert bank_statement with user A's account
  begin
    insert into public.bank_statements (user_id, account_id, original_filename, mime_type, storage_path)
    values (v_user_b, v_account_a, 'test.pdf', 'application/pdf', v_user_b || '/test.pdf');
    raise exception 'Expected RLS to block cross-tenant account_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: bank_statements blocks cross-tenant account_id';
      else
        raise;
      end if;
  end;

  -- Test 4: User B cannot insert ocr_row with user A's statement
  begin
    insert into public.ocr_extracted_transactions (user_id, statement_id, category_id, description, amount, direction)
    values (v_user_b, v_statement_a, v_category_b, 'Test', 100, 'expense');
    raise exception 'Expected RLS to block cross-tenant statement_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: ocr_extracted_transactions blocks cross-tenant statement_id';
      else
        raise;
      end if;
  end;

  -- Test 5: User B cannot insert ocr_row with user A's category
  begin
    insert into public.ocr_extracted_transactions (user_id, statement_id, category_id, description, amount, direction)
    values (v_user_b, v_statement_a, v_category_a, 'Test', 100, 'expense');
    raise exception 'Expected RLS to block cross-tenant category_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: ocr_extracted_transactions blocks cross-tenant category_id';
      else
        raise;
      end if;
  end;

  -- Test 6: User B cannot insert classification_rule with user A's category
  begin
    insert into public.classification_rules (user_id, category_id, keyword)
    values (v_user_b, v_category_a, 'test');
    raise exception 'Expected RLS to block cross-tenant category_id';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: classification_rules blocks cross-tenant category_id';
      else
        raise;
      end if;
  end;

  -- Test 7: User B cannot write to transactions directly (only via RPC)
  begin
    insert into public.transactions (user_id, account_id, category_id, transaction_type, amount, happened_at)
    values (v_user_b, v_account_b, v_category_b, 'expense', 100, current_date);
    raise exception 'Expected RLS to block direct insert';
  exception
    when others then
      if sqlerrm like '%new row violates row-level security policy%' then
        raise notice 'PASS: transactions blocks direct insert (must use RPC)';
      else
        raise;
      end if;
  end;

  -- Cleanup
  delete from public.profiles where id in (v_user_a, v_user_b);
  delete from auth.users where id in (v_user_a, v_user_b);
end $$;

rollback;
