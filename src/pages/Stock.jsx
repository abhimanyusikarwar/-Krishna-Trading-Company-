
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { Download, Edit, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmation } from "@/components/DeleteConfirmation"
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview"

function Stock() {
  const [stock, setStock] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const { toast } = useToast()

  // Load stock data
  const loadStockData = () => {
    try {
      const savedStock = localStorage.getItem("stock")
      if (savedStock) {
        const stockData = JSON.parse(savedStock)
        // Ensure each item has a valid date and required properties
        const validatedStock = Array.isArray(stockData) ? stockData.map(item => {
          if (!item) return null
          return {
            id: item.id || Date.now().toString(),
            date: item.date ? new Date(item.date) : new Date(),
            invoiceNumber: item.invoiceNumber || "",
            chassisNumber: item.chassisNumber || "",
            modelNumber: item.modelNumber || "",
            amount: parseFloat(item.amount) || 0,
            supplierName: item.supplierName || "",
            personType: item.personType || ""
          }
        }).filter(Boolean) : []
        
        setStock(validatedStock)
        const total = validatedStock.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
        setTotalAmount(total)
      }
    } catch (error) {
      console.error("Error loading stock data:", error)
      toast({
        title: "Error",
        description: "Failed to load stock data",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadStockData()
  }, [])

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      
      doc.text("Stock Report", 14, 15)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)
      doc.text(`Total Stock Value: ₹${totalAmount.toFixed(2)}`, 14, 35)

      doc.autoTable({
        startY: 45,
        head: [["Date", "Invoice Number", "Chassis Number", "Model", "Supplier/Debtor", "Amount"]],
        body: stock.map(item => [
          item?.date ? new Date(item.date).toLocaleDateString() : "N/A",
          item?.invoiceNumber || "N/A",
          item?.chassisNumber || "N/A",
          item?.modelNumber || "N/A",
          `${item?.supplierName || "N/A"} (${item?.personType || "N/A"})`,
          `₹${(parseFloat(item?.amount) || 0).toFixed(2)}`
        ]),
      })

      doc.save("stock-report.pdf")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item) => {
    if (!item) return
    try {
      setEditingItem({
        ...item,
        date: item.date ? new Date(item.date) : new Date(),
        amount: parseFloat(item.amount) || 0
      })
    } catch (error) {
      console.error("Error setting edit item:", error)
      toast({
        title: "Error",
        description: "Failed to edit item",
        variant: "destructive",
      })
    }
  }

  const handleSave = () => {
    try {
      if (!editingItem) return

      const updatedStock = stock.map(item => 
        item?.id === editingItem.id ? {
          ...editingItem,
          date: editingItem.date || new Date(),
          amount: parseFloat(editingItem.amount) || 0
        } : item
      )

      // Update both stock and purchases
      localStorage.setItem("stock", JSON.stringify(updatedStock))
      
      // Update purchases if the item exists there
      const savedPurchases = localStorage.getItem("purchases")
      if (savedPurchases) {
        const purchases = JSON.parse(savedPurchases)
        const updatedPurchases = purchases.map(purchase => 
          purchase.id === editingItem.id ? {
            ...editingItem,
            date: editingItem.date || new Date(),
            amount: parseFloat(editingItem.amount) || 0
          } : purchase
        )
        localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
      }

      setStock(updatedStock)
      const total = updatedStock.reduce((sum, item) => sum + (parseFloat(item?.amount) || 0), 0)
      setTotalAmount(total)
      setEditingItem(null)

      toast({
        title: "Success",
        description: "Stock item updated successfully"
      })
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleDelete = (item) => {
    if (!item) return
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    try {
      if (!itemToDelete?.id) return

      // Remove from stock
      const updatedStock = stock.filter(item => item.id !== itemToDelete.id)
      localStorage.setItem("stock", JSON.stringify(updatedStock))
      
      // Remove from purchases if it exists there
      const savedPurchases = localStorage.getItem("purchases")
      if (savedPurchases) {
        const purchases = JSON.parse(savedPurchases)
        const updatedPurchases = purchases.filter(purchase => purchase.id !== itemToDelete.id)
        localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
      }
      
      setStock(updatedStock)
      const total = updatedStock.reduce((sum, item) => sum + (parseFloat(item?.amount) || 0), 0)
      setTotalAmount(total)
      setDeleteDialogOpen(false)
      setItemToDelete(null)

      toast({
        title: "Success",
        description: "Stock item deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Stock</h1>
            <p className="text-muted-foreground">Track all stock items</p>
          </div>
          <Button onClick={handleExportPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h3 className="text-lg font-semibold">Total Stock Value</h3>
          <p className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
        </div>

        <div className="mt-6 rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Invoice Number</th>
                  <th className="p-4 text-left font-medium">Chassis Number</th>
                  <th className="p-4 text-left font-medium">Model</th>
                  <th className="p-4 text-left font-medium">Supplier/Debtor</th>
                  <th className="p-4 text-right font-medium">Amount</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, index) => item && (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                  >
                    {editingItem?.id === item.id ? (
                      <>
                        <td className="p-4">
                          <DatePickerWithPreview
                            date={editingItem.date || new Date()}
                            onDateChange={(date) => setEditingItem({
                              ...editingItem,
                              date
                            })}
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            value={editingItem.invoiceNumber || ""}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              invoiceNumber: e.target.value
                            })}
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            value={editingItem.chassisNumber || ""}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              chassisNumber: e.target.value
                            })}
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            value={editingItem.modelNumber || ""}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              modelNumber: e.target.value
                            })}
                          />
                        </td>
                        <td className="p-4">
                          {item.supplierName} ({item.personType})
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            value={editingItem.amount || 0}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              amount: parseFloat(e.target.value) || 0
                            })}
                            className="text-right"
                          />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSave}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          {item?.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4">{item?.invoiceNumber || "N/A"}</td>
                        <td className="p-4">{item?.chassisNumber || "N/A"}</td>
                        <td className="p-4">{item?.modelNumber || "N/A"}</td>
                        <td className="p-4">
                          {item?.supplierName || "N/A"} ({item?.personType || "N/A"})
                        </td>
                        <td className="p-4 text-right">₹{(parseFloat(item?.amount) || 0).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default Stock
