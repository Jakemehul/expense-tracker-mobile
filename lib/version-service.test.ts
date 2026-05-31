import { describe, it, expect } from "vitest";
import {
  compareVersions,
  isUpdateAvailable,
  formatVersionMessage,
} from "./version-service";

describe("Version Service", () => {
  describe("compareVersions", () => {
    it("should return 1 when first version is greater", () => {
      expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
      expect(compareVersions("1.1.0", "1.0.0")).toBe(1);
      expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
    });

    it("should return -1 when first version is less", () => {
      expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
      expect(compareVersions("1.0.0", "1.1.0")).toBe(-1);
      expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    });

    it("should return 0 when versions are equal", () => {
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(compareVersions("2.5.3", "2.5.3")).toBe(0);
    });

    it("should handle different version lengths", () => {
      expect(compareVersions("1.0", "1.0.0")).toBe(0);
      expect(compareVersions("2.0", "1.9.9")).toBe(1);
      expect(compareVersions("1", "1.0.0")).toBe(0);
    });
  });

  describe("isUpdateAvailable", () => {
    it("should return true when update is available", () => {
      expect(isUpdateAvailable("1.0.0", "1.0.1")).toBe(true);
      expect(isUpdateAvailable("1.0.0", "1.1.0")).toBe(true);
      expect(isUpdateAvailable("1.0.0", "2.0.0")).toBe(true);
    });

    it("should return false when no update is available", () => {
      expect(isUpdateAvailable("1.0.1", "1.0.0")).toBe(false);
      expect(isUpdateAvailable("1.1.0", "1.0.0")).toBe(false);
      expect(isUpdateAvailable("2.0.0", "1.0.0")).toBe(false);
    });

    it("should return false when versions are equal", () => {
      expect(isUpdateAvailable("1.0.0", "1.0.0")).toBe(false);
    });
  });

  describe("formatVersionMessage", () => {
    it("should format version message correctly", () => {
      const message = formatVersionMessage({
        latestVersion: "1.0.1",
        downloadUrl: "https://example.com",
        releaseNotes: "Bug fixes and improvements",
      });

      expect(message).toContain("Version 1.0.1");
      expect(message).toContain("Bug fixes and improvements");
    });

    it("should include version and release notes", () => {
      const message = formatVersionMessage({
        latestVersion: "2.0.0",
        downloadUrl: "https://example.com",
        releaseNotes: "Major update with new features",
      });

      expect(message).toContain("2.0.0");
      expect(message).toContain("Major update with new features");
    });
  });
});
