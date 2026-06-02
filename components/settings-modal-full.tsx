import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import { useTransactions } from "@/lib/transaction-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExportService } from "@/lib/export-service";
import { useColors } from "@/hooks/use-colors";
import {
  getReminderSettings,
  updateReminderSettings,
  formatReminderTime,
  parseTimeString,
  createTimeString,
} from "@/lib/daily-reminder-service";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Full settings modal that slides up from bottom
 */
export function SettingsModalFull({ visible, onClose }: SettingsModalProps) {
  const router = useRouter();
  const { transactions, categories } = useTransactions();
  const colors = useColors();
  const [showExportModal, setShowExportModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Load reminder settings on mount
  useEffect(() => {
    const loadReminders = async () => {
      const settings = await getReminderSettings();
      setReminderEnabled(settings.enabled);
      setReminderTime(settings.time);
      const { hours, minutes } = parseTimeString(settings.time);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    };
    loadReminders();
  }, []);

  const handleToggleReminder = async () => {
    const newState = !reminderEnabled;
    setReminderEnabled(newState);
    if (newState) {
      await updateReminderSettings({ enabled: true, time: reminderTime });
    } else {
      await updateReminderSettings({ enabled: false });
    }
  };

  const handleSaveTime = async () => {
    const newTime = createTimeString(selectedHour, selectedMinute);
    setReminderTime(newTime);
    if (reminderEnabled) {
      await updateReminderSettings({ time: newTime });
    }
    setShowTimeModal(false);
  };

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
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-3xl p-6 max-h-[90%]"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Settings</Text>
              <Pressable onPress={onClose}>
                <Text className="text-2xl text-muted">✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* App Info Section */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                  App Information
                </Text>
                <View
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-foreground">App Version</Text>
                    <Text className="text-muted">1.0.0</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-foreground">Total Transactions</Text>
                    <Text className="font-semibold" style={{ color: colors.primary }}>
                      {transactions.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Daily Reminders Section */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                  Notifications
                </Text>
                <View
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">🔔 Daily Reminders</Text>
                      <Text className="text-xs text-muted mt-1">
                        Get reminded to log your expenses
                      </Text>
                    </View>
                    <Switch
                      value={reminderEnabled}
                      onValueChange={handleToggleReminder}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={reminderEnabled ? colors.primary : colors.muted}
                    />
                  </View>

                  {reminderEnabled && (
                    <TouchableOpacity
                      onPress={() => setShowTimeModal(true)}
                      className="rounded-lg p-3 border"
                      style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-foreground font-semibold">
                          ⏰ Reminder Time
                        </Text>
                        <Text className="text-primary font-semibold">
                          {formatReminderTime(reminderTime)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Budget Management Section */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                  Budget Management
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    router.push("../budget-settings");
                  }}
                  className="rounded-lg p-4 mb-2 active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
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
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                  Data Management
                </Text>

                {/* Export Button */}
                <TouchableOpacity
                  onPress={() => setShowExportModal(true)}
                  className="rounded-lg p-4 mb-2 active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
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
                  className="rounded-lg p-4 active:opacity-80 border"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold" style={{ color: colors.error }}>
                      🗑️ Clear All Data
                    </Text>
                    <Text style={{ color: colors.error }}>→</Text>
                  </View>
                  <Text className="text-xs mt-1 opacity-80" style={{ color: colors.error }}>
                    Delete all transactions permanently
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Statistics Section */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">
                  Statistics
                </Text>
                <View
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                >
                  <View className="mb-3">
                    <Text className="text-xs text-muted mb-1">Total Transactions</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {transactions.length}
                    </Text>
                  </View>

                  <View className="mb-3">
                    <Text className="text-xs text-muted mb-1">Income Transactions</Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.success }}>
                      {transactions.filter((t) => t.type === "income").length}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Expense Transactions</Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.error }}>
                      {transactions.filter((t) => t.type === "expense").length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* About Section */}
              <View>
                <Text className="text-sm font-semibold text-muted mb-3 uppercase">About</Text>
                <View
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                >
                  <Text className="text-foreground font-semibold mb-2">Expense Tracker</Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    A simple and elegant personal finance app to track your income and expenses.
                    Keep your finances organized with categories and monthly summaries.
                  </Text>
                  <Text className="text-xs text-muted mt-4">
                    All your data is stored locally on your device for privacy and security.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Set Reminder Time</Text>
              <Pressable onPress={() => setShowTimeModal(false)}>
                <Text className="text-2xl text-muted">✕</Text>
              </Pressable>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center justify-center gap-4 mb-6">
                <View className="items-center">
                  <Text className="text-xs text-muted mb-2">Hour</Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedHour((h) => (h === 0 ? 23 : h - 1))
                      }
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-lg font-bold text-foreground">−</Text>
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-foreground w-12 text-center">
                      {selectedHour.toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedHour((h) => (h === 23 ? 0 : h + 1))
                      }
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-lg font-bold text-foreground">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-3xl font-bold text-foreground">:</Text>

                <View className="items-center">
                  <Text className="text-xs text-muted mb-2">Minute</Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedMinute((m) => (m === 0 ? 59 : m - 1))
                      }
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-lg font-bold text-foreground">−</Text>
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-foreground w-12 text-center">
                      {selectedMinute.toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedMinute((m) => (m === 59 ? 0 : m + 1))
                      }
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-lg font-bold text-foreground">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveTime}
                className="rounded-lg p-4 active:opacity-80"
                style={{ backgroundColor: colors.primary }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  Save Time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Options Modal */}
      <Modal visible={showExportModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-3xl p-6 max-h-[90%]"
            style={{ backgroundColor: colors.background }}
          >
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
                className="rounded-lg p-4 mb-3 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">📋 All Transactions</Text>
                    <Text className="text-xs text-muted mt-1">
                      Export {transactions.length} transactions
                    </Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportCategorySpendingCsv}
                className="rounded-lg p-4 mb-3 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
                className="rounded-lg p-4 mb-6 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
                className="rounded-lg p-4 mb-3 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
                className="rounded-lg p-4 mb-3 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
                className="rounded-lg p-4 active:opacity-80 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                activeOpacity={0.8}
              >
                <Text className="text-foreground font-semibold text-center">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
