
export const clearAllData = () => {
  // List of all localStorage keys used in the application
  const keys = [
    "suppliers",
    "creditors",
    "purchases",
    "stock",
    "sales",
    "debtors",
    "cashTransactions",
    "bankTransactions",
    "bankAccounts",
    "bankDetails"
  ]

  // Clear each key
  keys.forEach(key => localStorage.removeItem(key))
}
