import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Consigners from "@/pages/Consigners";
import Creditors from "@/pages/Creditors";
import Purchase from "@/pages/Purchase";
import Stock from "@/pages/Stock";
import SalesInvoice from "@/pages/SalesInvoice";
import TotalSales from "@/pages/TotalSales";
import CustomerDetails from "@/pages/CustomerDetails";
import Debtors from "@/pages/Debtors";
import CashReceive from "@/pages/CashReceive";
import CashPayment from "@/pages/CashPayment";
import BankAccount from "@/pages/BankAccount";
import CashBook from "@/pages/CashBook";
import BankBook from "@/pages/BankBook";
import SupplierDetails from "@/pages/SupplierDetails";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consigners" element={<Consigners />} />
            <Route path="/creditors" element={<Creditors />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/sales-invoice" element={<SalesInvoice />} />
            <Route path="/total-sales" element={<TotalSales />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
            <Route path="/debtors" element={<Debtors />} />
            <Route path="/cash-receive" element={<CashReceive />} />
            <Route path="/cash-payment" element={<CashPayment />} />
            <Route path="/bank-account" element={<BankAccount />} />
            <Route path="/cash-book" element={<CashBook />} />
            <Route path="/bank-book" element={<BankBook />} />
            <Route path="/supplier/:name" element={<SupplierDetails />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
