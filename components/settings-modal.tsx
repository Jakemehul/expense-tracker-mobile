import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import {
  getReminderSettings,
  updateReminderSettings,
  formatReminderTime,
  createTimeString,
} from "@/lib/daily-reminder-service";

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Settings modal with daily reminder configuration
 */
export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const colors = useColors();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const settings = await getReminderSettings();
      setReminderEnabled(settings.enabled);
      setReminderTime(settings.time);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReminderToggle = async (value: boolean) => {
    setReminderEnabled(value);
    await updateReminderSettings({ enabled: value });
  };

  const handleTimeChange = (direction: "up" | "down") => {
    const [hours, minutes] = reminderTime.split(":").map(Number);
    let newHours = hours;
    let newMinutes = minutes;

    if (direction === "up") {
      newMinutes += 15;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours += 1;
        if (newHours >= 24) newHours = 0;
      }
    } else {
      newMinutes -= 15;
      if (newMinutes < 0) {
        newMinutes = 45;
        newHours -= 1;
        if (newHours < 0) newHours = 23;
      }
    }

    const newTime = createTimeString(newHours, newMinutes);
    setReminderTime(newTime);
    await updateReminderSettings({ time: newTime });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-6 py-4"
          style={{
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            className="text-xl font-bold"
            style={{ color: colors.foreground }}
          >
            Settings
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Reminder Section */}
          <View className="px-6 pt-6">
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.foreground }}
            >
              Daily Reminder
            </Text>

            <View
              className="rounded-2xl p-4 gap-4"
              style={{ backgroundColor: colors.surface }}
            >
              {/* Enable Toggle */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <MaterialIcons
                    name="notifications-active"
                    size={24}
                    color={colors.primary}
                  />
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{ color: colors.foreground }}
                    >
                      Daily Spending Reminder
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.muted }}
                    >
                      Get reminded to log your daily spending
                    </Text>
                  </View>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={handleReminderToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>

              {/* Time Picker */}
              {reminderEnabled && (
                <View className="gap-3">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.muted }}
                  >
                    Reminder Time
                  </Text>

                  <View className="flex-row items-center justify-center gap-4">
                    {/* Decrease Button */}
                    <TouchableOpacity
                      onPress={() => handleTimeChange("down")}
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.border }}
                    >
                      <MaterialIcons
                        name="remove"
                        size={24}
                        color={colors.foreground}
                      />
                    </TouchableOpacity>

                    {/* Time Display */}
                    <View
                      className="flex-1 rounded-xl py-3 items-center"
                      style={{ backgroundColor: colors.background }}
                    >
                      <Text
                        className="text-3xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {formatReminderTime(reminderTime)}
                      </Text>
                    </View>

                    {/* Increase Button */}
                    <TouchableOpacity
                      onPress={() => handleTimeChange("up")}
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.border }}
                    >
                      <MaterialIcons
                        name="add"
                        size={24}
                        color={colors.foreground}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text
                    className="text-xs text-center"
                    style={{ color: colors.muted }}
                  >
                    You'll receive a reminder at {formatReminderTime(reminderTime)} every day
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* About Section */}
          <View className="px-6 pt-6">
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.foreground }}
            >
              About
            </Text>

            <View
              className="rounded-2xl p-4 gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="font-semibold"
                  style={{ color: colors.foreground }}
                >
                  App Version
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  1.0.21
                </Text>
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />

              <View className="flex-row items-center justify-between">
                <Text
                  className="font-semibold"
                  style={{ color: colors.foreground }}
                >
                  Last Updated
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
