import type { Product } from "./types"

export const premadeAcais: Product[] = [
  {
    id: "banana-granola",
    name: "Banana com Granola",
    description: "Açaí com banana, granola crocante e mel",
    price: 18.0,
    image: "/products/banana-granola.jpg",
    category: "premade",
  },
  {
    id: "morango-leite",
    name: "Morango com Leite Condensado",
    description: "Açaí com morangos frescos e leite condensado cremoso",
    price: 20.0,
    image: "/products/morango-leite.jpg",
    category: "premade",
  },
  {
    id: "completo",
    name: "Açaí Completo",
    description: "Açaí com banana, morango, granola, leite em pó e calda de chocolate",
    price: 25.0,
    image: "/products/completo.jpg",
    category: "premade",
  },
  {
    id: "fitness",
    name: "Açaí Fitness",
    description: "Açaí com frutas vermelhas, granola sem açúcar e pasta de amendoim",
    price: 22.0,
    image: "/products/fitness.jpg",
    category: "premade",
  },
  {
    id: "nutella",
    name: "Açaí com Nutella",
    description: "Açaí com banana, morango, granola e generosa calda de Nutella",
    price: 28.0,
    image: "/products/nutella.jpg",
    category: "premade",
  },
]

export const acaiBrProducts: Product[] = [
  {
    id: "acai-zero-acucar",
    name: "AÇAÍ ZERO AÇÚCAR",
    description: "Açaí sem adição de açúcar",
    price: 0, // Price varies by size
    image: "/products/tradicional.jpg",
    category: "sized",
    hasAdditionals: true,
  },
  {
    id: "acai-br-especial",
    name: "AÇAÍ BR ESPECIAL",
    description: "Açaí especial da casa",
    price: 0, // Price varies by size
    image: "/products/completo.jpg",
    category: "sized",
    hasAdditionals: false,
  },
]

export const productSizes: Record<string, Array<{ value: string; label: string; price: number }>> = {
  "acai-zero-acucar": [
    { value: "330ml", label: "330 ml", price: 14.0 },
    { value: "400ml", label: "400 ml", price: 17.0 },
    { value: "550ml", label: "550 ml", price: 20.0 },
  ],
  "acai-br-especial": [
    { value: "330ml", label: "330 ml", price: 14.0 },
    { value: "440ml", label: "440 ml", price: 17.0 },
    { value: "550ml", label: "550 ml", price: 20.0 },
  ],
}

export const customProduct: Product = {
  id: "custom",
  name: "Monte seu Açaí",
  description: "Escolha o tamanho e os acompanhamentos do seu jeito",
  price: 0,
  image: "/products/custom.jpg",
  category: "custom",
}

export const sizes = [
  { value: "300ml", label: "300ml", price: 12.0 },
  { value: "500ml", label: "500ml", price: 18.0 },
  { value: "700ml", label: "700ml", price: 24.0 },
]

export const toppings = [
  { value: "banana", label: "Banana", price: 2.0 },
  { value: "morango", label: "Morango", price: 3.0 },
  { value: "kiwi", label: "Kiwi", price: 3.5 },
  { value: "manga", label: "Manga", price: 2.5 },
  { value: "granola", label: "Granola", price: 2.0 },
  { value: "leite-po", label: "Leite em Pó", price: 2.0 },
  { value: "leite-condensado", label: "Leite Condensado", price: 3.0 },
  { value: "nutella", label: "Nutella", price: 5.0 },
  { value: "chocolate", label: "Calda de Chocolate", price: 2.5 },
  { value: "morango-calda", label: "Calda de Morango", price: 2.5 },
  { value: "mel", label: "Mel", price: 2.0 },
  { value: "amendoim", label: "Pasta de Amendoim", price: 3.0 },
  { value: "castanha", label: "Castanha", price: 3.5 },
  { value: "coco", label: "Coco Ralado", price: 2.0 },
]

export const additionals = [
  { value: "abacaxi", label: "Abacaxi", price: 3.0 },
  { value: "amendoim", label: "Amendoim", price: 3.0 },
  { value: "banana", label: "Banana", price: 3.0 },
  { value: "cereja", label: "Cereja", price: 3.0 },
  { value: "chantilly", label: "Chantilly", price: 3.0 },
  { value: "creme-cupuacu", label: "Creme de cupuaçu", price: 3.0 },
  { value: "doce-leite", label: "Doce de leite", price: 3.0 },
  { value: "granola", label: "Granola", price: 3.0 },
  { value: "jujuba", label: "Jujuba", price: 3.0 },
  { value: "kiwi", label: "Kiwi", price: 3.0 },
  { value: "leite-condensado", label: "Leite condensado", price: 3.0 },
  { value: "leite-po", label: "Leite em pó", price: 3.0 },
  { value: "mm", label: "M&M", price: 3.0 },
  { value: "manga", label: "Manga", price: 3.0 },
  { value: "morango", label: "Morango", price: 3.0 },
  { value: "mousse-maracuja", label: "Mousse de maracujá", price: 3.0 },
  { value: "oreo", label: "Oreo", price: 3.0 },
  { value: "ovomaltine", label: "Ovomaltine", price: 3.0 },
  { value: "pacoca", label: "Paçoca", price: 3.0 },
  { value: "sorvete-baunilha", label: "Sorvete de baunilha", price: 3.0 },
  { value: "sorvete-chocolate", label: "Sorvete de chocolate", price: 3.0 },
  { value: "sorvete-flocos", label: "Sorvete de flocos", price: 3.0 },
  { value: "sorvete-menta", label: "Sorvete de menta", price: 3.0 },
  { value: "sorvete-morango", label: "Sorvete de morango", price: 3.0 },
  { value: "sorvete-ninho-trufado", label: "Sorvete de ninho trufado", price: 3.0 },
  { value: "tubinho-recheado", label: "Tubinho recheado", price: 3.0 },
  { value: "whey-protein", label: "Whey protein", price: 3.0 },
  { value: "nutella", label: "Nutella", price: 5.0 }, // Special price
]

export const MAX_ADDITIONALS = 3
