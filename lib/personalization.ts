import type { Habit } from "./habitData";
import type { OnboardingInput } from "./personalizationTestCases";

export const PERSONALIZATION_STORAGE_KEY = "habit-ledger:personalization:v1";

export type PersonalizationSnapshot = {
  input: OnboardingInput;
  characterBrief: string;
  generatedAt: string;
};

type HabitTemplate = Omit<Habit, "order" | "createdAt"> & {
  target: string;
  fit: string;
};

export const defaultOnboardingInput: OnboardingInput = {
  displayName: "",
  ageBand: "25-34",
  city: "",
  routineType: "working-professional",
  schedule: "",
  dailyAvailableMinutes: 30,
  primaryGoals: ["fitness", "focus", "better sleep"],
  constraints: ["long sitting hours"],
  preferredTone: "friendly",
  photoUpload: "no"
};

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

export function createPersonalizedHabits(input: OnboardingInput, now = new Date().toISOString()): Habit[] {
  const keywords = [
    input.routineType,
    ...input.primaryGoals,
    ...input.constraints,
    input.schedule,
    input.preferredTone
  ]
    .join(" ")
    .toLowerCase();
  const scored = templates.map((template, index) => {
    const fitWords = template.fit.split(/\s+/);
    const score =
      fitWords.reduce((total, word) => total + (keywords.includes(word) ? 2 : 0), 0) +
      routineBoost(input.routineType, template.id) +
      goalBoost(input.primaryGoals, template.id) +
      constraintBoost(input.constraints, template.id) -
      index / 100;
    return { template, score };
  });
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ template }, order) => personalizeHabit(template, input, order, now));

  return selected.length > 0 ? selected : templates.slice(0, 6).map((template, order) => personalizeHabit(template, input, order, now));
}

export function createCharacterBrief(input: OnboardingInput, hasPhotoReference: boolean) {
  const name = cleanName(input.displayName) || "You";
  const city = input.city.trim() || "your city";
  const outfit = getOutfit(input);
  const palette = getPalette(input);
  const photoLine = hasPhotoReference
    ? "Use the uploaded photo only as a private visual reference, then delete the original after generation."
    : "No photo was provided, so design the character from the user's answers, routine, city, goals, tone, and constraints.";

  return `${name} as a polished habit-tracker character from ${city}, wearing ${outfit}, ${palette}, clean app-sticker style, no text inside image. ${photoLine}`;
}

export function createPersonalizationSummary(input: OnboardingInput) {
  const name = cleanName(input.displayName) || "Your";
  const goals = input.primaryGoals.slice(0, 3).join(", ");
  return `${name} plan: ${input.routineType.replace("-", " ")}, ${input.dailyAvailableMinutes} min/day, focused on ${goals}.`;
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
    createdAt: now
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
    student: "a smart casual campus outfit with a neat backpack",
    "working-professional": "a clean work-casual outfit with comfortable sneakers",
    homemaker: "a graceful soft kurta-inspired outfit with practical details",
    "field-worker": "a breathable travel-ready outfit with a sling bag",
    "business-owner": "a polished founder-style outfit with a ledger accessory"
  };

  return map[input.routineType];
}

function getPalette(input: OnboardingInput) {
  const map: Record<OnboardingInput["preferredTone"], string> = {
    calm: "sage, cream, and soft blue accents",
    direct: "teal, navy, and amber accents",
    friendly: "fresh green, warm yellow, and sky blue accents",
    premium: "deep teal, ivory, and muted gold accents"
  };

  return map[input.preferredTone];
}

function cleanName(value: string) {
  return value.trim().slice(0, 32);
}
