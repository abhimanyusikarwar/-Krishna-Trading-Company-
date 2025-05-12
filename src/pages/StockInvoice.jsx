
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { Download } from "lucide-react"

function StockInvoice() {
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    const savedStock = localStorage.getItem("stock")
    if (savedStock) {
      const stockData = JSON.parse(savedStock)
      // Transform stock data into invoice format
      const invoiceData = stockData.map(item => ({
        id: item.id || Date.now(),
        date: item.date,
        invoiceNumber: item.invoiceNumber,
        chassisNumber: item.chassisNumber,
        modelNumber: item.modelNumber,
        amount: item.amount
      }))
      setInvoices(invoiceData)
    }
  }, [])

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text("Stock Invoice Report", 14, 15)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

    doc.autoTable({
      startY: 35,
      head: [["Date", "Invoice Number", "Chassis Number", "Model", "Amount"]],
      body: invoices.map(invoice => [
        new Date(invoice.date).toLocaleDateString(),
        invoice.invoiceNumber,
        invoice.chassisNumber,
        invoice.modelNumber,
        `₹${invoice.amount.toFixed(2)}`
      ]),
    })

    doc.save("stock-invoice-report.pdf")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Stock Invoice</h1>
          <p className="text-muted-foreground">Track all stock purchases and invoices</p>
        </div>
        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Invoice Number</th>
                <th className="p-4 text-left font-medium">Chassis Number</th>
                <th className="p-4 text-left font-medium">Model</th>
                <th className="p-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <td className="p-4">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">{invoice.invoiceNumber}</td>
                  <td className="p-4">{invoice.chassisNumber}</td>
                  <td className="p-4">{invoice.modelNumber}</td>
                  <td className="p-4 text-right">₹{invoice.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default StockInvoice
