import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useState, useMemo } from "react";

export default function SummaryScreen() {
  const { getMonthlyStats, categories } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());

  const stats = useMemo(() => {
    return getMonthlyStats(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate, getMonthlyStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.name === categoryId);
  };

  const categoryList = Object.entries(stats.byCategory)
    .map(([key, value]) => ({
      id: key,
      ...value,
      categoryInfo: getCategoryInfo(key),
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Monthly Summary</Text>
          <Text className="text-sm text-muted mt-1">Track your spending patterns</Text>
        </View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between mb-6 bg-surface rounded-2xl p-4 border border-border">
          <Pressable
            onPress={goToPreviousMonth}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-2xl font-bold text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-foreground">{monthName}</Text>
          <Pressable
            onPress={goToNextMonth}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-2xl font-bold text-primary">→</Text>
          </Pressable>
        </View>

        {/* Summary Stats */}
        <View className="gap-3 mb-6">
          {/* Income Card */}
          <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-success/70 font-medium mb-1">Total Income</Text>
                <Text className="text-3xl font-bold text-success">
                  {formatCurrency(stats.totalIncome)}
                </Text>
              </View>
              <Text className="text-4xl">💰</Text>
            </View>
          </View>

          {/* Expense Card */}
          <View className="bg-error/10 rounded-2xl p-5 border border-error/30">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-error/70 font-medium mb-1">Total Expense</Text>
                <Text className="text-3xl font-bold text-error">
                  {formatCurrency(stats.totalExpense)}
                </Text>
              </View>
              <Text className="text-4xl">💸</Text>
            </View>
          </View>

          {/* Net Balance Card */}
          <View
            className="rounded-2xl p-5 border-2"
            style={{
              backgroundColor: stats.netBalance >= 0 ? "#22C55E15" : "#EF444415",
              borderColor: stats.netBalance >= 0 ? "#22C55E" : "#EF4444",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  className="text-xs font-medium mb-1"
                  style={{
                    color: stats.netBalance >= 0 ? "#22C55E" : "#EF4444",
                  }}
                >
                  Net Balance
                </Text>
                <Text
                  className="text-3xl font-bold"
                  style={{
                    color: stats.netBalance >= 0 ? "#22C55E" : "#EF4444",
                  }}
                >
                  {formatCurrency(stats.netBalance)}
                </Text>
              </View>
              <Text className="text-4xl">{stats.netBalance >= 0 ? "📈" : "📉"}</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View>
          <Text className="text-lg font-bold text-foreground mb-3">📊 Breakdown by Category</Text>

          {categoryList.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 items-center border border-border">
              <Text className="text-4xl mb-2">📭</Text>
              <Text className="text-foreground font-semibold">No transactions this month</Text>
              <Text className="text-xs text-muted mt-1">Add transactions to see breakdown</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={categoryList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mb-3">
                  <View className="bg-surface rounded-2xl p-4 border border-border overflow-hidden">
                    {/* Category Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1 gap-3">
                        {item.categoryInfo && (
                          <View
                            className="w-12 h-12 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: item.categoryInfo.color + "20",
                            }}
                          >
                            <Text className="text-2xl">{item.categoryInfo.icon}</Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-foreground">
                            {item.id}
                          </Text>
                          <Text className="text-xs text-muted mt-0.5">
                            {item.categoryInfo?.name ? "Category" : "Transactions"}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-foreground">
                          {formatCurrency(item.amount)}
                        </Text>
                        <Text className="text-xs text-muted mt-0.5">
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-3 bg-border rounded-full overflow-hidden">
                      <View
                        style={{
                          height: "100%",
                          width: `${item.percentage}%`,
                          backgroundColor: item.categoryInfo?.color || "#0a7ea4",
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
