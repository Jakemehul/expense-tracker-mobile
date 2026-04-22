import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useState, useMemo } from "react";

export default function SummaryScreen() {
  const { getMonthlyStats } = useTransactions();
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

  const categoryList = Object.entries(stats.byCategory).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">Monthly Summary</Text>
        </View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between mb-6 bg-surface rounded-lg p-3 border border-border">
          <Pressable onPress={goToPreviousMonth} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text className="text-lg font-bold text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">{monthName}</Text>
          <Pressable onPress={goToNextMonth} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text className="text-lg font-bold text-primary">→</Text>
          </Pressable>
        </View>

        {/* Summary Stats */}
        <View className="gap-3 mb-6">
          {/* Income Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Total Income</Text>
            <Text className="text-2xl font-bold" style={{ color: "#22C55E" }}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>

          {/* Expense Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Total Expense</Text>
            <Text className="text-2xl font-bold" style={{ color: "#EF4444" }}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>

          {/* Net Balance Card */}
          <View
            className="rounded-2xl p-4 border border-border"
            style={{
              backgroundColor: stats.netBalance >= 0 ? "#22C55E" : "#EF4444",
            }}
          >
            <Text className="text-xs text-white opacity-80 mb-1">Net Balance</Text>
            <Text className="text-2xl font-bold text-white">
              {formatCurrency(stats.netBalance)}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">Breakdown by Category</Text>

          {categoryList.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">No transactions this month</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={categoryList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl p-4 mb-2 border border-border">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-2">{item.icon}</Text>
                      <Text className="text-sm font-medium text-foreground flex-1">
                        {item.id.replace("-", " ").toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View
                      style={{
                        height: "100%",
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </View>

                  <Text className="text-xs text-muted mt-1">{item.percentage.toFixed(1)}%</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
