"use client"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useStore } from "@/lib/store"

interface CartButtonProps {
  onClick: () => void
}

export function CartButton({ onClick }: CartButtonProps) {
  const cart = useStore((state) => state.cart)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-2xl transition-transform hover:scale-110"
      aria-label="Carrinho de compras"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground border-2 border-background">
          {itemCount}
        </Badge>
      )}
    </button>
  )
}
