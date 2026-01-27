"use client"
import type { Product } from "@/lib/types"
import Image from "next/image"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div
      onClick={() => onAddToCart(product)}
      className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow duration-300 cursor-pointer active:scale-[0.98]"
    >
      {/* Product Info - Left Side */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-primary mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        <p className="text-xl font-bold text-primary">
          {product.category === "custom" || product.category === "sized" ? "A partir de " : ""}
          {product.category === "sized" ? "R$ 13,00" : `R$ ${product.price.toFixed(2)}`}
        </p>
      </div>

      {/* Product Image - Right Side */}
      <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
      </div>
    </div>
  )
}
