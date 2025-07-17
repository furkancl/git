import { Header } from "@/components/header"
import { HomePage } from "@/components/home-page"

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
