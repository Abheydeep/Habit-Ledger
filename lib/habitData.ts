export const STORAGE_KEY = "pro-habit-tracker:india:v1";
export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type MoodKey = "done" | "strong" | "partial" | "skipped" | "rest";
export type DayPartKey = "morning" | "daytime" | "evening";
export type HabitRequirement = "permanent" | "optional";

export type Habit = {
  id: string;
  name: string;
  order: number;
  color: string;
  thumbnail: string;
  quip: string;
  createdAt: string;
  dayPart?: DayPartKey;
  pausedAt?: string;
  requirement?: HabitRequirement;
};

export type DayRecord = {
  completedHabitIds: string[];
  habitMoods?: Partial<Record<string, MoodKey>>;
  note?: string;
};

export type TrackerState = {
  version: 1;
  habits: Habit[];
  days: Record<string, DayRecord>;
  createdAt: string;
  updatedAt: string;
};

export type ThumbnailOption = {
  slug: string;
  label: string;
  src: string;
};

export function isDayPartKey(value: unknown): value is DayPartKey {
  return value === "morning" || value === "daytime" || value === "evening";
}

export function isHabitRequirement(value: unknown): value is HabitRequirement {
  return value === "permanent" || value === "optional";
}

export const moodOptions: Array<{
  key: MoodKey;
  label: string;
  shortLabel: string;
  tone: string;
  src: string;
}> = [
  { key: "done", label: "Won", shortLabel: "Won", tone: "#0f766e", src: "status:done" },
  { key: "strong", label: "Strong", shortLabel: "Strong", tone: "#2563eb", src: "status:strong" },
  { key: "partial", label: "Partial", shortLabel: "Half", tone: "#f59e0b", src: "status:partial" },
  { key: "skipped", label: "Skipped", shortLabel: "Skip", tone: "#dc2626", src: "status:skipped" },
  { key: "rest", label: "Rest day", shortLabel: "Rest", tone: "#64748b", src: "status:rest" }
];

export const thumbnailOptions: ThumbnailOption[] = [
  { slug: "wake-early", label: "Early Start", src: "icon:wake-early" },
  { slug: "water", label: "Water Intake", src: "icon:water" },
  { slug: "steps", label: "Walk / Steps", src: "icon:steps" },
  { slug: "yoga-workout", label: "Yoga / Workout", src: "icon:yoga-workout" },
  { slug: "healthy-meal", label: "Healthy Meal", src: "icon:healthy-meal" },
  { slug: "deep-work", label: "Deep Work", src: "icon:deep-work" },
  { slug: "skill-learning", label: "Skill Learning", src: "icon:skill-learning" },
  { slug: "read-news", label: "Reading", src: "icon:read-news" },
  { slug: "budget", label: "Expense Log", src: "icon:budget" },
  { slug: "family", label: "Family Check-in", src: "icon:family" },
  { slug: "home-reset", label: "Home Reset", src: "icon:home-reset" },
  { slug: "screen-time", label: "Screen Limit", src: "icon:screen-time" },
  { slug: "less-sugar", label: "Less Sugar", src: "icon:less-sugar" },
  { slug: "sleep", label: "Sleep Routine", src: "icon:sleep" }
];

