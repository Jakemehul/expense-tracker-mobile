import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UPDATE_NOTIFICATION_SENT_KEY = "update_notification_sent";

/**
 * Configure notification handler
 */
export async function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Send update available notification
 */
export async function sendUpdateNotification(
  newVersion: string,
  changelog?: string[]
): Promise<void> {
  try {
    // Check if we already sent a notification for this version
    const lastSent = await AsyncStorage.getItem(UPDATE_NOTIFICATION_SENT_KEY);
    if (lastSent === newVersion) {
      console.log("Update notification already sent for this version");
      return;
    }

    const changelogText =
      changelog && changelog.length > 0
        ? `\n\nNew features: ${changelog.slice(0, 2).join(", ")}`
        : "";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Update Available",
        body: `Version ${newVersion} is now available. Tap to download and install the latest features.${changelogText}`,
        data: {
          version: newVersion,
          type: "update",
        },
        sound: "default",
        badge: 1,
      },
      trigger: null, // Send immediately
    });

    // Record that we sent this notification
    await AsyncStorage.setItem(UPDATE_NOTIFICATION_SENT_KEY, newVersion);
  } catch (error) {
    console.error("Failed to send update notification:", error);
  }
}

/**
 * Clear update notification record (call when user updates)
 */
export async function clearUpdateNotificationRecord(): Promise<void> {
  try {
    await AsyncStorage.removeItem(UPDATE_NOTIFICATION_SENT_KEY);
  } catch (error) {
    console.error("Failed to clear update notification record:", error);
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
}
