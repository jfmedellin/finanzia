-- Phase 3.5: Finance atomic RPC boundary

create or replace function public.create_finance_transaction(
  p_account_id uuid,
  p_to_account_id uuid,
  p_category_id uuid,
  p_type text,
  p_amount numeric,
  p_happened_at date,
  p_description text
)
returns public.transactions
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction public.transactions%rowtype;
  v_account_owner uuid;
  v_to_account_owner uuid;
  v_category record;
  v_delta numeric(14,2);
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if p_account_id is null then
    raise exception using errcode = 'P0001', message = 'VALIDATION_ACCOUNT_REQUIRED';
  end if;

  if p_type not in ('income', 'expense', 'transfer') then
    raise exception using errcode = 'P0001', message = 'VALIDATION_TYPE_INVALID';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_AMOUNT_INVALID';
  end if;

  if p_happened_at is null then
    raise exception using errcode = 'P0001', message = 'VALIDATION_DATE_REQUIRED';
  end if;

  if p_type = 'transfer' then
    if p_to_account_id is null then
      raise exception using errcode = 'P0001', message = 'VALIDATION_TRANSFER_DESTINATION_REQUIRED';
    end if;
    if p_to_account_id = p_account_id then
      raise exception using errcode = 'P0001', message = 'VALIDATION_TRANSFER_SAME_ACCOUNT';
    end if;
  end if;

  if p_type in ('income', 'expense') and p_category_id is null then
    raise exception using errcode = 'P0001', message = 'VALIDATION_CATEGORY_REQUIRED';
  end if;

  select a.user_id into v_account_owner
  from public.accounts a
  where a.id = p_account_id;

  if v_account_owner is null or v_account_owner <> v_user_id then
    raise exception using errcode = 'P0001', message = 'VALIDATION_ACCOUNT_FORBIDDEN';
  end if;

  if p_type = 'transfer' then
    select a.user_id into v_to_account_owner
    from public.accounts a
    where a.id = p_to_account_id;

    if v_to_account_owner is null or v_to_account_owner <> v_user_id then
      raise exception using errcode = 'P0001', message = 'VALIDATION_TRANSFER_DESTINATION_FORBIDDEN';
    end if;
  end if;

  if p_category_id is not null then
    select c.id, c.is_active, c.category_type, c.user_id, c.is_system
      into v_category
    from public.categories c
    where c.id = p_category_id;

    if v_category.id is null then
      raise exception using errcode = 'P0001', message = 'VALIDATION_CATEGORY_NOT_FOUND';
    end if;

    if not v_category.is_active then
      raise exception using errcode = 'P0001', message = 'VALIDATION_CATEGORY_INACTIVE';
    end if;

    if p_type in ('income', 'expense') and v_category.category_type <> p_type then
      raise exception using errcode = 'P0001', message = 'VALIDATION_CATEGORY_TYPE_MISMATCH';
    end if;

    if not (v_category.is_system or v_category.user_id = v_user_id) then
      raise exception using errcode = 'P0001', message = 'VALIDATION_CATEGORY_FORBIDDEN';
    end if;
  end if;

  begin
    v_delta := case when p_type = 'expense' then -p_amount when p_type = 'income' then p_amount else -p_amount end;

    update public.accounts
      set current_balance = current_balance + v_delta
    where id = p_account_id;

    if p_type = 'transfer' then
      update public.accounts
        set current_balance = current_balance + p_amount
      where id = p_to_account_id;
    end if;

    insert into public.transactions (
      user_id,
      account_id,
      category_id,
      transaction_type,
      amount,
      description,
      happened_at,
      source
    ) values (
      v_user_id,
      p_account_id,
      p_category_id,
      p_type,
      p_amount,
      p_description,
      p_happened_at,
      'manual'
    )
    returning * into v_transaction;

    return v_transaction;
  exception
    when raise_exception then
      raise;
    when others then
      raise exception using errcode = 'P0002', message = 'OPERATION_FAILED';
  end;
end;
$$;

grant execute on function public.create_finance_transaction(uuid, uuid, uuid, text, numeric, date, text) to authenticated;
