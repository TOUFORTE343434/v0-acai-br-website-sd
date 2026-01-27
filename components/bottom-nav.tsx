"use client"

import { Home, ClipboardList, ShoppingCart } from "lucide-react"

interface BottomNavProps {
  activeTab: "home" | "orders" | "cart"
  onTabChange: (tab: "home" | "orders" | "cart") => void
  cartItemCount: number
}

export function BottomNav({ activeTab, onTabChange, cartItemCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {/* Home/Inicio */}
          <button
            onClick={() => onTabChange("home")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Início</span>
          </button>

          {/* Pedidos/Orders */}
          <button
            onClick={() => onTabChange("orders")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "orders" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs font-medium">Pedidos</span>
          </button>

          {/* Carrinho/Cart */}
          <button
            onClick={() => onTabChange("cart")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === "cart" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Carrinho</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
