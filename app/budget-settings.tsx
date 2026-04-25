import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useBudgets } from "@/lib/budget-context";
import { useTransactions } from "@/lib/transaction-context";
import { useState } from "react";

export default function BudgetSettingsScreen() {
  const router = useRouter();
  const { budgets, addBudget, updateBudget, deleteBudget, getBudgetForCategory } = useBudgets();
  const { categories } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both");

  const handleAddBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      Alert.alert("Error", "Please select a category and enter a budget amount");
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid budget amount");
      return;
    }

    try {
      if (editingBudgetId) {
        await updateBudget(editingBudgetId, amount);
        Alert.alert("Success", "Budget updated");
      } else {
        await addBudget(selectedCategory, amount);
        Alert.alert("Success", "Budget added");
      }
      setShowAddModal(false);
      setSelectedCategory("");
      setBudgetAmount("");
      setEditingBudgetId(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save budget");
    }
  };

  const handleEditBudget = (categoryId: string) => {
    const budget = getBudgetForCategory(categoryId);
    if (budget) {
      setEditingBudgetId(budget.id);
      setSelectedCategory(categoryId);
      setBudgetAmount(budget.limit.toString());
      setShowAddModal(true);
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert("Delete Budget", "Are you sure you want to delete this budget?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudget(budgetId);
            Alert.alert("Success", "Budget deleted");
          } catch (error) {
            Alert.alert("Error", "Failed to delete budget");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Budget Settings</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-lg text-muted">✕</Text>
          </Pressable>
        </View>

        {/* Add Budget Button */}
        <TouchableOpacity
          onPress={() => {
            setEditingBudgetId(null);
            setSelectedCategory("");
            setBudgetAmount("");
            setShowAddModal(true);
          }}
          className="bg-primary rounded-lg p-4 mb-6 active:opacity-80"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-center">+ Add New Budget</Text>
        </TouchableOpacity>

        {/* Budgets List */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">Your Budgets</Text>

          {budgets.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">No budgets set yet</Text>
              <Text className="text-xs text-muted text-center mt-2">
                Add a budget to track your spending limits
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={budgets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const category = categories.find((c) => c.id === item.categoryId);
                return (
                  <View className="bg-surface rounded-xl p-4 mb-2 border border-border">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-2xl">{category?.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {category?.name}
                          </Text>
                          <Text className="text-xs text-muted">
                            Monthly limit: {formatCurrency(item.limit)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleEditBudget(item.categoryId)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Text className="text-primary font-semibold">Edit</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteBudget(item.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Text className="text-error font-semibold">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Budget Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">
                {editingBudgetId ? "Edit Budget" : "Add Budget"}
              </Text>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setEditingBudgetId(null);
                }}
              >
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Category Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="bg-surface border border-border rounded-lg px-4 py-3">
                    {selectedCategory ? (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg">
                          {categories.find((c) => c.id === selectedCategory)?.icon}
                        </Text>
                        <Text className="text-foreground font-medium">
                          {categories.find((c) => c.id === selectedCategory)?.name}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-muted">Select a category</Text>
                    )}
                  </View>
                </Pressable>

                {/* Category Picker */}
                <View className="mt-3 gap-2">
                  {expenseCategories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View
                        className={`flex-row items-center gap-2 p-3 rounded-lg border ${
                          selectedCategory === category.id
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                      >
                        <Text className="text-lg">{category.icon}</Text>
                        <Text
                          className={`font-medium ${
                            selectedCategory === category.id
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          {category.name}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Budget Amount Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-foreground mb-2">
                  Monthly Budget Limit (₹)
                </Text>
                <TextInput
                  placeholder="0.00"
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  keyboardType="decimal-pad"
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-lg"
                  placeholderTextColor="#9BA1A6"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleAddBudget}
                className="bg-primary py-4 rounded-lg items-center mb-3"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">
                  {editingBudgetId ? "Update Budget" : "Add Budget"}
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingBudgetId(null);
                }}
                className="bg-surface border border-border py-4 rounded-lg items-center"
                activeOpacity={0.8}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
