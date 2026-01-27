"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { ArrowLeft, ArrowRight, Check, ShoppingCart, X } from "lucide-react"
import type { ProductSize, Addon } from "@/lib/types"

interface OrderFlowModalProps {
  open: boolean
  onClose: () => void
}

export function OrderFlowModal({ open, onClose }: OrderFlowModalProps) {
  const orderFlow = useStore((state) => state.orderFlow)
  const setSelectedSize = useStore((state) => state.setSelectedSize)
  const toggleFlavor = useStore((state) => state.toggleFlavor)
  const addAddon = useStore((state) => state.addAddon)
  const removeAddon = useStore((state) => state.removeAddon)
  const updateAddonQuantity = useStore((state) => state.updateAddonQuantity)
  const nextStep = useStore((state) => state.nextStep)
  const prevStep = useStore((state) => state.prevStep)
  const resetOrderFlow = useStore((state) => state.resetOrderFlow)
  const completeOrderFlow = useStore((state) => state.completeOrderFlow)

  const { currentProduct, selectedSize, selectedFlavors, selectedAddons, currentStep } = orderFlow

  const hasSizes = currentProduct?.sizes && currentProduct.sizes.length > 0
  const hasFlavors = currentProduct?.flavors && currentProduct.flavors.length > 0
  const hasAddons = currentProduct?.addons && currentProduct.addons.length > 0

  const getTotalSteps = () => {
    let steps = 0
    if (hasSizes) steps++
    if (hasFlavors) steps++
    if (hasAddons) steps++
    return steps
  }

  const getStepContent = () => {
    let stepIndex = 0
    
    if (hasSizes) {
      stepIndex++
      if (currentStep === stepIndex) return "sizes"
    }
    
    if (hasFlavors) {
      stepIndex++
      if (currentStep === stepIndex) return "flavors"
    }
    
    if (hasAddons) {
      stepIndex++
      if (currentStep === stepIndex) return "addons"
    }
    
    return "complete"
  }

  const canProceed = () => {
    const content = getStepContent()
    if (content === "sizes") return !!selectedSize
    if (content === "flavors") {
      const minFlavors = currentProduct?.flavor_config?.min_flavors || 1
      return selectedFlavors.length >= minFlavors
    }
    return true
  }

  const handleNext = () => {
    if (currentStep >= getTotalSteps()) {
      completeOrderFlow()
      onClose()
    } else {
      nextStep()
    }
  }

  const handleClose = () => {
    resetOrderFlow()
    onClose()
  }

  const calculateCurrentTotal = () => {
    let total = selectedSize?.price || 0
    selectedAddons.forEach(a => {
      total += a.addon.price * a.quantity
    })
    return total
  }

  if (!currentProduct || currentStep === 0) return null

  const stepContent = getStepContent()
  const totalSteps = getTotalSteps()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{currentProduct.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Passo {currentStep} de {totalSteps}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Sizes Step */}
          {stepContent === "sizes" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Escolha o tamanho</h3>
              <div className="grid gap-3">
                {currentProduct.sizes?.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSize?.id === size.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{size.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">R$ {size.price.toFixed(2)}</span>
                        {selectedSize?.id === size.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavors Step */}
          {stepContent === "flavors" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Escolha os sabores</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione de {currentProduct.flavor_config?.min_flavors || 1} a {currentProduct.flavor_config?.max_flavors || 1} sabor(es)
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {selectedFlavors.length} de {currentProduct.flavor_config?.max_flavors || 1} selecionado(s)
                </p>
              </div>
              <div className="grid gap-2">
                {currentProduct.flavors?.map((flavor) => {
                  const isSelected = selectedFlavors.includes(flavor.name)
                  const maxReached = selectedFlavors.length >= (currentProduct.flavor_config?.max_flavors || 1) && !isSelected
                  
                  return (
                    <button
                      key={flavor.id}
                      onClick={() => !maxReached && toggleFlavor(flavor.name)}
                      disabled={maxReached}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : maxReached
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{flavor.name}</span>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Addons Step */}
          {stepContent === "addons" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Adicionais</h3>
                <p className="text-sm text-muted-foreground">Opcional - escolha seus complementos</p>
              </div>
              <div className="grid gap-2">
                {currentProduct.addons?.map((productAddon) => {
                  const addon = productAddon.addon
                  if (!addon) return null
                  
                  const selectedAddon = selectedAddons.find(a => a.addon.id === addon.id)
                  const quantity = selectedAddon?.quantity || 0
                  
                  return (
                    <div
                      key={addon.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        quantity > 0 ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{addon.name}</span>
                          <span className="text-sm text-primary ml-2">+R$ {addon.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {quantity > 0 ? (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateAddonQuantity(addon.id, quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-6 text-center font-medium">{quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                                disabled={quantity >= productAddon.max_quantity}
                              >
                                +
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addAddon(addon)}
                            >
                              Adicionar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total do item:</span>
            <span className="text-2xl font-bold text-primary">R$ {calculateCurrentTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {currentStep >= totalSteps ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
