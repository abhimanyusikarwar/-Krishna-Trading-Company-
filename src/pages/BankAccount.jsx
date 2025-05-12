
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmation } from "@/components/DeleteConfirmation"
import { Edit, Trash2 } from "lucide-react"

function BankAccount() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)

  useEffect(() => {
    const savedAccounts = localStorage.getItem("bankAccounts")
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!bankName || !accountNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      })
      return
    }

    const account = {
      id: editingId || Date.now(),
      bankName,
      accountNumber,
    }

    if (editingId) {
      const updatedAccounts = accounts.map((acc) =>
        acc.id === editingId ? account : acc
      )
      setAccounts(updatedAccounts)
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
      setEditingId(null)
      toast({
        title: "Success",
        description: "Bank account updated successfully",
      })
    } else {
      const updatedAccounts = [...accounts, account]
      setAccounts(updatedAccounts)
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
      toast({
        title: "Success",
        description: "Bank account added successfully",
      })
    }

    // Save bank details for BankBook
    localStorage.setItem("bankDetails", JSON.stringify({
      name: bankName,
      accountNumber: accountNumber
    }))

    // Reset form
    setBankName("")
    setAccountNumber("")
  }

  const handleEdit = (account) => {
    setEditingId(account.id)
    setBankName(account.bankName)
    setAccountNumber(account.accountNumber)
  }

  const handleDelete = (account) => {
    setSelectedAccount(account)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    const updatedAccounts = accounts.filter(acc => acc.id !== selectedAccount.id)
    setAccounts(updatedAccounts)
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    setDeleteDialogOpen(false)
    setSelectedAccount(null)
    toast({
      title: "Success",
      description: "Bank account deleted successfully",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <p className="text-muted-foreground">Manage your bank accounts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Enter bank name"
          />
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
          />
        </div>

        <Button type="submit" className="w-full">
          {editingId ? "Update Bank Account" : "Add Bank Account"}
        </Button>
      </form>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Bank Name</th>
                <th className="p-4 text-left font-medium">Account Number</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr
                  key={account.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <td className="p-4">{account.bankName}</td>
                  <td className="p-4">{account.accountNumber}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
  )
}

export default BankAccount
