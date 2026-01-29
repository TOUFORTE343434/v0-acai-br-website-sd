import type { Customer, CartItem } from "./types"

const WHATSAPP_NUMBER = "5577994066526"

export function sendOrderToWhatsApp(
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
) {
  let message = `🟣 *NOVO PEDIDO - AÇAÍ BR* 🟢\n\n`
  message += `👤 *DADOS DO CLIENTE*\n`
  message += `Nome: ${customer.name}\n`
  message += `Telefone: ${customer.phone}\n`
  message += `Email: ${customer.email}\n`
  message += `CPF: ${customer.cpf}\n\n`

  message += `🍇 *ITENS DO PEDIDO*\n`
  items.forEach((item, index) => {
    message += `\n${index + 1}. *${item.product.name}*\n`
    message += `   Quantidade: ${item.quantity}\n`
    message += `   Preço unitário: R$ ${item.product.price.toFixed(2)}\n`
    if (item.size) {
      message += `   Tamanho: ${item.size}\n`
    }
    if (item.toppings && item.toppings.length > 0) {
      message += `   Acompanhamentos: ${item.toppings.join(", ")}\n`
    }
    message += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`
  })

  message += `\n💰 *VALOR TOTAL: R$ ${total.toFixed(2)}*\n\n`

  if (deliveryType === "delivery" && address) {
    message += `🏠 *TIPO: ENTREGA (+R$ 6,00)*\n`
    message += `Bairro: ${address.neighborhood}\n`
    message += `Rua: ${address.street}\n`
    message += `Número: ${address.number}\n`
    if (address.reference) {
      message += `Referência: ${address.reference}\n`
    }
  } else {
    message += `🏪 *TIPO: RETIRADA NA LOJA*\n`
  }

  if (paymentMethod) {
    message += `\n💳 *FORMA DE PAGAMENTO*\n`
    const paymentMethodLabels: { [key: string]: string } = {
      dinheiro: "💵 Dinheiro",
      cartao: "💳 Cartão na Entrega",
      pix: "📱 PIX",
    }
    message += paymentMethodLabels[paymentMethod] || paymentMethod
  }

  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  window.open(whatsappUrl, "_blank")
}
