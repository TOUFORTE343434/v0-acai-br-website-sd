"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Customer, CartItem, Product, ProductSize, Addon, StoreSettings } from "./types"

interface OrderFlowState {
  currentProduct: Product | null
  selectedSize: ProductSize | null
  selectedFlavors: string[]
  selectedAddons: { addon: Addon; quantity: number }[]
  currentStep: number
}

interface StoreState {
  customer: Customer | null
  cart: CartItem[]
  deliveryFee: number
  paymentMethod: string
  storeSettings: StoreSettings | null
  orderFlow: OrderFlowState
  
  // Customer actions
  setCustomer: (customer: Customer) => void
  
  // Cart actions
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartSubtotal: () => number
  
  // Settings actions
  setDeliveryFee: (fee: number) => void
  setPaymentMethod: (method: string) => void
  setStoreSettings: (settings: StoreSettings) => void
  
  // Order flow actions
  startOrderFlow: (product: Product) => void
  setSelectedSize: (size: ProductSize) => void
  toggleFlavor: (flavor: string) => void
  addAddon: (addon: Addon) => void
  removeAddon: (addonId: string) => void
  updateAddonQuantity: (addonId: string, quantity: number) => void
  nextStep: () => void
  prevStep: () => void
  resetOrderFlow: () => void
  completeOrderFlow: () => void
}

const initialOrderFlow: OrderFlowState = {
  currentProduct: null,
  selectedSize: null,
  selectedFlavors: [],
  selectedAddons: [],
  currentStep: 0
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      customer: null,
      cart: [],
      deliveryFee: 0,
      paymentMethod: "",
      storeSettings: null,
      orderFlow: initialOrderFlow,
      
      setCustomer: (customer) => set({ customer }),
      
      addToCart: (item) => set({ cart: [...get().cart, item] }),
      
      removeFromCart: (itemId) => set({ cart: get().cart.filter((i) => i.id !== itemId) }),
      
      updateQuantity: (itemId, quantity) =>
        set({
          cart: get().cart.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        }),
      
      clearCart: () => set({ cart: [] }),
      
      getCartSubtotal: () => {
        return get().cart.reduce((total, item) => total + item.itemTotal * item.quantity, 0)
      },
      
      getCartTotal: () => {
        const subtotal = get().getCartSubtotal()
        return subtotal + get().deliveryFee
      },
      
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setStoreSettings: (settings) => set({ storeSettings: settings }),
      
      // Order flow actions
      startOrderFlow: (product) => set({
        orderFlow: {
          ...initialOrderFlow,
          currentProduct: product,
          currentStep: 1
        }
      }),
      
      setSelectedSize: (size) => set({
        orderFlow: { ...get().orderFlow, selectedSize: size }
      }),
      
      toggleFlavor: (flavor) => {
        const { orderFlow } = get()
        const maxFlavors = orderFlow.currentProduct?.flavor_config?.max_flavors || 1
        const currentFlavors = orderFlow.selectedFlavors
        
        if (currentFlavors.includes(flavor)) {
          set({
            orderFlow: {
              ...orderFlow,
              selectedFlavors: currentFlavors.filter(f => f !== flavor)
            }
          })
        } else if (currentFlavors.length < maxFlavors) {
          set({
            orderFlow: {
              ...orderFlow,
              selectedFlavors: [...currentFlavors, flavor]
            }
          })
        }
      },
      
      addAddon: (addon) => {
        const { orderFlow } = get()
        const existing = orderFlow.selectedAddons.find(a => a.addon.id === addon.id)
        if (!existing) {
          set({
            orderFlow: {
              ...orderFlow,
              selectedAddons: [...orderFlow.selectedAddons, { addon, quantity: 1 }]
            }
          })
        }
      },
      
      removeAddon: (addonId) => {
        const { orderFlow } = get()
        set({
          orderFlow: {
            ...orderFlow,
            selectedAddons: orderFlow.selectedAddons.filter(a => a.addon.id !== addonId)
          }
        })
      },
      
      updateAddonQuantity: (addonId, quantity) => {
        const { orderFlow } = get()
        if (quantity <= 0) {
          set({
            orderFlow: {
              ...orderFlow,
              selectedAddons: orderFlow.selectedAddons.filter(a => a.addon.id !== addonId)
            }
          })
        } else {
          set({
            orderFlow: {
              ...orderFlow,
              selectedAddons: orderFlow.selectedAddons.map(a =>
                a.addon.id === addonId ? { ...a, quantity } : a
              )
            }
          })
        }
      },
      
      nextStep: () => set({
        orderFlow: { ...get().orderFlow, currentStep: get().orderFlow.currentStep + 1 }
      }),
      
      prevStep: () => set({
        orderFlow: { ...get().orderFlow, currentStep: get().orderFlow.currentStep - 1 }
      }),
      
      resetOrderFlow: () => set({ orderFlow: initialOrderFlow }),
      
      completeOrderFlow: () => {
        const { orderFlow, cart } = get()
        const { currentProduct, selectedSize, selectedFlavors, selectedAddons } = orderFlow
        
        if (!currentProduct) return
        
        let itemTotal = selectedSize?.price || 0
        selectedAddons.forEach(a => {
          itemTotal += a.addon.price * a.quantity
        })
        
        const newItem: CartItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product: currentProduct,
          size: selectedSize || undefined,
          selectedFlavors,
          selectedAddons,
          quantity: 1,
          itemTotal
        }
        
        set({
          cart: [...cart, newItem],
          orderFlow: initialOrderFlow
        })
      }
    }),
    {
      name: "acai-br-storage",
    },
  ),
)

// Alias for backwards compatibility
const useAppStore = useStore

export { useStore, useAppStore }
