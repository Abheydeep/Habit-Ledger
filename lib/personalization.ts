import type { Habit } from "./habitData";
import type { OnboardingInput } from "./personalizationTestCases";

export const PERSONALIZATION_STORAGE_KEY = "habit-ledger:personalization:v1";

export type PersonalizationSnapshot = {
  input: OnboardingInput;
  characterBrief: string;
  generatedAt: string;
  draftHabits?: Habit[];
  userCustomizedWins?: boolean;
};

type HabitTemplate = Omit<Habit, "order" | "createdAt"> & {
  target: string;
  fit: string;
};

export const defaultOnboardingInput: OnboardingInput = {
  displayName: "",
  ageBand: "25-34",
  avatarStyle: "neutral",
  avatarAction: "auto",
  city: "",
  routineType: "working-professional",
  schedule: "",
  dailyAvailableMinutes: 30,
  primaryGoals: ["fitness", "focus", "better sleep"],
  constraints: ["long sitting hours"],
};

export function normalizeOnboardingInput(value: Partial<OnboardingInput> | OnboardingInput): OnboardingInput {
  return {
    ...defaultOnboardingInput,
    ...value,
    primaryGoals: Array.isArray(value.primaryGoals) ? value.primaryGoals : defaultOnboardingInput.primaryGoals,
    constraints: Array.isArray(value.constraints) ? value.constraints : defaultOnboardingInput.constraints,
    avatarStyle:
      value.avatarStyle === "feminine" || value.avatarStyle === "masculine" || value.avatarStyle === "neutral"
        ? value.avatarStyle
        : "neutral",
    avatarAction: value.avatarAction ?? "auto"
  };
}

const templates: HabitTemplate[] = [
  {
    id: "wake-early",
    name: "Start on time",
    color: "#0f766e",
    thumbnail: "icon:wake-early",
    quip: "A steady start that matches your real schedule.",
    target: "Begin the day within your chosen window",
    fit: "sleep morning routine homemaker student"
  },
  {
    id: "water",
    name: "Drink water",
    color: "#0284c7",
    thumbnail: "icon:water",
    quip: "Keep the bottle close, especially on busy Indian days.",
    target: "6-8 glasses or 2L",
    fit: "health fitness travel heat field-worker homemaker"
  },
  {
    id: "steps",
    name: "Walk / steps",
    color: "#16a34a",
    thumbnail: "icon:steps",
    quip: "A short walk counts. So does the metro sprint.",
    target: "15-25 min walk or 5k-8k steps",
    fit: "fitness energy field-worker working-professional homemaker"
  },
  {
    id: "yoga-workout",
    name: "Stretch or workout",
    color: "#7c3aed",
    thumbnail: "icon:yoga-workout",
    quip: "Mobility, strength, or a sincere attempt.",
    target: "5-20 minutes",
    fit: "fitness sitting fatigue self-care"
  },
  {
    id: "healthy-meal",
    name: "Balanced meal",
    color: "#f59e0b",
    thumbnail: "icon:healthy-meal",
    quip: "Tiffin energy beats random snacking.",
    target: "One planned meal",
    fit: "health food delivery hostel meal energy"
  },
  {
    id: "deep-work",
    name: "Focus block",
    color: "#2563eb",
    thumbnail: "icon:deep-work",
    quip: "One clean block, notifications outside.",
    target: "30-90 minutes",
    fit: "focus exam prep business discipline student working-professional"
  },
  {
    id: "skill-learning",
    name: "Learn a skill",
    color: "#0891b2",
    thumbnail: "icon:skill-learning",
    quip: "Coding, English, finance, course work, anything compounding.",
    target: "20-45 minutes",
    fit: "learning student working-professional business-owner"
  },
  {
    id: "budget",
    name: "Track expenses",
    color: "#ca8a04",
    thumbnail: "icon:budget",
    quip: "UPI adds up quietly. Catch it early.",
    target: "Log spends before sleep",
    fit: "money finance expenses business-owner field-worker"
  },
  {
    id: "screen-time",
    name: "Limit reels / shorts",
    color: "#dc2626",
    thumbnail: "icon:screen-time",
    quip: "Entertainment is fine. The black hole is not.",
    target: "No scrolling in the chosen cutoff window",
    fit: "screen balance less scrolling phone late-night"
  },
  {
    id: "home-reset",
    name: "Home / desk reset",
    color: "#475569",
    thumbnail: "icon:home-reset",
    quip: "One tiny reset makes the next thing easier.",
    target: "10 minute reset",
    fit: "homemaker business-owner calmer routine room shared room"
  },
  {
    id: "sleep",
    name: "Sleep routine",
    color: "#4f46e5",
    thumbnail: "icon:sleep",
    quip: "Tomorrow gets easier when tonight behaves.",
    target: "Protect your sleep window",
    fit: "sleep better sleep fatigue late meetings student"
  },
  {
    id: "family",
    name: "Family / me-time",
    color: "#db2777",
    thumbnail: "icon:family",
    quip: "A small check-in, a calmer day.",
    target: "One intentional check-in or quiet note",
    fit: "family self-care homemaker calmer routine"
  }
];

