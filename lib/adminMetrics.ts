import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminMetrics = {
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

  return data as AdminMetrics;
}
