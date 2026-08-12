-- ============================================================================
-- Tree of Light — Supabase schema
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) on a fresh
-- project, then run seed.sql to load the 33-day mission schedule. See
-- ARCHITECTURE.md for the full data-flow explanation and DEPLOYMENT.md for
-- step-by-step setup.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. Roles & profiles
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.member_role as enum ('member', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.member_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent members from granting themselves admin via a crafted UPDATE — only
-- an existing admin's request is allowed to actually change the role column.
-- auth.uid() is NULL for direct DB connections (SQL Editor, `supabase db
-- query`, migrations) since there's no JWT/PostgREST context — those are
-- intentionally left unrestricted, since anyone with raw DB credentials
-- already has full control regardless. This only guards requests that come
-- through as an authenticated-but-non-admin app user.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;
-- (created after is_admin() below; trigger attached at the end of this file)

-- ----------------------------------------------------------------------------
-- 2. Missions — the 33-day schedule (see seed.sql)
-- ----------------------------------------------------------------------------
create table if not exists public.missions (
  day int primary key check (day between 1 and 33),
  mission_date date not null,
  speaker text not null,
  talk_title text not null
);

-- ----------------------------------------------------------------------------
-- 3. Stake settings — singleton row driving the brightness formula
-- ----------------------------------------------------------------------------
create table if not exists public.stake_settings (
  id boolean primary key default true check (id),
  stake_name text not null default 'Your Stake',
  total_members int not null default 150,
  conference_date date not null default '2026-09-19'
);
insert into public.stake_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Testimonies
-- ----------------------------------------------------------------------------
create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  day int not null references public.missions(day),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now(),
  unique (day, user_id) -- one testimony per member per day; re-submitting is an edit (upsert)
);
create index if not exists testimonies_day_idx on public.testimonies (day);

-- ----------------------------------------------------------------------------
-- 5. daily_stats view — participant count + 0-50 brightness (spec 2.B)
-- ----------------------------------------------------------------------------
create or replace view public.daily_stats as
select
  m.day,
  count(t.id)::int as participant_count,
  least(50, greatest(0, round(50.0 * count(t.id) / nullif(s.total_members, 0))))::int as brightness
from public.missions m
left join public.testimonies t on t.day = m.day
cross join public.stake_settings s
group by m.day, s.total_members
order by m.day;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.testimonies enable row level security;
alter table public.stake_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- profiles: readable by every signed-in member (needed to show author names
-- next to testimonies); a member may update their own row (role changes are
-- neutralized by the trigger above unless the requester is already an admin).
create policy "profiles readable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "members update own profile, admins update any"
  on public.profiles for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- missions: read-only reference data.
create policy "missions readable by authenticated users"
  on public.missions for select to authenticated using (true);

create policy "only admins modify missions"
  on public.missions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- stake_settings: readable by all, editable by admins only (e.g. total_members).
create policy "stake settings readable by authenticated users"
  on public.stake_settings for select to authenticated using (true);

create policy "only admins edit stake settings"
  on public.stake_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- testimonies: readable by the whole ward/stake community (powers the hover
-- preview + read-all modal); a member may insert/update only their own row;
-- deletes (used by the admin reset controls) are admin-only.
create policy "testimonies readable by authenticated users"
  on public.testimonies for select to authenticated using (true);

create policy "members submit their own testimony"
  on public.testimonies for insert to authenticated
  with check (auth.uid() = user_id);

create policy "members edit their own testimony"
  on public.testimonies for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "only admins delete testimonies"
  on public.testimonies for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Realtime — powers live fruit brightness + testimony updates across all
--    connected clients (Tree, TestimonyModal, admin dashboard all subscribe;
--    see src/lib/dataService.ts).
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.testimonies;

-- ----------------------------------------------------------------------------
-- 8. Promoting the first admin
-- ----------------------------------------------------------------------------
-- After your first sign-in, run this once (replace the email) to grant
-- yourself admin access to /admin:
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
