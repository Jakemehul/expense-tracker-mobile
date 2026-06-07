import React, { useMemo } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useColors } from "@/hooks/use-colors";
import { TrendData, getTrendLabel, getTrendColor } from "@/lib/spending-trends-service";

export interface SpendingTrendsChartProps {
  data: TrendData;
  period: "week" | "month";
}

/**
 * Spending trends chart showing daily spending patterns
 */
export function SpendingTrendsChart({ data, period }: SpendingTrendsChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;

  const chartData = useMemo(() => {
    return {
      labels: data.days.map((d) => d.day),
      datasets: [
        {
          data: data.days.map((d) => d.amount),
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };
  }, [data, colors]);

  const trendColor = getTrendColor(data.trend, colors);

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      <View className="bg-surface rounded-2xl p-4 mb-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-foreground">
            {period === "week" ? "Weekly" : "Monthly"} Spending Trend
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-2xl font-bold text-primary">
              ₹{data.total.toLocaleString()}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: trendColor }}
            >
              <Text className="text-xs font-semibold text-white">
                {getTrendLabel(data.trend)}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View className="mb-4">
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => colors.border,
              labelColor: () => colors.muted,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: colors.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: "0",
                stroke: colors.border,
                strokeOpacity: 0.3,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Stats Grid */}
        {/* Stats Grid — using flexWrap instead of CSS Grid (Grid doesn't work in React Native) */}
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>

  <View style={{ flex: 1, minWidth: '45%' }}>
    <StatCard
      label="Average/Day"
      value={`₹${data.average.toLocaleString()}`}
      backgroundColor={colors.primary}
    />
  </View>

  <View style={{ flex: 1, minWidth: '45%' }}>
    <StatCard
      label="Highest Day"
      value={`₹${data.highest.toLocaleString()}`}
      backgroundColor={colors.warning}
    />
  </View>

  <View style={{ flex: 1, minWidth: '45%' }}>
    <StatCard
      label="Lowest Day"
      value={`₹${data.lowest.toLocaleString()}`}
      backgroundColor={colors.success}
    />
  </View>

  <View style={{ flex: 1, minWidth: '45%' }}>
    <StatCard
      label="Days Tracked"
      value={data.days.length.toString()}
      backgroundColor={colors.primary}
    />
  </View>

</View>
        {/* Day-by-day breakdown */}
        <View className="mt-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
          <Text className="text-sm font-semibold text-foreground mb-3">
            Daily Breakdown
          </Text>
          <View className="gap-2">
            {data.days.map((day, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between p-3 bg-background rounded-lg"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Text className="text-sm font-semibold text-foreground w-12">
                    {day.day}
                  </Text>
                  <View className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(day.percentage, 100)}%`,
                      }}
                    />
                  </View>
                </View>
                <Text className="text-sm font-semibold text-foreground ml-2">
                  ₹{day.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  backgroundColor: string;
}

function StatCard({ label, value, backgroundColor }: StatCardProps) {
  const colors = useColors();
  return (
    <View
      className="p-3 rounded-lg"
      style={{ backgroundColor }}
    >
      <Text className="text-xs text-white opacity-80 mb-1">{label}</Text>
      <Text className="text-lg font-bold text-white">{value}</Text>
    </View>
  );
}
