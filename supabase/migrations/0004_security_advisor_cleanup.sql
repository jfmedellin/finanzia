-- Follow-up hardening for Supabase security advisor warnings.

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Allow all operations on users'
  ) then
    execute 'drop policy "Allow all operations on users" on public.users';
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'uuid-ossp' and n.nspname = 'public'
  ) then
    execute 'alter extension "uuid-ossp" set schema extensions';
  end if;
end
$$;
