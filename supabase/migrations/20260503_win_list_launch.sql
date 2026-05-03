create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  age_range text not null,
  gender text,
  life_mode text not null,
  daily_available_minutes integer not null check (daily_available_minutes between 1 and 240),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('sync', 'analytics', 'recommendations', 'ads_personalization')),
  granted boolean not null default false,
  consent_version text not null,
  created_at timestamptz not null default now(),
  unique (user_id, consent_type)
);

create table if not exists public.intent_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('onboarding', 'daily_wins', 'manual_preference')),
  segment_key text not null,
  segment_value text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  consent_required text not null default 'ads_personalization',
  created_at timestamptz not null default now(),
  unique (user_id, source, segment_key, segment_value)
);

create table if not exists public.wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null,
  quip text,
  icon text not null,
  color text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  source text not null check (source in ('default', 'personalized', 'user_created')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.daily_win_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  win_id uuid not null references public.wins(id) on delete cascade,
  local_date date not null,
  status text not null check (status in ('done', 'strong', 'partial', 'skipped', 'rest')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, win_id, local_date)
);

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table if not exists public.avatar_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  age_range text not null,
  gender text not null,
  life_mode text not null,
  theme_key text not null,
  avatar_asset_url text not null,
  prompt_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, age_range, gender, life_mode, theme_key)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  event_name text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_consents enable row level security;
alter table public.intent_segments enable row level security;
alter table public.wins enable row level security;
alter table public.daily_win_logs enable row level security;
alter table public.daily_notes enable row level security;
alter table public.avatar_profiles enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles own select" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "consents own select" on public.user_consents for select using (auth.uid() = user_id);
create policy "consents own insert" on public.user_consents for insert with check (auth.uid() = user_id);
create policy "consents own update" on public.user_consents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "segments own select" on public.intent_segments for select using (auth.uid() = user_id);
create policy "segments own insert" on public.intent_segments for insert with check (auth.uid() = user_id);
create policy "segments own delete" on public.intent_segments for delete using (auth.uid() = user_id);

create policy "wins own select" on public.wins for select using (auth.uid() = user_id);
create policy "wins own insert" on public.wins for insert with check (auth.uid() = user_id);
create policy "wins own update" on public.wins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "logs own select" on public.daily_win_logs for select using (auth.uid() = user_id);
create policy "logs own insert" on public.daily_win_logs for insert with check (auth.uid() = user_id);
create policy "logs own delete" on public.daily_win_logs for delete using (auth.uid() = user_id);

create policy "notes own select" on public.daily_notes for select using (auth.uid() = user_id);
create policy "notes own insert" on public.daily_notes for insert with check (auth.uid() = user_id);
create policy "notes own delete" on public.daily_notes for delete using (auth.uid() = user_id);

create policy "avatars own select" on public.avatar_profiles for select using (auth.uid() = user_id);
create policy "avatars own insert" on public.avatar_profiles for insert with check (auth.uid() = user_id);
create policy "avatars own update" on public.avatar_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events own select" on public.usage_events for select using (auth.uid() = user_id);
create policy "events own insert" on public.usage_events for insert with check (auth.uid() = user_id or user_id is null);

create index if not exists wins_user_sort_idx on public.wins (user_id, sort_order);
create index if not exists daily_win_logs_user_date_idx on public.daily_win_logs (user_id, local_date);
create index if not exists daily_notes_user_date_idx on public.daily_notes (user_id, local_date);
create index if not exists intent_segments_user_key_idx on public.intent_segments (user_id, segment_key);
create index if not exists usage_events_name_created_idx on public.usage_events (event_name, created_at);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create or replace function public.is_win_list_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

create policy "admins can read admins" on public.app_admins
for select using (public.is_win_list_admin());

create or replace function public.get_admin_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  if not public.is_win_list_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'registered_users', (select count(*) from auth.users),
    'profiles', (select count(*) from public.profiles),
    'onboarding_completed', (select count(*) from public.profiles where onboarding_completed),
    'wins', (select count(*) from public.wins),
    'active_wins', (select count(*) from public.wins where is_active),
    'daily_win_logs', (select count(*) from public.daily_win_logs),
    'daily_notes', (select count(*) from public.daily_notes),
    'avatar_profiles', (select count(*) from public.avatar_profiles),
    'intent_segments', (select count(*) from public.intent_segments),
    'usage_events', (select count(*) from public.usage_events),
    'daily_active_7d', (
      select count(distinct user_id)
      from public.daily_win_logs
      where updated_at >= now() - interval '7 days'
    ),
    'sync_uploads_7d', (
      select count(*)
      from public.usage_events
      where event_name = 'sync_upload'
        and created_at >= now() - interval '7 days'
    ),
    'life_modes', coalesce((
      select jsonb_object_agg(life_mode, total)
      from (
        select life_mode, count(*) as total
        from public.profiles
        group by life_mode
      ) life_mode_counts
    ), '{}'::jsonb),
    'consents', coalesce((
      select jsonb_object_agg(consent_type, granted_count)
      from (
        select consent_type, count(*) filter (where granted) as granted_count
        from public.user_consents
        group by consent_type
      ) consent_counts
    ), '{}'::jsonb),
    'storage_plan', jsonb_build_object(
      'comfortable_db', '10 GB',
      'comfortable_assets', '5 GB',
      'conservative_db', '20 GB',
      'conservative_assets', '10 GB'
    ),
    'generated_at', now()
  )
  into result;

  return result;
end;
$$;
