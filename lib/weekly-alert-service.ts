import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERT_THRESHOLD = 0.8; // 80% of budget
const WEEKLY_ALERT_KEY = "weekly_budget_alert";

export interface WeeklyAlertRecord {
  weekStart: number; // ISO week start date timestamp
  alerted: boolean;
  spentPercentage: number;
}

/**
 * Get the start of the current ISO week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the timestamp of the week start (for comparison)
 */
export function getWeekStartTimestamp(date: Date = new Date()): number {
  return getWeekStart(date).getTime();
}

/**
 * Check if user should be alerted about weekly budget
 * Returns true if:
 * 1. Spending is >= 80% of weekly budget
 * 2. User hasn't been alerted this week yet
 */
export async function shouldAlertWeeklyBudget(
  weeklySpent: number,
  weeklyBudget: number
): Promise<boolean> {
  // If no budget set, can't alert
  if (!weeklyBudget || weeklyBudget <= 0) return false;

  const spentPercentage = weeklySpent / weeklyBudget;

  // If spending is below threshold, no alert needed
  if (spentPercentage < ALERT_THRESHOLD) return false;

  try {
    const alertData = await AsyncStorage.getItem(WEEKLY_ALERT_KEY);
    const currentWeekStart = getWeekStartTimestamp();

    if (!alertData) {
      // No alert record yet, should alert
      return true;
    }

    const record: WeeklyAlertRecord = JSON.parse(alertData);

    // If it's a different week, should alert
    if (record.weekStart !== currentWeekStart) {
      return true;
    }

    // Same week and already alerted, don't alert again
    return !record.alerted;
  } catch (error) {
    console.error("Error checking weekly alert status:", error);
    return true; // Alert on error to be safe
  }
}

/**
 * Record that user has been alerted this week
 */
export async function recordWeeklyAlert(
  weeklySpent: number,
  weeklyBudget: number
): Promise<void> {
  try {
    const record: WeeklyAlertRecord = {
      weekStart: getWeekStartTimestamp(),
      alerted: true,
      spentPercentage: weeklyBudget > 0 ? weeklySpent / weeklyBudget : 0,
    };
    await AsyncStorage.setItem(WEEKLY_ALERT_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Error recording weekly alert:", error);
  }
}

/**
 * Get the percentage of weekly budget spent
 */
export function getWeeklySpendingPercentage(
  weeklySpent: number,
  weeklyBudget: number
): number {
  if (!weeklyBudget || weeklyBudget <= 0) return 0;
  return Math.min(Math.round((weeklySpent / weeklyBudget) * 100), 100);
}

/**
 * Get remaining days in the current week
 */
export function getRemainingDaysInWeek(): number {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Sunday = 0, so remaining days = 7 - dayOfWeek (or 0 if Sunday)
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

/**
 * Clear alert history (useful for testing)
 */
export async function clearWeeklyAlertHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WEEKLY_ALERT_KEY);
  } catch (error) {
    console.error("Error clearing weekly alert history:", error);
  }
}
