import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import { useMemo, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const chartWidth = Dimensions.get("window").width - 32;
const chartHeight = 220;

export default function TrendsScreen() {
  const { transactions, categories } = useTransactions();
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get last 6 months of data
  const chartData = useMemo(() => {
    const now = new Date();
    const months: Array<{ year: number; month: number; label: string }> = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      });
    }

    // Overall spending trend
    const overallData = months.map((m) => {
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === m.year && tDate.getMonth() === m.month && t.type === "expense";
      });
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    // Category-wise spending
    const categoryData: Record<string, number[]> = {};
    categories.forEach((cat) => {
      categoryData[cat.id] = months.map((m) => {
        const monthTransactions = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getFullYear() === m.year &&
            tDate.getMonth() === m.month &&
            t.type === "expense" &&
            t.category === cat.id
          );
        });
        return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      });
    });

    return {
      labels: months.map((m) => m.label),
      overall: overallData,
      byCategory: categoryData,
      months,
    };
  }, [transactions, categories]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  // Format currency
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  // Get chart color
  const getChartColor = (categoryId?: string) => {
    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      return category?.color || colors.primary;
    }
    return colors.primary;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Spending Trends</Text>
          <Text className="text-muted">Last 6 months analysis</Text>
        </View>

        {/* Overall Spending Chart */}
        <View className="mb-8 bg-surface rounded-3xl p-4 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4">Overall Spending</Text>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  data: chartData.overall,
                  color: () => colors.error,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => colors.muted,
              labelColor: () => colors.muted,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: colors.error,
              },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
          <View className="mt-4 p-3 bg-error/10 rounded-lg">
            <Text className="text-sm text-error font-semibold">
              Avg: {formatCurrency(chartData.overall.reduce((a, b) => a + b, 0) / chartData.overall.length)}
            </Text>
          </View>
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">By Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={({ pressed }) => [
                {
                  backgroundColor:
                    selectedCategory === null ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="px-4 py-2 rounded-full border border-border"
            >
              <Text
                className={`font-semibold ${selectedCategory === null ? "text-background" : "text-foreground"}`}
              >
                All
              </Text>
            </Pressable>

            {expenseCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      selectedCategory === cat.id ? cat.color : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  className={`font-semibold ${selectedCategory === cat.id ? "text-white" : "text-foreground"}`}
                >
                  {cat.icon} {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Chart */}
        {selectedCategory ? (
          <View className="mb-8 bg-surface rounded-3xl p-4 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">
              {categories.find((c) => c.id === selectedCategory)?.icon}{" "}
              {categories.find((c) => c.id === selectedCategory)?.name}
            </Text>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    data: chartData.byCategory[selectedCategory] || [],
                    color: () => getChartColor(selectedCategory),
                    strokeWidth: 2,
                  },
                ],
              }}
              width={chartWidth}
              height={chartHeight}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: () => colors.muted,
                labelColor: () => colors.muted,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: getChartColor(selectedCategory),
                },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
            <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${getChartColor(selectedCategory)}20` }}>
              <Text className="text-sm font-semibold" style={{ color: getChartColor(selectedCategory) }}>
                Avg: {formatCurrency((chartData.byCategory[selectedCategory] || []).reduce((a, b) => a + b, 0) / 6)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mb-8">
            {expenseCategories.map((cat) => {
              const catData = chartData.byCategory[cat.id] || [];
              const total = catData.reduce((a, b) => a + b, 0);
              const avg = total / catData.length;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="mb-3 bg-surface rounded-2xl p-4 border border-border"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">{cat.icon}</Text>
                      <View>
                        <Text className="text-lg font-bold text-foreground">{cat.name}</Text>
                        <Text className="text-sm text-muted">Tap to view trend</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold" style={{ color: cat.color }}>
                        {formatCurrency(total)}
                      </Text>
                      <Text className="text-xs text-muted">Avg: {formatCurrency(avg)}</Text>
                    </View>
                  </View>

                  {/* Mini bar chart */}
                  <View className="flex-row items-end gap-1 h-12">
                    {catData.map((value, idx) => {
                      const maxValue = Math.max(...catData, 1);
                      const height = (value / maxValue) * 100;
                      return (
                        <View
                          key={idx}
                          style={{
                            height: `${height}%`,
                            backgroundColor: cat.color,
                            borderRadius: 4,
                            flex: 1,
                            minHeight: 2,
                          }}
                        />
                      );
                    })}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
