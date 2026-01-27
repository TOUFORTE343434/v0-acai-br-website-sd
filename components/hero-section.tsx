"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Image from "next/image"

interface HeroSectionProps {
  onViewMenu: () => void
}

export function HeroSection({ onViewMenu }: HeroSectionProps) {
  const openWhatsApp = () => {
    window.open("https://wa.me/5577981451883", "_blank")
  }

  return (
    <section className="relative h-[600px] lg:h-[700px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/acai-hero.jpg" alt="Açaí Bowl" fill className="object-cover brightness-75" priority />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <Image src="/acai-logo.png" alt="Açaí Br" width={200} height={200} className="mx-auto drop-shadow-2xl" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg text-balance">
          Açaí Fresco e Saboroso
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-md text-balance">
          Monte seu açaí perfeito com os melhores ingredientes e receba na sua casa
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onViewMenu}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-xl"
          >
            Ver Cardápio
          </Button>

          <Button
            onClick={openWhatsApp}
            size="lg"
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6 rounded-full shadow-xl"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Fale Conosco
          </Button>
        </div>
      </div>

      {/* Fixed WhatsApp Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 bg-secondary hover:bg-secondary/90 text-secondary-foreground p-4 rounded-full shadow-2xl transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </section>
  )
}