const lifeModeHabitTemplates: Record<OnboardingInput["routineType"], HabitTemplate[]> = {
  student: [
    modeHabit("study-sprint", "Study sprint", "#7c3aed", "icon:deep-work", "Finish one focused study block", "A real study block beats five anxious tabs."),
    modeHabit("revision-recall", "Revision recall", "#2563eb", "icon:skill-learning", "Revise yesterday's notes", "Tiny recall sessions make exam week less dramatic."),
    modeHabit("screen-cutoff", "Phone cutoff", "#dc2626", "icon:screen-time", "No reels in the cutoff window", "The syllabus cannot fight infinite scroll alone."),
    modeHabit("sleep-window", "Sleep window", "#4f46e5", "icon:sleep", "Protect bedtime", "Your brain also needs charging."),
    modeHabit("campus-walk", "Campus walk", "#16a34a", "icon:steps", "15-20 min walk", "Movement keeps the study fog away."),
    modeHabit("water-bottle", "Bottle refill", "#0284c7", "icon:water", "Refill twice", "Hostel survival, but make it hydrated."),
    modeHabit("better-meal", "Better meal choice", "#f59e0b", "icon:healthy-meal", "One balanced meal", "One decent plate can rescue the day."),
    modeHabit("quick-reset", "Desk reset", "#475569", "icon:home-reset", "Reset study space", "A clear desk is suspiciously powerful.")
  ],
  "working-professional": [
    modeHabit("focus-block", "Focus block", "#2563eb", "icon:deep-work", "One protected work block", "Meetings can wait outside this little fence."),
    modeHabit("posture-reset", "Posture reset", "#7c3aed", "icon:yoga-workout", "Three stretch breaks", "Your neck has filed enough complaints."),
    modeHabit("walk-after-work", "After-work walk", "#16a34a", "icon:steps", "20 min walk", "A clean shutdown button for laptop brain."),
    modeHabit("planned-meal", "Planned meal", "#f59e0b", "icon:healthy-meal", "One planned meal", "Delivery apps do not get to run the personality."),
    modeHabit("screen-shutdown", "Screen shutdown", "#dc2626", "icon:screen-time", "No work screen after cutoff", "Even ambition needs office hours."),
    modeHabit("water-desk", "Desk water", "#0284c7", "icon:water", "2L through the day", "The bottle is the quietest productivity tool."),
    modeHabit("skill-stack", "Skill stack", "#0891b2", "icon:skill-learning", "20 min skill practice", "Small compounding, less career panic."),
    modeHabit("sleep-protect", "Sleep protect", "#4f46e5", "icon:sleep", "Keep sleep window", "Tomorrow's focus starts tonight.")
  ],
  homemaker: [
    modeHabit("morning-calm", "Morning calm", "#db2777", "icon:wake-early", "10 quiet minutes", "A tiny pocket of your own before the day fills up."),
    modeHabit("water-check", "Water check", "#0284c7", "icon:water", "6-8 glasses", "Care also counts when it is for you."),
    modeHabit("home-reset", "Home reset", "#fb7185", "icon:home-reset", "One 10 min zone", "One corner calmer than before."),
    modeHabit("me-time-note", "Me-time note", "#9333ea", "icon:read-news", "Write one line", "Proof that your day included you."),
    modeHabit("gentle-walk", "Gentle walk", "#16a34a", "icon:steps", "15 min walk", "A small walk, not a full production."),
    modeHabit("stretch-break", "Stretch break", "#7c3aed", "icon:yoga-workout", "5-10 min stretch", "Tiny mobility for a busy body."),
    modeHabit("balanced-plate", "Balanced plate", "#f59e0b", "icon:healthy-meal", "One balanced plate", "Leftovers can still be a strategy."),
    modeHabit("family-check", "Family check-in", "#db2777", "icon:family", "One intentional check-in", "Connection, without making it another chore.")
  ],
  "field-worker": [
    modeHabit("carry-water", "Carry water", "#0284c7", "icon:water", "Refill twice", "Travel days punish empty bottles."),
    modeHabit("meal-timing", "Meal timing", "#f59e0b", "icon:healthy-meal", "One proper meal on time", "Street snacks are not a calendar."),
    modeHabit("expense-log", "Cash and UPI log", "#ca8a04", "icon:budget", "Log spends before sleep", "Small leaks become visible here."),
    modeHabit("movement-check", "Movement check", "#16a34a", "icon:steps", "15 min walk or active minutes", "The day moves, but this makes it count."),
    modeHabit("sun-reset", "Heat reset", "#ea580c", "icon:less-sugar", "Cooling break", "A smarter pause for hot Indian days."),
    modeHabit("route-plan", "Route plan", "#0284c7", "icon:deep-work", "Plan tomorrow's first stop", "Future you likes fewer surprises."),
    modeHabit("quick-stretch", "Quick stretch", "#7c3aed", "icon:yoga-workout", "5 min stretch", "Undo a little travel stiffness."),
    modeHabit("sleep-window", "Sleep window", "#4f46e5", "icon:sleep", "7 hours when possible", "Flexible, because the road is not.")
  ],
  "business-owner": [
    modeHabit("opening-checklist", "Opening checklist", "#0f766e", "icon:deep-work", "Finish before first rush", "A clean start makes the shop feel sharper."),
    modeHabit("cash-upi-tally", "Cash and UPI tally", "#ca8a04", "icon:budget", "Daily closing tally", "The closing tally should not depend on memory."),
    modeHabit("inventory-glance", "Inventory glance", "#475569", "icon:home-reset", "Check 5 key items", "Just enough control without overthinking."),
    modeHabit("customer-followup", "Customer follow-up", "#0891b2", "icon:family", "One useful follow-up", "Relationship capital, logged neatly."),
    modeHabit("founder-focus", "Founder focus block", "#2563eb", "icon:deep-work", "35 min business block", "Work on the business, not only in it."),
    modeHabit("walk-reset", "Walk reset", "#16a34a", "icon:steps", "20 min walk", "A moving brain solves better."),
    modeHabit("planned-meal", "Planned meal", "#f59e0b", "icon:healthy-meal", "One planned meal", "Busy should not mean random."),
    modeHabit("closing-shutdown", "Closing shutdown", "#4f46e5", "icon:sleep", "Wind down after closing", "The shop closes. So should the mind.")
  ]
};

