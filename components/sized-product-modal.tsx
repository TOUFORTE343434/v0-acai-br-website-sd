"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { productSizes, additionals, MAX_ADDITIONALS } from "@/lib/products"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"

interface SizedProductModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onAddToCart: (product: Product, size: string, selectedAdditionals: string[]) => void
}

export function SizedProductModal({ open, onClose, product, onAddToCart }: SizedProductModalProps) {
  const { toast } = useToast()
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [step, setStep] = useState<"size" | "additionals">("size")

  useEffect(() => {
    if (open && product) {
      setStep("size")
      const sizes = productSizes[product.id]
      if (sizes && sizes.length > 0) {
        setSelectedSize("")
      }
      setSelectedAdditionals([])
    }
  }, [open, product])

  useEffect(() => {
    if (!product || !selectedSize) return

    const sizes = productSizes[product.id]
    const sizePrice = sizes?.find((s) => s.value === selectedSize)?.price || 0
    const additionalsPrice = selectedAdditionals.reduce((sum, additional) => {
      const additionalData = additionals.find((a) => a.value === additional)
      return sum + (additionalData?.price || 0)
    }, 0)
    setTotalPrice(sizePrice + additionalsPrice)
  }, [selectedSize, selectedAdditionals, product])

  const handleAdditionalToggle = (additionalValue: string) => {
    setSelectedAdditionals((prev) => {
      if (prev.includes(additionalValue)) {
        return prev.filter((a) => a !== additionalValue)
      } else if (prev.length < MAX_ADDITIONALS) {
        return [...prev, additionalValue]
      } else {
        toast({
          title: "Limite atingido",
          description: `Você pode escolher no máximo ${MAX_ADDITIONALS} adicionais.`,
          variant: "destructive",
        })
        return prev
      }
    })
  }

  const handleContinue = () => {
    if (!selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, escolha o tamanho do seu açaí.",
        variant: "destructive",
      })
      return
    }

    if (product?.hasAdditionals) {
      setStep("additionals")
    } else {
      handleAddToCart()
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize) return

    const sizes = productSizes[product.id]
    const sizeData = sizes?.find((s) => s.value === selectedSize)

    const customProduct: Product = {
      ...product,
      id: `${product.id}-${Date.now()}`,
      name: `${product.name} ${sizeData?.label}`,
      description:
        selectedAdditionals.length > 0
          ? `Com: ${selectedAdditionals.map((a) => additionals.find((ad) => ad.value === a)?.label).join(", ")}`
          : product.description,
      price: totalPrice,
    }

    onAddToCart(customProduct, selectedSize, selectedAdditionals)
    toast({
      title: "Adicionado ao carrinho!",
      description: `${customProduct.name} foi adicionado ao carrinho.`,
    })
    onClose()
    setSelectedSize("")
    setSelectedAdditionals([])
    setStep("size")
  }

  if (!product) return null

  const sizes = productSizes[product.id] || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "size" && (
            <>
              {/* Size Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-foreground">Escolha o tamanho *</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  {sizes.map((size) => (
                    <div
                      key={size.value}
                      className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                      <Label htmlFor={`size-${size.value}`} className="flex-1 cursor-pointer">
                        <span className="font-medium text-lg">{size.label}</span>
                        <span className="ml-3 text-primary font-semibold">R$ {size.price.toFixed(2)}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6"
                disabled={!selectedSize}
              >
                {product.hasAdditionals ? "Continuar" : "Adicionar ao Carrinho"}
              </Button>
            </>
          )}

          {step === "additionals" && (
            <>
              {/* Additionals Selection */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Escolha até {MAX_ADDITIONALS} adicionais (opcional)</p>
                    <p className="text-muted-foreground">
                      Selecionados: {selectedAdditionals.length}/{MAX_ADDITIONALS}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {additionals.map((additional) => (
                    <div
                      key={additional.value}
                      className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer ${
                        selectedAdditionals.length >= MAX_ADDITIONALS && !selectedAdditionals.includes(additional.value)
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <Checkbox
                        id={`additional-${additional.value}`}
                        checked={selectedAdditionals.includes(additional.value)}
                        onCheckedChange={() => handleAdditionalToggle(additional.value)}
                        disabled={
                          selectedAdditionals.length >= MAX_ADDITIONALS &&
                          !selectedAdditionals.includes(additional.value)
                        }
                      />
                      <Label htmlFor={`additional-${additional.value}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{additional.label}</span>
                        <span className="ml-2 text-primary font-semibold">
                          {additional.value === "nutella" ? "R$ 5,00" : "R$ 3,00"}
                        </span>
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

              <div className="flex gap-3">
                <Button onClick={() => setStep("size")} variant="outline" className="flex-1 text-lg py-6">
                  Voltar
                </Button>
                <Button onClick={handleAddToCart} className="flex-1 bg-secondary hover:bg-secondary/90 text-lg py-6">
                  Adicionar ao Carrinho
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
