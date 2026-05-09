import type { DayRecord } from "./habitData";

export type ProductExperienceState =
  | "first_run_empty"
  | "first_run_started"
  | "starter_active_no_history"
  | "active_with_history"
  | "returning_lapsed";

export type AnalyticsUnlockStage = "locked" | "recap" | "review" | "patterns";

export type TrackerActivitySummary = {
  hasActivity: boolean;
  todayHasActivity: boolean;
  activeDayCount: number;
  totalLoggedWins: number;
  lastActiveDateKey: string | null;
  daysSinceLastActive: number | null;
};

type ProductExperienceInput = {
  hasPersonalization: boolean;
  defaultWinSetup: boolean;
  activity: TrackerActivitySummary;
};

const REVIEW_ACTIVE_DAY_THRESHOLD = 2;
const REVIEW_WIN_THRESHOLD = 3;
const PATTERN_ACTIVE_DAY_THRESHOLD = 5;
const PATTERN_WIN_THRESHOLD = 12;
const LAPSED_DAY_THRESHOLD = 2;

export function summarizeTrackerActivity(
  days: Record<string, DayRecord>,
  todayKey: string
): TrackerActivitySummary {
  const activeDateKeys = Object.entries(days)
    .filter(([, record]) => hasActivityInDay(record))
    .map(([dateKey]) => dateKey)
    .sort();
  const lastActiveDateKey = activeDateKeys.at(-1) ?? null;
  const daysSinceLastActive = lastActiveDateKey ? diffDateKeys(lastActiveDateKey, todayKey) : null;

  return {
    hasActivity: activeDateKeys.length > 0,
    todayHasActivity: Boolean(days[todayKey] && hasActivityInDay(days[todayKey])),
    activeDayCount: activeDateKeys.length,
    totalLoggedWins: Object.values(days).reduce((total, record) => total + countLoggedWins(record), 0),
    lastActiveDateKey,
    daysSinceLastActive
  };
}

export function hasActivityInDay(record: DayRecord | undefined) {
  return Boolean(
    record &&
      (record.completedHabitIds.length > 0 || Object.keys(record.habitMoods ?? {}).length > 0 || record.note)
  );
}

export function getProductExperienceState({
  hasPersonalization,
  defaultWinSetup,
  activity
}: ProductExperienceInput): ProductExperienceState {
  if (!activity.hasActivity && defaultWinSetup && !hasPersonalization) {
    return "first_run_empty";
  }

  if (!activity.todayHasActivity && activity.daysSinceLastActive !== null && activity.daysSinceLastActive >= LAPSED_DAY_THRESHOLD) {
    return "returning_lapsed";
  }

  if (activity.todayHasActivity && activity.activeDayCount <= 1) {
    return "first_run_started";
  }

  if (!hasPersonalization && defaultWinSetup && activity.activeDayCount < REVIEW_ACTIVE_DAY_THRESHOLD) {
    return "starter_active_no_history";
  }

  return "active_with_history";
}

export function getAnalyticsUnlockStage(activity: TrackerActivitySummary): AnalyticsUnlockStage {
  if (!activity.hasActivity) {
    return "locked";
  }

  if (activity.activeDayCount >= PATTERN_ACTIVE_DAY_THRESHOLD || activity.totalLoggedWins >= PATTERN_WIN_THRESHOLD) {
    return "patterns";
  }

  if (activity.activeDayCount >= REVIEW_ACTIVE_DAY_THRESHOLD || activity.totalLoggedWins >= REVIEW_WIN_THRESHOLD) {
    return "review";
  }

  return "recap";
}

export function canShowMonthlyReview(stage: AnalyticsUnlockStage) {
  return stage === "review" || stage === "patterns";
}

export function canShowPatternAnalytics(stage: AnalyticsUnlockStage) {
  return stage === "patterns";
}

function countLoggedWins(record: DayRecord) {
  const winIds = new Set(record.completedHabitIds);
  for (const [habitId, status] of Object.entries(record.habitMoods ?? {})) {
    if (status && status !== "skipped" && status !== "rest") {
      winIds.add(habitId);
    } else {
      winIds.delete(habitId);
    }
  }

  return winIds.size;
}

function diffDateKeys(fromDateKey: string, toDateKey: string) {
  return Math.floor((dateKeyToUtcTime(toDateKey) - dateKeyToUtcTime(fromDateKey)) / 86_400_000);
}

function dateKeyToUtcTime(dateKey: string) {
  const [year = "0", month = "1", day = "1"] = dateKey.split("-");
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}
