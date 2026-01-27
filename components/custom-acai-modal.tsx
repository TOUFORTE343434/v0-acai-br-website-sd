"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { sizes, toppings } from "@/lib/products"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface CustomAcaiModalProps {
  open: boolean
  onClose: () => void
  onAddToCart: (product: Product, size: string, selectedToppings: string[]) => void
}

export function CustomAcaiModal({ open, onClose, onAddToCart }: CustomAcaiModalProps) {
  const { toast } = useToast()
  const [selectedSize, setSelectedSize] = useState(sizes[0].value)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const sizePrice = sizes.find((s) => s.value === selectedSize)?.price || 0
    const toppingsPrice = selectedToppings.reduce((sum, topping) => {
      const toppingData = toppings.find((t) => t.value === topping)
      return sum + (toppingData?.price || 0)
    }, 0)
    setTotalPrice(sizePrice + toppingsPrice)
  }, [selectedSize, selectedToppings])

  const handleToppingToggle = (toppingValue: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingValue) ? prev.filter((t) => t !== toppingValue) : [...prev, toppingValue],
    )
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, escolha o tamanho do seu açaí.",
        variant: "destructive",
      })
      return
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: `Açaí Personalizado ${sizes.find((s) => s.value === selectedSize)?.label}`,
      description: selectedToppings.length > 0 ? `Com: ${selectedToppings.join(", ")}` : "Sem acompanhamentos",
      price: totalPrice,
      image: "/products/custom.jpg",
      category: "custom",
    }

    onAddToCart(customProduct, selectedSize, selectedToppings)
    toast({
      title: "Adicionado ao carrinho!",
      description: "Seu açaí personalizado foi adicionado.",
    })
    onClose()
    setSelectedToppings([])
    setSelectedSize(sizes[0].value)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Monte seu Açaí</DialogTitle>
          <DialogDescription>Escolha o tamanho e os acompanhamentos perfeitos para você.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-foreground">Tamanho *</Label>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
              {sizes.map((size) => (
                <div key={size.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value={size.value} id={size.value} />
                  <Label htmlFor={size.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{size.label}</span>
                    <span className="ml-2 text-muted-foreground">R$ {size.price.toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Toppings Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-foreground">Acompanhamentos (Opcional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {toppings.map((topping) => (
                <div
                  key={topping.value}
                  className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    id={topping.value}
                    checked={selectedToppings.includes(topping.value)}
                    onCheckedChange={() => handleToppingToggle(topping.value)}
                  />
                  <Label htmlFor={topping.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{topping.label}</span>
                    <span className="ml-2 text-muted-foreground">+ R$ {topping.price.toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handleAddToCart} className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6">
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
