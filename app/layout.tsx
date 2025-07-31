import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner' // <-- Bu satırı ekleyin

export const metadata: Metadata = {
  title: 'Danışan Bilgi Sistemi',
  description: 'Created with passion by Furkan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster /> {/* <-- Bu satırı ekleyin */}
      </body>
    </html>
  )
}