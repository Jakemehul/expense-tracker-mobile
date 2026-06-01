import { useMemo } from "react";
import { useTransactions } from "@/lib/transaction-context";
import { useBudgets } from "@/lib/budget-context";
import { getWeekStart } from "@/lib/weekly-alert-service";

export interface WeeklyAlertData {
  weeklySpent: number;
  weeklyBudget: number;
  shouldAlert: boolean;
  percentage: number;
}

/**
 * Hook to calculate weekly spending and determine if alert should show
 * Calculates total expenses for the current week
 */
export function useWeeklyAlert(): WeeklyAlertData {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();

  const weeklyData = useMemo(() => {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Calculate total weekly spending (expenses only)
    const weeklySpent = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return t.type === "expense" && tDate >= weekStart && tDate < weekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total weekly budget (sum of all category budgets)
    const weeklyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

    // Check if should alert (80% threshold)
    const percentage = weeklyBudget > 0 ? (weeklySpent / weeklyBudget) * 100 : 0;
    const shouldAlert = percentage >= 80;

    return {
      weeklySpent,
      weeklyBudget,
      shouldAlert,
      percentage: Math.round(percentage),
    };
  }, [transactions, budgets]);

  return weeklyData;
}
