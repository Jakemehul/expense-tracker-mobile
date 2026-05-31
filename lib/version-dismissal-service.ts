import AsyncStorage from "@react-native-async-storage/async-storage";

const DISMISSAL_KEY = "version_update_dismissal";
const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export interface DismissalRecord {
  version: string;
  dismissedAt: number;
}

/**
 * Check if an update notification should be shown based on dismissal history
 * Returns false if the user dismissed this version within the last 7 days
 */
export async function shouldShowUpdateNotification(
  latestVersion: string
): Promise<boolean> {
  try {
    const dismissalData = await AsyncStorage.getItem(DISMISSAL_KEY);
    if (!dismissalData) return true;

    const record: DismissalRecord = JSON.parse(dismissalData);

    // If it's a different version, show the notification
    if (record.version !== latestVersion) return true;

    // Check if 7 days have passed since dismissal
    const now = Date.now();
    const timeSinceDismissal = now - record.dismissedAt;

    return timeSinceDismissal > COOLDOWN_MS;
  } catch (error) {
    console.error("Error checking dismissal status:", error);
    return true; // Show notification on error
  }
}

/**
 * Record that the user dismissed an update notification
 */
export async function recordUpdateDismissal(version: string): Promise<void> {
  try {
    const record: DismissalRecord = {
      version,
      dismissedAt: Date.now(),
    };
    await AsyncStorage.setItem(DISMISSAL_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Error recording dismissal:", error);
  }
}

/**
 * Clear dismissal history (useful for testing or manual reset)
 */
export async function clearDismissalHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DISMISSAL_KEY);
  } catch (error) {
    console.error("Error clearing dismissal history:", error);
  }
}

/**
 * Get remaining cooldown time in milliseconds
 * Returns 0 if no cooldown is active
 */
export async function getRemainingCooldown(version: string): Promise<number> {
  try {
    const dismissalData = await AsyncStorage.getItem(DISMISSAL_KEY);
    if (!dismissalData) return 0;

    const record: DismissalRecord = JSON.parse(dismissalData);

    // If it's a different version, no cooldown
    if (record.version !== version) return 0;

    const now = Date.now();
    const timeSinceDismissal = now - record.dismissedAt;
    const remaining = COOLDOWN_MS - timeSinceDismissal;

    return Math.max(0, remaining);
  } catch (error) {
    console.error("Error getting remaining cooldown:", error);
    return 0;
  }
}
