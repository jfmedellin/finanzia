-- Phase 2: Supabase Security Foundation
-- Build FinanzIA MVP - core schema + RLS + private storage groundwork

create extension if not exists pgcrypto;

-- Keep updated_at consistent across mutable tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  currency_code text not null default 'USD' check (char_length(currency_code) = 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('cash','bank','credit','wallet','investment','other')),
  currency_code text not null default 'USD' check (char_length(currency_code) = 3),
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category_type text not null check (category_type in ('income','expense','transfer')),
  color text,
  icon text,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_owner_or_system check ((is_system and user_id is null) or (not is_system and user_id is not null))
);

create unique index if not exists ux_categories_user_name_type
  on public.categories (user_id, lower(name), category_type)
  where is_system = false;

create unique index if not exists ux_categories_system_name_type
  on public.categories (lower(name), category_type)
  where is_system = true;

create table if not exists public.classification_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  keyword text not null,
  priority int not null default 100 check (priority >= 1 and priority <= 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists ux_classification_rules_user_keyword_priority
  on public.classification_rules (user_id, lower(keyword), priority);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  transaction_type text not null check (transaction_type in ('income','expense','transfer')),
  amount numeric(14,2) not null check (amount > 0),
  description text,
  happened_at date not null,
  notes text,
  source text not null default 'manual' check (source in ('manual','ocr','import')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_transactions_user_happened_at on public.transactions(user_id, happened_at desc);

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  amount numeric(14,2) not null check (amount > 0),
  recurrence text not null check (recurrence in ('weekly','biweekly','monthly','quarterly','yearly')),
  due_day smallint not null check (due_day between 1 and 31),
  status text not null default 'pending' check (status in ('paid','pending','overdue')),
  starts_on date not null default current_date,
  ends_on date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  target_date date,
  status text not null default 'in_progress' check (status in ('in_progress','completed','paused')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/png','image/jpeg')),
  storage_bucket text not null default 'statements',
  storage_path text not null,
  status text not null default 'uploaded' check (status in ('uploaded','processing','processed','failed')),
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ocr_extracted_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  statement_id uuid not null references public.bank_statements(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  row_index int not null default 0,
  raw_text text,
  extracted_date date,
  description text,
  amount numeric(14,2) check (amount > 0),
  direction text check (direction in ('income','expense','transfer')),
  confidence numeric(5,2) check (confidence >= 0 and confidence <= 1),
  status text not null default 'draft' check (status in ('draft','confirmed','discarded')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_ocr_rows_user_statement on public.ocr_extracted_transactions(user_id, statement_id);

-- Backward-compatible views aligned with design/task naming.
create or replace view public.category_rules
with (security_invoker=on) as
select * from public.classification_rules;

create or replace view public.statement_uploads
with (security_invoker=on) as
select * from public.bank_statements;

create or replace view public.ocr_batches
with (security_invoker=on) as
select
  s.id,
  s.user_id,
  s.status,
  s.created_at,
  s.updated_at
from public.bank_statements s;

create or replace view public.ocr_rows
with (security_invoker=on) as
select * from public.ocr_extracted_transactions;

-- updated_at triggers
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_classification_rules_updated_at on public.classification_rules;
create trigger trg_classification_rules_updated_at before update on public.classification_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_fixed_expenses_updated_at on public.fixed_expenses;
create trigger trg_fixed_expenses_updated_at before update on public.fixed_expenses
for each row execute function public.set_updated_at();

drop trigger if exists trg_savings_goals_updated_at on public.savings_goals;
create trigger trg_savings_goals_updated_at before update on public.savings_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_bank_statements_updated_at on public.bank_statements;
create trigger trg_bank_statements_updated_at before update on public.bank_statements
for each row execute function public.set_updated_at();

drop trigger if exists trg_ocr_extracted_transactions_updated_at on public.ocr_extracted_transactions;
create trigger trg_ocr_extracted_transactions_updated_at before update on public.ocr_extracted_transactions
for each row execute function public.set_updated_at();

-- RLS enablement
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.classification_rules enable row level security;
alter table public.transactions enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.savings_goals enable row level security;
alter table public.bank_statements enable row level security;
alter table public.ocr_extracted_transactions enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- owner-scoped tables
create policy "accounts_own_all" on public.accounts
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "categories_select_own_or_system" on public.categories
for select using (is_system or user_id = auth.uid());
create policy "categories_insert_own" on public.categories
for insert with check (not is_system and user_id = auth.uid());
create policy "categories_update_own" on public.categories
for update using (not is_system and user_id = auth.uid()) with check (not is_system and user_id = auth.uid());
create policy "categories_delete_own" on public.categories
for delete using (not is_system and user_id = auth.uid());

create policy "classification_rules_own_all" on public.classification_rules
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "transactions_own_all" on public.transactions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "fixed_expenses_own_all" on public.fixed_expenses
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "savings_goals_own_all" on public.savings_goals
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "bank_statements_own_all" on public.bank_statements
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ocr_rows_own_all" on public.ocr_extracted_transactions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Private storage setup for statements bucket.
insert into storage.buckets (id, name, public)
values ('statements', 'statements', false)
on conflict (id) do update set public = excluded.public;

create policy "statements_object_select_own" on storage.objects
for select
using (
  bucket_id = 'statements'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "statements_object_insert_own" on storage.objects
for insert
with check (
  bucket_id = 'statements'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "statements_object_update_own" on storage.objects
for update
using (
  bucket_id = 'statements'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'statements'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "statements_object_delete_own" on storage.objects
for delete
using (
  bucket_id = 'statements'
  and split_part(name, '/', 1) = auth.uid()::text
);
