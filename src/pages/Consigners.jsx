
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

function Consigners() {
  const [suppliers, setSuppliers] = useState([])
  const [newSupplier, setNewSupplier] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const savedSuppliers = localStorage.getItem("suppliers")
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers))
    }
  }, [])

  const handleAddSupplier = () => {
    if (!newSupplier.trim()) {
      toast({
        title: "Error",
        description: "Please enter a supplier name",
        variant: "destructive",
      })
      return
    }

    const updatedSuppliers = [...suppliers, newSupplier]
    setSuppliers(updatedSuppliers)
    localStorage.setItem("suppliers", JSON.stringify(updatedSuppliers))
    setNewSupplier("")
    toast({
      title: "Success",
      description: "Supplier added successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Consigners</h1>
        <p className="text-muted-foreground">Add and manage suppliers</p>
      </div>
      <div className="grid gap-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier Name</Label>
          <div className="flex space-x-2">
            <Input
              id="supplier"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              placeholder="Enter supplier name"
            />
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Supplier List</h2>
          <div className="grid gap-2">
            {suppliers.map((supplier, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                {supplier}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Consigners