export function createPersonalizedHabits(input: OnboardingInput, now = new Date().toISOString()): Habit[] {
  const normalized = normalizeOnboardingInput(input);
  const keywords = [
    normalized.routineType,
    ...normalized.primaryGoals,
    ...normalized.constraints,
    normalized.schedule
  ]
    .join(" ")
    .toLowerCase();
  const scored = templates.map((template, index) => {
    const fitWords = template.fit.split(/\s+/);
    const score =
      fitWords.reduce((total, word) => total + (keywords.includes(word) ? 2 : 0), 0) +
      routineBoost(normalized.routineType, template.id) +
      goalBoost(normalized.primaryGoals, template.id) +
      constraintBoost(normalized.constraints, template.id) -
      index / 100;
    return { template, score };
  });
  const modeTemplates = lifeModeHabitTemplates[normalized.routineType];
  const rankedGeneral = scored.sort((a, b) => b.score - a.score).map(({ template }) => template);
  const selected = uniqueTemplates([...modeTemplates, ...rankedGeneral]).slice(0, 10);

  return selected.map((template, order) => personalizeHabit(template, normalized, order, now));
}

export function createCharacterBrief(input: OnboardingInput) {
  const normalized = normalizeOnboardingInput(input);
  const name = cleanName(normalized.displayName) || "Your avatar";
  const outfit = getOutfit(normalized);
  const action = getAvatarAction(normalized);

  return `${name} is ${action}, wearing ${outfit}.`;
}

