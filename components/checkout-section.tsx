"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"
import { MapPin, Navigation, Truck, Store, CreditCard, Banknote, QrCode, Loader2, CheckCircle2, Edit3 } from "lucide-react"
import type { Address } from "@/lib/types"

interface CheckoutSectionProps {
  onSubmitOrder: (deliveryType: "delivery" | "pickup", address?: Address, paymentMethod?: string) => void
}

const GOOGLE_MAPS_API_KEY = "AIzaSyB8-SLDxLeL6l-7XeKx5rlkAWC3eyArN3w"

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

  const DELIVERY_FEE = storeSettings?.delivery_fee || 6.00

  useEffect(() => {
    if (deliveryType === "delivery") {
      setDeliveryFee(DELIVERY_FEE)
    } else {
      setDeliveryFee(0)
    }
  }, [deliveryType, setDeliveryFee, DELIVERY_FEE])

  const getLocationFromGoogle = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      
      if (data.results && data.results[0]) {
        const result = data.results[0]
        setFullAddress(result.formatted_address)
        
        // Parse address components
        const components = result.address_components
        let street = ""
        let number = ""
        let neighborhood = ""
        let city = ""

        for (const comp of components) {
          if (comp.types.includes("route")) street = comp.long_name
          if (comp.types.includes("street_number")) number = comp.long_name
          if (comp.types.includes("sublocality") || comp.types.includes("sublocality_level_1")) 
            neighborhood = comp.long_name
          if (comp.types.includes("administrative_area_level_2") || comp.types.includes("locality")) 
            city = comp.long_name
        }

        setAddress({
          street: street,
          number: number,
          neighborhood: neighborhood,
          city: city,
          complement: "",
          reference: "",
          latitude: lat,
          longitude: lng
        })
        
        setLocationSuccess(true)
        setLocationError("")
      }
    } catch (error) {
      console.error("Error getting address from coords:", error)
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
        await getLocationFromGoogle(latitude, longitude)
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handleSubmit = () => {
    if (deliveryType === "delivery") {
      if (addressMode === "manual" && (!address.street || !address.number || !address.neighborhood)) {
        alert("Por favor, preencha o endereço de entrega")
        return
      }
      if (addressMode === "location" && !locationSuccess) {
        alert("Por favor, compartilhe sua localização ou preencha o endereço manualmente")
        return
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Localização obtida com sucesso!</p>
                        <p className="text-sm text-green-700 mt-1">{fullAddress}</p>
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
                )}

                {/* Optional: complement and reference for location mode */}
                {locationSuccess && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="complement-loc">Complemento (opcional)</Label>
                      <Input
                        id="complement-loc"
                        value={address.complement}
                        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                        placeholder="Apto, bloco, casa dos fundos..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference-loc">Ponto de Referência (opcional)</Label>
                      <Input
                        id="reference-loc"
                        value={address.reference}
                        onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                        placeholder="Próximo ao mercado, em frente à praça..."
                      />
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
