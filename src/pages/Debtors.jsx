
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmation } from "@/components/DeleteConfirmation"
import { Edit, Trash2 } from "lucide-react"

function Debtors() {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date())
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [finance, setFinance] = useState("") // New finance field
  const [debtors, setDebtors] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDebtor, setSelectedDebtor] = useState(null)

  useEffect(() => {
    const savedDebtors = localStorage.getItem("debtors")
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!date || !name || !address || !phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const debtor = {
      id: editingId || Date.now(),
      date,
      name,
      address,
      phone,
      finance,
    }

    if (editingId) {
      const updatedDebtors = debtors.map((d) =>
        d.id === editingId ? { ...d, ...debtor } : d
      )
      setDebtors(updatedDebtors)
      localStorage.setItem("debtors", JSON.stringify(updatedDebtors))
      setEditingId(null)
      toast({
        title: "Success",
        description: "Debtor updated successfully",
      })
    } else {
      const updatedDebtors = [...debtors, debtor]
      setDebtors(updatedDebtors)
      localStorage.setItem("debtors", JSON.stringify(updatedDebtors))
      toast({
        title: "Success",
        description: "Debtor added successfully",
      })
    }

    // Reset form
    setDate(new Date())
    setName("")
    setAddress("")
    setPhone("")
    setFinance("")
  }

  const handleEdit = (debtor) => {
    setEditingId(debtor.id)
    setDate(new Date(debtor.date))
    setName(debtor.name)
    setAddress(debtor.address)
    setPhone(debtor.phone)
    setFinance(debtor.finance)
  }

  const handleDelete = (debtor) => {
    setSelectedDebtor(debtor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    const updatedDebtors = debtors.filter(d => d.id !== selectedDebtor.id)
    setDebtors(updatedDebtors)
    localStorage.setItem("debtors", JSON.stringify(updatedDebtors))
    setDeleteDialogOpen(false)
    setSelectedDebtor(null)
    toast({
      title: "Success",
      description: "Debtor deleted successfully",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Debtors</h1>
        <p className="text-muted-foreground">Manage your debtors</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePickerWithPreview date={date} onDateChange={setDate} />
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter debtor name"
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label>Finance</Label>
          <Input
            value={finance}
            onChange={(e) => setFinance(e.target.value)}
            placeholder="Enter finance details"
          />
        </div>

        <Button type="submit" className="w-full">
          {editingId ? "Update Debtor" : "Add Debtor"}
        </Button>
      </form>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Address</th>
                <th className="p-4 text-left font-medium">Phone</th>
                <th className="p-4 text-left font-medium">Finance</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((debtor, index) => (
                <tr
                  key={debtor.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <td className="p-4">
                    {new Date(debtor.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">{debtor.name}</td>
                  <td className="p-4">{debtor.address}</td>
                  <td className="p-4">{debtor.phone}</td>
                  <td className="p-4">{debtor.finance}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(debtor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(debtor)}
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

export default Debtors
