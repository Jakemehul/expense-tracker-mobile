import React, { useMemo } from "react";
import { View, Text } from "react-native";

interface TodaysSpendWidgetProps {
  transactions: Array<{
    id: string;
    type: "income" | "expense";
    amount: number;
    date: Date;
  }>;
}

export function TodaysSpendWidget({ transactions }: TodaysSpendWidgetProps) {
  const todaysSpend = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime() && t.type === "expense";
    });

    return todaysTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-2xl p-6 border border-red-500/30 items-center justify-center">
      <Text className="text-sm font-semibold text-muted mb-2">Today's Spend</Text>
      <Text className="text-4xl font-bold text-error">
        {formatCurrency(todaysSpend)}
      </Text>
    </View>
  );
}
