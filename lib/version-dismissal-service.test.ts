import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  shouldShowUpdateNotification,
  recordUpdateDismissal,
  clearDismissalHistory,
  getRemainingCooldown,
} from "./version-dismissal-service";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage");

describe("Version Dismissal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("shouldShowUpdateNotification", () => {
    it("should show notification if no dismissal history exists", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);

      const result = await shouldShowUpdateNotification("1.0.1");
      expect(result).toBe(true);
    });

    it("should show notification if version is different", async () => {
      const dismissalData = JSON.stringify({
        version: "1.0.0",
        dismissedAt: Date.now(),
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const result = await shouldShowUpdateNotification("1.0.1");
      expect(result).toBe(true);
    });

    it("should hide notification if same version dismissed within 7 days", async () => {
      const dismissalData = JSON.stringify({
        version: "1.0.1",
        dismissedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const result = await shouldShowUpdateNotification("1.0.1");
      expect(result).toBe(false);
    });

    it("should show notification if 7 days have passed since dismissal", async () => {
      const dismissalData = JSON.stringify({
        version: "1.0.1",
        dismissedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const result = await shouldShowUpdateNotification("1.0.1");
      expect(result).toBe(true);
    });

    it("should return true on error", async () => {
      (AsyncStorage.getItem as any).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await shouldShowUpdateNotification("1.0.1");
      expect(result).toBe(true);
    });
  });

  describe("recordUpdateDismissal", () => {
    it("should record dismissal with current timestamp", async () => {
      await recordUpdateDismissal("1.0.1");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "version_update_dismissal",
        expect.stringContaining("1.0.1")
      );
    });

    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.setItem as any).mockRejectedValue(
        new Error("Storage error")
      );

      // Should not throw
      await expect(recordUpdateDismissal("1.0.1")).resolves.toBeUndefined();
    });
  });

  describe("clearDismissalHistory", () => {
    it("should remove dismissal record", async () => {
      await clearDismissalHistory();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "version_update_dismissal"
      );
    });

    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.removeItem as any).mockRejectedValue(
        new Error("Storage error")
      );

      // Should not throw
      await expect(clearDismissalHistory()).resolves.toBeUndefined();
    });
  });

  describe("getRemainingCooldown", () => {
    it("should return 0 if no dismissal history", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);

      const remaining = await getRemainingCooldown("1.0.1");
      expect(remaining).toBe(0);
    });

    it("should return 0 if version is different", async () => {
      const dismissalData = JSON.stringify({
        version: "1.0.0",
        dismissedAt: Date.now(),
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const remaining = await getRemainingCooldown("1.0.1");
      expect(remaining).toBe(0);
    });

    it("should return remaining cooldown time", async () => {
      const oneHourAgo = Date.now() - 1000 * 60 * 60;
      const dismissalData = JSON.stringify({
        version: "1.0.1",
        dismissedAt: oneHourAgo,
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const remaining = await getRemainingCooldown("1.0.1");
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
    });

    it("should return 0 if cooldown has expired", async () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const dismissalData = JSON.stringify({
        version: "1.0.1",
        dismissedAt: eightDaysAgo,
      });
      (AsyncStorage.getItem as any).mockResolvedValue(dismissalData);

      const remaining = await getRemainingCooldown("1.0.1");
      expect(remaining).toBe(0);
    });
  });
});
