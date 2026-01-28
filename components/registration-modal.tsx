"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface RegistrationModalProps {
  open: boolean
  onClose: () => void
}

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const { toast } = useToast()
  const setCustomer = useStore((state) => state.setCustomer)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : ""
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive",
      })
      return
    }

    // Validar telefone (mínimo 14 caracteres com máscara)
    if (formData.phone.length < 14) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número de telefone válido.",
        variant: "destructive",
      })
      return
    }

    setCustomer(formData)
    toast({
      title: "Cadastro realizado!",
      description: "Agora você pode fazer seus pedidos.",
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Bem-vindo ao Açaí Br!</DialogTitle>
          <DialogDescription>
            Para continuar, precisamos de algumas informações para seu pedido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(77) 98145-1883"
              maxLength={15}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Continuar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
