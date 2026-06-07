import { Transaction } from './types';

export interface SpendingInsight {
  message: string;
  category?: string;
  dayOfWeek?: string;
  percentageChange: number;
  currentAmount: number;
  previousAmount: number;
  type: 'increase' | 'decrease' | 'pattern';
}

export interface WeeklyCategorySummary {
  category: string;
  weeklyTotal: number;
  transactionCount: number;
  previousWeekTotal: number;
  percentageChange: number;
  icon: string;
  color: string;
}

/**
 * Get the day of week name from a date
 */
function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Get the week number for a date
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const result = new Date(d);
  result.setDate(result.getDate() + diff - d.getDate());
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Analyze spending patterns and generate insights
 */
export function generateSpendingInsights(transactions: Transaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  // Group transactions by category and day of week for current and previous week
  const currentWeekByCategory: Record<string, Record<string, number>> = {};
  const previousWeekByCategory: Record<string, Record<string, number>> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const txDate = new Date(tx.date);
      const dayOfWeek = getDayOfWeek(txDate);
      const weekStart = getWeekStart(txDate);

      if (weekStart.getTime() === currentWeekStart.getTime()) {
        // Current week
        if (!currentWeekByCategory[tx.category]) {
          currentWeekByCategory[tx.category] = {};
        }
        currentWeekByCategory[tx.category][dayOfWeek] =
          (currentWeekByCategory[tx.category][dayOfWeek] || 0) + tx.amount;
      } else if (weekStart.getTime() === previousWeekStart.getTime()) {
        // Previous week
        if (!previousWeekByCategory[tx.category]) {
          previousWeekByCategory[tx.category] = {};
        }
        previousWeekByCategory[tx.category][dayOfWeek] =
          (previousWeekByCategory[tx.category][dayOfWeek] || 0) + tx.amount;
      }
    }
  });

  // Generate insights for categories with day-of-week patterns
  Object.keys(currentWeekByCategory).forEach((category) => {
    const currentDays = currentWeekByCategory[category];
    const previousDays = previousWeekByCategory[category] || {};

    Object.keys(currentDays).forEach((dayOfWeek) => {
      const currentAmount = currentDays[dayOfWeek];
      const previousAmount = previousDays[dayOfWeek] || 0;

      if (previousAmount > 0) {
        const percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;

        if (percentageChange > 20) {
          // Significant increase
          insights.push({
            message: `You spent ₹${currentAmount.toFixed(2)} on ${category} this ${dayOfWeek}, up ${percentageChange.toFixed(0)}% from last ${dayOfWeek}`,
            category,
            dayOfWeek,
            percentageChange,
            currentAmount,
            previousAmount,
            type: 'increase',
          });
        } else if (percentageChange < -20) {
          // Significant decrease
          insights.push({
            message: `You spent ₹${currentAmount.toFixed(2)} on ${category} this ${dayOfWeek}, down ${Math.abs(percentageChange).toFixed(0)}% from last ${dayOfWeek}`,
            category,
            dayOfWeek,
            percentageChange,
            currentAmount,
            previousAmount,
            type: 'decrease',
          });
        }
      } else if (currentAmount > 0) {
        // New spending pattern detected
        insights.push({
          message: `New spending pattern: You spent ₹${currentAmount.toFixed(2)} on ${category} this ${dayOfWeek}`,
          category,
          dayOfWeek,
          percentageChange: 100,
          currentAmount,
          previousAmount: 0,
          type: 'pattern',
        });
      }
    });
  });

  return insights.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange)).slice(0, 5);
}

/**
 * Get weekly category summary
 */
export function getWeeklyCategorySummary(
  transactions: Transaction[],
  categoryIcons: Record<string, string>,
  categoryColors: Record<string, string>,
): WeeklyCategorySummary[] {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const currentWeekTotals: Record<string, { total: number; count: number }> = {};
  const previousWeekTotals: Record<string, { total: number; count: number }> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const txDate = new Date(tx.date);
      const weekStart = getWeekStart(txDate);

      if (weekStart.getTime() === currentWeekStart.getTime()) {
        if (!currentWeekTotals[tx.category]) {
          currentWeekTotals[tx.category] = { total: 0, count: 0 };
        }
        currentWeekTotals[tx.category].total += tx.amount;
        currentWeekTotals[tx.category].count += 1;
      } else if (weekStart.getTime() === previousWeekStart.getTime()) {
        if (!previousWeekTotals[tx.category]) {
          previousWeekTotals[tx.category] = { total: 0, count: 0 };
        }
        previousWeekTotals[tx.category].total += tx.amount;
        previousWeekTotals[tx.category].count += 1;
      }
    }
  });

  const summaries: WeeklyCategorySummary[] = [];

  Object.keys(currentWeekTotals).forEach((category) => {
    const current = currentWeekTotals[category];
    const previous = previousWeekTotals[category] || { total: 0, count: 0 };

    const percentageChange =
      previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : current.total > 0 ? 100 : 0;

    summaries.push({
      category,
      weeklyTotal: current.total,
      transactionCount: current.count,
      previousWeekTotal: previous.total,
      percentageChange,
      icon: categoryIcons[category] || '💰',
      color: categoryColors[category] || '#0a7ea4',
    });
  });

  return summaries.sort((a, b) => b.weeklyTotal - a.weeklyTotal);
}
