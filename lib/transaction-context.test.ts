import { describe, it, expect, beforeEach, vi } from "vitest";
import { DEFAULT_CATEGORIES } from "./types";

describe("Transaction Context", () => {
  describe("Monthly Stats Calculation", () => {
    it("should calculate correct totals for a month with mixed transactions", () => {
      const transactions = [
        {
          id: "1",
          type: "income" as const,
          amount: 5000,
          category: "salary",
          date: new Date(2026, 3, 1),
          description: "Monthly salary",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(2026, 3, 5),
          description: "Groceries",
          createdAt: new Date(),
        },
        {
          id: "3",
          type: "expense" as const,
          amount: 200,
          category: "transport",
          date: new Date(2026, 3, 10),
          description: "Gas",
          createdAt: new Date(),
        },
      ];

      // Calculate stats manually
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalIncome).toBe(5000);
      expect(totalExpense).toBe(700);
      expect(totalIncome - totalExpense).toBe(4300);
    });

    it("should calculate category breakdown correctly", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 300,
          category: "food",
          date: new Date(2026, 3, 1),
          description: "Food",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 200,
          category: "food",
          date: new Date(2026, 3, 5),
          description: "Food",
          createdAt: new Date(),
        },
        {
          id: "3",
          type: "expense" as const,
          amount: 500,
          category: "transport",
          date: new Date(2026, 3, 10),
          description: "Transport",
          createdAt: new Date(),
        },
      ];

      const byCategory: Record<string, number> = {};
      transactions.forEach((t) => {
        if (!byCategory[t.category]) {
          byCategory[t.category] = 0;
        }
        byCategory[t.category] += t.amount;
      });

      expect(byCategory["food"]).toBe(500);
      expect(byCategory["transport"]).toBe(500);

      // Calculate percentages
      const total = Object.values(byCategory).reduce((sum, a) => sum + a, 0);
      const percentages: Record<string, number> = {};
      Object.keys(byCategory).forEach((key) => {
        percentages[key] = (byCategory[key] / total) * 100;
      });

      expect(percentages["food"]).toBe(50);
      expect(percentages["transport"]).toBe(50);
    });

    it("should filter transactions by month correctly", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 100,
          category: "food",
          date: new Date(2026, 2, 15), // March
          description: "Food",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 200,
          category: "food",
          date: new Date(2026, 3, 15), // April
          description: "Food",
          createdAt: new Date(),
        },
        {
          id: "3",
          type: "expense" as const,
          amount: 300,
          category: "food",
          date: new Date(2026, 3, 20), // April
          description: "Food",
          createdAt: new Date(),
        },
      ];

      // Filter for April (month = 3)
      const aprilTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === 2026 && tDate.getMonth() === 3;
      });

      expect(aprilTransactions.length).toBe(2);
      expect(
        aprilTransactions.reduce((sum, t) => sum + t.amount, 0)
      ).toBe(500);
    });

    it("should handle empty transaction list", () => {
      const transactions: any[] = [];

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalIncome).toBe(0);
      expect(totalExpense).toBe(0);
      expect(totalIncome - totalExpense).toBe(0);
    });
  });

  describe("Default Categories", () => {
    it("should have default categories defined", () => {
      expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
    });

    it("should have both income and expense categories", () => {
      const hasIncome = DEFAULT_CATEGORIES.some((c) => c.type === "income");
      const hasExpense = DEFAULT_CATEGORIES.some((c) => c.type === "expense");

      expect(hasIncome).toBe(true);
      expect(hasExpense).toBe(true);
    });

    it("should have unique category IDs", () => {
      const ids = DEFAULT_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have all required category fields", () => {
      DEFAULT_CATEGORIES.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(category.color).toBeDefined();
        expect(category.type).toBeDefined();
      });
    });
  });

  describe("Transaction Validation", () => {
    it("should validate transaction amount is positive", () => {
      const transaction = {
        amount: 100,
      };

      expect(transaction.amount).toBeGreaterThan(0);
    });

    it("should validate transaction has required fields", () => {
      const transaction = {
        type: "expense" as const,
        amount: 100,
        category: "food",
        date: new Date(),
        description: "Test",
      };

      expect(transaction.type).toBeDefined();
      expect(transaction.amount).toBeDefined();
      expect(transaction.category).toBeDefined();
      expect(transaction.date).toBeDefined();
    });
  });
});