export function createPersonalizationSummary(input: OnboardingInput) {
  const normalized = normalizeOnboardingInput(input);
  const name = cleanName(normalized.displayName) || "Your";
  const goals = normalized.primaryGoals.slice(0, 3).join(", ");
  return `${name} plan: ${normalized.routineType.replace("-", " ")}, ${normalized.dailyAvailableMinutes} min/day, focused on ${goals}.`;
}

function modeHabit(
  id: string,
  name: string,
  color: string,
  thumbnail: string,
  target: string,
  quip: string
): HabitTemplate {
  return {
    id,
    name,
    color,
    thumbnail,
    target,
    quip,
    fit: ""
  };
}

function uniqueTemplates(items: HabitTemplate[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function personalizeHabit(template: HabitTemplate, input: OnboardingInput, order: number, now: string): Habit {
  const minutes = Math.max(10, Math.min(90, input.dailyAvailableMinutes));
  const name = tuneHabitName(template.id, template.name, input);
  const target = tuneTarget(template.id, template.target, input, minutes);
  return {
    id: `personal-${template.id}`,
    name,
    order,
    color: template.color,
    thumbnail: template.thumbnail,
    quip: `${target}. ${template.quip}`,
    createdAt: now,
    requirement: order < 5 ? "permanent" : "optional"
  };
}

function tuneHabitName(id: string, fallback: string, input: OnboardingInput) {
  if (id === "deep-work") {
    if (input.primaryGoals.includes("exam prep")) return "Study sprint";
    if (input.routineType === "business-owner") return "Business focus block";
    return "Focus block";
  }

  if (id === "steps") {
    return input.routineType === "field-worker" ? "Movement check" : "Walk / steps";
  }

  if (id === "healthy-meal") {
    if (input.constraints.some((item) => item.toLowerCase().includes("hostel"))) return "Better hostel meal";
    if (input.constraints.some((item) => item.toLowerCase().includes("delivery"))) return "Planned meal";
    return "Balanced meal";
  }

  if (id === "screen-time") return "Scroll cutoff";
  if (id === "budget") return input.routineType === "business-owner" ? "Cash and UPI tally" : "Expense log";
  if (id === "family") return input.routineType === "homemaker" ? "Me-time note" : "Family check-in";
  if (id === "home-reset") return input.routineType === "business-owner" ? "Inventory glance" : "Home / desk reset";

  return fallback;
}

function tuneTarget(id: string, fallback: string, input: OnboardingInput, minutes: number) {
  if (id === "deep-work") return `${minutes} min focused block`;
  if (id === "skill-learning") return `${Math.min(minutes, 45)} min learning`;
  if (id === "steps") return minutes <= 20 ? "15 min walk" : "20-25 min walk";
  if (id === "yoga-workout") return `${Math.min(minutes, 20)} min stretch`;
  if (id === "sleep") {
    return input.schedule.toLowerCase().includes("night") ? "move bedtime 20 min earlier" : fallback;
  }
  if (id === "screen-time") return "no reels in your cutoff window";
  return fallback;
}

function routineBoost(routineType: OnboardingInput["routineType"], templateId: string) {
  const boostMap: Record<OnboardingInput["routineType"], string[]> = {
    student: ["deep-work", "skill-learning", "sleep", "screen-time"],
    "working-professional": ["deep-work", "steps", "yoga-workout", "screen-time"],
    homemaker: ["water", "steps", "family", "home-reset"],
    "field-worker": ["water", "healthy-meal", "budget", "sleep"],
    "business-owner": ["deep-work", "budget", "home-reset", "sleep"]
  };

  return boostMap[routineType].includes(templateId) ? 4 : 0;
}

function goalBoost(goals: string[], templateId: string) {
  const text = goals.join(" ").toLowerCase();
  const goalMap: Record<string, string[]> = {
    "deep-work": ["focus", "exam prep", "business discipline"],
    steps: ["fitness", "energy", "movement"],
    "yoga-workout": ["fitness", "self-care", "energy"],
    sleep: ["better sleep", "energy", "calmer routine"],
    budget: ["money tracking", "finance clarity", "business discipline"],
    "screen-time": ["screen balance", "less scrolling"],
    family: ["self-care", "calmer routine"],
    "skill-learning": ["learning", "exam prep"],
    water: ["energy", "fitness"],
    "healthy-meal": ["energy", "fitness", "self-care"]
  };

  return (goalMap[templateId] ?? []).some((goal) => text.includes(goal)) ? 5 : 0;
}

function constraintBoost(constraints: string[], templateId: string) {
  const text = constraints.join(" ").toLowerCase();
  const constraintMap: Record<string, string[]> = {
    "screen-time": ["phone", "scroll", "late-night"],
    "healthy-meal": ["hostel", "delivery", "irregular meals"],
    water: ["heat", "travel"],
    "yoga-workout": ["sitting", "fatigue"],
    sleep: ["late meetings", "irregular rest", "late-night"],
    "home-reset": ["shared room", "family interruptions"],
    budget: ["cash", "upi", "expenses"]
  };

  return (constraintMap[templateId] ?? []).some((constraint) => text.includes(constraint)) ? 4 : 0;
}

function getOutfit(input: OnboardingInput) {
  const map: Record<OnboardingInput["routineType"], string> = {
    student: "a modern campus outfit with a lavender varsity layer, neat backpack, and notebook details",
    "working-professional": "a crisp work-casual outfit with a tailored teal jacket, white shirt, and clean sneakers",
    homemaker: "an elegant soft kurta set with a flowing dupatta, gentle floral details, and practical pockets",
    "field-worker": "a breathable travel-ready outfit with a smart utility vest, cap, sling bag, and comfortable shoes",
    "business-owner": "a polished founder-style blazer with ivory shirt, muted gold pin, and planner accessory"
  };

  return map[input.routineType];
}

function getAvatarPresentation(input: OnboardingInput) {
  const ageMap: Record<OnboardingInput["ageBand"], string> = {
    "18-24": "young adult features",
    "25-34": "adult features",
    "35-44": "mature adult features",
    "45+": "warm mature features"
  };
  const styleMap: Record<OnboardingInput["avatarStyle"], string> = {
    auto: "presentation chosen softly from the name if clear, otherwise neutral",
    feminine: "feminine-presenting",
    masculine: "masculine-presenting",
    neutral: "gender-neutral presenting"
  };

  return `${ageMap[input.ageBand]}, ${styleMap[input.avatarStyle]}`;
}

function getAvatarAction(input: OnboardingInput) {
  const action = input.avatarAction === "auto" ? actionForRoutine(input.routineType) : input.avatarAction;
  const map: Record<Exclude<OnboardingInput["avatarAction"], "auto">, string> = {
    studying: "studying with a notebook and highlighter",
    working: "working with a laptop and focus notes",
    walking: "walking with a bottle and compact day bag",
    planning: "planning with a Win List and pen",
    resetting: "doing a small home reset with a cup or plant",
    resting: "resting calmly with a soft self-care prop"
  };

  return map[action];
}

function actionForRoutine(routineType: OnboardingInput["routineType"]): Exclude<OnboardingInput["avatarAction"], "auto"> {
  const map: Record<OnboardingInput["routineType"], Exclude<OnboardingInput["avatarAction"], "auto">> = {
    student: "studying",
    "working-professional": "working",
    homemaker: "resetting",
    "field-worker": "walking",
    "business-owner": "planning"
  };

  return map[routineType];
}

function getPalette(input: OnboardingInput) {
  const modeMap: Record<OnboardingInput["routineType"], string> = {
    student: "lavender notebook, warm yellow, and soft ink-blue accents",
    "working-professional": "teal, clean sky blue, and amber workday accents",
    homemaker: "rose, peach, cream, and warm home-stationery accents",
    "field-worker": "sunny orange, fresh green, and practical blue accents",
    "business-owner": "deep teal, ivory, muted gold, and focus-green accents"
  };

  return modeMap[input.routineType];
}

function cleanName(value: string) {
  return value.trim().slice(0, 32);
}
