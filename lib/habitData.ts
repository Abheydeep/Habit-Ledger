export const STORAGE_KEY = "pro-habit-tracker:india:v1";
export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type MoodKey = "done" | "strong" | "partial" | "skipped" | "rest";
export type DayPartKey = "morning" | "daytime" | "evening";
export type HabitRequirement = "permanent" | "optional";
export type HabitCategoryKey =
  | "morning-routine"
  | "health"
  | "digital-detox"
  | "focus-learning"
  | "evening-routine"
  | "life-admin";

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

export type HabitSample = Pick<Habit, "name" | "color" | "thumbnail" | "quip" | "dayPart"> & {
  id: string;
  category: HabitCategoryKey;
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

export const habitCategoryOrder: HabitCategoryKey[] = [
  "morning-routine",
  "health",
  "digital-detox",
  "focus-learning",
  "evening-routine",
  "life-admin"
];

export const habitCategoryMeta: Record<HabitCategoryKey, { label: string; description: string }> = {
  "morning-routine": {
    label: "Morning routine",
    description: "Wake-up, hydration, breathing, reading, affirmations."
  },
  health: {
    label: "Health",
    description: "Movement, water, food, meditation, skin and hair care."
  },
  "digital-detox": {
    label: "Digital detox",
    description: "No-scroll blocks and phone boundaries."
  },
  "focus-learning": {
    label: "Focus and learning",
    description: "Deep work, study, reading, and skill building."
  },
  "evening-routine": {
    label: "Evening routine",
    description: "Planning tomorrow, winding down, and sleep."
  },
  "life-admin": {
    label: "Life admin",
    description: "Money, home, family, and small reset tasks."
  }
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
  description: string;
  tone: string;
  src: string;
}> = [
  { key: "done", label: "Won", shortLabel: "Won", description: "Finished it", tone: "#0f766e", src: "status:done" },
  { key: "strong", label: "Strong", shortLabel: "Strong", description: "Crushed it", tone: "#2563eb", src: "status:strong" },
  { key: "partial", label: "Partial", shortLabel: "Half", description: "Some counts", tone: "#f59e0b", src: "status:partial" },
  { key: "skipped", label: "Skipped", shortLabel: "Skip", description: "Missed today", tone: "#dc2626", src: "status:skipped" },
  { key: "rest", label: "Rest day", shortLabel: "Rest", description: "Intentional off", tone: "#64748b", src: "status:rest" }
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
  { slug: "breathing", label: "Breathing", src: "icon:breathing" },
  { slug: "affirmations", label: "Affirmations", src: "icon:affirmations" },
  { slug: "meditation", label: "Meditation", src: "icon:meditation" },
  { slug: "skincare", label: "Skincare", src: "icon:skincare" },
  { slug: "haircare", label: "Haircare", src: "icon:haircare" },
  { slug: "plan-day", label: "Plan Day", src: "icon:plan-day" },
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

export const habitSamples: HabitSample[] = [
  {
    id: "sample-wake-6",
    name: "Wake up at 6:00",
    color: "#0f766e",
    thumbnail: "icon:wake-early",
    quip: "A clean start before the day gets noisy.",
    dayPart: "morning",
    category: "morning-routine"
  },
  {
    id: "sample-jeera-water",
    name: "Drink jeera water",
    color: "#0284c7",
    thumbnail: "icon:water",
    quip: "A small morning ritual before coffee or chai.",
    dayPart: "morning",
    category: "morning-routine"
  },
  {
    id: "sample-breathing",
    name: "Breathing exercise",
    color: "#0891b2",
    thumbnail: "icon:breathing",
    quip: "Two calm minutes before the day speeds up.",
    dayPart: "morning",
    category: "morning-routine"
  },
  {
    id: "sample-read-10-pages",
    name: "Read 10 pages",
    color: "#9333ea",
    thumbnail: "icon:read-news",
    quip: "Ten pages is enough to keep the reader alive.",
    dayPart: "morning",
    category: "morning-routine"
  },
  {
    id: "sample-affirmations",
    name: "Write affirmations",
    color: "#db2777",
    thumbnail: "icon:affirmations",
    quip: "Tell your brain what kind of day this is.",
    dayPart: "morning",
    category: "morning-routine"
  },
  {
    id: "sample-10k-steps",
    name: "10k steps",
    color: "#16a34a",
    thumbnail: "icon:steps",
    quip: "Walk it out before the day fully closes.",
    dayPart: "evening",
    category: "health"
  },
  {
    id: "sample-3l-water",
    name: "Drink 3L water",
    color: "#0284c7",
    thumbnail: "icon:water",
    quip: "A full bottle plan beats random sipping.",
    dayPart: "daytime",
    category: "health"
  },
  {
    id: "sample-no-sugar",
    name: "No sugar",
    color: "#ea580c",
    thumbnail: "icon:less-sugar",
    quip: "Skip the automatic sweet today.",
    dayPart: "daytime",
    category: "health"
  },
  {
    id: "sample-no-junk",
    name: "No junk food",
    color: "#f59e0b",
    thumbnail: "icon:healthy-meal",
    quip: "Keep snacks intentional, not accidental.",
    dayPart: "daytime",
    category: "health"
  },
  {
    id: "sample-skincare",
    name: "Skincare",
    color: "#db2777",
    thumbnail: "icon:skincare",
    quip: "Tiny care, visible consistency.",
    dayPart: "evening",
    category: "health"
  },
  {
    id: "sample-haircare",
    name: "Haircare",
    color: "#9333ea",
    thumbnail: "icon:haircare",
    quip: "A little grooming before it becomes a rescue mission.",
    dayPart: "evening",
    category: "health"
  },
  {
    id: "sample-meditation",
    name: "Meditation",
    color: "#0f766e",
    thumbnail: "icon:meditation",
    quip: "Sit still long enough to hear yourself again.",
    dayPart: "evening",
    category: "health"
  },
  {
    id: "sample-first-hour-no-screen",
    name: "First hour no screen",
    color: "#dc2626",
    thumbnail: "icon:screen-time",
    quip: "Win the morning before the phone does.",
    dayPart: "morning",
    category: "digital-detox"
  },
  {
    id: "sample-no-scrolling",
    name: "No scrolling",
    color: "#dc2626",
    thumbnail: "icon:screen-time",
    quip: "Use the phone. Do not fall into it.",
    dayPart: "evening",
    category: "digital-detox"
  },
  {
    id: "sample-no-reels-after-dinner",
    name: "No reels after dinner",
    color: "#db2777",
    thumbnail: "icon:screen-time",
    quip: "Let the evening land without a feed.",
    dayPart: "evening",
    category: "digital-detox"
  },
  {
    id: "sample-focus-block",
    name: "90 min focus block",
    color: "#2563eb",
    thumbnail: "icon:deep-work",
    quip: "One clean block. Phone away.",
    dayPart: "daytime",
    category: "focus-learning"
  },
  {
    id: "sample-learn-skill",
    name: "Learn a skill",
    color: "#0891b2",
    thumbnail: "icon:skill-learning",
    quip: "Something small that compounds.",
    dayPart: "daytime",
    category: "focus-learning"
  },
  {
    id: "sample-plan-tomorrow",
    name: "Plan tomorrow",
    color: "#4f46e5",
    thumbnail: "icon:plan-day",
    quip: "Tomorrow starts calmer when tonight decides.",
    dayPart: "evening",
    category: "evening-routine"
  },
  {
    id: "sample-lay-out-clothes",
    name: "Lay out clothes or bag",
    color: "#475569",
    thumbnail: "icon:home-reset",
    quip: "Remove one morning decision.",
    dayPart: "evening",
    category: "evening-routine"
  },
  {
    id: "sample-track-expenses",
    name: "Track expenses",
    color: "#ca8a04",
    thumbnail: "icon:budget",
    quip: "UPI adds up quietly. Catch it early.",
    dayPart: "evening",
    category: "life-admin"
  }
];

export function getHabitCategory(
  habit: Pick<Habit, "id" | "name" | "thumbnail" | "quip" | "dayPart">
): HabitCategoryKey {
  const text = `${habit.id} ${habit.name} ${habit.thumbnail} ${habit.quip}`.toLowerCase();

  if (/screen|scroll|reel|short|detox/.test(text)) {
    return "digital-detox";
  }

  if (/sleep|night|evening|plan tomorrow|plan next|advance|wind down|lay out/.test(text)) {
    return "evening-routine";
  }

  if (/jeera|breath|affirmation|wake|sunrise|first hour|read 10 pages/.test(text)) {
    return "morning-routine";
  }

  if (/steps|water|workout|yoga|meal|sugar|junk|skin|hair|meditat|health|stretch/.test(text)) {
    return "health";
  }

  if (/focus|skill|learn|read|page|study|course|work/.test(text)) {
    return "focus-learning";
  }

  if (/budget|expense|spend|family|home|clean|reset|bag|clothes/.test(text)) {
    return "life-admin";
  }

  if (habit.dayPart === "morning") {
    return "morning-routine";
  }

  if (habit.dayPart === "evening") {
    return "evening-routine";
  }

  return "focus-learning";
}

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
    breathing: {
      bg: "#ecfeff",
      tone: "#0891b2",
      accent: "#0f766e",
      body: '<path d="M25 39c8-8 18-8 26 0s18 8 26 0M25 56c8-8 18-8 26 0s18 8 26 0" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="48" r="23" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="6 8"/>'
    },
    affirmations: {
      bg: "#fdf2f8",
      tone: "#db2777",
      accent: "#f59e0b",
      body: '<rect x="24" y="23" width="48" height="54" rx="9" fill="none" stroke="currentColor" stroke-width="7"/><path d="M36 43h24M36 58h15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M48 75c-11-8-18-14-18-23 0-6 5-10 10-10 4 0 7 2 8 5 1-3 4-5 8-5 5 0 10 4 10 10 0 9-7 15-18 23Z" fill="var(--accent)" opacity=".9"/>'
    },
    meditation: {
      bg: "#eefcf7",
      tone: "#0f766e",
      accent: "#f59e0b",
      body: '<circle cx="48" cy="25" r="8" fill="currentColor"/><path d="M48 37v18M31 73c9-12 25-12 34 0M28 58c10 0 14-5 20-20 6 15 10 20 20 20" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 82h46" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>'
    },
    skincare: {
      bg: "#fff1f2",
      tone: "#db2777",
      accent: "#0f766e",
      body: '<path d="M48 19c10 13 16 22 16 33 0 12-7 20-16 20s-16-8-16-20c0-11 6-20 16-33Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="m67 25 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--accent)"/><path d="M38 77h20" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
    },
    haircare: {
      bg: "#f5f3ff",
      tone: "#7c3aed",
      accent: "#f59e0b",
      body: '<path d="M27 74V45c0-16 10-27 21-27s21 11 21 27v29" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M35 45c5-9 13-14 26-15M37 60c8 4 14 4 22 0" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/><circle cx="41" cy="47" r="3" fill="currentColor"/><circle cx="55" cy="47" r="3" fill="currentColor"/>'
    },
    "plan-day": {
      bg: "#eef2ff",
      tone: "#4f46e5",
      accent: "#0f766e",
      body: '<rect x="24" y="25" width="48" height="50" rx="8" fill="none" stroke="currentColor" stroke-width="7"/><path d="M34 20v12M62 20v12M34 45h28M34 58h14" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="m50 64 7 7 14-17" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
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
