import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultState,
  getHabitCategory,
  habitCategoryOrder,
  habitSamples,
  normalizeImportedState
} from "../lib/habitData.ts";
import {
  getOptionalHabits,
  getPermanentHabits,
  cloudFlagToHabitRequirement,
  habitRequirementToCloudFlag,
  makeHabitOptional,
  makeHabitPermanent
} from "../lib/primaryWins.ts";
import {
  canShowMonthlyReview,
  canShowPatternAnalytics,
  getAnalyticsUnlockStage,
  getProductExperienceState,
  summarizeTrackerActivity
} from "../lib/experienceState.ts";

function activeHabits(habits) {
  return [...habits].sort((a, b) => a.order - b.order).filter((habit) => !habit.pausedAt);
}

test("default list starts with five permanent wins", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const active = activeHabits(state.habits);

  assert.equal(getPermanentHabits(active).length, 5);
  assert.equal(getOptionalHabits(active).length, 5);
});

test("promoting an optional win increases permanent wins instead of replacing one", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const before = activeHabits(state.habits);
  const originalPermanentIds = getPermanentHabits(before).map((habit) => habit.id);
  const promotedId = getOptionalHabits(before)[0].id;

  const promotion = makeHabitPermanent(state.habits, promotedId);
  const after = activeHabits(promotion.habits);
  const permanentIds = getPermanentHabits(after).map((habit) => habit.id);

  assert.equal(promotion.changed, true);
  assert.equal(promotion.permanentCount, 6);
  assert.equal(getPermanentHabits(after).length, 6);
  assert.equal(getOptionalHabits(after).length, 4);
  assert.deepEqual(permanentIds.slice(0, 5), originalPermanentIds);
  assert.ok(permanentIds.includes(promotedId));
});

test("promoting more optional wins keeps growing the permanent set", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const optionalIds = getOptionalHabits(activeHabits(state.habits))
    .slice(0, 2)
    .map((habit) => habit.id);

  const first = makeHabitPermanent(state.habits, optionalIds[0]);
  const second = makeHabitPermanent(first.habits, optionalIds[1]);

  assert.equal(getPermanentHabits(activeHabits(second.habits)).length, 7);
  assert.equal(getOptionalHabits(activeHabits(second.habits)).length, 3);
});

test("promoting an already permanent win is a no-op", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const firstPermanentId = getPermanentHabits(activeHabits(state.habits))[0].id;
  const promotion = makeHabitPermanent(state.habits, firstPermanentId);

  assert.equal(promotion.changed, false);
  assert.equal(promotion.permanentCount, 5);
  assert.equal(promotion.habits, state.habits);
});

test("making any permanent win optional decreases required wins below five", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const firstPermanentId = getPermanentHabits(activeHabits(state.habits))[0].id;
  const demotion = makeHabitOptional(state.habits, firstPermanentId);
  const after = activeHabits(demotion.habits);

  assert.equal(demotion.changed, true);
  assert.equal(demotion.permanentCount, 4);
  assert.equal(getPermanentHabits(after).length, 4);
  assert.equal(getOptionalHabits(after).length, 6);
  assert.ok(getOptionalHabits(after).some((habit) => habit.id === firstPermanentId));
});

test("promote and demote keep completion logs untouched", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const optionalId = getOptionalHabits(activeHabits(state.habits))[0].id;
  const trackedState = {
    ...state,
    days: {
      "2026-05-06": {
        completedHabitIds: [optionalId],
        habitMoods: { [optionalId]: "done" }
      }
    }
  };

  const promotion = makeHabitPermanent(trackedState.habits, optionalId);
  const demotion = makeHabitOptional(promotion.habits, optionalId);

  assert.deepEqual(trackedState.days["2026-05-06"].completedHabitIds, [optionalId]);
  assert.deepEqual(trackedState.days["2026-05-06"].habitMoods, { [optionalId]: "done" });
  assert.equal(getOptionalHabits(activeHabits(demotion.habits)).some((habit) => habit.id === optionalId), true);
});

test("cloud serialization restores permanent and optional state", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const defaultPermanentId = getPermanentHabits(activeHabits(state.habits))[0].id;
  const optionalId = getOptionalHabits(activeHabits(state.habits))[0].id;
  const demoted = makeHabitOptional(state.habits, defaultPermanentId);
  const promoted = makeHabitPermanent(demoted.habits, optionalId);
  const restored = activeHabits(promoted.habits).map((habit, index) => ({
    ...habit,
    requirement: cloudFlagToHabitRequirement(habitRequirementToCloudFlag(habit, index), index)
  }));

  assert.equal(getPermanentHabits(activeHabits(restored)).some((habit) => habit.id === optionalId), true);
  assert.equal(getOptionalHabits(activeHabits(restored)).some((habit) => habit.id === defaultPermanentId), true);
});

test("legacy saved data normalizes missing requirements", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const legacyState = {
    ...state,
    habits: state.habits.map(({ requirement, ...habit }, index) =>
      index === 5 ? { ...habit, permanentAt: "2026-05-06T12:00:00.000Z" } : habit
    )
  };
  const normalized = normalizeImportedState(legacyState);

  assert.equal(getPermanentHabits(activeHabits(normalized.habits)).length, 6);
  assert.equal(normalized.habits.every((habit) => habit.requirement === "permanent" || habit.requirement === "optional"), true);
  assert.equal("permanentAt" in normalized.habits[5], false);
});

