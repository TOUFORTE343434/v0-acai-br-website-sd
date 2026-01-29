"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Package, Cookie, Settings, ShoppingBag, Eye, Lock, ArrowLeft, Layers, Cherry, Printer, Users, Ticket, IceCream } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Product, ProductSize, Flavor, Addon, Order, StoreSettings } from "@/lib/types"
import Link from "next/link"
import { NewOrderNotification } from "@/components/new-order-notification"
import { ThermalReceipt } from "@/components/thermal-receipt"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [adminPassword, setAdminPassword] = useState("admin123")
  
  const [products, setProducts] = useState<Product[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: "", description: "", image_url: "", category: "tradicional" as "tradicional" | "especial" })
  const [productSizes, setProductSizes] = useState<{ name: string; price: string }[]>([])
  const [productFlavors, setProductFlavors] = useState<string[]>([])
  const [flavorConfig, setFlavorConfig] = useState({ min: 1, max: 1 })
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [showProductDialog, setShowProductDialog] = useState(false)
  
  const [addonForm, setAddonForm] = useState({ name: "", price: "" })
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [showAddonDialog, setShowAddonDialog] = useState(false)

  // Sabores globais
  const [globalFlavors, setGlobalFlavors] = useState<{ id: string; name: string; active: boolean }[]>([])
  const [flavorForm, setFlavorForm] = useState({ name: "" })
  const [editingFlavor, setEditingFlavor] = useState<{ id: string; name: string; active: boolean } | null>(null)
  const [showFlavorDialog, setShowFlavorDialog] = useState(false)

  // Clientes
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string; orders_count: number; total_spent: number; created_at: string }[]>([])

  // Cupons
  const [coupons, setCoupons] = useState<{ id: string; code: string; discount_type: string; discount_value: number; min_order: number; active: boolean; expires_at: string | null; usage_count: number }[]>([])
  const [couponForm, setCouponForm] = useState({ code: "", discount_type: "percentage", discount_value: "", min_order: "0", expires_at: "" })
  const [editingCoupon, setEditingCoupon] = useState<{ id: string; code: string; discount_type: string; discount_value: number; min_order: number; active: boolean; expires_at: string | null; usage_count: number } | null>(null)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  
  const [settingsForm, setSettingsForm] = useState({
    delivery_fee: "6.00",
    whatsapp_number: "557799406526",
    store_name: "Açaí BR",
    admin_password: "admin123"
  })

  const supabase = createClient()

  // Verificar se está autenticado ao carregar a página
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (isAdminAuthenticated) {
      setIsAuthenticated(true)
    }
  }, [])

  const loadOrders = async () => {
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`*, items:order_items(*, addons:order_item_addons(*))`)
        .order("created_at", { ascending: false })
      if (ordersData) {
        // Detectar novo pedido (apenas com status pending)
        const pendingOrders = ordersData.filter((order: Order) => order.status === "pending")
        if (pendingOrders.length > 0 && !newOrder) {
          setNewOrder(pendingOrders[0]) // Mostrar o primeiro pedido pending
        } else if (newOrder && !ordersData.find((o: Order) => o.id === newOrder.id && o.status === "pending")) {
          // Se o pedido atual foi aceito, limpar a notificação
          setNewOrder(null)
        }
        setOrders(ordersData)
      }
    } catch (error) {
      console.log("[v0] Error loading orders:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
      
      // Atualizar pedidos a cada 5 segundos para detecção mais rápida
      const interval = setInterval(() => {
        loadOrders()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: productsData } = await supabase
        .from("products")
        .select(`*, sizes:product_sizes(*), flavors:flavors(*), flavor_config:product_flavor_config(*), product_addons:product_addons(*, addon:addons(*))`)
        .order("created_at", { ascending: false })
      
      if (productsData) {
        setProducts(productsData.map(p => ({
          ...p,
          flavor_config: p.flavor_config?.[0] || null,
          addons: p.product_addons
        })))
      }
      
      const { data: addonsData } = await supabase.from("addons").select("*").order("name")
      if (addonsData) setAddons(addonsData)

      // Carregar sabores globais
      const { data: flavorsData } = await supabase.from("global_flavors").select("*").order("name")
      if (flavorsData) setGlobalFlavors(flavorsData)

      // Carregar clientes
      const { data: customersData } = await supabase.from("customers").select("*").order("created_at", { ascending: false })
      if (customersData) setCustomers(customersData)

      // Carregar cupons
      const { data: couponsData } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
      if (couponsData) setCoupons(couponsData)
      
      const { data: settingsData } = await supabase.from("store_settings").select("*").single()
      if (settingsData) {
        setSettings(settingsData)
        setAdminPassword(settingsData.admin_password)
        setSettingsForm({
          delivery_fee: settingsData.delivery_fee.toString(),
          whatsapp_number: settingsData.whatsapp_number,
          store_name: settingsData.store_name,
          admin_password: settingsData.admin_password
        })
      }
    } catch (error) {
      console.log("[v0] Error loading data:", error)
    }
    setLoading(false)
  }
      
  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
    } else {
      alert("Senha incorreta!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
    setPassword("")
  }

  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await supabase.from("products").update({ name: productForm.name, description: productForm.description, image_url: productForm.image_url, category: productForm.category }).eq("id", editingProduct.id)
        await supabase.from("product_sizes").delete().eq("product_id", editingProduct.id)
        await supabase.from("flavors").delete().eq("product_id", editingProduct.id)
        await supabase.from("product_flavor_config").delete().eq("product_id", editingProduct.id)
        await supabase.from("product_addons").delete().eq("product_id", editingProduct.id)
        
        if (productSizes.length > 0) {
          await supabase.from("product_sizes").insert(productSizes.map(s => ({ product_id: editingProduct.id, name: s.name, price: parseFloat(s.price) })))
        }
        if (productFlavors.length > 0) {
          await supabase.from("flavors").insert(productFlavors.map(f => ({ product_id: editingProduct.id, name: f })))
          await supabase.from("product_flavor_config").insert({ product_id: editingProduct.id, min_flavors: flavorConfig.min, max_flavors: flavorConfig.max })
        }
        if (selectedAddons.length > 0) {
          await supabase.from("product_addons").insert(selectedAddons.map(addonId => ({ product_id: editingProduct.id, addon_id: addonId, max_quantity: 3 })))
        }
      } else {
        const { data: newProduct } = await supabase.from("products").insert({ name: productForm.name, description: productForm.description, image_url: productForm.image_url, category: productForm.category }).select().single()
        if (newProduct) {
          if (productSizes.length > 0) {
            await supabase.from("product_sizes").insert(productSizes.map(s => ({ product_id: newProduct.id, name: s.name, price: parseFloat(s.price) })))
          }
          if (productFlavors.length > 0) {
            await supabase.from("flavors").insert(productFlavors.map(f => ({ product_id: newProduct.id, name: f })))
            await supabase.from("product_flavor_config").insert({ product_id: newProduct.id, min_flavors: flavorConfig.min, max_flavors: flavorConfig.max })
          }
          if (selectedAddons.length > 0) {
            await supabase.from("product_addons").insert(selectedAddons.map(addonId => ({ product_id: newProduct.id, addon_id: addonId, max_quantity: 3 })))
          }
        }
      }
      setShowProductDialog(false)
      resetProductForm()
      loadData()
    } catch (error) {
      console.log("[v0] Error saving product:", error)
      alert("Erro ao salvar produto")
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    await supabase.from("products").delete().eq("id", id)
    loadData()
  }

  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({ name: product.name, description: product.description || "", image_url: product.image_url || "", category: product.category || "tradicional" })
    setProductSizes(product.sizes?.map(s => ({ name: s.name, price: s.price.toString() })) || [])
    setProductFlavors(product.flavors?.map(f => f.name) || [])
    setFlavorConfig({ min: product.flavor_config?.min_flavors || 1, max: product.flavor_config?.max_flavors || 1 })
    setSelectedAddons(product.addons?.map(a => a.addon_id) || [])
    setShowProductDialog(true)
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setProductForm({ name: "", description: "", image_url: "", category: "tradicional" })
    setProductSizes([])
    setProductFlavors([])
    setFlavorConfig({ min: 1, max: 1 })
    setSelectedAddons([])
  }

  const saveAddon = async () => {
    try {
      if (editingAddon) {
        await supabase.from("addons").update({ name: addonForm.name, price: parseFloat(addonForm.price) }).eq("id", editingAddon.id)
      } else {
        await supabase.from("addons").insert({ name: addonForm.name, price: parseFloat(addonForm.price) })
      }
      setShowAddonDialog(false)
      setAddonForm({ name: "", price: "" })
      setEditingAddon(null)
      loadData()
    } catch (error) {
      console.log("[v0] Error saving addon:", error)
      alert("Erro ao salvar adicional")
    }
  }

  const deleteAddon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este adicional?")) return
    await supabase.from("addons").delete().eq("id", id)
    loadData()
  }

  const saveSettings = async () => {
    try {
      if (settings) {
        await supabase.from("store_settings").update({
          delivery_fee: parseFloat(settingsForm.delivery_fee),
          whatsapp_number: settingsForm.whatsapp_number,
          store_name: settingsForm.store_name,
          admin_password: settingsForm.admin_password
        }).eq("id", settings.id)
      } else {
        await supabase.from("store_settings").insert({
          delivery_fee: parseFloat(settingsForm.delivery_fee),
          whatsapp_number: settingsForm.whatsapp_number,
          store_name: settingsForm.store_name,
          admin_password: settingsForm.admin_password
        })
      }
      setAdminPassword(settingsForm.admin_password)
      alert("Configurações salvas!")
      loadData()
    } catch (error) {
      console.log("[v0] Error saving settings:", error)
      alert("Erro ao salvar configurações")
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId)
    loadData()
  }

  // CRUD Sabores Globais
  const saveFlavor = async () => {
    try {
      if (editingFlavor) {
        await supabase.from("global_flavors").update({ name: flavorForm.name }).eq("id", editingFlavor.id)
      } else {
        await supabase.from("global_flavors").insert({ name: flavorForm.name })
      }
      setShowFlavorDialog(false)
      setFlavorForm({ name: "" })
      setEditingFlavor(null)
      loadData()
    } catch (error) {
      console.log("[v0] Error saving flavor:", error)
      alert("Erro ao salvar sabor")
    }
  }

  const deleteFlavor = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este sabor?")) return
    await supabase.from("global_flavors").delete().eq("id", id)
    loadData()
  }

  const toggleFlavorActive = async (id: string, active: boolean) => {
    await supabase.from("global_flavors").update({ active: !active }).eq("id", id)
    loadData()
  }

  // CRUD Cupons
  const saveCoupon = async () => {
    try {
      const couponData = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_order: parseFloat(couponForm.min_order) || 0,
        expires_at: couponForm.expires_at || null
      }
      
      if (editingCoupon) {
        await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id)
      } else {
        await supabase.from("coupons").insert(couponData)
      }
      setShowCouponDialog(false)
      setCouponForm({ code: "", discount_type: "percentage", discount_value: "", min_order: "0", expires_at: "" })
      setEditingCoupon(null)
      loadData()
    } catch (error) {
      console.log("[v0] Error saving coupon:", error)
      alert("Erro ao salvar cupom")
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return
    await supabase.from("coupons").delete().eq("id", id)
    loadData()
  }

  const toggleCouponActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active }).eq("id", id)
    loadData()
  }

  // Deletar cliente
  const deleteCustomer = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return
    await supabase.from("customers").delete().eq("id", id)
    loadData()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl">Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Digite a senha" />
            </div>
            <Button onClick={handleLogin} className="w-full">Entrar</Button>
            <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 inline mr-1" />Voltar para a loja
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAcceptOrder = () => {
    setNewOrder(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <NewOrderNotification order={newOrder} onAccept={handleAcceptOrder} />
      {printOrder && (
        <ThermalReceipt 
          order={printOrder} 
          storeName={settings?.store_name || "Açaí BR"}
          onClose={() => setPrintOrder(null)} 
        />
      )}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Link href="/"><Button variant="secondary" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Ver Loja</Button></Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-1 mb-6 h-auto p-1">
            <TabsTrigger value="products" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><Package className="h-4 w-4" /><span className="hidden sm:inline">Produtos</span></TabsTrigger>
            <TabsTrigger value="addons" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><Cookie className="h-4 w-4" /><span className="hidden sm:inline">Adicionais</span></TabsTrigger>
            <TabsTrigger value="flavors" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><IceCream className="h-4 w-4" /><span className="hidden sm:inline">Sabores</span></TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Pedidos</span></TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><Users className="h-4 w-4" /><span className="hidden sm:inline">Clientes</span></TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><Ticket className="h-4 w-4" /><span className="hidden sm:inline">Cupons</span></TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1.5"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Config</span></TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Produtos</h2>
              <Dialog open={showProductDialog} onOpenChange={(open) => { setShowProductDialog(open); if (!open) resetProductForm() }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Produto</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div><Label htmlFor="name">Nome do Produto</Label><Input id="name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ex: Açaí Tradicional" /></div>
                      <div><Label htmlFor="description">Descrição</Label><Input id="description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Ex: Açaí puro e cremoso" /></div>
                      <div><Label htmlFor="image">URL da Imagem</Label><Input id="image" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." /></div>
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <select 
                          id="category" 
                          value={productForm.category} 
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as "tradicional" | "especial" })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="tradicional">Açaí Tradicional</option>
                          <option value="especial">Açaí Especial</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><Label className="flex items-center gap-2"><Layers className="h-4 w-4" />Tamanhos</Label><Button type="button" variant="outline" size="sm" onClick={() => setProductSizes([...productSizes, { name: "", price: "" }])}><Plus className="h-4 w-4" /></Button></div>
                      {productSizes.map((size, index) => (
                        <div key={index} className="flex gap-2">
                          <Input placeholder="Nome (ex: 300ml)" value={size.name} onChange={(e) => { const newSizes = [...productSizes]; newSizes[index].name = e.target.value; setProductSizes(newSizes) }} />
                          <Input placeholder="Preço" type="number" step="0.01" value={size.price} onChange={(e) => { const newSizes = [...productSizes]; newSizes[index].price = e.target.value; setProductSizes(newSizes) }} className="w-24" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setProductSizes(productSizes.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><Label className="flex items-center gap-2"><Cherry className="h-4 w-4" />Sabores</Label><Button type="button" variant="outline" size="sm" onClick={() => setProductFlavors([...productFlavors, ""])}><Plus className="h-4 w-4" /></Button></div>
                      {productFlavors.length > 0 && (
                        <div className="flex gap-4 mb-2">
                          <div className="flex items-center gap-2"><Label className="text-sm">Mín:</Label><Input type="number" min="1" value={flavorConfig.min} onChange={(e) => setFlavorConfig({ ...flavorConfig, min: parseInt(e.target.value) || 1 })} className="w-16" /></div>
                          <div className="flex items-center gap-2"><Label className="text-sm">Máx:</Label><Input type="number" min="1" value={flavorConfig.max} onChange={(e) => setFlavorConfig({ ...flavorConfig, max: parseInt(e.target.value) || 1 })} className="w-16" /></div>
                        </div>
                      )}
                      {productFlavors.map((flavor, index) => (
                        <div key={index} className="flex gap-2">
                          <Input placeholder="Nome do sabor" value={flavor} onChange={(e) => { const newFlavors = [...productFlavors]; newFlavors[index] = e.target.value; setProductFlavors(newFlavors) }} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setProductFlavors(productFlavors.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2"><Cookie className="h-4 w-4" />Adicionais Disponíveis</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {addons.map((addon) => (
                          <label key={addon.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded">
                            <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={(e) => { if (e.target.checked) { setSelectedAddons([...selectedAddons, addon.id]) } else { setSelectedAddons(selectedAddons.filter(id => id !== addon.id)) } }} className="rounded" />
                            <span className="text-sm">{addon.name} - R$ {addon.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button onClick={saveProduct} className="w-full">{editingProduct ? "Salvar Alterações" : "Criar Produto"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : products.length === 0 ? (
              <Card className="p-8 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum produto cadastrado</p></Card>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {product.image_url && <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />}
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {product.sizes && product.sizes.length > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{product.sizes.length} tamanhos</span>}
                            {product.flavors && product.flavors.length > 0 && <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">{product.flavors.length} sabores</span>}
                            {product.addons && product.addons.length > 0 && <span className="text-xs bg-muted px-2 py-1 rounded">{product.addons.length} adicionais</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => editProduct(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Adicionais</h2>
              <Dialog open={showAddonDialog} onOpenChange={(open) => { setShowAddonDialog(open); if (!open) { setAddonForm({ name: "", price: "" }); setEditingAddon(null) } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Adicional</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingAddon ? "Editar Adicional" : "Novo Adicional"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label htmlFor="addon-name">Nome</Label><Input id="addon-name" value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} placeholder="Ex: Granola" /></div>
                    <div><Label htmlFor="addon-price">Preço (R$)</Label><Input id="addon-price" type="number" step="0.01" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} placeholder="3.00" /></div>
                    <Button onClick={saveAddon} className="w-full">{editingAddon ? "Salvar" : "Criar"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : addons.length === 0 ? (
              <Card className="p-8 text-center"><Cookie className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum adicional cadastrado</p></Card>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {addons.map((addon) => (
                  <Card key={addon.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div><h3 className="font-medium">{addon.name}</h3><p className="text-sm text-primary font-semibold">R$ {addon.price.toFixed(2)}</p></div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditingAddon(addon); setAddonForm({ name: addon.name, price: addon.price.toString() }); setShowAddonDialog(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteAddon(addon.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba de Sabores Globais */}
          <TabsContent value="flavors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sabores Globais</h2>
              <Dialog open={showFlavorDialog} onOpenChange={(open) => { setShowFlavorDialog(open); if (!open) { setFlavorForm({ name: "" }); setEditingFlavor(null) } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Sabor</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingFlavor ? "Editar Sabor" : "Novo Sabor"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label htmlFor="flavor-name">Nome do Sabor</Label><Input id="flavor-name" value={flavorForm.name} onChange={(e) => setFlavorForm({ ...flavorForm, name: e.target.value })} placeholder="Ex: Morango" /></div>
                    <Button onClick={saveFlavor} className="w-full">{editingFlavor ? "Salvar" : "Criar"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : globalFlavors.length === 0 ? (
              <Card className="p-8 text-center"><IceCream className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum sabor cadastrado</p></Card>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {globalFlavors.map((flavor) => (
                  <Card key={flavor.id} className={!flavor.active ? "opacity-50" : ""}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <IceCream className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{flavor.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${flavor.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {flavor.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleFlavorActive(flavor.id, flavor.active)}>
                          {flavor.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => { setEditingFlavor(flavor); setFlavorForm({ name: flavor.name }); setShowFlavorDialog(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteFlavor(flavor.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : orders.length === 0 ? (
              <Card className="p-8 text-center"><ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum pedido ainda</p></Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">#{order.id.slice(0, 8)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : order.status === "confirmed" ? "bg-blue-100 text-blue-800" : order.status === "preparing" ? "bg-orange-100 text-orange-800" : order.status === "ready" ? "bg-green-100 text-green-800" : order.status === "delivered" ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"}`}>
                              {order.status === "pending" ? "Pendente" : order.status === "confirmed" ? "Confirmado" : order.status === "preparing" ? "Preparando" : order.status === "ready" ? "Pronto" : order.status === "delivered" ? "Entregue" : "Cancelado"}
                            </span>
                          </div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_type === "delivery" ? "Entrega" : "Retirada"} - {order.payment_method === "money" ? "Dinheiro" : order.payment_method === "card" ? "Cartão" : "PIX"}</p>
                          <p className="text-lg font-bold text-primary mt-2">R$ {order.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" onClick={() => setPrintOrder(order)}>
                            <Printer className="h-4 w-4 mr-1" />Imprimir
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Ver</Button></DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                              <DialogHeader><DialogTitle>Pedido #{order.id.slice(0, 8)}</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <div><h4 className="font-semibold mb-2">Cliente</h4><p>{order.customer_name}</p><p className="text-sm text-muted-foreground">{order.customer_phone}</p>{order.customer_email && <p className="text-sm text-muted-foreground">{order.customer_email}</p>}</div>
                                {order.delivery_type === "delivery" && (<div><h4 className="font-semibold mb-2">Endereço</h4><p className="text-sm">{order.address_street}, {order.address_number}{order.address_complement && ` - ${order.address_complement}`}</p><p className="text-sm">{order.address_neighborhood}, {order.address_city}</p>{order.address_reference && <p className="text-sm text-muted-foreground">Ref: {order.address_reference}</p>}</div>)}
                                <div><h4 className="font-semibold mb-2">Itens</h4>{order.items?.map((item, idx) => (<div key={idx} className="border-b py-2"><p className="font-medium">{item.quantity}x {item.product_name}</p>{item.size_name && <p className="text-sm text-muted-foreground">Tamanho: {item.size_name}</p>}{item.flavors && item.flavors.length > 0 && <p className="text-sm text-muted-foreground">Sabores: {item.flavors.join(", ")}</p>}{item.addons && item.addons.length > 0 && <p className="text-sm text-muted-foreground">Adicionais: {item.addons.map(a => `${a.quantity}x ${a.addon_name}`).join(", ")}</p>}<p className="text-sm font-medium">R$ {item.item_total.toFixed(2)}</p></div>))}</div>
                                <div className="border-t pt-4"><div className="flex justify-between"><span>Subtotal</span><span>R$ {order.subtotal.toFixed(2)}</span></div>{order.delivery_fee > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Taxa de entrega</span><span>R$ {order.delivery_fee.toFixed(2)}</span></div>}<div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span className="text-primary">R$ {order.total.toFixed(2)}</span></div><p className="text-sm text-muted-foreground mt-2">Pagamento: {order.payment_method === "money" ? "Dinheiro" : order.payment_method === "card" ? "Cartão" : "PIX"}</p></div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                            <option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="preparing">Preparando</option><option value="ready">Pronto</option><option value="delivered">Entregue</option><option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba de Clientes */}
          <TabsContent value="customers">
            <h2 className="text-xl font-semibold mb-4">Clientes Cadastrados</h2>
            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : customers.length === 0 ? (
              <Card className="p-8 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum cliente cadastrado</p></Card>
            ) : (
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Pedidos: {customer.orders_count}</span>
                            <span>Total gasto: R$ {customer.total_spent.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Cadastro: {new Date(customer.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => deleteCustomer(customer.id)}><Trash2 className="h-4 w-4" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba de Cupons */}
          <TabsContent value="coupons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cupons de Desconto</h2>
              <Dialog open={showCouponDialog} onOpenChange={(open) => { setShowCouponDialog(open); if (!open) { setCouponForm({ code: "", discount_type: "percentage", discount_value: "", min_order: "0", expires_at: "" }); setEditingCoupon(null) } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Cupom</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingCoupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label htmlFor="coupon-code">Codigo do Cupom</Label><Input id="coupon-code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="Ex: DESCONTO10" /></div>
                    <div>
                      <Label htmlFor="discount-type">Tipo de Desconto</Label>
                      <select id="discount-type" value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })} className="w-full border rounded px-3 py-2 mt-1">
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div><Label htmlFor="discount-value">{couponForm.discount_type === "percentage" ? "Desconto (%)" : "Desconto (R$)"}</Label><Input id="discount-value" type="number" step="0.01" value={couponForm.discount_value} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} placeholder={couponForm.discount_type === "percentage" ? "10" : "5.00"} /></div>
                    <div><Label htmlFor="min-order">Pedido Minimo (R$)</Label><Input id="min-order" type="number" step="0.01" value={couponForm.min_order} onChange={(e) => setCouponForm({ ...couponForm, min_order: e.target.value })} placeholder="0" /></div>
                    <div><Label htmlFor="expires-at">Data de Expiracao (opcional)</Label><Input id="expires-at" type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })} /></div>
                    <Button onClick={saveCoupon} className="w-full">{editingCoupon ? "Salvar" : "Criar"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (<p className="text-center py-8 text-muted-foreground">Carregando...</p>) : coupons.length === 0 ? (
              <Card className="p-8 text-center"><Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum cupom cadastrado</p></Card>
            ) : (
              <div className="grid gap-4">
                {coupons.map((coupon) => (
                  <Card key={coupon.id} className={!coupon.active ? "opacity-50" : ""}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Ticket className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{coupon.code}</h3>
                          <p className="text-sm text-primary font-medium">
                            {coupon.discount_type === "percentage" ? `${coupon.discount_value}% de desconto` : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}
                          </p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            {coupon.min_order > 0 && <span>Min: R$ {coupon.min_order.toFixed(2)}</span>}
                            <span>Usos: {coupon.usage_count}</span>
                            {coupon.expires_at && <span>Expira: {new Date(coupon.expires_at).toLocaleDateString("pt-BR")}</span>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${coupon.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {coupon.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleCouponActive(coupon.id, coupon.active)}>
                          {coupon.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => { setEditingCoupon(coupon); setCouponForm({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value.toString(), min_order: coupon.min_order.toString(), expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "" }); setShowCouponDialog(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteCoupon(coupon.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle>Configurações da Loja</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="store-name">Nome da Loja</Label><Input id="store-name" value={settingsForm.store_name} onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })} /></div>
                <div><Label htmlFor="whatsapp">WhatsApp (com código do país)</Label><Input id="whatsapp" value={settingsForm.whatsapp_number} onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })} placeholder="557799406526" /></div>
                <div><Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label><Input id="delivery-fee" type="number" step="0.01" value={settingsForm.delivery_fee} onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: e.target.value })} /></div>
                <div><Label htmlFor="admin-pass">Senha do Admin</Label><Input id="admin-pass" type="password" value={settingsForm.admin_password} onChange={(e) => setSettingsForm({ ...settingsForm, admin_password: e.target.value })} /></div>
                <Button onClick={saveSettings} className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
