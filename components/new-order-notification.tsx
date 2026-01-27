"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Bell, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Order } from "@/lib/types"

interface NewOrderNotificationProps {
  order: Order | null
  onAccept: () => void
}

export function NewOrderNotification({ order, onAccept }: NewOrderNotificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (order) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [order])

  const handleAccept = async () => {
    setIsOpen(false)
    
    // Atualizar o status do pedido no banco de dados
    if (order?.id) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "confirmed" })
          .eq("id", order.id)
        
        if (error) {
          console.log("[v0] Error updating order:", error)
        }
      } catch (error) {
        console.log("[v0] Error:", error)
      }
    }
    
    // Chamar callback para limpar o state
    setTimeout(() => {
      onAccept()
    }, 300)
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md animate-pulse">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-500 animate-bounce" />
            <DialogTitle>Novo Pedido Recebido!</DialogTitle>
          </div>
        </DialogHeader>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Cliente</p>
              <p className="text-lg font-bold">{order.customer_name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600">Telefone</p>
              <p className="font-mono">{order.customer_phone}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">R$ {(order.total || 0).toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Tipo de Entrega</p>
              <p className="font-semibold">
                {order.delivery_type === 'pickup' ? 'Retirada na Loja' : 'Entrega'}
              </p>
            </div>

            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Itens</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {order.items.map((item: any, idx: number) => (
                    <p key={idx} className="text-sm">
                      {item.quantity}x {item.product_name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Button
          onClick={handleAccept}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Aceitar Pedido
        </Button>
      </DialogContent>
    </Dialog>
  )
}
