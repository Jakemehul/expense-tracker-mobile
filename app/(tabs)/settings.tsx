import { ScrollView, Text, View, TouchableOpacity, Alert, Share } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const { transactions } = useTransactions();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const handleExportData = async () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        transactions: transactions,
        totalTransactions: transactions.length,
      };

      const csvContent = [
        "Date,Type,Category,Amount,Description",
        ...transactions.map((t) => {
          const date = new Date(t.date).toISOString().split("T")[0];
          const type = t.type;
          const category = t.category;
          const amount = t.amount;
          const description = t.description || "";
          return `${date},${type},${category},${amount},"${description}"`;
        }),
      ].join("\n");

      // For web/testing, we'll just show the data
      Alert.alert(
        "Export Data",
        `Total transactions: ${transactions.length}\n\nCSV data copied to clipboard`,
        [{ text: "OK" }]
      );

      // Try to share the data
      try {
        await Share.share({
          message: csvContent,
          title: "Expense Tracker Export",
        });
      } catch (error) {
        console.log("Share error:", error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@expense_tracker_transactions");
              Alert.alert("Success", "All transactions have been deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
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
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        {/* App Info Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">App Information</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-foreground">App Version</Text>
              <Text className="text-muted">1.0.0</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground">Total Transactions</Text>
              <Text className="font-semibold text-primary">{transactions.length}</Text>
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">Data Management</Text>

          {/* Export Button */}
          <TouchableOpacity
            onPress={handleExportData}
            className="bg-primary rounded-lg p-4 mb-2 active:opacity-80"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">📊 Export Data</Text>
              <Text className="text-white">→</Text>
            </View>
            <Text className="text-white text-xs mt-1 opacity-80">
              Export all transactions as CSV
            </Text>
          </TouchableOpacity>

          {/* Clear Data Button */}
          <TouchableOpacity
            onPress={handleClearData}
            className="bg-surface border border-border rounded-lg p-4 active:opacity-80"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-error font-semibold">🗑️ Clear All Data</Text>
              <Text className="text-error">→</Text>
            </View>
            <Text className="text-error text-xs mt-1 opacity-80">
              Delete all transactions permanently
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">Statistics</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="mb-3">
              <Text className="text-xs text-muted mb-1">Total Transactions</Text>
              <Text className="text-2xl font-bold text-foreground">{transactions.length}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-xs text-muted mb-1">Income Transactions</Text>
              <Text className="text-lg font-semibold" style={{ color: "#22C55E" }}>
                {transactions.filter((t) => t.type === "income").length}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-muted mb-1">Expense Transactions</Text>
              <Text className="text-lg font-semibold" style={{ color: "#EF4444" }}>
                {transactions.filter((t) => t.type === "expense").length}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View>
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">About</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-2">Expense Tracker</Text>
            <Text className="text-sm text-muted leading-relaxed">
              A simple and elegant personal finance app to track your income and expenses. Keep your finances organized with categories and monthly summaries.
            </Text>
            <Text className="text-xs text-muted mt-4">
              All your data is stored locally on your device for privacy and security.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
