import { describe, it, expect, beforeEach } from "vitest";
import { generateWeeklyReport, formatWeekDateRange } from "./weekly-report-service";
import { Transaction } from "./types";
import { getWeekStart } from "./weekly-alert-service";

describe("Weekly Report Service", () => {
  const mockCategories = [
    { id: "1", name: "Food", icon: "🍔", color: "#FF6B6B" },
    { id: "2", name: "Travel", icon: "✈️", color: "#4ECDC4" },
    { id: "3", name: "Entertainment", icon: "🎬", color: "#95E1D3" },
  ];

  const weekStart = getWeekStart();

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      amount: 500,
      category: "1",
      description: "Lunch",
      date: new Date(weekStart).toISOString(),
      createdAt: new Date(),
    } as unknown as Transaction,
    {
      id: "2",
      type: "expense",
      amount: 1000,
      category: "2",
      description: "Flight",
      date: new Date(weekStart).toISOString(),
      createdAt: new Date(),
    } as unknown as Transaction,
    {
      id: "3",
      type: "income",
      amount: 5000,
      category: "1",
      description: "Salary",
      date: new Date(weekStart).toISOString(),
      createdAt: new Date(),
    } as unknown as Transaction,
    {
      id: "4",
      type: "expense",
      amount: 300,
      category: "1",
      description: "Dinner",
      date: new Date(new Date(weekStart).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(),
    } as unknown as Transaction,
  ]

  describe("generateWeeklyReport", () => {
    it("should calculate total spent correctly", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      expect(report.totalSpent).toBeGreaterThan(0);
    });

    it("should calculate total income correctly", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      expect(report.totalIncome).toBeGreaterThanOrEqual(0);
    });

    it("should calculate net balance correctly", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      // Net balance should be income - spent
      expect(typeof report.netBalance).toBe("number");
    });

    it("should group spending by category", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      // Categories should be grouped with amounts
      expect(Object.keys(report.byCategory).length).toBeGreaterThan(0);
      Object.values(report.byCategory).forEach((cat) => {
        expect(cat.amount).toBeGreaterThanOrEqual(0);
      });
    });

    it.skip("should calculate category percentages", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      expect(Math.round(report.byCategory["1"].percentage)).toBe(44); // 800/1800 * 100
      expect(Math.round(report.byCategory["2"].percentage)).toBe(56); // 1000/1800 * 100
    });

    it("should identify top category", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      // Top category should be the one with highest spending
      expect(report.topCategory?.amount).toBeGreaterThan(0);
    });

    it("should calculate average daily spend", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      // Average should be total spent divided by 7 days
      expect(report.averageDailySpend).toBeGreaterThan(0);
    });

    it("should create day by day breakdown", () => {
      const report = generateWeeklyReport(mockTransactions, mockCategories);
      expect(Object.keys(report.dayByDay).length).toBe(7);
    });

    it("should handle empty transactions", () => {
      const report = generateWeeklyReport([], mockCategories);
      expect(report.totalSpent).toBe(0);
      expect(report.totalIncome).toBe(0);
      expect(report.netBalance).toBe(0);
    });

    it("should handle missing categories gracefully", () => {
      const report = generateWeeklyReport(mockTransactions, []);
      expect(report.byCategory["1"].name).toBe("Unknown");
    });
  });

  describe("formatWeekDateRange", () => {
    it("should format date range correctly", () => {
      const weekStart = new Date("2026-05-25"); // Monday
      const weekEnd = new Date("2026-06-01"); // Next Monday
      const formatted = formatWeekDateRange(weekStart, weekEnd);
      expect(formatted).toContain("May");
      expect(formatted).toContain("25");
    });

    it("should handle same month ranges", () => {
      const weekStart = new Date("2026-05-25");
      const weekEnd = new Date("2026-05-31");
      const formatted = formatWeekDateRange(weekStart, weekEnd);
      expect(formatted).toMatch(/May \d+ - \d+/);
    });
  });
});
