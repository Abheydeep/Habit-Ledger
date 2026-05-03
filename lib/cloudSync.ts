import type { SupabaseClient } from "@supabase/supabase-js";
import type { TrackerState, MoodKey } from "./habitData";
import type { PersonalizationSnapshot } from "./personalization";

export type ConsentType = "sync" | "analytics" | "recommendations" | "ads_personalization";

export type ConsentState = Record<ConsentType, boolean>;

export type CloudOverview = {
  wins: number;
  dailyLogs: number;
  notes: number;
  intentSegments: number;
  lastSyncedAt: string | null;
};

type CloudWinRow = {
  id: string;
  local_id: string;
  title: string;
  quip: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  source: string;
  created_at: string;
  updated_at: string;
};

type CloudLogRow = {
  win_id: string;
  local_date: string;
  status: MoodKey;
};

type CloudNoteRow = {
  local_date: string;
  note: string;
};

export const CONSENT_STORAGE_KEY = "the-win-list:consents:v1";

export const defaultConsentState: ConsentState = {
  sync: false,
  analytics: false,
  recommendations: false,
  ads_personalization: false
};

export const consentLabels: Record<ConsentType, { title: string; detail: string }> = {
  sync: {
    title: "Cloud backup and sync",
    detail: "Upload wins, daily statuses, notes, and profile basics so the list can restore on another device."
  },
  analytics: {
    title: "Product analytics",
    detail: "Send broad usage events like sync count and completed-win totals so the product can improve."
  },
  recommendations: {
    title: "Better recommendations",
    detail: "Use life mode, goals, constraints, and win categories to suggest better future wins."
  },
  ads_personalization: {
    title: "Future ad personalization",
    detail: "Create broad intent segments only from consented answers and win categories; private notes are excluded."
  }
};

export function readStoredConsents(): ConsentState {
  if (typeof window === "undefined") {
    return defaultConsentState;
  }

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return defaultConsentState;
    }

    return normalizeConsentState(JSON.parse(stored) as Partial<ConsentState>);
  } catch {
    return defaultConsentState;
  }
}

export function saveStoredConsents(consents: ConsentState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consents));
  }
}

export function normalizeConsentState(value: Partial<ConsentState>): ConsentState {
  return {
    sync: Boolean(value.sync),
    analytics: Boolean(value.analytics),
    recommendations: Boolean(value.recommendations),
    ads_personalization: Boolean(value.ads_personalization)
  };
}

