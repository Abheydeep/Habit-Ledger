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
  MoreHorizontal,
  Plus,
  RotateCcw,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Volume2,
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
  APP_BASE_PATH,
  assetUrl,
  createDefaultState,
  getHabitCategory,
  habitCategoryMeta,
  habitCategoryOrder,
  habitSamples,
  isTrackerState,
  moodOptions,
  normalizeImportedState,
  thumbnailOptions,
  type DayRecord,
  type DayPartKey,
  type Habit,
  type HabitCategoryKey,
  type HabitSample,
  type MoodKey,
  type TrackerState
} from "../lib/habitData";
import {
  DEFAULT_PRIMARY_WIN_COUNT,
  getPermanentHabits,
  getOptionalHabits,
  makeHabitOptional,
  makeHabitPermanent
} from "../lib/primaryWins";
import {
  PERSONALIZATION_STORAGE_KEY,
  createCharacterBrief,
  createPersonalizationSummary,
  createPersonalizedHabits,
  defaultOnboardingInput,
  normalizeOnboardingInput,
  type PersonalizationSnapshot
} from "../lib/personalization";
import {
  canShowMonthlyReview,
  canShowPatternAnalytics,
  getAnalyticsUnlockStage,
  getProductExperienceState,
  hasActivityInDay,
  summarizeTrackerActivity
} from "../lib/experienceState";
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
const FEEDBACK_STORAGE_KEY = "the-win-list:feedback:v1";
const REMINDER_STORAGE_KEY = "the-win-list:reminders:v1";
const ANONYMOUS_ID_KEY = "the-win-list:anonymous-id:v1";
const SETTINGS_SECTION_STORAGE_KEY = "the-win-list:settings-section:v1";
const SIMPLE_TODAY_STORAGE_KEY = "the-win-list:simple-today:v1";
const STARTER_LIST_ACCEPTED_KEY = "the-win-list:starter-list-accepted:v1";
const HOLD_MENU_HINT_SEEN_KEY = "the-win-list:hold-menu-hint-seen-date:v1";
const APP_INSTALLED_STORAGE_KEY = "the-win-list:app-installed:v1";
const SAVE_TRUST_TOAST_DATE_KEY = "the-win-list:save-trust-toast-date:v1";
const CLOUD_TRUST_TOAST_DATE_KEY = "the-win-list:cloud-trust-toast-date:v1";
const LIGHT_SHELL_THEME_COLOR = "#f5f7f2";
const DARK_SHELL_THEME_COLOR = "#111c19";
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
let completionAudioContext: AudioContext | null = null;
type CompletionFeedbackMode = "sequence" | "stack" | "tap";
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
type SettingsSectionKey = "personalize" | "backup" | "theme" | "feedback" | "reminders" | "wins" | "sync";
type PersonalizerStep = "intro" | "about" | "goals" | "preview";
type AnalyticsSectionKey = "review" | "matrix";
type FeedbackSettings = {
  sound: boolean;
  haptics: boolean;
};
type ReminderSettings = {
  enabled: boolean;
  time: string;
  lastFiredDate?: string;
};
type AnalyticsInsight = {
  label: string;
  value: string;
  detail: string;
};
type AnalyticsSummary = {
  sentence: string;
  action: {
    title: string;
    detail: string;
  };
  insights: AnalyticsInsight[];
};
const collapsedSettingsSections: Record<SettingsSectionKey, boolean> = {
  personalize: false,
  backup: false,
  theme: false,
  feedback: false,
  reminders: false,
  wins: false,
  sync: false
};
const defaultFeedbackSettings: FeedbackSettings = {
  sound: true,
  haptics: true
};
const defaultReminderSettings: ReminderSettings = {
  enabled: false,
  time: "20:30"
};
const defaultAnalyticsSections: Record<AnalyticsSectionKey, boolean> = {
  review: true,
  matrix: false
};
const personalizerFlowSteps: Array<{ key: Exclude<PersonalizerStep, "intro">; label: string }> = [
  { key: "about", label: "About you" },
  { key: "goals", label: "Goals" },
  { key: "preview", label: "Preview" }
];
const dayPartLabels: Record<DayPartKey, string> = {
  morning: "Morning",
  daytime: "Daytime",
  evening: "Evening"
};
const dayPartMicrocopy: Record<DayPartKey, string> = {
  morning: "Start clean",
  daytime: "Protect focus",
  evening: "Close gently"
};
const defaultWinCategoryOpenState = createCategoryOpenState(["morning-routine", "health"]);
const defaultSampleCategoryOpenState = createCategoryOpenState(["morning-routine"]);
const dailyNotePrompts = [
  "What made today easier or harder? One line is enough.",
  "What helped the wins happen today?",
  "What got in the way today?",
  "What should tomorrow-you remember?",
  "Which win felt easiest today?",
  "Where did the day leak energy?",
  "What is one tiny adjustment for tomorrow?"
];
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

