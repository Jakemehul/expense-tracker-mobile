import { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useBudgets } from "@/lib/budget-context";
import { useTransactions } from "@/lib/transaction-context";
import { BudgetStatusCard } from "@/components/budget-status-card";
import { PieChart, BarChart } from "react-native-chart-kit";
import { createBounceAnimation, createFadeInAnimation } from "@/lib/animations";

export default function BudgetsScreen() {
  const router = useRouter();
  const { budgets, getBudgetStatus } = useBudgets();
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const now = new Date();

  const budgetStatuses = useMemo(() => {
    return getBudgetStatus(now.getFullYear(), now.getMonth());
  }, [getBudgetStatus, now]);

  const stats = useMemo(() => {
    const total = budgetStatuses.reduce((sum, b) => sum + b.limit, 0);
    const spent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);
    const exceeded = budgetStatuses.filter((b) => b.status === "exceeded").length;
    const critical = budgetStatuses.filter((b) => b.status === "critical").length;
    const warning = budgetStatuses.filter((b) => b.status === "warning").length;

    return {
      total,
      spent,
      remaining: total - spent,
      percentage: total > 0 ? Math.round((spent / total) * 100) : 0,
      exceeded,
      critical,
      warning,
      safe: budgetStatuses.filter((b) => b.status === "safe").length,
    };
  }, [budgetStatuses]);

  // Get top spending categories
  const topCategories = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense" && t.date.getMonth() === now.getMonth()) && t.date.getFullYear() === now.getFullYear()
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
  }, [transactions, now]);

  const chartData = useMemo(() => {
    if (topCategories.length === 0) return null;

    const labels = topCategories.map((c) => c.category.substring(0, 8));
    const data = topCategories.map((c) => c.amount);

    return {
      labels,
      datasets: [
        {
          data,
          colors: [
            () => "#0a7ea4",
            () => "#22C55E",
            () => "#F59E0B",
            () => "#EF4444",
            () => "#8B5CF6",
          ],
        },
      ],
    };
  }, [topCategories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Get emotional message based on spending
  const getEmotionalMessage = () => {
    const percentage = stats.percentage;
    if (percentage < 25) return "🎉 Great job! You're spending wisely!";
    if (percentage < 50) return "💪 You're doing well! Keep it up!";
    if (percentage < 75) return "⚠️ You've spent 60% of your budget. Be careful!";
    if (percentage < 90) return "🚨 You're getting close to your limit!";
    if (percentage < 100) return "⛔ You're almost at your budget limit!";
    return "❌ You've exceeded your budget. Time to cut back!";
  };

  const { scale: bounceScale, bounce: triggerBounce } = createBounceAnimation();
  const { opacity: fadeOpacity, fadeIn } = createFadeInAnimation();

  useEffect(() => {
    fadeIn();
  }, []);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-bold text-foreground">Budgets</Text>
            <TouchableOpacity
              onPress={() => {
                triggerBounce();
                router.push("../budget-settings");
              }}
              className="bg-primary rounded-lg px-4 py-2 active:opacity-80"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-sm">+ Add</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-muted">
            {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(now)}
          </Text>
        </View>

        {budgets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-4xl mb-4">💰</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">No Budgets Yet</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Set monthly spending limits for different categories to track your finances better.
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerBounce();
                router.push("../budget-settings");
              }}
              className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Create Your First Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overall Summary with Emotional Message */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                Overall Summary
              </Text>

              <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
                <View className="flex-row justify-between mb-3">
                  <View>
                    <Text className="text-xs text-muted mb-1">Total Budget</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {formatCurrency(stats.total)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-muted mb-1">Total Spent</Text>
                    <Text className="text-2xl font-bold" style={{ color: "#EF4444" }}>
                      {formatCurrency(stats.spent)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-3">
                  <View className="bg-border rounded-full h-2 overflow-hidden">
                    <View
                      className="h-full"
                      style={{
                        width: `${Math.min(stats.percentage, 100)}%`,
                        backgroundColor:
                          stats.percentage < 75
                            ? "#22C55E"
                            : stats.percentage < 90
                              ? "#F59E0B"
                              : "#EF4444",
                      }}
                    />
                  </View>
                  <Text className="text-xs text-muted mt-1">
                    {stats.percentage}% spent • {formatCurrency(stats.remaining)} remaining
                  </Text>
                </View>

                {/* Emotional Message */}
                <View className="bg-background rounded-lg p-3 border border-border">
                  <Text className="text-sm text-foreground font-semibold">
                    {getEmotionalMessage()}
                  </Text>
                </View>
              </View>

              {/* Status Summary */}
              <View className="flex-row justify-between gap-2">
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border items-center">
                  <Text className="text-2xl font-bold text-green-500">{stats.safe}</Text>
                  <Text className="text-xs text-muted mt-1">Safe</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border items-center">
                  <Text className="text-2xl font-bold text-yellow-500">{stats.warning}</Text>
                  <Text className="text-xs text-muted mt-1">Warning</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border items-center">
                  <Text className="text-2xl font-bold text-orange-500">{stats.critical}</Text>
                  <Text className="text-xs text-muted mt-1">Critical</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border items-center">
                  <Text className="text-2xl font-bold text-red-500">{stats.exceeded}</Text>
                  <Text className="text-xs text-muted mt-1">Exceeded</Text>
                </View>
              </View>
            </View>

            {/* Top Spending Categories */}
            {topCategories.length > 0 && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm font-semibold text-muted uppercase">
                    Top Spending Categories
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        triggerBounce();
                        setChartType("pie");
                      }}
                      className={`px-3 py-1 rounded-lg ${
                        chartType === "pie"
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          chartType === "pie" ? "text-white" : "text-foreground"
                        }`}
                      >
                        Pie
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        triggerBounce();
                        setChartType("bar");
                      }}
                      className={`px-3 py-1 rounded-lg ${
                        chartType === "bar"
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          chartType === "bar" ? "text-white" : "text-foreground"
                        }`}
                      >
                        Bar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {chartData && (
                  <View className="bg-surface rounded-2xl p-4 border border-border">
                    {chartType === "pie" ? (
                      <PieChart
                        data={chartData as any}
                        width={300}
                        height={220}
                        chartConfig={{
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                          backgroundColor: "#1e2022",
                          backgroundGradientFrom: "#1e2022",
                          backgroundGradientTo: "#1e2022",
                        }}
                        accessor="data"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                      />
                    ) : (
                      <BarChart
                        data={chartData as any}
                        width={300}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                          backgroundColor: "#1e2022",
                          backgroundGradientFrom: "#1e2022",
                          backgroundGradientTo: "#1e2022",
                          decimalPlaces: 0,
                          barPercentage: 0.7,
                        }}
                        style={{ marginLeft: -40 }}
                      />
                    )}
                  </View>
                )}

                {/* Category Details */}
                <View className="mt-4 gap-2">
                  {topCategories.map((cat, idx) => (
                    <View key={idx} className="bg-surface rounded-lg p-3 border border-border">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-semibold text-foreground">
                          {cat.category}
                        </Text>
                        <Text className="text-sm font-bold text-primary">
                          {formatCurrency(cat.amount)}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted mt-1">
                        {(
                          (cat.amount /
                            topCategories.reduce((sum, c) => sum + c.amount, 0)) *
                          100
                        ).toFixed(1)}
                        % of spending
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Budget Status Cards */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                Budget Details
              </Text>
              {budgetStatuses.map((status) => (
                <BudgetStatusCard key={status.categoryId} status={status} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
