import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminMetrics = {
  anonymous_visitors: number;
  anonymous_active_24h: number;
  anonymous_active_7d: number;
  anonymous_returning_7d: number;
  anonymous_users_with_wins: number;
  app_opens_7d: number;
  active_users_7d: number;
  local_wins_logged_7d: number;
  local_core_wins_logged_7d: number;
  local_optional_routines_logged_7d: number;
  install_attempt_users_7d: number;
  install_attempts_7d: number;
  ios_install_steps_users_7d: number;
  browser_install_prompt_users_7d: number;
  shell_installed_users: number;
  shell_installed_users_7d: number;
  install_accepted_7d: number;
  install_dismissed_7d: number;
  registered_users: number;
  profiles: number;
  onboarding_completed: number;
  wins: number;
  active_wins: number;
  daily_win_logs: number;
  daily_notes: number;
  avatar_profiles: number;
  intent_segments: number;
  usage_events: number;
  daily_active_7d: number;
  sync_uploads_7d: number;
  top_core_wins_7d: Record<string, number>;
  top_optional_routines_7d: Record<string, number>;
  mood_statuses_7d: Record<string, number>;
  life_modes: Record<string, number>;
  consents: Record<string, number>;
  storage_plan: {
    comfortable_db: string;
    comfortable_assets: string;
    conservative_db: string;
    conservative_assets: string;
  };
  generated_at: string;
};

export async function fetchAdminMetrics(client: SupabaseClient) {
  const { data, error } = await client.rpc("get_admin_metrics");

  if (error) {
    throw new Error(error.message);
  }

  return normalizeAdminMetrics(data as Partial<AdminMetrics>);
}

function normalizeAdminMetrics(data: Partial<AdminMetrics>): AdminMetrics {
  return {
    anonymous_visitors: data.anonymous_visitors ?? 0,
    anonymous_active_24h: data.anonymous_active_24h ?? 0,
    anonymous_active_7d: data.anonymous_active_7d ?? 0,
    anonymous_returning_7d: data.anonymous_returning_7d ?? 0,
    anonymous_users_with_wins: data.anonymous_users_with_wins ?? 0,
    app_opens_7d: data.app_opens_7d ?? 0,
    active_users_7d: data.active_users_7d ?? data.daily_active_7d ?? 0,
    local_wins_logged_7d: data.local_wins_logged_7d ?? 0,
    local_core_wins_logged_7d: data.local_core_wins_logged_7d ?? 0,
    local_optional_routines_logged_7d: data.local_optional_routines_logged_7d ?? 0,
    install_attempt_users_7d: data.install_attempt_users_7d ?? 0,
    install_attempts_7d: data.install_attempts_7d ?? 0,
    ios_install_steps_users_7d: data.ios_install_steps_users_7d ?? 0,
    browser_install_prompt_users_7d: data.browser_install_prompt_users_7d ?? 0,
    shell_installed_users: data.shell_installed_users ?? 0,
    shell_installed_users_7d: data.shell_installed_users_7d ?? 0,
    install_accepted_7d: data.install_accepted_7d ?? 0,
    install_dismissed_7d: data.install_dismissed_7d ?? 0,
    registered_users: data.registered_users ?? 0,
    profiles: data.profiles ?? 0,
    onboarding_completed: data.onboarding_completed ?? 0,
    wins: data.wins ?? 0,
    active_wins: data.active_wins ?? 0,
    daily_win_logs: data.daily_win_logs ?? 0,
    daily_notes: data.daily_notes ?? 0,
    avatar_profiles: data.avatar_profiles ?? 0,
    intent_segments: data.intent_segments ?? 0,
    usage_events: data.usage_events ?? 0,
    daily_active_7d: data.daily_active_7d ?? 0,
    sync_uploads_7d: data.sync_uploads_7d ?? 0,
    top_core_wins_7d: data.top_core_wins_7d ?? {},
    top_optional_routines_7d: data.top_optional_routines_7d ?? {},
    mood_statuses_7d: data.mood_statuses_7d ?? {},
    life_modes: data.life_modes ?? {},
    consents: data.consents ?? {},
    storage_plan: data.storage_plan ?? {
      comfortable_db: "10 GB",
      comfortable_assets: "5 GB",
      conservative_db: "20 GB",
      conservative_assets: "10 GB"
    },
    generated_at: data.generated_at ?? new Date().toISOString()
  };
}
