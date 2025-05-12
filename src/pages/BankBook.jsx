import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function BankBook() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [bankDetails, setBankDetails] = useState({
    name: "",
    accountNumber: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date(),
    particular: "",
    debit: "",
    credit: "",
  });

  useEffect(() => {
    const savedBankDetails = localStorage.getItem("bankDetails");
    if (savedBankDetails) {
      setBankDetails(JSON.parse(savedBankDetails));
    }

    const savedTransactions = localStorage.getItem("bankTransactions");
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      const processedTransactions = calculateBalance(parsedTransactions);
      setTransactions(processedTransactions);
      if (processedTransactions.length > 0) {
        setTotalBalance(
          processedTransactions[processedTransactions.length - 1].balance
        );
      }
    }
  }, []);

  const calculateBalance = (transactionList) => {
    let balance = 0;
    return transactionList.map((transaction) => {
      const debit = parseFloat(transaction.debit) || 0;
      const credit = parseFloat(transaction.credit) || 0;
      balance = balance + credit - debit;
      return { ...transaction, balance };
    });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();

    if (
      !newTransaction.particular ||
      (!newTransaction.debit && !newTransaction.credit)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const debitAmount = parseFloat(newTransaction.debit) || 0;
    const creditAmount = parseFloat(newTransaction.credit) || 0;

    if (debitAmount < 0 || creditAmount < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount cannot be negative",
      });
      return;
    }

    const transaction = {
      id: Date.now(),
      date: newTransaction.date,
      particular: newTransaction.particular,
      debit: debitAmount,
      credit: creditAmount,
    };

    const updatedTransactions = [...transactions, transaction];
    const processedTransactions = calculateBalance(updatedTransactions);

    setTransactions(processedTransactions);
    setTotalBalance(
      processedTransactions[processedTransactions.length - 1].balance
    );
    localStorage.setItem(
      "bankTransactions",
      JSON.stringify(processedTransactions)
    );

    setNewTransaction({
      date: new Date(),
      particular: "",
      debit: "",
      credit: "",
    });

    setShowAddTransaction(false);

    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updatedTransactions = transactions.filter(
      (t) => t.id !== selectedTransaction.id
    );
    const processedTransactions = calculateBalance(updatedTransactions);
    setTransactions(processedTransactions);
    setTotalBalance(
      processedTransactions.length > 0
        ? processedTransactions[processedTransactions.length - 1].balance
        : 0
    );
    localStorage.setItem(
      "bankTransactions",
      JSON.stringify(processedTransactions)
    );
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text("Bank Book", 14, 15);
    doc.text(`Bank: ${bankDetails.name}`, 14, 25);
    doc.text(`Account Number: ${bankDetails.accountNumber}`, 14, 35);
    doc.text(
      `Total Balance: ₹${Math.abs(totalBalance).toFixed(2)} ${
        totalBalance >= 0 ? "Cr" : "Dr"
      }`,
      14,
      45
    );
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 55);

    doc.autoTable({
      startY: 65,
      head: [["Date", "Particular", "Debit (Dr)", "Credit (Cr)", "Balance"]],
      body: transactions.map((transaction) => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.particular,
        transaction.debit ? `₹${transaction.debit.toFixed(2)}` : "-",
        transaction.credit ? `₹${transaction.credit.toFixed(2)}` : "-",
        `₹${Math.abs(transaction.balance).toFixed(2)} ${
          transaction.balance >= 0 ? "Cr" : "Dr"
        }`,
      ]),
    });

    doc.save("bank-book.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bank Book</h1>
          <div className="text-muted-foreground">
            <p>Bank: {bankDetails.name}</p>
            <p>Account Number: {bankDetails.accountNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="flex items-center gap-2"
          >
            {showAddTransaction ? "Cancel" : "Add Transaction"}
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {showAddTransaction && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddTransaction}
          className="space-y-4 p-4 border rounded-lg bg-muted/5"
        >
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePickerWithPreview
              date={newTransaction.date}
              onDateChange={(date) =>
                setNewTransaction({ ...newTransaction, date })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Particular</Label>
            <Input
              value={newTransaction.particular}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  particular: e.target.value,
                })
              }
              placeholder="Enter transaction details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Debit (Dr)</Label>
              <div className="relative">
                <ArrowUpFromLine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={newTransaction.debit}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      debit: e.target.value,
                      credit: "",
                    })
                  }
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Credit (Cr)</Label>
              <div className="relative">
                <ArrowDownToLine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={newTransaction.credit}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      credit: e.target.value,
                      debit: "",
                    })
                  }
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <h3 className="text-lg font-semibold">Total Balance</h3>
          <p className="text-2xl font-bold text-primary">
            ₹{Math.abs(totalBalance).toFixed(2)}{" "}
            <span
              className={totalBalance >= 0 ? "text-green-600" : "text-red-600"}
            >
              {totalBalance >= 0 ? "Cr" : "Dr"}
            </span>
          </p>
        </div>
        <div className="p-4 bg-muted/5 rounded-lg border">
          <h3 className="text-lg font-semibold">Transaction Summary</h3>
          <div className="mt-2 space-y-1">
            <p>Total Entries: {transactions.length}</p>
            <p>
              Last Updated:{" "}
              {transactions.length > 0
                ? new Date(
                    transactions[transactions.length - 1].date
                  ).toLocaleDateString()
                : "No transactions"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Particular</th>
                <th className="p-4 text-right font-medium">Debit (Dr)</th>
                <th className="p-4 text-right font-medium">Credit (Cr)</th>
                <th className="p-4 text-right font-medium">Balance</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <td className="p-4">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">{transaction.particular}</td>
                  <td className="p-4 text-right text-destructive">
                    {transaction.debit
                      ? `₹${transaction.debit.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="p-4 text-right text-green-600">
                    {transaction.credit
                      ? `₹${transaction.credit.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="p-4 text-right font-medium">
                    ₹{Math.abs(transaction.balance).toFixed(2)}{" "}
                    <span
                      className={
                        transaction.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {transaction.balance >= 0 ? "Cr" : "Dr"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-muted-foreground"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}

export default BankBook;
