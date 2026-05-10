import type { DayRecord, Habit, MoodKey, TrackerState } from "./habitData";
import { getHabitCategory } from "./habitData";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const ANONYMOUS_ID_STORAGE_KEY = "the-win-list:anonymous-id:v1";
const OPEN_SENT_DATE_STORAGE_KEY = "the-win-list:anonymous-open-date:v1";
const SUMMARY_SIGNATURE_STORAGE_KEY = "the-win-list:anonymous-summary-signature:v1";

const safeMoodKeys: MoodKey[] = ["done", "strong", "partial", "skipped", "rest"];
type AnonymousInstallEventName =
  | "install_prompt_ready"
  | "install_button_clicked"
  | "browser_install_prompt_opened"
  | "browser_install_prompt_accepted"
  | "browser_install_prompt_dismissed"
  | "install_fallback_steps_opened"
  | "ios_install_steps_opened"
  | "appinstalled_detected";

export async function trackAnonymousAppOpen({
  localDate,
  tracker,
  hasPersonalization,
  isInstalledApp
}: {
  localDate: string;
  tracker: TrackerState;
  hasPersonalization: boolean;
  isInstalledApp: boolean;
}) {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return;
  }

  try {
    if (window.localStorage.getItem(OPEN_SENT_DATE_STORAGE_KEY) === localDate) {
      return;
    }

    await insertAnonymousUsageEvent("anonymous_app_open", {
      local_date: localDate,
      active_wins: tracker.habits.filter((habit) => !habit.pausedAt).length,
      local_days: Object.keys(tracker.days).length,
      has_personalization: hasPersonalization,
      installed_app: isInstalledApp
    });

    window.localStorage.setItem(OPEN_SENT_DATE_STORAGE_KEY, localDate);
  } catch {
    // Anonymous analytics must never interrupt the local-first habit loop.
  }
}

export async function trackAnonymousDailySummary({
  localDate,
  tracker,
  primaryHabits,
  optionalHabits,
  record,
  hasPersonalization,
  isInstalledApp,
  experienceState
}: {
  localDate: string;
  tracker: TrackerState;
  primaryHabits: Habit[];
  optionalHabits: Habit[];
  record: DayRecord;
  hasPersonalization: boolean;
  isInstalledApp: boolean;
  experienceState: string;
}) {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return;
  }

  const completedIds = new Set(record.completedHabitIds ?? []);
  const moodCounts = countMoods(record, completedIds);
  const completedCoreWinKeys = primaryHabits
    .filter((habit) => completedIds.has(habit.id))
    .map(safeHabitKey);
  const completedOptionalRoutineKeys = optionalHabits
    .filter((habit) => completedIds.has(habit.id))
    .map(safeHabitKey);
  const coreWinsLogged = completedCoreWinKeys.length;
  const optionalRoutinesLogged = completedOptionalRoutineKeys.length;
  const totalWinsLogged = coreWinsLogged + optionalRoutinesLogged;

  if (totalWinsLogged === 0 && Object.keys(moodCounts).length === 0) {
    return;
  }

  const metadata = {
    local_date: localDate,
    core_wins_logged: coreWinsLogged,
    optional_routines_logged: optionalRoutinesLogged,
    total_wins_logged: totalWinsLogged,
    active_core_wins: primaryHabits.length,
    active_optional_routines: optionalHabits.length,
    completed_core_win_keys: completedCoreWinKeys,
    completed_optional_routine_keys: completedOptionalRoutineKeys,
    mood_counts: moodCounts,
    local_days: Object.keys(tracker.days).length,
    has_personalization: hasPersonalization,
    installed_app: isInstalledApp,
    experience_state: experienceState
  };
  const signature = JSON.stringify(metadata);

  try {
    if (window.localStorage.getItem(SUMMARY_SIGNATURE_STORAGE_KEY) === signature) {
      return;
    }

    await insertAnonymousUsageEvent("anonymous_daily_summary", metadata);
    window.localStorage.setItem(SUMMARY_SIGNATURE_STORAGE_KEY, signature);
  } catch {
    // Keep analytics invisible to the daily-driver experience.
  }
}

export async function trackAnonymousInstallEvent({
  eventName,
  localDate,
  isIosDevice,
  isInstalledApp,
  source
}: {
  eventName: AnonymousInstallEventName;
  localDate: string;
  isIosDevice: boolean;
  isInstalledApp: boolean;
  source: "header" | "settings" | "browser" | "system";
}) {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return;
  }

  try {
    await insertAnonymousUsageEvent(eventName, {
      local_date: localDate,
      platform: isIosDevice ? "ios" : "browser",
      installed_app: isInstalledApp,
      source
    });
  } catch {
    // Install analytics must never interrupt the install or iPhone guidance flow.
  }
}

async function insertAnonymousUsageEvent(eventName: string, metadata: Record<string, unknown>) {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  await client.from("usage_events").insert({
    user_id: null,
    anonymous_id: getAnonymousId(),
    event_name: eventName,
    event_metadata: metadata,
    created_at: new Date().toISOString()
  });
}

function getAnonymousId() {
  const stored = window.localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const next =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, next);
  return next;
}

function countMoods(record: DayRecord, completedIds: Set<string>) {
  const counts: Partial<Record<MoodKey, number>> = {};
  const habitIds = new Set([...completedIds, ...Object.keys(record.habitMoods ?? {})]);

  habitIds.forEach((habitId) => {
    const mood = record.habitMoods?.[habitId] ?? (completedIds.has(habitId) ? "done" : undefined);
    if (!mood || !safeMoodKeys.includes(mood)) {
      return;
    }

    counts[mood] = (counts[mood] ?? 0) + 1;
  });

  return counts;
}

function safeHabitKey(habit: Habit) {
  if (habit.thumbnail.startsWith("icon:")) {
    return habit.thumbnail.replace("icon:", "");
  }

  return getHabitCategory(habit);
}