const habitSeeds: Array<Omit<Habit, "createdAt">> = [
  {
    id: "wake-early",
    name: "Wake up on time",
    order: 0,
    color: "#0f766e",
    thumbnail: "icon:wake-early",
    quip: "Start before the day starts chasing you."
  },
  {
    id: "water",
    name: "Drink 2-3L water",
    order: 1,
    color: "#0284c7",
    thumbnail: "icon:water",
    quip: "Small sips, fewer headaches."
  },
  {
    id: "steps",
    name: "Walk 6k-8k steps",
    order: 2,
    color: "#16a34a",
    thumbnail: "icon:steps",
    quip: "Evening walk counts. So does the metro sprint."
  },
  {
    id: "yoga-workout",
    name: "Yoga or workout",
    order: 3,
    color: "#7c3aed",
    thumbnail: "icon:yoga-workout",
    quip: "Mobility, strength, or a sincere attempt."
  },
  {
    id: "healthy-meal",
    name: "Healthy home meal",
    order: 4,
    color: "#f59e0b",
    thumbnail: "icon:healthy-meal",
    quip: "Tiffin energy beats random snacking."
  },
  {
    id: "deep-work",
    name: "90 min focused work",
    order: 5,
    color: "#2563eb",
    thumbnail: "icon:deep-work",
    quip: "One clean focus block, notifications outside."
  },
  {
    id: "skill-learning",
    name: "Learn a skill",
    order: 6,
    color: "#0891b2",
    thumbnail: "icon:skill-learning",
    quip: "Course, coding, English, finance, anything compounding."
  },
  {
    id: "budget",
    name: "Track expenses",
    order: 7,
    color: "#ca8a04",
    thumbnail: "icon:budget",
    quip: "UPI adds up quietly. Catch it early."
  },
  {
    id: "screen-time",
    name: "Limit reels/shorts",
    order: 8,
    color: "#dc2626",
    thumbnail: "icon:screen-time",
    quip: "Entertainment is fine. The black hole is not."
  },
  {
    id: "sleep",
    name: "Sleep by 11:30",
    order: 9,
    color: "#4f46e5",
    thumbnail: "icon:sleep",
    quip: "Tomorrow gets easier when tonight behaves."
  }
];

export function createDefaultState(now = new Date().toISOString()): TrackerState {
  return {
    version: 1,
    habits: habitSeeds.map((habit, index) => ({
      ...habit,
      createdAt: now,
      requirement: index < 5 ? "permanent" : "optional"
    })),
    days: {},
    createdAt: now,
    updatedAt: now
  };
}

