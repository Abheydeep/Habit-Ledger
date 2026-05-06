import type { Habit } from "./habitData";

export const DEFAULT_PRIMARY_WIN_COUNT = 5;

export function getPrimaryHabits(activeHabits: Habit[]) {
  return activeHabits.filter(isPermanentHabit);
}

export function getOptionalHabits(activeHabits: Habit[]) {
  return activeHabits.filter((habit, index) => !isPermanentHabit(habit, index));
}

export function isPermanentHabit(habit: Habit, index: number) {
  return index < DEFAULT_PRIMARY_WIN_COUNT || Boolean(habit.permanentAt);
}

export type PromoteOptionalHabitResult =
  | {
      changed: false;
      habits: Habit[];
      promotedHabit: null;
      permanentCount: number;
    }
  | {
      changed: true;
      habits: Habit[];
      promotedHabit: Habit;
      permanentCount: number;
    };

export function promoteOptionalHabitToPrimary(
  habits: Habit[],
  habitId: string,
  now = new Date().toISOString()
): PromoteOptionalHabitResult {
  const orderedHabits = [...habits].sort((a, b) => a.order - b.order);
  const activeHabits = orderedHabits.filter((habit) => !habit.pausedAt);
  const habitIndex = activeHabits.findIndex((habit) => habit.id === habitId);

  if (habitIndex < 0 || isPermanentHabit(activeHabits[habitIndex], habitIndex)) {
    return {
      changed: false,
      habits,
      promotedHabit: null,
      permanentCount: getPrimaryHabits(activeHabits).length
    };
  }

  const promotedHabit = activeHabits[habitIndex];
  const nextHabits = orderedHabits.map((habit) =>
    habit.id === habitId ? { ...habit, permanentAt: habit.permanentAt ?? now } : habit
  );
  const nextActiveHabits = nextHabits.filter((habit) => !habit.pausedAt);

  return {
    changed: true,
    habits: nextHabits,
    promotedHabit,
    permanentCount: getPrimaryHabits(nextActiveHabits).length
  };
}
