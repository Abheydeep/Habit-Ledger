import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultState } from "../lib/habitData.ts";
import { getOptionalHabits, getPrimaryHabits, promoteOptionalHabitToPrimary } from "../lib/primaryWins.ts";

function activeHabits(habits) {
  return [...habits].sort((a, b) => a.order - b.order).filter((habit) => !habit.pausedAt);
}

test("default list starts with five permanent wins", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const active = activeHabits(state.habits);

  assert.equal(getPrimaryHabits(active).length, 5);
  assert.equal(getOptionalHabits(active).length, 5);
});

test("promoting an optional win increases permanent wins instead of replacing one", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const before = activeHabits(state.habits);
  const originalPermanentIds = getPrimaryHabits(before).map((habit) => habit.id);
  const promotedId = getOptionalHabits(before)[0].id;

  const promotion = promoteOptionalHabitToPrimary(state.habits, promotedId, "2026-05-06T12:00:00.000Z");
  const after = activeHabits(promotion.habits);
  const permanentIds = getPrimaryHabits(after).map((habit) => habit.id);

  assert.equal(promotion.changed, true);
  assert.equal(promotion.permanentCount, 6);
  assert.equal(getPrimaryHabits(after).length, 6);
  assert.equal(getOptionalHabits(after).length, 4);
  assert.deepEqual(permanentIds.slice(0, 5), originalPermanentIds);
  assert.ok(permanentIds.includes(promotedId));
});

test("promoting more optional wins keeps growing the permanent set", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const optionalIds = getOptionalHabits(activeHabits(state.habits))
    .slice(0, 2)
    .map((habit) => habit.id);

  const first = promoteOptionalHabitToPrimary(state.habits, optionalIds[0], "2026-05-06T12:00:00.000Z");
  const second = promoteOptionalHabitToPrimary(first.habits, optionalIds[1], "2026-05-06T12:05:00.000Z");

  assert.equal(getPrimaryHabits(activeHabits(second.habits)).length, 7);
  assert.equal(getOptionalHabits(activeHabits(second.habits)).length, 3);
});

test("promoting an already permanent win is a no-op", () => {
  const state = createDefaultState("2026-05-06T00:00:00.000Z");
  const firstPermanentId = getPrimaryHabits(activeHabits(state.habits))[0].id;
  const promotion = promoteOptionalHabitToPrimary(state.habits, firstPermanentId, "2026-05-06T12:00:00.000Z");

  assert.equal(promotion.changed, false);
  assert.equal(promotion.permanentCount, 5);
  assert.equal(promotion.habits, state.habits);
});
