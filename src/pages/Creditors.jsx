
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmation } from "@/components/DeleteConfirmation"

function Creditors() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState([])
  const [transactions, setTransactions] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const savedPurchases = localStorage.getItem("purchases")
    const cashTransactions = localStorage.getItem("cashTransactions")
    const bankTransactions = localStorage.getItem("bankTransactions")

    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases))
    }
    setTransactions([
      ...JSON.parse(cashTransactions || "[]"),
      ...JSON.parse(bankTransactions || "[]")
    ])
  }

  const handleSupplierClick = (supplier) => {
    navigate(`/supplier/${encodeURIComponent(supplier)}`)
  }

  const handleDelete = (supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    const updatedPurchases = purchases.filter(
      purchase => purchase.supplierName !== supplierToDelete
    )
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
    setPurchases(updatedPurchases)
    setDeleteDialogOpen(false)
    setSupplierToDelete(null)
    toast({
      title: "Success",
      description: "Supplier deleted successfully"
    })
  }

  const getSupplierSummary = () => {
    const summary = {}

    // Initialize summary with purchase amounts
    purchases.forEach(purchase => {
      if (!summary[purchase.supplierName]) {
        summary[purchase.supplierName] = {
          purchases: parseFloat(purchase.amount),
          balance: parseFloat(purchase.amount)
        }
      } else {
        summary[purchase.supplierName].purchases += parseFloat(purchase.amount)
        summary[purchase.supplierName].balance += parseFloat(purchase.amount)
      }
    })

    // Update balances with payments
    transactions.forEach(transaction => {
      const supplierName = transaction.name || transaction.particular
      if (summary[supplierName] && transaction.personType === "creditor") {
        if (transaction.type === "payment" || transaction.credit) {
          summary[supplierName].balance -= parseFloat(transaction.amount || transaction.credit || 0)
        }
      }
    })

    return Object.entries(summary).map(([supplier, data], index) => ({
      srNo: index + 1,
      supplier,
      purchase: data.purchases,
      balance: data.balance
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Creditors</h1>
        <p className="text-muted-foreground">Manage supplier information</p>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Sr No.</th>
              <th className="p-4 text-left font-medium">Supplier</th>
              <th className="p-4 text-right font-medium">Purchase</th>
              <th className="p-4 text-right font-medium">Balance</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSupplierSummary().map((item) => (
              <tr key={item.srNo} className="border-b">
                <td className="p-4">{item.srNo}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleSupplierClick(item.supplier)}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    {item.supplier}
                  </button>
                </td>
                <td className="p-4 text-right">₹{item.purchase.toFixed(2)}</td>
                <td className="p-4 text-right font-medium">
                  ₹{Math.abs(item.balance).toFixed(2)}{" "}
                  <span className={item.balance > 0 ? "text-red-600" : "text-green-600"}>
                    {item.balance > 0 ? "Dr" : "Cr"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.supplier)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {getSupplierSummary().length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-muted-foreground">
                  No suppliers found
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
  )
}

export default Creditors
