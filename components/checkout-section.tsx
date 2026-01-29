"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"
import { MapPin, Navigation, Truck, Store, CreditCard, Banknote, QrCode, Loader2, CheckCircle2, Edit3, Copy, Check } from "lucide-react"
import type { Address } from "@/lib/types"

interface CheckoutSectionProps {
  onSubmitOrder: (deliveryType: "delivery" | "pickup", address?: Address, paymentMethod?: string) => void
}

// Usando OpenStreetMap Nominatim API (gratuita, sem necessidade de chave)

export function CheckoutSection({ onSubmitOrder }: CheckoutSectionProps) {
  const customer = useStore((state) => state.customer)
  const cart = useStore((state) => state.cart)
  const getCartSubtotal = useStore((state) => state.getCartSubtotal)
  const getCartTotal = useStore((state) => state.getCartTotal)
  const deliveryFee = useStore((state) => state.deliveryFee)
  const setDeliveryFee = useStore((state) => state.setDeliveryFee)
  const storeSettings = useStore((state) => state.storeSettings)

  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")
  const [paymentMethod, setPaymentMethod] = useState<string>("pix")
  const [addressMode, setAddressMode] = useState<"manual" | "location">("manual")
  const [address, setAddress] = useState<Address>({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    complement: "",
    reference: ""
  })
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [fullAddress, setFullAddress] = useState("")
  const [pixCopied, setPixCopied] = useState(false)

  const PIX_KEY = "05875802596"

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const DELIVERY_FEE = storeSettings?.delivery_fee || 6.00

  useEffect(() => {
    if (deliveryType === "delivery") {
      setDeliveryFee(DELIVERY_FEE)
    } else {
      setDeliveryFee(0)
    }
  }, [deliveryType, setDeliveryFee, DELIVERY_FEE])

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Usando Nominatim (OpenStreetMap) - API gratuita
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`,
        {
          headers: {
            'User-Agent': 'AcaiBR-App/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data && data.address) {
        const addr = data.address
        
        // Extrair componentes do endereço
        const street = addr.road || addr.pedestrian || addr.street || ""
        const neighborhood = addr.suburb || addr.neighbourhood || addr.district || addr.city_district || ""
        const city = addr.city || addr.town || addr.village || addr.municipality || ""
        
        const fullAddr = [street, neighborhood, city].filter(Boolean).join(", ")
        setFullAddress(fullAddr || data.display_name || "")

        setAddress({
          street: street,
          number: "",
          neighborhood: neighborhood,
          city: city,
          complement: "",
          reference: "",
          latitude: lat,
          longitude: lng
        })
        
        setLocationSuccess(true)
        setLocationError("")
      } else {
        throw new Error("Endereço não encontrado")
      }
    } catch (error) {
      console.error("Erro ao obter endereço:", error)
      setLocationError("Erro ao obter endereço. Tente novamente ou digite manualmente.")
      setLocationSuccess(false)
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada pelo navegador")
      return
    }

    setLoadingLocation(true)
    setLocationError("")
    setLocationSuccess(false)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await getAddressFromCoordinates(latitude, longitude)
        setLoadingLocation(false)
      },
      (error) => {
        setLoadingLocation(false)
        setLocationSuccess(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Localização indisponível. Verifique se o GPS está ativado.")
            break
          case error.TIMEOUT:
            setLocationError("Tempo esgotado ao obter localização. Tente novamente.")
            break
          default:
            setLocationError("Erro ao obter localização. Tente novamente.")
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000, 
        maximumAge: 0 
      }
    )
  }

  const handleSubmit = () => {
    if (deliveryType === "delivery") {
      if (addressMode === "manual" && (!address.street || !address.number || !address.neighborhood)) {
        alert("Por favor, preencha o endereço de entrega")
        return
      }
      if (addressMode === "location") {
        if (!locationSuccess) {
          alert("Por favor, compartilhe sua localização ou preencha o endereço manualmente")
          return
        }
        if (!address.number) {
          alert("Por favor, informe o número da casa")
          return
        }
        if (!address.reference) {
          alert("Por favor, informe um ponto de referência para facilitar a entrega")
          return
        }
      }
    }
    onSubmitOrder(deliveryType, deliveryType === "delivery" ? address : undefined, paymentMethod)
  }

  const subtotal = getCartSubtotal()
  const total = getCartTotal()

  return (
    <div id="checkout-section" className="container mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Finalizar Pedido</h2>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="pix" id="pix" />
              <QrCode className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">PIX</p>
                <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
              </div>
            </label>
            
            {/* PIX Key Info */}
            {paymentMethod === "pix" && (
              <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-center mb-3">
                  <p className="text-sm text-muted-foreground">Valor a pagar:</p>
                  <p className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
                </div>
                <div className="border-t border-primary/20 pt-3">
                  <p className="text-sm font-medium text-foreground mb-2">Chave PIX (CPF):</p>
                  <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
                    <code className="flex-1 text-lg font-mono font-semibold text-foreground">{PIX_KEY}</code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPix}
                      className={`${pixCopied ? "bg-green-100 border-green-500 text-green-700" : ""}`}
                    >
                      {pixCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Faça o PIX e envie o comprovante junto com o pedido
                  </p>
                </div>
              </div>
            )}
            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mt-3 ${paymentMethod === "money" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="money" id="money" />
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Dinheiro</p>
                <p className="text-sm text-muted-foreground">Pague na entrega/retirada</p>
              </div>
            </label>
            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mt-3 ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Cartão na Entrega</p>
                <p className="text-sm text-muted-foreground">Débito ou crédito</p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tipo de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as "pickup" | "delivery")}>
            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryType === "pickup" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="pickup" id="pickup" />
              <Store className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Retirada no Local</p>
                <p className="text-sm text-muted-foreground">Retire seu pedido na loja</p>
              </div>
              <span className="text-sm font-medium text-green-600">Grátis</span>
            </label>
            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mt-3 ${deliveryType === "delivery" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="delivery" id="delivery" />
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Entrega</p>
                <p className="text-sm text-muted-foreground">Receba em casa</p>
              </div>
              <span className="text-sm font-medium text-primary">+R$ {DELIVERY_FEE.toFixed(2)}</span>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Address */}
      {deliveryType === "delivery" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address Mode Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={addressMode === "manual" ? "default" : "outline"}
                onClick={() => {
                  setAddressMode("manual")
                  setLocationSuccess(false)
                }}
                className={addressMode === "manual" ? "" : "bg-transparent"}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Preencher Endereço
              </Button>
              <Button
                type="button"
                variant={addressMode === "location" ? "default" : "outline"}
                onClick={() => setAddressMode("location")}
                className={addressMode === "location" ? "" : "bg-transparent"}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Compartilhar Local
              </Button>
            </div>

            {/* Location Mode */}
            {addressMode === "location" && (
              <div className="space-y-4">
                {!locationSuccess ? (
                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <Navigation className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Clique no botão abaixo para compartilhar sua localização atual
                    </p>
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={loadingLocation}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loadingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Obtendo localização...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Compartilhar Minha Localização
                        </>
                      )}
                    </Button>
                    {locationError && (
                      <p className="text-sm text-destructive mt-3">{locationError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Address found from location */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">Endereço encontrado!</p>
                          <p className="text-sm text-green-700 mt-1">
                            {address.street && <span className="font-medium">{address.street}</span>}
                            {address.neighborhood && <span>, {address.neighborhood}</span>}
                            {address.city && <span> - {address.city}</span>}
                          </p>
                          {address.latitude && address.longitude && (
                            <a 
                              href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 underline mt-2 inline-block"
                            >
                              Ver no Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                        disabled={loadingLocation}
                        className="mt-3 bg-transparent"
                      >
                        {loadingLocation ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Navigation className="h-4 w-4 mr-2" />
                        )}
                        Atualizar Localização
                      </Button>
                    </div>

                    {/* Required fields: house number and reference */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-800 mb-3">
                        Complete as informações abaixo para entrega:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="number-loc" className="text-amber-900">Número da Casa *</Label>
                          <Input
                            id="number-loc"
                            value={address.number}
                            onChange={(e) => setAddress({ ...address, number: e.target.value })}
                            placeholder="Ex: 123, S/N"
                            className="bg-white border-amber-300 focus:border-amber-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="reference-loc" className="text-amber-900">Ponto de Referência *</Label>
                          <Input
                            id="reference-loc"
                            value={address.reference}
                            onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                            placeholder="Ex: Próximo ao mercado, casa azul, em frente à praça..."
                            className="bg-white border-amber-300 focus:border-amber-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement-loc" className="text-amber-900">Complemento (opcional)</Label>
                          <Input
                            id="complement-loc"
                            value={address.complement}
                            onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                            placeholder="Ex: Apto 201, Bloco B, Casa dos fundos..."
                            className="bg-white border-amber-300 focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Mode */}
            {addressMode === "manual" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      placeholder="Nº"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    placeholder="Apto, bloco, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Ponto de Referência</Label>
                  <Input
                    id="reference"
                    value={address.reference}
                    onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                    placeholder="Próximo a..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.product.name}
                  {item.size && <span className="text-muted-foreground"> ({item.size.name})</span>}
                </span>
                <span>R$ {(item.itemTotal * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Entrega</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={cart.length === 0}>
            Finalizar Pedido
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
