import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction, Category, DEFAULT_CATEGORIES } from "./types";

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getMonthlyStats: (year: number, month: number) => {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    byCategory: Record<string, { amount: number; percentage: number; icon: string; color: string }>;
  };
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const TRANSACTIONS_KEY = "@expense_tracker_transactions";
const CATEGORIES_KEY = "@expense_tracker_categories";

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsData, categoriesData] = await Promise.all([
          AsyncStorage.getItem(TRANSACTIONS_KEY),
          AsyncStorage.getItem(CATEGORIES_KEY),
        ]);

        if (transactionsData) {
          const parsed = JSON.parse(transactionsData);
          setTransactions(
            parsed.map((t: any) => ({
              ...t,
              date: new Date(t.date),
              createdAt: new Date(t.createdAt),
            }))
          );
        }

        if (categoriesData) {
          setCategories(JSON.parse(categoriesData));
        } else {
          // Save default categories if none exist
          await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  };

  const getMonthlyStats = (year: number, month: number) => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, { amount: number; percentage: number; icon: string; color: string }> = {};

    monthTransactions.forEach((t) => {
      if (!byCategory[t.category]) {
        const cat = categories.find((c) => c.id === t.category);
        byCategory[t.category] = {
          amount: 0,
          percentage: 0,
          icon: cat?.icon || "📌",
          color: cat?.color || "#9BA1A6",
        };
      }
      byCategory[t.category].amount += t.amount;
    });

    // Calculate percentages
    const totalAmount = Object.values(byCategory).reduce((sum, cat) => sum + cat.amount, 0);
    Object.keys(byCategory).forEach((key) => {
      byCategory[key].percentage = totalAmount > 0 ? (byCategory[key].amount / totalAmount) * 100 : 0;
    });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      byCategory,
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        getMonthlyStats,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}
