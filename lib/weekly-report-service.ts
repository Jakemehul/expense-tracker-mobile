import { Transaction } from "./types";
import { getWeekStart } from "./weekly-alert-service";

export interface WeeklyReportData {
  weekStart: Date;
  weekEnd: Date;
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
  byCategory: Record<
    string,
    {
      amount: number;
      percentage: number;
      icon: string;
      color: string;
      name: string;
    }
  >;
  dayByDay: Record<
    string,
    {
      date: Date;
      spent: number;
      income: number;
      balance: number;
    }
  >;
  averageDailySpend: number;
  topCategory: {
    name: string;
    amount: number;
    icon: string;
    color: string;
  } | null;
  comparisonWithLastWeek: {
    percentageChange: number;
    isIncrease: boolean;
    amount: number;
  } | null;
}

/**
 * Generate weekly spending report
 */
export function generateWeeklyReport(
  transactions: Transaction[],
  categories: any[],
  previousWeekTransactions?: Transaction[]
): WeeklyReportData {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Filter transactions for current week
  const weekTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= weekStart && tDate < weekEnd;
  });

  // Calculate totals
  const totalSpent = weekTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = weekTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalSpent;

  // Group by category
  const byCategory: Record<
    string,
    {
      amount: number;
      percentage: number;
      icon: string;
      color: string;
      name: string;
    }
  > = {};

  weekTransactions.forEach((t) => {
    if (t.type === "expense") {
      if (!byCategory[t.category]) {
        const cat = categories.find((c) => c.id === t.category);
        byCategory[t.category] = {
          amount: 0,
          percentage: 0,
          icon: cat?.icon || "📌",
          color: cat?.color || "#9BA1A6",
          name: cat?.name || "Unknown",
        };
      }
      byCategory[t.category].amount += t.amount;
    }
  });

  // Calculate percentages
  Object.keys(byCategory).forEach((key) => {
    byCategory[key].percentage =
      totalSpent > 0 ? (byCategory[key].amount / totalSpent) * 100 : 0;
  });

  // Day by day breakdown
  const dayByDay: Record<
    string,
    {
      date: Date;
      spent: number;
      income: number;
      balance: number;
    }
  > = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    const dayTransactions = weekTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.toISOString().split("T")[0] === dateKey;
    });

    const daySpent = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const dayIncome = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    dayByDay[dateKey] = {
      date: new Date(date),
      spent: daySpent,
      income: dayIncome,
      balance: dayIncome - daySpent,
    };
  }

  // Find top category
  const topCategory = Object.entries(byCategory).sort(
    ([, a], [, b]) => b.amount - a.amount
  )[0];

  // Calculate average daily spend
  const averageDailySpend = totalSpent / 7;

  // Compare with last week
  let comparisonWithLastWeek = null;
  if (previousWeekTransactions) {
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 7);

    const lastWeekSpent = previousWeekTransactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date) >= lastWeekStart &&
          new Date(t.date) < lastWeekEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);

    if (lastWeekSpent > 0) {
      const difference = totalSpent - lastWeekSpent;
      const percentageChange = (difference / lastWeekSpent) * 100;

      comparisonWithLastWeek = {
        percentageChange: Math.abs(percentageChange),
        isIncrease: difference > 0,
        amount: Math.abs(difference),
      };
    }
  }

  return {
    weekStart,
    weekEnd,
    totalSpent,
    totalIncome,
    netBalance,
    byCategory,
    dayByDay,
    averageDailySpend,
    topCategory: topCategory
      ? {
          name: byCategory[topCategory[0]].name,
          amount: topCategory[1].amount,
          icon: topCategory[1].icon,
          color: topCategory[1].color,
        }
      : null,
    comparisonWithLastWeek,
  };
}

/**
 * Format date range for display
 */
export function formatWeekDateRange(weekStart: Date, weekEnd: Date): string {
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate() - 1; // End is exclusive, so subtract 1

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}
