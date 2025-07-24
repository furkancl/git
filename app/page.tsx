import { Header } from "@/components/header"
import { HomePage } from "@/components/home-page"

// In your src/app/page.tsx file:
export interface Caller { // <-- Add 'export' here
  id: string
  callerName: string
  contactMethod: "Telefon" | "E-posta" | "Web Sitesi" | "Tavsiye" | "Diğer"
  requestedPsychologist: string
  issueSummary: string
  sessionType: "Bireysel" | "Çift" | "Aile" | "Çocuk" | "Grup" | "Diğer"
  contactDate: string
}
// ... rest of the page.tsx content
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {" "}
      {/* Ekran yüksekliğini kapla ve dikey düzenle */}
      <Header /> {/* Başlık kendi yüksekliğini alacak */}
      <main className="flex-grow">
        {" "}
        {/* Kalan alanı doldur, kendi taşmasını gizle */}
        <HomePage />
      </main>
    </div>
  )
}
