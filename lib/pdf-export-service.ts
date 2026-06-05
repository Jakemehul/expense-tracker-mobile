import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface TransactionForExport {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: Date;
  description: string;
  categoryName?: string;
  categoryIcon?: string;
}

export async function exportTransactionsToPDF(
  transactions: TransactionForExport[]
): Promise<void> {
  try {
    // Create PDF document
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(20);
    pdf.text("Expense Tracker Report", pageWidth / 2, 15, { align: "center" });

    // Add date range
    pdf.setFontSize(10);
    const today = new Date().toLocaleDateString("en-IN");
    pdf.text(`Generated on: ${today}`, pageWidth / 2, 25, { align: "center" });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpense;

    // Add summary section
    pdf.setFontSize(12);
    pdf.text("Summary", 15, 35);

    const summaryData = [
      ["Total Income", `₹${totalIncome.toFixed(2)}`],
      ["Total Expense", `₹${totalExpense.toFixed(2)}`],
      ["Net Amount", `₹${netAmount.toFixed(2)}`],
    ];

    (pdf as any).autoTable({
      startY: 40,
      head: [["Category", "Amount"]],
      body: summaryData,
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });

    // Get current Y position after summary table
    let currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Add transactions section
    pdf.setFontSize(12);
    pdf.text("Transactions", 15, currentY);
    currentY += 7;

    // Prepare transaction data
    const tableData = transactions.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.categoryName || t.category,
      t.description || "-",
      t.type === "income" ? `+₹${t.amount.toFixed(2)}` : `-₹${t.amount.toFixed(2)}`,
    ]);

    // Add transactions table
    (pdf as any).autoTable({
      startY: currentY,
      head: [["Date", "Category", "Description", "Amount"]],
      body: tableData,
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data: any) => {
        // Add footer
        const pageCount = pdf.internal.pages.length;
        const pageSize = pdf.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        pdf.setFontSize(8);
        pdf.text(
          `Page ${pageCount - 1}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    });

    // Save and share PDF
    const fileName = `expense-tracker-${today.replace(/\//g, "-")}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Convert PDF to base64 and save
    const pdfData = pdf.output("arraybuffer");
    const base64Data = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(pdfData))));

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Expense Report",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}
