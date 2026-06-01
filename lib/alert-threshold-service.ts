import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERT_THRESHOLD_KEY = "@expense_tracker_alert_threshold";
const DEFAULT_THRESHOLD = 80; // Default 80%

export interface AlertThresholdSettings {
  categoryThreshold: number; // 0-100, percentage at which to alert for category budgets
  weeklyThreshold: number; // 0-100, percentage at which to alert for weekly budget
}

/**
 * Get current alert threshold settings
 */
export async function getAlertThresholds(): Promise<AlertThresholdSettings> {
  try {
    const data = await AsyncStorage.getItem(ALERT_THRESHOLD_KEY);
    if (!data) {
      return {
        categoryThreshold: DEFAULT_THRESHOLD,
        weeklyThreshold: DEFAULT_THRESHOLD,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting alert thresholds:", error);
    return {
      categoryThreshold: DEFAULT_THRESHOLD,
      weeklyThreshold: DEFAULT_THRESHOLD,
    };
  }
}

/**
 * Update alert threshold settings
 */
export async function updateAlertThresholds(
  settings: Partial<AlertThresholdSettings>
): Promise<void> {
  try {
    const current = await getAlertThresholds();
    const updated = { ...current, ...settings };

    // Validate thresholds are between 0 and 100
    if (updated.categoryThreshold < 0 || updated.categoryThreshold > 100) {
      throw new Error("Category threshold must be between 0 and 100");
    }
    if (updated.weeklyThreshold < 0 || updated.weeklyThreshold > 100) {
      throw new Error("Weekly threshold must be between 0 and 100");
    }

    await AsyncStorage.setItem(ALERT_THRESHOLD_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating alert thresholds:", error);
    throw error;
  }
}

/**
 * Set category alert threshold
 */
export async function setCategoryThreshold(percentage: number): Promise<void> {
  await updateAlertThresholds({ categoryThreshold: percentage });
}

/**
 * Set weekly alert threshold
 */
export async function setWeeklyThreshold(percentage: number): Promise<void> {
  await updateAlertThresholds({ weeklyThreshold: percentage });
}

/**
 * Check if spending should trigger alert based on threshold
 */
export async function shouldTriggerAlert(
  spent: number,
  limit: number,
  type: "category" | "weekly" = "category"
): Promise<boolean> {
  if (!limit || limit <= 0) return false;

  const thresholds = await getAlertThresholds();
  const threshold = type === "category" ? thresholds.categoryThreshold : thresholds.weeklyThreshold;
  const percentage = (spent / limit) * 100;

  return percentage >= threshold;
}

/**
 * Get threshold percentage label
 */
export function getThresholdLabel(percentage: number): string {
  if (percentage <= 50) return "Very Conservative";
  if (percentage <= 70) return "Conservative";
  if (percentage <= 85) return "Moderate";
  if (percentage <= 95) return "Aggressive";
  return "Very Aggressive";
}

/**
 * Get available threshold options
 */
export function getThresholdOptions(): number[] {
  return [50, 60, 70, 75, 80, 85, 90, 95];
}
