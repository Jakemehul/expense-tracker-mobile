import { compareVersions } from "@/lib/version-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  changelog: string[];
  forceUpdate: boolean;
  releaseDate: string;
}

const LAST_CHECK_KEY = "last_update_check";
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if enough time has passed since last update check
 */
export async function shouldCheckForUpdates(): Promise<boolean> {
  try {
    const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheck) return true;

    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    return now - lastCheckTime >= CHECK_INTERVAL_MS;
  } catch (error) {
    console.error("Error checking update interval:", error);
    return true; // Default to checking if there's an error
  }
}

/**
 * Record that we just checked for updates
 */
export async function recordUpdateCheck(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error recording update check:", error);
  }
}

/**
 * Fetch latest version info from backend
 */
export async function checkForUpdates(
  currentVersion: string
): Promise<UpdateCheckResult | null> {
  try {
    // Check if we should skip this check
    const shouldCheck = await shouldCheckForUpdates();
    if (!shouldCheck) {
      return null;
    }

    const response = await fetch("http://localhost:3000/api/trpc/version.latest");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await recordUpdateCheck();

    const latestVersion = data.latestVersion || "1.0.21";
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return {
      hasUpdate,
      latestVersion,
      currentVersion,
      changelog: data.changelog || [],
      forceUpdate: data.forceUpdate || false,
      releaseDate: data.releaseDate || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return null;
  }
}

/**
 * Format changelog for display
 */
export function formatChangelog(changelog: string[]): string {
  if (!changelog || changelog.length === 0) {
    return "No changelog available";
  }
  return changelog.map((item) => `• ${item}`).join("\n");
}

/**
 * Get time since last update check
 */
export async function getTimeSinceLastCheck(): Promise<number | null> {
  try {
    const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheck) return null;

    const lastCheckTime = parseInt(lastCheck, 10);
    return Date.now() - lastCheckTime;
  } catch (error) {
    console.error("Error getting time since last check:", error);
    return null;
  }
}
