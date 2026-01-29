"use client"

import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, MapPin, Phone, Mail, User, CreditCard, Printer, Wallet } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"

interface OrderCouponProps {
  order: Order
  onClose: () => void
  onRefresh: () => void
}

export function OrderCoupon({ order, onClose, onRefresh }: OrderCouponProps) {
  const handlePrint = () => {
    window.print()
  }

  const getPaymentMethodLabel = (method?: string) => {
    const labels: { [key: string]: string } = {
      dinheiro: "💵 Dinheiro",
      cartao: "💳 Cartão na Entrega",
      pix: "📱 PIX",
    }
    return method ? labels[method] || method : "Não informado"
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-end gap-2 mb-4 print:hidden">
            <Button onClick={handlePrint} variant="secondary">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} variant="secondary">
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>

          <div className="bg-white text-black p-8 rounded-lg shadow-2xl" id="coupon">
            <div className="border-4 border-dashed border-purple-600 p-6 space-y-6">
              <div className="text-center border-b-2 border-purple-600 pb-6">
                <Image src="/acai-logo.png" alt="Açaí Br" width={80} height={80} className="mx-auto mb-3" />
                <h1 className="text-3xl font-bold text-purple-800">AÇAÍ BR</h1>
                <p className="text-sm text-gray-600 mt-1">Açaí Fresco e Saboroso</p>
                <p className="text-xs text-gray-500 mt-2">Pedido: {order.id}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-800 border-b border-purple-300 pb-2">DADOS DO CLIENTE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-700">Nome:</p>
                      <p className="text-gray-900">{order.customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-700">Telefone:</p>
                      <p className="text-gray-900">{order.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-700">Email:</p>
                      <p className="text-gray-900">{order.customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-700">CPF:</p>
                      <p className="text-gray-900">{order.customer.cpf}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-800 border-b border-purple-300 pb-2">ITENS DO PEDIDO</h2>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">{item.product.description}</p>
                          {item.size && <p className="text-sm text-purple-700 mt-1">Tamanho: {item.size}</p>}
                          {item.toppings && item.toppings.length > 0 && (
                            <p className="text-sm text-purple-700">Acompanhamentos: {item.toppings.join(", ")}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                          <p className="font-semibold text-gray-900">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-800 border-b border-purple-300 pb-2">ENTREGA</h2>
                {order.deliveryType === "delivery" && order.address ? (
                  <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Endereço de Entrega (+R$ 6,00):</p>
                        <p className="text-gray-800">
                          {order.address.street}, {order.address.number}
                        </p>
                        <p className="text-gray-800">Bairro: {order.address.neighborhood}</p>
                        {order.address.reference && (
                          <p className="text-gray-600 text-sm">Referência: {order.address.reference}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">RETIRADA NA LOJA</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-800 border-b border-purple-300 pb-2">PAGAMENTO</h2>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    <p className="font-semibold text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-purple-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-800">TOTAL:</span>
                  <span className="text-3xl font-bold text-purple-800">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 pt-4 border-t border-purple-300">
                <p>Obrigado pela preferência!</p>
                <p>WhatsApp: (77) 99406-6526</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #coupon,
          #coupon * {
            visibility: visible;
          }
          #coupon {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}
