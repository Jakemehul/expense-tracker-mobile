/**
 * Spending trends service for calculating weekly and monthly trends
 */

export interface DaySpending {
  day: string; // "Mon", "Tue", etc. or "1", "2", etc.
  date: Date;
  amount: number;
  percentage: number; // percentage of average
}

export interface TrendData {
  days: DaySpending[];
  average: number;
  total: number;
  highest: number;
  lowest: number;
  trend: "up" | "down" | "stable"; // compared to previous period
}

/**
 * Get weekly spending trends (Mon-Sun of current week)
 */
export function getWeeklySpendingTrends(
  transactions: any[],
  previousTransactions?: any[]
): TrendData {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Get previous week for comparison
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekStart);
  prevWeekEnd.setDate(weekStart.getDate() - 1);
  prevWeekEnd.setHours(23, 59, 59, 999);

  const currentWeekTransactions = filterTransactionsByDateRange(
    transactions,
    weekStart,
    weekEnd
  );
  const previousWeekTransactions = filterTransactionsByDateRange(
    previousTransactions || transactions,
    prevWeekStart,
    prevWeekEnd
  );

  return calculateTrendData(
    currentWeekTransactions,
    previousWeekTransactions,
    "week"
  );
}

/**
 * Get monthly spending trends (1st-last day of current month)
 */
export function getMonthlySpendingTrends(
  transactions: any[],
  previousTransactions?: any[]
): TrendData {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  // Get previous month for comparison
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  prevMonthStart.setHours(0, 0, 0, 0);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  prevMonthEnd.setHours(23, 59, 59, 999);

  const currentMonthTransactions = filterTransactionsByDateRange(
    transactions,
    monthStart,
    monthEnd
  );
  const previousMonthTransactions = filterTransactionsByDateRange(
    previousTransactions || transactions,
    prevMonthStart,
    prevMonthEnd
  );

  return calculateTrendData(
    currentMonthTransactions,
    previousMonthTransactions,
    "month"
  );
}

/**
 * Filter transactions by date range
 */
function filterTransactionsByDateRange(
  transactions: any[],
  startDate: Date,
  endDate: Date
): any[] {
  return transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const tDate = new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });
}

/**
 * Calculate trend data from transactions
 */
function calculateTrendData(
  currentTransactions: any[],
  previousTransactions: any[],
  period: "week" | "month"
): TrendData {
  const days = period === "week" ? 7 : getDaysInCurrentMonth();
  const daySpending: DaySpending[] = [];

  const now = new Date();
  const startDate = period === "week"
    ? getWeekStart(now)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  // Initialize days with 0 spending
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dayTransactions = currentTransactions.filter((t) => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return tDate.getTime() === date.getTime();
    });

    const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

    daySpending.push({
      day: period === "week"
        ? getDayName(i)
        : (i + 1).toString(),
      date,
      amount,
      percentage: 0, // Will be calculated after average
    });
  }

  // Calculate stats
  const total = daySpending.reduce((sum, d) => sum + d.amount, 0);
  const average = total / days;
  const highest = Math.max(...daySpending.map((d) => d.amount), 0);
  const lowest = Math.min(...daySpending.map((d) => d.amount > 0 ? d.amount : Infinity));

  // Calculate percentages
  daySpending.forEach((d) => {
    d.percentage = average > 0 ? Math.round((d.amount / average) * 100) : 0;
  });

  // Calculate trend
  const prevTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
  let trend: "up" | "down" | "stable" = "stable";
  if (total > prevTotal * 1.1) trend = "up";
  else if (total < prevTotal * 0.9) trend = "down";

  return {
    days: daySpending,
    average: Math.round(average),
    total: Math.round(total),
    highest: Math.round(highest),
    lowest: lowest === Infinity ? 0 : Math.round(lowest),
    trend,
  };
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get day name from index (0=Mon, 1=Tue, etc.)
 */
function getDayName(index: number): string {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days[index];
}

/**
 * Get number of days in current month
 */
function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Get trend label
 */
export function getTrendLabel(trend: "up" | "down" | "stable"): string {
  switch (trend) {
    case "up":
      return "📈 Spending increased";
    case "down":
      return "📉 Spending decreased";
    case "stable":
      return "➡️ Spending stable";
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: "up" | "down" | "stable", colors: any): string {
  switch (trend) {
    case "up":
      return colors.error;
    case "down":
      return colors.success;
    case "stable":
      return colors.warning;
  }
}
