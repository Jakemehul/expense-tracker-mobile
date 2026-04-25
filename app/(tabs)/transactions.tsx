import { ScrollView, Text, View, FlatList, Pressable, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useState, useMemo } from "react";

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, deleteTransaction } = useTransactions();
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

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
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">Transactions</Text>
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            placeholder="Search transactions..."
            value={searchText}
            onChangeText={setSearchText}
            className="bg-surface border border-border rounded-lg px-4 py-2 text-foreground"
            placeholderTextColor="#9BA1A6"
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setFilterType("all")}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              className={`px-4 py-2 rounded-full border ${
                filterType === "all"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === "all" ? "text-white" : "text-foreground"
                }`}
              >
                All
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setFilterType("income")}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              className={`px-4 py-2 rounded-full border ${
                filterType === "income"
                  ? "border-green-500"
                  : "bg-surface border-border"
              }`}
              style={{
                backgroundColor: filterType === "income" ? "#22C55E" : undefined,
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === "income" ? "text-white" : "text-foreground"
                }`}
              >
                Income
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setFilterType("expense")}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              className={`px-4 py-2 rounded-full border ${
                filterType === "expense"
                  ? "border-red-500"
                  : "bg-surface border-border"
              }`}
              style={{
                backgroundColor: filterType === "expense" ? "#EF4444" : undefined,
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === "expense" ? "text-white" : "text-foreground"
                }`}
              >
                Expense
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Text className="text-muted text-center mb-2">No transactions found</Text>
            <Text className="text-xs text-muted text-center">
              {searchText ? "Try a different search term" : "Add your first transaction"}
            </Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-xl p-4 mb-2 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-3xl mr-3">{item.category}</Text>
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

                {/* Action Buttons */}
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <Pressable
                    onPress={() => handleEdit(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1"
                  >
                    <View className="bg-primary rounded-lg py-2 items-center">
                      <Text className="text-white font-semibold text-sm">Edit</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1"
                  >
                    <View className="bg-error rounded-lg py-2 items-center">
                      <Text className="text-white font-semibold text-sm">Delete</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
