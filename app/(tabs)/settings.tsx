import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExportService } from "@/lib/export-service";

export default function SettingsScreen() {
  const router = useRouter();
  const { transactions, categories } = useTransactions();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportTransactionsCsv = async () => {
    try {
      await ExportService.exportTransactionsCsv(transactions);
      Alert.alert("Success", "Transactions exported as CSV");
      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to export transactions");
    }
  };

  const handleExportCategorySpendingCsv = async () => {
    try {
      await ExportService.exportCategorySpendingCsv(transactions, categories);
      Alert.alert("Success", "Category spending exported as CSV");
      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to export category spending");
    }
  };

  const handleExportSummaryReportCsv = async () => {
    try {
      await ExportService.exportSummaryReportCsv(transactions);
      Alert.alert("Success", "Summary report exported as CSV");
      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to export summary report");
    }
  };

  const handleExportTransactionsPdf = async () => {
    try {
      await ExportService.exportTransactionsPdf(transactions);
      Alert.alert("Success", "Transactions exported as PDF");
      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to export transactions PDF");
    }
  };

  const handleExportCategorySpendingPdf = async () => {
    try {
      await ExportService.exportCategorySpendingPdf(transactions, categories);
      Alert.alert("Success", "Category spending exported as PDF");
      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to export category spending PDF");
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

        {/* Budget Management Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">Budget Management</Text>
          <TouchableOpacity
            onPress={() => router.push("../budget-settings")}
            className="bg-primary rounded-lg p-4 mb-2 active:opacity-80"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">💰 Set Budgets</Text>
              <Text className="text-white">→</Text>
            </View>
            <Text className="text-white text-xs mt-1 opacity-80">
              Set monthly spending limits by category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase">Data Management</Text>

          {/* Export Button */}
          <TouchableOpacity
            onPress={() => setShowExportModal(true)}
            className="bg-primary rounded-lg p-4 mb-2 active:opacity-80"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">📊 Export Data</Text>
              <Text className="text-white">→</Text>
            </View>
            <Text className="text-white text-xs mt-1 opacity-80">
              Export as CSV or PDF
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

      {/* Export Options Modal */}
      <Modal visible={showExportModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Export Options</Text>
              <Pressable onPress={() => setShowExportModal(false)}>
                <Text className="text-2xl text-muted">✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* CSV Exports */}
              <Text className="text-sm font-semibold text-muted mb-3 uppercase">CSV Exports</Text>

              <TouchableOpacity
                onPress={handleExportTransactionsCsv}
                className="bg-surface border border-border rounded-lg p-4 mb-3 active:opacity-80"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📋 All Transactions</Text>
                    <Text className="text-xs text-muted mt-1">Export {transactions.length} transactions</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportCategorySpendingCsv}
                className="bg-surface border border-border rounded-lg p-4 mb-3 active:opacity-80"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📊 Category Spending</Text>
                    <Text className="text-xs text-muted mt-1">Breakdown by category</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportSummaryReportCsv}
                className="bg-surface border border-border rounded-lg p-4 mb-6 active:opacity-80"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📈 Summary Report</Text>
                    <Text className="text-xs text-muted mt-1">Income, expense and balance</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              {/* PDF Exports */}
              <Text className="text-sm font-semibold text-muted mb-3 uppercase">PDF Exports</Text>

              <TouchableOpacity
                onPress={handleExportTransactionsPdf}
                className="bg-surface border border-border rounded-lg p-4 mb-3 active:opacity-80"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📄 All Transactions</Text>
                    <Text className="text-xs text-muted mt-1">Formatted PDF report</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportCategorySpendingPdf}
                className="bg-surface border border-border rounded-lg p-4 mb-3 active:opacity-80"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📑 Category Spending</Text>
                    <Text className="text-xs text-muted mt-1">Visual breakdown report</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowExportModal(false)}
                className="bg-surface border border-border rounded-lg p-4 active:opacity-80"
                activeOpacity={0.8}
              >
                <Text className="text-foreground font-semibold text-center">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
