"use client"

import React from "react"
import { useEffect, useState } from "react"
import { RegistrationModal } from "@/components/registration-modal"
import { CheckoutSection } from "@/components/checkout-section"
import { BottomNav } from "@/components/bottom-nav"
import { OrderFlowModal } from "@/components/order-flow-modal"
import { useStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ShoppingCart, Plus, Minus, Trash2, Package, Clock, CheckCircle, Truck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product, StoreSettings, Address } from "@/lib/types"

// Status configuration for orders
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800", icon: Package },
  ready: { label: "Pronto", color: "bg-green-100 text-green-800", icon: CheckCircle },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800", icon: Truck },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: Clock },
}

const paymentNames: Record<string, string> = {
  money: "Dinheiro",
  pix: "PIX",
  card: "Cartão",
}

interface SavedOrder {
  id: string
  date: string
  total: number
  status: string
  items: Array<{
    product: { name: string }
    size?: { name: string }
    selectedFlavors: string[]
    selectedAddons: Array<{ addon: { name: string }; quantity: number }>
    quantity: number
    itemTotal: number
  }>
  deliveryType: "pickup" | "delivery"
  paymentMethod: string
}

export default function Home() {
  const { toast } = useToast()
  const supabase = createClient()
  
  const customer = useStore((state) => state.customer)
  const cart = useStore((state) => state.cart)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const updateQuantity = useStore((state) => state.updateQuantity)
  const getCartTotal = useStore((state) => state.getCartTotal)
  const getCartSubtotal = useStore((state) => state.getCartSubtotal)
  const clearCart = useStore((state) => state.clearCart)
  const deliveryFee = useStore((state) => state.deliveryFee)
  const startOrderFlow = useStore((state) => state.startOrderFlow)
  const orderFlow = useStore((state) => state.orderFlow)
  const setStoreSettings = useStore((state) => state.setStoreSettings)
  const storeSettings = useStore((state) => state.storeSettings)
  const hasHydrated = useStore((state) => state._hasHydrated)

  const [showRegistration, setShowRegistration] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showOrderFlow, setShowOrderFlow] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"home" | "orders" | "cart">("home")
  const [selectedCategory, setSelectedCategory] = useState<"tradicional" | "especial">("tradicional")
  const [cartItemCount, setCartItemCount] = useState<number>(0)
  
  // Orders history state
  const [myOrders, setMyOrders] = useState<SavedOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null)
  const [message, setMessage] = useState<string>("")

  // Only show registration modal after hydration AND if no customer exists
  useEffect(() => {
    if (hasHydrated && !customer) {
      setShowRegistration(true)
    } else if (hasHydrated && customer) {
      setShowRegistration(false)
    }
  }, [hasHydrated, customer])

  useEffect(() => {
    loadProducts()
    loadSettings()
    loadMyOrders()
    setCartItemCount(cart.length)
  }, [cart])

  // Listener em tempo real para atualizações de pedidos
  useEffect(() => {
    if (selectedOrder?.id) {
      const subscription = supabase
        .from("orders")
        .on("*", (payload: any) => {
          if (payload.new?.id === selectedOrder.id) {
            // Atualizar o pedido selecionado com os novos dados
            setSelectedOrder((prev) =>
              prev ? { ...prev, status: payload.new.status } : null
            )
            // Atualizar também a lista de pedidos
            setMyOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? { ...order, status: payload.new.status } : order
              )
            )
          }
        })
        .subscribe()

      return () => {
        subscription?.unsubscribe()
      }
    }
  }, [selectedOrder?.id])

  useEffect(() => {
    if (orderFlow.currentStep > 0) {
      setShowOrderFlow(true)
    }
  }, [orderFlow.currentStep])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("products")
        .select(`
          *,
          sizes:product_sizes(*),
          flavors:flavors(*),
          flavor_config:product_flavor_config(*),
          product_addons:product_addons(*, addon:addons(*))
        `)
        .eq("active", true)
        .order("created_at", { ascending: false })
      
      if (data) {
        setProducts(data.map(p => ({
          ...p,
          flavor_config: p.flavor_config?.[0] || null,
          addons: p.product_addons
        })))
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
    setLoading(false)
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from("store_settings").select("*").single()
      if (data) {
        setStoreSettings(data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const loadMyOrders = () => {
    try {
      const savedOrders = localStorage.getItem("acaibr_orders")
      if (savedOrders) {
        setMyOrders(JSON.parse(savedOrders))
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    }
  }

  const saveOrderToHistory = (orderId: string, orderTotal: number, deliveryType: string, paymentMethod: string) => {
    const newOrder: SavedOrder = {
      id: orderId,
      date: new Date().toISOString(),
      total: orderTotal,
      status: "pending",
      items: cart.map(item => ({
        product: { name: item.product.name },
        size: item.size ? { name: item.size.name } : undefined,
        selectedFlavors: item.selectedFlavors,
        selectedAddons: item.selectedAddons.map(a => ({
          addon: { name: a.addon.name },
          quantity: a.quantity
        })),
        quantity: item.quantity,
        itemTotal: item.itemTotal
      })),
      deliveryType: deliveryType as "pickup" | "delivery",
      paymentMethod
    }
    
    const updatedOrders = [newOrder, ...myOrders]
    setMyOrders(updatedOrders)
    localStorage.setItem("acaibr_orders", JSON.stringify(updatedOrders))
  }

  const handleProductClick = (product: Product) => {
    startOrderFlow(product)
  }

  const handleCheckout = () => {
    setShowCheckout(true)
    setActiveTab("cart")
  }

  const handleSubmitOrder = async (deliveryType: "delivery" | "pickup", address?: Address, paymentMethod?: string) => {
    if (!customer) return

    const subtotal = getCartSubtotal()
    const total = getCartTotal()

    try {
      // Save order to database
      const { data: order } = await supabase
        .from("orders")
        .insert({
          customer_name: customer.name,
          customer_phone: customer.phone,
          delivery_type: deliveryType,
          address_street: address?.street,
          address_number: address?.number,
          address_neighborhood: address?.neighborhood,
          address_city: address?.city,
          address_complement: address?.complement,
          address_reference: address?.reference,
          latitude: address?.latitude,
          longitude: address?.longitude,
          payment_method: paymentMethod || "pix",
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          status: "pending"
        })
        .select()
        .single()

      if (order) {
        // Save order items
        for (const item of cart) {
          const { data: orderItem } = await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              product_name: item.product.name,
              size_name: item.size?.name,
              size_price: item.size?.price,
              flavors: item.selectedFlavors,
              quantity: item.quantity,
              item_total: item.itemTotal
            })
            .select()
            .single()

          if (orderItem && item.selectedAddons.length > 0) {
            await supabase.from("order_item_addons").insert(
              item.selectedAddons.map(a => ({
                order_item_id: orderItem.id,
                addon_name: a.addon.name,
                addon_price: a.addon.price,
                quantity: a.quantity
              }))
            )
          }
        }
        
        // Save to local history
        saveOrderToHistory(order.id, total, deliveryType, paymentMethod || "pix")
      }

      // Send WhatsApp message
      const whatsappNumber = storeSettings?.whatsapp_number || "557799406526"
      let message = `*Novo Pedido - ${storeSettings?.store_name || "Açaí BR"}*\n\n`
      message += `*Cliente:* ${customer.name}\n`
      message += `*Telefone:* ${customer.phone}\n\n`
      message += `*Itens:*\n`
      
      cart.forEach(item => {
        message += `- ${item.quantity}x ${item.product.name}`
        if (item.size) message += ` (${item.size.name})`
        message += ` - R$ ${(item.itemTotal * item.quantity).toFixed(2)}\n`
        if (item.selectedFlavors.length > 0) {
          message += `  Sabores: ${item.selectedFlavors.join(", ")}\n`
        }
        if (item.selectedAddons.length > 0) {
          message += `  Adicionais: ${item.selectedAddons.map(a => `${a.quantity}x ${a.addon.name}`).join(", ")}\n`
        }
      })

      message += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n`
      if (deliveryFee > 0) {
        message += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n`
      }
      message += `*Total:* R$ ${total.toFixed(2)}\n\n`
      message += `*Tipo:* ${deliveryType === "delivery" ? "Entrega" : "Retirada"}\n`
      message += `*Pagamento:* ${paymentMethod === "money" ? "Dinheiro" : paymentMethod === "card" ? "Cartão" : "PIX"}\n`

      if (deliveryType === "delivery" && address) {
        message += `\n*Endereço:*\n`
        message += `${address.street}, ${address.number}\n`
        if (address.complement) message += `${address.complement}\n`
        message += `${address.neighborhood}${address.city ? `, ${address.city}` : ""}\n`
        if (address.reference) message += `Ref: ${address.reference}\n`
        if (address.latitude && address.longitude) {
          message += `\n*Localização:* https://www.google.com/maps?q=${address.latitude},${address.longitude}\n`
        }
      }

      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank")

      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado via WhatsApp.",
      })

      clearCart()
      setShowCheckout(false)
      setActiveTab("home")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar pedido. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const openWhatsApp = () => {
    const whatsappNumber = storeSettings?.whatsapp_number || "557799406526"
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Show loading while hydrating from localStorage
  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image src="/acai-logo.png" alt="Açaí Br" width={80} height={80} className="mx-auto drop-shadow-md animate-pulse" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/acai-logo.png" alt="Açaí Br" width={50} height={50} className="drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold text-primary">{storeSettings?.store_name || "Açaí BR"}</h1>
              <p className="text-xs text-muted-foreground">Açaí fresco e delicioso</p>
            </div>
          </div>
        </div>
      </header>

      <RegistrationModal open={showRegistration} onClose={() => setShowRegistration(false)} />
      
      <OrderFlowModal open={showOrderFlow} onClose={() => setShowOrderFlow(false)} />

      {/* Main Content - Home Tab */}
      {activeTab === "home" && customer && (
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Category Filter Buttons */}
          <div className="flex gap-3 sticky top-16 bg-background z-30 pb-4">
            <Button
              variant={selectedCategory === "tradicional" ? "default" : "outline"}
              onClick={() => setSelectedCategory("tradicional")}
              className="flex-1"
            >
              Açaí Tradicional
            </Button>
            <Button
              variant={selectedCategory === "especial" ? "default" : "outline"}
              onClick={() => setSelectedCategory("especial")}
              className="flex-1"
            >
              Açaí Especial
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground">Carregando produtos...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products
                .filter((product) => product.category === selectedCategory)
                .map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        )}
                        <div className="mt-2">
                          {product.sizes && product.sizes.length > 0 ? (
                            <p className="text-primary font-bold">
                              A partir de R$ {Math.min(...product.sizes.map(s => Number(s.price))).toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-primary font-bold">Consulte</p>
                          )}
                        </div>
                      </div>
                      {product.image_url && (
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab - Show user's orders history */}
      {activeTab === "orders" && customer && (
        <div className="container mx-auto px-4 py-6">
          {selectedOrder ? (
            // Order Details View
            <>
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-foreground">Detalhes do Pedido</h2>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Pedido</p>
                        <p className="font-bold">#{selectedOrder.id.slice(0, 8)}</p>
                      </div>
                      <Badge className={statusConfig[selectedOrder.status]?.color || "bg-gray-100"}>
                        {statusConfig[selectedOrder.status]?.label || "Desconhecido"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{formatDate(selectedOrder.date)}</p>
                      <p className="mt-1">
                        {selectedOrder.deliveryType === "pickup" ? "Retirada na loja" : "Entrega"} | {paymentNames[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
                      </p>
                      {selectedOrder.deliveryType === "delivery" && selectedOrder.address && (
                        <div className="mt-2 p-2 bg-muted/50 rounded">
                          <p className="font-medium text-foreground">Endereço de entrega:</p>
                          <p>{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                          {selectedOrder.address.complement && <p>{selectedOrder.address.complement}</p>}
                          <p>{selectedOrder.address.neighborhood}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.status === "confirmed" && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Pedido Aceito!</p>
                          <p className="text-sm text-green-700">Seu pedido foi aceito pela loja e está sendo preparado.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              {item.size && (
                                <p className="text-sm text-muted-foreground">{item.size.name}</p>
                              )}
                              {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Sabores: {item.selectedFlavors.join(", ")}
                                </p>
                              )}
                              {item.selectedAddons && item.selectedAddons.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Adicionais: {item.selectedAddons.map(a => `${a.quantity}x ${a.addon.name}`).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">R$ {(item.itemTotal * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total do Pedido</span>
                      <span className="text-xl font-bold text-primary">
                        R$ {selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // Orders List View
            <>
              <h2 className="text-xl font-bold text-foreground mb-4">Meus Pedidos</h2>
              
              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
                  <Button onClick={() => setActiveTab("home")}>
                    Ver Cardápio
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status]?.icon || Clock
                    return (
                      <Card
                        key={order.id}
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          order.status === "confirmed" ? "ring-2 ring-green-500 animate-pulse" : ""
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold">#{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.date)}
                              </p>
                            </div>
                            <Badge className={statusConfig[order.status]?.color || "bg-gray-100"}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status]?.label || "Desconhecido"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <span className="text-sm text-muted-foreground">
                              {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                            </span>
                            <span className="font-bold text-primary">
                              R$ {order.total.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Cart/Checkout Tab */}
      {activeTab === "cart" && customer && (
        <>
          {showCheckout ? (
            <CheckoutSection onSubmitOrder={handleSubmitOrder} />
          ) : (
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Carrinho</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                  <Button className="mt-4" onClick={() => setActiveTab("home")}>
                    Ver Cardápio
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.product.name}</h3>
                            {item.size && (
                              <p className="text-sm text-muted-foreground">{item.size.name}</p>
                            )}
                            {item.selectedFlavors.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Sabores: {item.selectedFlavors.join(", ")}
                              </p>
                            )}
                            {item.selectedAddons.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Adicionais: {item.selectedAddons.map(a => `${a.quantity}x ${a.addon.name}`).join(", ")}
                              </p>
                            )}
                            <p className="text-primary font-bold mt-2">
                              R$ {(item.itemTotal * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1)
                                } else {
                                  removeFromCart(item.id)
                                }
                              }}
                            >
                              {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="bg-primary/5 border-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">R$ {getCartSubtotal().toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Continuar para Pagamento
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartItemCount={cartItemCount} />
    </main>
  )
}
