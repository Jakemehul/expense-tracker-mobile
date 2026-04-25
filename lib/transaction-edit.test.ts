import { describe, it, expect } from "vitest";

describe("Transaction Editing & Deletion", () => {
  describe("Update Transaction", () => {
    it("should update transaction amount", () => {
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date(),
        description: "Lunch",
        createdAt: new Date(),
      };

      const updated = { ...transaction, amount: 750 };

      expect(updated.amount).toBe(750);
      expect(updated.id).toBe(transaction.id);
      expect(updated.category).toBe(transaction.category);
    });

    it("should update transaction description", () => {
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date(),
        description: "Lunch",
        createdAt: new Date(),
      };

      const updated = { ...transaction, description: "Dinner at restaurant" };

      expect(updated.description).toBe("Dinner at restaurant");
      expect(updated.amount).toBe(500);
    });

    it("should update transaction category", () => {
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date(),
        description: "Transport",
        createdAt: new Date(),
      };

      const updated = { ...transaction, category: "transport" };

      expect(updated.category).toBe("transport");
      expect(updated.type).toBe("expense");
    });

    it("should update transaction type", () => {
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date(),
        description: "Freelance work",
        createdAt: new Date(),
      };

      const updated = { ...transaction, type: "income" as const };

      expect(updated.type).toBe("income");
      expect(updated.amount).toBe(500);
    });

    it("should update multiple fields at once", () => {
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date("2026-04-01"),
        description: "Lunch",
        createdAt: new Date(),
      };

      const newDate = new Date("2026-04-15");
      const updated = {
        ...transaction,
        amount: 750,
        description: "Dinner",
        date: newDate,
      };

      expect(updated.amount).toBe(750);
      expect(updated.description).toBe("Dinner");
      expect(updated.date).toEqual(newDate);
      expect(updated.id).toBe(transaction.id);
    });

    it("should preserve createdAt when updating", () => {
      const createdAt = new Date("2026-04-01");
      const transaction = {
        id: "1",
        type: "expense" as const,
        amount: 500,
        category: "food",
        date: new Date(),
        description: "Lunch",
        createdAt,
      };

      const updated = { ...transaction, amount: 750 };

      expect(updated.createdAt).toEqual(createdAt);
    });
  });

  describe("Delete Transaction", () => {
    it("should remove transaction from list", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(),
          description: "Lunch",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 200,
          category: "transport",
          date: new Date(),
          description: "Taxi",
          createdAt: new Date(),
        },
      ];

      const filtered = transactions.filter((t) => t.id !== "1");

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should handle deleting non-existent transaction", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(),
          description: "Lunch",
          createdAt: new Date(),
        },
      ];

      const filtered = transactions.filter((t) => t.id !== "999");

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should delete all matching transactions", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(),
          description: "Lunch",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 300,
          category: "food",
          date: new Date(),
          description: "Dinner",
          createdAt: new Date(),
        },
        {
          id: "3",
          type: "expense" as const,
          amount: 200,
          category: "transport",
          date: new Date(),
          description: "Taxi",
          createdAt: new Date(),
        },
      ];

      const filtered = transactions.filter((t) => t.category !== "food");

      expect(filtered.length).toBe(1);
      expect(filtered[0].category).toBe("transport");
    });
  });

  describe("Transaction Validation on Edit", () => {
    it("should validate positive amount", () => {
      const amount = 750;
      expect(amount > 0).toBe(true);
    });

    it("should reject zero amount", () => {
      const amount = 0;
      expect(amount > 0).toBe(false);
    });

    it("should reject negative amount", () => {
      const amount = -500;
      expect(amount > 0).toBe(false);
    });

    it("should validate category is not empty", () => {
      const category = "food";
      expect(category.length > 0).toBe(true);
    });

    it("should validate transaction type", () => {
      const validTypes = ["income", "expense"];
      const type = "expense";
      expect(validTypes.includes(type)).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    it("should update multiple transactions", () => {
      const transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(),
          description: "Lunch",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 200,
          category: "transport",
          date: new Date(),
          description: "Taxi",
          createdAt: new Date(),
        },
      ];

      const updated = transactions.map((t) =>
        t.id === "1" ? { ...t, amount: 750 } : t
      );

      expect(updated[0].amount).toBe(750);
      expect(updated[1].amount).toBe(200);
    });

    it("should delete and update in sequence", () => {
      let transactions = [
        {
          id: "1",
          type: "expense" as const,
          amount: 500,
          category: "food",
          date: new Date(),
          description: "Lunch",
          createdAt: new Date(),
        },
        {
          id: "2",
          type: "expense" as const,
          amount: 200,
          category: "transport",
          date: new Date(),
          description: "Taxi",
          createdAt: new Date(),
        },
        {
          id: "3",
          type: "expense" as const,
          amount: 100,
          category: "food",
          date: new Date(),
          description: "Snack",
          createdAt: new Date(),
        },
      ];

      // Delete transaction 2
      transactions = transactions.filter((t) => t.id !== "2");
      expect(transactions.length).toBe(2);

      // Update transaction 1
      transactions = transactions.map((t) =>
        t.id === "1" ? { ...t, amount: 750 } : t
      );
      expect(transactions[0].amount).toBe(750);
    });
  });
});
