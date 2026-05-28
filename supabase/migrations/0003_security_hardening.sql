-- Phase 3.5 follow-up: security hardening and drift reconciliation.

alter table if exists public.accounts enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_own_all'
  ) then
    create policy "accounts_own_all" on public.accounts
      for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$$;

alter function if exists public.create_finance_transaction(uuid, uuid, uuid, text, numeric, date, text)
  set search_path = public;

alter function if exists public.update_updated_at()
  set search_path = public;

alter function if exists public.handle_new_user()
  set search_path = public;

revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from public;
