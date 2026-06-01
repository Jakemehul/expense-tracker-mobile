import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAlertThresholds,
  updateAlertThresholds,
  setCategoryThreshold,
  setWeeklyThreshold,
  shouldTriggerAlert,
  getThresholdLabel,
  getThresholdOptions,
} from "./alert-threshold-service";

vi.mock("@react-native-async-storage/async-storage");

describe("Alert Threshold Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAlertThresholds", () => {
    it("should return default thresholds if none exist", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const thresholds = await getAlertThresholds();
      expect(thresholds.categoryThreshold).toBe(80);
      expect(thresholds.weeklyThreshold).toBe(80);
    });

    it("should return saved thresholds", async () => {
      const saved = { categoryThreshold: 75, weeklyThreshold: 85 };
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(saved));
      const thresholds = await getAlertThresholds();
      expect(thresholds.categoryThreshold).toBe(75);
      expect(thresholds.weeklyThreshold).toBe(85);
    });
  });

  describe("updateAlertThresholds", () => {
    it("should update thresholds", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      await updateAlertThresholds({ categoryThreshold: 70 });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@expense_tracker_alert_threshold",
        expect.stringContaining('"categoryThreshold":70')
      );
    });

    it("should reject invalid thresholds", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      await expect(updateAlertThresholds({ categoryThreshold: 150 })).rejects.toThrow();
    });
  });

  describe("setCategoryThreshold", () => {
    it("should set category threshold", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      await setCategoryThreshold(75);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setWeeklyThreshold", () => {
    it("should set weekly threshold", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      await setWeeklyThreshold(85);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("shouldTriggerAlert", () => {
    it("should trigger alert when spending meets threshold", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      const result = await shouldTriggerAlert(800, 1000, "category");
      expect(result).toBe(true);
    });

    it("should not trigger alert when spending below threshold", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      const result = await shouldTriggerAlert(700, 1000, "category");
      expect(result).toBe(false);
    });

    it("should use custom threshold", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 60, weeklyThreshold: 80 })
      );
      const result = await shouldTriggerAlert(650, 1000, "category");
      expect(result).toBe(true);
    });

    it("should return false if no budget", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ categoryThreshold: 80, weeklyThreshold: 80 })
      );
      const result = await shouldTriggerAlert(500, 0, "category");
      expect(result).toBe(false);
    });
  });

  describe("getThresholdLabel", () => {
    it("should return correct labels", () => {
      expect(getThresholdLabel(50)).toBe("Very Conservative");
      expect(getThresholdLabel(70)).toBe("Conservative");
      expect(getThresholdLabel(80)).toBe("Moderate");
      expect(getThresholdLabel(90)).toBe("Aggressive");
      expect(getThresholdLabel(100)).toBe("Very Aggressive");
    });
  });

  describe("getThresholdOptions", () => {
    it("should return available threshold options", () => {
      const options = getThresholdOptions();
      expect(options).toContain(50);
      expect(options).toContain(80);
      expect(options).toContain(95);
      expect(options.length).toBe(8);
    });
  });
});
