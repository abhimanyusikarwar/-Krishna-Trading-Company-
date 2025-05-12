import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithPreview } from "@/components/DatePickerWithPreview";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

function CashPayment() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [creditors, setCreditors] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookType, setBookType] = useState("cash");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [cashBookBalance, setCashBookBalance] = useState(0);
  const [selectedPersonBalance, setSelectedPersonBalance] = useState(0);

  useEffect(() => {
    const savedCreditors = JSON.parse(
      localStorage.getItem("purchases") || "[]"
    );
    const savedDebtors = localStorage.getItem("debtors");
    const cashTransactions = JSON.parse(
      localStorage.getItem("cashTransactions") || "[]"
    );

    // Calculate cash book balance
    const balance = cashTransactions.reduce((total, t) => {
      if (t.type === "payment") return total - parseFloat(t.amount);
      return total + parseFloat(t.amount);
    }, 0);
    setCashBookBalance(balance);

    // Get unique supplier names from purchases
    const uniqueCreditors = [
      ...new Set(savedCreditors.map((p) => p.supplierName)),
    ];
    setCreditors(uniqueCreditors.map((name) => ({ id: name, name })));

    if (savedDebtors) setDebtors(JSON.parse(savedDebtors));
  }, []);

  useEffect(() => {
    if (selectedType) {
      const list =
        selectedType === "creditor"
          ? creditors
          : selectedType === "debtor"
          ? debtors
          : [];
      setFilteredList(list);
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setFilteredList([]);
    }
  }, [selectedType, creditors, debtors]);

  useEffect(() => {
    if (searchTerm) {
      const list =
        selectedType === "creditor"
          ? creditors
          : selectedType === "debtor"
          ? debtors
          : [];
      const filtered = list.filter((person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      const list =
        selectedType === "creditor"
          ? creditors
          : selectedType === "debtor"
          ? debtors
          : [];
      setFilteredList(list);
    }
  }, [searchTerm, selectedType]);

  useEffect(() => {
    if (selectedType === "cash") {
      setBookType("bank");
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedPerson && selectedType === "creditor") {
      // Calculate creditor's current balance
      const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
      const cashTransactions = JSON.parse(
        localStorage.getItem("cashTransactions") || "[]"
      );
      const bankTransactions = JSON.parse(
        localStorage.getItem("bankTransactions") || "[]"
      );

      const supplierPurchases = purchases
        .filter((p) => p.supplierName === selectedPerson)
        .reduce((total, p) => total + parseFloat(p.amount), 0);

      const supplierPayments = [
        ...cashTransactions.filter(
          (t) => t.name === selectedPerson && t.personType === "creditor"
        ),
        ...bankTransactions.filter(
          (t) => t.particular === selectedPerson && t.personType === "creditor"
        ),
      ].reduce((total, t) => total + parseFloat(t.amount || t.credit || 0), 0);

      setSelectedPersonBalance(supplierPurchases - supplierPayments);
    }
  }, [selectedPerson, selectedType]);

  const handlePersonSelect = (name) => {
    setSelectedPerson(name);
    setShowSearch(false);
    setSearchTerm("");
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setSelectedPerson("");
    setSearchTerm("");
    if (value === "cash") {
      setBookType("bank");
    } else {
      setShowSearch(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !date ||
      (!selectedPerson && selectedType !== "cash") ||
      !amount ||
      !selectedType
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    if (selectedType === "cash" && parseFloat(amount) > cashBookBalance) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount exceeds cash book balance",
      });
      return;
    }

    const transaction = {
      id: Date.now(),
      date,
      name: selectedType === "cash" ? "Cash Transfer" : selectedPerson,
      amount: parseFloat(amount),
      type: "payment",
      personType: selectedType,
      bookType: bookType,
    };

    if (selectedType === "cash") {
      // Transfer from cash to bank

      // 1. Deduct from Cash Book (as Credit)
      const cashTransactions = JSON.parse(
        localStorage.getItem("cashTransactions") || "[]"
      );
      cashTransactions.push({
        ...transaction,
        type: "payment", // treated as Credit
      });
      localStorage.setItem(
        "cashTransactions",
        JSON.stringify(cashTransactions)
      );

      // 2. Add to Bank Book (as Debit)
      const bankTransactions = JSON.parse(
        localStorage.getItem("bankTransactions") || "[]"
      );
      bankTransactions.push({
        id: transaction.id,
        date,
        particular: "Cash Transfer",
        debit: parseFloat(amount), // ✅ FIXED: use debit
        credit: 0,
        personType: "cash", // optional, for tracking
        balance: 0,
      });
      localStorage.setItem(
        "bankTransactions",
        JSON.stringify(bankTransactions)
      );
    } else {
      // Payments to creditor/debtor from selected book
      if (bookType === "cash") {
        const savedTransactions = JSON.parse(
          localStorage.getItem("cashTransactions") || "[]"
        );
        savedTransactions.push(transaction);
        localStorage.setItem(
          "cashTransactions",
          JSON.stringify(savedTransactions)
        );
      } else {
        const savedBankTransactions = JSON.parse(
          localStorage.getItem("bankTransactions") || "[]"
        );
        savedBankTransactions.push({
          ...transaction,
          credit: parseFloat(amount),
          debit: 0,
          particular: selectedPerson,
          balance: 0,
        });
        localStorage.setItem(
          "bankTransactions",
          JSON.stringify(savedBankTransactions)
        );
      }
    }

    // Reset form
    setDate(new Date());
    setSelectedType("");
    setSelectedPerson("");
    setAmount("");
    setBookType("cash");
    setSearchTerm("");
    setShowSearch(false);
    setSelectedPersonBalance(0);

    toast({
      title: "Success",
      description: `Payment recorded and added to ${
        selectedType === "cash"
          ? "Cash & Bank Book"
          : bookType === "cash"
          ? "Cash Book"
          : "Bank Book"
      }`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Cash Payment</h1>
        <p className="text-muted-foreground">Record payments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePickerWithPreview date={date} onDateChange={setDate} />
        </div>

        <div className="space-y-2">
          <Label>Select Type</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creditor">Creditor</SelectItem>
              <SelectItem value="debtor">Debtor</SelectItem>
              <SelectItem value="cash">Cash Book</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {selectedType && selectedType !== "cash" && showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label>
                Search {selectedType === "creditor" ? "Creditor" : "Debtor"}
              </Label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${
                    selectedType === "creditor" ? "creditor" : "debtor"
                  } name`}
                  className="pl-10"
                  autoFocus
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
                    No {selectedType === "creditor" ? "creditors" : "debtors"}{" "}
                    found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedPerson && selectedType !== "cash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-md border p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Selected {selectedType}
                </Label>
                <p className="text-lg font-medium">{selectedPerson}</p>
                {selectedType === "creditor" && (
                  <p className="text-sm text-muted-foreground">
                    Current Balance: ₹
                    {Math.abs(selectedPersonBalance).toFixed(2)}{" "}
                    <span
                      className={
                        selectedPersonBalance >= 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {selectedPersonBalance >= 0 ? "Dr" : "Cr"}
                    </span>
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPerson("");
                  setShowSearch(true);
                  setSelectedPersonBalance(0);
                }}
              >
                Change
              </Button>
            </div>
          </motion.div>
        )}

        {selectedType === "cash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-md border p-4"
          >
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Cash Book Balance
              </Label>
              <p className="text-lg font-medium">
                ₹{cashBookBalance.toFixed(2)}
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {selectedType !== "cash" && (
          <div className="space-y-2">
            <Label>Add to</Label>
            <Select value={bookType} onValueChange={setBookType}>
              <SelectTrigger>
                <SelectValue placeholder="Select book type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash Book</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button type="submit" className="w-full">
          Record Payment
        </Button>
      </form>
    </motion.div>
  );
}

export default CashPayment;
