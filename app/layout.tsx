import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Açaí BR - Açaí Fresco e Saboroso",
  description: "Peça seu açaí online com os melhores acompanhamentos e receba em casa",
  icons: {
    icon: "/acai-logo.png",
    apple: "/acai-logo.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
        <div id="radix-dialog-portal" />
      </body>
    </html>
  )
}
