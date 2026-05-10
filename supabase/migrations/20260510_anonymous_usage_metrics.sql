create index if not exists usage_events_anonymous_created_idx
on public.usage_events (anonymous_id, created_at)
where anonymous_id is not null;

create index if not exists usage_events_daily_summary_idx
on public.usage_events (event_name, created_at)
where event_name = 'anonymous_daily_summary';

create index if not exists usage_events_install_idx
on public.usage_events (event_name, created_at)
where event_name in (
  'install_prompt_ready',
  'install_button_clicked',
  'browser_install_prompt_opened',
  'browser_install_prompt_accepted',
  'browser_install_prompt_dismissed',
  'install_fallback_steps_opened',
  'ios_install_steps_opened',
  'appinstalled_detected'
);

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

  with latest_summaries as (
    select distinct on (anonymous_id, (event_metadata->>'local_date'))
      anonymous_id,
      event_metadata,
      created_at
    from public.usage_events
    where event_name = 'anonymous_daily_summary'
      and anonymous_id is not null
      and event_metadata ? 'local_date'
    order by anonymous_id, (event_metadata->>'local_date'), created_at desc
  ),
  recent_summaries as (
    select *
    from latest_summaries
    where created_at >= now() - interval '7 days'
  ),
  top_core_wins as (
    select win_key, count(*)::int as total
    from recent_summaries
    cross join lateral jsonb_array_elements_text(
      coalesce(event_metadata->'completed_core_win_keys', '[]'::jsonb)
    ) as win_key
    group by win_key
    order by total desc, win_key
    limit 10
  ),
  top_optional_routines as (
    select win_key, count(*)::int as total
    from recent_summaries
    cross join lateral jsonb_array_elements_text(
      coalesce(event_metadata->'completed_optional_routine_keys', '[]'::jsonb)
    ) as win_key
    group by win_key
    order by total desc, win_key
    limit 10
  ),
  mood_statuses as (
    select mood_key, sum(mood_total)::int as total
    from recent_summaries
    cross join lateral (
      select key as mood_key, value::int as mood_total
      from jsonb_each_text(coalesce(event_metadata->'mood_counts', '{}'::jsonb))
    ) moods
    group by mood_key
  ),
  anonymous_returning as (
    select anonymous_id
    from public.usage_events
    where anonymous_id is not null
      and event_name in ('anonymous_app_open', 'anonymous_daily_summary')
      and created_at >= now() - interval '7 days'
    group by anonymous_id
    having count(distinct coalesce(event_metadata->>'local_date', created_at::date::text)) >= 2
  ),
  install_attempt_events as (
    select *
    from public.usage_events
    where anonymous_id is not null
      and event_name in (
        'install_button_clicked',
        'browser_install_prompt_opened',
        'install_fallback_steps_opened',
        'ios_install_steps_opened'
      )
      and created_at >= now() - interval '7 days'
  ),
  installed_shell_events as (
    select *
    from public.usage_events
    where anonymous_id is not null
      and (
        event_name in ('browser_install_prompt_accepted', 'appinstalled_detected')
        or event_metadata->>'installed_app' = 'true'
      )
  )
  select jsonb_build_object(
    'anonymous_visitors', (
      select count(distinct anonymous_id)
      from public.usage_events
      where anonymous_id is not null
    ),
    'anonymous_active_24h', (
      select count(distinct anonymous_id)
      from public.usage_events
      where anonymous_id is not null
        and created_at >= now() - interval '24 hours'
    ),
    'anonymous_active_7d', (
      select count(distinct anonymous_id)
      from public.usage_events
      where anonymous_id is not null
        and created_at >= now() - interval '7 days'
    ),
    'anonymous_returning_7d', (select count(*) from anonymous_returning),
    'anonymous_users_with_wins', (
      select count(distinct anonymous_id)
      from latest_summaries
      where coalesce((event_metadata->>'total_wins_logged')::int, 0) > 0
    ),
    'app_opens_7d', (
      select count(*)
      from public.usage_events
      where event_name = 'anonymous_app_open'
        and created_at >= now() - interval '7 days'
    ),
    'active_users_7d', (
      (select count(distinct user_id)
       from public.daily_win_logs
       where updated_at >= now() - interval '7 days')
      +
      (select count(distinct anonymous_id)
       from public.usage_events
       where anonymous_id is not null
         and created_at >= now() - interval '7 days')
    ),
    'local_wins_logged_7d', coalesce((
      select sum((event_metadata->>'total_wins_logged')::int)
      from recent_summaries
    ), 0),
    'local_core_wins_logged_7d', coalesce((
      select sum((event_metadata->>'core_wins_logged')::int)
      from recent_summaries
    ), 0),
    'local_optional_routines_logged_7d', coalesce((
      select sum((event_metadata->>'optional_routines_logged')::int)
      from recent_summaries
    ), 0),
    'install_attempt_users_7d', (select count(distinct anonymous_id) from install_attempt_events),
    'install_attempts_7d', (
      select count(*)
      from public.usage_events
      where anonymous_id is not null
        and event_name = 'install_button_clicked'
        and created_at >= now() - interval '7 days'
    ),
    'ios_install_steps_users_7d', (
      select count(distinct anonymous_id)
      from public.usage_events
      where anonymous_id is not null
        and event_name = 'ios_install_steps_opened'
        and created_at >= now() - interval '7 days'
    ),
    'browser_install_prompt_users_7d', (
      select count(distinct anonymous_id)
      from public.usage_events
      where anonymous_id is not null
        and event_name = 'browser_install_prompt_opened'
        and created_at >= now() - interval '7 days'
    ),
    'shell_installed_users', (select count(distinct anonymous_id) from installed_shell_events),
    'shell_installed_users_7d', (
      select count(distinct anonymous_id)
      from installed_shell_events
      where created_at >= now() - interval '7 days'
    ),
    'install_accepted_7d', (
      select count(*)
      from public.usage_events
      where anonymous_id is not null
        and event_name = 'browser_install_prompt_accepted'
        and created_at >= now() - interval '7 days'
    ),
    'install_dismissed_7d', (
      select count(*)
      from public.usage_events
      where anonymous_id is not null
        and event_name = 'browser_install_prompt_dismissed'
        and created_at >= now() - interval '7 days'
    ),
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
    'top_core_wins_7d', coalesce((
      select jsonb_object_agg(win_key, total)
      from top_core_wins
    ), '{}'::jsonb),
    'top_optional_routines_7d', coalesce((
      select jsonb_object_agg(win_key, total)
      from top_optional_routines
    ), '{}'::jsonb),
    'mood_statuses_7d', coalesce((
      select jsonb_object_agg(mood_key, total)
      from mood_statuses
    ), '{}'::jsonb),
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
