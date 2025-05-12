import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Download, Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function CashBook() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [runningBalance, setRunningBalance] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const savedTransactions = JSON.parse(localStorage.getItem("cashTransactions") || "[]");
    const sorted = savedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = 0;
    const withBalance = sorted.map((t) => {
      const isDebit = t.type === "receive" || t.debit > 0;
      const amount = parseFloat(t.amount || t.debit || t.credit || 0);
      if (isDebit) {
        balance += amount;
      } else {
        balance -= amount;
      }
      return { ...t, balance, isDebit };
    });
    setTransactions(withBalance);
    setRunningBalance(balance);
  };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updated = transactions.filter((t) => t.id !== selectedTransaction.id);
    localStorage.setItem("cashTransactions", JSON.stringify(updated));
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
    toast({ title: "Deleted", description: "Transaction deleted successfully." });
    loadTransactions();
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    const txn = transactions[index];
    setEditData({
      date: txn.date,
      name: txn.name,
      particular: txn.particular,
      amount: txn.amount || txn.debit || txn.credit,
      type: txn.type,
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = (index) => {
    const updatedTransactions = [...transactions];
    const txn = updatedTransactions[index];
    const updatedTxn = {
      ...txn,
      ...editData,
      amount: parseFloat(editData.amount),
    };

    updatedTransactions[index] = updatedTxn;
    localStorage.setItem("cashTransactions", JSON.stringify(updatedTransactions));
    setEditingIndex(null);
    toast({ title: "Updated", description: "Transaction updated successfully." });
    loadTransactions();
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Cash Book Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(
      `Running Balance: ₹${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? "Dr" : "Cr"}`,
      14,
      35
    );
    doc.autoTable({
      startY: 45,
      head: [["Date", "Name", "Particular", "Debit", "Credit", "Balance"]],
      body: transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.name,
        t.particular || t.name,
        t.isDebit ? `₹${(t.amount || t.debit).toFixed(2)}` : "-",
        !t.isDebit ? `₹${(t.amount || t.credit).toFixed(2)}` : "-",
        `₹${Math.abs(t.balance).toFixed(2)} ${t.balance >= 0 ? "Dr" : "Cr"}`,
      ]),
    });
    doc.save("cash-book-report.pdf");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Cash Book</h1>
          <p className="text-muted-foreground">Track all cash transactions</p>
        </div>
        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg">
        <h3 className="text-lg font-semibold">Running Balance</h3>
        <p className="text-2xl font-bold text-primary">
          ₹{Math.abs(runningBalance).toFixed(2)}{" "}
          <span className={runningBalance >= 0 ? "text-green-600" : "text-red-600"}>
            {runningBalance >= 0 ? "Dr" : "Cr"}
          </span>
        </p>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4">Date</th>
              <th className="p-4">Name</th>
              <th className="p-4">Particular</th>
              <th className="p-4 text-right">Debit</th>
              <th className="p-4 text-right">Credit</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={t.id || index} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                {editingIndex === index ? (
                  <>
                    <td className="p-4">
                      <Input type="date" value={editData.date?.slice(0, 10)} onChange={(e) => handleEditChange("date", e.target.value)} />
                    </td>
                    <td className="p-4">
                      <Input value={editData.name} onChange={(e) => handleEditChange("name", e.target.value)} />
                    </td>
                    <td className="p-4">
                      <Input value={editData.particular} onChange={(e) => handleEditChange("particular", e.target.value)} />
                    </td>
                    <td className="p-4" colSpan="2">
                      <Input type="number" value={editData.amount} onChange={(e) => handleEditChange("amount", e.target.value)} />
                    </td>
                    <td className="p-4 text-right">-</td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" onClick={() => saveEdit(index)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">{t.name}</td>
                    <td className="p-4">{t.particular || "-"}</td>
                    <td className="p-4 text-right text-red-600">{t.isDebit ? `₹${(t.amount || t.debit).toFixed(2)}` : "-"}</td>
                    <td className="p-4 text-right text-green-600">{!t.isDebit ? `₹${(t.amount || t.credit).toFixed(2)}` : "-"}</td>
                    <td className="p-4 text-right font-medium">
                      ₹{Math.abs(t.balance).toFixed(2)}{" "}
                      <span className={t.balance >= 0 ? "text-green-600" : "text-red-600"}>
                        {t.balance >= 0 ? "Dr" : "Cr"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(t)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}

export default CashBook;
