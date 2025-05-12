import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [date, setDate] = useState(new Date());
  const [chassisNumber, setChassisNumber] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [personType, setPersonType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [creditors, setCreditors] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedPurchases = localStorage.getItem("purchases");
    const savedDebtors = localStorage.getItem("debtors");
    const savedSuppliers = localStorage.getItem("suppliers");

    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors));
    }
    if (savedSuppliers) {
      const suppliers = JSON.parse(savedSuppliers);
      setCreditors(suppliers.map((name) => ({ id: name, name })));
    }
  }, []);

  useEffect(() => {
    if (personType) {
      const list = personType === "creditor" ? creditors : debtors;
      setFilteredList(list);
      setShowSearch(true);
      setSupplierName("");
    }
  }, [personType, creditors, debtors]);

  useEffect(() => {
    if (searchTerm) {
      const list = personType === "creditor" ? creditors : debtors;
      const filtered = list.filter((person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      const list = personType === "creditor" ? creditors : debtors;
      setFilteredList(list);
    }
  }, [searchTerm, personType]);
  const handlePersonSelect = (name) => {
    setSupplierName(name);
    setShowSearch(false);
    setSearchTerm("");
  };

  const handleSave = () => {
    if (
      !personType ||
      !supplierName ||
      !chassisNumber ||
      !modelNumber ||
      !invoiceNumber ||
      !amount
    ) {
      setTimeout(() => {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
      }, 100);
      return;
    }

    const parsedAmount = parseFloat(amount);
    const newPurchase = {
      id: Date.now().toString(),
      supplierName,
      date: date.toISOString(),
      chassisNumber,
      modelNumber,
      invoiceNumber,
      amount: parsedAmount,
      personType,
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

    const existingStock = localStorage.getItem("stock");
    const stockData = existingStock ? JSON.parse(existingStock) : [];
    const updatedStock = [...stockData, newPurchase];
    localStorage.setItem("stock", JSON.stringify(updatedStock));

    if (personType === "debtor") {
      const savedDebtors = JSON.parse(localStorage.getItem("debtors") || "[]");
      const updatedDebtors = savedDebtors.map((debtor) => {
        if (debtor.name === supplierName) {
          return {
            ...debtor,
            balance: (parseFloat(debtor.balance) || 0) + parsedAmount,
            remainingAmount:
              (parseFloat(debtor.remainingAmount) || 0) + parsedAmount,
          };
        }
        return debtor;
      });
      localStorage.setItem("debtors", JSON.stringify(updatedDebtors));
      setDebtors(updatedDebtors);
    }

    setPersonType("");
    setSupplierName("");
    setChassisNumber("");
    setModelNumber("");
    setInvoiceNumber("");
    setAmount("");
    setSearchTerm("");
    setShowSearch(false);

    setTimeout(() => {
      toast({
        title: "Success",
        description: "Purchase saved successfully!",
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Purchase</h1>
        <p className="text-muted-foreground">Record new tractor purchases</p>
      </div>
      <div className="grid gap-4 max-w-xl">
        <div className="space-y-2">
          <Label>Select Type</Label>
          <Select value={personType} onValueChange={setPersonType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creditor">Consigner</SelectItem>
              <SelectItem value="debtor">Debtor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {personType && showSearch && (
          <div className="space-y-2">
            <Label>
              Search {personType === "creditor" ? "Consigner" : "Debtor"}
            </Label>
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${
                  personType === "creditor" ? "consigner" : "debtor"
                } name`}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border bg-background">
              {filteredList.length > 0 ? (
                filteredList.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    onClick={() => handlePersonSelect(person.name)}
                  >
                    {person.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground">
                  No {personType === "creditor" ? "consigners" : "debtors"}{" "}
                  found
                </div>
              )}
            </div>
          </div>
        )}

        {supplierName && (
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Selected {personType === "creditor" ? "Consigner" : "Debtor"}
                </Label>
                <p className="text-lg font-medium">{supplierName}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSupplierName("");
                  setShowSearch(true);
                }}
              >
                Change
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Date</Label>
          <DatePickerWithPreview date={date} onDateChange={setDate} />
        </div>

        <div className="space-y-2">
          <Label>Chassis Number</Label>
          <Input
            value={chassisNumber}
            onChange={(e) => setChassisNumber(e.target.value)}
            placeholder="Enter chassis number"
          />
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            placeholder="Enter model number"
          />
        </div>

        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <Button onClick={handleSave}>Save Purchase</Button>
      </div>
    </div>
  );
}

export default Purchase;
