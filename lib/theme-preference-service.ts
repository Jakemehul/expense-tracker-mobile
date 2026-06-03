import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ThemeMode = "light" | "dark" | "system";

const THEME_PREFERENCE_KEY = "theme_preference";

/**
 * Get saved theme preference
 */
export async function getThemePreference(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (saved && ["light", "dark", "system"].includes(saved)) {
      return saved as ThemeMode;
    }
    return "system"; // Default to system theme
  } catch (error) {
    console.error("Error getting theme preference:", error);
    return "system";
  }
}

/**
 * Save theme preference
 */
export async function setThemePreference(theme: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
  } catch (error) {
    console.error("Error saving theme preference:", error);
  }
}

/**
 * Get effective theme based on preference and system settings
 */
export function getEffectiveTheme(
  preference: ThemeMode,
  systemTheme: "light" | "dark" | null
): "light" | "dark" {
  if (preference === "system") {
    return systemTheme === "dark" ? "dark" : "light";
  }
  return preference;
}

/**
 * Get theme options for UI
 */
export function getThemeOptions(): Array<{
  label: string;
  value: ThemeMode;
  icon: string;
}> {
  return [
    { label: "Light", value: "light", icon: "☀️" },
    { label: "Dark", value: "dark", icon: "🌙" },
    { label: "System", value: "system", icon: "⚙️" },
  ];
}

/**
 * Format theme preference for display
 */
export function formatThemePreference(theme: ThemeMode): string {
  const options = getThemeOptions();
  const option = options.find((o) => o.value === theme);
  return option ? `${option.icon} ${option.label}` : "System";
}
