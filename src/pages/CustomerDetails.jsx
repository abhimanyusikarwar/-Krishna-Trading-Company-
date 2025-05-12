import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tractorDetails, setTractorDetails] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  useEffect(() => {
    if (id) {
      loadCustomerData();
    }
  }, [id]);

  const loadCustomerData = () => {
    const savedDebtors = JSON.parse(localStorage.getItem("debtors") || "[]");
    const currentCustomer = savedDebtors.find(
      (d) => d.id.toString() === id.toString()
    );

    if (!currentCustomer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer not found",
      });
      navigate("/total-sales");
      return;
    }

    setCustomer(currentCustomer);

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");

    const purchaseEntries = purchases
      .filter(
        (p) =>
          p.supplierName === currentCustomer.name && p.personType === "debtor"
      )
      .map((p) => ({
        id: `purchase-${p.id}`,
        date: p.date,
        credit: parseFloat(p.amount),
        debit: 0,
        mode: "Purchase",
        source: "purchase",
        modelNumber: p.modelNumber,
        chassisNumber: p.chassisNumber,
        serialNumber: p.serialNumber || "-",
        amount: parseFloat(p.amount),
      }));

    const salesEntries = sales
      .filter((s) => s.customerName === currentCustomer.name)
      .map((s) => ({
        id: `sale-${s.id}`,
        date: s.date,
        credit: 0,
        debit: 0,
        mode: "Sale",
        source: "sale",
        modelNumber: s.modelNumber,
        chassisNumber: s.chassisNumber,
        serialNumber: s.serialNumber || "-",
        amount: parseFloat(s.amount),
      }));

    setTractorDetails([...purchaseEntries, ...salesEntries]);

    const cashTransactions = JSON.parse(
      localStorage.getItem("cashTransactions") || "[]"
    )
      .filter(
        (t) => t.name === currentCustomer.name && t.personType === "debtor"
      )
      .map((t) => ({
        ...t,
        credit: t.type === "receive" ? parseFloat(t.amount) : 0,
        debit: t.type === "payment" ? parseFloat(t.amount) : 0,
        mode: "Cash",
        source: "cash",
        date: t.date,
        id: t.id,
      }));

    const bankTransactions = JSON.parse(
      localStorage.getItem("bankTransactions") || "[]"
    )
      .filter(
        (t) =>
          t.particular === currentCustomer.name && t.personType === "debtor"
      )
      .map((t) => ({
        ...t,
        credit: t.type === "receive" ? parseFloat(t.amount) : 0,
        debit: t.type === "payment" ? parseFloat(t.amount) : 0,
        mode: "Bank",
        source: "bank",
        date: t.date,
        id: t.id,
      }));

    const all = [
      ...salesEntries,
      ...purchaseEntries,
      ...cashTransactions,
      ...bankTransactions,
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    let totalPaid = 0;

    const withBalance = all.map((entry) => {
      const isCredit = entry.credit > 0;
      const isDebit = entry.debit > 0;

      if (entry.source === "sale") {
        runningBalance += entry.amount;
      } else {
        if (isCredit) {
          runningBalance -= entry.credit;
          totalPaid += entry.credit;
        }
        if (isDebit) {
          runningBalance += entry.debit;
        }
      }

      return {
        ...entry,
        isCredit,
        isDebit,
        balance: runningBalance,
      };
    });

    setTransactions(withBalance);
    setTotalPaidAmount(totalPaid);
    setRemainingAmount(runningBalance);
    setBalance(runningBalance);
  };
  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = () => {
    if (!transactionToDelete) return;

    const key =
      transactionToDelete.source === "cash"
        ? "cashTransactions"
        : "bankTransactions";

    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = existing.filter((t) => t.id !== transactionToDelete.id);
    localStorage.setItem(key, JSON.stringify(updated));

    loadCustomerData();
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);

    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };

  if (!customer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-muted-foreground">
            View customer details and transaction history
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Receive Amount
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            ₹{totalPaidAmount.toFixed(2)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Remaining Amount
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            ₹{remainingAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tractor Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tractor Details</h3>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Mode</th>
                <th className="p-4 text-left">Model No.</th>
                <th className="p-4 text-left">Chassis No.</th>
                <th className="p-4 text-left">Serial No.</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {tractorDetails.map((item, index) => (
                <tr key={index}>
                  <td className="p-4">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">{item.mode}</td>
                  <td className="p-4">{item.modelNumber}</td>
                  <td className="p-4">{item.chassisNumber}</td>
                  <td className="p-4">{item.serialNumber}</td>
                  <td className="p-4 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              {tractorDetails.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-muted-foreground"
                  >
                    No tractor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Payment History</h3>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Mode</th>
                <th className="p-4 text-right">Debit</th>
                <th className="p-4 text-right">Credit</th>
                <th className="p-4 text-right">Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td className="p-4">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">{txn.mode}</td>
                  <td className="p-4 text-right text-red-600">
                    {txn.isDebit ? `₹${txn.debit.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-4 text-right text-green-600">
                    {txn.isCredit ? `₹${txn.credit.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-4 text-right font-medium">
                    ₹{Math.abs(txn.balance).toFixed(2)}{" "}
                    <span
                      className={
                        txn.balance > 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {txn.balance > 0 ? "Dr" : "Cr"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {txn.source === "sale" || txn.source === "purchase" ? (
                      "-"
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTransaction(txn)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-muted-foreground"
                  >
                    No transactions found.
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
        onConfirm={confirmDeleteTransaction}
      />
    </motion.div>
  );
}

export default CustomerDetails;
