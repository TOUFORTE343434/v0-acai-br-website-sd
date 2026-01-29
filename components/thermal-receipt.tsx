"use client"

import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, Printer } from "lucide-react"
import { useRef } from "react"

interface ThermalReceiptProps {
  order: Order
  storeName?: string
  onClose: () => void
}

export function ThermalReceipt({ order, storeName = "Açaí BR", onClose }: ThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = receiptRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank", "width=302,height=453")
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o cupom.")
      return
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

    const paymentLabels: Record<string, string> = {
      money: "Dinheiro",
      pix: "PIX",
      card: "Cartão",
    }

    // Gerar HTML do cupom para impressora térmica 80mm x 120mm
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cupom - ${order.id.slice(0, 8)}</title>
        <style>
          @page {
            size: 80mm 120mm;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            width: 80mm;
            max-width: 80mm;
            padding: 3mm;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 3mm;
            margin-bottom: 2mm;
          }
          .store-name {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 8px;
            margin-top: 1mm;
          }
          .order-info {
            font-size: 9px;
            margin-top: 2mm;
          }
          .section {
            margin: 2mm 0;
            padding: 2mm 0;
            border-bottom: 1px dashed #000;
          }
          .section-title {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 1mm;
            text-transform: uppercase;
          }
          .customer-info {
            font-size: 9px;
            line-height: 1.4;
          }
          .item {
            margin: 1.5mm 0;
            font-size: 9px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            font-size: 8px;
            color: #333;
            padding-left: 2mm;
          }
          .item-price {
            text-align: right;
            font-size: 9px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 2mm 0;
          }
          .totals {
            margin-top: 2mm;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            margin: 1mm 0;
          }
          .grand-total {
            font-size: 12px;
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 2mm;
            margin-top: 2mm;
          }
          .footer {
            text-align: center;
            margin-top: 3mm;
            font-size: 8px;
            border-top: 1px dashed #000;
            padding-top: 2mm;
          }
          .delivery-type {
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            padding: 1mm;
            margin: 1mm 0;
            border: 1px solid #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${storeName}</div>
          <div class="subtitle">Açaí Fresco e Saboroso</div>
          <div class="order-info">
            <div>Pedido #${order.id.slice(0, 8)}</div>
            <div>${formatDate(order.created_at)}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cliente</div>
          <div class="customer-info">
            <div>${order.customer_name}</div>
            <div>Tel: ${order.customer_phone}</div>
          </div>
        </div>

        <div class="delivery-type">
          ${order.delivery_type === "delivery" ? "ENTREGA" : "RETIRADA"}
        </div>

        ${order.delivery_type === "delivery" && order.address_street ? `
        <div class="section">
          <div class="section-title">Endereço</div>
          <div class="customer-info">
            <div>${order.address_street}, ${order.address_number}</div>
            ${order.address_complement ? `<div>${order.address_complement}</div>` : ""}
            <div>${order.address_neighborhood}${order.address_city ? `, ${order.address_city}` : ""}</div>
            ${order.address_reference ? `<div>Ref: ${order.address_reference}</div>` : ""}
          </div>
        </div>
        ` : ""}

        <div class="section">
          <div class="section-title">Itens</div>
          ${order.items?.map(item => `
            <div class="item">
              <div class="item-name">${item.quantity}x ${item.product_name}</div>
              ${item.size_name ? `<div class="item-details">Tam: ${item.size_name}</div>` : ""}
              ${item.flavors && item.flavors.length > 0 ? `<div class="item-details">Sabores: ${item.flavors.join(", ")}</div>` : ""}
              ${item.addons && item.addons.length > 0 ? `<div class="item-details">Adicionais: ${item.addons.map(a => a.quantity > 1 ? `${a.quantity}x ${a.addon_name}` : a.addon_name).join(", ")}</div>` : ""}
              <div class="item-price">R$ ${item.item_total.toFixed(2)}</div>
            </div>
          `).join("") || ""}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.delivery_fee > 0 ? `
          <div class="total-row">
            <span>Taxa Entrega:</span>
            <span>R$ ${order.delivery_fee.toFixed(2)}</span>
          </div>
          ` : ""}
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>R$ ${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Pagamento</div>
          <div class="customer-info">${paymentLabels[order.payment_method] || order.payment_method}</div>
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div>WhatsApp: (77) 99406-6526</div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Aguardar o conteúdo carregar e imprimir
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }
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

  const paymentLabels: Record<string, string> = {
    money: "Dinheiro",
    pix: "PIX",
    card: "Cartão",
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Cupom Fiscal - Impressão</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 bg-muted/30 max-h-[70vh] overflow-auto">
          <div 
            ref={receiptRef}
            className="bg-white text-black p-4 mx-auto font-mono text-xs"
            style={{ width: "302px", minHeight: "453px" }}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-2">
              <div className="text-sm font-bold uppercase">{storeName}</div>
              <div className="text-[10px] mt-1">Açaí Fresco e Saboroso</div>
              <div className="text-[11px] mt-2">
                <div>Pedido #{order.id.slice(0, 8)}</div>
                <div>{formatDate(order.created_at)}</div>
              </div>
            </div>

            {/* Cliente */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="font-bold text-[11px] uppercase mb-1">Cliente</div>
              <div className="text-[11px]">
                <div>{order.customer_name}</div>
                <div>Tel: {order.customer_phone}</div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="border border-black text-center py-1 my-2 font-bold text-[11px] uppercase">
              {order.delivery_type === "delivery" ? "ENTREGA" : "RETIRADA"}
            </div>

            {/* Endereço (se delivery) */}
            {order.delivery_type === "delivery" && order.address_street && (
              <div className="border-b border-dashed border-black pb-2 mb-2">
                <div className="font-bold text-[11px] uppercase mb-1">Endereço</div>
                <div className="text-[11px]">
                  <div>{order.address_street}, {order.address_number}</div>
                  {order.address_complement && <div>{order.address_complement}</div>}
                  <div>{order.address_neighborhood}{order.address_city ? `, ${order.address_city}` : ""}</div>
                  {order.address_reference && <div className="text-[10px]">Ref: {order.address_reference}</div>}
                </div>
              </div>
            )}

            {/* Itens */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="font-bold text-[11px] uppercase mb-1">Itens</div>
              {order.items?.map((item, idx) => (
                <div key={idx} className="mb-2 text-[11px]">
                  <div className="font-bold">{item.quantity}x {item.product_name}</div>
                  {item.size_name && <div className="text-[10px] pl-2">Tam: {item.size_name}</div>}
                  {item.flavors && item.flavors.length > 0 && (
                    <div className="text-[10px] pl-2">Sabores: {item.flavors.join(", ")}</div>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-[10px] pl-2">
                      Adicionais: {item.addons.map(a => a.quantity > 1 ? `${a.quantity}x ${a.addon_name}` : a.addon_name).join(", ")}
                    </div>
                  )}
                  <div className="text-right">R$ {item.item_total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="mb-2">
              <div className="flex justify-between text-[11px]">
                <span>Subtotal:</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span>Taxa Entrega:</span>
                  <span>R$ {order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                <span>TOTAL:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pagamento */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="font-bold text-[11px] uppercase mb-1">Pagamento</div>
              <div className="text-[11px]">{paymentLabels[order.payment_method] || order.payment_method}</div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] border-t border-dashed border-black pt-2">
              <div>Obrigado pela preferência!</div>
              <div>WhatsApp: (77) 99406-6526</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Tamanho do cupom: 80mm x 120mm (impressora térmica)
          </p>
        </div>
      </div>
    </div>
  )
}
