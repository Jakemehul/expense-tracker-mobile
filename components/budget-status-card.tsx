import { View, Text } from "react-native";
import { BudgetStatus } from "@/lib/types";

interface BudgetStatusCardProps {
  status: BudgetStatus;
  compact?: boolean;
}

export function BudgetStatusCard({ status, compact = false }: BudgetStatusCardProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case "safe":
        return "#22C55E"; // Green
      case "warning":
        return "#FFE66D"; // Yellow
      case "critical":
        return "#FF8B94"; // Orange-Red
      case "exceeded":
        return "#EF4444"; // Red
    }
  };

  const getStatusLabel = () => {
    switch (status.status) {
      case "safe":
        return "On Track";
      case "warning":
        return "Caution";
      case "critical":
        return "Alert";
      case "exceeded":
        return "Over Budget";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const statusColor = getStatusColor();

  if (compact) {
    return (
      <View className="bg-surface rounded-lg p-3 border border-border mb-2">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-lg">{status.categoryIcon}</Text>
            <Text className="text-sm font-medium text-foreground flex-1">
              {status.categoryName}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: statusColor,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text className="text-xs font-semibold text-white">{getStatusLabel()}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-border rounded-full overflow-hidden mb-2">
          <View
            style={{
              height: "100%",
              width: `${Math.min(status.percentage, 100)}%`,
              backgroundColor: statusColor,
            }}
          />
        </View>

        {/* Stats */}
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">
            {formatCurrency(status.spent)} of {formatCurrency(status.limit)}
          </Text>
          <Text className="text-xs text-muted">{status.percentage.toFixed(0)}%</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface rounded-xl p-4 border border-border mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-2xl">{status.categoryIcon}</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">{status.categoryName}</Text>
            <Text className="text-xs text-muted">Monthly Budget</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: statusColor,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text className="text-xs font-bold text-white">{getStatusLabel()}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-3">
        <View className="h-3 bg-border rounded-full overflow-hidden">
          <View
            style={{
              height: "100%",
              width: `${Math.min(status.percentage, 100)}%`,
              backgroundColor: statusColor,
            }}
          />
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-2">
        <View>
          <Text className="text-xs text-muted mb-1">Spent</Text>
          <Text className="text-lg font-bold text-foreground">
            {formatCurrency(status.spent)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted mb-1">Limit</Text>
          <Text className="text-lg font-bold text-foreground">
            {formatCurrency(status.limit)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted mb-1">Remaining</Text>
          <Text
            className="text-lg font-bold"
            style={{
              color: status.remaining >= 0 ? "#22C55E" : "#EF4444",
            }}
          >
            {formatCurrency(Math.abs(status.remaining))}
          </Text>
        </View>
      </View>

      {/* Warning Message */}
      {status.status !== "safe" && (
        <View
          style={{
            backgroundColor: statusColor,
            opacity: 0.1,
          }}
          className="rounded-lg p-2 mt-2"
        >
          <Text
            style={{
              color: statusColor,
            }}
            className="text-xs font-medium"
          >
            {status.status === "warning" &&
              `You've spent ${status.percentage.toFixed(0)}% of your budget. Be mindful of your spending.`}
            {status.status === "critical" &&
              `You're approaching your budget limit! ${status.percentage.toFixed(0)}% spent.`}
            {status.status === "exceeded" &&
              `You've exceeded your budget by ${formatCurrency(status.spent - status.limit)}.`}
          </Text>
        </View>
      )}
    </View>
  );
}
