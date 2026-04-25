import { ScrollView, Text, View, TouchableOpacity, FlatList, Pressable } from "react-native";
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
      <View className="bg-surface rounded-2xl p-4 border border-border">
        <Text className="text-muted text-center text-sm">All budgets are on track ✓</Text>
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
  const { transactions, isLoading } = useTransactions();
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
          <View className="bg-primary rounded-2xl p-6">
            <Text className="text-sm text-white opacity-80 mb-2">Total Balance</Text>
            <Text className="text-3xl font-bold text-white">
              {formatCurrency(stats.netBalance)}
            </Text>
          </View>

          {/* Income & Expense Row */}
          <View className="flex-row gap-3">
            {/* Income Card */}
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Income</Text>
              <Text className="text-xl font-bold" style={{ color: "#22C55E" }}>
                {formatCurrency(stats.totalIncome)}
              </Text>
            </View>

            {/* Expense Card */}
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Expense</Text>
              <Text className="text-xl font-bold" style={{ color: "#EF4444" }}>
                {formatCurrency(stats.totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Warnings Section */}
        {budgets.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-foreground">Budget Status</Text>
              <Pressable onPress={() => router.push("../budget-settings")}>
                <Text className="text-sm text-primary font-medium">Manage</Text>
              </Pressable>
            </View>

            <BudgetWarnings />
          </View>
        )}

        {/* Recent Transactions Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
            <Pressable onPress={() => router.push("/transactions")}>
              <Text className="text-sm text-primary font-medium">View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="bg-surface rounded-2xl p-4">
              <Text className="text-muted text-center">Loading...</Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-muted text-center mb-2">No transactions yet</Text>
              <Text className="text-xs text-muted text-center">
                Tap the + button to add your first transaction
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={recentTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {}}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View className="bg-surface rounded-xl p-3 mb-2 flex-row items-center justify-between border border-border">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">{item.category}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">
                          {item.description || "Transaction"}
                        </Text>
                        <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: item.type === "income" ? "#22C55E" : "#EF4444",
                      }}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>

        {/* Quick Add Button Info */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-xs text-muted text-center">
            Tap the + button below to add a new transaction
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("../add-transaction")}
        style={{
          position: "absolute",
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Text className="text-2xl text-white font-bold">+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
