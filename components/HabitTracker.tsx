"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  Cloud,
  ClipboardCheck,
  CircleDot,
  Download,
  FileUp,
  Footprints,
  Home,
  Leaf,
  Moon,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Wand2,
  X
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode
} from "react";
import {
  STORAGE_KEY,
  assetUrl,
  createDefaultState,
  isTrackerState,
  moodOptions,
  normalizeImportedState,
  thumbnailOptions,
  type DayRecord,
  type Habit,
  type MoodKey,
  type TrackerState
} from "../lib/habitData";
import {
  PERSONALIZATION_STORAGE_KEY,
  createCharacterBrief,
  createPersonalizationSummary,
  createPersonalizedHabits,
  defaultOnboardingInput,
  normalizeOnboardingInput,
  type PersonalizationSnapshot
} from "../lib/personalization";
import type { OnboardingInput } from "../lib/personalizationTestCases";
import {
  defaultConsentState,
  downloadCloudSnapshot,
  getCloudOverview,
  readStoredConsents,
  saveStoredConsents,
  sendMagicLink,
  uploadLocalSnapshot,
  type CloudOverview,
  type ConsentState
} from "../lib/cloudSync";
import { getSupabaseClient, isSupabaseConfigured, type SupabaseSession } from "../lib/supabaseClient";

const colorPalette = ["#0f766e", "#2563eb", "#f59e0b", "#16a34a", "#9333ea", "#db2777", "#475569"];
const COOKIE_KEY = "pro_habit_tracker_india_v1";
const HISTORY_STATE_KEY = "proHabitTrackerIndiaStateV1";
const THEME_STORAGE_KEY = "habit-ledger:theme:v1";
const COLOR_SCHEME_STORAGE_KEY = "the-win-list:color-scheme:v1";
const ANONYMOUS_ID_KEY = "the-win-list:anonymous-id:v1";
const emptyDay: DayRecord = { completedHabitIds: [], habitMoods: {} };
const copy = {
  brand: "The Win List",
  tagline: "Your must-do wins for today.",
  personalizedTitle: (name: string) => `${name}'s Win List`,
  buildCta: "Build my Win List",
  wins: "Wins",
  winsAndIcons: "Wins and icons",
  todayWins: "Today's wins",
  startingWins: "Your starting wins",
  wonToday: "Won today",
  newWin: "New win",
  addWin: "Add win",
  invalidBackup: "That file does not look like a The Win List backup.",
  shareImagePrefix: "the-win-list",
  backupPrefix: "the-win-list-backup",
  logoLabel: "The Win List logo"
};
const defaultWinMood = moodOptions.find((item) => item.key === "done");
const appThemes = {
  "fresh-ledger": {
    label: "Fresh Start",
    note: "Clean, trustworthy, and general-purpose.",
    primary: "#0f766e",
    secondary: "#2563eb",
    accent: "#f59e0b",
    background: "#eef7f3",
    surface: "#ffffff",
    soft: "#e4f3ee",
    ink: "#0f2f2e"
  },
  "study-lavender": {
    label: "Study Lavender",
    note: "Notebook energy for students and focused learning.",
    primary: "#7c3aed",
    secondary: "#3b82f6",
    accent: "#fbbf24",
    background: "#f5f0ff",
    surface: "#ffffff",
    soft: "#ede9fe",
    ink: "#27144f"
  },
  "home-rose": {
    label: "Home Rose",
    note: "Warm, soft, and gentle for home routines.",
    primary: "#db2777",
    secondary: "#fb7185",
    accent: "#fb923c",
    background: "#fff1f5",
    surface: "#ffffff",
    soft: "#ffe4ec",
    ink: "#4a162b"
  },
  "travel-sun": {
    label: "Travel Sun",
    note: "Bright and practical for moving days.",
    primary: "#ea580c",
    secondary: "#16a34a",
    accent: "#0284c7",
    background: "#fff7ed",
    surface: "#ffffff",
    soft: "#dcfce7",
    ink: "#3b2412"
  },
  "founder-gold": {
    label: "Founder Gold",
    note: "Premium, disciplined, and business-minded.",
    primary: "#0f2f2e",
    secondary: "#0f766e",
    accent: "#d6b45f",
    background: "#f7f4e8",
    surface: "#ffffff",
    soft: "#f4edcf",
    ink: "#10201f"
  }
} as const;
type AppThemeKey = keyof typeof appThemes;
type ColorScheme = "light" | "dark";
type SettingsSectionKey = "personalize" | "backup" | "theme" | "wins" | "sync";
const themeByRoutine: Record<OnboardingInput["routineType"], AppThemeKey> = {
  student: "study-lavender",
  "working-professional": "fresh-ledger",
  homemaker: "home-rose",
  "field-worker": "travel-sun",
  "business-owner": "founder-gold"
};
const characterOutfits: Record<OnboardingInput["routineType"], { title: string; detail: string }> = {
  student: {
    title: "Lavender learner fit",
    detail: "Campus jacket, notebook, backpack, and soft study-mode sparkles."
  },
  "working-professional": {
    title: "Teal work-casual fit",
    detail: "Blazer, clean shirt, day bag, and fresh office-friendly polish."
  },
  homemaker: {
    title: "Rose home-rhythm fit",
    detail: "Elegant kurta, dupatta, warm peach details, and calm home energy."
  },
  "field-worker": {
    title: "Sunny on-the-go fit",
    detail: "Travel jacket, cap, sling bag, scarf, and practical movement-ready accents."
  },
  "business-owner": {
    title: "Founder focus fit",
    detail: "Deep teal blazer, ivory shirt, muted gold, and a premium planner prop."
  }
};
const goalOptions = [
  "fitness",
  "focus",
  "better sleep",
  "screen balance",
  "money tracking",
  "learning",
  "exam prep",
  "self-care",
  "business discipline",
  "energy",
  "calmer routine"
];
const constraintOptions = [
  "long sitting hours",
  "late meetings",
  "hostel food",
  "food delivery temptation",
  "family interruptions",
  "travel",
  "heat",
  "irregular meals",
  "late-night phone use",
  "cash and UPI expenses",
  "limited alone time"
];
const lifeModeThemes: Record<
  OnboardingInput["routineType"],
  {
    label: string;
    kicker: string;
    headline: string;
    microcopy: string;
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    soft: string;
    hair: string;
    skin: string;
  }
> = {
  student: {
    label: "Study mode",
    kicker: "Notebook setup",
    headline: "Build a plan that survives classes, exams, and hostel chaos",
    microcopy: "A lighter academic routine with focus, sleep, movement, and screen control balanced together.",
    primary: "#7c3aed",
    secondary: "#a78bfa",
    accent: "#fbbf24",
    surface: "#fbf5ff",
    soft: "#eef2ff",
    hair: "#342057",
    skin: "#f2b891"
  },
  "working-professional": {
    label: "Workday mode",
    kicker: "Workday setup",
    headline: "Shape a routine around meetings, screens, and actual energy",
    microcopy: "A crisp office-friendly plan for focus blocks, movement breaks, food choices, and sleep protection.",
    primary: "#0f766e",
    secondary: "#38bdf8",
    accent: "#f59e0b",
    surface: "#effaf8",
    soft: "#e0f2fe",
    hair: "#25323b",
    skin: "#f0b389"
  },
  homemaker: {
    label: "Home rhythm",
    kicker: "Home rhythm setup",
    headline: "Make space for care, calm, and a little time for yourself",
    microcopy: "A warm routine for water, walks, home reset, rest, and small self-care moments.",
    primary: "#db2777",
    secondary: "#f9a8d4",
    accent: "#fb923c",
    surface: "#fff3f7",
    soft: "#fff7ed",
    hair: "#4a2a24",
    skin: "#e9a77c"
  },
  "field-worker": {
    label: "On-the-go mode",
    kicker: "Travel day setup",
    headline: "Create daily wins that work even when the day keeps moving",
    microcopy: "A practical plan for hydration, meals, money logs, movement, and flexible rest windows.",
    primary: "#ea580c",
    secondary: "#22c55e",
    accent: "#0284c7",
    surface: "#fff7ed",
    soft: "#ecfdf5",
    hair: "#2f241d",
    skin: "#d9966f"
  },
  "business-owner": {
    label: "Owner mode",
    kicker: "Founder setup",
    headline: "Turn busy business days into a clean personal operating rhythm",
    microcopy: "A premium routine for focus, finance clarity, inventory glance, movement, and real wind-down.",
    primary: "#0f2f2e",
    secondary: "#d6b45f",
    accent: "#0f766e",
    surface: "#fbfaf3",
    soft: "#f4f1df",
    hair: "#1f2933",
    skin: "#edb184"
  }
};

type CompletionCelebration = {
  id: number;
  habitId: string;
  tone: string;
  message: string;
};

type PerfectDayCelebration = {
  id: number;
  tone: string;
  total: number;
};

type AppToast = {
  id: number;
  message: string;
  tone: "success" | "error";
};