export async function sendMagicLink(client: SupabaseClient, email: string) {
  const redirectTo = typeof window !== "undefined" ? window.location.href : undefined;
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveCloudConsents(client: SupabaseClient, userId: string, consents: ConsentState) {
  const now = new Date().toISOString();
  const rows = (Object.entries(consents) as Array<[ConsentType, boolean]>).map(([consentType, granted]) => ({
    user_id: userId,
    consent_type: consentType,
    granted,
    consent_version: "2026-05-03.v1",
    created_at: now
  }));

  const { error } = await client.from("user_consents").upsert(rows, {
    onConflict: "user_id,consent_type"
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadLocalSnapshot({
  client,
  userId,
  tracker,
  personalization,
  consents,
  themeKey,
  anonymousId
}: {
  client: SupabaseClient;
  userId: string;
  tracker: TrackerState;
  personalization: PersonalizationSnapshot | null;
  consents: ConsentState;
  themeKey: string;
  anonymousId: string;
}) {
  if (!consents.sync) {
    throw new Error("Turn on cloud backup and sync before uploading this browser's Win List.");
  }

  const now = new Date().toISOString();
  await saveCloudConsents(client, userId, consents);
  await upsertProfile(client, userId, personalization, now);
  await upsertWins(client, userId, tracker, now);

  const winIdMap = await getWinIdMap(client, userId);
  await replaceDailyLogs(client, userId, tracker, winIdMap);
  await replaceDailyNotes(client, userId, tracker);
  await upsertAvatarProfile(client, userId, personalization, themeKey, now);
  await replaceIntentSegments(client, userId, tracker, personalization, consents, now);
  await insertUsageEvent(client, userId, anonymousId, consents, "sync_upload", {
    wins: tracker.habits.length,
    days: Object.keys(tracker.days).length,
    intent_segments_enabled: consents.ads_personalization
  });

  return getCloudOverview(client, userId);
}

export async function downloadCloudSnapshot(client: SupabaseClient, userId: string): Promise<TrackerState | null> {
  const [winsResult, logsResult, notesResult] = await Promise.all([
    client
      .from("wins")
      .select("id,local_id,title,quip,icon,color,sort_order,is_active,source,created_at,updated_at")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    client.from("daily_win_logs").select("win_id,local_date,status").eq("user_id", userId),
    client.from("daily_notes").select("local_date,note").eq("user_id", userId)
  ]);

  if (winsResult.error) {
    throw new Error(winsResult.error.message);
  }
  if (logsResult.error) {
    throw new Error(logsResult.error.message);
  }
  if (notesResult.error) {
    throw new Error(notesResult.error.message);
  }

  const wins = (winsResult.data ?? []) as CloudWinRow[];

  if (wins.length === 0) {
    return null;
  }

  const idToLocalId = new Map(wins.map((win) => [win.id, win.local_id]));
  const days: TrackerState["days"] = {};

  for (const log of (logsResult.data ?? []) as CloudLogRow[]) {
    const localId = idToLocalId.get(log.win_id);
    if (!localId) {
      continue;
    }

    const record = days[log.local_date] ?? { completedHabitIds: [], habitMoods: {} };
    days[log.local_date] = {
      ...record,
      completedHabitIds: record.completedHabitIds.includes(localId)
        ? record.completedHabitIds
        : [...record.completedHabitIds, localId],
      habitMoods: {
        ...(record.habitMoods ?? {}),
        [localId]: log.status
      }
    };
  }

  for (const note of (notesResult.data ?? []) as CloudNoteRow[]) {
    const record = days[note.local_date] ?? { completedHabitIds: [], habitMoods: {} };
    days[note.local_date] = {
      ...record,
      note: note.note
    };
  }

  const createdAt = wins[0]?.created_at ?? new Date().toISOString();
  const updatedAt = wins.reduce((latest, win) => (win.updated_at > latest ? win.updated_at : latest), createdAt);

  return {
    version: 1,
    habits: wins.map((win, index) => ({
      id: win.local_id,
      name: win.title,
      order: Number.isFinite(win.sort_order) ? win.sort_order : index,
      color: win.color,
      thumbnail: win.icon,
      quip: win.quip ?? "Synced win ready for today.",
      createdAt: win.created_at,
      pausedAt: win.is_active ? undefined : win.updated_at
    })),
    days,
    createdAt,
    updatedAt
  };
}

export async function getCloudOverview(client: SupabaseClient, userId: string): Promise<CloudOverview> {
  const [wins, logs, notes, segments, latestWin] = await Promise.all([
    client.from("wins").select("id", { count: "exact", head: true }).eq("user_id", userId),
    client.from("daily_win_logs").select("id", { count: "exact", head: true }).eq("user_id", userId),
    client.from("daily_notes").select("id", { count: "exact", head: true }).eq("user_id", userId),
    client.from("intent_segments").select("id", { count: "exact", head: true }).eq("user_id", userId),
    client
      .from("wins")
      .select("updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
  ]);

  const errors = [wins.error, logs.error, notes.error, segments.error, latestWin.error].filter(Boolean);
  if (errors[0]) {
    throw new Error(errors[0].message);
  }

  return {
    wins: wins.count ?? 0,
    dailyLogs: logs.count ?? 0,
    notes: notes.count ?? 0,
    intentSegments: segments.count ?? 0,
    lastSyncedAt: ((latestWin.data ?? []) as Array<{ updated_at?: string }>)[0]?.updated_at ?? null
  };
}

async function upsertProfile(
  client: SupabaseClient,
  userId: string,
  personalization: PersonalizationSnapshot | null,
  now: string
) {
  if (!personalization) {
    return;
  }

  const input = personalization.input;
  const { error } = await client.from("profiles").upsert(
    {
      user_id: userId,
      display_name: input.displayName.trim() || null,
      city: input.city.trim() || null,
      age_range: input.ageBand,
      gender: input.avatarStyle === "auto" ? null : input.avatarStyle,
      life_mode: input.routineType,
      daily_available_minutes: input.dailyAvailableMinutes,
      onboarding_completed: true,
      created_at: now,
      updated_at: now
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertWins(client: SupabaseClient, userId: string, tracker: TrackerState, now: string) {
  const rows = tracker.habits.map((habit) => ({
    user_id: userId,
    local_id: habit.id,
    title: habit.name,
    quip: habit.quip,
    icon: habit.thumbnail,
    color: habit.color,
    sort_order: habit.order,
    is_active: !habit.pausedAt,
    source: habit.id.startsWith("custom-") ? "user_created" : habit.id.startsWith("personal-") ? "personalized" : "default",
    created_at: habit.createdAt || now,
    updated_at: now
  }));

  const { error } = await client.from("wins").upsert(rows, {
    onConflict: "user_id,local_id"
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function getWinIdMap(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from("wins").select("id,local_id").eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.local_id as string, row.id as string]));
}

async function replaceDailyLogs(
  client: SupabaseClient,
  userId: string,
  tracker: TrackerState,
  winIdMap: Map<string, string>
) {
  const dates = Object.keys(tracker.days);

  if (dates.length > 0) {
    const { error: deleteError } = await client
      .from("daily_win_logs")
      .delete()
      .eq("user_id", userId)
      .in("local_date", dates);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  const rows = Object.entries(tracker.days).flatMap(([localDate, record]) => {
    const ids = new Set([...record.completedHabitIds, ...Object.keys(record.habitMoods ?? {})]);
    return [...ids].flatMap((localId) => {
      const winId = winIdMap.get(localId);
      if (!winId) {
        return [];
      }

      return [
        {
          user_id: userId,
          win_id: winId,
          local_date: localDate,
          status: record.habitMoods?.[localId] ?? "done",
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    });
  });

  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from("daily_win_logs").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

async function replaceDailyNotes(client: SupabaseClient, userId: string, tracker: TrackerState) {
  const dates = Object.keys(tracker.days);

  if (dates.length > 0) {
    const { error: deleteError } = await client.from("daily_notes").delete().eq("user_id", userId).in("local_date", dates);
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  const now = new Date().toISOString();
  const rows = Object.entries(tracker.days)
    .filter(([, record]) => Boolean(record.note?.trim()))
    .map(([localDate, record]) => ({
      user_id: userId,
      local_date: localDate,
      note: record.note?.trim() ?? "",
      created_at: now,
      updated_at: now
    }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from("daily_notes").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertAvatarProfile(
  client: SupabaseClient,
  userId: string,
  personalization: PersonalizationSnapshot | null,
  themeKey: string,
  now: string
) {
  if (!personalization) {
    return;
  }

  const input = personalization.input;
  const { error } = await client.from("avatar_profiles").upsert(
    {
      user_id: userId,
      age_range: input.ageBand,
      gender: input.avatarStyle === "auto" ? "auto" : input.avatarStyle,
      life_mode: input.routineType,
      theme_key: themeKey,
      avatar_asset_url: `/assets/avatars/${input.ageBand === "45+" ? "45-plus" : input.ageBand}/${input.routineType}-${
        input.avatarStyle === "auto" ? "neutral" : input.avatarStyle
      }.webp`,
      prompt_metadata: {
        characterBrief: personalization.characterBrief,
        city: input.city,
        goals: input.primaryGoals,
        constraints: input.constraints
      },
      created_at: now
    },
    { onConflict: "user_id,age_range,gender,life_mode,theme_key" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function replaceIntentSegments(
  client: SupabaseClient,
  userId: string,
  tracker: TrackerState,
  personalization: PersonalizationSnapshot | null,
  consents: ConsentState,
  now: string
) {
  const { error: deleteError } = await client.from("intent_segments").delete().eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!consents.ads_personalization || !personalization) {
    return;
  }

  const rows = buildIntentSegments(tracker, personalization).map((segment) => ({
    user_id: userId,
    source: segment.source,
    segment_key: segment.key,
    segment_value: segment.value,
    confidence: segment.confidence,
    consent_required: "ads_personalization",
    created_at: now
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from("intent_segments").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

function buildIntentSegments(tracker: TrackerState, personalization: PersonalizationSnapshot) {
  const input = personalization.input;
  const segments: Array<{ source: string; key: string; value: string; confidence: number }> = [
    { source: "onboarding", key: "life_mode", value: input.routineType, confidence: 0.95 },
    { source: "onboarding", key: "age_range", value: input.ageBand, confidence: 0.9 },
    { source: "onboarding", key: "daily_time_bucket", value: bucketDailyTime(input.dailyAvailableMinutes), confidence: 0.85 }
  ];

  for (const goal of input.primaryGoals) {
    segments.push({ source: "onboarding", key: "goal", value: normalizeSegmentValue(goal), confidence: 0.9 });
  }

  for (const constraint of input.constraints) {
    segments.push({ source: "onboarding", key: "constraint", value: normalizeSegmentValue(constraint), confidence: 0.8 });
  }

  for (const category of inferWinCategories(tracker)) {
    segments.push({ source: "daily_wins", key: "win_category", value: category, confidence: 0.72 });
  }

  if (input.city.trim()) {
    segments.push({ source: "onboarding", key: "city", value: normalizeSegmentValue(input.city), confidence: 0.7 });
  }

  return uniqueSegments(segments).slice(0, 30);
}

async function insertUsageEvent(
  client: SupabaseClient,
  userId: string,
  anonymousId: string,
  consents: ConsentState,
  eventName: string,
  metadata: Record<string, unknown>
) {
  if (!consents.analytics) {
    return;
  }

  await client.from("usage_events").insert({
    user_id: userId,
    anonymous_id: anonymousId,
    event_name: eventName,
    event_metadata: metadata,
    created_at: new Date().toISOString()
  });
}

function bucketDailyTime(minutes: number) {
  if (minutes <= 20) {
    return "quick";
  }
  if (minutes <= 45) {
    return "steady";
  }
  return "deep";
}

function inferWinCategories(tracker: TrackerState) {
  const text = tracker.habits.map((habit) => `${habit.id} ${habit.name} ${habit.quip}`).join(" ").toLowerCase();
  const map: Record<string, string[]> = {
    fitness: ["walk", "steps", "workout", "stretch", "yoga", "movement"],
    focus: ["focus", "study", "deep work", "sprint", "revision"],
    sleep: ["sleep", "bedtime", "shutdown", "wind down"],
    money: ["expense", "cash", "upi", "budget", "tally"],
    food: ["meal", "water", "healthy", "plate", "bottle"],
    screen_balance: ["screen", "scroll", "reels", "shorts", "phone"],
    self_care: ["calm", "me-time", "family", "reset"]
  };

  return Object.entries(map)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([category]) => category);
}

function normalizeSegmentValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function uniqueSegments(segments: Array<{ source: string; key: string; value: string; confidence: number }>) {
  const seen = new Set<string>();
  return segments.filter((segment) => {
    const id = `${segment.source}:${segment.key}:${segment.value}`;
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return Boolean(segment.value);
  });
}
