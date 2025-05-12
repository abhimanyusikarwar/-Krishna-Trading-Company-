import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { clearAllData } from "@/utils/clearData";
import { Trash2 } from "lucide-react";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";

function Home() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClearData = () => {
    clearAllData();
    toast({
      title: "Success",
      description: "All data has been cleared. You can now start fresh.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome to Sonalika Tractors Showroom
        </h1>
        <p className="text-muted-foreground">
          Manage your showroom operations efficiently
        </p>
      </div>

      <div className="grid gap-6">
        <div className="p-6 rounded-lg border bg-destructive/5">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-destructive">
              Reset Application Data
            </h2>
            <p className="text-muted-foreground">
              Click the button below to clear all data and start fresh. This
              action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
            <p className="text-muted-foreground">
              Begin by adding suppliers in the Consigners section
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Record Transactions</h3>
            <p className="text-muted-foreground">
              Manage purchases, sales, and payments easily
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Track Finances</h3>
            <p className="text-muted-foreground">
              Monitor cash flow through various financial reports
            </p>
          </div>
        </div>
      </div>

      <DeleteConfirmation
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleClearData}
      />
    </motion.div>
  );
}

export default Home;