test("sample habit library covers notebook categories without changing default pressure", () => {
  const names = new Set(habitSamples.map((sample) => sample.name));
  const categories = new Set(habitSamples.map((sample) => sample.category));
  const defaultCategories = new Set(createDefaultState("2026-05-06T00:00:00.000Z").habits.map(getHabitCategory));

  assert.ok(names.has("Drink jeera water"));
  assert.ok(names.has("Breathing exercise"));
  assert.ok(names.has("First hour no screen"));
  assert.ok(names.has("Plan tomorrow"));
  assert.ok(habitCategoryOrder.every((category) => categories.has(category)));
  assert.ok(defaultCategories.has("morning-routine"));
  assert.ok(defaultCategories.has("health"));
  assert.equal(createDefaultState("2026-05-06T00:00:00.000Z").habits.length, 10);
});

test("experience state starts focused and then moves through started, lapsed, and active states", () => {
  const emptyActivity = summarizeTrackerActivity({}, "2026-05-09");
  assert.equal(
    getProductExperienceState({
      hasPersonalization: false,
      defaultWinSetup: true,
      activity: emptyActivity
    }),
    "first_run_empty"
  );

  const startedActivity = summarizeTrackerActivity(
    {
      "2026-05-09": {
        completedHabitIds: ["wake-early"],
        habitMoods: { "wake-early": "done" }
      }
    },
    "2026-05-09"
  );
  assert.equal(
    getProductExperienceState({
      hasPersonalization: false,
      defaultWinSetup: true,
      activity: startedActivity
    }),
    "first_run_started"
  );

  const starterActiveActivity = summarizeTrackerActivity(
    {
      "2026-05-08": {
        completedHabitIds: ["wake-early"],
        habitMoods: { "wake-early": "done" }
      }
    },
    "2026-05-09"
  );
  assert.equal(
    getProductExperienceState({
      hasPersonalization: false,
      defaultWinSetup: true,
      activity: starterActiveActivity
    }),
    "starter_active_no_history"
  );

  const lapsedActivity = summarizeTrackerActivity(
    {
      "2026-05-06": {
        completedHabitIds: ["wake-early"],
        habitMoods: { "wake-early": "done" }
      }
    },
    "2026-05-09"
  );
  assert.equal(
    getProductExperienceState({
      hasPersonalization: false,
      defaultWinSetup: true,
      activity: lapsedActivity
    }),
    "returning_lapsed"
  );

  const activeActivity = summarizeTrackerActivity(
    {
      "2026-05-08": {
        completedHabitIds: ["wake-early", "water"],
        habitMoods: { "wake-early": "done", water: "partial" }
      },
      "2026-05-09": {
        completedHabitIds: ["wake-early"],
        habitMoods: { "wake-early": "done" }
      }
    },
    "2026-05-09"
  );
  assert.equal(
    getProductExperienceState({
      hasPersonalization: true,
      defaultWinSetup: false,
      activity: activeActivity
    }),
    "active_with_history"
  );
});

test("analytics unlocks recap, review, and pattern views in stages", () => {
  const emptyActivity = summarizeTrackerActivity({}, "2026-05-09");
  assert.equal(getAnalyticsUnlockStage(emptyActivity), "locked");
  assert.equal(canShowMonthlyReview(getAnalyticsUnlockStage(emptyActivity)), false);

  const recapActivity = summarizeTrackerActivity(
    {
      "2026-05-09": {
        completedHabitIds: ["wake-early"],
        habitMoods: { "wake-early": "done" }
      }
    },
    "2026-05-09"
  );
  assert.equal(getAnalyticsUnlockStage(recapActivity), "recap");

  const reviewByWinsActivity = summarizeTrackerActivity(
    {
      "2026-05-09": {
        completedHabitIds: ["wake-early", "water", "steps"],
        habitMoods: { "wake-early": "done", water: "strong", steps: "partial" }
      }
    },
    "2026-05-09"
  );
  assert.equal(getAnalyticsUnlockStage(reviewByWinsActivity), "review");
  assert.equal(canShowMonthlyReview(getAnalyticsUnlockStage(reviewByWinsActivity)), true);
  assert.equal(canShowPatternAnalytics(getAnalyticsUnlockStage(reviewByWinsActivity)), false);

  const patternActivity = summarizeTrackerActivity(
    {
      "2026-05-05": { completedHabitIds: ["wake-early"], habitMoods: { "wake-early": "done" } },
      "2026-05-06": { completedHabitIds: ["wake-early"], habitMoods: { "wake-early": "done" } },
      "2026-05-07": { completedHabitIds: ["wake-early"], habitMoods: { "wake-early": "done" } },
      "2026-05-08": { completedHabitIds: ["wake-early"], habitMoods: { "wake-early": "done" } },
      "2026-05-09": { completedHabitIds: ["wake-early"], habitMoods: { "wake-early": "done" } }
    },
    "2026-05-09"
  );
  assert.equal(getAnalyticsUnlockStage(patternActivity), "patterns");
  assert.equal(canShowPatternAnalytics(getAnalyticsUnlockStage(patternActivity)), true);
});
