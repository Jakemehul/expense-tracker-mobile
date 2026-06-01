import { describe, it, expect } from "vitest";
import {
  getWeeklySpendingTrends,
  getMonthlySpendingTrends,
  getTrendLabel,
  getTrendColor,
} from "./spending-trends-service";

describe("Spending Trends Service", () => {
  const mockColors = {
    primary: "#0a7ea4",
    error: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
  };

  const mockTransactions = [
    {
      id: "1",
      type: "expense",
      amount: 100,
      category: "1",
      description: "Food",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      type: "expense",
      amount: 200,
      category: "2",
      description: "Travel",
      date: new Date().toISOString(),
    },
    {
      id: "3",
      type: "income",
      amount: 1000,
      category: "1",
      description: "Salary",
      date: new Date().toISOString(),
    },
  ];

  describe("getWeeklySpendingTrends", () => {
    it("should return weekly trend data", () => {
      const trends = getWeeklySpendingTrends(mockTransactions);
      expect(trends.days.length).toBe(7);
      expect(trends.total).toBeGreaterThanOrEqual(0);
      expect(trends.average).toBeGreaterThanOrEqual(0);
    });

    it("should calculate total correctly", () => {
      const trends = getWeeklySpendingTrends(mockTransactions);
      expect(trends.total).toBe(300); // 100 + 200 (income excluded)
    });

    it("should have trend direction", () => {
      const trends = getWeeklySpendingTrends(mockTransactions);
      expect(["up", "down", "stable"]).toContain(trends.trend);
    });

    it("should have correct day labels", () => {
      const trends = getWeeklySpendingTrends(mockTransactions);
      const dayLabels = trends.days.map((d) => d.day);
      expect(dayLabels).toContain("Mon");
      expect(dayLabels).toContain("Sun");
    });
  });

  describe("getMonthlySpendingTrends", () => {
    it("should return monthly trend data", () => {
      const trends = getMonthlySpendingTrends(mockTransactions);
      expect(trends.days.length).toBeGreaterThan(0);
      expect(trends.total).toBeGreaterThanOrEqual(0);
    });

    it("should have numeric day labels for month", () => {
      const trends = getMonthlySpendingTrends(mockTransactions);
      const firstDay = trends.days[0];
      expect(/^\d+$/.test(firstDay.day)).toBe(true);
    });

    it("should calculate average daily spend", () => {
      const trends = getMonthlySpendingTrends(mockTransactions);
      expect(trends.average).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getTrendLabel", () => {
    it("should return correct trend labels", () => {
      expect(getTrendLabel("up")).toBe("📈 Spending increased");
      expect(getTrendLabel("down")).toBe("📉 Spending decreased");
      expect(getTrendLabel("stable")).toBe("➡️ Spending stable");
    });
  });

  describe("getTrendColor", () => {
    it("should return correct colors for trends", () => {
      expect(getTrendColor("up", mockColors)).toBe(mockColors.error);
      expect(getTrendColor("down", mockColors)).toBe(mockColors.success);
      expect(getTrendColor("stable", mockColors)).toBe(mockColors.warning);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty transactions", () => {
      const trends = getWeeklySpendingTrends([]);
      expect(trends.total).toBe(0);
      expect(trends.average).toBe(0);
    });

    it("should exclude income transactions", () => {
      const incomeOnly = [
        {
          id: "1",
          type: "income",
          amount: 5000,
          category: "1",
          description: "Salary",
          date: new Date().toISOString(),
        },
      ];
      const trends = getWeeklySpendingTrends(incomeOnly);
      expect(trends.total).toBe(0);
    });

    it("should calculate highest and lowest correctly", () => {
      const trends = getWeeklySpendingTrends(mockTransactions);
      expect(trends.highest).toBeGreaterThanOrEqual(trends.lowest);
    });
  });
});
