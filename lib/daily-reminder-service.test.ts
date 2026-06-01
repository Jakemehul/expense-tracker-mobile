import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getReminderSettings,
  updateReminderSettings,
  enableReminders,
  disableReminders,
  shouldShowReminder,
  recordReminderShown,
  formatReminderTime,
  parseTimeString,
  createTimeString,
} from "./daily-reminder-service";

vi.mock("@react-native-async-storage/async-storage");

describe("Daily Reminder Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReminderSettings", () => {
    it("should return default settings if none exist", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const settings = await getReminderSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.time).toBe("09:00");
    });

    it("should return saved settings", async () => {
      const saved = { enabled: true, time: "14:30" };
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(saved));
      const settings = await getReminderSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.time).toBe("14:30");
    });

    it("should handle storage errors", async () => {
      (AsyncStorage.getItem as any).mockRejectedValue(new Error("Storage error"));
      const settings = await getReminderSettings();
      expect(settings.enabled).toBe(false);
    });
  });

  describe("updateReminderSettings", () => {
    it("should update reminder settings", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: false, time: "09:00" })
      );
      await updateReminderSettings({ enabled: true, time: "10:00" });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should handle partial updates", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: false, time: "09:00" })
      );
      await updateReminderSettings({ enabled: true });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_daily_reminder",
        expect.stringContaining('"enabled":true')
      );
    });
  });

  describe("enableReminders", () => {
    it("should enable reminders with specified time", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: false, time: "09:00" })
      );
      await enableReminders("15:00");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_daily_reminder",
        expect.stringContaining('"enabled":true')
      );
    });
  });

  describe("disableReminders", () => {
    it("should disable reminders", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: true, time: "09:00" })
      );
      await disableReminders();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_daily_reminder",
        expect.stringContaining('"enabled":false')
      );
    });
  });

  describe("shouldShowReminder", () => {
    it("should return false if reminders disabled", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: false, time: "09:00" })
      );
      const result = await shouldShowReminder();
      expect(result).toBe(false);
    });

    it("should return true if enabled and no reminder today", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({
          enabled: true,
          time: "09:00",
          lastReminderDate: yesterday.toISOString().split("T")[0],
        })
      );
      const result = await shouldShowReminder();
      expect(result).toBe(true);
    });

    it("should return false if already reminded today", async () => {
      const today = new Date().toISOString().split("T")[0];
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({
          enabled: true,
          time: "09:00",
          lastReminderDate: today,
        })
      );
      const result = await shouldShowReminder();
      expect(result).toBe(false);
    });
  });

  describe("recordReminderShown", () => {
    it("should record today's date as last reminder", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ enabled: true, time: "09:00" })
      );
      await recordReminderShown();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_daily_reminder",
        expect.stringContaining('"lastReminderDate"')
      );
    });
  });

  describe("formatReminderTime", () => {
    it("should format 24-hour time to 12-hour AM/PM", () => {
      expect(formatReminderTime("09:00")).toBe("9:00 AM");
      expect(formatReminderTime("14:30")).toBe("2:30 PM");
      expect(formatReminderTime("00:00")).toBe("12:00 AM");
      expect(formatReminderTime("12:00")).toBe("12:00 PM");
    });
  });

  describe("parseTimeString", () => {
    it("should parse time string correctly", () => {
      const result = parseTimeString("14:30");
      expect(result.hours).toBe(14);
      expect(result.minutes).toBe(30);
    });
  });

  describe("createTimeString", () => {
    it("should create time string with proper padding", () => {
      expect(createTimeString(9, 5)).toBe("09:05");
      expect(createTimeString(14, 30)).toBe("14:30");
      expect(createTimeString(0, 0)).toBe("00:00");
    });
  });
});
