-- Phase 8: RLS FK ownership hardening (adapted for existing tables)
-- Fixes cross-tenant FK injection vulnerabilities
-- Note: bank_statements, ocr_extracted_transactions, classification_rules
-- tables don't exist in remote DB yet, so policies only apply to existing tables

-- Helper function to check account ownership
create or replace function public.is_account_owned_by_user(p_account_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.accounts
    where id = p_account_id and user_id = p_user_id
  );
$$;

-- Helper function to check category ownership (allows system categories)
create or replace function public.is_category_accessible_by_user(p_category_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.categories
    where id = p_category_id and (is_system or user_id = p_user_id)
  );
$$;

-- Drop existing policies that allow direct writes
drop policy if exists "transactions_own_all" on public.transactions;
drop policy if exists "fixed_expenses_own_all" on public.fixed_expenses;

-- transactions: SELECT only (writes via RPC)
create policy "transactions_select_own" on public.transactions
for select using (user_id = auth.uid());

-- fixed_expenses: validate FK ownership
create policy "fixed_expenses_select_own" on public.fixed_expenses
for select using (user_id = auth.uid());

create policy "fixed_expenses_insert_own" on public.fixed_expenses
for insert with check (
  user_id = auth.uid()
  and (account_id is null or public.is_account_owned_by_user(account_id, auth.uid()))
  and public.is_category_accessible_by_user(category_id, auth.uid())
);

create policy "fixed_expenses_update_own" on public.fixed_expenses
for update using (user_id = auth.uid()) with check (
  user_id = auth.uid()
  and (account_id is null or public.is_account_owned_by_user(account_id, auth.uid()))
  and public.is_category_accessible_by_user(category_id, auth.uid())
);

create policy "fixed_expenses_delete_own" on public.fixed_expenses
for delete using (user_id = auth.uid());

-- E2E cleanup function (versioned for audit)
drop function if exists public.e2e_delete_current_user();

create or replace function public.e2e_delete_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  delete from public.profiles where id = v_user_id;
  delete from public.accounts where user_id = v_user_id;
  delete from public.categories where user_id = v_user_id and not is_system;
  delete from public.transactions where user_id = v_user_id;
  delete from public.fixed_expenses where user_id = v_user_id;
  delete from public.savings_goals where user_id = v_user_id;
  delete from auth.users where id = v_user_id;
end;
$$;

revoke execute on function public.e2e_delete_current_user() from public;
grant execute on function public.e2e_delete_current_user() to authenticated;