type CloudBackupStatus = "idle" | "pending" | "syncing" | "synced" | "error";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
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
  const [newHabitQuip, setNewHabitQuip] = useState("Custom win ready to track.");
  const [newHabitThumbnail, setNewHabitThumbnail] = useState(thumbnailOptions[0].src);
  const [newHabitColor, setNewHabitColor] = useState(colorPalette[0]);
  const [newHabitDayPart, setNewHabitDayPart] = useState<DayPartKey>("daytime");
  const [expandedWinCategories, setExpandedWinCategories] =
    useState<Record<HabitCategoryKey, boolean>>(defaultWinCategoryOpenState);
  const [expandedSampleCategories, setExpandedSampleCategories] =
    useState<Record<HabitCategoryKey, boolean>>(defaultSampleCategoryOpenState);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [requirementMenuHabitId, setRequirementMenuHabitId] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(true);
  const [monthOpen, setMonthOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [openDayParts, setOpenDayParts] = useState<Record<DayPartKey, boolean>>(() =>
    createInitialDayPartOpenState(getDayPartForHour(new Date().getHours()))
  );
  const [analyticsSections, setAnalyticsSections] =
    useState<Record<AnalyticsSectionKey, boolean>>(defaultAnalyticsSections);
  const [celebration, setCelebration] = useState<CompletionCelebration | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const requirementPressTimerRef = useRef<number | null>(null);
  const requirementPressTriggeredRef = useRef(false);
  const [perfectDayCelebration, setPerfectDayCelebration] = useState<PerfectDayCelebration | null>(null);
  const perfectDayTimeoutRef = useRef<number | null>(null);
  const [appToast, setAppToast] = useState<AppToast | null>(null);
  const appToastTimeoutRef = useRef<number | null>(null);
  const [noteSavedVisible, setNoteSavedVisible] = useState(false);
  const noteSavedTimerRef = useRef<number | null>(null);
  const noteSavedHideTimerRef = useRef<number | null>(null);
  const [clientStateReady, setClientStateReady] = useState(false);
  const [personalizerOpen, setPersonalizerOpen] = useState(false);
  const [personalizerStep, setPersonalizerStep] = useState<PersonalizerStep>("intro");
  const [onboarding, setOnboarding] = useState<OnboardingInput>(defaultOnboardingInput);
  const [personalizationSnapshot, setPersonalizationSnapshot] = useState<PersonalizationSnapshot | null>(null);
  const [appThemeKey, setAppThemeKey] = useState<AppThemeKey>("fresh-ledger");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => getInitialColorScheme());
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(defaultFeedbackSettings);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(defaultReminderSettings);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installReady, setInstallReady] = useState(false);
  const [installFallbackReady, setInstallFallbackReady] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [simpleToday, setSimpleToday] = useState(true);
  const [starterListAccepted, setStarterListAccepted] = useState(false);
  const [quickManagerOpen, setQuickManagerOpen] = useState(false);
  const [quickOptionalOpen, setQuickOptionalOpen] = useState(false);
  const [winsMenuOpen, setWinsMenuOpen] = useState(false);
  const [holdMenuHintSeenDate, setHoldMenuHintSeenDate] = useState<string | null>(null);
  const [holdMenuHintSessionDate, setHoldMenuHintSessionDate] = useState<string | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [expandedSettingsSections, setExpandedSettingsSections] =
    useState<Record<SettingsSectionKey, boolean>>(collapsedSettingsSections);
  const [cloudSession, setCloudSession] = useState<SupabaseSession | null>(null);
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("Local-first mode is on. Sign in only when you want backup or sync.");
  const [cloudOverview, setCloudOverview] = useState<CloudOverview | null>(null);
  const [cloudBackupStatus, setCloudBackupStatus] = useState<CloudBackupStatus>("idle");
  const [cloudBackupError, setCloudBackupError] = useState<string | null>(null);
  const cloudBackupQueuedDuringSyncRef = useRef(false);
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
      setPersonalizerStep("intro");
      setPersonalizerOpen(false);
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

    const storedFeedback = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (storedFeedback) {
      try {
        const parsed = JSON.parse(storedFeedback) as Partial<FeedbackSettings>;
        setFeedbackSettings({
          sound: typeof parsed.sound === "boolean" ? parsed.sound : true,
          haptics: typeof parsed.haptics === "boolean" ? parsed.haptics : true
        });
      } catch {
        window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
      }
    }

    const storedReminders = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (storedReminders) {
      try {
        setReminderSettings(normalizeReminderSettings(JSON.parse(storedReminders) as Partial<ReminderSettings>));
      } catch {
        window.localStorage.removeItem(REMINDER_STORAGE_KEY);
      }
    }

    if ("Notification" in window) {
      setNotificationPermission(window.Notification.permission);
    }

    setIsIosDevice(isIOSDevice());
    const installedAppMode = isRunningAsInstalledApp();
    setIsInstalledApp(installedAppMode);
    if (installedAppMode) {
      window.localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
    }

    const storedSettingsSection = window.localStorage.getItem(SETTINGS_SECTION_STORAGE_KEY);
    if (isSettingsSectionKey(storedSettingsSection)) {
      setExpandedSettingsSections({ ...collapsedSettingsSections, [storedSettingsSection]: true });
    }

    const storedSimpleToday = window.localStorage.getItem(SIMPLE_TODAY_STORAGE_KEY);
    if (storedSimpleToday === "full") {
      setSimpleToday(false);
    }
    setStarterListAccepted(window.localStorage.getItem(STARTER_LIST_ACCEPTED_KEY) === "true");

    const storedHoldMenuHintSeenDate = window.localStorage.getItem(HOLD_MENU_HINT_SEEN_KEY);
    if (storedHoldMenuHintSeenDate) {
      setHoldMenuHintSeenDate(storedHoldMenuHintSeenDate);
    }

    const today = new Date();
    const todayKey = localDateKey(today);
    selectedDateRef.current = todayKey;
    setSelectedDate(todayKey);
    setVisibleMonth(startOfMonth(today));
    setClientStateReady(true);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register(`${APP_BASE_PATH}/sw.js`).catch(() => {
      // PWA support is a return-path bonus; the app remains fully local-first without it.
    });
  }, []);

  useEffect(() => {
    if (!quickManagerOpen) {
      setQuickOptionalOpen(false);
    }
  }, [quickManagerOpen]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallReady(true);
      setInstallFallbackReady(false);
    };
    const handleInstalled = () => {
      window.localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
      setInstallReady(false);
      setInstallFallbackReady(false);
      setInstallPrompt(null);
      setIsInstalledApp(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!clientStateReady || isInstalledApp || isIosDevice || installReady) {
      setInstallFallbackReady(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInstallFallbackReady(true);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [clientStateReady, installReady, isInstalledApp, isIosDevice]);

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
    const syncMonthState = () => {
      if (query.matches) {
        setMonthOpen(false);
      }
    };
    syncMonthState();
    query.addEventListener("change", syncMonthState);
    return () => query.removeEventListener("change", syncMonthState);
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
      if (requirementPressTimerRef.current) {
        window.clearTimeout(requirementPressTimerRef.current);
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
    syncShellThemeChrome(colorScheme);
  }, [colorScheme]);

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

  const queueCloudBackup = useCallback(() => {
    if (cloudSession?.user.id && consents.sync) {
      setCloudBackupStatus((status) => {
        if (status === "syncing") {
          cloudBackupQueuedDuringSyncRef.current = true;
          return status;
        }

        return "pending";
      });
      setCloudBackupError(null);
    }
  }, [cloudSession?.user.id, consents.sync]);

  const commit = useCallback(
    (recipe: (current: TrackerState) => TrackerState) => {
      const next = recipe(trackerRef.current);
      const stamped = { ...next, updatedAt: new Date().toISOString() };
      trackerRef.current = stamped;
      saveTrackerState(stamped);
      setTracker(stamped);
      queueCloudBackup();
    },
    [queueCloudBackup]
  );

  const sortedHabits = useMemo(
    () => [...tracker.habits].sort((a, b) => a.order - b.order),
    [tracker.habits]
  );
  const habitOrderIndexById = useMemo(
    () => new Map(sortedHabits.map((habit, index) => [habit.id, index])),
    [sortedHabits]
  );
  const editorCategoryGroups = useMemo(() => groupHabitsByCategory(sortedHabits), [sortedHabits]);
  const sampleCategoryGroups = useMemo(() => groupHabitSamplesByCategory(habitSamples), []);
  const activeHabits = useMemo(() => sortedHabits.filter((habit) => !habit.pausedAt), [sortedHabits]);
  const primaryHabits = useMemo(() => getPermanentHabits(activeHabits), [activeHabits]);
  const optionalHabits = useMemo(() => getOptionalHabits(activeHabits), [activeHabits]);
  const permanentRequirementIds = useMemo(
    () =>
      new Set(
        sortedHabits
          .filter((habit, index) => habit.requirement === "permanent" || (!habit.requirement && index < DEFAULT_PRIMARY_WIN_COUNT))
          .map((habit) => habit.id)
      ),
    [sortedHabits]
  );
  const quickCoreHabits = useMemo(
    () => sortedHabits.filter((habit) => permanentRequirementIds.has(habit.id)),
    [permanentRequirementIds, sortedHabits]
  );
  const quickOptionalHabits = useMemo(
    () => sortedHabits.filter((habit) => !permanentRequirementIds.has(habit.id)),
    [permanentRequirementIds, sortedHabits]
  );
  const dayPartGroups = useMemo(() => groupHabitsByDayPart(primaryHabits), [primaryHabits]);
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
  const primaryCompletedSet = useMemo(
    () =>
      new Set(
        primaryHabits
          .filter((habit) => isHabitComplete(selectedRecord, habit.id))
          .map((habit) => habit.id)
      ),
    [primaryHabits, selectedRecord]
  );
  const completedCount = primaryCompletedSet.size;
  const optionalCompletedCount = optionalHabits.filter((habit) => completedSet.has(habit.id)).length;
  const completionPercent =
    primaryHabits.length > 0 ? Math.round((completedCount / primaryHabits.length) * 100) : 0;
  const remainingCoreWins = Math.max(primaryHabits.length - completedCount, 0);
  const coreWinsStatusLabel =
    primaryHabits.length === 0 ? "No core wins" : remainingCoreWins === 0 ? "Finished" : `${remainingCoreWins} left`;
  const todayKey = localDateKey(new Date());
  const currentDayPart = useMemo(() => getDayPartForHour(new Date().getHours()), []);
  const streak = useMemo(
    () => countStreakEndingAt(todayKey, tracker, primaryHabits),
    [todayKey, tracker, primaryHabits]
  );
  const monthProgress = useMemo(
    () => countMonthProgress(monthDays, primaryHabits, tracker),
    [monthDays, primaryHabits, tracker]
  );
  const analyticsSummary = useMemo(
    () => getAnalyticsSummary(monthDays, primaryHabits, tracker, todayKey, streak),
    [monthDays, primaryHabits, tracker, todayKey, streak]
  );
  const analyticsInsights = analyticsSummary.insights;
  const bestWinInsight = analyticsInsights.find((insight) => insight.label === "Best win");
  const mostMissedInsight = analyticsInsights.find((insight) => insight.label === "Most missed");
  const streakNudge = getStreakNudge(streak, completedCount, primaryHabits.length);
  const defaultWinSetup = useMemo(() => hasDefaultWinSetup(tracker), [tracker.habits]);
  const activitySummary = useMemo(() => summarizeTrackerActivity(tracker.days, todayKey), [tracker.days, todayKey]);
  const experienceState = useMemo(
    () =>
      getProductExperienceState({
        hasPersonalization: Boolean(personalizationSnapshot),
        defaultWinSetup,
        activity: activitySummary
      }),
    [activitySummary, defaultWinSetup, personalizationSnapshot]
  );
  const analyticsStage = useMemo(() => getAnalyticsUnlockStage(activitySummary), [activitySummary]);
  const analyticsUnlocked = analyticsStage !== "locked";
  const monthlyReviewUnlocked = canShowMonthlyReview(analyticsStage);
  const patternAnalyticsUnlocked = canShowPatternAnalytics(analyticsStage);
  const fiveDayReflectionVisible = patternAnalyticsUnlocked && activitySummary.activeDayCount >= 5;
  const fiveDayReflectionNextMove = analyticsSummary.action.title.replace(/^Tomorrow:\s*/, "");
  const fiveDayFragileWin =
    mostMissedInsight?.value && mostMissedInsight.value !== "Nothing missed"
      ? mostMissedInsight.value
      : "nothing fragile yet";
  const dailyNotePlaceholder = useMemo(
    () => dailyNotePrompts[dateFromKey(selectedDate).getDay() % dailyNotePrompts.length],
    [selectedDate]
  );
  const holdMenuHintCandidate = getHoldMenuHint({
    permanentCount: primaryHabits.length,
    currentDayPart
  });
  const holdMenuHint =
    clientStateReady &&
    holdMenuHintCandidate &&
    (holdMenuHintSeenDate !== todayKey || holdMenuHintSessionDate === todayKey)
      ? holdMenuHintCandidate
      : null;
  const shouldPromptPersonalization =
    !starterListAccepted &&
    !personalizationSnapshot &&
    defaultWinSetup &&
    (experienceState === "first_run_empty" || experienceState === "starter_active_no_history");
  const firstRunFocus = experienceState === "first_run_empty" && !starterListAccepted;
  const firstWinAhaVisible = experienceState === "first_run_started" && selectedDate === todayKey && completedCount > 0;
  const firstWinAhaText =
    completedCount === 1 ? "Momentum started. First win logged." : `${completedCount} wins today — momentum is moving.`;
  const lapsedReturnVisible = experienceState === "returning_lapsed" && selectedDate === todayKey;
  const endOfDayRecapVisible =
    !firstRunFocus && !firstWinAhaVisible && selectedDate === todayKey && currentDayPart === "evening" && completedCount > 0;
  const analyticsRecapText =
    activitySummary.totalLoggedWins === 1
      ? "1 win logged so far."
      : `${activitySummary.totalLoggedWins} wins logged across ${activitySummary.activeDayCount} active day${
          activitySummary.activeDayCount === 1 ? "" : "s"
        }.`;
  const companionNudge = useMemo(
    () =>
      getCompanionNudge({
        groups: dayPartGroups,
        completedSet: primaryCompletedSet,
        completedCount,
        totalCount: primaryHabits.length,
        currentDayPart
      }),
    [primaryHabits.length, completedCount, primaryCompletedSet, currentDayPart, dayPartGroups]
  );
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
    "--app-bg": isDarkScheme ? "#111c19" : appTheme.background,
    "--app-surface": isDarkScheme ? "#1a2925" : appTheme.surface,
    "--app-soft": isDarkScheme ? "#263d36" : appTheme.soft,
    "--app-ink": isDarkScheme ? "#e4f5ef" : appTheme.ink
  } as CSSProperties;
  const localSaveLabel = formatLocalSaveStatus(tracker.updatedAt);
  const earlyWinSetupWindow =
    experienceState === "first_run_empty" ||
    experienceState === "starter_active_no_history" ||
    (!personalizationSnapshot && activitySummary.activeDayCount < 5);
  const headerReturnAction =
    clientStateReady && !isInstalledApp
      ? "install"
      : clientStateReady && isInstalledApp && !reminderSettings.enabled && earlyWinSetupWindow
        ? "reminder"
        : null;
  const installActionWaiting =
    headerReturnAction === "install" && !isIosDevice && !installReady && !installFallbackReady;
  const headerReturnLabel =
    headerReturnAction === "install"
      ? installActionWaiting
        ? "Wait"
        : isIosDevice
          ? "Add app"
          : "Install"
      : headerReturnAction === "reminder"
        ? "Remind"
        : null;
  const headerReturnTitle =
    headerReturnAction === "install"
      ? installActionWaiting
        ? "Install prompt is getting ready"
        : isIosDevice
          ? "Add to Home Screen"
          : "Install The Win List"
      : headerReturnAction === "reminder"
        ? "Turn on reminders"
        : undefined;

  const toggleDayPart = useCallback((dayPart: DayPartKey) => {
    setOpenDayParts((current) => ({
      ...current,
      [dayPart]: !current[dayPart]
    }));
  }, []);

  const toggleAnalyticsSection = useCallback((section: AnalyticsSectionKey) => {
    setAnalyticsSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }, []);

  const showAppToast = useCallback((message: string, tone: AppToast["tone"] = "success") => {
    if (appToastTimeoutRef.current) {
      window.clearTimeout(appToastTimeoutRef.current);
    }

    setAppToast({ id: Date.now(), message, tone });
    appToastTimeoutRef.current = window.setTimeout(() => {
      setAppToast(null);
    }, 2600);
  }, []);

  const showDailyTrustToast = useCallback(
    (storageKey: string, message: string, tone: AppToast["tone"] = "success") => {
      if (window.localStorage.getItem(storageKey) === todayKey) {
        return;
      }

      window.localStorage.setItem(storageKey, todayKey);
      showAppToast(message, tone);
    },
    [showAppToast, todayKey]
  );

  const showLocalTrustToast = useCallback(
    (message = "Saved locally. Your Win List is safe on this device.") => {
      showDailyTrustToast(SAVE_TRUST_TOAST_DATE_KEY, message);
    },
    [showDailyTrustToast]
  );

  const showCloudTrustToast = useCallback(
    (message = "Cloud backup updated.") => {
      showDailyTrustToast(CLOUD_TRUST_TOAST_DATE_KEY, message);
    },
    [showDailyTrustToast]
  );

  const toggleSimpleToday = useCallback(() => {
    setSimpleToday((current) => {
      const next = !current;
      window.localStorage.setItem(SIMPLE_TODAY_STORAGE_KEY, next ? "simple" : "full");
      return next;
    });
  }, []);

  const hideHoldMenuHintForToday = useCallback(() => {
    window.localStorage.setItem(HOLD_MENU_HINT_SEEN_KEY, todayKey);
    setHoldMenuHintSeenDate(todayKey);
    setHoldMenuHintSessionDate(null);
  }, [todayKey]);

  const saveReminderSettings = useCallback((recipe: (current: ReminderSettings) => ReminderSettings) => {
    setReminderSettings((current) => {
      const next = normalizeReminderSettings(recipe(current));
      window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const fireReminder = useCallback(
    (message: string) => {
      if ("Notification" in window && window.Notification.permission === "granted") {
        try {
          new window.Notification("The Win List", {
            body: message,
            icon: `${APP_BASE_PATH}/icon.svg`,
            tag: "the-win-list-daily-reminder"
          });
          return;
        } catch {
          // Fall back to the in-app toast below.
        }
      }

      showAppToast(message);
    },
    [showAppToast]
  );

  const requestReminderPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      showAppToast("This browser cannot show notifications, so reminders will stay in-app.", "error");
      saveReminderSettings((current) => ({ ...current, enabled: true }));
      return;
    }

    const permission =
      window.Notification.permission === "default"
        ? await window.Notification.requestPermission()
        : window.Notification.permission;
    setNotificationPermission(permission);
    saveReminderSettings((current) => ({ ...current, enabled: true }));
    showAppToast(
      permission === "granted"
        ? "Daily reminder is on."
        : "Daily reminder is on as an in-app fallback while The Win List is open.",
      permission === "denied" ? "error" : "success"
    );
  }, [saveReminderSettings, showAppToast]);

  const handleInstallApp = useCallback(async () => {
    if (isInstalledApp) {
      showAppToast("The Win List already looks installed on this device.");
      return;
    }

    if (!clientStateReady) {
      return;
    }

    if (isIosDevice && !installPrompt) {
      showAppToast("iPhone install: open in Safari, tap Share, then Add to Home Screen.");
      return;
    }

    if (!isIosDevice && !installPrompt && !installFallbackReady) {
      showAppToast("Install is getting ready. Try again in a moment.");
      return;
    }

    if (!installPrompt) {
      showAppToast("Use your browser menu to add The Win List to your home screen.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallReady(false);
    if (choice.outcome === "accepted") {
      window.localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
      setIsInstalledApp(true);
      showAppToast("The Win List is installed. The return path is shorter now.");
    } else {
      showAppToast("Install skipped. You can add it later from Settings.");
    }
  }, [clientStateReady, installFallbackReady, installPrompt, isInstalledApp, isIosDevice, showAppToast]);

  const handleHeaderReturnAction = useCallback(() => {
    if (headerReturnAction === "install") {
      void handleInstallApp();
      return;
    }

    if (headerReturnAction === "reminder") {
      void requestReminderPermission();
    }
  }, [handleInstallApp, headerReturnAction, requestReminderPermission]);

  useEffect(() => {
    if (!reminderSettings.enabled || primaryHabits.length === 0) {
      return;
    }

    const tick = () => {
      const now = new Date();
      const today = localDateKey(now);
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (currentTime !== reminderSettings.time || reminderSettings.lastFiredDate === today) {
        return;
      }

      const remaining = primaryHabits.length - completedCount;
      saveReminderSettings((current) => ({ ...current, lastFiredDate: today }));

      if (remaining > 0) {
        fireReminder(`${remaining} core win${remaining === 1 ? "" : "s"} still open for today.`);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, [completedCount, fireReminder, primaryHabits.length, reminderSettings, saveReminderSettings]);

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

      triggerCompletionFeedback(moodOption?.tone ?? habit.color, "sequence", feedbackSettings);

      celebrationTimeoutRef.current = window.setTimeout(() => {
        setCelebration(null);
      }, 1500);
    },
    [feedbackSettings]
  );

  const clearRequirementPressTimer = useCallback(() => {
    if (requirementPressTimerRef.current) {
      window.clearTimeout(requirementPressTimerRef.current);
      requirementPressTimerRef.current = null;
    }
  }, []);

  const startRequirementLongPress = useCallback(
    (habit: Habit) => {
      primeCompletionFeedback();
      clearRequirementPressTimer();
      requirementPressTriggeredRef.current = false;
      requirementPressTimerRef.current = window.setTimeout(() => {
        requirementPressTimerRef.current = null;
        requirementPressTriggeredRef.current = true;
        setExpandedHabitId(null);
        setRequirementMenuHabitId(habit.id);
        if (feedbackSettings.haptics) {
          triggerCompletionHaptic("tap");
        }
      }, 560);
    },
    [clearRequirementPressTimer, feedbackSettings.haptics]
  );

  const finishRequirementLongPress = useCallback(() => {
    clearRequirementPressTimer();
    if (requirementPressTriggeredRef.current) {
      window.setTimeout(() => {
        requirementPressTriggeredRef.current = false;
      }, 220);
    }
  }, [clearRequirementPressTimer]);

  const consumeRequirementLongPress = useCallback(() => {
    if (!requirementPressTriggeredRef.current) {
      return false;
    }

    requirementPressTriggeredRef.current = false;
    return true;
  }, []);

  const triggerPerfectDayCelebration = useCallback((tone: string, total: number) => {
    if (perfectDayTimeoutRef.current) {
      window.clearTimeout(perfectDayTimeoutRef.current);
    }

    setPerfectDayCelebration({
      id: Date.now(),
      tone,
      total
    });

    triggerCompletionFeedback(tone, "stack", feedbackSettings);

    perfectDayTimeoutRef.current = window.setTimeout(() => {
      setPerfectDayCelebration(null);
    }, 2400);
  }, [feedbackSettings]);

  const maybeTriggerPerfectDay = useCallback(
    (habitId: string, mood: MoodKey, tone: string) => {
      if (
        selectedDate !== todayKey ||
        !isCompletionMood(mood) ||
        primaryHabits.length === 0 ||
        !primaryHabits.some((habit) => habit.id === habitId)
      ) {
        return;
      }

      const record = trackerRef.current.days[selectedDate] ?? emptyDay;
      const alreadyPerfect = primaryHabits.every((habit) => isHabitComplete(record, habit.id));
      const nextRecord: DayRecord = {
        ...record,
        completedHabitIds: record.completedHabitIds.includes(habitId)
          ? record.completedHabitIds
          : [...record.completedHabitIds, habitId],
        habitMoods: { ...(record.habitMoods ?? {}), [habitId]: mood }
      };
      const nextPerfect = primaryHabits.every((habit) => isHabitComplete(nextRecord, habit.id));

      if (!alreadyPerfect && nextPerfect) {
        triggerPerfectDayCelebration(tone, primaryHabits.length);
      }
    },
    [primaryHabits, selectedDate, todayKey, triggerPerfectDayCelebration]
  );

  const updateHabitMood = useCallback(
    (habitId: string, mood: MoodKey) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        const habitMoods = { ...(record.habitMoods ?? {}) };
        const completedHabitIds = new Set(record.completedHabitIds);

        if (habitMoods[habitId] === mood) {
          delete habitMoods[habitId];
          completedHabitIds.delete(habitId);
        } else {
          habitMoods[habitId] = mood;
          if (isCompletionMood(mood)) {
            completedHabitIds.add(habitId);
          } else {
            completedHabitIds.delete(habitId);
          }
        }

        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: { ...record, completedHabitIds: Array.from(completedHabitIds), habitMoods }
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
        const completedHabitIds = new Set(record.completedHabitIds);
        if (isCompletionMood(mood)) {
          completedHabitIds.add(habitId);
        } else {
          completedHabitIds.delete(habitId);
        }

        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: {
              ...record,
              completedHabitIds: Array.from(completedHabitIds),
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

      setRequirementMenuHabitId(null);
      if (isHabitComplete(record, habit.id)) {
        triggerCompletionFeedback(habit.color, "tap", feedbackSettings);
        clearHabitMood(habit.id);
        return;
      }

      const mood = defaultWinMood ?? moodOptions[0];
      maybeTriggerPerfectDay(habit.id, mood.key, mood.tone);
      setHabitMood(habit.id, mood.key);
      setExpandedHabitId(null);
      triggerCompletionCelebration(habit, mood);
      if (selectedDate === todayKey && primaryHabits.some((item) => item.id === habit.id) && primaryCompletedSet.size === 0) {
        showAppToast("Momentum started. First win logged.");
      }
    },
    [
      clearHabitMood,
      feedbackSettings,
      maybeTriggerPerfectDay,
      primaryCompletedSet.size,
      primaryHabits,
      selectedDate,
      setHabitMood,
      showAppToast,
      todayKey,
      triggerCompletionCelebration
    ]
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
        quip: newHabitQuip.trim() || "Custom win ready to track.",
        createdAt: new Date().toISOString(),
        dayPart: newHabitDayPart,
        requirement: "permanent"
      };

      return { ...current, habits: [...current.habits, habit] };
    });

    setNewHabitName("");
    setNewHabitQuip("Custom win ready to track.");
    setNewHabitColor((current) => colorPalette[(colorPalette.indexOf(current) + 1) % colorPalette.length]);
    showLocalTrustToast("Saved locally. Your win list changed.");
  }, [commit, newHabitColor, newHabitDayPart, newHabitName, newHabitQuip, newHabitThumbnail, showLocalTrustToast]);

  const applyHabitSample = useCallback((sample: HabitSample) => {
    setNewHabitName(sample.name);
    setNewHabitQuip(sample.quip);
    setNewHabitColor(sample.color);
    setNewHabitThumbnail(sample.thumbnail);
    setNewHabitDayPart(sample.dayPart ?? "daytime");
  }, []);

  const toggleWinCategory = useCallback((category: HabitCategoryKey) => {
    setExpandedWinCategories((current) => ({ ...current, [category]: !current[category] }));
  }, []);

  const toggleSampleCategory = useCallback((category: HabitCategoryKey) => {
    setExpandedSampleCategories((current) => ({ ...current, [category]: !current[category] }));
  }, []);

  const updateHabit = useCallback(
    (habitId: string, patch: Partial<Pick<Habit, "name" | "thumbnail" | "color" | "quip" | "dayPart">>) => {
      commit((current) => ({
        ...current,
        habits: current.habits.map((habit) => (habit.id === habitId ? { ...habit, ...patch } : habit))
      }));
      showLocalTrustToast("Saved locally. Your win list changed.");
    },
    [commit, showLocalTrustToast]
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
      showLocalTrustToast("Saved locally. Your win order changed.");
    },
    [commit, showLocalTrustToast]
  );

  const makeOptionalHabitPermanent = useCallback(
    (habitId: string) => {
      let changedHabitName: string | null = null;
      let permanentCount: number | null = null;

      commit((current) => {
        const promotion = makeHabitPermanent(current.habits, habitId);
        if (!promotion.changed) {
          return current;
        }

        changedHabitName = promotion.habit.name;
        permanentCount = promotion.permanentCount;
        return {
          ...current,
          habits: promotion.habits
        };
      });

      setExpandedHabitId(null);
      setRequirementMenuHabitId(null);
      if (changedHabitName) {
        showLocalTrustToast(`${changedHabitName} is a core win now. Core wins: ${permanentCount ?? primaryHabits.length + 1}.`);
      }
    },
    [commit, primaryHabits.length, showLocalTrustToast]
  );

  const makePermanentHabitOptional = useCallback(
    (habitId: string) => {
      let changedHabitName: string | null = null;
      let permanentCount: number | null = null;

      commit((current) => {
        const demotion = makeHabitOptional(current.habits, habitId);
        if (!demotion.changed) {
          return current;
        }

        changedHabitName = demotion.habit.name;
        permanentCount = demotion.permanentCount;
        return {
          ...current,
          habits: demotion.habits
        };
      });

      setExpandedHabitId(null);
      setRequirementMenuHabitId(null);
      if (changedHabitName) {
        showLocalTrustToast(`${changedHabitName} is optional now. Core wins: ${permanentCount ?? Math.max(0, primaryHabits.length - 1)}.`);
      }
    },
    [commit, primaryHabits.length, showLocalTrustToast]
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
      showLocalTrustToast("Saved locally. Your win list changed.");
    },
    [commit, showLocalTrustToast]
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
      showLocalTrustToast("Saved locally. Your win list changed.");
    },
    [commit, showLocalTrustToast]
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
    const habitRows = primaryHabits;
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
  }, [primaryHabits, selectedDate, selectedRecord, showAppToast]);

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
      queueCloudBackup();
      showAppToast("Backup imported.", "success");
    } catch {
      showAppToast("I could not read that backup file.", "error");
    }
  }, [queueCloudBackup, showAppToast]);

  const resetTracker = useCallback(() => {
    const next = createDefaultState();
    trackerRef.current = next;
    setTracker(next);
    saveTrackerState(next);
    window.localStorage.removeItem(STARTER_LIST_ACCEPTED_KEY);
    setStarterListAccepted(false);
    queueCloudBackup();
    setResetConfirmOpen(false);
    showAppToast("Win List reset.", "success");
  }, [queueCloudBackup, showAppToast]);

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
    setPersonalizerStep("about");
    setPersonalizerOpen(false);
    queueCloudBackup();
    showLocalTrustToast("Saved locally. Your personalized Win List is ready.");
  }, [onboarding, queueCloudBackup, showLocalTrustToast]);

  const selectAppTheme = useCallback((themeKey: AppThemeKey) => {
    setAppThemeKey(themeKey);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeKey);
    queueCloudBackup();
    showLocalTrustToast("Saved locally. Your settings changed.");
  }, [queueCloudBackup, showLocalTrustToast]);

  const selectColorScheme = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  }, []);

  const updateFeedbackSetting = useCallback((key: keyof FeedbackSettings, value: boolean) => {
    setFeedbackSettings((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const testFeedback = useCallback(() => {
    primeCompletionFeedback();
    triggerCompletionFeedback(appTheme.primary, "stack", feedbackSettings);
    showAppToast("Feedback test played.", "success");
  }, [appTheme.primary, feedbackSettings, showAppToast]);

  const toggleSettingsSection = useCallback((section: SettingsSectionKey) => {
    setExpandedSettingsSections((current) => {
      const willOpen = !current[section];
      if (willOpen) {
        window.localStorage.setItem(SETTINGS_SECTION_STORAGE_KEY, section);
        return { ...collapsedSettingsSections, [section]: true };
      }

      window.localStorage.removeItem(SETTINGS_SECTION_STORAGE_KEY);
      return collapsedSettingsSections;
    });
  }, []);

  const openWinsSettings = useCallback(() => {
    setSettingsOpen(true);
    setExpandedSettingsSections({ ...collapsedSettingsSections, wins: true });
    window.localStorage.setItem(SETTINGS_SECTION_STORAGE_KEY, "wins");
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
    if (accepted) {
      setCloudBackupStatus((status) => (status === "syncing" ? "syncing" : "pending"));
    } else {
      setCloudBackupStatus("idle");
      setCloudBackupError(null);
    }
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

  const uploadCurrentTrackerToCloud = useCallback(async (mode: "manual" | "auto") => {
    const client = getSupabaseClient();
    const userId = cloudSession?.user.id;

    if (!client || !userId) {
      setCloudMessage("Sign in before uploading this browser's Win List.");
      setCloudBackupStatus("idle");
      return;
    }

    if (!consents.sync) {
      setCloudMessage("Agree to the terms before syncing this Win List.");
      setCloudBackupStatus("idle");
      return;
    }

    if (mode === "manual") {
      setCloudBusy(true);
    }
    setCloudBackupStatus("syncing");
    setCloudBackupError(null);
    setCloudMessage(mode === "manual" ? "Uploading this local Win List to Supabase..." : "Backing up recent changes...");
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
      if (cloudBackupQueuedDuringSyncRef.current) {
        cloudBackupQueuedDuringSyncRef.current = false;
        setCloudBackupStatus("pending");
        setCloudMessage("Backed up. One newer local change is queued next.");
      } else {
        setCloudBackupStatus("synced");
        setCloudMessage("Backed up. LocalStorage is still the instant offline source.");
        if (mode === "manual") {
          showAppToast("Backed up to cloud.");
        } else {
          showCloudTrustToast("Backed up to cloud.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sync this Win List.";
      setCloudBackupStatus("error");
      setCloudBackupError(message);
      setCloudMessage(message);
      showAppToast("Cloud backup failed. Retry from Settings.", "error");
    } finally {
      if (mode === "manual") {
        setCloudBusy(false);
      }
    }
  }, [appThemeKey, cloudSession?.user.id, consents, personalizationSnapshot, showAppToast, showCloudTrustToast]);

  const handleCloudUpload = useCallback(async () => {
    await uploadCurrentTrackerToCloud("manual");
  }, [uploadCurrentTrackerToCloud]);

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
      setCloudBackupStatus("synced");
      setCloudBackupError(null);
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
    setCloudBackupStatus("idle");
    setCloudBackupError(null);
    setCloudMessage("Signed out. This browser still keeps the local Win List.");
  }, []);

  useEffect(() => {
    if (!cloudSession?.user.id || !consents.sync) {
      return;
    }

    if (!cloudOverview?.lastSyncedAt) {
      setCloudBackupStatus((status) => (status === "idle" ? "pending" : status));
    }
  }, [cloudOverview?.lastSyncedAt, cloudSession?.user.id, consents.sync]);

  useEffect(() => {
    if (cloudBackupStatus !== "pending" || !cloudSession?.user.id || !consents.sync) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void uploadCurrentTrackerToCloud("auto");
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [cloudBackupStatus, cloudSession?.user.id, consents.sync, uploadCurrentTrackerToCloud]);

  useEffect(() => {
    if (
      !clientStateReady ||
      !dayOpen ||
      !holdMenuHintCandidate ||
      holdMenuHintSeenDate === todayKey ||
      holdMenuHintSessionDate === todayKey
    ) {
      return;
    }

    window.localStorage.setItem(HOLD_MENU_HINT_SEEN_KEY, todayKey);
    setHoldMenuHintSeenDate(todayKey);
    setHoldMenuHintSessionDate(todayKey);
  }, [clientStateReady, dayOpen, holdMenuHintCandidate, holdMenuHintSeenDate, holdMenuHintSessionDate, todayKey]);

  if (!clientStateReady) {
    return (
      <main
        suppressHydrationWarning
        className={`tracker-shell booting theme-${appThemeKey} scheme-${colorScheme}`}
        style={appStyle}
        aria-busy="true"
      >
        <section className="tracker-boot-card" aria-label="Loading The Win List">
          <LogoMark />
          <div>
            <span>The Win List</span>
            <strong>Loading your wins</strong>
            <p>Saved locally. No login needed.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      suppressHydrationWarning
      className={`tracker-shell theme-${appThemeKey} scheme-${colorScheme}${shouldPromptPersonalization ? " setup-pending" : ""}${
        firstRunFocus ? " first-run-focus" : ""
      } experience-${experienceState} analytics-${analyticsStage}`}
      style={appStyle}
    >
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

        <div className={`brand-lockup${personalizationSnapshot ? " personalized" : ""}`}>
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
              onClick={() => {
                setPersonalizerStep("about");
                setPersonalizerOpen(true);
              }}
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
            <div className="mobile-hero-meta">
              <span>{formatPrettyDate(selectedDate)}</span>
              {headerReturnAction ? (
                <button
                  className="mobile-return-chip"
                  type="button"
                  onClick={handleHeaderReturnAction}
                  disabled={installActionWaiting}
                  title={headerReturnTitle}
                  aria-label={headerReturnTitle}
                >
                  {headerReturnAction === "install" ? (
                    isIosDevice ? (
                      <Share2 size={13} aria-hidden="true" />
                    ) : (
                      <Download size={13} aria-hidden="true" />
                    )
                  ) : (
                    <CalendarDays size={13} aria-hidden="true" />
                  )}
                  {headerReturnLabel}
                </button>
              ) : null}
            </div>
            <strong>{completionPercent}%</strong>
          </div>
        </div>

        <div className="hero-actions" aria-label="Win List actions">
          {firstRunFocus ? (
            <div className="hero-actions-row setup mobile-activation-actions" aria-label="First run actions">
              <button
                className="icon-text-button hot setup-build-button"
                type="button"
                onClick={() => {
                  setPersonalizerStep("intro");
                  setPersonalizerOpen(true);
                }}
              >
                <Wand2 size={18} aria-hidden="true" />
                Build in 30 sec
              </button>
              <button
                className="icon-text-button setup-edit-button"
                type="button"
                onClick={() => {
                  setQuickManagerOpen(true);
                }}
              >
                <Settings2 size={18} aria-hidden="true" />
                Edit wins
              </button>
            </div>
          ) : null}
          {!firstRunFocus ? (
            <div className="hero-actions-row primary">
              <button className="icon-text-button" type="button" onClick={openTodayView}>
                <CalendarDays size={18} aria-hidden="true" />
                Today
              </button>
              {analyticsUnlocked ? (
                <button
                  className="icon-text-button"
                  type="button"
                  onClick={openMonthView}
                >
                  <ChartColumn size={18} aria-hidden="true" />
                  Analytics
                </button>
              ) : null}
              <button
                className={`icon-text-button${settingsOpen ? " hot" : ""}`}
                type="button"
                aria-pressed={settingsOpen}
                onClick={() => {
                  setExpandedSettingsSections(collapsedSettingsSections);
                  setSettingsOpen(true);
                }}
              >
                <Settings2 size={18} aria-hidden="true" />
                Settings
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {shouldShowPersonalizer ? (
        <div
          className={`settings-layer personalization-layer step-${personalizerStep}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="personalizer-title"
        >
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setPersonalizerOpen(false)}
            aria-label="Close personalization"
          />
          <aside className={`settings-drawer personalization-drawer step-${personalizerStep}`}>
            <PersonalizerPanel
              isOpen={personalizerOpen}
              step={personalizerStep}
              onboarding={onboarding}
              snapshot={personalizationSnapshot}
              onToggle={() => setPersonalizerOpen(false)}
              onStepChange={setPersonalizerStep}
              onUpdate={updateOnboarding}
              onToggleListItem={toggleOnboardingListItem}
              onApply={applyPersonalizedPlan}
            />
          </aside>
        </div>
      ) : null}

      <section className="dashboard-grid" aria-label="The Win List dashboard">
        <section className={`today-panel${dayOpen ? " open" : " collapsed"}${simpleToday ? " simple" : ""}`} aria-labelledby="today-title">
          <LogoMark className="panel-watermark" decorative />
          <div className="section-header">
            <div className="section-title-lockup">
              <LogoMark className="section-logo" decorative />
              <div>
                <span className="section-kicker">Selected day</span>
                <h2 id="today-title">{formatPrettyDate(selectedDate)}</h2>
              </div>
            </div>
            <div className="today-header-controls" aria-label="Today display controls">
              <button
                className={`simple-today-button${simpleToday ? " active" : ""}`}
                type="button"
                onClick={toggleSimpleToday}
                aria-pressed={simpleToday}
                title={simpleToday ? "Show full Today view" : "Use the simpler daily view"}
              >
                <CircleDot size={15} aria-hidden="true" />
                <span>{simpleToday ? "Simple" : "Full"}</span>
              </button>
              <button
                className="section-collapse-button"
                type="button"
                onClick={() => setDayOpen((open) => !open)}
                aria-expanded={dayOpen}
                aria-label={dayOpen ? "Hide day plan" : "Open day plan"}
              >
                <ChevronDown size={18} aria-hidden="true" />
                <span>{dayOpen ? "Hide" : "Open"}</span>
              </button>
            </div>
            <div className="progress-ring" style={{ "--progress": `${completionPercent}%` } as CSSProperties}>
              <span>{completionPercent}%</span>
            </div>
          </div>

          {!simpleToday ? (
            <div className="stat-strip" aria-label="Daily progress">
              <StatCard label="Core wins" value={`${completedCount}/${primaryHabits.length}`} />
              <StatCard
                label="Perfect streak"
                value={`${streak} day${streak === 1 ? "" : "s"}`}
                title="A perfect streak counts days where every core win is logged."
              />
              <StatCard
                label="Month rate"
                value={monthProgress.total > 0 ? `${Math.round((monthProgress.completed / monthProgress.total) * 100)}%` : "0%"}
                title={`${monthProgress.completed}/${monthProgress.total} core wins logged so far this month`}
              />
            </div>
          ) : null}

          {shouldPromptPersonalization ? (
            <div className="starter-card" aria-label="Personalize The Win List">
              <div>
                <span>Starter workday list</span>
                <strong>Change these wins anytime.</strong>
                <p>Edit here, or long-press a win to make it core or optional.</p>
              </div>
              <button
                className="starter-card-button"
                type="button"
                onClick={() => {
                  setPersonalizerStep("intro");
                  setPersonalizerOpen(true);
                }}
              >
                <Wand2 size={16} aria-hidden="true" />
                Build
              </button>
            </div>
          ) : null}

          {cloudBackupStatus === "error" && cloudSession && consents.sync ? (
            <div className="backup-error-chip" role="status" aria-label="Cloud backup needs attention">
              <span>Cloud backup paused</span>
              <button type="button" onClick={() => void uploadCurrentTrackerToCloud("manual")}>
                Retry
              </button>
            </div>
          ) : null}

          {firstWinAhaVisible ? (
            <div className="first-win-aha-card" role="status" aria-live="polite">
              <span>Today is moving</span>
              <strong>{firstWinAhaText}</strong>
              <p>{remainingCoreWins === 0 ? "Core wins are complete." : `${remainingCoreWins} core win${remainingCoreWins === 1 ? "" : "s"} left.`}</p>
            </div>
          ) : null}

          {lapsedReturnVisible ? (
            <div className="today-support-card lapsed-return-card" role="status">
              <span>Restart gently</span>
              <strong>No reset drama — restart with one win.</strong>
              <p>Your streak can start moving again from the next small action.</p>
            </div>
          ) : null}

          {endOfDayRecapVisible ? (
            <div className="today-support-card day-recap-card" role="status">
              <span>Evening recap</span>
              <strong>
                {completedCount}/{primaryHabits.length} core wins logged today.
              </strong>
              <p>{remainingCoreWins === 0 ? "Today is closed cleanly." : `${remainingCoreWins} left if you want to close the day.`}</p>
            </div>
          ) : null}

          {!simpleToday ? <p className="streak-nudge">{streakNudge}</p> : null}

          {!simpleToday ? (
            <div className="companion-nudge" aria-label="Win List companion check-in">
              <AnswerCharacter input={activePersonalization} />
              <div>
                <span>Companion check-in</span>
                <p>{companionNudge}</p>
                <small>{localSaveLabel}. No login needed.</small>
              </div>
            </div>
          ) : null}

          <div className="mobile-collapse-row">
            <div className="mobile-collapse-summary">
              <span>Day plan</span>
              <strong>{dayOpen ? "Today's sections" : `${completedCount}/${primaryHabits.length} core`}</strong>
            </div>
            <button
              className="section-collapse-button mobile"
              type="button"
              onClick={() => setDayOpen((open) => !open)}
              aria-expanded={dayOpen}
              aria-label={dayOpen ? "Hide day plan" : "Open day plan"}
            >
              <ChevronDown size={18} aria-hidden="true" />
              <span>{dayOpen ? "Hide" : "Open"}</span>
            </button>
          </div>

          <div className="day-panel-content">
            {holdMenuHint ? (
              <div className={`pressure-guard-card ${holdMenuHint.tone}`} role="status">
                <div>
                  <span>{holdMenuHint.label}</span>
                  <strong>{holdMenuHint.title}</strong>
                  <p>{holdMenuHint.detail}</p>
                </div>
                <div className="pressure-guard-actions">
                  <button type="button" onClick={hideHoldMenuHintForToday}>
                    Got it
                  </button>
                </div>
              </div>
            ) : null}

            {simpleToday ? (
              <div className="desktop-orientation-strip" role="status">
                <span>Start with one win.</span>
                <strong>Your streak begins here.</strong>
                <small>Saved locally. No login needed.</small>
              </div>
            ) : null}

            <div className="permanent-list-toolbar">
              <div className="permanent-list-summary">
                <span>Core wins</span>
                <div className="permanent-list-count-row">
                  <strong>{completedCount}/{primaryHabits.length} today</strong>
                  <small>{coreWinsStatusLabel}</small>
                </div>
              </div>
              <div className="permanent-list-actions">
                <button
                  className="icon-menu-button"
                  type="button"
                  onClick={() => setWinsMenuOpen((open) => !open)}
                  aria-expanded={winsMenuOpen}
                  aria-label="Open win list options"
                >
                  <MoreHorizontal size={18} aria-hidden="true" />
                </button>
                {winsMenuOpen ? (
                  <div className="wins-overflow-menu" role="menu" aria-label="Win list options">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setWinsMenuOpen(false);
                        setQuickManagerOpen(true);
                      }}
                    >
                      <Settings2 size={15} aria-hidden="true" />
                      Manage wins
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setWinsMenuOpen(false);
                        openWinsSettings();
                      }}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                      Order wins
                    </button>
                  </div>
                ) : null}
              </div>
              <div
                className="permanent-list-progress"
                role="progressbar"
                aria-label="Core wins progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPercent}
              >
                <span style={{ width: `${completionPercent}%` }} />
              </div>
            </div>

            <div className="checklist" aria-label={copy.todayWins}>
              {dayPartGroups.map((group) => {
                const groupCompleted = group.habits.filter((habit) => completedSet.has(habit.id)).length;
                const groupOpen = openDayParts[group.key];
                const groupIsCurrent = group.key === currentDayPart;
                return (
                  <section
                    className={`day-group${groupOpen ? " open" : " collapsed"}${groupIsCurrent ? " current" : ""}`}
                    key={group.key}
                    aria-label={`${dayPartLabels[group.key]} wins`}
                  >
                    <button
                      className="day-group-header"
                      type="button"
                      onClick={() => toggleDayPart(group.key)}
                      aria-expanded={groupOpen}
                    >
                      <div>
                        <span>
                          {dayPartLabels[group.key]}
                          {groupIsCurrent ? <em>Now</em> : null}
                        </span>
                        <small>{dayPartMicrocopy[group.key]}</small>
                      </div>
                      <span className="day-group-status">
                        <strong>
                          {groupCompleted}/{group.habits.length}
                        </strong>
                        <ChevronDown className="day-group-chevron" size={17} aria-hidden="true" />
                      </span>
                    </button>
                    {groupOpen ? (
                      <div className="day-group-list">
                        {group.habits.map((habit) => {
                          const done = completedSet.has(habit.id);
                          const habitMood = selectedRecord.habitMoods?.[habit.id];
                          const moodOption = moodOptions.find((item) => item.key === habitMood);
                          const moodMenuOpen = expandedHabitId === habit.id;
                          const requirementMenuOpen = requirementMenuHabitId === habit.id;
                          return (
                            <article
                              className={`habit-card${done ? " done" : ""}${moodMenuOpen ? " expanded" : ""}${
                                requirementMenuOpen ? " requirement-menu-open" : ""
                              }${
                                celebration?.habitId === habit.id ? " celebrating" : ""
                              }`}
                              key={habit.id}
                              style={{ "--habit": habit.color } as CSSProperties}
                            >
                              <div className="habit-card-main">
                                <button
                                  className="habit-win-button"
                                  type="button"
                                  onPointerDown={() => startRequirementLongPress(habit)}
                                  onPointerUp={finishRequirementLongPress}
                                  onPointerLeave={finishRequirementLongPress}
                                  onPointerCancel={finishRequirementLongPress}
                                  onContextMenu={(event) => {
                                    event.preventDefault();
                                    clearRequirementPressTimer();
                                    setExpandedHabitId(null);
                                    setRequirementMenuHabitId(habit.id);
                                  }}
                                  onClick={() => {
                                    clearRequirementPressTimer();
                                    if (consumeRequirementLongPress()) {
                                      return;
                                    }
                                    toggleHabitWin(habit);
                                  }}
                                  aria-label={
                                    done
                                      ? `Undo ${habit.name} for ${formatPrettyDate(selectedDate)}. Press and hold for options.`
                                      : `Mark ${habit.name} as won. Press and hold for options.`
                                  }
                                  title="Press and hold for options"
                                >
                                  <img src={assetUrl(habit.thumbnail)} alt="" className="habit-thumb" />
                                  <span className="habit-card-copy">
                                    <h3>{habit.name}</h3>
                                    <p>{habit.quip}</p>
                                  </span>
                                  <span className="tap-hint">{done ? "Won today" : "Mark done"}</span>
                                </button>
                                <div className="habit-card-actions">
                                  <button
                                    className={`mood-preview${moodOption ? " selected" : ""}`}
                                    style={{ "--mood": moodOption?.tone ?? habit.color } as CSSProperties}
                                    type="button"
                                    onPointerDown={primeCompletionFeedback}
                                    onTouchStart={primeCompletionFeedback}
                                    onClick={() => setExpandedHabitId(moodMenuOpen ? null : habit.id)}
                                    aria-expanded={moodMenuOpen}
                                    aria-label={`${done || moodOption ? "Change" : "Choose"} status for ${habit.name}`}
                                  >
                                    {moodOption ? (
                                      <img src={assetUrl(moodOption.src)} alt="" />
                                    ) : (
                                      <ClipboardCheck size={16} aria-hidden="true" />
                                    )}
                                    <span>{moodOption?.shortLabel ?? (done ? "Won" : "Mood")}</span>
                                  </button>
                                </div>
                              </div>
                              {requirementMenuOpen ? (
                                <div className="requirement-longpress-panel" aria-label={`Options for ${habit.name}`}>
                                  <span>Hold menu</span>
                                  <button type="button" onClick={() => makePermanentHabitOptional(habit.id)}>
                                    Make optional
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRequirementMenuHabitId(null);
                                      setQuickManagerOpen(true);
                                    }}
                                  >
                                    Edit wins
                                  </button>
                                  <button type="button" onClick={() => setRequirementMenuHabitId(null)}>
                                    Keep core
                                  </button>
                                </div>
                              ) : null}
                              {moodMenuOpen ? (
                                <div className="activity-mood-panel" aria-label={`Win status choices for ${habit.name}`}>
                                  {moodOptions.map((mood) => (
                                    <button
                                      className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                                      key={mood.key}
                                      style={{ "--mood": mood.tone } as CSSProperties}
                                      type="button"
                                      onPointerDown={primeCompletionFeedback}
                                      onTouchStart={primeCompletionFeedback}
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
                                      title={`${mood.label}: ${mood.description}`}
                                    >
                                      <img src={assetUrl(mood.src)} alt="" />
                                      <span>
                                        <small>{mood.label}</small>
                                        <em>{mood.description}</em>
                                      </span>
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
                    ) : null}
                  </section>
                );
              })}
              {optionalHabits.length > 0 ? (
                <section
                  className={`day-group optional-routines${optionalOpen ? " open" : " collapsed"}`}
                  aria-label="Optional routines"
                >
                  <button
                    className="day-group-header"
                    type="button"
                    onClick={() => setOptionalOpen((open) => !open)}
                    aria-expanded={optionalOpen}
                  >
                    <div>
                      <span>Optional routines</span>
                      <small>Extra credit. Not required for 100%.</small>
                    </div>
                    <span className="day-group-status">
                      <strong>
                        {optionalCompletedCount}/{optionalHabits.length}
                      </strong>
                      <ChevronDown className="day-group-chevron" size={17} aria-hidden="true" />
                    </span>
                  </button>
                  {optionalOpen ? (
                    <div className="day-group-list">
                      {optionalHabits.map((habit) => {
                        const done = completedSet.has(habit.id);
                        const habitMood = selectedRecord.habitMoods?.[habit.id];
                        const moodOption = moodOptions.find((item) => item.key === habitMood);
                        const moodMenuOpen = expandedHabitId === habit.id;
                        return (
                          <article
                            className={`habit-card optional${done ? " done" : ""}${moodMenuOpen ? " expanded" : ""}${
                              celebration?.habitId === habit.id ? " celebrating" : ""
                            }`}
                            key={habit.id}
                            style={{ "--habit": habit.color } as CSSProperties}
                          >
                            <div className="habit-card-main">
                              <button
                                className="habit-win-button"
                                type="button"
                                onPointerDown={primeCompletionFeedback}
                                onTouchStart={primeCompletionFeedback}
                                onClick={() => toggleHabitWin(habit)}
                                aria-label={done ? `Undo optional ${habit.name} for ${formatPrettyDate(selectedDate)}` : `Mark optional ${habit.name} as won`}
                              >
                                <img src={assetUrl(habit.thumbnail)} alt="" className="habit-thumb" />
                                <span className="habit-card-copy">
                                  <h3>{habit.name}</h3>
                                  <p>{habit.quip}</p>
                                </span>
                                <span className="tap-hint">{done ? "Logged" : "Mark done"}</span>
                              </button>
                              <div className="habit-card-actions">
                                <button
                                  className="requirement-toggle-button"
                                  type="button"
                                  title="Make core"
                                  onPointerDown={primeCompletionFeedback}
                                  onTouchStart={primeCompletionFeedback}
                                  onClick={() => makeOptionalHabitPermanent(habit.id)}
                                  aria-label={`Make ${habit.name} a core win`}
                                >
                                  <ArrowUp size={15} aria-hidden="true" />
                                </button>
                                <button
                                  className={`mood-preview${moodOption ? " selected" : ""}`}
                                  style={{ "--mood": moodOption?.tone ?? habit.color } as CSSProperties}
                                  type="button"
                                  onPointerDown={primeCompletionFeedback}
                                  onTouchStart={primeCompletionFeedback}
                                  onClick={() => setExpandedHabitId(moodMenuOpen ? null : habit.id)}
                                  aria-expanded={moodMenuOpen}
                                  aria-label={`${done || moodOption ? "Change" : "Choose"} status for optional ${habit.name}`}
                                >
                                  {moodOption ? (
                                    <img src={assetUrl(moodOption.src)} alt="" />
                                  ) : (
                                    <ClipboardCheck size={16} aria-hidden="true" />
                                  )}
                                  <span>{moodOption?.shortLabel ?? (done ? "Won" : "Mood")}</span>
                                </button>
                              </div>
                            </div>
                            {moodMenuOpen ? (
                              <div className="activity-mood-panel" aria-label={`Win status choices for optional ${habit.name}`}>
                                {moodOptions.map((mood) => (
                                  <button
                                    className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                                    key={mood.key}
                                    style={{ "--mood": mood.tone } as CSSProperties}
                                    type="button"
                                    onPointerDown={primeCompletionFeedback}
                                    onTouchStart={primeCompletionFeedback}
                                    onClick={() => {
                                      const shouldCelebrate = habitMood !== mood.key && isCompletionMood(mood.key);
                                      updateHabitMood(habit.id, mood.key);
                                      if (shouldCelebrate) {
                                        triggerCompletionCelebration(habit, mood);
                                      }
                                      setExpandedHabitId(null);
                                    }}
                                    aria-label={`${mood.label} status for optional ${habit.name}`}
                                    title={`${mood.label}: ${mood.description}`}
                                  >
                                    <img src={assetUrl(mood.src)} alt="" />
                                    <span>
                                      <small>{mood.label}</small>
                                      <em>{mood.description}</em>
                                    </span>
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
                  ) : null}
                </section>
              ) : null}
            </div>

            <section className={`note-box compact${noteOpen ? " open" : " collapsed"}`}>
              <button
                className="note-toggle"
                type="button"
                onClick={() => setNoteOpen((open) => !open)}
                aria-expanded={noteOpen}
              >
                <span>
                  Daily note
                  <small className={`note-save-state${noteSavedVisible ? " visible" : ""}`} aria-live="polite">
                    Saved ✓
                  </small>
                </span>
                <ChevronDown size={17} aria-hidden="true" />
              </button>
              {noteOpen ? (
                <textarea
                  ref={noteRef}
                  value={selectedRecord.note ?? ""}
                  onChange={(event) => updateSelectedNote(event.target.value)}
                  placeholder={dailyNotePlaceholder}
                />
              ) : null}
            </section>
          </div>
        </section>

        {analyticsUnlocked ? (
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
              <button
                className="section-collapse-button month"
                type="button"
                onClick={() => setMonthOpen((open) => !open)}
                aria-expanded={monthOpen}
                aria-label={monthOpen ? "Hide monthly grid" : "Show monthly grid"}
              >
                <ChevronDown size={18} aria-hidden="true" />
                <span>{monthOpen ? "Hide" : "Show"}</span>
              </button>
            </div>

            <div className="month-panel-content">
              <div className="analytics-sections">
                <div className="analytics-stage-card" role="status">
                  <span>Momentum summary</span>
                  <strong>{analyticsRecapText}</strong>
                  <p>
                    {monthlyReviewUnlocked
                      ? "Monthly review is ready."
                      : "Review unlocks after 2 active days or 3 wins."}
                  </p>
                </div>

                {fiveDayReflectionVisible ? (
                  <div className="analytics-stage-card five-day-pattern-card" role="status" aria-label="Your 5-day pattern">
                    <span>Your 5-day pattern</span>
                    <strong>
                      You showed up on {activitySummary.activeDayCount} active day
                      {activitySummary.activeDayCount === 1 ? "" : "s"}.
                    </strong>
                    <p>
                      Strongest win: {bestWinInsight?.value ?? "still learning"}. Most fragile win:{" "}
                      {fiveDayFragileWin}. Next best move: {fiveDayReflectionNextMove}.
                    </p>
                  </div>
                ) : null}

                {monthlyReviewUnlocked ? (
                  <section className={`analytics-collapse${analyticsSections.review ? " open" : " collapsed"}`}>
                    <button
                      className="analytics-collapse-header"
                      type="button"
                      onClick={() => toggleAnalyticsSection("review")}
                      aria-expanded={analyticsSections.review}
                    >
                      <span>
                        <small className="section-kicker">Monthly Review</small>
                        <strong>What this month is saying</strong>
                        <em>{analyticsSummary.action.title}</em>
                      </span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    {analyticsSections.review ? (
                      <div className="analytics-collapse-body">
                        <p className="analytics-narrative">{analyticsSummary.sentence}</p>
                        <div className="analytics-action-card" aria-label="Recommended next action">
                          <span>Next best move</span>
                          <strong>{analyticsSummary.action.title}</strong>
                          <p>{analyticsSummary.action.detail}</p>
                        </div>
                        <div className="analytics-insights" aria-label="Monthly insights">
                          {analyticsInsights.map((insight) => (
                            <article className="insight-card" key={insight.label}>
                              <span>{insight.label}</span>
                              <strong>{insight.value}</strong>
                              <p>{insight.detail}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="analytics-collapse analytics-locked-card" aria-label="Monthly review locked">
                    <div className="analytics-lock-copy">
                      <span>Next unlock</span>
                      <strong>Review needs a little more signal.</strong>
                      <p>Log 3 wins or come back for a second active day.</p>
                    </div>
                  </section>
                )}

                {patternAnalyticsUnlocked ? (
                  <section className={`analytics-collapse${analyticsSections.matrix ? " open" : " collapsed"}`}>
                    <button
                      className="analytics-collapse-header"
                      type="button"
                      onClick={() => toggleAnalyticsSection("matrix")}
                      aria-expanded={analyticsSections.matrix}
                    >
                      <span>
                        <small className="section-kicker">Monthly Matrix</small>
                        <strong>Win heat map</strong>
                        <em>{monthProgress.completed}/{monthProgress.total} core wins so far</em>
                      </span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    {analyticsSections.matrix ? (
                      <div className="analytics-collapse-body">
                        <div className="heatmap-summary">
                          <div>
                            <span className="section-kicker">Matrix</span>
                            <strong>Habit heat map</strong>
                          </div>
                          <p>{monthProgress.completed}/{monthProgress.total} core wins so far. Optional routines stay loggable outside the score.</p>
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

                            {primaryHabits.map((habit) => (
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
                    ) : null}
                  </section>
                ) : (
                  <section className="analytics-collapse analytics-locked-card" aria-label="Pattern view locked">
                    <div className="analytics-lock-copy">
                      <span>Pattern view</span>
                      <strong>Heat map unlocks after 5 active days.</strong>
                      <p>For now, keep Today simple and let the pattern build.</p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </section>

      {perfectDayCelebration ? (
        <PerfectDayOverlay
          key={perfectDayCelebration.id}
          tone={perfectDayCelebration.tone}
          total={perfectDayCelebration.total}
        />
      ) : null}

      {appToast ? <AppToastMessage key={appToast.id} message={appToast.message} tone={appToast.tone} /> : null}

      {quickManagerOpen ? (
        <div className="quick-manager-layer" role="dialog" aria-modal="true" aria-labelledby="quick-manager-title">
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setQuickManagerOpen(false)}
            aria-label="Close quick win manager"
          />
          <aside className="quick-manager-sheet">
            <div className="quick-manager-header">
              <div>
                <span className="section-kicker">Quick manage</span>
                <h2 id="quick-manager-title">Core wins</h2>
              </div>
              <button className="drawer-done-button" type="button" onClick={() => setQuickManagerOpen(false)}>
                Done
              </button>
            </div>

            <div className="quick-manager-summary">
              <strong>{primaryHabits.length} core wins</strong>
              <span>
                {earlyWinSetupWindow
                  ? "Edit names here. Long-press a Today card for core or optional options."
                  : primaryHabits.length > DEFAULT_PRIMARY_WIN_COUNT
                  ? "Keep this list honest for a normal tired day."
                  : "This is a light daily target."}
              </span>
            </div>

            <div className="quick-win-list">
              {quickCoreHabits.map((habit) => {
                const isPermanent = permanentRequirementIds.has(habit.id);
                const index = habitOrderIndexById.get(habit.id) ?? 0;
                return (
                  <article className={`quick-win-row${habit.pausedAt ? " paused" : ""}`} key={habit.id}>
                    <img src={assetUrl(habit.thumbnail)} alt="" />
                    <div>
                      <label className="quick-win-name-field">
                        <span>Win name</span>
                        <input
                          value={habit.name}
                          onChange={(event) => updateHabit(habit.id, { name: event.target.value })}
                          aria-label={`Edit win name for ${habit.name}`}
                        />
                      </label>
                      <span>{isPermanent ? "Core win" : "Optional routine"}</span>
                    </div>
                    <div className="quick-win-actions">
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
                      <button
                        className="tiny-text-button"
                        type="button"
                        onClick={() =>
                          isPermanent ? makePermanentHabitOptional(habit.id) : makeOptionalHabitPermanent(habit.id)
                        }
                      >
                        {isPermanent ? "Make optional" : "Make core"}
                      </button>
                      <button className="tiny-text-button" type="button" onClick={() => togglePauseHabit(habit.id)}>
                        {habit.pausedAt ? "Resume" : "Pause"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {quickOptionalHabits.length > 0 ? (
              <section className={`quick-optional-section${quickOptionalOpen ? " open" : ""}`}>
                <button
                  className="quick-optional-toggle"
                  type="button"
                  onClick={() => setQuickOptionalOpen((open) => !open)}
                  aria-expanded={quickOptionalOpen}
                >
                  <span>
                    <strong>Optional wins</strong>
                    <small>{quickOptionalHabits.length} extra wins. Expand when you want to edit them.</small>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>

                {quickOptionalOpen ? (
                  <div className="quick-win-list optional">
                    {quickOptionalHabits.map((habit) => {
                      const isPermanent = permanentRequirementIds.has(habit.id);
                      const index = habitOrderIndexById.get(habit.id) ?? 0;
                      return (
                        <article className={`quick-win-row${habit.pausedAt ? " paused" : ""}`} key={habit.id}>
                          <img src={assetUrl(habit.thumbnail)} alt="" />
                          <div>
                            <label className="quick-win-name-field">
                              <span>Win name</span>
                              <input
                                value={habit.name}
                                onChange={(event) => updateHabit(habit.id, { name: event.target.value })}
                                aria-label={`Edit win name for ${habit.name}`}
                              />
                            </label>
                            <span>{isPermanent ? "Core win" : "Optional routine"}</span>
                          </div>
                          <div className="quick-win-actions">
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
                            <button
                              className="tiny-text-button"
                              type="button"
                              onClick={() =>
                                isPermanent ? makePermanentHabitOptional(habit.id) : makeOptionalHabitPermanent(habit.id)
                              }
                            >
                              {isPermanent ? "Make optional" : "Make core"}
                            </button>
                            <button className="tiny-text-button" type="button" onClick={() => togglePauseHabit(habit.id)}>
                              {habit.pausedAt ? "Resume" : "Pause"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            ) : null}

            <button
              className="backup-button quick-manager-full-settings"
              type="button"
              onClick={() => {
                setQuickManagerOpen(false);
                openWinsSettings();
              }}
            >
              <Settings2 size={17} aria-hidden="true" />
              Full win settings
            </button>
          </aside>
        </div>
      ) : null}

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
              <button className="drawer-done-button" type="button" onClick={() => setSettingsOpen(false)}>
                Done
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
                  setPersonalizerStep("about");
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
                <a className="backup-button" href={`${APP_BASE_PATH}/launch/`} target="_blank" rel="noreferrer">
                  <Share2 size={17} aria-hidden="true" />
                  Launch poster
                </a>
                <a className="backup-button" href={`${APP_BASE_PATH}/reel/`} target="_blank" rel="noreferrer">
                  <Share2 size={17} aria-hidden="true" />
                  30s reel
                </a>
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
              id="reminders"
              title="Return path"
              description="Install The Win List and set a light local reminder."
              icon={<CalendarDays size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.reminders}
              onToggle={toggleSettingsSection}
            >
              <div className="return-path-settings">
                <div className="install-card">
                  <div>
                    <strong>{isInstalledApp ? "Installed app mode" : "Install for faster return"}</strong>
                    <small>
                      {isInstalledApp
                        ? "The Win List is already running like an app on this device."
                        : isIosDevice
                          ? "On iPhone, open this site in Safari, tap Share, then Add to Home Screen."
                        : installReady
                          ? "Your browser is ready to install The Win List."
                          : !installFallbackReady
                            ? "The Android install prompt is getting ready."
                          : "Use the browser menu if the install prompt is not available yet."}
                    </small>
                  </div>
                  {isInstalledApp ? (
                    <span className="installed-status-chip">
                      <ShieldCheck size={17} aria-hidden="true" />
                      Installed
                    </span>
                  ) : (
                    <button
                      className="backup-button"
                      type="button"
                      onClick={handleInstallApp}
                      disabled={!isIosDevice && !installReady && !installFallbackReady}
                    >
                      {isIosDevice ? <Share2 size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
                      {isIosDevice ? "iPhone steps" : installReady || installFallbackReady ? "Install app" : "Getting ready"}
                    </button>
                  )}
                </div>
                <label className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={reminderSettings.enabled}
                    onChange={(event) => {
                      if (event.target.checked) {
                        void requestReminderPermission();
                      } else {
                        saveReminderSettings((current) => ({ ...current, enabled: false }));
                      }
                    }}
                  />
                  <span>
                    <strong>Daily return reminder</strong>
                    <small>
                      {notificationPermission === "granted"
                        ? "Browser notification enabled while the app is allowed to notify."
                        : "Falls back to an in-app reminder while The Win List is open."}
                    </small>
                  </span>
                </label>
                <label className="time-field">
                  <span>Reminder time</span>
                  <input
                    type="time"
                    value={reminderSettings.time}
                    onChange={(event) =>
                      saveReminderSettings((current) => ({ ...current, time: event.target.value || defaultReminderSettings.time }))
                    }
                  />
                </label>
                <p className="feedback-note">This release does not use server push. It keeps reminders local and lightweight.</p>
              </div>
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="feedback"
              title="Feedback"
              description="Control the tiny sound and haptic feel when a win lands."
              icon={<Volume2 size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.feedback}
              onToggle={toggleSettingsSection}
            >
              <div className="feedback-settings">
                <label className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={feedbackSettings.sound}
                    onChange={(event) => updateFeedbackSetting("sound", event.target.checked)}
                  />
                  <span>
                    <strong>Completion sound</strong>
                    <small>A short, soft tone when you mark a win.</small>
                  </span>
                </label>
                <label className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={feedbackSettings.haptics}
                    onChange={(event) => updateFeedbackSetting("haptics", event.target.checked)}
                  />
                  <span>
                    <strong>Haptic tap</strong>
                    <small>Uses device vibration where the browser allows it.</small>
                  </span>
                </label>
                <button
                  className="backup-button feedback-test-button"
                  type="button"
                  onPointerDown={primeCompletionFeedback}
                  onTouchStart={primeCompletionFeedback}
                  onClick={testFeedback}
                >
                  <Volume2 size={17} aria-hidden="true" />
                  Test feedback
                </button>
                <p className="feedback-note">iPhone Safari may block vibration, but the visual win moment still works.</p>
              </div>
            </SettingsAccordionSection>

            <SettingsAccordionSection
              id="wins"
              title={copy.winsAndIcons}
              description="Add, pause, reorder, and rename the daily core wins."
              icon={<Settings2 size={18} aria-hidden="true" />}
              expanded={expandedSettingsSections.wins}
              onToggle={toggleSettingsSection}
            >
              <div className="add-habit-box">
                <label>
                  <span>{copy.newWin}</span>
                  <input
                    value={newHabitName}
                    onChange={(event) => {
                      setNewHabitName(event.target.value);
                      if (!event.target.value.trim()) {
                        setNewHabitQuip("Custom win ready to track.");
                      }
                    }}
                    placeholder="Add an important win"
                  />
                </label>
                <label>
                  <span>Card note</span>
                  <input
                    value={newHabitQuip}
                    onChange={(event) => setNewHabitQuip(event.target.value)}
                    placeholder="Short note shown under the win"
                  />
                </label>
                <div className="sample-habit-library" aria-label="Sample habit ideas">
                  <div className="sample-library-heading">
                    <span>Sample habits</span>
                    <small>Tap one to fill the fields.</small>
                  </div>
                  {sampleCategoryGroups.map((group) => {
                    const meta = habitCategoryMeta[group.key];
                    const expanded = expandedSampleCategories[group.key];

                    return (
                      <section className={`sample-category${expanded ? " expanded" : ""}`} key={group.key}>
                        <button
                          className="sample-category-toggle"
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => toggleSampleCategory(group.key)}
                        >
                          <span>
                            <strong>{meta.label}</strong>
                            <small>{group.samples.length} ideas</small>
                          </span>
                          <ChevronDown size={16} aria-hidden="true" />
                        </button>
                        {expanded ? (
                          <div className="sample-habit-buttons">
                            {group.samples.map((sample) => (
                              <button key={sample.id} type="button" onClick={() => applyHabitSample(sample)}>
                                <img src={assetUrl(sample.thumbnail)} alt="" />
                                <span>{sample.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
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
                <DayPartPicker
                  label="Choose time of day for new win"
                  selectedDayPart={newHabitDayPart}
                  onSelect={setNewHabitDayPart}
                />
                <button className="icon-text-button hot full" type="button" onClick={addHabit}>
                  <Plus size={18} aria-hidden="true" />
                  {copy.addWin}
                </button>
              </div>

              <div className="habit-editor-list" aria-label="Wins grouped by category">
                {editorCategoryGroups.map((group) => {
                  const meta = habitCategoryMeta[group.key];
                  const expanded = expandedWinCategories[group.key];
                  const coreCount = group.habits.filter((habit) => permanentRequirementIds.has(habit.id)).length;

                  return (
                    <section className={`editor-category${expanded ? " expanded" : ""}`} key={group.key}>
                      <button
                        className="editor-category-toggle"
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggleWinCategory(group.key)}
                      >
                        <span className="editor-category-title">
                          <strong>{meta.label}</strong>
                          <small>{meta.description}</small>
                        </span>
                        <span className="category-count-chip">
                          {group.habits.length} wins · {coreCount} core
                        </span>
                        <ChevronDown size={17} aria-hidden="true" />
                      </button>

                      {expanded ? (
                        <div className="editor-category-body">
                          {group.habits.map((habit) => {
                            const habitIndex = habitOrderIndexById.get(habit.id) ?? 0;

                            return (
                              <article className={`editor-card${habit.pausedAt ? " paused" : ""}`} key={habit.id}>
                                <img className="editor-thumb" src={assetUrl(habit.thumbnail)} alt="" />
                                <div className="editor-fields">
                                  <span className={`priority-badge${permanentRequirementIds.has(habit.id) ? " primary" : ""}`}>
                                    {permanentRequirementIds.has(habit.id) ? "Core win" : "Optional routine"}
                                  </span>
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
                                  <DayPartPicker
                                    label={`Choose time of day for ${habit.name}`}
                                    selectedDayPart={getHabitDayPart(habit)}
                                    onSelect={(dayPart) => updateHabit(habit.id, { dayPart })}
                                  />
                                </div>
                                <div className="editor-actions">
                                  <button
                                    className="round-button small"
                                    type="button"
                                    onClick={() => moveHabit(habit.id, -1)}
                                    disabled={habitIndex === 0}
                                    aria-label={`Move ${habit.name} up`}
                                  >
                                    <ArrowUp size={15} aria-hidden="true" />
                                  </button>
                                  <button
                                    className="round-button small"
                                    type="button"
                                    onClick={() => moveHabit(habit.id, 1)}
                                    disabled={habitIndex === sortedHabits.length - 1}
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
                            );
                          })}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
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
  step: PersonalizerStep;
  onboarding: OnboardingInput;
  snapshot: PersonalizationSnapshot | null;
  onToggle: () => void;
  onStepChange: (step: PersonalizerStep) => void;
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
                Backup now
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
  step,
  onboarding,
  snapshot,
  onToggle,
  onStepChange,
  onUpdate,
  onToggleListItem,
  onApply
}: PersonalizerPanelProps) {
  const summary = createPersonalizationSummary(snapshot?.input ?? onboarding);
  const planPreview = createPersonalizedHabits(onboarding, "preview").slice(0, DEFAULT_PRIMARY_WIN_COUNT);
  const modeTheme = lifeModeThemes[onboarding.routineType];
  const avatarStyle = resolveAvatarStyle(onboarding);
  const outfit = characterOutfits[onboarding.routineType];
  const characterName = cleanDisplayName(onboarding.displayName);
  const previewTitle = characterName ? `${characterName}'s Win List companion` : "Your Win List companion";
  const currentStepIndex = Math.max(0, personalizerFlowSteps.findIndex((item) => item.key === step));
  const isPreviewStep = step === "preview";
  const previousStep = step === "intro" ? undefined : personalizerFlowSteps[currentStepIndex - 1]?.key;
  const nextStep = step === "intro" ? "about" : personalizerFlowSteps[currentStepIndex + 1]?.key;
  const stepCopy =
    step === "about"
      ? {
          title: "Tell us the real day",
          detail: "Thirty seconds of context is enough to shape useful wins, not a generic checklist."
        }
      : step === "goals"
        ? {
            title: "Choose the outcomes",
            detail: "Pick what should get easier and what usually gets in the way."
          }
        : {
            title: "See your first draft",
            detail: "Review the companion, theme, and must-do wins before you start."
          };
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
            <h2 id="personalizer-title">Build your daily Win List</h2>
            <p className="personalizer-lede">A quick guided setup. Your wins, theme, and companion adapt around the routine you actually live.</p>
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
      ) : step === "intro" ? (
        <div className="personalizer-intro">
          <div className="personalizer-intro-art" aria-hidden="true">
            <LogoMark className="personalizer-intro-logo" decorative />
            <AnswerCharacter input={onboarding} />
          </div>
          <div>
            <span className="section-kicker">Start with what matters</span>
            <h3>A daily list that fits your real day</h3>
            <p>No account needed. Answer a few things, then start with must-do wins you can actually finish.</p>
          </div>
          <button className="icon-text-button hot full" type="button" onClick={() => onStepChange("about")}>
            <Wand2 size={18} aria-hidden="true" />
            Start
          </button>
        </div>
      ) : (
        <>
          <div className="personalizer-stepper" aria-label="Personalization steps">
            {personalizerFlowSteps.map((item, index) => (
              <button
                className={step === item.key ? "selected" : ""}
                key={item.key}
                type="button"
                onClick={() => onStepChange(item.key)}
                aria-current={step === item.key ? "step" : undefined}
              >
                <span>{index + 1}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="personalizer-step-copy">
            <span>Step {Math.max(currentStepIndex + 1, 1)} of {personalizerFlowSteps.length}</span>
            <strong>{stepCopy.title}</strong>
            <p>{stepCopy.detail}</p>
          </div>

          <div className={`personalizer-grid step-${step}`}>
            {step === "about" ? (
              <div className="personalizer-form personalizer-step-card">
                <div className="form-row two">
                  <label>
                    <span>What should we call you?</span>
                    <input
                      value={onboarding.displayName}
                      onChange={(event) => onUpdate("displayName", event.target.value)}
                      placeholder="Aarav, Meera, Riya..."
                    />
                  </label>
                  <label>
                    <span>Where is your day based?</span>
                    <input
                      value={onboarding.city}
                      onChange={(event) => onUpdate("city", event.target.value)}
                      placeholder="Delhi, Pune, Jaipur..."
                    />
                  </label>
                </div>

                <div className="form-row two">
                  <label>
                    <span>Your current mode</span>
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
                    <span>Time you can honestly give</span>
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
                    <span>Age band</span>
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
                    <span>Avatar style</span>
                    <select
                      value={onboarding.avatarStyle}
                      onChange={(event) =>
                        onUpdate("avatarStyle", event.target.value as OnboardingInput["avatarStyle"])
                      }
                    >
                      <option value="neutral">Neutral</option>
                      <option value="feminine">Female</option>
                      <option value="masculine">Male</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            {step === "goals" ? (
              <div className="personalizer-form personalizer-step-card">
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
            ) : null}

            {isPreviewStep ? (
              <aside className="personalizer-preview full" aria-label="Live personalized preview">
                <div className="character-persona-strip" aria-live="polite">
                  <AnswerCharacter input={onboarding} />
                  <div>
                  <span>Meet your companion</span>
                  <strong>{previewTitle}</strong>
                    <p>{outfit.detail} They’ll keep the open wins visible without nagging.</p>
                  </div>
                </div>

                <div className="life-mode-strip">
                  <strong>{modeTheme.label}</strong>
                  <span>{summary}</span>
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
              </aside>
            ) : null}
          </div>

          <div className="personalizer-footer">
            <button
              className="icon-text-button ghost"
              type="button"
              onClick={() => previousStep && onStepChange(previousStep)}
              disabled={!previousStep}
            >
              Back
            </button>
            {nextStep ? (
              <button className="icon-text-button hot" type="button" onClick={() => onStepChange(nextStep)}>
                Next
              </button>
            ) : (
              <button className="icon-text-button hot" type="button" onClick={onApply}>
                <Wand2 size={18} aria-hidden="true" />
                {copy.buildCta}
              </button>
            )}
          </div>
        </>
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

function DayPartPicker({
  label,
  selectedDayPart,
  onSelect
}: {
  label: string;
  selectedDayPart: DayPartKey;
  onSelect: (dayPart: DayPartKey) => void;
}) {
  return (
    <div className="day-part-picker" aria-label={label}>
      {(Object.keys(dayPartLabels) as DayPartKey[]).map((dayPart) => (
        <button
          aria-label={`${label}: ${dayPartLabels[dayPart]}`}
          className={selectedDayPart === dayPart ? "selected" : ""}
          key={dayPart}
          type="button"
          onClick={() => onSelect(dayPart)}
        >
          <strong>{dayPartLabels[dayPart]}</strong>
          <span>{dayPartMicrocopy[dayPart]}</span>
        </button>
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

  const hasTrackedDays = Object.values(current.days).some(hasActivityInDay);

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

function syncShellThemeChrome(scheme: ColorScheme) {
  const color = scheme === "dark" ? DARK_SHELL_THEME_COLOR : LIGHT_SHELL_THEME_COLOR;
  document.documentElement.dataset.colorScheme = scheme;
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  setMetaContent("theme-color", color);
  setMetaContent("msapplication-TileColor", color);
  setMetaContent("apple-mobile-web-app-status-bar-style", scheme === "dark" ? "black-translucent" : "default");
}

function getInitialColorScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedColorScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
  if (storedColorScheme === "light" || storedColorScheme === "dark") {
    return storedColorScheme;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setMetaContent(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.append(meta);
  }

  meta.setAttribute("content", content);
}

function removeHabitMood(moods: DayRecord["habitMoods"], habitId: string) {
  const next = { ...(moods ?? {}) };
  delete next[habitId];
  return next;
}

function isHabitComplete(record: DayRecord, habitId: string) {
  const status = record.habitMoods?.[habitId];
  if (status) {
    return isCompletionMood(status);
  }

  return record.completedHabitIds.includes(habitId);
}

function isCompletionMood(status: MoodKey) {
  return status !== "skipped" && status !== "rest";
}

function hasDefaultWinSetup(tracker: TrackerState) {
  const defaults = createDefaultState("default").habits.map(winSetupSignature);
  const current = [...tracker.habits].sort((a, b) => a.order - b.order).map(winSetupSignature);
  return defaults.length === current.length && defaults.every((signature, index) => signature === current[index]);
}

function winSetupSignature(habit: Habit) {
  return [
    habit.id,
    habit.name,
    habit.order,
    habit.color,
    habit.thumbnail,
    habit.quip,
    habit.dayPart ?? "",
    habit.requirement ?? "",
    habit.pausedAt ? "paused" : "active"
  ].join("|");
}

function getStreakNudge(streak: number, completedCount: number, totalCount: number) {
  if (totalCount > 0 && completedCount === totalCount) {
    return "Perfect day. Every must-do win is banked.";
  }

  if (streak === 0 && completedCount === 0) {
    return "Perfect streak starts when the core wins are logged. First, tap one card and get the day moving.";
  }

  if (streak === 0) {
    return `${completedCount} core win${completedCount === 1 ? "" : "s"} logged today. Perfect streak is still open if you finish the rest.`;
  }

  if (streak === 1) {
    return "Day one of the perfect streak is alive. Protect it with the remaining wins.";
  }

  const milestoneNudges: Record<number, string> = {
    2: "Two days. Keep it boring and repeatable.",
    3: "Third day. The habit is starting to stick.",
    5: "Five days. You are building real evidence.",
    7: "One week. That is real.",
    14: "Two weeks. The chain has weight now.",
    21: "Three weeks. This is becoming part of your day.",
    30: "Thirty days. That is a serious baseline."
  };

  if (milestoneNudges[streak]) {
    return milestoneNudges[streak];
  }

  if (streak > 30 && streak % 10 === 0) {
    return `${streak} days. Strong chain, simple next move: protect today.`;
  }

  return `${streak} perfect days in motion. Keep the chain warm.`;
}

function getHoldMenuHint({
  permanentCount,
  currentDayPart
}: {
  permanentCount: number;
  currentDayPart: DayPartKey;
}) {
  if (currentDayPart !== "evening" || permanentCount < 8) {
    return null;
  }

  if (permanentCount >= 9) {
    return {
      tone: "high",
      label: "Hold menu tip",
      title: "Core wins can become optional.",
      detail: "Press and hold any core win, then choose Make optional. Your logs stay intact."
    };
  }

  if (permanentCount >= 8) {
    return {
      tone: "medium",
      label: "Hold menu tip",
      title: "You can lighten core wins.",
      detail: "Press and hold a core win to open the hold menu, then choose Make optional."
    };
  }

  return null;
}

function getCompanionNudge({
  groups,
  completedSet,
  completedCount,
  totalCount,
  currentDayPart
}: {
  groups: Array<{ key: DayPartKey; habits: Habit[] }>;
  completedSet: Set<string>;
  completedCount: number;
  totalCount: number;
  currentDayPart: DayPartKey;
}) {
  if (totalCount === 0) {
    return "Add one must-do win and I’ll keep the day simple.";
  }

  if (completedCount === totalCount) {
    return "Everything is won today. Share-card energy, clean desk energy, sleep better energy.";
  }

  const currentGroup = groups.find((group) => group.key === currentDayPart);
  const openInCurrentGroup =
    currentGroup?.habits.filter((habit) => !completedSet.has(habit.id)).map((habit) => habit.name) ?? [];

  if (openInCurrentGroup.length > 0) {
    return `${completedCount > 0 ? "Nice, progress is moving. " : ""}${dayPartLabels[currentDayPart]} has ${
      openInCurrentGroup.length
    } open win${
      openInCurrentGroup.length === 1 ? "" : "s"
    }. Start with ${openInCurrentGroup[0]}.`;
  }

  const nextOpenGroup = groups.find((group) => group.habits.some((habit) => !completedSet.has(habit.id)));
  const nextWin = nextOpenGroup?.habits.find((habit) => !completedSet.has(habit.id));

  if (nextOpenGroup && nextWin) {
    return `${dayPartLabels[currentDayPart]} is clean. I’d keep momentum with ${nextWin.name} in ${dayPartLabels[
      nextOpenGroup.key
    ].toLowerCase()}.`;
  }

  return "One small tap is enough. Keep the list lighter than the day.";
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

function primeCompletionFeedback() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const audio = getCompletionAudioContext();
    if (audio?.state === "suspended") {
      void audio.resume();
    }
  } catch {
    // Some browsers only allow audio work after a completed tap gesture.
  }
}

function triggerCompletionFeedback(
  tone: string,
  mode: CompletionFeedbackMode = "sequence",
  settings: FeedbackSettings = defaultFeedbackSettings
) {
  if (settings.haptics) {
    triggerCompletionHaptic(mode);
  }

  if (settings.sound) {
    playCompletionSound(tone, mode);
  }
}

function triggerCompletionHaptic(mode: CompletionFeedbackMode = "sequence") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return false;
  }

  try {
    const pattern = mode === "stack" ? [32, 44, 32, 58, 42] : mode === "tap" ? [18] : [28, 34, 26];
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

function playCompletionSound(tone: string, mode: CompletionFeedbackMode = "sequence") {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const audio = getCompletionAudioContext();
    if (!audio) {
      return;
    }

    const play = () => {
      const startedAt = audio.currentTime + 0.008;
      const baseFrequency = colorToFrequency(tone);
      const master = audio.createGain();
      const peak = mode === "stack" ? 0.12 : mode === "tap" ? 0.045 : 0.105;
      const release = mode === "stack" ? 0.5 : mode === "tap" ? 0.16 : 0.36;
      master.gain.setValueAtTime(0.0001, startedAt);
      master.gain.exponentialRampToValueAtTime(peak, startedAt + 0.018);
      master.gain.exponentialRampToValueAtTime(0.0001, startedAt + release);
      master.connect(audio.destination);

      const ratios = mode === "tap" ? [1] : [1, 1.25, 1.5];
      ratios.forEach((ratio, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const noteStart = mode === "stack" ? startedAt : startedAt + index * 0.055;
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(baseFrequency * ratio, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(
          mode === "stack" ? 0.16 : mode === "tap" ? 0.12 : index === 0 ? 0.28 : 0.17,
          noteStart + 0.016
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + (mode === "stack" ? 0.38 : mode === "tap" ? 0.12 : 0.24));
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + (mode === "stack" ? 0.4 : mode === "tap" ? 0.14 : 0.26));
      });
    };

    if (audio.state === "suspended") {
      void audio.resume().then(play).catch(() => undefined);
    } else {
      play();
    }
  } catch {
    // Audio is a bonus flourish; ignore browser autoplay or hardware limits.
  }
}

function getCompletionAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    if (!completionAudioContext || completionAudioContext.state === "closed") {
      completionAudioContext = new AudioContextConstructor();
    }

    return completionAudioContext;
  } catch {
    return null;
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

function normalizeReminderSettings(value: Partial<ReminderSettings> | null | undefined): ReminderSettings {
  const time = typeof value?.time === "string" && /^\d{2}:\d{2}$/.test(value.time)
    ? value.time
    : defaultReminderSettings.time;

  return {
    enabled: Boolean(value?.enabled),
    time,
    lastFiredDate: typeof value?.lastFiredDate === "string" ? value.lastFiredDate : undefined
  };
}

function isRunningAsInstalledApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(APP_INSTALLED_STORAGE_KEY) === "true" ||
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const platform = window.navigator.platform;
  const userAgent = window.navigator.userAgent;
  const touchMac = platform === "MacIntel" && window.navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/.test(userAgent) || touchMac;
}

function formatSaveStatus(value: string | null | undefined) {
  if (!value) {
    return "Saved locally";
  }

  const savedAt = new Date(value);
  if (Number.isNaN(savedAt.getTime())) {
    return "Saved locally";
  }

  const diffMs = Date.now() - savedAt.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return "Saved just now";
  }

  if (diffMinutes < 60) {
    return `Saved ${diffMinutes} min ago`;
  }

  return `Saved ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function formatLocalSaveStatus(value: string | null | undefined) {
  return formatSaveStatus(value).replace(/^Saved/, "Saved locally");
}

function getCloudBackupLabel(
  status: CloudBackupStatus,
  overview: CloudOverview | null,
  session: SupabaseSession | null,
  error: string | null
) {
  if (!session) {
    return "Cloud backup optional";
  }

  if (status === "pending") {
    return "Backup pending";
  }

  if (status === "syncing") {
    return "Backing up...";
  }

  if (status === "error") {
    return error ? "Backup failed - retry" : "Backup needs retry";
  }

  if (overview?.lastSyncedAt) {
    return formatSaveStatus(overview.lastSyncedAt).replace(/^Saved/, "Backed up");
  }

  return "Cloud backup not uploaded yet";
}

function isSettingsSectionKey(value: string | null): value is SettingsSectionKey {
  return (
    value === "personalize" ||
    value === "backup" ||
    value === "theme" ||
    value === "feedback" ||
    value === "reminders" ||
    value === "wins" ||
    value === "sync"
  );
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

function createCategoryOpenState(openCategories: HabitCategoryKey[] = []): Record<HabitCategoryKey, boolean> {
  const openSet = new Set(openCategories);
  return Object.fromEntries(habitCategoryOrder.map((category) => [category, openSet.has(category)])) as Record<
    HabitCategoryKey,
    boolean
  >;
}

function groupHabitsByCategory(habits: Habit[]) {
  const grouped = {} as Record<HabitCategoryKey, Habit[]>;
  habitCategoryOrder.forEach((category) => {
    grouped[category] = [];
  });

  habits.forEach((habit) => {
    grouped[getHabitCategory(habit)].push(habit);
  });

  return habitCategoryOrder
    .map((key) => ({ key, habits: grouped[key] }))
    .filter((group) => group.habits.length > 0);
}

function groupHabitSamplesByCategory(samples: HabitSample[]) {
  const grouped = {} as Record<HabitCategoryKey, HabitSample[]>;
  habitCategoryOrder.forEach((category) => {
    grouped[category] = [];
  });

  samples.forEach((sample) => {
    grouped[sample.category].push(sample);
  });

  return habitCategoryOrder
    .map((key) => ({ key, samples: grouped[key] }))
    .filter((group) => group.samples.length > 0);
}

function groupHabitsByDayPart(habits: Habit[]) {
  const grouped: Record<DayPartKey, Habit[]> = {
    morning: [],
    daytime: [],
    evening: []
  };

  habits.forEach((habit) => {
    grouped[getHabitDayPart(habit)].push(habit);
  });

  return (Object.keys(grouped) as DayPartKey[])
    .map((key) => ({ key, habits: grouped[key] }))
    .filter((group) => group.habits.length > 0);
}

function createInitialDayPartOpenState(currentDayPart: DayPartKey): Record<DayPartKey, boolean> {
  return {
    morning: currentDayPart === "morning",
    daytime: currentDayPart === "daytime",
    evening: currentDayPart === "evening"
  };
}

function getDayPartForHour(hour: number): DayPartKey {
  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "daytime";
  }

  return "evening";
}

function getHabitDayPart(habit: Habit): DayPartKey {
  if (habit.dayPart) {
    return habit.dayPart;
  }

  const text = `${habit.id} ${habit.name} ${habit.quip}`.toLowerCase();

  if (
    /wake|morning|sunrise|breakfast|hydrate|water|yoga|workout|stretch|skincare|prayer|meditat/.test(text)
  ) {
    return "morning";
  }

  if (
    /sleep|night|evening|reel|shorts|journal|expense|spend|budget|family|dinner|wind|read/.test(text)
  ) {
    return "evening";
  }

  return "daytime";
}

function getAnalyticsSummary(
  days: Date[],
  activeHabits: Habit[],
  tracker: TrackerState,
  todayKey: string,
  streak: number
): AnalyticsSummary {
  const eligibleDays = days.filter((day) => localDateKey(day) <= todayKey);
  const dayCount = eligibleDays.length;

  if (activeHabits.length === 0 || dayCount === 0) {
    return {
      sentence: "Add a few wins and this review will turn into plain-language guidance for tomorrow.",
      action: {
        title: "Create the first must-do win",
        detail: "Start with one repeatable action you can finish today, then the review gets smarter."
      },
      insights: [
        { label: "Best win", value: "Add wins", detail: "Start with one must-do." },
        { label: "Most missed", value: "No data yet", detail: "Log a few days first." },
        { label: "Strongest day", value: "Today", detail: "A clean slate." },
        { label: "Current streak", value: `${streak} days`, detail: "Perfect-day streak." }
      ]
    };
  }

  const habitScores = activeHabits.map((habit) => {
    const completed = eligibleDays.reduce((sum, day) => {
      const record = tracker.days[localDateKey(day)];
      return sum + (record && isHabitComplete(record, habit.id) ? 1 : 0);
    }, 0);
    return {
      habit,
      completed,
      missed: dayCount - completed
    };
  });

  const best = [...habitScores].sort((a, b) => b.completed - a.completed || a.habit.order - b.habit.order)[0];
  const mostMissed = [...habitScores].sort((a, b) => b.missed - a.missed || a.habit.order - b.habit.order)[0];
  const strongestDay = eligibleDays
    .map((day) => {
      const key = localDateKey(day);
      const record = tracker.days[key];
      const completed = record
        ? activeHabits.filter((habit) => isHabitComplete(record, habit.id)).length
        : 0;
      return { day, key, completed };
    })
    .sort((a, b) => b.completed - a.completed || b.key.localeCompare(a.key))[0];

  const bestValue = best.completed > 0 ? best.habit.name : "No wins yet";
  const missedValue = mostMissed.missed > 0 ? mostMissed.habit.name : "Nothing missed";
  const nextAction =
    mostMissed.missed > 0
      ? {
          title: `Tomorrow: protect ${mostMissed.habit.name}`,
          detail: `Pattern read: this win needs a named slot, not willpower. Try it ${getHabitActionSlot(
            mostMissed.habit
          )} tomorrow; it has ${mostMissed.missed} open day${
            mostMissed.missed === 1 ? "" : "s"
          } this month.`
        }
      : best.completed > 0
        ? {
            title: `Anchor the day with ${best.habit.name}`,
            detail: `This is your easiest momentum builder. Repeat it ${getHabitActionSlot(
              best.habit
            )}, then let the rest of the list follow.`
          }
        : {
            title: "Tap one win today",
            detail: "The review starts learning once you log the first real win."
          };
  const sentence =
    best.completed > 0
      ? mostMissed.missed > 0
        ? `${best.habit.name} is carrying momentum. ${mostMissed.habit.name} is not failing; it just needs a better slot.`
        : `You’re clean across the board so far. Keep tomorrow boring and repeatable.`
      : `No wins logged yet this month. One tap today gives the month a starting point.`;

  return {
    sentence,
    action: nextAction,
    insights: [
      {
        label: "Best win",
        value: bestValue,
        detail: best.completed > 0 ? `${best.completed}/${dayCount} days won` : "Tap a card to begin."
      },
      {
        label: "Most missed",
        value: missedValue,
        detail: mostMissed.missed > 0 ? `${mostMissed.missed} open day${mostMissed.missed === 1 ? "" : "s"}` : "Clean month so far."
      },
      {
        label: "Strongest day",
        value: strongestDay.completed > 0 ? formatInsightDate(strongestDay.day) : "Not yet",
        detail: strongestDay.completed > 0 ? `${strongestDay.completed}/${activeHabits.length} wins logged` : "Today can be first."
      },
      {
        label: "Current streak",
        value: `${streak} day${streak === 1 ? "" : "s"}`,
        detail: streak > 0 ? "Perfect-day streak." : "Start it with all wins today."
      }
    ]
  };
}

function formatInsightDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function getHabitActionSlot(habit: Habit) {
  const dayPart = getHabitDayPart(habit);

  if (dayPart === "morning") {
    return "before the phone gets interesting";
  }

  if (dayPart === "evening") {
    return "before the day fully winds down";
  }

  return "before lunch or right after the first work block";
}
