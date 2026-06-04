/**
 * Transaction type definition
 */
export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: Date;
  description: string;
  createdAt: Date;
  photoUri?: string; // Optional receipt photo URI
}

/**
 * Category definition
 */
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
}

/**
 * Budget definition
 */
export interface Budget {
  id: string;
  categoryId: string;
  limit: number; // Monthly budget limit
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Budget status for a category
 */
export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "critical" | "exceeded"; // safe (<75%), warning (75-90%), critical (90-100%), exceeded (>100%)
}

/**
 * Monthly summary data
 */
export interface MonthlySummary {
  month: Date;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  byCategory: Record<string, { amount: number; percentage: number }>;
}

/**
 * Utility function to capitalize first letter of category name for display
 */
export const formatCategoryName = (categoryName: string): string => {
  return categoryName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Default categories
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: "food", name: "Food", icon: "🍔", color: "#FF6B6B", type: "expense" },
  { id: "groceries", name: "Groceries", icon: "🛒", color: "#FF9F43", type: "expense" },
  { id: "transport", name: "Transport", icon: "🚗", color: "#4ECDC4", type: "expense" },
  { id: "utilities", name: "Utilities", icon: "💡", color: "#FFE66D", type: "expense" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#A8E6CF", type: "expense" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#FF8B94", type: "expense" },
  { id: "health", name: "Health", icon: "💪", color: "#C7CEEA", type: "expense" },
  { id: "other-expense", name: "Other", icon: "📌", color: "#9BA1A6", type: "expense" },
  
  // Income categories
  { id: "salary", name: "Salary", icon: "💰", color: "#22C55E", type: "income" },
  { id: "freelance", name: "Freelance", icon: "💻", color: "#60A5FA", type: "income" },
  { id: "parents-money", name: "Parents Money", icon: "👨‍👩‍👧", color: "#EC4899", type: "income" },
  { id: "other-income", name: "Other Income", icon: "⭐", color: "#FBBF24", type: "income" },
];
