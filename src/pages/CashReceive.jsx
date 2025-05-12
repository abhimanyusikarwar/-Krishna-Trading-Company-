import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

function CashReceive() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [debtors, setDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState("");
  const [bookType, setBookType] = useState("cash");

  useEffect(() => {
    const savedDebtors = localStorage.getItem("debtors");
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !selectedDebtor || !amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    const transaction = {
      id: Date.now(),
      date,
      name: selectedDebtor,
      amount: parsedAmount,
      type: "receive",
      personType: "debtor",
    };

    // Save to appropriate book based on selection
    if (bookType === "cash") {
      const savedTransactions = JSON.parse(
        localStorage.getItem("cashTransactions") || "[]"
      );
      savedTransactions.push({
        ...transaction,
        credit: parsedAmount,
        debit: 0,
      });
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
        particular: selectedDebtor,
        debit: parsedAmount,
        credit: 0,
      });
      localStorage.setItem(
        "bankTransactions",
        JSON.stringify(savedBankTransactions)
      );
    }

    // Update debtor's balance
    const updatedDebtors = debtors.map((debtor) => {
      if (debtor.name === selectedDebtor) {
        const currentBalance = parseFloat(debtor.balance || 0);
        const currentTotalPaid = parseFloat(debtor.totalPaid || 0);
        return {
          ...debtor,
          balance: currentBalance - parsedAmount,
          totalPaid: currentTotalPaid + parsedAmount,
          remainingAmount: currentBalance - parsedAmount,
        };
      }
      return debtor;
    });
    localStorage.setItem("debtors", JSON.stringify(updatedDebtors));
    setDebtors(updatedDebtors);

    // Reset form
    setDate(new Date());
    setSelectedDebtor("");
    setAmount("");
    setBookType("cash");

    toast({
      title: "Success",
      description: `Payment received and added to ${
        bookType === "cash" ? "Cash Book" : "Bank Book"
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
        <h1 className="text-3xl font-bold">Cash Receive</h1>
        <p className="text-muted-foreground">
          Record cash received from debtors
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePickerWithPreview date={date} onDateChange={setDate} />
        </div>

        <div className="space-y-2">
          <Label>Select Debtor</Label>
          <Select value={selectedDebtor} onValueChange={setSelectedDebtor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a debtor" />
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
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

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

        <Button type="submit" className="w-full">
          Record Cash Receive
        </Button>
      </form>
    </motion.div>
  );
}

export default CashReceive;