export function HabitTracker() {
  const [tracker, setTracker] = useState<TrackerState>(() => createDefaultState());
  const trackerRef = useRef(tracker);
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const selectedDateRef = useRef(selectedDate);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitThumbnail, setNewHabitThumbnail] = useState(thumbnailOptions[0].src);
  const [newHabitColor, setNewHabitColor] = useState(colorPalette[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(true);
  const [monthOpen, setMonthOpen] = useState(true);
  const [celebration, setCelebration] = useState<CompletionCelebration | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const [perfectDayCelebration, setPerfectDayCelebration] = useState<PerfectDayCelebration | null>(null);
  const perfectDayTimeoutRef = useRef<number | null>(null);
  const [appToast, setAppToast] = useState<AppToast | null>(null);
  const appToastTimeoutRef = useRef<number | null>(null);
  const [noteSavedVisible, setNoteSavedVisible] = useState(false);
  const noteSavedTimerRef = useRef<number | null>(null);
  const noteSavedHideTimerRef = useRef<number | null>(null);
  const [personalizerOpen, setPersonalizerOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingInput>(defaultOnboardingInput);
  const [personalizationSnapshot, setPersonalizationSnapshot] = useState<PersonalizationSnapshot | null>(null);
  const [appThemeKey, setAppThemeKey] = useState<AppThemeKey>("fresh-ledger");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [expandedSettingsSections, setExpandedSettingsSections] = useState<Record<SettingsSectionKey, boolean>>({
    personalize: false,
    backup: false,
    theme: true,
    wins: false,
    sync: false
  });
  const [cloudSession, setCloudSession] = useState<SupabaseSession | null>(null);
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("Local-first mode is on. Sign in only when you want backup or sync.");
  const [cloudOverview, setCloudOverview] = useState<CloudOverview | null>(null);
  const [consents, setConsents] = useState<ConsentState>(defaultConsentState);

  useEffect(() => {
    let loadedTracker: TrackerState | null = null;
    const stored = readSavedTrackerState();

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (isTrackerState(parsed)) {
          const storedTracker = normalizeImportedState(parsed);
          loadedTracker = storedTracker;
          trackerRef.current = storedTracker;
          saveTrackerState(storedTracker);
          setTracker(storedTracker);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const storedPersonalization = window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (storedPersonalization) {
      try {
        const parsed = JSON.parse(storedPersonalization) as PersonalizationSnapshot;
        if (parsed?.input?.routineType) {
          const normalizedInput = normalizeOnboardingInput(parsed.input);
          const healedTracker = maybeRefreshPersonalizedHabits(loadedTracker ?? trackerRef.current, normalizedInput);
          setOnboarding(normalizedInput);
          setPersonalizationSnapshot({ ...parsed, input: normalizedInput });
          setAppThemeKey(themeByRoutine[normalizedInput.routineType]);
          if (healedTracker) {
            trackerRef.current = healedTracker;
            saveTrackerState(healedTracker);
            setTracker(healedTracker);
          }
        }
      } catch {
        window.localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
      }
    } else {
      setPersonalizerOpen(true);
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme && storedTheme in appThemes) {
      setAppThemeKey(storedTheme as AppThemeKey);
    }

    const storedColorScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (storedColorScheme === "light" || storedColorScheme === "dark") {
      setColorScheme(storedColorScheme);
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setColorScheme("dark");
    }

    const today = new Date();
    const todayKey = localDateKey(today);
    selectedDateRef.current = todayKey;
    setSelectedDate(todayKey);
    setVisibleMonth(startOfMonth(today));
  }, []);

  useEffect(() => {
    setConsents(readStoredConsents());

    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setCloudSession(data.session ?? null);
    });

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, session) => {
      setCloudSession(session);
      if (session?.user?.email) {
        setCloudEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    const userId = cloudSession?.user.id;

    if (!client || !userId) {
      setCloudOverview(null);
      return;
    }

    getCloudOverview(client, userId)
      .then(setCloudOverview)
      .catch(() => {
        setCloudOverview(null);
      });
  }, [cloudSession]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const syncMonthState = () => setMonthOpen(!query.matches);
    syncMonthState();
    query.addEventListener("change", syncMonthState);
    return () => query.removeEventListener("change", syncMonthState);
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
      if (perfectDayTimeoutRef.current) {
        window.clearTimeout(perfectDayTimeoutRef.current);
      }
      if (appToastTimeoutRef.current) {
        window.clearTimeout(appToastTimeoutRef.current);
      }
      if (noteSavedTimerRef.current) {
        window.clearTimeout(noteSavedTimerRef.current);
      }
      if (noteSavedHideTimerRef.current) {
        window.clearTimeout(noteSavedHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    const persistLatest = () => {
      const liveNote = noteRef.current?.value;

      if (typeof liveNote === "string") {
        const dateKey = selectedDateRef.current;
        const record = trackerRef.current.days[dateKey] ?? emptyDay;
        trackerRef.current = {
          ...trackerRef.current,
          days: {
            ...trackerRef.current.days,
            [dateKey]: { ...record, note: liveNote }
          },
          updatedAt: new Date().toISOString()
        };
      }

      saveTrackerState(trackerRef.current);
    };
    window.addEventListener("pagehide", persistLatest);
    window.addEventListener("beforeunload", persistLatest);
    document.addEventListener("visibilitychange", persistLatest);

    return () => {
      window.removeEventListener("pagehide", persistLatest);
      window.removeEventListener("beforeunload", persistLatest);
      document.removeEventListener("visibilitychange", persistLatest);
    };
  }, []);

  const commit = useCallback((recipe: (current: TrackerState) => TrackerState) => {
    const next = recipe(trackerRef.current);
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    trackerRef.current = stamped;
    saveTrackerState(stamped);
    setTracker(stamped);
  }, []);

  const sortedHabits = useMemo(
    () => [...tracker.habits].sort((a, b) => a.order - b.order),
    [tracker.habits]
  );
  const activeHabits = useMemo(() => sortedHabits.filter((habit) => !habit.pausedAt), [sortedHabits]);
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const selectedRecord = tracker.days[selectedDate] ?? emptyDay;
  const completedSet = useMemo(
    () =>
      new Set(
        activeHabits
          .filter((habit) => isHabitComplete(selectedRecord, habit.id))
          .map((habit) => habit.id)
      ),
    [activeHabits, selectedRecord]
  );
  const completedCount = completedSet.size;
  const completionPercent =
    activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;
  const todayKey = localDateKey(new Date());
  const streak = useMemo(
    () => countStreakEndingAt(todayKey, tracker, activeHabits),
    [todayKey, tracker, activeHabits]
  );
  const monthProgress = useMemo(
    () => countMonthProgress(monthDays, activeHabits, tracker),
    [monthDays, activeHabits, tracker]
  );
  const streakNudge = getStreakNudge(streak, completedCount, activeHabits.length);
  const shouldShowPersonalizer = personalizerOpen;
  const activePersonalization = personalizationSnapshot?.input ?? onboarding;
  const activeModeTheme = lifeModeThemes[activePersonalization.routineType];
  const appTheme = appThemes[appThemeKey];
  const heroName = cleanDisplayName(activePersonalization.displayName);
  const heroTitle = heroName ? copy.personalizedTitle(heroName) : copy.brand;
  const isDarkScheme = colorScheme === "dark";
  const appStyle = {
    "--app-primary": appTheme.primary,
    "--app-secondary": appTheme.secondary,
    "--app-accent": appTheme.accent,
    "--app-bg": isDarkScheme ? "#0b1512" : appTheme.background,
    "--app-surface": isDarkScheme ? "#13231f" : appTheme.surface,
    "--app-soft": isDarkScheme ? "#1f3832" : appTheme.soft,
    "--app-ink": isDarkScheme ? "#e4f5ef" : appTheme.ink
  } as CSSProperties;

  const showAppToast = useCallback((message: string, tone: AppToast["tone"] = "success") => {
    if (appToastTimeoutRef.current) {
      window.clearTimeout(appToastTimeoutRef.current);
    }

    setAppToast({ id: Date.now(), message, tone });
    appToastTimeoutRef.current = window.setTimeout(() => {
      setAppToast(null);
    }, 2600);
  }, []);

  const triggerCompletionCelebration = useCallback(
    (habit: Habit, moodOption: (typeof moodOptions)[number] | undefined) => {
      const messages = ["Win marked", "Today's win saved", "Nice win", "Progress won"];

      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }

      setCelebration({
        id: Date.now(),
        habitId: habit.id,
        tone: moodOption?.tone ?? habit.color,
        message: messages[Math.floor(Math.random() * messages.length)]
      });

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([12, 32, 18]);
      }

      playCompletionSound(moodOption?.tone ?? habit.color);

      celebrationTimeoutRef.current = window.setTimeout(() => {
        setCelebration(null);
      }, 1500);
    },
    []
  );

  const triggerPerfectDayCelebration = useCallback((tone: string, total: number) => {
    if (perfectDayTimeoutRef.current) {
      window.clearTimeout(perfectDayTimeoutRef.current);
    }

    setPerfectDayCelebration({
      id: Date.now(),
      tone,
      total
    });

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([18, 34, 18, 42, 26]);
    }

    playCompletionSound(tone, "stack");

    perfectDayTimeoutRef.current = window.setTimeout(() => {
      setPerfectDayCelebration(null);
    }, 2400);
  }, []);

  const maybeTriggerPerfectDay = useCallback(
    (habitId: string, mood: MoodKey, tone: string) => {
      if (selectedDate !== todayKey || !isCompletionMood(mood) || activeHabits.length === 0) {
        return;
      }

      const record = trackerRef.current.days[selectedDate] ?? emptyDay;
      const alreadyPerfect = activeHabits.every((habit) => isHabitComplete(record, habit.id));
      const nextRecord: DayRecord = {
        ...record,
        completedHabitIds: record.completedHabitIds.includes(habitId)
          ? record.completedHabitIds
          : [...record.completedHabitIds, habitId],
        habitMoods: { ...(record.habitMoods ?? {}), [habitId]: mood }
      };
      const nextPerfect = activeHabits.every((habit) => isHabitComplete(nextRecord, habit.id));

      if (!alreadyPerfect && nextPerfect) {
        triggerPerfectDayCelebration(tone, activeHabits.length);
      }
    },
    [activeHabits, selectedDate, todayKey, triggerPerfectDayCelebration]
  );

  const updateHabitMood = useCallback(
    (habitId: string, mood: MoodKey) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        const habitMoods = { ...(record.habitMoods ?? {}) };
        let completedHabitIds = record.completedHabitIds;

        if (habitMoods[habitId] === mood) {
          delete habitMoods[habitId];
          completedHabitIds = record.completedHabitIds.filter((id) => id !== habitId);
        } else {
          habitMoods[habitId] = mood;
          completedHabitIds = record.completedHabitIds.includes(habitId)
            ? record.completedHabitIds
            : [...record.completedHabitIds, habitId];
        }

        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: { ...record, completedHabitIds, habitMoods }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const setHabitMood = useCallback(
    (habitId: string, mood: MoodKey) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        const completedHabitIds = record.completedHabitIds.includes(habitId)
          ? record.completedHabitIds
          : [...record.completedHabitIds, habitId];

        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: {
              ...record,
              completedHabitIds,
              habitMoods: { ...(record.habitMoods ?? {}), [habitId]: mood }
            }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const clearHabitMood = useCallback(
    (habitId: string) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: {
              ...record,
              completedHabitIds: record.completedHabitIds.filter((id) => id !== habitId),
              habitMoods: removeHabitMood(record.habitMoods, habitId)
            }
          }
        };
      });
      setExpandedHabitId(null);
      setCelebration(null);
    },
    [commit, selectedDate]
  );

  const toggleHabitWin = useCallback(
    (habit: Habit) => {
      const record = trackerRef.current.days[selectedDate] ?? emptyDay;
      const currentMood = record.habitMoods?.[habit.id];

      if (currentMood && isCompletionMood(currentMood)) {
        clearHabitMood(habit.id);
        return;
      }

      const mood = defaultWinMood ?? moodOptions[0];
      maybeTriggerPerfectDay(habit.id, mood.key, mood.tone);
      setHabitMood(habit.id, mood.key);
      setExpandedHabitId(null);
      triggerCompletionCelebration(habit, mood);
    },
    [clearHabitMood, maybeTriggerPerfectDay, selectedDate, setHabitMood, triggerCompletionCelebration]
  );

  const updateSelectedNote = useCallback(
    (note: string) => {
      setNoteSavedVisible(false);
      if (noteSavedTimerRef.current) {
        window.clearTimeout(noteSavedTimerRef.current);
      }
      if (noteSavedHideTimerRef.current) {
        window.clearTimeout(noteSavedHideTimerRef.current);
      }
      noteSavedTimerRef.current = window.setTimeout(() => {
        setNoteSavedVisible(true);
        noteSavedHideTimerRef.current = window.setTimeout(() => {
          setNoteSavedVisible(false);
        }, 1800);
      }, 800);

      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: { ...record, note }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const addHabit = useCallback(() => {
    const name = newHabitName.trim();
    if (!name) {
      return;
    }

    commit((current) => {
      const order = current.habits.reduce((max, habit) => Math.max(max, habit.order), -1) + 1;
      const id = `custom-${Date.now().toString(36)}`;
      const habit: Habit = {
        id,
        name,
        order,
        color: newHabitColor,
        thumbnail: newHabitThumbnail,
        quip: "Custom win ready to track.",
        createdAt: new Date().toISOString()
      };

      return { ...current, habits: [...current.habits, habit] };
    });

    setNewHabitName("");
    setNewHabitColor((current) => colorPalette[(colorPalette.indexOf(current) + 1) % colorPalette.length]);
  }, [commit, newHabitColor, newHabitName, newHabitThumbnail]);

  const updateHabit = useCallback(
    (habitId: string, patch: Partial<Pick<Habit, "name" | "thumbnail" | "color" | "quip">>) => {
      commit((current) => ({
        ...current,
        habits: current.habits.map((habit) => (habit.id === habitId ? { ...habit, ...patch } : habit))
      }));
    },
    [commit]
  );

  const moveHabit = useCallback(
    (habitId: string, direction: -1 | 1) => {
      commit((current) => {
        const habits = [...current.habits].sort((a, b) => a.order - b.order);
        const index = habits.findIndex((habit) => habit.id === habitId);
        const targetIndex = index + direction;

        if (index < 0 || targetIndex < 0 || targetIndex >= habits.length) {
          return current;
        }

        const currentOrder = habits[index].order;
        habits[index] = { ...habits[index], order: habits[targetIndex].order };
        habits[targetIndex] = { ...habits[targetIndex], order: currentOrder };

        return { ...current, habits };
      });
    },
    [commit]
  );

  const togglePauseHabit = useCallback(
    (habitId: string) => {
      commit((current) => ({
        ...current,
        habits: current.habits.map((habit) =>
          habit.id === habitId
            ? { ...habit, pausedAt: habit.pausedAt ? undefined : new Date().toISOString() }
            : habit
        )
      }));
    },
    [commit]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      commit((current) => {
        const days = Object.fromEntries(
          Object.entries(current.days).map(([dateKey, record]) => [
            dateKey,
            {
              ...record,
              completedHabitIds: record.completedHabitIds.filter((id) => id !== habitId),
              habitMoods: removeHabitMood(record.habitMoods, habitId)
            }
          ])
        );

        return {
          ...current,
          habits: current.habits.filter((item) => item.id !== habitId),
          days
        };
      });
      setDeleteConfirmId(null);
    },
    [commit]
  );

  const exportShareCard = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1620;

    const context = canvas.getContext("2d");
    if (!context) {
      showAppToast("Could not create the share image.", "error");
      return;
    }

    const dateLabel = formatPrettyDate(selectedDate);
    const habitRows = activeHabits.slice(0, 10);
    const completed = habitRows.filter((habit) => isHabitComplete(selectedRecord, habit.id)).length;
    const gradient = context.createLinearGradient(0, 0, 1080, 1620);
    gradient.addColorStop(0, "#f8faf6");
    gradient.addColorStop(0.52, "#e4f3ee");
    gradient.addColorStop(1, "#d7e8f6");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1080, 1620);
    drawShareGrid(context);
    drawShareSparkle(context, 90, 98, 34, "#f59e0b");
    drawShareSparkle(context, 965, 128, 28, "#0f766e");
    drawShareSparkle(context, 930, 1470, 38, "#2563eb");
    drawShareSparkle(context, 118, 1492, 24, "#16a34a");
    drawShareSparkle(context, 996, 810, 18, "#0891b2");
    drawShareSparkle(context, 76, 760, 16, "#f59e0b");
    drawShareSparkle(context, 874, 356, 15, "#2563eb");
    drawShareSparkle(context, 202, 304, 14, "#0f766e");

    roundRect(context, 62, 64, 956, 1492, 44);
    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    context.fill();
    context.strokeStyle = "rgba(15, 118, 110, 0.28)";
    context.lineWidth = 3;
    context.stroke();

    drawShareLogo(context, 92, 96, 126);

    context.fillStyle = "#0f766e";
    context.font = "900 30px Avenir Next, Trebuchet MS, Arial";
    context.fillText("your must-do wins for today", 246, 118);

    context.fillStyle = "#0f2f2e";
    context.font = "950 68px Arial Rounded MT Bold, Trebuchet MS, Arial";
    context.fillText("The", 244, 188);
    context.fillText("Win List", 244, 266);

    context.fillStyle = "#52635f";
    context.font = "700 30px Avenir Next, Trebuchet MS, Arial";
    context.fillText(`${dateLabel}  |  ${completed}/${habitRows.length} wins today`, 94, 360);

    const progressWidth = Math.round((completed / Math.max(habitRows.length, 1)) * 780);
    roundRect(context, 94, 392, 780, 22, 999);
    context.fillStyle = "#dceee7";
    context.fill();
    roundRect(context, 94, 392, progressWidth, 22, 999);
    context.fillStyle = "#0f766e";
    context.fill();
    context.fillStyle = "#0f2f2e";
    context.font = "950 34px Arial Rounded MT Bold, Trebuchet MS, Arial";
    context.fillText(`${Math.round((completed / Math.max(habitRows.length, 1)) * 100)}%`, 902, 416);

    let y = 470;
    for (const habit of habitRows) {
      const done = isHabitComplete(selectedRecord, habit.id);
      const mood = selectedRecord.habitMoods?.[habit.id];
      const moodOption = moodOptions.find((item) => item.key === mood);

      roundRect(context, 94, y, 892, 70, 22);
      context.fillStyle = done ? colorWithAlpha(habit.color, 0.16) : "rgba(255, 255, 255, 0.86)";
      context.fill();
      context.strokeStyle = colorWithAlpha(habit.color, 0.42);
      context.lineWidth = 2;
      context.stroke();

      const habitImage = await loadCanvasImage(assetUrl(habit.thumbnail));
      if (habitImage) {
        drawRoundedImage(context, habitImage, 112, y + 9, 52, 52, 14);
      }

      context.fillStyle = "#0f2f2e";
      context.font = "900 27px Arial Rounded MT Bold, Trebuchet MS, Arial";
      context.fillText(habit.name, 184, y + 32);
      context.fillStyle = "#52635f";
      context.font = "700 20px Avenir Next, Trebuchet MS, Arial";
      context.fillText(done ? "won today" : "mark as won", 184, y + 57);

      if (moodOption) {
        const moodImage = await loadCanvasImage(assetUrl(moodOption.src));
        if (moodImage) {
          drawRoundedImage(context, moodImage, 792, y + 10, 50, 50, 14);
        }
        context.fillStyle = "#0f2f2e";
        context.font = "900 20px Avenir Next, Trebuchet MS, Arial";
        context.fillText(moodOption.label, 852, y + 42);
      } else {
        context.fillStyle = "#7b8985";
        context.font = "900 24px Avenir Next, Trebuchet MS, Arial";
        context.fillText("mark as won", 792, y + 42);
      }

      y += 82;
    }

    context.fillStyle = "#0f766e";
    context.font = "900 26px Avenir Next, Trebuchet MS, Arial";
    context.fillText("small wins, cleaner days", 94, 1512);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) {
      showAppToast("Could not finish the share image.", "error");
      return;
    }

    downloadBlob(blob, `${copy.shareImagePrefix}-${selectedDate}.png`);
    showAppToast("Share image saved.", "success");
  }, [activeHabits, selectedDate, selectedRecord, showAppToast]);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(tracker, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${copy.backupPrefix}-${selectedDate}.json`);
  }, [selectedDate, tracker]);

  const importBackup = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isTrackerState(parsed)) {
        showAppToast(copy.invalidBackup, "error");
        return;
      }

      const imported = normalizeImportedState(parsed);
      trackerRef.current = imported;
      setTracker(imported);
      saveTrackerState(imported);
      showAppToast("Backup imported.", "success");
    } catch {
      showAppToast("I could not read that backup file.", "error");
    }
  }, [showAppToast]);

  const resetTracker = useCallback(() => {
    const next = createDefaultState();
    trackerRef.current = next;
    setTracker(next);
    saveTrackerState(next);
    setResetConfirmOpen(false);
    showAppToast("Win List reset.", "success");
  }, [showAppToast]);

  const selectToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(localDateKey(today));
    setVisibleMonth(startOfMonth(today));
    setExpandedHabitId(null);
    setDayOpen(true);
  }, []);

  const openTodayView = useCallback(() => {
    selectToday();
    if (isCompactViewport()) {
      setMonthOpen(false);
    }
    window.requestAnimationFrame(() => {
      document.getElementById("today-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selectToday]);

  const openMonthView = useCallback(() => {
    setMonthOpen(true);
    setExpandedHabitId(null);
    if (isCompactViewport()) {
      setDayOpen(false);
    }
    window.requestAnimationFrame(() => {
      document.getElementById("month-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selectDay = useCallback((dateKey: string, habitId: string | null = null) => {
    setSelectedDate(dateKey);
    setExpandedHabitId(habitId);
    setDayOpen(true);
  }, []);

  const updateOnboarding = useCallback(
    <Key extends keyof OnboardingInput>(key: Key, value: OnboardingInput[Key]) => {
      setOnboarding((current) => ({ ...current, [key]: value }));
      if (key === "routineType") {
        const nextTheme = themeByRoutine[value as OnboardingInput["routineType"]];
        setAppThemeKey(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }
    },
    []
  );

  const toggleOnboardingListItem = useCallback(
    (key: "primaryGoals" | "constraints", value: string) => {
      setOnboarding((current) => {
        const currentValues = current[key];
        const nextValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];
        return { ...current, [key]: nextValues.length > 0 ? nextValues : [value] };
      });
    },
    []
  );

  const applyPersonalizedPlan = useCallback(() => {
    const now = new Date().toISOString();
    const normalizedInput = normalizeOnboardingInput(onboarding);
    const habits = createPersonalizedHabits(normalizedInput, now);
    const nextTracker: TrackerState = {
      version: 1,
      habits,
      days: {},
      createdAt: now,
      updatedAt: now
    };
    const snapshot: PersonalizationSnapshot = {
      input: normalizedInput,
      characterBrief: createCharacterBrief(normalizedInput),
      generatedAt: now
    };
    const nextTheme = themeByRoutine[normalizedInput.routineType];

    trackerRef.current = nextTracker;
    setTracker(nextTracker);
    saveTrackerState(nextTracker);
    window.localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(snapshot));
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setPersonalizationSnapshot(snapshot);
    setOnboarding(normalizedInput);
    setAppThemeKey(nextTheme);
    setExpandedHabitId(null);
    setDayOpen(true);
    setPersonalizerOpen(false);
  }, [onboarding]);

  const selectAppTheme = useCallback((themeKey: AppThemeKey) => {
    setAppThemeKey(themeKey);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeKey);
  }, []);

  const selectColorScheme = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  }, []);

  const toggleSettingsSection = useCallback((section: SettingsSectionKey) => {
    setExpandedSettingsSections((current) => ({ ...current, [section]: !current[section] }));
  }, []);

  const updateTermsAcceptance = useCallback((accepted: boolean) => {
    setConsents(() => {
      const next: ConsentState = {
        sync: accepted,
        analytics: accepted,
        recommendations: accepted,
        ads_personalization: accepted
      };
      saveStoredConsents(next);
      return next;
    });
  }, []);

  const handleMagicLink = useCallback(async () => {
    const client = getSupabaseClient();
    const email = cloudEmail.trim();

    if (!client) {
      setCloudMessage("Cloud backup is not connected in this demo yet. Your Win List is still saved on this browser.");
      return;
    }

    if (!email) {
      setCloudMessage("Enter an email first, then I will send a secure magic link.");
      return;
    }

    setCloudBusy(true);
    setCloudMessage("Sending magic link...");
    try {
      await sendMagicLink(client, email);
      setCloudMessage("Magic link sent. Open it from this device to connect sync.");
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not send the magic link.");
    } finally {
      setCloudBusy(false);
    }
  }, [cloudEmail]);

  const handleCloudUpload = useCallback(async () => {
    const client = getSupabaseClient();
    const userId = cloudSession?.user.id;

    if (!client || !userId) {
      setCloudMessage("Sign in before uploading this browser's Win List.");
      return;
    }

    if (!consents.sync) {
      setCloudMessage("Agree to the terms before syncing this Win List.");
      return;
    }

    setCloudBusy(true);
    setCloudMessage("Uploading this local Win List to Supabase...");
    try {
      const overview = await uploadLocalSnapshot({
        client,
        userId,
        tracker: trackerRef.current,
        personalization: personalizationSnapshot,
        consents,
        themeKey: appThemeKey,
        anonymousId: getAnonymousId()
      });
      setCloudOverview(overview);
      setCloudMessage("Synced. LocalStorage is still the offline source, and Supabase now has a backup.");
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not sync this Win List.");
    } finally {
      setCloudBusy(false);
    }
  }, [appThemeKey, cloudSession?.user.id, consents, personalizationSnapshot]);

  const handleCloudRestore = useCallback(async () => {
    const client = getSupabaseClient();
    const userId = cloudSession?.user.id;

    if (!client || !userId) {
      setCloudMessage("Sign in before restoring a cloud Win List.");
      return;
    }

    setCloudBusy(true);
    setCloudMessage("Restoring from Supabase...");
    try {
      const restored = await downloadCloudSnapshot(client, userId);
      if (!restored) {
        setCloudMessage("No cloud Win List found yet. Upload this browser first.");
        return;
      }

      trackerRef.current = restored;
      setTracker(restored);
      saveTrackerState(restored);
      setExpandedHabitId(null);
      setDayOpen(true);
      setCloudMessage("Cloud copy restored into this browser.");
      setCloudOverview(await getCloudOverview(client, userId));
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not restore the cloud copy.");
    } finally {
      setCloudBusy(false);
    }
  }, [cloudSession?.user.id]);

  const handleCloudSignOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    await client.auth.signOut();
    setCloudSession(null);
    setCloudOverview(null);
    setCloudMessage("Signed out. This browser still keeps the local Win List.");
  }, []);

  return (
    <main className={`tracker-shell theme-${appThemeKey} scheme-${colorScheme}`} style={appStyle}>
      <section className="tracker-hero" aria-labelledby="tracker-title">
        <div className="sparkle-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="brand-lockup">
          <div className="brand-media">
            <LogoMark />
            <div className="brand-avatar" aria-hidden="true">
              <AnswerCharacter input={activePersonalization} />
            </div>
          </div>
          <div className="hero-copy">
            <button
              className="eyebrow mode-chip"
              type="button"
              onClick={() => setPersonalizerOpen(true)}
              title={activeModeTheme.microcopy}
              aria-label={`${activeModeTheme.label}. ${activeModeTheme.microcopy}`}
            >
              <CircleDot size={16} aria-hidden="true" />
              {activeModeTheme.label}
            </button>
            <h1 id="tracker-title">{heroTitle}</h1>
            <p>{copy.tagline}</p>
          </div>
          <div className="mobile-hero-status" aria-label={`${formatPrettyDate(selectedDate)} progress ${completionPercent}%`}>
            <span>{formatPrettyDate(selectedDate)}</span>
            <strong>{completionPercent}%</strong>
          </div>
        </div>

        <div className="hero-actions" aria-label="Win List actions">
          <div className="hero-actions-row primary">
            <button className="icon-text-button" type="button" onClick={openTodayView}>
              <CalendarDays size={18} aria-hidden="true" />
              Today
            </button>
            <button
              className="icon-text-button"
              type="button"
              onClick={openMonthView}
            >
              <ChartColumn size={18} aria-hidden="true" />
              Analytics
            </button>
            <button
              className={`icon-text-button${settingsOpen ? " hot" : ""}`}
              type="button"
              aria-pressed={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 size={18} aria-hidden="true" />
              Settings
            </button>
          </div>
        </div>
      </section>

      {shouldShowPersonalizer ? (
        <div className="settings-layer personalization-layer" role="dialog" aria-modal="true" aria-labelledby="personalizer-title">
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setPersonalizerOpen(false)}
            aria-label="Close personalization"
          />
          <aside className="settings-drawer personalization-drawer">
            <PersonalizerPanel
              isOpen={personalizerOpen}
              onboarding={onboarding}
              snapshot={personalizationSnapshot}
              onToggle={() => setPersonalizerOpen(false)}
              onUpdate={updateOnboarding}
              onToggleListItem={toggleOnboardingListItem}
              onApply={applyPersonalizedPlan}
            />
          </aside>
        </div>
      ) : null}

      <section className="dashboard-grid" aria-label="The Win List dashboard">
        <section className={`today-panel${dayOpen ? " open" : " collapsed"}`} aria-labelledby="today-title">
          <LogoMark className="panel-watermark" decorative />
          <div className="section-header">
            <div className="section-title-lockup">
              <LogoMark className="section-logo" decorative />
              <div>
                <span className="section-kicker">Selected day</span>
                <h2 id="today-title">{formatPrettyDate(selectedDate)}</h2>
              </div>
            </div>
            <div className="progress-ring" style={{ "--progress": `${completionPercent}%` } as CSSProperties}>
              <span>{completionPercent}%</span>
            </div>
          </div>

          <div className="stat-strip" aria-label="Daily progress">
            <StatCard label={copy.wonToday} value={`${completedCount}/${activeHabits.length}`} />
            <StatCard label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
            <StatCard
              label="Month rate"
              value={monthProgress.total > 0 ? `${Math.round((monthProgress.completed / monthProgress.total) * 100)}%` : "0%"}
              title={`${monthProgress.completed}/${monthProgress.total} wins logged so far this month`}
            />
          </div>

          <p className="streak-nudge">{streakNudge}</p>

          <button className="day-toggle" type="button" onClick={() => setDayOpen((open) => !open)}>
            <CircleDot size={17} aria-hidden="true" />
            {dayOpen ? "Hide day plan" : "Open day plan"}
          </button>

          <div className="day-panel-content">
            <div className="checklist" aria-label={copy.todayWins}>
              {activeHabits.map((habit) => {
                const done = completedSet.has(habit.id);
                const habitMood = selectedRecord.habitMoods?.[habit.id];
                const moodOption = moodOptions.find((item) => item.key === habitMood);
                const moodMenuOpen = expandedHabitId === habit.id;
                return (
                  <article
                    className={`habit-card${done ? " done" : ""}${moodMenuOpen ? " expanded" : ""}${
                      celebration?.habitId === habit.id ? " celebrating" : ""
                    }`}
                    key={habit.id}
                    style={{ "--habit": habit.color } as CSSProperties}
                  >
                    <div className="habit-card-main">
                      <button
                        className="habit-win-button"
                        type="button"
                        onClick={() => toggleHabitWin(habit)}
                        aria-label={done ? `Undo ${habit.name} for ${formatPrettyDate(selectedDate)}` : `Mark ${habit.name} as won`}
                      >
                        <img src={assetUrl(habit.thumbnail)} alt="" className="habit-thumb" />
                        <span className="habit-card-copy">
                          <h3>{habit.name}</h3>
                          <p>{habit.quip}</p>
                        </span>
                        <span className="tap-hint">{done ? "Won today" : "Tap to win"}</span>
                      </button>
                      <button
                        className={`mood-preview${moodOption ? " selected" : ""}`}
                        style={{ "--mood": moodOption?.tone ?? habit.color } as CSSProperties}
                        type="button"
                        onClick={() => setExpandedHabitId(moodMenuOpen ? null : habit.id)}
                        aria-expanded={moodMenuOpen}
                        aria-label={`${done || moodOption ? "Change" : "Choose"} status for ${habit.name}`}
                      >
                        {moodOption ? (
                          <img src={assetUrl(moodOption.src)} alt="" />
                        ) : (
                          <CircleDot size={16} aria-hidden="true" />
                        )}
                        <span>{done || moodOption ? "Change" : "Status"}</span>
                      </button>
                    </div>
                    {moodMenuOpen ? (
                      <div className="activity-mood-panel" aria-label={`Win status choices for ${habit.name}`}>
                        {moodOptions.map((mood) => (
                          <button
                            className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                            key={mood.key}
                            style={{ "--mood": mood.tone } as CSSProperties}
                            type="button"
                            onClick={() => {
                              const shouldCelebrate = habitMood !== mood.key && isCompletionMood(mood.key);
                              if (shouldCelebrate) {
                                maybeTriggerPerfectDay(habit.id, mood.key, mood.tone);
                              }
                              updateHabitMood(habit.id, mood.key);
                              if (shouldCelebrate) {
                                triggerCompletionCelebration(habit, mood);
                              }
                              setExpandedHabitId(null);
                            }}
                            aria-label={`${mood.label} status for ${habit.name}`}
                          >
                            <img src={assetUrl(mood.src)} alt="" />
                            <small>{mood.label}</small>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {celebration?.habitId === habit.id ? (
                      <CompletionBurst
                        key={celebration.id}
                        message={celebration.message}
                        tone={celebration.tone}
                        onUndo={() => clearHabitMood(habit.id)}
                      />
                    ) : null}
                  </article>
                );
              })}
            </div>

            <label className="note-box">
              <span>
                Daily note
                <small className={`note-save-state${noteSavedVisible ? " visible" : ""}`} aria-live="polite">
                  Saved ✓
                </small>
              </span>
              <textarea
                ref={noteRef}
                value={selectedRecord.note ?? ""}
                onChange={(event) => updateSelectedNote(event.target.value)}
                placeholder="What made today easier or harder? One line is enough."
              />
            </label>
          </div>
        </section>

        <section className={`month-panel${monthOpen ? " open" : " collapsed"}`} aria-labelledby="month-title">
          <LogoMark className="panel-watermark month" decorative />
          <div className="month-toolbar">
            <button
              className="round-button"
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              aria-label="Previous month"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className="month-title-lockup">
              <LogoMark className="section-logo" decorative />
              <div>
                <span className="section-kicker">Month log</span>
                <h2 id="month-title">{formatMonthLabel(visibleMonth)}</h2>
              </div>
            </div>
            <button
              className="round-button"
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              aria-label="Next month"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          <button className="month-toggle" type="button" onClick={() => setMonthOpen((open) => !open)}>
            <CalendarDays size={17} aria-hidden="true" />
            {monthOpen ? "Hide monthly grid" : "Show monthly grid"}
          </button>

          <div className="month-panel-content">
            <div className="heatmap-summary">
              <div>
                <span className="section-kicker">Analytics</span>
                <strong>Habit heat map</strong>
              </div>
              <p>{monthProgress.completed}/{monthProgress.total} wins so far. Darker cells mean stronger completed days.</p>
            </div>
            <div className="heatmap-legend" aria-label="Heat map legend">
              <span><i className="heat-empty" /> Empty</span>
              <span><i className="heat-partial" /> Partial</span>
              <span><i className="heat-done" /> Won</span>
              <span><i className="heat-strong" /> Strong</span>
              <span><i className="heat-rest" /> Rest/skip</span>
            </div>
            <div className="month-grid-wrap" role="region" aria-label="Monthly win grid" tabIndex={0}>
              <div
                className="month-grid"
                style={{ "--day-count": monthDays.length } as CSSProperties}
              >
                <div className="grid-row header-row">
                  <div className="habit-sticky header-habit">Habit</div>
                  {monthDays.map((day) => {
                    const dayKey = localDateKey(day);
                    return (
                      <button
                        className={`day-header${selectedDate === dayKey ? " selected" : ""}`}
                        key={dayKey}
                        type="button"
                        onClick={() => selectDay(dayKey)}
                      >
                        <span>{day.getDate()}</span>
                        <small>{weekdayLetter(day)}</small>
                      </button>
                    );
                  })}
                </div>

                {activeHabits.map((habit) => (
                  <div className="grid-row habit-row" key={habit.id}>
                    <div className="habit-sticky grid-habit-label">
                      <img src={assetUrl(habit.thumbnail)} alt="" />
                      <span>{habit.name}</span>
                    </div>
                    {monthDays.map((day) => {
                      const dayKey = localDateKey(day);
                      const record = tracker.days[dayKey];
                      const done = record ? isHabitComplete(record, habit.id) : false;
                      const habitMood = record?.habitMoods?.[habit.id];
                      const moodOption = moodOptions.find((item) => item.key === habitMood);
                      const heatClass = getHeatClass(habitMood, done);
                      return (
                        <button
                          className={`grid-cell ${heatClass}${done ? " done" : ""}${moodOption ? " mooded" : ""}${
                            selectedDate === dayKey ? " selected" : ""
                          }`}
                          key={`${habit.id}-${dayKey}`}
                          style={
                            {
                              "--habit": habit.color,
                              "--mood": moodOption?.tone ?? habit.color
                            } as CSSProperties
                          }
                          type="button"
                          onClick={() => {
                            selectDay(dayKey, habit.id);
                          }}
                          aria-label={
                            moodOption
                              ? `Edit ${habit.name} win on ${dayKey}, currently ${moodOption.label}`
                              : `Mark ${habit.name} as won on ${dayKey}`
                          }
                        >
                          {moodOption ? (
                            <img className="grid-mood-img" src={assetUrl(moodOption.src)} alt="" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>

      {perfectDayCelebration ? (
        <PerfectDayOverlay
          key={perfectDayCelebration.id}
          tone={perfectDayCelebration.tone}
          total={perfectDayCelebration.total}
        />
      ) : null}

      {appToast ? <AppToastMessage key={appToast.id} message={appToast.message} tone={appToast.tone} /> : null}

      {settingsOpen ? (
        <div className="settings-layer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings"
          />
          <aside className="settings-drawer">
            <LogoMark className="panel-watermark drawer" decorative />
            <div className="drawer-header">
              <div className="drawer-title-lockup">
                <LogoMark className="drawer-logo" />
                <div>
                  <span className="section-kicker">Settings</span>
                  <h2 id="settings-title">Tune The Win List</h2>
                </div>
              </div>
              <button className="round-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <SettingsAccordionSection
              id="personalize"
              title="Personalize"
              description="Change the life mode, character, theme, and generated daily wins."
              icon={<Wand2 size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.personalize}
              onToggle={toggleSettingsSection}
            >
              <button
                className="icon-text-button hot full"
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setPersonalizerOpen(true);
                }}
              >
                <Wand2 size={18} aria-hidden="true" />
                {copy.buildCta}
              </button>
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="backup"
              title="Backup and sharing"
              description="Share a progress card, export a JSON backup, or import one from another browser."
              icon={<Download size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.backup}
              onToggle={toggleSettingsSection}
            >
              <div className="settings-action-grid">
                <button className="backup-button" type="button" onClick={exportShareCard}>
                  <Download size={17} aria-hidden="true" />
                  Share today
                </button>
                <button className="backup-button" type="button" onClick={exportBackup}>
                  <Download size={17} aria-hidden="true" />
                  Export backup (.json)
                </button>
                <label className="backup-button file-button">
                  <FileUp size={17} aria-hidden="true" />
                  Import backup
                  <input type="file" accept="application/json" onChange={importBackup} />
                </label>
              </div>
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="theme"
              title="Theme"
              description="Pick the visual mood and choose light or dark mode."
              icon={<Sparkles size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.theme}
              onToggle={toggleSettingsSection}
            >
              <div className="appearance-toggle" aria-label="Choose light or dark mode">
                <button
                  className={colorScheme === "light" ? "selected" : ""}
                  type="button"
                  onClick={() => selectColorScheme("light")}
                  aria-pressed={colorScheme === "light"}
                >
                  <Sun size={17} aria-hidden="true" />
                  Light
                </button>
                <button
                  className={colorScheme === "dark" ? "selected" : ""}
                  type="button"
                  onClick={() => selectColorScheme("dark")}
                  aria-pressed={colorScheme === "dark"}
                >
                  <Moon size={17} aria-hidden="true" />
                  Dark
                </button>
              </div>
              <div className="theme-picker compact" aria-label="Choose app theme">
                {(Object.entries(appThemes) as Array<[AppThemeKey, (typeof appThemes)[AppThemeKey]]>).map(
                  ([themeKey, theme]) => (
                    <button
                      className={`theme-card${appThemeKey === themeKey ? " selected" : ""}`}
                      key={themeKey}
                      type="button"
                      onClick={() => selectAppTheme(themeKey)}
                      style={
                        {
                          "--theme-primary": theme.primary,
                          "--theme-secondary": theme.secondary,
                          "--theme-accent": theme.accent,
                          "--theme-bg": theme.background,
                          "--theme-ink": theme.ink
                        } as CSSProperties
                      }
                    >
                      <span className="theme-swatch" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <strong>{theme.label}</strong>
                      <small>{theme.note}</small>
                    </button>
                  )
                )}
              </div>
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="wins"
              title={copy.winsAndIcons}
              description="Add, pause, reorder, and rename the daily must-do wins."
              icon={<Settings2 size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.wins}
              onToggle={toggleSettingsSection}
            >
              <div className="add-habit-box">
                <label>
                  <span>{copy.newWin}</span>
                  <input
                    value={newHabitName}
                    onChange={(event) => setNewHabitName(event.target.value)}
                    placeholder="Add an important win"
                  />
                </label>
                <div className="thumbnail-picker compact" aria-label="Choose thumbnail for new win">
                  {thumbnailOptions.map((thumbnail) => (
                    <button
                      className={newHabitThumbnail === thumbnail.src ? "selected" : ""}
                      key={thumbnail.slug}
                      type="button"
                      onClick={() => setNewHabitThumbnail(thumbnail.src)}
                      title={thumbnail.label}
                    >
                      <img src={assetUrl(thumbnail.src)} alt="" />
                    </button>
                  ))}
                </div>
                <ColorSwatches
                  label="Choose color for new win"
                  selectedColor={newHabitColor}
                  onSelect={setNewHabitColor}
                />
                <button className="icon-text-button hot full" type="button" onClick={addHabit}>
                  <Plus size={18} aria-hidden="true" />
                  {copy.addWin}
                </button>
              </div>

              <div className="habit-editor-list">
                {sortedHabits.map((habit, index) => (
                  <article className={`editor-card${habit.pausedAt ? " paused" : ""}`} key={habit.id}>
                    <img className="editor-thumb" src={assetUrl(habit.thumbnail)} alt="" />
                    <div className="editor-fields">
                      <input
                        value={habit.name}
                        onChange={(event) => updateHabit(habit.id, { name: event.target.value })}
                        aria-label={`Win name for ${habit.name}`}
                      />
                      <input
                        value={habit.quip}
                        onChange={(event) => updateHabit(habit.id, { quip: event.target.value })}
                        aria-label={`Win note for ${habit.name}`}
                      />
                      <div className="thumbnail-picker" aria-label={`Choose thumbnail for ${habit.name}`}>
                        {thumbnailOptions.map((thumbnail) => (
                          <button
                            className={habit.thumbnail === thumbnail.src ? "selected" : ""}
                            key={thumbnail.slug}
                            type="button"
                            onClick={() => updateHabit(habit.id, { thumbnail: thumbnail.src })}
                            title={thumbnail.label}
                          >
                            <img src={assetUrl(thumbnail.src)} alt="" />
                          </button>
                        ))}
                      </div>
                      <ColorSwatches
                        label={`Choose color for ${habit.name}`}
                        selectedColor={habit.color}
                        onSelect={(color) => updateHabit(habit.id, { color })}
                      />
                    </div>
                    <div className="editor-actions">
                      <button
                        className="round-button small"
                        type="button"
                        onClick={() => moveHabit(habit.id, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${habit.name} up`}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </button>
                      <button
                        className="round-button small"
                        type="button"
                        onClick={() => moveHabit(habit.id, 1)}
                        disabled={index === sortedHabits.length - 1}
                        aria-label={`Move ${habit.name} down`}
                      >
                        <ArrowDown size={15} aria-hidden="true" />
                      </button>
                      <button className="tiny-text-button" type="button" onClick={() => togglePauseHabit(habit.id)}>
                        {habit.pausedAt ? "Resume" : "Pause"}
                      </button>
                      {deleteConfirmId === habit.id ? (
                        <div className="delete-confirm-row" role="group" aria-label={`Confirm delete ${habit.name}`}>
                          <span>Really delete?</span>
                          <button type="button" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                          </button>
                          <button className="danger" type="button" onClick={() => deleteHabit(habit.id)}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          className="round-button danger small"
                          type="button"
                          onClick={() => setDeleteConfirmId(habit.id)}
                          aria-label={`Delete ${habit.name}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <button className="reset-button" type="button" onClick={() => setResetConfirmOpen(true)}>
                <RotateCcw size={17} aria-hidden="true" />
                Reset Win List
              </button>
              {resetConfirmOpen ? (
                <div className="inline-warning-card" role="alert">
                  <strong>Reset this browser?</strong>
                  <p>This clears wins, statuses, and notes from this local copy.</p>
                  <div>
                    <button type="button" onClick={() => setResetConfirmOpen(false)}>
                      Cancel
                    </button>
                    <button className="danger" type="button" onClick={resetTracker}>
                      Yes, reset
                    </button>
                  </div>
                </div>
              ) : null}
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="sync"
              title="Sync"
              description="Sign in only when you want cloud backup across devices."
              icon={<Cloud size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.sync}
              onToggle={toggleSettingsSection}
            >
              <CloudSyncPanel
                configured={isSupabaseConfigured()}
                session={cloudSession}
                email={cloudEmail}
                busy={cloudBusy}
                message={cloudMessage}
                consents={consents}
                overview={cloudOverview}
                onEmailChange={setCloudEmail}
                onMagicLink={handleMagicLink}
                onTermsAcceptedChange={updateTermsAcceptance}
                onUpload={handleCloudUpload}
                onRestore={handleCloudRestore}
                onSignOut={handleCloudSignOut}
              />
            </SettingsAccordionSection>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

type PersonalizerPanelProps = {
  isOpen: boolean;
  onboarding: OnboardingInput;
  snapshot: PersonalizationSnapshot | null;
  onToggle: () => void;
  onUpdate: <Key extends keyof OnboardingInput>(key: Key, value: OnboardingInput[Key]) => void;
  onToggleListItem: (key: "primaryGoals" | "constraints", value: string) => void;
  onApply: () => void;
};

type CloudSyncPanelProps = {
  configured: boolean;
  session: SupabaseSession | null;
  email: string;
  busy: boolean;
  message: string;
  consents: ConsentState;
  overview: CloudOverview | null;
  onEmailChange: (email: string) => void;
  onMagicLink: () => void;
  onTermsAcceptedChange: (accepted: boolean) => void;
  onUpload: () => void;
  onRestore: () => void;
  onSignOut: () => void;
};

function SettingsAccordionSection({
  id,
  title,
  description,
  icon,
  expanded,
  onToggle,
  children
}: {
  id: SettingsSectionKey;
  title: string;
  description: string;
  icon: ReactNode;
  expanded: boolean;
  onToggle: (section: SettingsSectionKey) => void;
  children: ReactNode;
}) {
  const bodyId = `settings-${id}-body`;

  return (
    <section className={`settings-section${expanded ? " expanded" : " collapsed"}`}>
      <button
        className="settings-section-toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => onToggle(id)}
      >
        <span className="settings-section-title">
          {icon}
          <span>
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
        </span>
        <ChevronDown className="settings-section-chevron" size={18} aria-hidden="true" />
      </button>
      {expanded ? (
        <div className="settings-section-body" id={bodyId}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function CloudSyncPanel({
  configured,
  session,
  email,
  busy,
  message,
  consents,
  overview,
  onEmailChange,
  onMagicLink,
  onTermsAcceptedChange,
  onUpload,
  onRestore,
  onSignOut
}: CloudSyncPanelProps) {
  const isSignedIn = Boolean(session);
  const termsAccepted = consents.sync;
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  return (
    <div className="cloud-panel">
      <section className="cloud-hero-card">
        <div className="cloud-hero-icon" aria-hidden="true">
          <Cloud size={24} />
        </div>
        <div>
          <span className="section-kicker">Safe backup</span>
          <h3>Save this Win List to your account</h3>
          <p>
            Your list still works on this browser. Sign in only when you want cloud backup or to restore it on another
            device.
          </p>
        </div>
      </section>

      <section className="cloud-box">
        <div className="cloud-box-title">
          <ShieldCheck size={18} aria-hidden="true" />
          <h3>Terms</h3>
        </div>
        <label className="consent-toggle simple">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => onTermsAcceptedChange(event.target.checked)}
          />
          <span>
            <strong>I agree to save my Win List to my account.</strong>
            <small>
              This includes wins, progress, notes, and personalization details. Private data is not used for ads unless
              the terms are updated and accepted again.
            </small>
          </span>
        </label>
      </section>

      <section className="cloud-box">
        <div className="cloud-box-title">
          <Cloud size={18} aria-hidden="true" />
          <h3>Account and sync</h3>
        </div>

        {!configured ? (
          <div className="cloud-env-note">
            Cloud backup is not connected in this demo yet. Your Win List is still saved on this browser.
          </div>
        ) : null}

        <label className="cloud-email-field">
          <span>Email for magic link</span>
          <input
            type="email"
            value={email}
            disabled={busy || isSignedIn}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <div className="sync-actions">
          {!isSignedIn ? (
            <button
              className="icon-text-button hot full"
              type="button"
              onClick={onMagicLink}
              disabled={busy || !configured || !termsAccepted}
            >
              <Cloud size={18} aria-hidden="true" />
              Sign in to sync
            </button>
          ) : (
            <>
              <button className="icon-text-button hot full" type="button" onClick={onUpload} disabled={busy}>
                <Cloud size={18} aria-hidden="true" />
                Upload local Win List
              </button>
              <button className="backup-button" type="button" onClick={() => setRestoreConfirmOpen(true)} disabled={busy}>
                <Download size={17} aria-hidden="true" />
                Restore cloud copy
              </button>
              {restoreConfirmOpen ? (
                <div className="inline-warning-card" role="alert">
                  <strong>Replace this browser?</strong>
                  <p>The cloud copy will overwrite the Win List saved on this device.</p>
                  <div>
                    <button type="button" onClick={() => setRestoreConfirmOpen(false)}>
                      Cancel
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() => {
                        setRestoreConfirmOpen(false);
                        onRestore();
                      }}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ) : null}
              <button className="tiny-text-button" type="button" onClick={onSignOut} disabled={busy}>
                Sign out
              </button>
            </>
          )}
        </div>

        <p className="sync-message" aria-live="polite">{message}</p>
      </section>

      {overview ? (
        <section className="cloud-box">
          <div className="cloud-box-title">
            <Cloud size={18} aria-hidden="true" />
            <h3>Your cloud backup</h3>
          </div>
          <div className="cloud-overview">
            <span>Wins: <strong>{overview.wins}</strong></span>
            <span>Daily logs: <strong>{overview.dailyLogs}</strong></span>
            <span>Notes: <strong>{overview.notes}</strong></span>
            <span>Last sync: <strong>{overview.lastSyncedAt ? formatSyncDate(overview.lastSyncedAt) : "Not yet"}</strong></span>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PersonalizerPanel({
  isOpen,
  onboarding,
  snapshot,
  onToggle,
  onUpdate,
  onToggleListItem,
  onApply
}: PersonalizerPanelProps) {
  const summary = createPersonalizationSummary(snapshot?.input ?? onboarding);
  const planPreview = createPersonalizedHabits(onboarding, "preview").slice(0, 6);
  const modeTheme = lifeModeThemes[onboarding.routineType];
  const avatarStyle = resolveAvatarStyle(onboarding);
  const outfit = characterOutfits[onboarding.routineType];
  const characterName = cleanDisplayName(onboarding.displayName);
  const previewTitle = characterName ? `${characterName}'s Win List companion` : "Your Win List companion";
  const panelStyle = {
    "--mode-primary": modeTheme.primary,
    "--mode-secondary": modeTheme.secondary,
    "--mode-accent": modeTheme.accent,
    "--mode-surface": modeTheme.surface,
    "--mode-soft": modeTheme.soft,
    "--mode-hair": modeTheme.hair,
    "--mode-skin": modeTheme.skin
  } as CSSProperties;

  return (
    <section
      className={`personalizer-panel mode-${onboarding.routineType}${isOpen ? " open" : " collapsed"}`}
      style={panelStyle}
      aria-labelledby="personalizer-title"
    >
      <div className="personalizer-header">
        <div className="personalizer-title">
          <div className="personalizer-character-lockup" aria-hidden="true">
            <LogoMark className="personalizer-logo" decorative />
            <AnswerCharacter input={onboarding} />
          </div>
          <div>
            <span className="section-kicker">{modeTheme.kicker}</span>
            <h2 id="personalizer-title">Personalize {copy.brand}</h2>
            <p className="personalizer-lede">Choose a few details. Your wins, theme, and character update around this routine.</p>
          </div>
        </div>
        <button className="drawer-close-button" type="button" onClick={onToggle} aria-label="Close personalization">
          <X size={18} aria-hidden="true" />
          <span>{isOpen ? "Close" : "Personalize"}</span>
        </button>
      </div>

      {!isOpen ? (
        <div className="personalizer-compact">
          <p>{summary}</p>
          <span>{snapshot ? "Personalization saved on this browser." : "No saved personalization yet."}</span>
        </div>
      ) : (
        <div className="personalizer-grid">
          <div className="personalizer-form">
            <div className="form-row two">
              <label>
                <span>Name or nickname</span>
                <input
                  value={onboarding.displayName}
                  onChange={(event) => onUpdate("displayName", event.target.value)}
                  placeholder="Aarav, Meera, Riya..."
                />
              </label>
              <label>
                <span>City</span>
                <input
                  value={onboarding.city}
                  onChange={(event) => onUpdate("city", event.target.value)}
                  placeholder="Delhi, Pune, Jaipur..."
                />
              </label>
            </div>

            <div className="form-row two">
              <label>
                <span>Life mode</span>
                <select
                  value={onboarding.routineType}
                  onChange={(event) =>
                    onUpdate("routineType", event.target.value as OnboardingInput["routineType"])
                  }
                >
                  <option value="student">Student</option>
                  <option value="working-professional">Working professional</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="field-worker">Field worker</option>
                  <option value="business-owner">Business owner</option>
                </select>
              </label>
              <label>
                <span>Daily time</span>
                <div className="range-field">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={onboarding.dailyAvailableMinutes}
                    onChange={(event) => onUpdate("dailyAvailableMinutes", Number(event.target.value))}
                  />
                  <strong>{onboarding.dailyAvailableMinutes} min</strong>
                </div>
              </label>
            </div>

            <div className="form-row two">
              <label>
                <span>Age range</span>
                <select
                  value={onboarding.ageBand}
                  onChange={(event) => onUpdate("ageBand", event.target.value as OnboardingInput["ageBand"])}
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </label>
              <label>
                <span>Gender</span>
                <select
                  value={onboarding.avatarStyle}
                  onChange={(event) =>
                    onUpdate("avatarStyle", event.target.value as OnboardingInput["avatarStyle"])
                  }
                >
                  <option value="auto">Auto from name</option>
                  <option value="feminine">Female</option>
                  <option value="masculine">Male</option>
                  <option value="neutral">Neutral</option>
                </select>
              </label>
            </div>

            <label>
              <span>Usual schedule</span>
              <textarea
                value={onboarding.schedule}
                onChange={(event) => onUpdate("schedule", event.target.value)}
                placeholder="Office 10-7, college till 4, shop closes at 8:30..."
              />
            </label>

            <div className="chip-group" aria-label="Primary goals">
              <span>Goals</span>
              <div>
                {goalOptions.map((goal) => (
                  <button
                    className={onboarding.primaryGoals.includes(goal) ? "selected" : ""}
                    key={goal}
                    type="button"
                    onClick={() => onToggleListItem("primaryGoals", goal)}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="chip-group" aria-label="Constraints">
              <span>Constraints</span>
              <div>
                {constraintOptions.map((constraint) => (
                  <button
                    className={onboarding.constraints.includes(constraint) ? "selected" : ""}
                    key={constraint}
                    type="button"
                    onClick={() => onToggleListItem("constraints", constraint)}
                  >
                    {constraint}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="personalizer-preview" aria-label="Live personalized preview">
            <div className="character-persona-strip" aria-live="polite">
              <AnswerCharacter input={onboarding} />
              <div>
                <span>Meet your companion</span>
                <strong>{previewTitle}</strong>
                <p>{outfit.detail}</p>
              </div>
            </div>

            <div className="plan-preview" aria-label="Win List preview">
              <span>{copy.startingWins}</span>
              <div>
                {planPreview.map((habit) => (
                  <article key={habit.id} style={{ "--habit": habit.color } as CSSProperties}>
                    <img src={assetUrl(habit.thumbnail)} alt="" />
                    <strong>{habit.name}</strong>
                  </article>
                ))}
              </div>
            </div>

            <button className="icon-text-button hot full" type="button" onClick={onApply}>
              <Wand2 size={18} aria-hidden="true" />
              {copy.buildCta}
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function AnswerCharacter({
  input
}: {
  input: OnboardingInput;
}) {
  const theme = lifeModeThemes[input.routineType];
  const rawId = useId();
  const avatarId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    bg: `avatar-bg-${avatarId}`,
    skin: `avatar-skin-${avatarId}`,
    hair: `avatar-hair-${avatarId}`,
    outfit: `avatar-outfit-${avatarId}`,
    shadow: `avatar-shadow-${avatarId}`,
    glow: `avatar-glow-${avatarId}`
  };
  const style = {
    "--char-primary": theme.primary,
    "--char-secondary": theme.secondary,
    "--char-accent": theme.accent,
    "--char-bg": theme.surface,
    "--char-soft": theme.soft,
    "--char-hair": theme.hair,
    "--char-skin": theme.skin
  } as CSSProperties;
  const avatarStyle = resolveAvatarStyle(input);
  const avatarAction = resolveAvatarAction(input);
  const avatarSrc = assetUrl(getAvatarAssetPath(input, avatarStyle));
  const avatarAge = input.ageBand === "45+" ? "45 plus" : input.ageBand;
  const avatarLabel = `${avatarAge} ${avatarStyle} ${theme.label.toLowerCase()} avatar`;

  return (
    <span
      className={`answer-character avatar-photo routine-${input.routineType} avatar-${avatarStyle} action-${avatarAction}`}
      style={style}
      aria-label={avatarLabel}
      role="img"
    >
      <img src={avatarSrc} alt="" draggable={false} />
      <span className="avatar-action-badge" aria-hidden="true">
        {renderAvatarActionIcon(avatarAction)}
      </span>
    </span>
  );

  const routine = input.routineType;
  const mouth = input.ageBand === "45+" ? "M110 104 Q120 112 130 104" : "M108 103 Q120 116 132 103";
  const cheekOpacity = avatarStyle === "masculine" ? 0.14 : 0.28;

  function renderHair() {
    if (routine === "field-worker") {
      return (
        <>
          <path d="M83 86C83 58 99 42 121 42C143 42 158 58 158 86V102H83Z" fill={`url(#${ids.hair})`} />
          <path d="M80 67C91 48 106 39 124 41C142 43 155 52 163 67L158 77H84Z" fill="var(--char-accent)" />
          <path d="M121 45C138 45 155 53 176 68C162 73 147 73 134 68C119 62 104 62 86 68C93 53 105 45 121 45Z" fill="var(--char-accent)" opacity="0.88" />
        </>
      );
    }

    if (avatarStyle === "masculine") {
      return (
        <>
          <path d="M82 86C82 59 98 42 121 42C145 42 160 59 160 86V98H82Z" fill={`url(#${ids.hair})`} />
          <path d="M85 75C99 50 123 43 157 59C142 70 118 74 90 70Z" fill="rgba(255,255,255,0.18)" />
          <path d="M90 85C94 63 109 53 126 53C143 53 153 65 154 85C140 80 118 78 90 85Z" fill={`url(#${ids.hair})`} />
        </>
      );
    }

    if (avatarStyle === "neutral") {
      return (
        <>
          <path d="M80 88C80 58 98 41 121 41C146 41 162 59 162 88C162 108 154 124 139 134C140 115 132 105 120 105C108 105 100 116 102 134C88 125 80 108 80 88Z" fill={`url(#${ids.hair})`} />
          <path d="M86 76C101 52 122 44 155 58C138 68 117 71 91 70Z" fill="rgba(255,255,255,0.18)" />
        </>
      );
    }

    if (routine === "homemaker") {
      return (
        <>
          <path d="M76 89C76 55 96 36 123 38C150 40 166 62 163 98C162 120 153 139 137 146C139 127 132 115 120 115C108 115 99 128 101 148C82 139 75 116 76 89Z" fill={`url(#${ids.hair})`} />
          <path d="M73 86C87 54 112 42 148 49C136 62 119 70 92 72C85 77 80 82 73 86Z" fill="rgba(255,255,255,0.16)" />
          <path d="M73 92C98 73 128 70 164 82C158 96 142 105 122 105C101 105 84 100 73 92Z" fill="var(--char-secondary)" opacity="0.78" />
        </>
      );
    }

    if (routine === "business-owner") {
      return (
        <>
          <path d="M81 88C80 60 96 41 120 39C145 37 161 57 160 86C159 109 149 127 134 137C137 116 130 105 119 105C108 105 101 118 103 138C88 129 82 110 81 88Z" fill={`url(#${ids.hair})`} />
          <path d="M86 74C99 50 119 42 149 49C138 63 119 70 92 72Z" fill="rgba(255,255,255,0.18)" />
          <path d="M147 58C153 69 154 85 150 99" stroke="rgba(255,255,255,0.24)" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    }

    if (routine === "working-professional") {
      return (
        <>
          <path d="M80 87C80 57 97 39 121 39C147 39 163 57 163 89C163 113 153 131 136 139C139 120 132 107 120 107C108 107 100 119 103 139C87 131 80 112 80 87Z" fill={`url(#${ids.hair})`} />
          <path d="M85 75C99 50 122 40 157 58C140 68 119 70 91 69Z" fill="rgba(255,255,255,0.18)" />
          <path d="M91 73C99 86 113 91 132 88" stroke="rgba(255,255,255,0.16)" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    }

    return (
      <>
        <path d="M78 89C77 58 96 38 121 38C147 38 164 57 163 89C162 113 151 133 135 141C137 121 130 108 119 108C108 108 101 121 103 142C87 134 79 113 78 89Z" fill={`url(#${ids.hair})`} />
        <path d="M84 73C98 49 122 40 158 59C140 68 116 72 90 70Z" fill="rgba(255,255,255,0.18)" />
        <path d="M149 52L165 46L168 61L152 63Z" fill="var(--char-accent)" />
        <path d="M164 48L178 42L174 60L166 61Z" fill="var(--char-accent)" opacity="0.82" />
      </>
    );
  }

  function renderFaceAccessory() {
    if (routine === "working-professional") {
      return (
        <g stroke="#1f2937" strokeWidth="2.4" fill="none" opacity="0.72">
          <circle cx="107" cy="94" r="9" />
          <circle cx="133" cy="94" r="9" />
          <path d="M116 94H124" />
        </g>
      );
    }

    if (routine === "business-owner") {
      return <path d="M146 69L151 78L161 80L153 87L154 98L146 92L137 98L139 87L131 80L141 78Z" fill="var(--char-secondary)" opacity="0.9" />;
    }

    if (routine === "homemaker") {
      return <circle cx="120" cy="83" r="2.8" fill="var(--char-accent)" />;
    }

    return null;
  }

  function renderOutfitDetails() {
    if (routine === "student") {
      return (
        <>
          <path d="M91 143L120 165L149 143" fill="rgba(255,255,255,0.72)" />
          <path d="M89 156L102 197" stroke="var(--char-secondary)" strokeWidth="6" strokeLinecap="round" opacity="0.92" />
          <path d="M151 156L137 197" stroke="var(--char-secondary)" strokeWidth="6" strokeLinecap="round" opacity="0.92" />
          <circle cx="120" cy="173" r="6" fill="var(--char-accent)" />
          <path d="M107 187H133" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    }

    if (routine === "working-professional") {
      return (
        <>
          <path d="M84 145L111 194L120 152L129 194L156 145V201H84Z" fill="rgba(255,255,255,0.22)" />
          <path d="M105 142L120 158L135 142" fill="#ffffff" opacity="0.88" />
          <path d="M118 158L112 195H128L122 158Z" fill="var(--char-accent)" opacity="0.92" />
          <path d="M88 171H102M138 171H152" stroke="rgba(255,255,255,0.48)" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    }

    if (routine === "homemaker") {
      return (
        <>
          <path d="M74 151C95 165 123 170 166 151L171 172C140 193 99 190 68 171Z" fill="var(--char-secondary)" opacity="0.88" />
          <path d="M94 149C102 165 111 181 119 201" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="134" cy="170" r="5" fill="var(--char-accent)" opacity="0.86" />
          <circle cx="108" cy="185" r="4" fill="rgba(255,255,255,0.68)" />
          <path d="M130 170C133 165 137 165 140 170C137 175 133 175 130 170Z" fill="#ffffff" opacity="0.6" />
        </>
      );
    }

    if (routine === "field-worker") {
      return (
        <>
          <path d="M83 146H157V201H83Z" fill="rgba(255,255,255,0.16)" />
          <path d="M96 145V200M144 145V200" stroke="rgba(255,255,255,0.5)" strokeWidth="5" strokeLinecap="round" />
          <path d="M83 169H157" stroke="var(--char-secondary)" strokeWidth="7" opacity="0.94" />
          <path d="M90 145L150 199" stroke="var(--char-accent)" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    }

    return (
      <>
        <path d="M84 145L111 201L120 154L129 201L156 145V201H84Z" fill="#111827" opacity="0.32" />
        <path d="M104 143L120 160L136 143" fill="#ffffff" opacity="0.9" />
        <path d="M118 160L112 198H128L122 160Z" fill="var(--char-secondary)" />
        <circle cx="145" cy="169" r="6" fill="var(--char-secondary)" opacity="0.95" />
        <path d="M141 169H149M145 165V173" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
      </>
    );
  }

  function renderProp() {
    if (avatarAction === "studying") {
      return (
        <g filter={`url(#${ids.shadow})`}>
          <path d="M157 168H197C200 168 202 171 201 174L195 203H153Z" fill="#ffffff" />
          <path d="M157 168H177C181 174 181 194 176 203H153Z" fill="var(--char-soft)" />
          <path d="M177 168C183 177 183 194 176 203" stroke="var(--char-accent)" strokeWidth="3" />
          <path d="M162 180H174M162 190H173M184 180H195M184 190H192" stroke="var(--char-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.58" />
          <path d="M183 160L206 183" stroke="var(--char-accent)" strokeWidth="6" strokeLinecap="round" />
          <path d="M202 180L210 188" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }

    if (avatarAction === "working") {
      return (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="151" y="169" width="55" height="35" rx="8" fill="#ffffff" />
          <rect x="157" y="175" width="43" height="22" rx="5" fill="var(--char-soft)" />
          <path d="M148 204H209" stroke="var(--char-primary)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="179" cy="187" r="4" fill="var(--char-secondary)" />
        </g>
      );
    }

    if (avatarAction === "resetting" || avatarAction === "resting") {
      return (
        <g filter={`url(#${ids.shadow})`}>
          <path d="M164 181C164 169 173 160 185 160C197 160 206 169 206 181C206 194 198 204 185 204C172 204 164 194 164 181Z" fill="#ffffff" />
          <path d="M176 169C181 161 190 158 199 162C194 171 187 175 176 169Z" fill="var(--char-secondary)" />
          <path d="M185 172V199" stroke="var(--char-primary)" strokeWidth="4" strokeLinecap="round" />
          <path d="M177 187C184 182 192 182 199 187" stroke="var(--char-accent)" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    }

    if (avatarAction === "walking") {
      return (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="164" y="158" width="24" height="49" rx="12" fill="#ffffff" />
          <path d="M164 176H188V196C188 202 183 207 176 207C169 207 164 202 164 196Z" fill="var(--char-secondary)" opacity="0.9" />
          <path d="M169 152H183" stroke="var(--char-primary)" strokeWidth="5" strokeLinecap="round" />
          <path d="M194 168L207 176L198 188L185 180Z" fill="var(--char-soft)" stroke="var(--char-accent)" strokeWidth="3" />
          <circle cx="197" cy="178" r="2" fill="var(--char-primary)" />
        </g>
      );
    }

    return (
      <g filter={`url(#${ids.shadow})`}>
        <rect x="158" y="161" width="39" height="47" rx="8" fill="#ffffff" />
        <path d="M165 173H190M165 184H190M165 195H183" stroke="var(--char-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        <circle cx="196" cy="170" r="11" fill="var(--char-secondary)" />
        <path d="M192 170H200M196 166V174" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <svg
      className={`answer-character avatar-svg routine-${input.routineType} avatar-${avatarStyle} action-${avatarAction}`}
      style={style}
      viewBox="0 0 240 240"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={ids.bg} cx="24%" cy="16%" r="86%">
          <stop offset="0%" stopColor="var(--char-soft)" />
          <stop offset="52%" stopColor="var(--char-bg)" />
          <stop offset="100%" stopColor="#ffffff" />
        </radialGradient>
        <linearGradient id={ids.skin} x1="79" x2="158" y1="63" y2="129" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--char-skin), #ffffff 22%)" />
          <stop offset="100%" stopColor="var(--char-skin)" />
        </linearGradient>
        <linearGradient id={ids.hair} x1="78" x2="164" y1="38" y2="142" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--char-hair), #ffffff 18%)" />
          <stop offset="100%" stopColor="var(--char-hair)" />
        </linearGradient>
        <linearGradient id={ids.outfit} x1="80" x2="160" y1="140" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--char-primary), #ffffff 18%)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--char-primary), #000000 12%)" />
        </linearGradient>
        <filter id={ids.shadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.16" />
        </filter>
        <filter id={ids.glow} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--char-accent)" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect x="8" y="8" width="224" height="224" rx="48" fill={`url(#${ids.bg})`} />
      <circle cx="48" cy="56" r="28" fill="var(--char-secondary)" opacity="0.17" />
      <circle cx="196" cy="76" r="35" fill="var(--char-accent)" opacity="0.14" />
      <circle cx="61" cy="194" r="45" fill="var(--char-primary)" opacity="0.11" />
      <path d="M43 95C72 73 108 73 135 96C161 119 198 119 216 93" fill="none" stroke="var(--char-secondary)" strokeWidth="3" strokeLinecap="round" opacity="0.22" />
      <path d="M40 37L44 47L54 51L44 55L40 65L36 55L26 51L36 47Z" fill="var(--char-accent)" filter={`url(#${ids.glow})`} />
      <path d="M194 36L197 44L205 47L197 50L194 58L191 50L183 47L191 44Z" fill="var(--char-secondary)" opacity="0.88" />
      <path d="M205 126L208 134L216 137L208 140L205 148L202 140L194 137L202 134Z" fill="var(--char-accent)" opacity="0.75" />

      <ellipse cx="120" cy="207" rx="70" ry="16" fill="#0f172a" opacity="0.12" />
      <path d="M92 192C91 203 88 211 82 217H106C109 209 110 201 110 192Z" fill="var(--char-primary)" opacity="0.42" />
      <path d="M130 192C130 202 133 211 138 217H162C154 211 151 202 150 192Z" fill="var(--char-primary)" opacity="0.42" />

      <g filter={`url(#${ids.shadow})`}>
        <path d="M84 152C69 158 58 174 56 191C55 200 65 207 73 202C81 197 82 181 96 170Z" fill={`url(#${ids.skin})`} />
        <path d="M156 152C171 158 182 174 184 191C185 200 175 207 167 202C159 197 158 181 144 170Z" fill={`url(#${ids.skin})`} />
        <circle cx="71" cy="199" r="9" fill={`url(#${ids.skin})`} />
        <circle cx="169" cy="199" r="9" fill={`url(#${ids.skin})`} />
        <path d="M78 201C82 163 96 138 120 138C144 138 158 163 162 201Z" fill={`url(#${ids.outfit})`} />
        <path d="M95 139C103 149 111 154 120 154C129 154 137 149 145 139C138 133 129 130 120 130C111 130 102 133 95 139Z" fill={`url(#${ids.skin})`} />
        {renderOutfitDetails()}
      </g>

      {renderProp()}

      <g filter={`url(#${ids.shadow})`}>
        <circle cx="82" cy="95" r="9" fill={`url(#${ids.skin})`} />
        <circle cx="158" cy="95" r="9" fill={`url(#${ids.skin})`} />
        {renderHair()}
        <path d="M85 87C85 66 98 52 120 52C142 52 155 66 155 87V94C155 116 141 130 120 130C99 130 85 116 85 94Z" fill={`url(#${ids.skin})`} />
        <path d="M88 78C103 69 119 70 137 77C128 83 109 84 88 78Z" fill="rgba(255,255,255,0.24)" />
        <path d="M102 90C106 87 111 87 115 90" stroke="#3f2a22" strokeWidth="2.6" strokeLinecap="round" opacity="0.45" />
        <path d="M125 90C129 87 134 87 138 90" stroke="#3f2a22" strokeWidth="2.6" strokeLinecap="round" opacity="0.45" />
        <circle cx="109" cy="97" r="4.4" fill="#2f1f1a" />
        <circle cx="131" cy="97" r="4.4" fill="#2f1f1a" />
        <circle cx="110.7" cy="95.4" r="1.4" fill="#ffffff" opacity="0.86" />
        <circle cx="132.7" cy="95.4" r="1.4" fill="#ffffff" opacity="0.86" />
        <ellipse cx="101" cy="108" rx="8" ry="5" fill="#f472b6" opacity={cheekOpacity} />
        <ellipse cx="139" cy="108" rx="8" ry="5" fill="#f472b6" opacity={cheekOpacity} />
        <path d={mouth} fill="none" stroke="#3f2a22" strokeWidth="3" strokeLinecap="round" />
        <path d="M118 99C116 104 116 108 120 110" fill="none" stroke="#9f6a52" strokeWidth="1.7" strokeLinecap="round" opacity="0.45" />
        {renderFaceAccessory()}
      </g>
    </svg>
  );
}

function getAvatarAssetPath(
  input: OnboardingInput,
  avatarStyle: Exclude<OnboardingInput["avatarStyle"], "auto">
) {
  return `/assets/avatars/${getAvatarAgeBucket(input.ageBand)}/${input.routineType}-${avatarStyle}.webp?v=sticker-20260503`;
}

function getAvatarAgeBucket(ageBand: OnboardingInput["ageBand"]) {
  if (ageBand === "45+") {
    return "45-plus";
  }

  return ageBand;
}

function renderAvatarActionIcon(action: Exclude<OnboardingInput["avatarAction"], "auto">) {
  const iconProps = { size: 18, strokeWidth: 2.7, "aria-hidden": true };

  if (action === "studying") {
    return <BookOpen {...iconProps} />;
  }

  if (action === "working") {
    return <Briefcase {...iconProps} />;
  }

  if (action === "walking") {
    return <Footprints {...iconProps} />;
  }

  if (action === "resetting") {
    return <Home {...iconProps} />;
  }

  if (action === "resting") {
    return <Leaf {...iconProps} />;
  }

  return <ClipboardCheck {...iconProps} />;
}

function resolveAvatarAction(input: OnboardingInput): Exclude<OnboardingInput["avatarAction"], "auto"> {
  const actionByRoutine: Record<OnboardingInput["routineType"], Exclude<OnboardingInput["avatarAction"], "auto">> = {
    student: "studying",
    "working-professional": "working",
    homemaker: "resetting",
    "field-worker": "walking",
    "business-owner": "planning"
  };

  return actionByRoutine[input.routineType];
}

function resolveAvatarStyle(input: OnboardingInput): Exclude<OnboardingInput["avatarStyle"], "auto"> {
  if (input.avatarStyle !== "auto") {
    return input.avatarStyle;
  }

  const name = input.displayName.trim().toLowerCase();
  const feminineNames = [
    "ananya",
    "riya",
    "meera",
    "neha",
    "pooja",
    "priya",
    "nisha",
    "shivani",
    "navjot",
    "neerisha",
    "aarti",
    "isha",
    "simran"
  ];
  const masculineNames = ["aarav", "arjun", "kabir", "imran", "rohan", "rahul", "aman", "vikram", "aditya"];

  if (feminineNames.some((item) => name.includes(item)) || /[aeiy]a$/.test(name)) {
    return "feminine";
  }

  if (masculineNames.some((item) => name.includes(item)) || /[nrtd]$/.test(name)) {
    return "masculine";
  }

  return "neutral";
}

function StatCard({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="stat-card" title={title}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ColorSwatches({
  label,
  selectedColor,
  onSelect
}: {
  label: string;
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="color-picker" aria-label={label}>
      {colorPalette.map((color) => (
        <button
          aria-label={`${label}: ${color}`}
          className={selectedColor === color ? "selected" : ""}
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          style={{ "--swatch": color } as CSSProperties}
        />
      ))}
    </div>
  );
}

function CompletionBurst({ message, tone, onUndo }: { message: string; tone: string; onUndo: () => void }) {
  return (
    <div className="completion-burst" style={{ "--celebration": tone } as CSSProperties} aria-live="polite">
      <span className="burst-orbit one" />
      <span className="burst-orbit two" />
      <span className="burst-orbit three" />
      <span className="burst-orbit four" />
      <span className="burst-dot one" />
      <span className="burst-dot two" />
      <span className="burst-dot three" />
      <span className="burst-dot four" />
      <span className="completion-toast">
        <Sparkles size={14} aria-hidden="true" />
        {message}
        <button type="button" onClick={onUndo}>Undo</button>
      </span>
    </div>
  );
}

function AppToastMessage({ message, tone }: { message: string; tone: AppToast["tone"] }) {
  return (
    <div className={`app-toast ${tone}`} role="status" aria-live="polite">
      <Sparkles size={16} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function PerfectDayOverlay({ tone, total }: { tone: string; total: number }) {
  return (
    <div className="perfect-day-overlay" style={{ "--celebration": tone } as CSSProperties} aria-live="polite">
      <div className="perfect-day-card">
        <span className="perfect-day-sparkle one" />
        <span className="perfect-day-sparkle two" />
        <span className="perfect-day-sparkle three" />
        <Sparkles size={34} aria-hidden="true" />
        <strong>Perfect day</strong>
        <p>All {total} wins logged today.</p>
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawShareGrid(context: CanvasRenderingContext2D) {
  context.save();
  context.strokeStyle = "rgba(255, 79, 163, 0.08)";
  context.lineWidth = 2;

  for (let y = 0; y < 1620; y += 44) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1080, y);
    context.stroke();
  }

  for (let x = 0; x < 1080; x += 44) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 1620);
    context.stroke();
  }

  context.restore();
}

function drawShareLogo(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  const scale = size / 120;
  context.scale(scale, scale);

  const blush = context.createLinearGradient(18, 14, 104, 110);
  blush.addColorStop(0, "#f8faf6");
  blush.addColorStop(0.5, "#dceee7");
  blush.addColorStop(1, "#a7d8cc");
  roundRect(context, 10, 10, 100, 100, 28);
  context.fillStyle = blush;
  context.fill();
  context.strokeStyle = "rgba(15, 118, 110, 0.28)";
  context.lineWidth = 3;
  context.stroke();

  roundRect(context, 30, 23, 48, 62, 11);
  context.fillStyle = "#ffffff";
  context.fill();
  context.strokeStyle = "#0f766e";
  context.lineWidth = 5;
  context.stroke();

  context.strokeStyle = "#94a3b8";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(41, 42);
  context.lineTo(66, 42);
  context.moveTo(41, 55);
  context.lineTo(56, 55);
  context.moveTo(41, 68);
  context.lineTo(54, 68);
  context.stroke();

  const mark = context.createLinearGradient(46, 78, 92, 48);
  mark.addColorStop(0, "#0f766e");
  mark.addColorStop(1, "#2563eb");
  context.strokeStyle = mark;
  context.lineWidth = 8;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(53, 73);
  context.lineTo(62, 82);
  context.lineTo(83, 55);
  context.stroke();

  context.fillStyle = "#f59e0b";
  context.beginPath();
  context.arc(83, 29, 8, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawShareSparkle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  context.save();
  context.translate(x, y);
  context.shadowColor = color;
  context.shadowBlur = size * 0.9;
  context.fillStyle = color;
  context.strokeStyle = "#fffafd";
  context.lineWidth = Math.max(3, size * 0.18);
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(0, -size);
  context.lineTo(size * 0.26, -size * 0.26);
  context.lineTo(size, 0);
  context.lineTo(size * 0.26, size * 0.26);
  context.lineTo(0, size);
  context.lineTo(-size * 0.26, size * 0.26);
  context.lineTo(-size, 0);
  context.lineTo(-size * 0.26, -size * 0.26);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

function drawRoundedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.save();
  roundRect(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width <= 0 || height <= 0) {
    return;
  }

  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function colorWithAlpha(hex: string, alpha: number) {
  const fallback = `rgba(15, 118, 110, ${alpha})`;
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!match) {
    return fallback;
  }

  const red = parseInt(match[1], 16);
  const green = parseInt(match[2], 16);
  const blue = parseInt(match[3], 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function LogoMark({ className = "sparkle-logo", decorative = false }: { className?: string; decorative?: boolean }) {
  const reactId = useId().replace(/:/g, "");
  const blushId = `${reactId}-logo-blush`;
  const markId = `${reactId}-logo-mark`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : copy.logoLabel}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <linearGradient id={blushId} x1="18" x2="104" y1="14" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8faf6" />
          <stop offset="0.52" stopColor="#dceee7" />
          <stop offset="1" stopColor="#a7d8cc" />
        </linearGradient>
        <linearGradient id={markId} x1="48" x2="92" y1="78" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f766e" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="28" fill={`url(#${blushId})`} />
      <rect x="31" y="22" width="50" height="64" rx="12" fill="#fff" stroke="#0f766e" strokeWidth="5" />
      <path
        d="M43 42h26M43 56h17M43 70h14"
        fill="none"
        stroke="#94a3b8"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="m54 73 9 9 23-29"
        fill="none"
        stroke={`url(#${markId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
      <circle cx="83" cy="29" r="8" fill="#f59e0b" />
    </svg>
  );
}

function saveTrackerState(state: TrackerState) {
  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    saveCookieBackup(serialized);
    saveHistoryBackup(serialized);
  }
}

function readSavedTrackerState() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? readCookieBackup() ?? readHistoryBackup();
}

function maybeRefreshPersonalizedHabits(current: TrackerState, input: OnboardingInput) {
  const now = new Date().toISOString();
  const expectedHabits = createPersonalizedHabits(input, now);
  const currentIds = current.habits.map((habit) => habit.id).join("|");
  const expectedIds = expectedHabits.map((habit) => habit.id).join("|");

  if (currentIds === expectedIds) {
    return null;
  }

  const hasTrackedDays = Object.values(current.days).some(
    (record) => record.completedHabitIds.length > 0 || Object.keys(record.habitMoods ?? {}).length > 0 || record.note
  );

  if (hasTrackedDays || !isGeneratedHabitList(current.habits)) {
    return null;
  }

  return {
    ...current,
    habits: expectedHabits,
    updatedAt: now
  };
}

function isGeneratedHabitList(habits: Habit[]) {
  const defaultHabitIds = new Set([
    "wake-early",
    "water",
    "steps",
    "yoga-workout",
    "healthy-meal",
    "deep-work",
    "skill-learning",
    "budget",
    "screen-time",
    "sleep"
  ]);

  return habits.every((habit) => habit.id.startsWith("personal-") || defaultHabitIds.has(habit.id));
}

function saveHistoryBackup(serialized: string) {
  const currentState = typeof window.history.state === "object" && window.history.state !== null ? window.history.state : {};
  window.history.replaceState({ ...currentState, [HISTORY_STATE_KEY]: serialized }, "", window.location.href);
}

function readHistoryBackup() {
  const currentState = window.history.state as Record<string, unknown> | null;
  const stored = currentState?.[HISTORY_STATE_KEY];
  return typeof stored === "string" ? stored : null;
}

function saveCookieBackup(serialized: string) {
  const encoded = encodeURIComponent(serialized);
  const chunkSize = 3400;
  const chunks = encoded.match(new RegExp(`.{1,${chunkSize}}`, "g")) ?? [""];
  const existingParts = Number(getCookie(`${COOKIE_KEY}_parts`) ?? 0);
  const maxParts = Math.max(existingParts, chunks.length);

  for (let index = 0; index < maxParts; index += 1) {
    const name = `${COOKIE_KEY}_${index}`;
    if (index < chunks.length) {
      document.cookie = `${name}=${chunks[index]}; Max-Age=31536000; path=/; SameSite=Lax`;
    } else {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }

  document.cookie = `${COOKIE_KEY}_parts=${chunks.length}; Max-Age=31536000; path=/; SameSite=Lax`;
}

function readCookieBackup() {
  const parts = Number(getCookie(`${COOKIE_KEY}_parts`) ?? 0);

  if (!Number.isFinite(parts) || parts <= 0) {
    return null;
  }

  const encoded = Array.from({ length: parts }, (_, index) => getCookie(`${COOKIE_KEY}_${index}`) ?? "").join("");

  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

function getCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function removeHabitMood(moods: DayRecord["habitMoods"], habitId: string) {
  const next = { ...(moods ?? {}) };
  delete next[habitId];
  return next;
}

function isHabitComplete(record: DayRecord, habitId: string) {
  const status = record.habitMoods?.[habitId];
  return Boolean(status && isCompletionMood(status));
}

function isCompletionMood(status: MoodKey) {
  return status !== "skipped" && status !== "rest";
}

function getStreakNudge(streak: number, completedCount: number, totalCount: number) {
  if (totalCount > 0 && completedCount === totalCount) {
    return "Perfect day. Every must-do win is banked.";
  }

  if (streak === 0 && completedCount === 0) {
    return "Start your streak today. Tap any card to mark the first win.";
  }

  if (streak === 0) {
    return "Streak starts again from here. One day is enough to restart momentum.";
  }

  if (streak === 1) {
    return "Day one is alive. Protect it with one more small win.";
  }

  return `${streak} days in motion. Keep the chain warm.`;
}

function getHeatClass(status: MoodKey | undefined, done: boolean) {
  if (status === "strong") {
    return "heat-strong";
  }

  if (status === "partial") {
    return "heat-partial";
  }

  if (status === "skipped" || status === "rest") {
    return "heat-rest";
  }

  if (status === "done" || done) {
    return "heat-done";
  }

  return "heat-empty";
}

function playCompletionSound(tone: string, mode: "sequence" | "stack" = "sequence") {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const audio = new AudioContextConstructor();
    const startedAt = audio.currentTime;
    const baseFrequency = colorToFrequency(tone);
    const master = audio.createGain();
    master.gain.setValueAtTime(0.0001, startedAt);
    master.gain.exponentialRampToValueAtTime(0.045, startedAt + 0.018);
    master.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.42);
    master.connect(audio.destination);

    [1, 1.25, 1.5].forEach((ratio, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const noteStart = mode === "stack" ? startedAt : startedAt + index * 0.065;
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(baseFrequency * ratio, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(mode === "stack" ? 0.1 : index === 0 ? 0.2 : 0.12, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + (mode === "stack" ? 0.34 : 0.22));
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + (mode === "stack" ? 0.36 : 0.24));
    });

    void audio.resume();
    window.setTimeout(() => void audio.close(), 540);
  } catch {
    // Audio is a bonus flourish; ignore browser autoplay or hardware limits.
  }
}

function colorToFrequency(color: string) {
  const hex = color.replace("#", "").slice(0, 6);
  const numeric = Number.parseInt(hex, 16);

  if (!Number.isFinite(numeric)) {
    return 620;
  }

  return 520 + (numeric % 180);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAnonymousId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const stored = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (stored) {
    return stored;
  }

  const next =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(ANONYMOUS_ID_KEY, next);
  return next;
}

function formatSyncDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthDays(date: Date) {
  const days: Date[] = [];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  return days;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatPrettyDate(key: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(dateFromKey(key));
}

function cleanDisplayName(value: string) {
  return value.trim().slice(0, 28);
}

function weekdayLetter(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date).slice(0, 1);
}

function isCompactViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
}

function countStreakEndingAt(dateKey: string, tracker: TrackerState, activeHabits: Habit[]) {
  if (activeHabits.length === 0) {
    return 0;
  }

  let count = 0;
  const cursor = dateFromKey(dateKey);

  while (count < 366) {
    const key = localDateKey(cursor);
    const record = tracker.days[key];
    const completed = activeHabits.every((habit) => (record ? isHabitComplete(record, habit.id) : false));

    if (!completed) {
      break;
    }

    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function countMonthProgress(days: Date[], activeHabits: Habit[], tracker: TrackerState) {
  const todayKey = localDateKey(new Date());
  const eligibleDays = days.filter((day) => localDateKey(day) <= todayKey);
  const total = eligibleDays.length * activeHabits.length;
  const completed = eligibleDays.reduce((sum, day) => {
    const record = tracker.days[localDateKey(day)];
    if (!record) {
      return sum;
    }

    return (
      sum +
      activeHabits.filter((habit) => isHabitComplete(record, habit.id)).length
    );
  }, 0);

  return { total, completed };
}
