import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Search, Trash2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

function TotalSales() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [debtorList, setDebtorList] = useState([]);
  const [remainingMap, setRemainingMap] = useState({});
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    const savedDebtors = JSON.parse(localStorage.getItem("debtors") || "[]");
    const savedPurchases = JSON.parse(
      localStorage.getItem("purchases") || "[]"
    );
    const cashTransactions = JSON.parse(
      localStorage.getItem("cashTransactions") || "[]"
    );
    const bankTransactions = JSON.parse(
      localStorage.getItem("bankTransactions") || "[]"
    );

    setSales(savedSales);
    setDebtorList(savedDebtors);

    const balanceMap = {};
    let total = 0;

    savedDebtors.forEach((debtor) => {
      const customerName = debtor.name;

      const totalSales = savedSales
        .filter((s) => s.customerName === customerName)
        .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

      const totalPurchaseFromCustomer = savedPurchases
        .filter(
          (p) => p.supplierName === customerName && p.personType === "debtor"
        )
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const totalReceivedCash = cashTransactions
        .filter(
          (t) =>
            t.name === customerName &&
            t.personType === "debtor" &&
            t.type === "receive"
        )
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const totalReceivedBank = bankTransactions
        .filter(
          (t) =>
            t.particular === customerName &&
            t.personType === "debtor" &&
            t.type === "receive"
        )
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const remaining =
        totalSales -
        (totalReceivedCash + totalReceivedBank + totalPurchaseFromCustomer);
      balanceMap[customerName] = remaining;
      total += remaining;
    });

    setRemainingMap(balanceMap);
    setTotalBalance(total);
  }, []);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (sale) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    try {
      const updatedSales = sales.filter((s) => s.id !== selectedSale.id);
      setSales(updatedSales);
      localStorage.setItem("sales", JSON.stringify(updatedSales));
      setDeleteDialogOpen(false);
      setSelectedSale(null);
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete sale",
      });
    }
  };

  const handleCustomerClick = (customerName) => {
    const customer = debtorList.find((d) => d.name === customerName);
    if (customer) {
      navigate(`/customer/${customer.id}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer details not found",
      });
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchString = searchTerm.toLowerCase();
    return (
      sale.customerName.toLowerCase().includes(searchString) ||
      sale.modelNumber.toLowerCase().includes(searchString) ||
      sale.chassisNumber.toLowerCase().includes(searchString) ||
      sale.serialNumber.toLowerCase().includes(searchString)
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Total Sales Report", 14, 15);
    doc.text(`Total Remaining Balance: ₹${totalBalance.toFixed(2)}`, 14, 25);
    doc.autoTable({
      startY: 35,
      head: [
        ["Customer Name", "Phone", "Model", "Chassis", "Serial", "Remaining"],
      ],
      body: filteredSales.map((sale) => {
        const debtor = debtorList.find((d) => d.name === sale.customerName);
        const phone = debtor?.phone || "-";
        const balance = remainingMap[sale.customerName] || 0;
        return [
          sale.customerName,
          phone,
          sale.modelNumber,
          sale.chassisNumber,
          sale.serialNumber,
          `₹${balance.toFixed(2)}`,
        ];
      }),
    });
    doc.save("total-sales-report.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Total Sales</h1>
        <div className="flex gap-2">
          <div className="text-xl font-semibold text-primary">
            Total Remaining: ₹{totalBalance.toFixed(2)}
          </div>
          <Button onClick={handleExportPDF} className="flex gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer, model, chassis or serial number..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Model</th>
              <th className="p-4 text-left">Chassis</th>
              <th className="p-4 text-left">Serial</th>
              <th className="p-4 text-right">Remaining</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale, index) => {
              const debtor = debtorList.find(
                (d) => d.name === sale.customerName
              );
              const phone = debtor?.phone || "-";
              const balance = remainingMap[sale.customerName] || 0;
              return (
                <tr
                  key={sale.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <td className="p-4">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleCustomerClick(sale.customerName)}
                      className="text-primary hover:underline text-left"
                    >
                      {sale.customerName}
                    </button>
                  </td>
                  <td className="p-4">{phone}</td>
                  <td className="p-4">{sale.modelNumber}</td>
                  <td className="p-4">{sale.chassisNumber}</td>
                  <td className="p-4">{sale.serialNumber}</td>
                  <td className="p-4 text-right">₹{balance.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(sale)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filteredSales.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-muted-foreground"
                >
                  No sales found
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
  );
}

export default TotalSales;
