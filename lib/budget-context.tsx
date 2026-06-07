import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Budget, BudgetStatus } from "./types";
import { useTransactions } from "./transaction-context";

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (categoryId: string, limit: number) => Promise<void>;
  updateBudget: (id: string, limit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStatus: (year: number, month: number) => BudgetStatus[];
  getBudgetForCategory: (categoryId: string) => Budget | undefined;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const BUDGETS_KEY = "@expense_tracker_budgets";

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions, categories } = useTransactions();

  // Load budgets from AsyncStorage on mount
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const budgetsData = await AsyncStorage.getItem(BUDGETS_KEY);
        if (budgetsData) {
          const parsed = JSON.parse(budgetsData);
          setBudgets(
            parsed.map((b: any) => ({
              ...b,
              createdAt: new Date(b.createdAt),
              updatedAt: new Date(b.updatedAt),
            }))
          );
        }
      } catch (error) {
        console.error("Error loading budgets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();
  }, []);

  const addBudget = async (categoryId: string, limit: number) => {
    if (budgets.some((b) => b.categoryId === categoryId)) {
      console.warn("Budget already exists for this category");
      return; // ← exits the function early, nothing else runs
  }
    const newBudget: Budget = {
      id: Date.now().toString(),
      categoryId,
      limit,
      createdAt: new Date(),
      updatedAt: new Date(),
  };

    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(updated));
  };

  const updateBudget = async (id: string, limit: number) => {
    const updated = budgets.map((b) =>
      b.id === id
        ? {
            ...b,
            limit,
            updatedAt: new Date(),
          }
        : b
    );
    setBudgets(updated);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(updated));
  };

  const deleteBudget = async (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(updated));
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b) => b.categoryId === categoryId);
  };

  const getBudgetStatus = (year: number, month: number): BudgetStatus[] => {
    // Get all transactions for the month
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getFullYear() === year &&
        tDate.getMonth() === month &&
        t.type === "expense"
      );
    });

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      if (!spendingByCategory[t.category]) {
        spendingByCategory[t.category] = 0;
      }
      spendingByCategory[t.category] += t.amount;
    });

    // Create budget status for each budget
    return budgets.map((budget) => {
      const spent = spendingByCategory[budget.categoryId] || 0;
      const remaining = Math.max(0, budget.limit - spent);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      let status: "safe" | "warning" | "critical" | "exceeded";
      if (percentage >= 100) {
        status = "exceeded";
      } else if (percentage >= 90) {
        status = "critical";
      } else if (percentage >= 75) {
        status = "warning";
      } else {
        status = "safe";
      }

      const category = categories.find((c) => c.id === budget.categoryId);

      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || "Unknown",
        categoryIcon: category?.icon || "📌",
        limit: budget.limit,
        spent,
        remaining,
        percentage,
        status,
      };
    });
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetStatus,
        getBudgetForCategory,
        isLoading,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider");
  }
  return context;
}
