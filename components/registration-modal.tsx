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
    email: "",
    cpf: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
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
            Para continuar, precisamos de algumas informações para seu primeiro pedido.
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(77) 98145-1883"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              placeholder="000.000.000-00"
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
