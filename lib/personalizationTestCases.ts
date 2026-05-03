export type OnboardingInput = {
  displayName: string;
  ageBand: "18-24" | "25-34" | "35-44" | "45+";
  avatarStyle: "auto" | "feminine" | "masculine" | "neutral";
  avatarAction: "auto" | "studying" | "working" | "walking" | "planning" | "resetting" | "resting";
  city: string;
  routineType: "student" | "working-professional" | "homemaker" | "field-worker" | "business-owner";
  schedule: string;
  dailyAvailableMinutes: number;
  primaryGoals: string[];
  constraints: string[];
};

export type ExpectedPersonalizedHabit = {
  name: string;
  target: string;
  icon: string;
  reason: string;
};

export type SampleDayLog = {
  date: string;
  statuses: Record<string, "done" | "strong" | "partial" | "skipped" | "rest">;
  note: string;
};

export type PersonalizationTestCase = {
  id: string;
  title: string;
  onboarding: OnboardingInput;
  expectedHabits: ExpectedPersonalizedHabit[];
  expectedCharacterBrief: string;
  sampleDayLog: SampleDayLog;
};

export const personalizationTestCases: PersonalizationTestCase[] = [
  {
    id: "student-exam-hostel",
    title: "College student preparing for exams from hostel",
    onboarding: {
      displayName: "Riya",
      ageBand: "18-24",
      avatarStyle: "feminine",
      avatarAction: "studying",
      city: "Jaipur",
      routineType: "student",
      schedule: "Classes from 10 AM to 4 PM, studies better at night",
      dailyAvailableMinutes: 45,
      primaryGoals: ["exam prep", "better sleep", "less scrolling"],
      constraints: ["hostel food", "shared room", "late-night phone use"]
    },
    expectedHabits: [
      {
        name: "45 min study sprint",
        target: "1 focused block daily",
        icon: "icon:deep-work",
        reason: "Exam prep is the main goal, but the time budget is small."
      },
      {
        name: "Sleep before midnight",
        target: "Lights out by 12 AM",
        icon: "icon:sleep",
        reason: "Moves her night routine earlier without forcing an unrealistic 10 PM target."
      },
      {
        name: "Limit reels after 10 PM",
        target: "No shorts/reels after 10 PM",
        icon: "icon:screen-time",
        reason: "Directly addresses the late-night phone constraint."
      },
      {
        name: "Drink 2L water",
        target: "2L across the day",
        icon: "icon:water",
        reason: "Simple hostel-friendly wellness habit."
      },
      {
        name: "Walk 5k steps",
        target: "5,000 steps",
        icon: "icon:steps",
        reason: "Campus movement is practical and does not need gym access."
      }
    ],
    expectedCharacterBrief:
      "Cute student avatar with a backpack, soft notebook colors, Jaipur-inspired warm accents, no text in image.",
    sampleDayLog: {
      date: "2026-05-03",
      statuses: {
        "45 min study sprint": "strong",
        "Sleep before midnight": "partial",
        "Limit reels after 10 PM": "skipped",
        "Drink 2L water": "done",
        "Walk 5k steps": "done"
      },
      note: "Studied physics properly, sleep slipped because roommate was awake."
    }
  },
  {
    id: "it-hybrid-bengaluru",
    title: "Hybrid IT professional trying to reduce fatigue",
    onboarding: {
      displayName: "Arjun",
      ageBand: "25-34",
      avatarStyle: "masculine",
      avatarAction: "working",
      city: "Bengaluru",
      routineType: "working-professional",
      schedule: "Hybrid job, laptop work from 9:30 AM to 7 PM",
      dailyAvailableMinutes: 30,
      primaryGoals: ["fitness", "focus", "screen balance"],
      constraints: ["long sitting hours", "late meetings", "food delivery temptation"]
    },
    expectedHabits: [
      {
        name: "90 min deep work",
        target: "1 distraction-free block",
        icon: "icon:deep-work",
        reason: "Improves focus during office hours without extending the day."
      },
      {
        name: "20 min walk",
        target: "20 minutes after work",
        icon: "icon:steps",
        reason: "Small enough for late meetings, useful for long sitting."
      },
      {
        name: "Posture reset",
        target: "3 stretch breaks",
        icon: "icon:yoga-workout",
        reason: "Targets laptop fatigue."
      },
      {
        name: "Home dinner",
        target: "Home meal or planned meal",
        icon: "icon:healthy-meal",
        reason: "Reduces random delivery orders."
      },
      {
        name: "Screen cutoff",
        target: "No work screen after 10:45 PM",
        icon: "icon:screen-time",
        reason: "Protects sleep without pretending late meetings never happen."
      }
    ],
    expectedCharacterBrief:
      "Clean professional avatar with laptop, sneakers, teal-blue accents, calm workspace feel, no text in image.",
    sampleDayLog: {
      date: "2026-05-03",
      statuses: {
        "90 min deep work": "done",
        "20 min walk": "partial",
        "Posture reset": "strong",
        "Home dinner": "skipped",
        "Screen cutoff": "partial"
      },
      note: "Walk was short because the 7 PM meeting stretched."
    }
  },
  {
    id: "homemaker-family-wellness",
    title: "Homemaker balancing family routine and self-care",
    onboarding: {
      displayName: "Meera",
      ageBand: "35-44",
      avatarStyle: "feminine",
      avatarAction: "resetting",
      city: "Lucknow",
      routineType: "homemaker",
      schedule: "Busy mornings, calmer afternoons, family time in evening",
      dailyAvailableMinutes: 25,
      primaryGoals: ["self-care", "movement", "calmer routine"],
      constraints: ["family interruptions", "limited alone time", "irregular rest"]
    },
    expectedHabits: [
      {
        name: "Morning calm",
        target: "10 quiet minutes",
        icon: "icon:wake-early",
        reason: "Fits before the household gets busy."
      },
      {
        name: "15 min walk",
        target: "15 minutes",
        icon: "icon:steps",
        reason: "Low-friction movement habit."
      },
      {
        name: "Drink water",
        target: "6-8 glasses",
        icon: "icon:water",
        reason: "Simple habit that survives interruptions."
      },
      {
        name: "Home reset",
        target: "One 10 min tidy zone",
        icon: "icon:home-reset",
        reason: "Keeps the house feeling lighter without becoming a huge chore."
      },
      {
        name: "Me-time note",
        target: "Write one line",
        icon: "icon:read-news",
        reason: "Turns self-care into something trackable and small."
      }
    ],
    expectedCharacterBrief:
      "Warm graceful avatar with soft peach, rose, and cream outfit accents, cozy home-stationery background, no text in image.",
    sampleDayLog: {
      date: "2026-05-03",
      statuses: {
        "Morning calm": "done",
        "15 min walk": "rest",
        "Drink water": "strong",
        "Home reset": "done",
        "Me-time note": "partial"
      },
      note: "Afternoon was peaceful, skipped walk because of guests."
    }
  },
  {
    id: "field-worker-irregular-schedule",
    title: "Field worker with travel-heavy schedule",
    onboarding: {
      displayName: "Kabir",
      ageBand: "25-34",
      avatarStyle: "masculine",
      avatarAction: "walking",
      city: "Mumbai",
      routineType: "field-worker",
      schedule: "On the road most days, timings change daily",
      dailyAvailableMinutes: 20,
      primaryGoals: ["energy", "money tracking", "better sleep"],
      constraints: ["travel", "heat", "irregular meals", "cash and UPI expenses"]
    },
    expectedHabits: [
      {
        name: "Carry water",
        target: "Refill bottle twice",
        icon: "icon:water",
        reason: "Travel and heat make hydration the highest leverage habit."
      },
      {
        name: "Protein breakfast",
        target: "One filling breakfast",
        icon: "icon:healthy-meal",
        reason: "Stabilizes energy before field work."
      },
      {
        name: "Expense log",
        target: "Log cash and UPI spends",
        icon: "icon:budget",
        reason: "Money tracking is one of his primary goals."
      },
      {
        name: "5 min stretch",
        target: "Before sleep",
        icon: "icon:yoga-workout",
        reason: "Small enough for unpredictable days."
      },
      {
        name: "Sleep window",
        target: "7 hours when possible",
        icon: "icon:sleep",
        reason: "Uses a flexible target instead of a fixed bedtime."
      }
    ],
    expectedCharacterBrief:
      "Practical city avatar with sling bag, comfortable shoes, fresh blue-green accents, Mumbai commute energy, no text in image.",
    sampleDayLog: {
      date: "2026-05-03",
      statuses: {
        "Carry water": "done",
        "Protein breakfast": "partial",
        "Expense log": "done",
        "5 min stretch": "skipped",
        "Sleep window": "partial"
      },
      note: "Travel day. Expenses logged, but food timing was messy."
    }
  },
  {
    id: "small-business-owner",
    title: "Small business owner managing shop and personal routine",
    onboarding: {
      displayName: "Ananya",
      ageBand: "25-34",
      avatarStyle: "feminine",
      avatarAction: "planning",
      city: "Pune",
      routineType: "business-owner",
      schedule: "Shop from 11 AM to 8:30 PM, admin work after closing",
      dailyAvailableMinutes: 35,
      primaryGoals: ["business discipline", "fitness", "finance clarity"],
      constraints: ["customer rush", "late closing", "mental fatigue"]
    },
    expectedHabits: [
      {
        name: "Opening checklist",
        target: "Complete before first customer rush",
        icon: "icon:deep-work",
        reason: "Creates business consistency early in the day."
      },
      {
        name: "Cash and UPI tally",
        target: "Daily closing tally",
        icon: "icon:budget",
        reason: "Directly supports finance clarity."
      },
      {
        name: "Inventory glance",
        target: "Check 5 key items",
        icon: "icon:home-reset",
        reason: "Keeps operations light but disciplined."
      },
      {
        name: "20 min walk",
        target: "Before shop or after closing",
        icon: "icon:steps",
        reason: "Flexible fitness habit for long shop hours."
      },
      {
        name: "Wind-down routine",
        target: "No admin after 11 PM",
        icon: "icon:sleep",
        reason: "Protects rest from late business work."
      }
    ],
    expectedCharacterBrief:
      "Polished founder avatar with smart casual outfit, blush and emerald accents, minimal shop planner background, no text in image.",
    sampleDayLog: {
      date: "2026-05-03",
      statuses: {
        "Opening checklist": "strong",
        "Cash and UPI tally": "done",
        "Inventory glance": "partial",
        "20 min walk": "skipped",
        "Wind-down routine": "partial"
      },
      note: "Good sales day, closing tally done. Walk missed because stock delivery came late."
    }
  }
];
