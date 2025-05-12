
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview"

function SalesInvoice() {
  const [stock, setStock] = useState([])
  const [debtors, setDebtors] = useState([])
  const [sales, setSales] = useState([])
  const [selectedChassisNumber, setSelectedChassisNumber] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [saleDate, setSaleDate] = useState(new Date())
  const [amount, setAmount] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const savedStock = localStorage.getItem("stock")
    const savedDebtors = localStorage.getItem("debtors")
    const savedSales = localStorage.getItem("sales")
    if (savedStock) setStock(JSON.parse(savedStock))
    if (savedDebtors) setDebtors(JSON.parse(savedDebtors))
    if (savedSales) setSales(JSON.parse(savedSales))
  }, [])

  const handleSale = () => {
    if (!selectedChassisNumber || !selectedCustomer || !serialNumber || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const selectedTractor = stock.find(item => item.chassisNumber === selectedChassisNumber)
    if (!selectedTractor) {
      toast({
        title: "Error",
        description: "Selected tractor not found in stock",
        variant: "destructive",
      })
      return
    }

    const newSale = {
      id: Date.now(),
      date: saleDate.toISOString(),
      serialNumber,
      chassisNumber: selectedChassisNumber,
      modelNumber: selectedTractor.modelNumber,
      customerName: selectedCustomer,
      amount: parseFloat(amount)
    }

    // Update sales records
    const updatedSales = [...sales, newSale]
    setSales(updatedSales)
    localStorage.setItem("sales", JSON.stringify(updatedSales))

    // Remove from stock
    const updatedStock = stock.filter(item => item.chassisNumber !== selectedChassisNumber)
    setStock(updatedStock)
    localStorage.setItem("stock", JSON.stringify(updatedStock))

    // Reset form
    setSelectedChassisNumber("")
    setSelectedCustomer("")
    setSerialNumber("")
    setAmount("")

    toast({
      title: "Success",
      description: "Sale recorded successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sales Invoice</h1>
        <p className="text-muted-foreground">Record new sales</p>
      </div>

      <div className="grid gap-4 max-w-xl">
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePickerWithPreview
            date={saleDate}
            onDateChange={setSaleDate}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Enter serial number"
          />
        </div>

        <div className="space-y-2">
          <Label>Chassis Number</Label>
          <Select
            value={selectedChassisNumber}
            onValueChange={setSelectedChassisNumber}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chassis number" />
            </SelectTrigger>
            <SelectContent>
              {stock.map((item) => (
                <SelectItem key={item.chassisNumber} value={item.chassisNumber}>
                  {item.chassisNumber} - {item.modelNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Customer</Label>
          <Select
            value={selectedCustomer}
            onValueChange={setSelectedCustomer}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {debtors.map((debtor) => (
                <SelectItem key={debtor.id} value={debtor.name}>
                  {debtor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <Button onClick={handleSale}>Record Sale</Button>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Sales</h2>
          <div className="grid gap-2">
            {sales.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="grid gap-1">
                  <div className="font-medium">
                    Serial Number: {sale.serialNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Customer: {sale.customerName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Chassis: {sale.chassisNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Model: {sale.modelNumber}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Amount: ₹{sale.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date: {new Date(sale.date).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesInvoice
