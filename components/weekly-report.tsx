import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { WeeklyReportData, formatWeekDateRange } from "@/lib/weekly-report-service";

export interface WeeklyReportProps {
  report: WeeklyReportData;
  onClose: () => void;
}

/**
 * Weekly spending report component
 * Shows detailed breakdown of weekly spending with trends
 */
export function WeeklyReport({ report, onClose }: WeeklyReportProps) {
  const colors = useColors();

  const dateRange = formatWeekDateRange(report.weekStart, report.weekEnd);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Text
          className="text-xl font-bold"
          style={{ color: colors.foreground }}
        >
          Weekly Report
        </Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="text-sm"
            style={{ color: colors.muted }}
          >
            {dateRange}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="px-6 gap-3 mb-6">
          {/* Total Spent */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="text-xs font-semibold mb-1"
              style={{ color: colors.muted }}
            >
              Total Spent
            </Text>
            <Text
              className="text-3xl font-bold text-error"
            >
              ₹{report.totalSpent.toFixed(2)}
            </Text>
          </View>

          {/* Total Income */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="text-xs font-semibold mb-1"
              style={{ color: colors.muted }}
            >
              Total Income
            </Text>
            <Text
              className="text-3xl font-bold text-success"
            >
              ₹{report.totalIncome.toFixed(2)}
            </Text>
          </View>

          {/* Net Balance */}
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: report.netBalance >= 0 ? colors.success : colors.error,
            }}
          >
            <Text
              className="text-xs font-semibold mb-1"
              style={{ color: colors.muted }}
            >
              Net Balance
            </Text>
            <Text
              className="text-3xl font-bold"
              style={{
                color: report.netBalance >= 0 ? colors.success : colors.error,
              }}
            >
              {report.netBalance >= 0 ? "+" : ""}₹{report.netBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Insights */}
        <View className="px-6 mb-6">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.foreground }}
          >
            Insights
          </Text>

          <View
            className="rounded-2xl p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Average Daily Spend */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={colors.primary}
                />
                <View className="flex-1">
                  <Text
                    className="text-sm"
                    style={{ color: colors.muted }}
                  >
                    Avg Daily Spend
                  </Text>
                </View>
              </View>
              <Text
                className="font-semibold"
                style={{ color: colors.foreground }}
              >
                ₹{report.averageDailySpend.toFixed(2)}
              </Text>
            </View>

            {/* Top Category */}
            {report.topCategory && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <Text className="text-xl">{report.topCategory.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className="text-sm"
                      style={{ color: colors.muted }}
                    >
                      Top Category
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.foreground }}
                  >
                    {report.topCategory.name}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.muted }}
                  >
                    ₹{report.topCategory.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Week Comparison */}
            {report.comparisonWithLastWeek && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <MaterialIcons
                    name={
                      report.comparisonWithLastWeek.isIncrease
                        ? "trending-up"
                        : "trending-down"
                    }
                    size={20}
                    color={
                      report.comparisonWithLastWeek.isIncrease
                        ? colors.error
                        : colors.success
                    }
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm"
                      style={{ color: colors.muted }}
                    >
                      vs Last Week
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text
                    className="font-semibold"
                    style={{
                      color: report.comparisonWithLastWeek.isIncrease
                        ? colors.error
                        : colors.success,
                    }}
                  >
                    {report.comparisonWithLastWeek.isIncrease ? "+" : "-"}
                    {report.comparisonWithLastWeek.percentageChange.toFixed(1)}%
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.muted }}
                  >
                    ₹{report.comparisonWithLastWeek.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        <View className="px-6">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.foreground }}
          >
            Spending by Category
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            {Object.entries(report.byCategory)
              .sort(([, a], [, b]) => b.amount - a.amount)
              .map(([categoryId, category], index) => (
                <View
                  key={categoryId}
                  className="px-4 py-3 flex-row items-center justify-between"
                  style={{
                    borderBottomWidth: index < Object.keys(report.byCategory).length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">{category.icon}</Text>
                    <View className="flex-1">
                      <Text
                        className="font-semibold"
                        style={{ color: colors.foreground }}
                      >
                        {category.name}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.muted }}
                      >
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="font-bold"
                    style={{ color: colors.foreground }}
                  >
                    ₹{category.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
