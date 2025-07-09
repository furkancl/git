import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppNavbar } from "@/components/app-navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Danışan Bilgi Sistemi",
  description: "Psikoloji danışmanlık yönetim sistemi",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <AppNavbar />
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  )
}
