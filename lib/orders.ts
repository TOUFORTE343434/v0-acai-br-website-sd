"use client"

import type { Order, Customer, CartItem } from "./types"

const ORDERS_KEY = "acai-br-orders"

export function saveOrder(
  customer: Customer,
  items: CartItem[],
  total: number,
  deliveryType: "delivery" | "pickup",
  address?: {
    neighborhood: string
    street: string
    number: string
    reference: string
  },
  paymentMethod?: string,
): Order {
  const order: Order = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customer,
    items,
    deliveryType,
    address,
    total,
    paymentMethod, // Added payment method to order
    createdAt: new Date().toISOString(),
    status: "pending",
  }

  const orders = getAllOrders()
  orders.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

  return order
}

export function getAllOrders(): Order[] {
  if (typeof window === "undefined") return []

  const ordersData = localStorage.getItem(ORDERS_KEY)
  if (!ordersData) return []

  try {
    return JSON.parse(ordersData)
  } catch {
    return []
  }
}

export function updateOrderStatus(orderId: string, status: Order["status"]): void {
  const orders = getAllOrders()
  const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status } : order))
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
}

export function deleteOrder(orderId: string): void {
  const orders = getAllOrders()
  const filteredOrders = orders.filter((order) => order.id !== orderId)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders))
}

export function getOrderById(orderId: string): Order | null {
  const orders = getAllOrders()
  return orders.find((order) => order.id === orderId) || null
}
