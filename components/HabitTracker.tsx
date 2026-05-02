"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Download,
  FileUp,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
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
  type CSSProperties
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
  type PersonalizationSnapshot
} from "../lib/personalization";
import { personalizationTestCases, type OnboardingInput } from "../lib/personalizationTestCases";

const colorPalette = ["#0f766e", "#2563eb", "#f59e0b", "#16a34a", "#9333ea", "#db2777", "#475569"];
const COOKIE_KEY = "pro_habit_tracker_india_v1";
const HISTORY_STATE_KEY = "proHabitTrackerIndiaStateV1";
const emptyDay: DayRecord = { completedHabitIds: [], habitMoods: {} };
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

type CompletionCelebration = {
  id: number;
  habitId: string;
  tone: string;
  message: string;
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
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(true);
  const [monthOpen, setMonthOpen] = useState(true);
  const [celebration, setCelebration] = useState<CompletionCelebration | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const [personalizerOpen, setPersonalizerOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingInput>(defaultOnboardingInput);
  const [personalizationSnapshot, setPersonalizationSnapshot] = useState<PersonalizationSnapshot | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const stored = readSavedTrackerState();

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (isTrackerState(parsed)) {
          const storedTracker = normalizeImportedState(parsed);
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
          setOnboarding(parsed.input);
          setPersonalizationSnapshot(parsed);
        }
      } catch {
        window.localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
      }
    } else {
      setPersonalizerOpen(true);
    }

    const today = new Date();
    const todayKey = localDateKey(today);
    selectedDateRef.current = todayKey;
    setSelectedDate(todayKey);
    setVisibleMonth(startOfMonth(today));
  }, []);

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
  const streak = useMemo(
    () => countStreakEndingAt(selectedDate, tracker, activeHabits),
    [selectedDate, tracker, activeHabits]
  );
  const monthProgress = useMemo(
    () => countMonthProgress(monthDays, activeHabits, tracker),
    [monthDays, activeHabits, tracker]
  );

  const triggerCompletionCelebration = useCallback(
    (habit: Habit, moodOption: (typeof moodOptions)[number] | undefined) => {
      const messages = ["Momentum banked", "Ledger updated", "Clean finish", "Progress logged"];

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

  const updateSelectedNote = useCallback(
    (note: string) => {
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
      const color = colorPalette[order % colorPalette.length];
      const id = `custom-${Date.now().toString(36)}`;
      const habit: Habit = {
        id,
        name,
        order,
        color,
        thumbnail: newHabitThumbnail,
        quip: "Custom routine ready to track.",
        createdAt: new Date().toISOString()
      };

      return { ...current, habits: [...current.habits, habit] };
    });

    setNewHabitName("");
  }, [commit, newHabitName, newHabitThumbnail]);

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
      const habit = tracker.habits.find((item) => item.id === habitId);
      const confirmed = window.confirm(`Delete "${habit?.name ?? "this habit"}" from the tracker?`);
      if (!confirmed) {
        return;
      }

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
    },
    [commit, tracker.habits]
  );

  const exportShareCard = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1620;

    const context = canvas.getContext("2d");
    if (!context) {
      window.alert("Could not create the image export.");
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
    context.fillText("built for steady days", 246, 118);

    context.fillStyle = "#0f2f2e";
    context.font = "950 68px Arial Rounded MT Bold, Trebuchet MS, Arial";
    context.fillText("Habit", 244, 188);
    context.fillText("Ledger", 244, 266);

    context.fillStyle = "#52635f";
    context.font = "700 30px Avenir Next, Trebuchet MS, Arial";
    context.fillText(`${dateLabel}  |  ${completed}/${habitRows.length} habits done`, 94, 360);

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
      context.fillText(done ? "logged for the day" : "status not set", 184, y + 57);

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
        context.fillText("set status", 812, y + 42);
      }

      y += 82;
    }

    context.fillStyle = "#0f766e";
    context.font = "900 26px Avenir Next, Trebuchet MS, Arial";
    context.fillText("consistent routines, clearer days", 94, 1512);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) {
      window.alert("Could not finish the image export.");
      return;
    }

    downloadBlob(blob, `habit-ledger-${selectedDate}.png`);
  }, [activeHabits, selectedDate, selectedRecord]);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(tracker, null, 2)], { type: "application/json" });
    downloadBlob(blob, `habit-ledger-backup-${selectedDate}.json`);
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
        window.alert("That file does not look like a Habit Ledger backup.");
        return;
      }

      const imported = normalizeImportedState(parsed);
      trackerRef.current = imported;
      setTracker(imported);
      saveTrackerState(imported);
    } catch {
      window.alert("I could not read that backup file.");
    }
  }, []);

  const resetTracker = useCallback(() => {
    const confirmed = window.confirm("Reset all habits, statuses, and notes?");
    if (confirmed) {
      const next = createDefaultState();
      trackerRef.current = next;
      setTracker(next);
      saveTrackerState(next);
    }
  }, []);

  const selectToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(localDateKey(today));
    setVisibleMonth(startOfMonth(today));
    setExpandedHabitId(null);
    setDayOpen(true);
  }, []);

  const selectDay = useCallback((dateKey: string, habitId: string | null = null) => {
    setSelectedDate(dateKey);
    setExpandedHabitId(habitId);
    setDayOpen(true);
  }, []);

  const updateOnboarding = useCallback(
    <Key extends keyof OnboardingInput>(key: Key, value: OnboardingInput[Key]) => {
      setOnboarding((current) => ({ ...current, [key]: value }));
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

  const handlePhotoReference = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Please choose an image file for the character reference.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPhotoPreview(result);
      setOnboarding((current) => ({ ...current, photoUpload: "yes" }));
    };
    reader.readAsDataURL(file);
  }, []);

  const clearPhotoReference = useCallback(() => {
    setPhotoPreview(null);
    setOnboarding((current) => ({ ...current, photoUpload: "no" }));
  }, []);

  const loadSampleCase = useCallback((input: OnboardingInput) => {
    setOnboarding(input);
    setPhotoPreview(null);
    setPersonalizerOpen(true);
  }, []);

  const applyPersonalizedPlan = useCallback(() => {
    const confirmed = window.confirm(
      "Create this personalized plan? This replaces the current local habit list and clears existing tracking data in this browser."
    );

    if (!confirmed) {
      return;
    }

    const now = new Date().toISOString();
    const habits = createPersonalizedHabits(onboarding, now);
    const nextTracker: TrackerState = {
      version: 1,
      habits,
      days: {},
      createdAt: now,
      updatedAt: now
    };
    const snapshot: PersonalizationSnapshot = {
      input: onboarding,
      characterBrief: createCharacterBrief(onboarding, Boolean(photoPreview)),
      generatedAt: now
    };

    trackerRef.current = nextTracker;
    setTracker(nextTracker);
    saveTrackerState(nextTracker);
    window.localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(snapshot));
    setPersonalizationSnapshot(snapshot);
    setExpandedHabitId(null);
    setDayOpen(true);
    setPersonalizerOpen(false);
  }, [onboarding, photoPreview]);

  return (
    <main className="tracker-shell">
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
          <LogoMark />
          <div className="hero-copy">
            <div className="eyebrow">
              <CircleDot size={16} aria-hidden="true" />
              Built for steady days
            </div>
            <h1 id="tracker-title">Habit Ledger</h1>
            <p>
              A clean tracker for health, focus, money, learning, and screen-time routines in everyday India.
            </p>
          </div>
        </div>

        <div className="hero-actions" aria-label="Tracker actions">
          <button className="icon-text-button" type="button" onClick={selectToday}>
            <CalendarDays size={18} aria-hidden="true" />
            Today
          </button>
          <button className="icon-text-button" type="button" onClick={exportShareCard}>
            <Download size={18} aria-hidden="true" />
            Export
          </button>
          <button className="icon-text-button" type="button" onClick={() => setPersonalizerOpen((open) => !open)}>
            <Wand2 size={18} aria-hidden="true" />
            Personalize
          </button>
          <label className="icon-text-button file-button">
            <FileUp size={18} aria-hidden="true" />
            Import
            <input type="file" accept="application/json" onChange={importBackup} />
          </label>
          <button className="icon-text-button hot" type="button" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={18} aria-hidden="true" />
            Habits
          </button>
        </div>
      </section>

      <PersonalizerPanel
        isOpen={personalizerOpen}
        onboarding={onboarding}
        photoPreview={photoPreview}
        snapshot={personalizationSnapshot}
        onToggle={() => setPersonalizerOpen((open) => !open)}
        onUpdate={updateOnboarding}
        onToggleListItem={toggleOnboardingListItem}
        onPhotoChange={handlePhotoReference}
        onPhotoClear={clearPhotoReference}
        onLoadSample={loadSampleCase}
        onApply={applyPersonalizedPlan}
      />

      <section className="dashboard-grid" aria-label="Habit tracker dashboard">
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
            <StatCard label="Done" value={`${completedCount}/${activeHabits.length}`} />
            <StatCard label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
            <StatCard label="Month" value={`${monthProgress.completed}/${monthProgress.total}`} />
          </div>

          <button className="day-toggle" type="button" onClick={() => setDayOpen((open) => !open)}>
            <CircleDot size={17} aria-hidden="true" />
            {dayOpen ? "Hide day plan" : "Open day plan"}
          </button>

          <div className="day-panel-content">
            <div className="checklist" aria-label="Today's habits">
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
                    <button
                      className="habit-card-main habit-expand-button"
                      type="button"
                      onClick={() => setExpandedHabitId(moodMenuOpen ? null : habit.id)}
                      aria-expanded={moodMenuOpen}
                      aria-label={`${moodMenuOpen ? "Close" : "Set"} status for ${habit.name}`}
                    >
                      <img src={assetUrl(habit.thumbnail)} alt="" className="habit-thumb" />
                      <div className="habit-card-copy">
                        <h3>{habit.name}</h3>
                        <p>{habit.quip}</p>
                      </div>
                      <span
                        className={`mood-preview${moodOption ? " selected" : ""}`}
                        style={{ "--mood": moodOption?.tone ?? habit.color } as CSSProperties}
                      >
                        {moodOption ? (
                          <img src={assetUrl(moodOption.src)} alt="" />
                        ) : (
                          <CircleDot size={16} aria-hidden="true" />
                        )}
                        <span>{moodOption ? moodOption.label : "Set status"}</span>
                      </span>
                    </button>
                    {moodMenuOpen ? (
                      <div className="activity-mood-panel" aria-label={`Status choices for ${habit.name}`}>
                        {moodOptions.map((mood) => (
                          <button
                            className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                            key={mood.key}
                            style={{ "--mood": mood.tone } as CSSProperties}
                            type="button"
                            onClick={() => {
                              const shouldCelebrate = habitMood !== mood.key && isCompletionMood(mood.key);
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
                      <CompletionBurst key={celebration.id} message={celebration.message} tone={celebration.tone} />
                    ) : null}
                  </article>
                );
              })}
            </div>

            <label className="note-box">
              <span>Daily note</span>
              <textarea
                ref={noteRef}
                value={selectedRecord.note ?? ""}
                onChange={(event) => updateSelectedNote(event.target.value)}
                onInput={(event) => updateSelectedNote(event.currentTarget.value)}
                placeholder="What helped or got in the way?"
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
            <div className="month-grid-wrap" role="region" aria-label="Monthly habit grid" tabIndex={0}>
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
                      return (
                        <button
                          className={`grid-cell${done ? " done" : ""}${moodOption ? " mooded" : ""}${
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
                              ? `Edit ${habit.name} status on ${dayKey}, currently ${moodOption.label}`
                              : `Set status for ${habit.name} on ${dayKey}`
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

      {settingsOpen ? (
        <div className="settings-layer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close habit settings"
          />
          <aside className="settings-drawer">
            <LogoMark className="panel-watermark drawer" decorative />
            <div className="drawer-header">
              <div className="drawer-title-lockup">
                <LogoMark className="drawer-logo" />
                <div>
                  <span className="section-kicker">Tracker setup</span>
                  <h2 id="settings-title">Habits and icons</h2>
                </div>
              </div>
              <button className="round-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="add-habit-box">
              <label>
                <span>New habit</span>
                <input
                  value={newHabitName}
                  onChange={(event) => setNewHabitName(event.target.value)}
                  placeholder="Add a routine to track"
                />
              </label>
              <div className="thumbnail-picker compact" aria-label="Choose thumbnail for new habit">
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
              <button className="icon-text-button hot full" type="button" onClick={addHabit}>
                <Plus size={18} aria-hidden="true" />
                Add habit
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
                      aria-label={`Habit name for ${habit.name}`}
                    />
                    <input
                      value={habit.quip}
                      onChange={(event) => updateHabit(habit.id, { quip: event.target.value })}
                      aria-label={`Habit quip for ${habit.name}`}
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
                    <button
                      className="round-button danger small"
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      aria-label={`Delete ${habit.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button className="reset-button" type="button" onClick={resetTracker}>
              <RotateCcw size={17} aria-hidden="true" />
              Reset tracker
            </button>
            <button className="backup-button" type="button" onClick={exportBackup}>
              <Download size={17} aria-hidden="true" />
              Download data backup
            </button>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

type PersonalizerPanelProps = {
  isOpen: boolean;
  onboarding: OnboardingInput;
  photoPreview: string | null;
  snapshot: PersonalizationSnapshot | null;
  onToggle: () => void;
  onUpdate: <Key extends keyof OnboardingInput>(key: Key, value: OnboardingInput[Key]) => void;
  onToggleListItem: (key: "primaryGoals" | "constraints", value: string) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoClear: () => void;
  onLoadSample: (input: OnboardingInput) => void;
  onApply: () => void;
};

function PersonalizerPanel({
  isOpen,
  onboarding,
  photoPreview,
  snapshot,
  onToggle,
  onUpdate,
  onToggleListItem,
  onPhotoChange,
  onPhotoClear,
  onLoadSample,
  onApply
}: PersonalizerPanelProps) {
  const characterBrief = snapshot?.characterBrief ?? createCharacterBrief(onboarding, Boolean(photoPreview));
  const summary = createPersonalizationSummary(snapshot?.input ?? onboarding);
  const hasName = onboarding.displayName.trim().length > 0;
  const hasPhotoReference = Boolean(photoPreview);

  return (
    <section className={`personalizer-panel${isOpen ? " open" : " collapsed"}`} aria-labelledby="personalizer-title">
      <div className="personalizer-header">
        <div className="personalizer-title">
          <div className="personalizer-icon">
            <Wand2 size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="section-kicker">Personalized launch flow</span>
            <h2 id="personalizer-title">Build a habit plan in under a minute</h2>
          </div>
        </div>
        <button className="icon-text-button" type="button" onClick={onToggle}>
          {isOpen ? "Hide" : "Customize"}
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

            <div className="tone-row" aria-label="Tone preference">
              <span>Tone</span>
              {(["friendly", "calm", "direct", "premium"] as const).map((tone) => (
                <button
                  className={onboarding.preferredTone === tone ? "selected" : ""}
                  key={tone}
                  type="button"
                  onClick={() => onUpdate("preferredTone", tone)}
                >
                  {tone}
                </button>
              ))}
            </div>

            <div className="sample-strip" aria-label="Sample personalization cases">
              <span>Try sample data</span>
              <div>
                {personalizationTestCases.map((testCase) => (
                  <button key={testCase.id} type="button" onClick={() => onLoadSample(testCase.onboarding)}>
                    {testCase.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="character-card" aria-label="Character and plan preview">
            <div className="character-visual">
              <AnswerCharacter input={onboarding} photoReferenceLoaded={hasPhotoReference} />
            </div>

            <div className="character-copy">
              <h3>{hasName ? `${onboarding.displayName.trim()}'s ledger` : "Your ledger"}</h3>
              <p>{summary}</p>
              <p className="character-source">
                {hasPhotoReference
                  ? "Photo reference loaded. The production avatar should use face guidance without showing the raw photo."
                  : "No photo needed. This character is shaped from the answers above."}
              </p>
              <p className="character-brief">{characterBrief}</p>
            </div>

            <label className="photo-upload">
              <UserRound size={17} aria-hidden="true" />
              Optional photo reference
              <input type="file" accept="image/*" onChange={onPhotoChange} />
            </label>
            {photoPreview ? (
              <button className="tiny-text-button" type="button" onClick={onPhotoClear}>
                Clear photo
              </button>
            ) : null}

            <div className="privacy-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>No-photo users still get an answer-based character. If a photo is uploaded, it stays in this browser for the demo; production should delete raw photos after avatar generation.</span>
            </div>

            <div className="architecture-notes">
              <span>Launch stack for first 500 users</span>
              <div>
                <CheckCircle2 size={16} aria-hidden="true" />
                Static frontend on GitHub Pages
              </div>
              <div>
                <CheckCircle2 size={16} aria-hidden="true" />
                Supabase Auth/Postgres when sync starts
              </div>
              <div>
                <CheckCircle2 size={16} aria-hidden="true" />
                R2/Supabase Storage for generated avatars
              </div>
            </div>

            <button className="icon-text-button hot full" type="button" onClick={onApply}>
              <Wand2 size={18} aria-hidden="true" />
              Create my habit plan
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function AnswerCharacter({
  input,
  photoReferenceLoaded
}: {
  input: OnboardingInput;
  photoReferenceLoaded: boolean;
}) {
  const palette = characterPalettes[input.preferredTone];
  const style = {
    "--char-primary": palette.primary,
    "--char-secondary": palette.secondary,
    "--char-accent": palette.accent,
    "--char-bg": palette.bg
  } as CSSProperties;

  return (
    <div
      className={`answer-character routine-${input.routineType}${photoReferenceLoaded ? " photo-guided" : ""}`}
      style={style}
      aria-hidden="true"
    >
      <span className="character-spark one" />
      <span className="character-spark two" />
      <span className="character-spark three" />
      <div className="character-head">
        <span className="character-hair" />
        <span className="character-face" />
        <span className="character-eye left" />
        <span className="character-eye right" />
        <span className="character-smile" />
      </div>
      <div className="character-body">
        <span className="character-collar" />
        <span className="character-sash" />
      </div>
      <span className="character-prop" />
      {photoReferenceLoaded ? <span className="reference-glow" /> : null}
    </div>
  );
}

const characterPalettes: Record<
  OnboardingInput["preferredTone"],
  { primary: string; secondary: string; accent: string; bg: string }
> = {
  calm: { primary: "#0f766e", secondary: "#bfdbfe", accent: "#fef3c7", bg: "#effaf6" },
  direct: { primary: "#1d4ed8", secondary: "#99f6e4", accent: "#fbbf24", bg: "#f0f7ff" },
  friendly: { primary: "#16a34a", secondary: "#bae6fd", accent: "#fde68a", bg: "#f4fbf2" },
  premium: { primary: "#0f2f2e", secondary: "#f5e8bd", accent: "#d97706", bg: "#fbfaf3" }
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CompletionBurst({ message, tone }: { message: string; tone: string }) {
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
      </span>
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
      aria-label={decorative ? undefined : "Habit Ledger logo"}
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

function playCompletionSound(tone: string) {
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
      const noteStart = startedAt + index * 0.065;
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(baseFrequency * ratio, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.2 : 0.12, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.24);
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

function weekdayLetter(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date).slice(0, 1);
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
    const completed = activeHabits.some((habit) => (record ? isHabitComplete(record, habit.id) : false));

    if (!completed) {
      break;
    }

    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function countMonthProgress(days: Date[], activeHabits: Habit[], tracker: TrackerState) {
  const total = days.length * activeHabits.length;
  const completed = days.reduce((sum, day) => {
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
