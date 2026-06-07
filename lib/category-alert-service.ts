import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAlertThresholds } from "./alert-threshold-service";

const CATEGORY_ALERT_KEY = "@expense_tracker_category_alerts";

export interface CategoryAlertRecord {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
  lastAlertDate?: string; // ISO date string
  alerted: boolean;
}

export interface CategoryAlertsState {
  [categoryId: string]: CategoryAlertRecord;
}

/**
 * Get all category alert records
 */
export async function getCategoryAlerts(): Promise<CategoryAlertsState> {
  try {
    const data = await AsyncStorage.getItem(CATEGORY_ALERT_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting category alerts:", error);
    return {};
  }
}

/**
 * Check if category should trigger alert
 * Returns true if:
 * 1. Spending is >= 80% of category budget
 * 2. User hasn't been alerted for this category today
 */
export async function shouldAlertForCategory(
  categoryId: string,
  categoryName: string,
  spent: number,
  limit: number
): Promise<boolean> {
  // If no budget set or invalid, can't alert
  if (!limit || limit <= 0) return false;

  const thresholds = await getAlertThresholds();
  const threshold = thresholds.categoryThreshold / 100;
  const percentage = spent / limit;

  // If spending is below threshold, no alert needed
  if (percentage < threshold) return false;

  try {
    const alerts = await getCategoryAlerts();
    const today = new Date().toISOString().split("T")[0];

    const categoryAlert = alerts[categoryId];

    // No alert record yet, should alert
    if (!categoryAlert) {
      return true;
    }

    // Already alerted today, don't alert again
    if (categoryAlert.lastAlertDate === today && categoryAlert.alerted) {
      return false;
    }

    // Different day, should alert
    return true;
  } catch (error) {
    console.error("Error checking category alert:", error);
    return true; // Alert on error to be safe
  }
}

/**
 * Record that user has been alerted for a category
 */
export async function recordCategoryAlert(
  categoryId: string,
  categoryName: string,
  spent: number,
  limit: number
): Promise<void> {
  try {
    const alerts = await getCategoryAlerts();
    const today = new Date().toISOString().split("T")[0];
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

    alerts[categoryId] = {
      categoryId,
      categoryName,
      spent,
      limit,
      percentage: Math.round(percentage),
      lastAlertDate: today,
      alerted: true,
    };

    await AsyncStorage.setItem(CATEGORY_ALERT_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error("Error recording category alert:", error);
  }
}

/**
 * Get all categories that should alert today
 */
export async function getCategoryAlertsToShow(
  transactions: any[],
  budgets: any[],
  categories: any[]
): Promise<CategoryAlertRecord[]> {
  const today = new Date().toISOString().split("T")[0];
  const thresholds = await getAlertThresholds();
  const alerts: CategoryAlertRecord[] = [];
  const categoryAlerts = await getCategoryAlerts();
  // Check each budget
  for (const budget of budgets) {
    const category = categories.find((c) => c.id === budget.categoryId);
    if (!category) continue;

    // Calculate spending for this category (current month)
    const now = new Date();
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === "expense" &&
        t.category === budget.categoryId &&
        tDate.getFullYear() === now.getFullYear() &&
        tDate.getMonth() === now.getMonth()
      );
    });

    const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    // Check if should alert based on user's custom threshold
    if (percentage >= thresholds.categoryThreshold)
      const categoryAlert = categoryAlerts[budget.categoryId];

      // Only add if not already alerted today
      if (!categoryAlert || categoryAlert.lastAlertDate !== today) {
        alerts.push({
          categoryId: budget.categoryId,
          categoryName: category.name,
          spent,
          limit: budget.limit,
          percentage: Math.round(percentage),
          alerted: false,
        });
      }
    }
  }

  return alerts;
}

/**
 * Clear alert history (useful for testing)
 */
export async function clearCategoryAlertHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CATEGORY_ALERT_KEY);
  } catch (error) {
    console.error("Error clearing category alert history:", error);
  }
}

/**
 * Get remaining budget for a category
 */
export function getRemainingBudget(spent: number, limit: number): number {
  return Math.max(0, limit - spent);
}

/**
 * Get spending percentage for a category
 */
export function getSpendingPercentage(spent: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(Math.round((spent / limit) * 100), 100);
}
