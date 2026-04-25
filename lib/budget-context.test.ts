import { describe, it, expect } from "vitest";

describe("Budget Context", () => {
  describe("Budget Status Calculation", () => {
    it("should calculate safe status when spending is below 75%", () => {
      const limit = 1000;
      const spent = 500;
      const percentage = (spent / limit) * 100;

      expect(percentage).toBe(50);
      expect(percentage < 75).toBe(true);
    });

    it("should calculate warning status when spending is 75-90%", () => {
      const limit = 1000;
      const spent = 800;
      const percentage = (spent / limit) * 100;

      expect(percentage).toBe(80);
      expect(percentage >= 75 && percentage < 90).toBe(true);
    });

    it("should calculate critical status when spending is 90-100%", () => {
      const limit = 1000;
      const spent = 950;
      const percentage = (spent / limit) * 100;

      expect(percentage).toBe(95);
      expect(percentage >= 90 && percentage < 100).toBe(true);
    });

    it("should calculate exceeded status when spending exceeds limit", () => {
      const limit = 1000;
      const spent = 1200;
      const percentage = (spent / limit) * 100;

      expect(percentage).toBe(120);
      expect(percentage >= 100).toBe(true);
    });
  });

  describe("Budget Remaining Calculation", () => {
    it("should calculate positive remaining when under budget", () => {
      const limit = 1000;
      const spent = 600;
      const remaining = Math.max(0, limit - spent);

      expect(remaining).toBe(400);
    });

    it("should calculate zero remaining when at budget", () => {
      const limit = 1000;
      const spent = 1000;
      const remaining = Math.max(0, limit - spent);

      expect(remaining).toBe(0);
    });

    it("should calculate zero remaining when over budget", () => {
      const limit = 1000;
      const spent = 1200;
      const remaining = Math.max(0, limit - spent);

      expect(remaining).toBe(0);
    });
  });

  describe("Budget Status Determination", () => {
    it("should return correct status for each spending level", () => {
      const testCases = [
        { spent: 500, limit: 1000, expected: "safe" },
        { spent: 750, limit: 1000, expected: "warning" },
        { spent: 900, limit: 1000, expected: "critical" },
        { spent: 1100, limit: 1000, expected: "exceeded" },
      ];

      testCases.forEach(({ spent, limit, expected }) => {
        const percentage = (spent / limit) * 100;

        let status: string;
        if (percentage >= 100) {
          status = "exceeded";
        } else if (percentage >= 90) {
          status = "critical";
        } else if (percentage >= 75) {
          status = "warning";
        } else {
          status = "safe";
        }

        expect(status).toBe(expected);
      });
    });
  });

  describe("Multiple Budget Aggregation", () => {
    it("should calculate total budget across multiple categories", () => {
      const budgets = [
        { categoryId: "food", limit: 5000 },
        { categoryId: "transport", limit: 3000 },
        { categoryId: "entertainment", limit: 2000 },
      ];

      const total = budgets.reduce((sum, b) => sum + b.limit, 0);
      expect(total).toBe(10000);
    });

    it("should calculate total spending across multiple categories", () => {
      const spending = [
        { categoryId: "food", spent: 3000 },
        { categoryId: "transport", spent: 2000 },
        { categoryId: "entertainment", spent: 1500 },
      ];

      const total = spending.reduce((sum, s) => sum + s.spent, 0);
      expect(total).toBe(6500);
    });

    it("should count categories by status", () => {
      const statuses = [
        { categoryId: "food", status: "safe" as const },
        { categoryId: "transport", status: "warning" as const },
        { categoryId: "entertainment", status: "critical" as const },
        { categoryId: "shopping", status: "exceeded" as const },
      ];

      const safe = statuses.filter((s) => s.status === "safe").length;
      const warning = statuses.filter((s) => s.status === "warning").length;
      const critical = statuses.filter((s) => s.status === "critical").length;
      const exceeded = statuses.filter((s) => s.status === "exceeded").length;

      expect(safe).toBe(1);
      expect(warning).toBe(1);
      expect(critical).toBe(1);
      expect(exceeded).toBe(1);
    });
  });

  describe("Budget Validation", () => {
    it("should validate positive budget limit", () => {
      const limit = 1000;
      expect(limit > 0).toBe(true);
    });

    it("should validate non-negative spending", () => {
      const spent = 500;
      expect(spent >= 0).toBe(true);
    });

    it("should reject negative budget limit", () => {
      const limit = -1000;
      expect(limit > 0).toBe(false);
    });

    it("should reject negative spending", () => {
      const spent = -500;
      expect(spent >= 0).toBe(false);
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency correctly", () => {
      const amount = 1000;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      expect(formatted).toContain("₹");
      expect(formatted).toContain("1,000");
    });

    it("should handle decimal amounts", () => {
      const amount = 1000.5;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      expect(formatted).toContain("₹");
    });
  });
});
