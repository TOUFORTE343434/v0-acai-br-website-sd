export interface Customer {
  name: string
  phone: string
}

export interface Product {
  id: string
  name: string
  description?: string
  image_url?: string
  category?: "tradicional" | "especial"
  active: boolean
  created_at?: string
  sizes?: ProductSize[]
  flavors?: Flavor[]
  flavor_config?: FlavorConfig
  addons?: ProductAddon[]
}

export interface ProductSize {
  id: string
  product_id: string
  name: string
  price: number
  active: boolean
}

export interface Flavor {
  id: string
  product_id: string
  name: string
  active: boolean
}

export interface FlavorConfig {
  id: string
  product_id: string
  min_flavors: number
  max_flavors: number
}

export interface Addon {
  id: string
  name: string
  price: number
  active: boolean
}

export interface ProductAddon {
  id: string
  product_id: string
  addon_id: string
  max_quantity: number
  addon?: Addon
}

export interface CartItem {
  id: string
  product: Product
  size?: ProductSize
  selectedFlavors: string[]
  selectedAddons: { addon: Addon; quantity: number }[]
  quantity: number
  itemTotal: number
}

export interface Address {
  street: string
  number: string
  neighborhood: string
  city: string
  complement?: string
  reference?: string
  latitude?: number
  longitude?: number
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_cpf?: string
  delivery_type: "pickup" | "delivery"
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_complement?: string
  address_reference?: string
  latitude?: number
  longitude?: number
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_name: string
  size_name?: string
  size_price?: number
  flavors?: string[]
  quantity: number
  item_total: number
  addons?: OrderItemAddon[]
}

export interface OrderItemAddon {
  id: string
  order_item_id: string
  addon_name: string
  addon_price: number
  quantity: number
}

export interface StoreSettings {
  id: string
  delivery_fee: number
  whatsapp_number: string
  store_name: string
  admin_password: string
}
