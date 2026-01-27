"use client"

import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Eye, MapPin, ShoppingBag, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface OrderCardProps {
  order: Order
  onViewCoupon: (order: Order) => void
  onRefresh: () => void
}

export function OrderCard({ order, onViewCoupon, onRefresh }: OrderCardProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "confirmed":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "confirmed":
        return "Confirmado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-semibold text-primary">{order.id}</span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span>
                {order.items.length} {order.items.length === 1 ? "item" : "itens"}
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <DollarSign className="h-4 w-4" />
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {order.deliveryType === "delivery" ? (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Entrega</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Retirada</span>
                </>
              )}
            </div>
          </div>

          <div className="text-sm">
            <p className="font-medium text-foreground">{order.customer.name}</p>
            <p className="text-muted-foreground">{order.customer.phone}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => onViewCoupon(order)} className="w-full md:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            Ver Cupom
          </Button>
        </div>
      </div>
    </div>
  )
}
