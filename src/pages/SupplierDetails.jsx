import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmation } from "@/components/DeleteConfirmation"

function SupplierDetails() {
  const { name: supplierName } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)

  useEffect(() => {
    if (supplierName) {
      loadTransactions()
    }
  }, [supplierName])

  const loadTransactions = () => {
    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]")
    const supplierPurchases = purchases
      .filter(p => p.supplierName === decodeURIComponent(supplierName))
      .map(p => ({
        id: p.id,
        date: p.date,
        amount: parseFloat(p.amount),
        type: "purchase",
        invoiceNumber: p.invoiceNumber,
        modelNumber: p.modelNumber,
        chassisNumber: p.chassisNumber,
        isCredit: true
      }))

    const cashPayments = JSON.parse(localStorage.getItem("cashTransactions") || "[]")
    const bankPayments = JSON.parse(localStorage.getItem("bankTransactions") || "[]")

    const supplierPayments = [
      ...cashPayments.filter(p => p.name === decodeURIComponent(supplierName) && p.personType === "creditor"),
      ...bankPayments.filter(p => p.particular === decodeURIComponent(supplierName) && p.personType === "creditor")
    ].map(p => ({
      id: p.id,
      date: p.date,
      amount: parseFloat(p.amount || p.credit || 0),
      type: "payment",
      bookType: p.bookType || (p.credit ? "bank" : "cash"),
      isDebit: true
    }))

    const allTransactions = [...supplierPurchases, ...supplierPayments]
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    let runningBalance = 0
    const transactionsWithBalance = allTransactions.map(t => {
      if (t.isCredit) {
        runningBalance += t.amount
      } else if (t.isDebit) {
        runningBalance -= t.amount
      }
      return { ...t, balance: runningBalance }
    })

    setTransactions(transactionsWithBalance)
    setBalance(runningBalance)
  }

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTransaction = () => {
    if (!transactionToDelete) return

    if (transactionToDelete.type === "purchase") {
      const purchases = JSON.parse(localStorage.getItem("purchases") || "[]")
      const updatedPurchases = purchases.filter(p => p.id !== transactionToDelete.id)
      localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
    } else {
      if (transactionToDelete.bookType === "cash") {
        const cashTransactions = JSON.parse(localStorage.getItem("cashTransactions") || "[]")
        const updatedCashTransactions = cashTransactions.filter(t => t.id !== transactionToDelete.id)
        localStorage.setItem("cashTransactions", JSON.stringify(updatedCashTransactions))
      } else {
        const bankTransactions = JSON.parse(localStorage.getItem("bankTransactions") || "[]")
        const updatedBankTransactions = bankTransactions.filter(t => t.id !== transactionToDelete.id)
        localStorage.setItem("bankTransactions", JSON.stringify(updatedBankTransactions))
      }
    }

    loadTransactions()
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)

    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {decodeURIComponent(supplierName)}
          </h2>
          <p className="text-muted-foreground">
            View supplier details and transaction history
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium text-muted-foreground">
          Current Balance
        </div>
        <div className="mt-1 text-2xl font-bold">
          ₹{Math.abs(balance).toFixed(2)}{" "}
          <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
            {balance > 0 ? "Cr" : "Dr"}
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Date</th>
              <th className="p-4 text-left font-medium">Type</th>
              <th className="p-4 text-left font-medium">Mode</th>
              <th className="p-4 text-left font-medium">Invoice No.</th>
              <th className="p-4 text-right font-medium">Debit</th>
              <th className="p-4 text-right font-medium">Credit</th>
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
                <td className="p-4">
                  {transaction.type === "purchase" ? "Purchase" : "Payment"}
                </td>
                <td className="p-4">
                  {transaction.type === "purchase"
                    ? "-"
                    : transaction.bookType === "bank"
                    ? "Bank"
                    : "Cash"}
                </td>
                <td className="p-4">
                  {transaction.invoiceNumber || "-"}
                </td>
                <td className="p-4 text-right text-green-600">
                  {transaction.isDebit
                    ? `₹${transaction.amount.toFixed(2)}`
                    : "-"}
                </td>
                <td className="p-4 text-right text-red-600">
                  {transaction.isCredit
                    ? `₹${transaction.amount.toFixed(2)}`
                    : "-"}
                </td>
                <td className="p-4 text-right font-medium">
                  ₹{Math.abs(transaction.balance).toFixed(2)}{" "}
                  <span
                    className={
                      transaction.balance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {transaction.balance > 0 ? "Cr" : "Dr"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-muted-foreground"
                >
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
        onConfirm={confirmDeleteTransaction}
      />
    </motion.div>
  )
}

export default SupplierDetails
