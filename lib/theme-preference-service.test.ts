import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getThemePreference,
  setThemePreference,
  getEffectiveTheme,
  getThemeOptions,
  formatThemePreference,
  type ThemeMode,
} from "./theme-preference-service";

vi.mock("@react-native-async-storage/async-storage");

describe("Theme Preference Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getThemePreference", () => {
    it("should return saved theme preference", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue("dark");
      const result = await getThemePreference();
      expect(result).toBe("dark");
    });

    it("should return system as default when no preference is saved", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await getThemePreference();
      expect(result).toBe("system");
    });

    it("should return system for invalid preference values", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue("invalid");
      const result = await getThemePreference();
      expect(result).toBe("system");
    });

    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.getItem as any).mockRejectedValue(new Error("Storage error"));
      const result = await getThemePreference();
      expect(result).toBe("system");
    });
  });

  describe("setThemePreference", () => {
    it("should save theme preference", async () => {
      await setThemePreference("dark");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("theme_preference", "dark");
    });

    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.setItem as any).mockRejectedValue(new Error("Storage error"));
      await expect(setThemePreference("light")).resolves.toBeUndefined();
    });
  });

  describe("getEffectiveTheme", () => {
    it("should return light when preference is light", () => {
      const result = getEffectiveTheme("light", "dark");
      expect(result).toBe("light");
    });

    it("should return dark when preference is dark", () => {
      const result = getEffectiveTheme("dark", "light");
      expect(result).toBe("dark");
    });

    it("should follow system theme when preference is system", () => {
      expect(getEffectiveTheme("system", "dark")).toBe("dark");
      expect(getEffectiveTheme("system", "light")).toBe("light");
      expect(getEffectiveTheme("system", null)).toBe("light");
    });
  });

  describe("getThemeOptions", () => {
    it("should return all theme options", () => {
      const options = getThemeOptions();
      expect(options).toHaveLength(3);
      expect(options.map((o) => o.value)).toEqual(["light", "dark", "system"]);
    });

    it("should include proper icons and labels", () => {
      const options = getThemeOptions();
      const light = options.find((o) => o.value === "light");
      const dark = options.find((o) => o.value === "dark");
      const system = options.find((o) => o.value === "system");

      expect(light?.label).toBe("Light");
      expect(dark?.label).toBe("Dark");
      expect(system?.label).toBe("System");
    });
  });

  describe("formatThemePreference", () => {
    it("should format light theme", () => {
      const result = formatThemePreference("light");
      expect(result).toContain("Light");
      expect(result).toContain("☀️");
    });

    it("should format dark theme", () => {
      const result = formatThemePreference("dark");
      expect(result).toContain("Dark");
      expect(result).toContain("🌙");
    });

    it("should format system theme", () => {
      const result = formatThemePreference("system");
      expect(result).toContain("System");
      expect(result).toContain("⚙️");
    });

    it("should return System for invalid theme", () => {
      const result = formatThemePreference("invalid" as ThemeMode);
      expect(result).toBe("System");
    });
  });
});
