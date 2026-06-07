import { ScrollView, Text, View, Pressable, Switch, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useNotifications } from "@/lib/notification-context";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { reminders, addReminder, updateReminder, deleteReminder, requestPermissions, hasPermission } =
    useNotifications();
  const colors = useColors();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    hour: 9,
    minute: 0,
    days: [1, 2, 3, 4, 5], // Monday to Friday
    message: "Time to log your expenses!",
  });

  useEffect(() => {
    // Request permissions on mount
    if (!hasPermission) {
      requestPermissions();
    }
  }, [hasPermission, requestPermissions]);

  const handleAddReminder = async () => {
    if (formData.days.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    await addReminder({
      enabled: true,
      hour: formData.hour,
      minute: formData.minute,
      days: formData.days,
      message: formData.message,
    });

    setShowAddForm(false);
    setFormData({
      hour: 9,
      minute: 0,
      days: [1, 2, 3, 4, 5],
      message: "Time to log your expenses!",
    });
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Reminders</Text>
            <Text className="text-muted text-sm mt-1">Set custom notification times</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="p-3 rounded-full bg-surface"
          >
            <Text className="text-lg">✕</Text>
          </Pressable>
        </View>

        {/* Permission Status */}
        {!hasPermission && (
          <View className="mb-6 p-4 bg-warning/10 rounded-2xl border border-warning">
            <Text className="text-warning font-semibold mb-2">Notifications Disabled</Text>
            <Text className="text-warning text-sm">Enable notifications in your device settings to receive reminders</Text>
          </View>
        )}

        {/* Active Reminders */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Active Reminders</Text>
          {reminders.length === 0 ? (
            <View className="p-6 bg-surface rounded-2xl border border-border items-center">
              <Text className="text-3xl mb-2">🔔</Text>
              <Text className="text-foreground font-semibold mb-1">No reminders yet</Text>
              <Text className="text-muted text-sm text-center">Add a reminder to get notifications</Text>
            </View>
          ) : (
            reminders.map((reminder) => (
              <View key={reminder.id} className="mb-3 p-4 bg-surface rounded-2xl border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {formatTime(reminder.hour, reminder.minute)}
                    </Text>
                    <Text className="text-sm text-muted mt-1">{reminder.message}</Text>
                  </View>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={(value) => updateReminder(reminder.id, { enabled: value })}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor={reminder.enabled ? colors.success : colors.muted}
                  />
                </View>

                <View className="flex-row flex-wrap gap-2 mb-3">
                  {reminder.days.map((day) => (
                    <View key={day} className="px-3 py-1 bg-primary rounded-full">
                      <Text className="text-white text-xs font-semibold">{DAYS[day].slice(0, 3)}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => deleteReminder(reminder.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="p-2 bg-error/10 rounded-lg"
                >
                  <Text className="text-error font-semibold text-center">Delete</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Add Reminder Form */}
        <View className="mb-6">
          {!showAddForm ? (
            <Pressable
              onPress={() => setShowAddForm(true)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="p-4 bg-primary rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">+ Add Reminder</Text>
            </Pressable>
          ) : (
            <View className="p-4 bg-surface rounded-2xl border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">New Reminder</Text>

              {/* Time Selection */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Time</Text>
                <View className="flex-row gap-2 items-center">
                  <View className="flex-1">
                    <TextInput
                      value={formData.hour.toString().padStart(2, "0")}
                      onChangeText={(text) => {
                        const hour = Math.min(23, Math.max(0, parseInt(text) || 0));
                        setFormData((prev) => ({ ...prev, hour }));
                      }}
                      placeholder="HH"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      maxLength={2}
                      className="p-3 bg-background rounded-lg text-foreground text-center border border-border"
                    />
                  </View>
                  <Text className="text-foreground font-bold text-xl">:</Text>
                  <View className="flex-1">
                    <TextInput
                      value={formData.minute.toString().padStart(2, "0")}
                      onChangeText={(text) => {
                        const minute = Math.min(59, Math.max(0, parseInt(text) || 0));
                        setFormData((prev) => ({ ...prev, minute }));
                      }}
                      placeholder="MM"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      maxLength={2}
                      className="p-3 bg-background rounded-lg text-foreground text-center border border-border"
                    />
                  </View>
                </View>
              </View>

              {/* Day Selection */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Days</Text>
                <View className="flex-row flex-wrap gap-2">
                  {DAYS.map((day, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => toggleDay(idx)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: formData.days.includes(idx) ? colors.primary : colors.background,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                      className="px-3 py-2 rounded-lg border border-border"
                    >
                      <Text
                        className={`font-semibold ${formData.days.includes(idx) ? "text-white" : "text-foreground"}`}
                      >
                        {day.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Message */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Message</Text>
                <TextInput
                  value={formData.message}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, message: text }))}
                  placeholder="Reminder message"
                  placeholderTextColor={colors.muted}
                  className="p-3 bg-background rounded-lg text-foreground border border-border"
                  multiline
                  maxLength={100}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, { flex: 1 }]}
                  className="p-3 bg-muted/20 rounded-lg"
                >
                  <Text className="text-foreground font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddReminder}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, { flex: 1 }]}
                  className="p-3 bg-primary rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Add</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
