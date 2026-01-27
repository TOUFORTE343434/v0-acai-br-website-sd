"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const cart = useStore((state) => state.cart)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const updateQuantity = useStore((state) => state.updateQuantity)
  const getCartTotal = useStore((state) => state.getCartTotal)

  const handleCheckout = () => {
    onClose()
    onCheckout()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl text-primary">Seu Carrinho</SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Seu carrinho está vazio."
              : `${cart.length} ${cart.length === 1 ? "item" : "itens"} no carrinho`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Adicione itens ao seu carrinho para continuar.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.productImage || "/placeholder.svg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">{item.productName}</h3>
                    {item.sizeName && (
                      <p className="text-sm text-muted-foreground">Tamanho: {item.sizeName}</p>
                    )}
                    {item.flavors && item.flavors.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Sabores: {item.flavors.join(", ")}
                      </p>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Adicionais: {item.addons.map(a => `${a.name} (x${a.quantity})`).join(", ")}
                      </p>
                    )}
                    <p className="font-bold text-primary mt-1">R$ {item.itemTotal.toFixed(2)}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="font-bold text-primary">R$ {(item.itemTotal * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">R$ {getCartTotal().toFixed(2)}</span>
            </div>

            <Button onClick={handleCheckout} className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6">
              Finalizar Pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
