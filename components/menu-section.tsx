"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CustomAcaiModal } from "@/components/custom-acai-modal"
import { SizedProductModal } from "@/components/sized-product-modal"
import { premadeAcais, acaiBrProducts } from "@/lib/products"
import type { Product } from "@/lib/types"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function MenuSection() {
  const { toast } = useToast()
  const addToCart = useStore((state) => state.addToCart)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [showSizedModal, setShowSizedModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleAddToCart = (product: Product) => {
    if (product.category === "custom") {
      setShowCustomModal(true)
    } else if (product.category === "sized") {
      setSelectedProduct(product)
      setShowSizedModal(true)
    } else {
      addToCart({ product, quantity: 1 })
      toast({
        title: "Adicionado ao carrinho!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      })
    }
  }

  const handleCustomAddToCart = (product: Product, size: string, selectedToppings: string[]) => {
    addToCart({ product, quantity: 1, size, toppings: selectedToppings })
  }

  const handleSizedAddToCart = (product: Product, size: string, selectedAdditionals: string[]) => {
    addToCart({ product, quantity: 1, size, additionals: selectedAdditionals })
  }

  return (
    <section id="menu-section" className="py-8 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* AÇAÍ BR Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">AÇAÍ BR</h2>
          <div className="space-y-3">
            {acaiBrProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>

        {/* Custom Açaí Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Monte seu Açaí</h2>
          <ProductCard
            product={{
              id: "custom",
              name: "Monte seu Açaí",
              description: "Escolha o tamanho e os acompanhamentos do seu jeito",
              price: 12,
              image: "/products/custom.jpg",
              category: "custom",
            }}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Premade Açaís Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Açaís Prontos</h2>
          <div className="space-y-3">
            {premadeAcais.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </div>

      <CustomAcaiModal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAddToCart={handleCustomAddToCart}
      />

      <SizedProductModal
        open={showSizedModal}
        onClose={() => {
          setShowSizedModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onAddToCart={handleSizedAddToCart}
      />
    </section>
  )
}
