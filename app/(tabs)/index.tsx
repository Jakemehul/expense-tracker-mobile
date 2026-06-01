import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useBudgets } from "@/lib/budget-context";
import { BudgetStatusCard } from "@/components/budget-status-card";
import { useColors } from "@/hooks/use-colors";
import { useMemo, useState } from "react";
import { WeeklyAlertBanner } from "@/components/weekly-alert-banner";
import { useWeeklyAlert } from "@/hooks/use-weekly-alert";
import {
  shouldAlertWeeklyBudget,
  recordWeeklyAlert,
} from "@/lib/weekly-alert-service";
import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SettingsModal } from "@/components/settings-modal";
import { WeeklyReport } from "@/components/weekly-report";
import { generateWeeklyReport } from "@/lib/weekly-report-service";

function BudgetWarnings() {
  const { getBudgetStatus } = useBudgets();
  const now = new Date();

  const budgetStatuses = useMemo(() => {
    return getBudgetStatus(now.getFullYear(), now.getMonth()).filter(
      (b) => b.status !== "safe"
    );
  }, [getBudgetStatus, now]);

  if (budgetStatuses.length === 0) {
    return (
      <View className="bg-success rounded-2xl p-5">
        <View className="flex-row items-center justify-center gap-3">
          <Text className="text-3xl">✅</Text>
          <Text className="text-white font-bold text-lg">
            All budgets on track!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {budgetStatuses.map((status) => (
        <BudgetStatusCard key={status.categoryId} status={status} compact={true} />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, isLoading, categories } = useTransactions();
  const { budgets } = useBudgets();
  const colors = useColors();
  const weeklyAlert = useWeeklyAlert();
  const [showWeeklyAlert, setShowWeeklyAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  // Get current month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Check if weekly alert should be shown
  useEffect(() => {
    const checkWeeklyAlert = async () => {
      if (weeklyAlert.shouldAlert && weeklyAlert.weeklyBudget > 0) {
        const shouldShow = await shouldAlertWeeklyBudget(
          weeklyAlert.weeklySpent,
          weeklyAlert.weeklyBudget
        );
        if (shouldShow) {
          setShowWeeklyAlert(true);
          await recordWeeklyAlert(
            weeklyAlert.weeklySpent,
            weeklyAlert.weeklyBudget
          );
        }
      }
    };

    checkWeeklyAlert();
  }, [weeklyAlert]);

  const stats = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth
      );
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions, currentMonth, currentYear]);

  const recentTransactions = useMemo(() => {
    return transactions.slice().reverse().slice(0, 5);
  }, [transactions]);

  const weeklyReport = useMemo(() => {
    return generateWeeklyReport(transactions, categories, transactions);
  }, [transactions, categories]);

  const handleViewBudget = () => {
    setShowWeeklyAlert(false);
    router.push("/(tabs)/budgets");
  };

  return (
    <>
      {/* Weekly Alert Banner */}
      <WeeklyAlertBanner
        visible={showWeeklyAlert}
        weeklySpent={weeklyAlert.weeklySpent}
        weeklyBudget={weeklyAlert.weeklyBudget}
        onDismiss={() => setShowWeeklyAlert(false)}
        onViewBudget={handleViewBudget}
      />

      {/* Settings Modal */}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />

      {/* Weekly Report Modal */}
      {showWeeklyReport && (
        <WeeklyReport
          report={weeklyReport}
          onClose={() => setShowWeeklyReport(false)}
        />
      )}

      <ScreenContainer className="p-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header with Settings Button */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.foreground }}
              >
                Expense Tracker
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.muted }}
              >
                {now.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons
                name="settings"
                size={24}
                color={colors.foreground}
              />
            </TouchableOpacity>
          </View>

          {/* Weekly Report Button */}
          <TouchableOpacity
            onPress={() => setShowWeeklyReport(true)}
            className="rounded-2xl p-4 mb-6 flex-row items-center justify-between"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <MaterialIcons
                name="assessment"
                size={24}
                color={colors.background}
              />
              <View className="flex-1">
                <Text
                  className="font-semibold"
                  style={{ color: colors.background }}
                >
                  Weekly Report
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.background, opacity: 0.8 }}
                >
                  View spending breakdown
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.background}
            />
          </TouchableOpacity>

          {/* Balance Card */}
          <View
            className="rounded-3xl p-6 mb-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: colors.background, opacity: 0.9 }}
            >
              Total Balance
            </Text>
            <Text
              className="text-4xl font-bold"
              style={{ color: colors.background }}
            >
              ₹{stats.balance.toFixed(2)}
            </Text>
          </View>

          {/* Income & Expense Cards */}
          <View className="flex-row gap-4 mb-6">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: colors.muted }}
              >
                💰 Income
              </Text>
              <Text
                className="text-2xl font-bold text-success"
              >
                ₹{stats.totalIncome.toFixed(2)}
              </Text>
            </View>

            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: colors.muted }}
              >
                💸 Expense
              </Text>
              <Text
                className="text-2xl font-bold text-error"
              >
                ₹{stats.totalExpense.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Budget Warnings */}
          <View className="mb-6">
            <BudgetWarnings />
          </View>

          {/* Recent Transactions */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.foreground }}
              >
                📊 Recent Transactions
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <Text
                className="text-center py-8"
                style={{ color: colors.muted }}
              >
                Loading...
              </Text>
            ) : recentTransactions.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-2">📭</Text>
                <Text
                  className="text-center"
                  style={{ color: colors.muted }}
                >
                  No transactions yet
                </Text>
                <Text
                  className="text-center text-xs mt-1"
                  style={{ color: colors.muted }}
                >
                  Tap the + button to add your first transaction
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={recentTransactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const category = categories.find((c) => c.id === item.category);
                  const isIncome = item.type === "income";

                  return (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/transactions",
                          params: { id: item.id },
                        })
                      }
                      className="flex-row items-center justify-between py-3 px-4 rounded-xl mb-2"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <View className="flex-row items-center flex-1 gap-3">
                        <Text className="text-2xl">{category?.icon || "📌"}</Text>
                        <View className="flex-1">
                          <Text
                            className="font-semibold"
                            style={{ color: colors.foreground }}
                          >
                            {category?.name || "Unknown"}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: colors.muted }}
                          >
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="font-bold text-lg"
                        style={{
                          color: isIncome ? colors.success : colors.error,
                        }}
                      >
                        {isIncome ? "+" : "-"}₹{item.amount.toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
