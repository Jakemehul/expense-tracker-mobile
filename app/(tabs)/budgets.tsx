import { ScrollView, Text, View, TouchableOpacity, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useBudgets } from "@/lib/budget-context";
import { BudgetStatusCard } from "@/components/budget-status-card";
import { useMemo } from "react";

export default function BudgetsScreen() {
  const router = useRouter();
  const { budgets, getBudgetStatus } = useBudgets();
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
      exceeded,
      critical,
      warning,
      safe: budgetStatuses.filter((b) => b.status === "safe").length,
    };
  }, [budgetStatuses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-bold text-foreground">Budgets</Text>
            <TouchableOpacity
              onPress={() => router.push("../budget-settings")}
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
              onPress={() => router.push("../budget-settings")}
              className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Create Your First Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overall Summary */}
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
                <View className="h-3 bg-border rounded-full overflow-hidden mb-3">
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min((stats.spent / stats.total) * 100, 100)}%`,
                      backgroundColor:
                        stats.spent > stats.total
                          ? "#EF4444"
                          : stats.spent / stats.total > 0.9
                            ? "#FF8B94"
                            : stats.spent / stats.total > 0.75
                              ? "#FFE66D"
                              : "#22C55E",
                    }}
                  />
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">
                    {((stats.spent / stats.total) * 100).toFixed(0)}% spent
                  </Text>
                  <Text className="text-xs text-muted">
                    {formatCurrency(Math.max(0, stats.remaining))} remaining
                  </Text>
                </View>
              </View>

              {/* Status Cards */}
              <View className="flex-row gap-2 flex-wrap">
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">On Track</Text>
                  <Text className="text-lg font-bold text-foreground">{stats.safe}</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">Caution</Text>
                  <Text className="text-lg font-bold" style={{ color: "#FFE66D" }}>
                    {stats.warning}
                  </Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">Alert</Text>
                  <Text className="text-lg font-bold" style={{ color: "#FF8B94" }}>
                    {stats.critical}
                  </Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">Over Budget</Text>
                  <Text className="text-lg font-bold" style={{ color: "#EF4444" }}>
                    {stats.exceeded}
                  </Text>
                </View>
              </View>
            </View>

            {/* Budget Details */}
            <View>
              <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                Category Budgets
              </Text>

              <FlatList
                scrollEnabled={false}
                data={budgetStatuses}
                keyExtractor={(item) => item.categoryId}
                renderItem={({ item }) => (
                  <BudgetStatusCard status={item} compact={false} />
                )}
              />
            </View>

            {/* Tips Section */}
            <View className="bg-surface rounded-2xl p-4 border border-border mt-6">
              <Text className="text-sm font-semibold text-foreground mb-2">💡 Tips</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Set realistic budgets based on your spending patterns. Review and adjust monthly to
                stay on track with your financial goals.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