export function assetUrl(path: string) {
  if (path.startsWith("icon:")) {
    return dataSvg(habitIcon(path.slice(5)));
  }

  if (path.startsWith("status:")) {
    return dataSvg(statusIcon(path.slice(7)));
  }

  if (!APP_BASE_PATH || path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }

  return `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isTrackerState(value: unknown): value is TrackerState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TrackerState>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.habits) &&
    typeof candidate.days === "object" &&
    candidate.days !== null
  );
}

export function normalizeImportedState(value: TrackerState): TrackerState {
  const now = new Date().toISOString();
  const fallback = createDefaultState(now);
  const habits = value.habits
    .filter((habit) => habit && typeof habit.id === "string" && typeof habit.name === "string")
    .map((habit, index) => {
      const legacyHabit = habit as Partial<Habit> & { permanentAt?: unknown };
      return {
        id: habit.id,
        name: habit.name,
        order: Number.isFinite(habit.order) ? habit.order : index,
        color: typeof habit.color === "string" ? habit.color : fallback.habits[index % fallback.habits.length].color,
        thumbnail:
          typeof habit.thumbnail === "string"
            ? habit.thumbnail
            : fallback.habits[index % fallback.habits.length].thumbnail,
        quip: typeof habit.quip === "string" ? habit.quip : "Custom win ready to track.",
        createdAt: typeof habit.createdAt === "string" ? habit.createdAt : now,
        dayPart: isDayPartKey(habit.dayPart) ? habit.dayPart : undefined,
        pausedAt: typeof habit.pausedAt === "string" ? habit.pausedAt : undefined,
        requirement: isHabitRequirement(legacyHabit.requirement)
          ? legacyHabit.requirement
          : typeof legacyHabit.permanentAt === "string"
            ? "permanent"
            : undefined
      };
    });
  const normalizedHabits = (habits.length > 0 ? habits : fallback.habits)
    .sort((a, b) => a.order - b.order)
    .map((habit, index) => ({
      ...habit,
      order: index,
      requirement: habit.requirement ?? (index < 5 ? "permanent" : "optional")
    }));
  const habitIds = new Set(normalizedHabits.map((habit) => habit.id));

  const normalizedDays = Object.fromEntries(
    Object.entries(value.days && typeof value.days === "object" ? value.days : {}).map(([dateKey, record]) => {
      const legacyRecord = record as DayRecord & { mood?: MoodKey };
      const completedHabitIds = Array.isArray(record.completedHabitIds)
        ? record.completedHabitIds.filter((habitId) => habitIds.has(habitId))
        : [];
      const legacyMoods =
        legacyRecord.mood && completedHabitIds.length > 0
          ? Object.fromEntries(completedHabitIds.map((habitId) => [habitId, legacyRecord.mood]))
          : {};
      const habitMoods =
        record.habitMoods && typeof record.habitMoods === "object"
          ? Object.fromEntries(Object.entries(record.habitMoods).filter(([habitId]) => habitIds.has(habitId)))
          : {};

      return [
        dateKey,
        {
          completedHabitIds,
          habitMoods: { ...legacyMoods, ...habitMoods },
          note: typeof record.note === "string" ? record.note : undefined
        }
      ];
    })
  );

  return {
    version: 1,
    habits: normalizedHabits,
    days: normalizedDays,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: now
  };
}

function dataSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function habitIcon(slug: string) {
  const map: Record<string, { bg: string; tone: string; accent: string; body: string }> = {
    "wake-early": {
      bg: "#eefcf7",
      tone: "#0f766e",
      accent: "#f59e0b",
      body: '<circle cx="48" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="7"/><path d="M48 28v-7M48 79v-7M27 50h-7M76 50h-7M35 37l-5-5M66 37l5-5" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M39 51h18" stroke="var(--accent)" stroke-width="7" stroke-linecap="round"/>'
    },
    water: {
      bg: "#eef8ff",
      tone: "#0284c7",
      accent: "#38bdf8",
      body: '<path d="M48 18c13 16 21 28 21 43 0 15-10 25-21 25S27 76 27 61c0-15 8-27 21-43Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M39 64c3 5 9 7 15 4" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    steps: {
      bg: "#f0fdf4",
      tone: "#16a34a",
      accent: "#84cc16",
      body: '<path d="M30 67c7 0 12 5 12 11 0 5-4 8-10 8-8 0-14-6-14-13 0-4 5-6 12-6ZM62 45c9 0 15 6 15 14 0 6-5 10-12 10-9 0-17-7-17-16 0-5 6-8 14-8Z" fill="currentColor"/><path d="M35 55c4-10 11-19 21-27" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" fill="none"/>'
    },
    "yoga-workout": {
      bg: "#f5f3ff",
      tone: "#7c3aed",
      accent: "#0f766e",
      body: '<circle cx="48" cy="26" r="8" fill="currentColor"/><path d="M31 70h34M48 36v24M31 53c9 0 13-5 17-17 4 12 8 17 17 17" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 80h46" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    "healthy-meal": {
      bg: "#fff7ed",
      tone: "#f59e0b",
      accent: "#16a34a",
      body: '<path d="M24 50h48c0 16-10 28-24 28S24 66 24 50Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M34 43c5-11 18-16 31-11-4 11-16 16-31 11Z" fill="var(--accent)"/><path d="M31 84h34" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
    },
    "deep-work": {
      bg: "#eff6ff",
      tone: "#2563eb",
      accent: "#f59e0b",
      body: '<rect x="22" y="26" width="52" height="36" rx="7" fill="none" stroke="currentColor" stroke-width="7"/><path d="M35 76h26M48 62v14" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M38 43h20" stroke="var(--accent)" stroke-width="7" stroke-linecap="round"/>'
    },
    "skill-learning": {
      bg: "#ecfeff",
      tone: "#0891b2",
      accent: "#f59e0b",
      body: '<path d="M21 33c12-6 24-6 27 2 3-8 15-8 27-2v39c-12-6-24-6-27 2-3-8-15-8-27-2V33Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M48 35v38M31 47h10M55 47h10" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>'
    },
    "read-news": {
      bg: "#faf5ff",
      tone: "#9333ea",
      accent: "#0f766e",
      body: '<rect x="23" y="24" width="50" height="48" rx="6" fill="none" stroke="currentColor" stroke-width="7"/><path d="M34 39h28M34 51h19M34 63h25" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="66" r="8" fill="var(--accent)"/>'
    },
    budget: {
      bg: "#fffbeb",
      tone: "#ca8a04",
      accent: "#0f766e",
      body: '<rect x="23" y="24" width="50" height="50" rx="8" fill="none" stroke="currentColor" stroke-width="7"/><path d="M38 38h18c6 0 9 4 9 9s-3 9-9 9H38M38 38v36M34 38h8M34 56h8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 80h34" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    family: {
      bg: "#fdf2f8",
      tone: "#db2777",
      accent: "#f59e0b",
      body: '<circle cx="36" cy="36" r="10" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="62" cy="38" r="8" fill="none" stroke="currentColor" stroke-width="6"/><path d="M20 76c3-14 12-22 26-22s23 8 26 22" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M36 65c7 6 17 6 24 0" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    "home-reset": {
      bg: "#f8fafc",
      tone: "#475569",
      accent: "#0f766e",
      body: '<path d="M20 46 48 23l28 23" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 44v34h38V44" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="m39 62 7 7 14-17" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    "screen-time": {
      bg: "#fef2f2",
      tone: "#dc2626",
      accent: "#2563eb",
      body: '<rect x="28" y="18" width="40" height="60" rx="9" fill="none" stroke="currentColor" stroke-width="7"/><path d="M39 61h18M36 38l24 24M60 38 36 62" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    "less-sugar": {
      bg: "#fff7ed",
      tone: "#ea580c",
      accent: "#dc2626",
      body: '<path d="M31 29h34l-4 49H35L31 29Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M28 29h40M40 20h16" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M38 47h20M48 37v20" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    sleep: {
      bg: "#eef2ff",
      tone: "#4f46e5",
      accent: "#f59e0b",
      body: '<path d="M64 68A28 28 0 0 1 39 26c-9 3-16 12-16 23 0 15 12 27 27 27 6 0 11-2 15-5Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="m68 25 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--accent)"/>'
    }
  };

  const icon = map[slug] ?? map["deep-work"];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" style="--accent:${icon.accent};color:${icon.tone}"><rect width="96" height="96" rx="22" fill="${icon.bg}"/><g>${icon.body}</g></svg>`;
}

