import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getCategoryAlerts,
  shouldAlertForCategory,
  recordCategoryAlert,
  clearCategoryAlertHistory,
  getRemainingBudget,
  getSpendingPercentage,
} from "./category-alert-service";

vi.mock("@react-native-async-storage/async-storage");

describe("Category Alert Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategoryAlerts", () => {
    it("should return empty object if no alerts exist", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const alerts = await getCategoryAlerts();
      expect(alerts).toEqual({});
    });

    it("should return saved alerts", async () => {
      const saved = {
        "1": {
          categoryId: "1",
          categoryName: "Food",
          spent: 500,
          limit: 1000,
          percentage: 50,
          alerted: false,
        },
      };
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(saved));
      const alerts = await getCategoryAlerts();
      expect(alerts["1"].categoryName).toBe("Food");
    });
  });

  describe("shouldAlertForCategory", () => {
    it("should return false if spending below 80%", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertForCategory("1", "Food", 700, 1000);
      expect(result).toBe(false);
    });

    it("should return true if spending at 80% with no alert history", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertForCategory("1", "Food", 800, 1000);
      expect(result).toBe(true);
    });

    it("should return false if already alerted today", async () => {
      const today = new Date().toISOString().split("T")[0];
      const alertData = JSON.stringify({
        "1": {
          categoryId: "1",
          categoryName: "Food",
          spent: 800,
          limit: 1000,
          percentage: 80,
          lastAlertDate: today,
          alerted: true,
        },
      });
      (AsyncStorage.getItem as any).mockResolvedValue(alertData);
      const result = await shouldAlertForCategory("1", "Food", 800, 1000);
      expect(result).toBe(false);
    });

    it("should return true if different day", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const alertData = JSON.stringify({
        "1": {
          categoryId: "1",
          categoryName: "Food",
          spent: 800,
          limit: 1000,
          percentage: 80,
          lastAlertDate: yesterday.toISOString().split("T")[0],
          alerted: true,
        },
      });
      (AsyncStorage.getItem as any).mockResolvedValue(alertData);
      const result = await shouldAlertForCategory("1", "Food", 800, 1000);
      expect(result).toBe(true);
    });

    it("should return false if no budget", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const result = await shouldAlertForCategory("1", "Food", 800, 0);
      expect(result).toBe(false);
    });
  });

  describe("recordCategoryAlert", () => {
    it("should record alert with today's date", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      await recordCategoryAlert("1", "Food", 800, 1000);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_category_alerts",
        expect.stringContaining('"alerted":true')
      );
    });
  });

  describe("getRemainingBudget", () => {
    it("should calculate remaining budget correctly", () => {
      const remaining = getRemainingBudget(700, 1000);
      expect(remaining).toBe(300);
    });

    it("should return 0 if overspent", () => {
      const remaining = getRemainingBudget(1500, 1000);
      expect(remaining).toBe(0);
    });
  });

  describe("getSpendingPercentage", () => {
    it("should calculate percentage correctly", () => {
      const percentage = getSpendingPercentage(800, 1000);
      expect(percentage).toBe(80);
    });

    it("should return 0 if no budget", () => {
      const percentage = getSpendingPercentage(500, 0);
      expect(percentage).toBe(0);
    });

    it("should cap at 100%", () => {
      const percentage = getSpendingPercentage(1500, 1000);
      expect(percentage).toBe(100);
    });
  });

  describe("clearCategoryAlertHistory", () => {
    it("should remove alert record", async () => {
      await clearCategoryAlertHistory();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "@expense_tracker_category_alerts"
      );
    });
  });
});
