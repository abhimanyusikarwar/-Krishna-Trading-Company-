
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  Tractor, 
  Users, 
  FileText, 
  ShoppingCart, 
  Package, 
  Receipt, 
  UserPlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Book,
  FileSpreadsheet,
  BarChart,
  Building
} from "lucide-react"

function Navbar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: "/consigners", label: "Consigners", icon: Users },
    { path: "/creditors", label: "Creditors", icon: FileText },
    { path: "/purchase", label: "Purchase", icon: ShoppingCart },
    { path: "/stock", label: "Stock", icon: Package },
    { path: "/sales-invoice", label: "Sales Invoice", icon: Receipt },
    { path: "/total-sales", label: "Total Sales", icon: BarChart },
    { path: "/debtors", label: "Debtors", icon: UserPlus },
    { path: "/cash-receive", label: "Cash Receive", icon: ArrowDownToLine },
    { path: "/cash-payment", label: "Cash Payment", icon: ArrowUpFromLine },
    { path: "/cash-book", label: "Cash Book", icon: Book },
    { path: "/bank-account", label: "Bank A/C", icon: Wallet },
    { path: "/bank-book", label: "Bank Book", icon: Building },
  ]

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Tractor className="h-6 w-6" />
            <span className="font-bold text-lg">Krishna Trading</span>
          </Link>
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-foreground/10"
                      : "hover:bg-primary-foreground/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex p-2 space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 min-w-[80px] rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-primary-foreground/10"
                    : "hover:bg-primary-foreground/5"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
