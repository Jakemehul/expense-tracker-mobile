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
import { useMemo } from "react";

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
      <View className="bg-success/10 rounded-2xl p-4 border border-success/30">
        <Text className="text-success text-center text-sm font-medium">
          ✓ All budgets are on track
        </Text>
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

  // Get current month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
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
      netBalance: totalIncome - totalExpense,
    };
  }, [transactions, currentMonth, currentYear]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const getCategoryInfo = (categoryName: string) => {
    return categories.find((c) => c.name === categoryName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Expense Tracker</Text>
          <Text className="text-sm text-muted mt-1">
            {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(now)}
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="gap-3 mb-6">
          {/* Total Balance Card */}
          <View className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-6 shadow-lg">
            <Text className="text-sm text-white/80 mb-2 font-medium">Total Balance</Text>
            <Text className="text-4xl font-bold text-white">
              {formatCurrency(stats.netBalance)}
            </Text>
            <View className="mt-4 flex-row gap-4">
              <View>
                <Text className="text-xs text-white/70">Income</Text>
                <Text className="text-lg font-semibold text-white">
                  {formatCurrency(stats.totalIncome)}
                </Text>
              </View>
              <View className="w-px bg-white/20" />
              <View>
                <Text className="text-xs text-white/70">Expense</Text>
                <Text className="text-lg font-semibold text-white">
                  {formatCurrency(stats.totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Budget Warnings Section */}
        {budgets.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-foreground">💰 Budget Status</Text>
              <Pressable onPress={() => router.push("../budget-settings")}>
                <Text className="text-sm text-primary font-semibold">Manage</Text>
              </Pressable>
            </View>

            <BudgetWarnings />
          </View>
        )}

        {/* Recent Transactions Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-foreground">📊 Recent Transactions</Text>
            <Pressable onPress={() => router.push("/transactions")}>
              <Text className="text-sm text-primary font-semibold">View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="bg-surface rounded-2xl p-4">
              <Text className="text-muted text-center">Loading...</Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-4xl mb-2">📭</Text>
              <Text className="text-foreground font-semibold text-center mb-1">
                No transactions yet
              </Text>
              <Text className="text-xs text-muted text-center">
                Tap the + button to add your first transaction
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={recentTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const categoryInfo = getCategoryInfo(item.category);
                const isIncome = item.type === "income";

                return (
                  <Pressable
                    onPress={() => {}}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className="bg-surface rounded-2xl p-3 mb-2 flex-row items-center justify-between border border-border"
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: isIncome ? "#22C55E" : "#EF4444",
                      }}
                    >
                      <View className="flex-row items-center flex-1 gap-3">
                        {categoryInfo && (
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: categoryInfo.color + "20",
                            }}
                          >
                            <Text className="text-lg">{categoryInfo.icon}</Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {item.description || "Transaction"}
                          </Text>
                          <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
                        </View>
                      </View>
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isIncome ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("../add-transaction")}
        style={{
          position: "absolute",
          bottom: 80,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Text className="text-3xl text-white font-bold">+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
