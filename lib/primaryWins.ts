import type { Habit, HabitRequirement } from "./habitData";

export const DEFAULT_PRIMARY_WIN_COUNT = 5;

export function getPermanentHabits(activeHabits: Habit[]) {
  return activeHabits.filter((habit, index) => getHabitRequirement(habit, index) === "permanent");
}

export function getOptionalHabits(activeHabits: Habit[]) {
  return activeHabits.filter((habit, index) => getHabitRequirement(habit, index) === "optional");
}

export function getHabitRequirement(habit: Habit, index: number): NonNullable<Habit["requirement"]> {
  return habit.requirement ?? (index < DEFAULT_PRIMARY_WIN_COUNT ? "permanent" : "optional");
}

export function habitRequirementToCloudFlag(habit: Habit, index: number) {
  return getHabitRequirement(habit, index) === "permanent";
}

export function cloudFlagToHabitRequirement(value: boolean | null | undefined, index: number): HabitRequirement {
  if (typeof value === "boolean") {
    return value ? "permanent" : "optional";
  }

  return index < DEFAULT_PRIMARY_WIN_COUNT ? "permanent" : "optional";
}

export type HabitRequirementChangeResult =
  | {
      changed: false;
      habits: Habit[];
      habit: null;
      permanentCount: number;
    }
  | {
      changed: true;
      habits: Habit[];
      habit: Habit;
      permanentCount: number;
    };

export function makeHabitPermanent(habits: Habit[], habitId: string): HabitRequirementChangeResult {
  return setHabitRequirement(habits, habitId, "permanent");
}

export function makeHabitOptional(habits: Habit[], habitId: string): HabitRequirementChangeResult {
  return setHabitRequirement(habits, habitId, "optional");
}

function setHabitRequirement(
  habits: Habit[],
  habitId: string,
  requirement: NonNullable<Habit["requirement"]>
): HabitRequirementChangeResult {
  const orderedHabits = [...habits].sort((a, b) => a.order - b.order);
  const activeHabits = orderedHabits.filter((habit) => !habit.pausedAt);
  const habitIndex = activeHabits.findIndex((habit) => habit.id === habitId);

  if (habitIndex < 0 || getHabitRequirement(activeHabits[habitIndex], habitIndex) === requirement) {
    return {
      changed: false,
      habits,
      habit: null,
      permanentCount: getPermanentHabits(activeHabits).length
    };
  }

  const changedHabit = activeHabits[habitIndex];
  const nextHabits = orderedHabits.map((habit) => (habit.id === habitId ? { ...habit, requirement } : habit));
  const nextActiveHabits = nextHabits.filter((habit) => !habit.pausedAt);

  return {
    changed: true,
    habits: nextHabits,
    habit: changedHabit,
    permanentCount: getPermanentHabits(nextActiveHabits).length
  };
}
