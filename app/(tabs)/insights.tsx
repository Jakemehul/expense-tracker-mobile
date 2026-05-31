import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useTransactions } from '@/lib/transaction-context';
import { generateSpendingInsights, getWeeklyCategorySummary } from '@/lib/insights-service';
import { DEFAULT_CATEGORIES } from '@/lib/types';
import { useColors } from '@/hooks/use-colors';

export default function InsightsScreen() {
  const { transactions } = useTransactions();
  const colors = useColors();

  // Build category icons and colors maps
  const categoryIcons: Record<string, string> = {};
  const categoryColors: Record<string, string> = {};

  DEFAULT_CATEGORIES.forEach((cat) => {
    categoryIcons[cat.name] = cat.icon;
    categoryColors[cat.name] = cat.color;
  });

  const insights = generateSpendingInsights(transactions);
  const weeklySummary = getWeeklyCategorySummary(transactions, categoryIcons, categoryColors);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">📊 Insights</Text>
            <Text className="text-sm text-muted">Smart spending analysis & patterns</Text>
          </View>

          {/* Spending Insights Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">💡 Spending Insights</Text>

            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <View
                  key={idx}
                  className="bg-surface rounded-xl p-4 border border-border"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor:
                      insight.type === 'increase' ? '#EF4444' : insight.type === 'decrease' ? '#22C55E' : '#F59E0B',
                  }}
                >
                  <Text className="text-sm text-foreground leading-relaxed">{insight.message}</Text>
                  <View className="flex-row gap-2 mt-2">
                    <View className="flex-1 bg-background rounded-lg p-2">
                      <Text className="text-xs text-muted">Current</Text>
                      <Text className="text-sm font-semibold text-foreground">₹{insight.currentAmount.toFixed(2)}</Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-2">
                      <Text className="text-xs text-muted">Previous</Text>
                      <Text className="text-sm font-semibold text-foreground">₹{insight.previousAmount.toFixed(2)}</Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-2">
                      <Text className="text-xs text-muted">Change</Text>
                      <Text
                        className={`text-sm font-semibold ${
                          insight.percentageChange > 0 ? 'text-error' : 'text-success'
                        }`}
                      >
                        {insight.percentageChange > 0 ? '+' : ''}
                        {insight.percentageChange.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-surface rounded-xl p-4 items-center">
                <Text className="text-muted">No significant spending changes this week</Text>
              </View>
            )}
          </View>

          {/* Weekly Category Summary */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">📈 Weekly Category Summary</Text>

            {weeklySummary.length > 0 ? (
              weeklySummary.map((category, idx) => {
                const percentageOfTotal =
                  weeklySummary.reduce((sum, c) => sum + c.weeklyTotal, 0) > 0
                    ? (category.weeklyTotal / weeklySummary.reduce((sum, c) => sum + c.weeklyTotal, 0)) * 100
                    : 0;

                return (
                  <View key={idx} className="bg-surface rounded-xl p-4 border border-border overflow-hidden">
                    {/* Category Header */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-2xl">{category.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">{category.category}</Text>
                          <Text className="text-xs text-muted">{category.transactionCount} transactions</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-foreground">₹{category.weeklyTotal.toFixed(2)}</Text>
                        <Text
                          className={`text-xs font-semibold ${
                            category.percentageChange > 0 ? 'text-error' : 'text-success'
                          }`}
                        >
                          {category.percentageChange > 0 ? '↑' : '↓'} {Math.abs(category.percentageChange).toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="bg-background rounded-full h-2 overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentageOfTotal}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-2 mt-3">
                      <View className="flex-1 bg-background rounded-lg p-2">
                        <Text className="text-xs text-muted">This Week</Text>
                        <Text className="text-sm font-semibold text-foreground">₹{category.weeklyTotal.toFixed(2)}</Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-2">
                        <Text className="text-xs text-muted">Last Week</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          ₹{category.previousWeekTotal.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-2">
                        <Text className="text-xs text-muted">% of Total</Text>
                        <Text className="text-sm font-semibold text-foreground">{percentageOfTotal.toFixed(0)}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="bg-surface rounded-xl p-4 items-center">
                <Text className="text-muted">No expenses this week</Text>
              </View>
            )}
          </View>

          {/* Empty State */}
          {insights.length === 0 && weeklySummary.length === 0 && (
            <View className="bg-surface rounded-xl p-6 items-center gap-2">
              <Text className="text-2xl">📊</Text>
              <Text className="text-foreground font-semibold">No Data Yet</Text>
              <Text className="text-sm text-muted text-center">
                Add some transactions to see spending insights and patterns!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
