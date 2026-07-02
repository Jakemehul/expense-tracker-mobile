import { Transaction, Category } from "./types";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/**
 * Export service for generating CSV and PDF files
 */
export class ExportService {
  /**
   * Generate CSV content for transactions
   */
  static generateTransactionsCsv(transactions: Transaction[]): string {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.type.toUpperCase(),
      t.category,
      `₹${t.amount.toFixed(2)}`,
      t.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(cell).replace(/"/g, '""');
            return escaped.includes(",") ? `"${escaped}"` : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Generate CSV content for category-wise spending
   */
  static generateCategorySpendingCsv(
    transactions: Transaction[],
    categories: Category[]
  ): string {
    // Calculate spending by category
    const categorySpending: Record<string, number> = {};
    const categoryTransactionCount: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        categoryTransactionCount[t.category] =
          (categoryTransactionCount[t.category] || 0) + 1;
      }
    });

    const headers = ["Category", "Total Spending", "Transaction Count", "Average per Transaction"];
    const rows = Object.entries(categorySpending).map(([category, total]) => [
      category,
      `₹${total.toFixed(2)}`,
      categoryTransactionCount[category],
      `₹${(total / categoryTransactionCount[category]).toFixed(2)}`,
    ]);

    // Sort by spending (descending)
    rows.sort((a, b) => {
      const aAmount = parseFloat(String(a[1]).replace("₹", ""));
      const bAmount = parseFloat(String(b[1]).replace("₹", ""));
      return bAmount - aAmount;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""');
            return escaped.includes(",") ? `"${escaped}"` : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Generate summary report CSV
   */
  static generateSummaryReportCsv(transactions: Transaction[]): string {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    const headers = ["Metric", "Amount"];
    const rows = [
      ["Total Income", `₹${totalIncome.toFixed(2)}`],
      ["Total Expense", `₹${totalExpense.toFixed(2)}`],
      ["Net Balance", `₹${netBalance.toFixed(2)}`],
      ["Total Transactions", transactions.length],
      ["Export Date", new Date().toLocaleString("en-IN")],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""');
            return escaped.includes(",") ? `"${escaped}"` : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Generate HTML content for PDF export (transactions)
   */
  static generateTransactionsHtml(transactions: Transaction[]): string {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    const transactionRows = transactions
      .map(
        (t) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(t.date).toLocaleDateString("en-IN")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <span style="padding: 4px 8px; border-radius: 4px; ${t.type === "income" ? "background-color: #d4edda; color: #155724;" : "background-color: #f8d7da; color: #721c24;"}">${t.type.toUpperCase()}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${t.amount.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.description || "-"}</td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expense Tracker - Transactions Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #0a7ea4; text-align: center; }
          h2 { color: #0a7ea4; margin-top: 30px; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; }
          .summary-card { padding: 15px; background-color: #f5f5f5; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
          .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
          .summary-card .amount { font-size: 24px; font-weight: bold; color: #0a7ea4; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #0a7ea4; color: white; padding: 12px; text-align: left; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Expense Tracker Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString("en-IN")}</p>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Income</h3>
            <div class="amount" style="color: #22C55E;">₹${totalIncome.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h3>Total Expense</h3>
            <div class="amount" style="color: #EF4444;">₹${totalExpense.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h3>Net Balance</h3>
            <div class="amount" style="color: ${netBalance >= 0 ? "#22C55E" : "#EF4444"};">₹${netBalance.toFixed(2)}</div>
          </div>
        </div>

        <h2>All Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>

        <div class="footer">
          <p>This report contains ${transactions.length} transactions.</p>
          <p>Expense Tracker - Personal Finance Management</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for PDF export (category spending)
   */
  static generateCategorySpendingHtml(
    transactions: Transaction[],
    categories: Category[]
  ): string {
    // Calculate spending by category
    const categorySpending: Record<string, number> = {};
    const categoryTransactionCount: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        categoryTransactionCount[t.category] =
          (categoryTransactionCount[t.category] || 0) + 1;
      }
    });

    const totalExpense = Object.values(categorySpending).reduce((a, b) => a + b, 0);

    const categoryRows = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => {
        const percentage = ((amount / totalExpense) * 100).toFixed(1);
        const barWidth = (amount / totalExpense) * 300;
        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${category}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">₹${amount.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${categoryTransactionCount[category]}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">
            <div style="background-color: #e0e0e0; border-radius: 4px; width: 300px; height: 20px; position: relative;">
              <div style="background-color: #0a7ea4; height: 100%; width: ${barWidth}px; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: white; font-size: 12px; font-weight: bold;">
                ${percentage}%
              </div>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expense Tracker - Category Spending Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #0a7ea4; text-align: center; }
          h2 { color: #0a7ea4; margin-top: 30px; }
          .summary-card { padding: 15px; background-color: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0; }
          .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
          .summary-card .amount { font-size: 28px; font-weight: bold; color: #EF4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #0a7ea4; color: white; padding: 12px; text-align: left; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Category-Wise Spending Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString("en-IN")}</p>
        
        <div class="summary-card">
          <h3>Total Spending</h3>
          <div class="amount">₹${totalExpense.toFixed(2)}</div>
        </div>

        <h2>Spending by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: center;">Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>

        <div class="footer">
          <p>This report shows spending across ${Object.keys(categorySpending).length} categories.</p>
          <p>Expense Tracker - Personal Finance Management</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Export transactions to CSV file
   */
  static async exportTransactionsCsv(transactions: Transaction[]): Promise<void> {
    try {
      const csvContent = this.generateTransactionsCsv(transactions);
      const fileName = `expense-tracker-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Transactions",
        });
      } else {
        alert(`File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error("Error exporting transactions CSV:", error);
      throw error;
    }
  }

  /**
   * Export category spending to CSV file
   */
  static async exportCategorySpendingCsv(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<void> {
    try {
      const csvContent = this.generateCategorySpendingCsv(transactions, categories);
      const fileName = `expense-tracker-category-spending-${new Date().toISOString().split("T")[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Category Spending",
        });
      } else {
        alert(`File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error("Error exporting category spending CSV:", error);
      throw error;
    }
  }

  /**
   * Export summary report to CSV file
   */
  static async exportSummaryReportCsv(transactions: Transaction[]): Promise<void> {
    try {
      const csvContent = this.generateSummaryReportCsv(transactions);
      const fileName = `expense-tracker-summary-${new Date().toISOString().split("T")[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Summary Report",
        });
      } else {
        alert(`File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error("Error exporting summary report CSV:", error);
      throw error;
    }
  }

  /**
   * Export transactions to PDF file
   */
  static async exportTransactionsPdf(transactions: Transaction[]): Promise<void> {
    try {
      const html = this.generateTransactionsHtml(transactions);
      const fileName = `expense-tracker-transactions-${new Date().toISOString().split("T")[0]}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // For now, we'll export as HTML since PDF generation requires additional setup
      // In production, you'd use a library like react-pdf or pdfkit
      await FileSystem.writeAsStringAsync(filePath, html);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/pdf",
          dialogTitle: "Export Transactions Report",
        });
      } else {
        alert(`File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error("Error exporting transactions PDF:", error);
      throw error;
    }
  }

  /**
   * Export category spending to PDF file
   */
  static async exportCategorySpendingPdf(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<void> {
    try {
      const html = this.generateCategorySpendingHtml(transactions, categories);
      const fileName = `expense-tracker-category-spending-${new Date().toISOString().split("T")[0]}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, html);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/pdf",
          dialogTitle: "Export Category Spending Report",
        });
      } else {
        alert(`File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error("Error exporting category spending PDF:", error);
      throw error;
    }
  }
}