function statusIcon(status: string) {
  const map: Record<string, { bg: string; tone: string; body: string }> = {
    done: {
      bg: "#ecfdf5",
      tone: "#0f766e",
      body: '<path d="m28 50 13 13 28-33" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    strong: {
      bg: "#eff6ff",
      tone: "#2563eb",
      body: '<path d="M48 18 58 38l22 3-16 16 4 22-20-10-20 10 4-22-16-16 22-3Z" fill="currentColor"/>'
    },
    partial: {
      bg: "#fffbeb",
      tone: "#f59e0b",
      body: '<circle cx="48" cy="48" r="27" fill="none" stroke="currentColor" stroke-width="8"/><path d="M48 21a27 27 0 0 1 0 54Z" fill="currentColor"/>'
    },
    skipped: {
      bg: "#fef2f2",
      tone: "#dc2626",
      body: '<path d="M31 31 65 65M65 31 31 65" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>'
    },
    rest: {
      bg: "#f8fafc",
      tone: "#64748b",
      body: '<path d="M64 67A25 25 0 0 1 42 30c-8 3-14 11-14 21 0 13 11 24 24 24 5 0 9-2 12-5Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>'
    }
  };

  const icon = map[status] ?? map.done;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" style="color:${icon.tone}"><rect width="96" height="96" rx="22" fill="${icon.bg}"/><g>${icon.body}</g></svg>`;
}
