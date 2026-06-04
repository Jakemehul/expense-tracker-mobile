import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { CategoryBadge } from "@/components/category-badge";
import { formatCategoryName } from "@/lib/types";
import { useState, useMemo } from "react";

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, deleteTransaction, categories } = useTransactions();
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== "all" && t.type !== filterType) return false;
        if (searchText && !t.description.toLowerCase().includes(searchText.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchText, filterType]);

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
      year: "numeric",
    }).format(new Date(date));
  };

  const handleEdit = (transactionId: string) => {
    router.push({
      pathname: "/edit-transaction",
      params: { id: transactionId },
    });
  };

  const handleDelete = (transactionId: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert("Success", "Transaction deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Transactions</Text>
          <Text className="text-sm text-muted mt-1">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            placeholder="🔍 Search transactions..."
            value={searchText}
            onChangeText={setSearchText}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            placeholderTextColor="#9BA1A6"
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-6">
          {[
            { label: "All", value: "all" as const },
            { label: "Income", value: "income" as const, color: "#22C55E" },
            { label: "Expense", value: "expense" as const, color: "#EF4444" },
          ].map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => setFilterType(filter.value)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={`px-4 py-2 rounded-full border ${
                  filterType === filter.value
                    ? "border-transparent"
                    : "bg-surface border-border"
                }`}
                style={{
                  backgroundColor:
                    filterType === filter.value
                      ? filter.color || "#0a7ea4"
                      : undefined,
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    filterType === filter.value ? "text-white" : "text-foreground"
                  }`}
                >
                  {filter.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-surface rounded-2xl p-8 items-center justify-center">
            <Text className="text-4xl mb-3">📭</Text>
            <Text className="text-foreground font-semibold text-center mb-1">
              No transactions found
            </Text>
            <Text className="text-xs text-muted text-center">
              {searchText
                ? "Try a different search term"
                : "Add your first transaction to get started"}
            </Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const categoryInfo = getCategoryInfo(item.category);
              const isIncome = item.type === "income";

              return (
                <View className="mb-3">
                  <View
                    className="bg-surface rounded-2xl p-4 border border-border overflow-hidden"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: isIncome ? "#22C55E" : "#EF4444",
                    }}
                  >
                    {/* Compact Header: Category, Amount, and Menu */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 gap-3">
                        {categoryInfo && (
                          <View
                            className="w-12 h-12 rounded-lg items-center justify-center shadow-sm relative"
                            style={{
                              backgroundColor: categoryInfo.color + "25",
                            }}
                          >
                            <Text className="text-2xl">{categoryInfo.icon}</Text>
                            {item.photoUri && (
                              <View className="absolute -top-1 -right-1 bg-primary rounded-full w-4 h-4 items-center justify-center">
                                <Text className="text-xs">📷</Text>
                              </View>
                            )}
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-foreground">
                            {formatCategoryName(item.category)}
                          </Text>
                          <Text
                            className="text-xs text-muted mt-0.5"
                            numberOfLines={1}
                          >
                            {item.description || "No notes"}
                          </Text>
                        </View>
                      </View>

                      {/* Amount and Menu */}
                      <View className="items-end gap-2 ml-2">
                        <Text
                          className="text-lg font-bold"
                          style={{
                            color: isIncome ? "#22C55E" : "#EF4444",
                          }}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </Text>
                        <Pressable
                          onPress={() => setMenuVisible(menuVisible === item.id ? null : item.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <Text className="text-lg">⋯</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Date below notes */}
                    <Text className="text-xs text-muted mt-2">{formatDate(item.date)}</Text>

                    {/* Menu Popup */}
                    {menuVisible === item.id && (
                      <View className="mt-3 pt-3 border-t border-border flex-row gap-2">
                        <Pressable
                          onPress={() => {
                            handleEdit(item.id);
                            setMenuVisible(null);
                          }}
                          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                          className="flex-1"
                        >
                          <View className="bg-primary/10 border border-primary rounded-lg py-2 items-center">
                            <Text className="text-primary font-semibold text-xs">✏️ Edit</Text>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            handleDelete(item.id);
                            setMenuVisible(null);
                          }}
                          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                          className="flex-1"
                        >
                          <View className="bg-error/10 border border-error rounded-lg py-2 items-center">
                            <Text className="text-error font-semibold text-xs">🗑️ Delete</Text>
                          </View>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
