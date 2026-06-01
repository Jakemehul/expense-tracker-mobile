import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDER_SETTINGS_KEY = "@expense_tracker_daily_reminder";

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format (e.g., "09:00")
  lastReminderDate?: string; // ISO date string
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  time: "09:00",
};

/**
 * Get current reminder settings
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const data = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
    if (!data) return DEFAULT_REMINDER_SETTINGS;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting reminder settings:", error);
    return DEFAULT_REMINDER_SETTINGS;
  }
}

/**
 * Update reminder settings
 */
export async function updateReminderSettings(
  settings: Partial<ReminderSettings>
): Promise<void> {
  try {
    const current = await getReminderSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating reminder settings:", error);
  }
}

/**
 * Enable daily reminders
 */
export async function enableReminders(time: string): Promise<void> {
  await updateReminderSettings({ enabled: true, time });
}

/**
 * Disable daily reminders
 */
export async function disableReminders(): Promise<void> {
  await updateReminderSettings({ enabled: false });
}

/**
 * Check if reminder should be shown today
 */
export async function shouldShowReminder(): Promise<boolean> {
  try {
    const settings = await getReminderSettings();
    if (!settings.enabled) return false;

    const today = new Date().toISOString().split("T")[0];
    const lastReminderDate = settings.lastReminderDate;

    // Show if it's a new day
    return lastReminderDate !== today;
  } catch (error) {
    console.error("Error checking reminder:", error);
    return false;
  }
}

/**
 * Record that reminder was shown today
 */
export async function recordReminderShown(): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const settings = await getReminderSettings();
    settings.lastReminderDate = today;
    await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error recording reminder:", error);
  }
}

/**
 * Format time for display
 */
export function formatReminderTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Parse time string to hours and minutes
 */
export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Create time string from hours and minutes
 */
export function createTimeString(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
