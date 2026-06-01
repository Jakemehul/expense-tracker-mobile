import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWeekStart,
  getWeekStartTimestamp,
  shouldAlertWeeklyBudget,
  recordWeeklyAlert,
  getWeeklySpendingPercentage,
  getRemainingDaysInWeek,
  clearWeeklyAlertHistory,
} from "./weekly-alert-service";

vi.mock("@react-native-async-storage/async-storage");

describe("Weekly Alert Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWeekStart", () => {
    it("should return Monday of current week", () => {
      const date = new Date("2026-05-31"); // Sunday
      const weekStart = getWeekStart(date);
      expect(weekStart.getDay()).toBe(1); // Monday
    });

    it("should return same date if already Monday", () => {
      const date = new Date("2026-05-25"); // Monday
      const weekStart = getWeekStart(date);
      expect(weekStart.getDay()).toBe(1);
      expect(weekStart.getDate()).toBe(25);
    });
  });

  describe("getWeeklySpendingPercentage", () => {
    it("should calculate percentage correctly", () => {
      const percentage = getWeeklySpendingPercentage(800, 1000);
      expect(percentage).toBe(80);
    });

    it("should return 0 if no budget", () => {
      const percentage = getWeeklySpendingPercentage(500, 0);
      expect(percentage).toBe(0);
    });

    it("should cap at 100%", () => {
      const percentage = getWeeklySpendingPercentage(1500, 1000);
      expect(percentage).toBe(100);
    });
  });

  describe("shouldAlertWeeklyBudget", () => {
    it("should return false if spending below 80%", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertWeeklyBudget(700, 1000);
      expect(result).toBe(false);
    });

    it("should return true if spending at 80% with no alert history", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertWeeklyBudget(800, 1000);
      expect(result).toBe(true);
    });

    it("should return false if already alerted this week", async () => {
      const alertData = JSON.stringify({
        weekStart: getWeekStartTimestamp(),
        alerted: true,
        spentPercentage: 0.8,
      });
      (AsyncStorage.getItem as any).mockResolvedValue(alertData);
      const result = await shouldAlertWeeklyBudget(800, 1000);
      expect(result).toBe(false);
    });

    it("should return true if different week", async () => {
      const lastWeekStart = getWeekStartTimestamp(
        new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      );
      const alertData = JSON.stringify({
        weekStart: lastWeekStart,
        alerted: true,
        spentPercentage: 0.8,
      });
      (AsyncStorage.getItem as any).mockResolvedValue(alertData);
      const result = await shouldAlertWeeklyBudget(800, 1000);
      expect(result).toBe(true);
    });

    it("should return false if no budget", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertWeeklyBudget(800, 0);
      expect(result).toBe(false);
    });
  });

  describe("recordWeeklyAlert", () => {
    it("should record alert with current week timestamp", async () => {
      await recordWeeklyAlert(800, 1000);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "weekly_budget_alert",
        expect.stringContaining('"alerted":true')
      );
    });

    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.setItem as any).mockRejectedValue(
        new Error("Storage error")
      );
      await expect(recordWeeklyAlert(800, 1000)).resolves.toBeUndefined();
    });
  });

  describe("getRemainingDaysInWeek", () => {
    it("should return correct remaining days", () => {
      const date = new Date("2026-05-25"); // Monday
      vi.useFakeTimers();
      vi.setSystemTime(date);

      const remaining = getRemainingDaysInWeek();
      expect(remaining).toBe(6); // Mon to Sun = 6 remaining days

      vi.useRealTimers();
    });
  });

  describe("clearWeeklyAlertHistory", () => {
    it("should remove alert record", async () => {
      await clearWeeklyAlertHistory();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "weekly_budget_alert"
      );
    });
  });
});
